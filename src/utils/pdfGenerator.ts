import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface GenerateExportOptions {
  element: HTMLElement;
  quotationId: string;
  customerName?: string;
  onProgress?: (status: string) => void;
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
 * Works seamlessly in modern browsers and iframe sandboxes.
 */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.style.display = 'none';
  downloadLink.href = blobUrl;
  downloadLink.download = filename;
  
  // Appending to body is required by Firefox and certain Chrome versions
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  setTimeout(() => {
    if (document.body.contains(downloadLink)) {
      document.body.removeChild(downloadLink);
    }
    URL.revokeObjectURL(blobUrl);
  }, 30000);
}

/**
 * High-fidelity A4 canvas renderer using html2canvas with transform normalization.
 */
async function renderA4Canvas(
  element: HTMLElement,
  scale: number = 2,
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

  if (onProgress) onProgress('Rendering high-resolution A4 document...');

  const originalScrollPos = window.scrollY;

  // Render canvas with zero taint and normalized clones
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false, // Prevents canvas tainting so toDataURL & toBlob always succeed!
    backgroundColor: '#ffffff',
    logging: false,
    width: 794,
    height: 1123,
    windowWidth: 794,
    windowHeight: 1123,
    onclone: (clonedDoc) => {
      const clonedTarget = clonedDoc.getElementById(element.id);
      if (!clonedTarget) return;

      // 1. Walk up ancestor tree and remove any CSS transforms or overflow clipping
      let parent: HTMLElement | null = clonedTarget.parentElement;
      while (parent && parent !== clonedDoc.body) {
        parent.style.transform = 'none';
        parent.style.webkitTransform = 'none';
        parent.style.overflow = 'visible';
        parent.style.margin = '0';
        parent.style.padding = '0';
        parent.style.position = 'static';
        parent = parent.parentElement;
      }

      // 2. Normalize clonedTarget to clean standard A4 dimensions
      clonedTarget.style.position = 'relative';
      clonedTarget.style.left = '0px';
      clonedTarget.style.top = '0px';
      clonedTarget.style.transform = 'none';
      clonedTarget.style.webkitTransform = 'none';
      clonedTarget.style.boxShadow = 'none';
      clonedTarget.style.margin = '0 auto';
      clonedTarget.style.visibility = 'visible';
      clonedTarget.style.opacity = '1';

      // 3. Normalize cloned document body
      clonedDoc.body.style.backgroundColor = '#ffffff';
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';
      clonedDoc.body.style.overflow = 'visible';
    }
  });

  window.scrollTo(0, originalScrollPos);
  return canvas;
}

/**
 * Generates and downloads a professional A4 portrait PDF for the quotation.
 */
export async function generateAndDownloadPdf({
  element,
  quotationId,
  customerName = 'Customer',
  onProgress
}: GenerateExportOptions): Promise<boolean> {
  try {
    const canvas = await renderA4Canvas(element, 2, onProgress);

    if (onProgress) onProgress('Compiling PDF file...');

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

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
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}

/**
 * Generates and downloads a crystal-clear high-DPI A4 JPG image.
 */
export async function generateAndDownloadJpg({
  element,
  quotationId,
  customerName = 'Customer',
  onProgress
}: GenerateExportOptions): Promise<boolean> {
  try {
    const canvas = await renderA4Canvas(element, 2.2, onProgress);

    if (onProgress) onProgress('Packaging JPG image...');

    const sanitizedName = customerName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
    const filename = `SR_Photography_Quotation_${quotationId}_${sanitizedName}.jpg`;

    // Convert canvas to Blob safely
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas could not be converted to image blob.'));
        },
        'image/jpeg',
        0.98
      );
    });

    if (onProgress) onProgress('Initiating JPG download...');
    triggerBlobDownload(blob, filename);

    if (onProgress) onProgress('Download ready!');
    return true;
  } catch (error) {
    console.error('Failed to generate JPG image:', error);
    throw error;
  }
}
