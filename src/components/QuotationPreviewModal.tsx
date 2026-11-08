import React, { useRef, useState } from 'react';
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
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  quotation,
  studioProfile,
  isOpen,
  onClose
}) => {
  const [scale, setScale] = useState(0.85);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'jpg' | null>(null);
  const [exportStatus, setExportStatus] = useState('');
  const [exportedJpgUrl, setExportedJpgUrl] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

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
    const el = document.getElementById('preview-a4-sheet');
    if (!el) {
      setModalError('Quotation sheet element could not be found.');
      return;
    }

    try {
      setIsExporting(true);
      setExportType('pdf');
      await generateAndDownloadPdf({
        element: el,
        quotationId: quotation.id,
        customerName: quotation.customer.name,
        onProgress: (status) => setExportStatus(status)
      });
    } catch (err) {
      console.error(err);
      setModalError('Automatic PDF download blocked. Please use the "Save as PDF (Print)" button to print/save directly.');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setExportStatus('');
    }
  };

  // Canvas JPG Generator with On-Screen Modal Preview Fallback
  const handleDownloadJpg = async () => {
    setModalError(null);
    const el = document.getElementById('preview-a4-sheet');
    if (!el) {
      setModalError('Quotation sheet element could not be found.');
      return;
    }

    try {
      setIsExporting(true);
      setExportType('jpg');
      
      // Generate blob & download
      await generateAndDownloadJpg({
        element: el,
        quotationId: quotation.id,
        customerName: quotation.customer.name,
        onProgress: (status) => setExportStatus(status)
      });

      // Also grab data URL to display on screen so user can right-click/copy directly!
      const canvasEl = document.querySelector('canvas');
      if (canvasEl) {
        setExportedJpgUrl(canvasEl.toDataURL('image/jpeg', 0.95));
      }
    } catch (err) {
      console.error(err);
      setModalError('JPG generation encountered an issue. You can use the "Save as PDF (Print)" option above.');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setExportStatus('');
    }
  };

  // Copy JPG image to clipboard
  const handleCopyImageToClipboard = async () => {
    if (!exportedJpgUrl) return;
    try {
      const res = await fetch(exportedJpgUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 3000);
    } catch (err) {
      console.error(err);
      setModalError('Could not copy to clipboard. Please right-click the image to save.');
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg border border-stone-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Generate and download A4 JPG image"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">
                {isExporting && exportType === 'jpg' ? exportStatus || 'Exporting JPG...' : 'Download JPG'}
              </span>
              <span className="md:hidden">JPG</span>
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
              onClick={handleBrowserPrint}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
            >
              Click here to Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* On-Screen JPG Export Modal Dialog */}
      {exportedJpgUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 no-print">
          <div className="bg-stone-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-brand font-bold text-white text-base">Quotation JPG Ready</h3>
              </div>
              <button
                onClick={() => setExportedJpgUrl(null)}
                className="text-stone-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Your high-resolution A4 JPG quotation has been prepared. If the automatic download did not initiate, you can download or copy it below:
            </p>

            {/* Thumbnail Preview */}
            <div className="max-h-64 overflow-y-auto border border-stone-800 rounded-lg p-2 bg-stone-950 flex justify-center">
              <img
                src={exportedJpgUrl}
                alt="Quotation Preview"
                className="w-48 h-auto shadow-md border border-stone-700 rounded select-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={exportedJpgUrl}
                download={`SR_Photography_Quotation_${quotation.id}.jpg`}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download JPG File</span>
              </a>

              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 border border-stone-700 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-amber-400" />
                <span>{copiedToClipboard ? 'Copied to Clipboard!' : 'Copy Image'}</span>
              </button>
            </div>

            <div className="text-[10px] text-stone-400 text-center">
              Tip: You can also right-click or tap and hold the preview image above to save it directly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
