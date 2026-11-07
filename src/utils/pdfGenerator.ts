import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface GenerateExportOptions {
  element: HTMLElement;
  quotationId: string;
  customerName?: string;
  onProgress?: (status: string) => void;
}

export async function generateAndDownloadPdf({
  element,
  quotationId,
  customerName = 'Customer',
  onProgress
}: GenerateExportOptions): Promise<boolean> {
  try {
    if (onProgress) onProgress('Preparing document...');

    const originalScrollPos = window.scrollY;

    if (onProgress) onProgress('Rendering high-resolution A4 canvas...');

    const canvas = await html2canvas(element, {
      scale: 2, // 2x DPI for ultra-sharp typography and vector-like gold elements
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(element.id);
        if (clonedEl) {
          clonedEl.style.transform = 'none';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.borderRadius = '0px';
          clonedEl.style.margin = '0 auto';
        }
      }
    });

    window.scrollTo(0, originalScrollPos);

    if (onProgress) onProgress('Building A4 PDF file...');

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

    const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `SR_Photography_Quotation_${quotationId}_${sanitizedName}.pdf`;

    if (onProgress) onProgress('Downloading PDF...');
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}

export async function generateAndDownloadJpg({
  element,
  quotationId,
  customerName = 'Customer',
  onProgress
}: GenerateExportOptions): Promise<boolean> {
  try {
    if (onProgress) onProgress('Preparing document...');

    const originalScrollPos = window.scrollY;

    if (onProgress) onProgress('Rendering high-resolution A4 image...');

    const canvas = await html2canvas(element, {
      scale: 2.2, // 2.2x DPI for crystal-crisp JPG export (great for mobile/WhatsApp)
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(element.id);
        if (clonedEl) {
          clonedEl.style.transform = 'none';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.borderRadius = '0px';
          clonedEl.style.margin = '0 auto';
        }
      }
    });

    window.scrollTo(0, originalScrollPos);

    if (onProgress) onProgress('Generating JPG file...');

    const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.96);

    const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `SR_Photography_Quotation_${quotationId}_${sanitizedName}.jpg`;

    const downloadLink = document.createElement('a');
    downloadLink.href = jpgDataUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    return true;
  } catch (error) {
    console.error('Failed to generate JPG image:', error);
    throw error;
  }
}
