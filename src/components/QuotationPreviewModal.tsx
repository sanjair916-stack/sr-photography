import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  MessageSquare, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Image as ImageIcon, 
  FileText,
  CheckCircle,
  Copy,
  AlertCircle
} from 'lucide-react';
import { Quotation, StudioProfile } from '../types';
import { QuotationSheetA4 } from './QuotationSheetA4';
import { generateAndDownloadPdf, generateAndDownloadJpg } from '../utils/pdfGenerator';
import { generateWhatsAppMessage, getWhatsAppUrl } from '../utils/formatters';

interface QuotationPreviewModalProps {
  quotation: Quotation | null;
  studioProfile: StudioProfile;
  isOpen: boolean;
  onClose: () => void;
  initialExportAction?: 'jpg' | 'pdf' | null;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  quotation,
  studioProfile,
  isOpen,
  onClose,
  initialExportAction = null
}) => {
  const [scale, setScale] = useState(0.85);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'jpg' | null>(null);
  const [exportStatus, setExportStatus] = useState('');
  const [exportedJpg, setExportedJpg] = useState<{
    dataUrl: string;
    serverUrl?: string;
    filename: string;
  } | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Auto-trigger JPG generation if modal was opened via "Download JPG"
  useEffect(() => {
    if (isOpen && quotation && initialExportAction === 'jpg') {
      const timer = setTimeout(() => {
        handleDownloadJpg();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, quotation?.id, initialExportAction]);

  if (!isOpen || !quotation) return null;

  // Browser Print - Direct Save as PDF
  const handleBrowserPrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error(err);
      setModalError('Could not open browser print dialog.');
    }
  };

  // Canvas PDF Generator
  const handleDownloadPdf = async () => {
    setModalError(null);
    const el = document.getElementById('preview-a4-sheet') || 
               document.querySelector('[data-quotation-sheet="true"]') as HTMLElement | null;
    if (!el) {
      setModalError('Quotation sheet element could not be found.');
      return;
    }

    const container = printContainerRef.current;
    const prevTransform = container?.style.transform;
    const prevTransition = container?.style.transition;
    if (container) {
      container.style.transform = 'none';
      container.style.transition = 'none';
    }

    try {
      setIsExporting(true);
      setExportType('pdf');
      await new Promise((r) => requestAnimationFrame(r));

      await generateAndDownloadPdf({
        element: el,
        quotationId: quotation.id,
        customerName: quotation.customer.name,
        onProgress: (status) => setExportStatus(status)
      });
    } catch (err: any) {
      console.error(err);
      setModalError(`PDF export encountered an issue: ${err?.message || 'Rendering error'}. Please use the "Save as PDF (Print)" button to print/save directly.`);
    } finally {
      if (container) {
        container.style.transform = prevTransform || '';
        container.style.transition = prevTransition || '';
      }
      setIsExporting(false);
      setExportType(null);
      setExportStatus('');
    }
  };

  // Canvas JPG Generator with Multi-Fallback Download & On-Screen Modal
  const handleDownloadJpg = async () => {
    setModalError(null);
    const el = document.getElementById('preview-a4-sheet') || 
               document.querySelector('[data-quotation-sheet="true"]') as HTMLElement | null;
    if (!el) {
      setModalError('Quotation sheet element could not be found.');
      return;
    }

    const container = printContainerRef.current;
    const prevTransform = container?.style.transform;
    const prevTransition = container?.style.transition;
    if (container) {
      container.style.transform = 'none';
      container.style.transition = 'none';
    }

    try {
      setIsExporting(true);
      setExportType('jpg');
      setExportStatus('Rendering high-res JPG...');
      await new Promise((r) => requestAnimationFrame(r));
      
      const result = await generateAndDownloadJpg({
        element: el,
        quotationId: quotation.id,
        customerName: quotation.customer.name,
        onProgress: (status) => setExportStatus(status)
      });

      if (result && result.dataUrl) {
        setExportedJpg({
          dataUrl: result.dataUrl,
          serverUrl: result.serverUrl,
          filename: result.filename
        });
      }
    } catch (err: any) {
      console.error(err);
      setModalError(`JPG generation encountered an issue: ${err?.message || 'Canvas rendering error'}. You can use the "Save as PDF (Print)" option above.`);
    } finally {
      if (container) {
        container.style.transform = prevTransform || '';
        container.style.transition = prevTransition || '';
      }
      setIsExporting(false);
      setExportType(null);
      setExportStatus('');
    }
  };

  // Copy Image to clipboard with PNG transcoding (required by Chrome & Firefox)
  const handleCopyImageToClipboard = async () => {
    if (!exportedJpg?.dataUrl) return;
    try {
      const img = new Image();
      if (!exportedJpg.dataUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width;
        c.height = img.naturalHeight || img.height;
        const ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        c.toBlob(async (pngBlob) => {
          if (!pngBlob) {
            setModalError('Could not process image for clipboard.');
            return;
          }
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': pngBlob })
            ]);
            setCopiedToClipboard(true);
            setTimeout(() => setCopiedToClipboard(false), 3000);
          } catch (clipErr) {
            console.warn('Clipboard write permission blocked:', clipErr);
            setModalError('Clipboard permission blocked. Please right-click or long-press the image to save.');
          }
        }, 'image/png');
      };
      img.onerror = () => {
        setModalError('Could not load image to copy.');
      };
      img.src = exportedJpg.dataUrl;
    } catch (err) {
      console.error(err);
      setModalError('Could not copy image to clipboard.');
    }
  };

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(quotation, studioProfile);
    const targetPhone = quotation.customer.whatsapp || quotation.customer.mobile;
    if (!targetPhone) {
      setModalError('Customer has no phone number saved.');
      return;
    }
    const url = getWhatsAppUrl(targetPhone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto modal-print-container">
      <div className="relative bg-stone-900 border border-stone-700/80 rounded-2xl w-full max-w-5xl h-[94vh] flex flex-col shadow-2xl modal-print-content">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900 border-b border-stone-800 text-white shrink-0 no-print">
          <div className="flex items-center gap-3">
            <span className="font-brand font-bold text-amber-400 text-sm tracking-wider">
              A4 QUOTATION PREVIEW
            </span>
            <span className="font-mono text-xs text-stone-400">
              #{quotation.id} · {quotation.customer.name || 'Draft Quotation'}
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-800/90 rounded-lg p-1 border border-stone-700/50 mr-2">
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                title="Zoom Out"
                className="p-1 hover:bg-stone-700 text-stone-300 rounded cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-stone-300 px-1.5">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(Math.min(1.3, scale + 0.1))}
                title="Zoom In"
                className="p-1 hover:bg-stone-700 text-stone-300 rounded cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setScale(0.85)}
                title="Reset Zoom"
                className="p-1 hover:bg-stone-700 text-stone-400 hover:text-stone-200 rounded cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Primary Action: Direct Browser Print / Save as PDF */}
            <button
              onClick={handleBrowserPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer active:scale-95"
              title="Open browser print dialog to save as authentic PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save as PDF (Print)</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsApp}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Download JPG Button */}
            <button
              onClick={handleDownloadJpg}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              title="Generate and download A4 JPG image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>
                {isExporting && exportType === 'jpg' ? exportStatus || 'Exporting JPG...' : 'Download JPG'}
              </span>
            </button>

            {/* Canvas PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg border border-stone-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Export A4 PDF file directly"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isExporting && exportType === 'pdf' ? exportStatus || 'Exporting PDF...' : 'File PDF'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer ml-1"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inline Feedback Banner */}
        {modalError && (
          <div className="px-5 py-2.5 bg-red-950/80 border-b border-red-800/80 text-red-200 text-xs font-medium flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{modalError}</span>
            </div>
            <button
              onClick={() => setModalError(null)}
              className="text-red-400 hover:text-white text-xs underline cursor-pointer ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Document Container - FULL VERTICAL VIEW */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-stone-950/60 print:bg-white print:p-0">
          <div
            ref={printContainerRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="shadow-2xl shadow-black/80 rounded-sm sheet-print-wrapper mb-20"
          >
            <QuotationSheetA4
              id="preview-a4-sheet"
              quotation={quotation}
              studioProfile={studioProfile}
            />
          </div>
        </div>

        {/* Bottom Information Bar */}
        <div className="px-5 py-2.5 bg-stone-900/90 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between no-print shrink-0">
          <div>
            Showing complete A4 portrait quotation sheet. Scroll to view services, terms, and authorized signatory.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadJpg}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
            >
              Click here to Download JPG
            </button>
            <span className="text-stone-600">|</span>
            <button
              onClick={handleBrowserPrint}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
            >
              Save as PDF (Print)
            </button>
          </div>
        </div>
      </div>

      {/* High-Resolution JPG Ready Modal Dialog */}
      {exportedJpg && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 no-print overflow-y-auto">
          <div className="bg-stone-900 border border-amber-500/60 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-stone-100 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-brand font-bold text-white text-base">Quotation JPG Generated</h3>
              </div>
              <button
                onClick={() => setExportedJpg(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Your high-resolution A4 JPG quotation is ready. You can download the image file, copy it to clipboard, or save directly:
            </p>

            {/* Thumbnail / Image Preview Container */}
            <div className="max-h-72 overflow-y-auto border border-stone-800 rounded-xl p-3 bg-stone-950 flex flex-col items-center gap-2">
              <img
                src={exportedJpg.dataUrl}
                alt="SR Photography Quotation JPG"
                className="w-full max-w-xs h-auto shadow-lg border border-stone-700/80 rounded-md select-all cursor-pointer"
                title="Right-click or tap-and-hold to save image"
              />
              <span className="text-[10px] text-amber-400/90 font-medium text-center">
                👉 Right-click image above and choose "Save Image As..." (or tap & hold on phone)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Primary Direct Download */}
              <a
                href={exportedJpg.serverUrl || exportedJpg.dataUrl}
                download={exportedJpg.filename}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = exportedJpg.dataUrl;
                  a.download = exportedJpg.filename;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => {
                    if (document.body.contains(a)) document.body.removeChild(a);
                  }, 1000);
                }}
                className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer text-center"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download JPG File</span>
              </a>

              {/* Copy Image Button */}
              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                className="py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 border border-stone-700 cursor-pointer transition-colors"
              >
                <Copy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{copiedToClipboard ? 'Copied to Clipboard! ✓' : 'Copy Image'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-[11px] text-stone-400">
              <span>Need authentic PDF?</span>
              <button
                onClick={() => {
                  setExportedJpg(null);
                  handleBrowserPrint();
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
              >
                Save as PDF (Print)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
