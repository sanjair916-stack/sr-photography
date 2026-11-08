import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  MessageSquare, 
  Edit3, 
  Copy, 
  Trash2, 
  Plus, 
  Calendar, 
  AlertTriangle,
  ChevronDown,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { Quotation, StudioProfile, BookingStatus, PaymentStatus } from '../types';
import { formatRupees, formatDate, generateWhatsAppMessage, getWhatsAppUrl } from '../utils/formatters';

interface QuotationHistoryViewProps {
  quotations: Quotation[];
  studioProfile: StudioProfile;
  onPreviewQuotation: (q: Quotation) => void;
  onDownloadPdf: (q: Quotation) => void;
  onDownloadJpg: (q: Quotation) => void;
  onEditQuotation: (q: Quotation) => void;
  onDuplicateQuotation: (id: string) => Promise<void>;
  onDeleteQuotation: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: BookingStatus, paymentStatus: PaymentStatus) => Promise<void>;
  onCreateNew: () => void;
}

export const QuotationHistoryView: React.FC<QuotationHistoryViewProps> = ({
  quotations,
  studioProfile,
  onPreviewQuotation,
  onDownloadPdf,
  onDownloadJpg,
  onEditQuotation,
  onDuplicateQuotation,
  onDeleteQuotation,
  onUpdateStatus,
  onCreateNew
}) => {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Deletion Confirmation Modal State
  const [quoteToDelete, setQuoteToDelete] = useState<Quotation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Duplication & Error State
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Filter & Search Logic
  const filteredQuotations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return quotations.filter((q) => {
      // Search matches: Customer Name, Mobile/WhatsApp, Quotation ID
      const matchesName = q.customer.name.toLowerCase().includes(query);
      const matchesMobile = q.customer.mobile.includes(query) || q.customer.whatsapp.includes(query);
      const matchesId = q.id.toLowerCase().includes(query);
      const matchesSearch = !query || matchesName || matchesMobile || matchesId;

      // Status Filter
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

      // Payment Filter
      const matchesPayment = paymentFilter === 'all' || q.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [quotations, searchQuery, statusFilter, paymentFilter]);

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return;
    try {
      setIsDeleting(true);
      setHistoryError(null);
      await onDeleteQuotation(quoteToDelete.id);
      setQuoteToDelete(null);
    } catch (err) {
      console.error(err);
      setHistoryError('Failed to delete quotation. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setDuplicatingId(id);
      setHistoryError(null);
      await onDuplicateQuotation(id);
    } catch (err) {
      console.error(err);
      setHistoryError('Failed to duplicate quotation. Please try again.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleWhatsApp = (q: Quotation) => {
    setHistoryError(null);
    const message = generateWhatsAppMessage(q, studioProfile);
    const targetPhone = q.customer.whatsapp || q.customer.mobile;
    if (!targetPhone) {
      setHistoryError(`No phone number recorded for customer ${q.customer.name}.`);
      return;
    }
    const url = getWhatsAppUrl(targetPhone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Title & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-brand font-bold text-stone-900">
            Quotation & Booking Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Full history of saved quotations, payment tracking, PDF reprints, and client communication logs.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {historyError && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{historyError}</span>
          </div>
          <button
            onClick={() => setHistoryError(null)}
            className="text-red-700 hover:text-red-900 underline text-xs cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Controls Bar */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, mobile number, or quote ID (e.g. SRP-2026-0001)..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">All Booking Statuses</option>
            <option value="Quotation">Quotation</option>
            <option value="Confirmed Booking">Confirmed Booking</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div className="shrink-0">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs py-2 px-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Advance Pending">Advance Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Fully Paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-stone-200/90 rounded-xl shadow-xs overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-stone-700">No matching quotations found</h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your search keywords or filter dropdowns.'
                : 'Start by creating your first client quotation.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="py-3 px-4">Quotation ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Event & Date</th>
                  <th className="py-3 px-4 text-right">Final Total (₹)</th>
                  <th className="py-3 px-4 text-right">Advance Paid (₹)</th>
                  <th className="py-3 px-4 text-right">Remaining Balance (₹)</th>
                  <th className="py-3 px-4 text-center">Booking Status</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredQuotations.map((q) => {
                  return (
                    <tr key={q.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                        {q.id}
                        <div className="text-[10px] text-stone-400 font-sans font-normal">
                          {formatDate(q.createdAt)}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900">{q.customer.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          {q.customer.mobile || q.customer.whatsapp || 'No phone'}
                        </div>
                        {q.customer.email && (
                          <div className="text-[10px] text-stone-400 truncate max-w-[150px]">
                            {q.customer.email}
                          </div>
                        )}
                      </td>

                      {/* Event Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-800">{q.customer.eventType}</div>
                        <div className="text-[11px] text-stone-600 font-mono mt-0.5">
                          {formatDate(q.customer.eventDate)}
                        </div>
                        {q.customer.eventLocation && (
                          <div className="text-[10px] text-stone-400 truncate max-w-[140px]">
                            {q.customer.eventLocation}
                          </div>
                        )}
                      </td>

                      {/* Financials: Final Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-950 whitespace-nowrap">
                        {formatRupees(q.financials.finalTotal)}
                      </td>

                      {/* Financials: Advance Paid */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-blue-800 whitespace-nowrap">
                        {formatRupees(q.financials.advancePaid)}
                      </td>

                      {/* Financials: Remaining Balance */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={q.financials.remainingBalance > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                          {formatRupees(q.financials.remainingBalance)}
                        </span>
                      </td>

                      {/* Inline Editable Booking Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={q.status}
                          onChange={(e) => onUpdateStatus(q.id, e.target.value as BookingStatus, q.paymentStatus)}
                          className={`text-[11px] font-semibold py-1 px-2 rounded-md border cursor-pointer focus:ring-0 ${
                            q.status === 'Confirmed Booking'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : q.status === 'Completed'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : q.status === 'Cancelled'
                              ? 'bg-stone-100 text-stone-500 border-stone-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="Quotation">Quotation</option>
                          <option value="Confirmed Booking">Confirmed Booking</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Inline Editable Payment Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={q.paymentStatus}
                          onChange={(e) => onUpdateStatus(q.id, q.status, e.target.value as PaymentStatus)}
                          className={`text-[11px] font-semibold py-1 px-2 rounded-md border cursor-pointer focus:ring-0 ${
                            q.paymentStatus === 'Fully Paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : q.paymentStatus === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          <option value="Advance Pending">Advance Pending</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Fully Paid">Fully Paid</option>
                        </select>
                      </td>

                      {/* Action Icon Buttons */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Preview Modal */}
                          <button
                            onClick={() => onPreviewQuotation(q)}
                            title="A4 Portrait Preview"
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Download JPG */}
                          <button
                            onClick={() => onDownloadJpg(q)}
                            title="Download High-Resolution A4 JPG Image"
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded cursor-pointer transition-colors"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>

                          {/* Download PDF */}
                          <button
                            onClick={() => onDownloadPdf(q)}
                            title="Download PDF File"
                            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            onClick={() => handleWhatsApp(q)}
                            title="Share via WhatsApp"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditQuotation(q)}
                            title="Edit Quotation"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(q.id)}
                            disabled={duplicatingId === q.id}
                            title="Duplicate Quotation"
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded cursor-pointer transition-colors disabled:opacity-40"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setQuoteToDelete(q)}
                            title="Delete Quotation"
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 bg-stone-50/60 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
          <span>Showing {filteredQuotations.length} of {quotations.length} total records</span>
          <span className="text-[11px] text-stone-400">All data stored persistently in server database</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Delete Quotation?</h3>
                <p className="text-xs text-stone-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 space-y-1">
              <div>Quotation ID: <span className="font-mono font-bold text-stone-900">{quoteToDelete.id}</span></div>
              <div>Customer: <span className="font-semibold text-stone-900">{quoteToDelete.customer.name}</span></div>
              <div>Package Amount: <span className="font-mono font-semibold text-stone-900">{formatRupees(quoteToDelete.financials.finalTotal)}</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
