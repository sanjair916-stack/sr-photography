import React from 'react';
import { 
  FileText, 
  CalendarCheck, 
  TrendingUp, 
  Wallet, 
  Clock, 
  PlusCircle, 
  ArrowUpRight, 
  Eye, 
  Download, 
  Image as ImageIcon,
  MessageCircle, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Quotation, StudioProfile } from '../types';
import { formatRupees, formatDate } from '../utils/formatters';

interface DashboardViewProps {
  quotations: Quotation[];
  studioProfile: StudioProfile;
  onCreateNew: () => void;
  onViewHistory: () => void;
  onPreviewQuotation: (q: Quotation) => void;
  onDownloadPdf: (q: Quotation) => void;
  onDownloadJpg: (q: Quotation) => void;
  onShareWhatsApp: (q: Quotation) => void;
  onEditQuotation: (q: Quotation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  quotations,
  studioProfile,
  onCreateNew,
  onViewHistory,
  onPreviewQuotation,
  onDownloadPdf,
  onDownloadJpg,
  onShareWhatsApp,
  onEditQuotation
}) => {
  // Aggregate Metrics
  const totalQuotations = quotations.length;
  const confirmedBookings = quotations.filter((q) => q.status === 'Confirmed Booking' || q.status === 'Completed').length;
  
  const totalQuotationValue = quotations.reduce((acc, q) => acc + (q.financials?.finalTotal || 0), 0);
  const totalAdvanceReceived = quotations.reduce((acc, q) => acc + (q.financials?.advancePaid || 0), 0);
  const totalPendingBalance = quotations.reduce((acc, q) => acc + (q.financials?.remainingBalance || 0), 0);

  // Status Breakdowns
  const statusCounts = {
    quotation: quotations.filter((q) => q.status === 'Quotation').length,
    confirmed: quotations.filter((q) => q.status === 'Confirmed Booking').length,
    completed: quotations.filter((q) => q.status === 'Completed').length,
    cancelled: quotations.filter((q) => q.status === 'Cancelled').length
  };

  const paymentCounts = {
    pending: quotations.filter((q) => q.paymentStatus === 'Advance Pending').length,
    partiallyPaid: quotations.filter((q) => q.paymentStatus === 'Partially Paid').length,
    fullyPaid: quotations.filter((q) => q.paymentStatus === 'Fully Paid').length
  };

  const recentQuotations = quotations.slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative gold motif */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-amber-700/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio Business Executive Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-brand font-bold tracking-tight">
              {studioProfile.businessName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Monitor active photography bookings, instant quotation financials in INR (₹), and client payment statuses in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-600/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Quotation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Quotations */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs hover:border-amber-300/80 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Quotations</span>
            <div className="p-2 bg-stone-50 rounded-lg text-stone-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">
            {totalQuotations}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Generated client proposals
          </div>
        </div>

        {/* Total Confirmed Bookings */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs hover:border-amber-300/80 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {confirmedBookings}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Confirmed & active events
          </div>
        </div>

        {/* Total Quotation Value */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs hover:border-amber-300/80 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Quote Value</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">
            {formatRupees(totalQuotationValue)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Cumulative proposal value
          </div>
        </div>

        {/* Total Advance Received */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs hover:border-amber-300/80 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Advance Received</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-800">
            {formatRupees(totalAdvanceReceived)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Secured booking deposits
          </div>
        </div>

        {/* Total Pending Balance */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs hover:border-amber-300/80 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Balance</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-800">
            {formatRupees(totalPendingBalance)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Outstanding shoot dues
          </div>
        </div>
      </div>

      {/* Two Column Layout: Status Breakdowns & Recent Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Status Overview Cards */}
        <div className="space-y-6">
          {/* Booking Status Card */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center justify-between">
              <span>Booking Status Overview</span>
              <span className="text-[11px] font-mono text-stone-400 font-normal">{totalQuotations} total</span>
            </h2>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-700 font-medium">Draft Quotations</span>
                  <span className="font-mono font-bold text-stone-900">{statusCounts.quotation}</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-400 rounded-full"
                    style={{ width: `${totalQuotations ? (statusCounts.quotation / totalQuotations) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-700 font-medium">Confirmed Bookings</span>
                  <span className="font-mono font-bold text-emerald-700">{statusCounts.confirmed}</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${totalQuotations ? (statusCounts.confirmed / totalQuotations) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-700 font-medium">Shoots Completed</span>
                  <span className="font-mono font-bold text-blue-700">{statusCounts.completed}</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${totalQuotations ? (statusCounts.completed / totalQuotations) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-700 font-medium">Cancelled</span>
                  <span className="font-mono font-bold text-stone-400">{statusCounts.cancelled}</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-300 rounded-full"
                    style={{ width: `${totalQuotations ? (statusCounts.cancelled / totalQuotations) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4 pb-2 border-b border-stone-100">
              Payment Status Distribution
            </h2>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-red-50/60 border border-red-100 rounded-lg">
                <div className="text-[11px] font-semibold text-red-800 uppercase tracking-tight">Advance Due</div>
                <div className="text-xl font-bold font-mono text-red-700 mt-1">{paymentCounts.pending}</div>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
                <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-tight">Partial Paid</div>
                <div className="text-xl font-bold font-mono text-amber-700 mt-1">{paymentCounts.partiallyPaid}</div>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg">
                <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-tight">Fully Settled</div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-1">{paymentCounts.fullyPaid}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Quotations Table */}
        <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Recent Quotations & Bookings
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Latest client proposals generated with full action shortcuts
                </p>
              </div>
              <button
                onClick={onViewHistory}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({quotations.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentQuotations.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-500 font-medium">No quotations created yet</p>
                <p className="text-xs text-stone-400 mt-1">Generate your first quotation for SR PHOTOGRAPHY</p>
                <button
                  onClick={onCreateNew}
                  className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700"
                >
                  Create Quotation
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                      <th className="py-2.5 pr-3">Quotation ID</th>
                      <th className="py-2.5 px-3">Client / Event</th>
                      <th className="py-2.5 px-3">Event Date</th>
                      <th className="py-2.5 px-3 text-right">Total (₹)</th>
                      <th className="py-2.5 px-3 text-right">Balance (₹)</th>
                      <th className="py-2.5 pl-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {recentQuotations.map((q) => (
                      <tr key={q.id} className="hover:bg-amber-50/30 transition-colors group">
                        <td className="py-3 pr-3 font-mono font-semibold text-stone-900">
                          {q.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-stone-900">{q.customer.name}</div>
                          <div className="text-[11px] text-stone-500">{q.customer.eventType}</div>
                        </td>
                        <td className="py-3 px-3 text-stone-600 font-mono">
                          {formatDate(q.customer.eventDate)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-stone-900">
                          {formatRupees(q.financials.finalTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <span className={q.financials.remainingBalance > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700'}>
                            {formatRupees(q.financials.remainingBalance)}
                          </span>
                        </td>
                        <td className="py-3 pl-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onPreviewQuotation(q)}
                              title="A4 Preview"
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDownloadJpg(q)}
                              title="Download A4 JPG Image"
                              className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md cursor-pointer transition-colors font-bold text-[10px]"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDownloadPdf(q)}
                              title="Download A4 PDF"
                              className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-md cursor-pointer transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onShareWhatsApp(q)}
                              title="Share on WhatsApp"
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md cursor-pointer transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditQuotation(q)}
                              title="Edit Quotation"
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md cursor-pointer transition-colors"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between text-xs text-stone-500">
            <span>Showing recent {recentQuotations.length} records</span>
            <button
              onClick={onViewHistory}
              className="text-stone-700 font-medium hover:text-amber-700 transition-colors cursor-pointer"
            >
              Open Complete Quotation Ledger →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
