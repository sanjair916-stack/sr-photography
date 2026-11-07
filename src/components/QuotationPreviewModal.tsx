import React, { useRef, useState } from 'react';
import { X, Download, MessageSquare, Printer, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, FileText } from 'lucide-react';
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
  const [scale, setScale] = useState(0.85); // Fit well on desktop viewports
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'jpg' | null>(null);
  const [exportStatus, setExportStatus] = useState('');
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !quotation) return null;

  const handleDownloadPdf = async () => {
    const el = document.getElementById('preview-a4-sheet');
    if (!el) {
      alert('Could not find quotation sheet element for PDF export.');
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
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setExportStatus('');
    }
  };

  const handleDownloadJpg = async () => {
    const el = document.getElementById('preview-a4-sheet');
    if (!el) {
      alert('Could not find quotation sheet element for JPG export.');
      return;
    }

    try {
      setIsExporting(true);
      setExportType('jpg');
      await generateAndDownloadJpg({
        element: el,
        quotationId: quotation.id,
        customerName: quotation.customer.name,
        onProgress: (status) => setExportStatus(status)
      });
    } catch (err) {
      console.error(err);
      alert('Failed to generate JPG image. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setExportStatus('');
    }
  };

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(quotation, studioProfile);
    const targetPhone = quotation.customer.whatsapp || quotation.customer.mobile;
    const url = getWhatsAppUrl(targetPhone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-stone-900 border border-stone-700/80 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900 border-b border-stone-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-brand font-bold text-amber-400 text-sm tracking-wider">
              A4 QUOTATION PREVIEW
            </span>
            <span className="font-mono text-xs text-stone-400">
              #{quotation.id} · {quotation.customer.name}
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

            <button
              onClick={handleBrowserPrint}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Download JPG Button */}
            <button
              onClick={handleDownloadJpg}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="Download High-Resolution A4 JPG Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isExporting && exportType === 'jpg' ? exportStatus || 'Exporting JPG...' : 'Download JPG'}</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-amber-300 text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="Download A4 PDF Document"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExporting && exportType === 'pdf' ? exportStatus || 'Exporting PDF...' : 'Download PDF'}</span>
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

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-stone-950/60">
          <div
            ref={printContainerRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="shadow-2xl shadow-black/80 rounded-sm overflow-hidden"
          >
            <QuotationSheetA4
              id="preview-a4-sheet"
              quotation={quotation}
              studioProfile={studioProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
