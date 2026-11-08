import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface GenerateExportOptions {
  element: HTMLElement;
  quotationId: string;
  customerName?: string;
  onProgress?: (status: string) => void;
}

export interface GenerateJpgResult {
  success: boolean;
  dataUrl: string;
  blob: Blob;
  filename: string;
  serverUrl?: string;
}

export interface GeneratePdfResult {
  success: boolean;
  blob: Blob;
  filename: string;
}

/**
 * Preloads and inlines all images in the element as base64 Data URLs.
 * This completely eliminates CORS issues, canvas tainting, and network latency in html2canvas.
 */
async function inlineImagesAsDataUrls(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      try {
        if (!img.src || img.src.startsWith('data:')) return;
        
        // Fetch image as blob
        const res = await fetch(img.src);
        if (!res.ok) return;
        const blob = await res.blob();
        
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result && typeof reader.result === 'string') {
              img.src = reader.result;
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('Could not inline image src to base64:', img.src, err);
      }
    })
  );
}

/**
 * Triggers a browser file download using standard Blob Object URL.
 * Works across modern desktop and mobile browsers.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  try {
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    downloadLink.target = '_blank';
    downloadLink.rel = 'noopener';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    setTimeout(() => {
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    }, 30000);
  } catch (err) {
    console.warn('Direct blob download error:', err);
  }
}

/**
 * High-fidelity A4 canvas renderer using html2canvas with transform normalization.
 * Fully compatible with desktop and mobile browsers (iOS/Android Chrome).
 */
async function renderA4Canvas(
  element: HTMLElement,
  preferredScale: number = 1.8,
  onProgress?: (status: string) => void
): Promise<HTMLCanvasElement> {
  if (onProgress) onProgress('Preparing fonts and assets...');

  // Ensure custom brand fonts (Cinzel, Plus Jakarta Sans) are ready
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if fonts API fails
    }
  }

  if (onProgress) onProgress('Inlining high-res graphics...');
  await inlineImagesAsDataUrls(element);

  if (onProgress) onProgress('Rendering document canvas...');

  const actualHeight = Math.max(1123, element.scrollHeight || element.offsetHeight || 1123);
  const actualWidth = 794;
  const targetId = element.id || 'preview-a4-sheet';

  const runCapture = async (scale: number): Promise<HTMLCanvasElement> => {
    return await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: actualWidth,
      height: actualHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      onclone: (clonedDoc) => {
        try {
          const clonedTarget = 
            clonedDoc.getElementById(targetId) || 
            (clonedDoc.querySelector('[data-quotation-sheet="true"]') as HTMLElement | null);
          if (!clonedTarget) return;

          // 1. Walk up ancestor tree and reset transforms / overflow
          let parent = clonedTarget.parentElement;
          while (parent && parent !== clonedDoc.body && parent !== clonedDoc.documentElement) {
            if (parent.style) {
              parent.style.transform = 'none';
              parent.style.webkitTransform = 'none';
              parent.style.overflow = 'visible';
              parent.style.margin = '0';
              parent.style.padding = '0';
              parent.style.position = 'static';
            }
            parent = parent.parentElement;
          }

          // 2. Normalize clonedTarget dimensions
          clonedTarget.style.position = 'relative';
          clonedTarget.style.left = '0px';
          clonedTarget.style.top = '0px';
          clonedTarget.style.transform = 'none';
          clonedTarget.style.webkitTransform = 'none';
          clonedTarget.style.boxShadow = 'none';
          clonedTarget.style.margin = '0 auto';
          clonedTarget.style.visibility = 'visible';
          clonedTarget.style.opacity = '1';
          clonedTarget.style.width = '794px';
          clonedTarget.style.minHeight = '1123px';
          clonedTarget.style.height = `${actualHeight}px`;

          // 3. Remove crossorigin attribute from any data: URI images in cloned tree
          const allImgs = Array.from(clonedDoc.querySelectorAll('img'));
          allImgs.forEach((img) => {
            if (img.src && img.src.startsWith('data:')) {
              img.removeAttribute('crossorigin');
            }
          });

          // 4. Clean body
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = '#ffffff';
            clonedDoc.body.style.margin = '0';
            clonedDoc.body.style.padding = '0';
            clonedDoc.body.style.overflow = 'visible';
          }
        } catch (cloneErr) {
          console.warn('onclone normalization notice:', cloneErr);
        }
      }
    });
  };

  try {
    return await runCapture(preferredScale);
  } catch (initialErr) {
    console.warn(`Capture at scale ${preferredScale} failed, retrying at scale 1.4:`, initialErr);
    // Mobile Chrome memory / GPU limit fallback
    return await runCapture(1.4);
  }
}

/**
 * Generates and downloads a professional A4 portrait PDF for the quotation.
 */
export async function generateAndDownloadPdf({
  element,
  quotationId,
  customerName = 'Customer',
  onProgress
}: GenerateExportOptions): Promise<GeneratePdfResult> {
  try {
    const canvas = await renderA4Canvas(element, 1.8, onProgress);

    if (onProgress) onProgress('Compiling PDF file...');

    let imgData: string;
    try {
      imgData = canvas.toDataURL('image/jpeg', 0.95);
    } catch {
      imgData = canvas.toDataURL('image/png');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let renderWidth = pdfWidth;
    let renderHeight = renderWidth / ratio;

    if (renderHeight > pdfHeight) {
      renderHeight = pdfHeight;
      renderWidth = renderHeight * ratio;
    }

    const xOffset = (pdfWidth - renderWidth) / 2;
    const yOffset = (pdfHeight - renderHeight) / 2;

    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');

    const sanitizedName = customerName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
    const filename = `SR_Photography_Quotation_${quotationId}_${sanitizedName}.pdf`;

    if (onProgress) onProgress('Initiating PDF download...');
    
    // Use Blob URL download for maximum browser & iframe compatibility
    const pdfBlob = pdf.output('blob');
    triggerBlobDownload(pdfBlob, filename);

    if (onProgress) onProgress('Download ready!');
    return { success: true, blob: pdfBlob, filename };
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}

/**
 * Generates and downloads a crystal-clear high-DPI A4 JPG image.
 * Saves to server static storage as well to ensure infallible downloads even with iframe sandbox restrictions.
 */
export async function generateAndDownloadJpg({
  element,
  quotationId,
  customerName = 'Customer',
  onProgress
}: GenerateExportOptions): Promise<GenerateJpgResult> {
  try {
    const canvas = await renderA4Canvas(element, 1.8, onProgress);

    if (onProgress) onProgress('Packaging JPG image...');

    const sanitizedName = customerName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
    const filename = `SR_Photography_Quotation_${quotationId}_${sanitizedName}.jpg`;

    // Extract high quality data URL (JPEG with fallback to PNG)
    let dataUrl: string;
    try {
      dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    } catch {
      dataUrl = canvas.toDataURL('image/png');
    }

    // Convert canvas to Blob safely with base64 decoding fallback
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) {
            resolve(b);
          } else {
            try {
              const byteString = atob(dataUrl.split(',')[1]);
              const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              resolve(new Blob([ab], { type: mimeString }));
            } catch (convErr) {
              reject(new Error('Canvas could not be converted to image blob.'));
            }
          }
        },
        'image/jpeg',
        0.92
      );
    });

    if (onProgress) onProgress('Initiating JPG download...');
    triggerBlobDownload(blob, filename);

    // Also persist to server downloads folder for direct static HTTP links
    let serverUrl: string | undefined;
    try {
      const response = await fetch('/api/save-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename })
      });
      if (response.ok) {
        const json = await response.json();
        serverUrl = json.url;
      }
    } catch (e) {
      console.warn('Could not persist to server downloads:', e);
    }

    if (onProgress) onProgress('JPG Ready!');
    return { success: true, dataUrl, blob, filename, serverUrl };
  } catch (error) {
    console.error('Failed to generate JPG image:', error);
    throw error;
  }
}
