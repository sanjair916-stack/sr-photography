import React from 'react';
import { Quotation, StudioProfile } from '../types';
import { formatRupees, formatDate } from '../utils/formatters';
import { BrandLogo } from './BrandLogo';

interface QuotationSheetA4Props {
  quotation: Quotation;
  studioProfile: StudioProfile;
  id?: string;
}

export const QuotationSheetA4: React.FC<QuotationSheetA4Props> = ({
  quotation,
  studioProfile,
  id = 'quotation-a4-sheet'
}) => {
  const { customer, financials, services } = quotation;

  return (
    <div
      id={id}
      className="bg-white text-stone-900 mx-auto relative select-none"
      style={{
        width: '794px',
        minHeight: '1123px', // Standard 210mm x 297mm at 96 DPI
        padding: '40px 48px',
        boxSizing: 'border-box',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}
    >
      {/* Ornate Gold Border Line Frame */}
      <div className="absolute inset-4 border border-amber-300/40 pointer-events-none" />
      <div className="absolute inset-5 border border-amber-200/20 pointer-events-none" />

      {/* Decorative Gold Corner Accents */}
      <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-amber-500/70 pointer-events-none" />
      <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-amber-500/70 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-amber-500/70 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-amber-500/70 pointer-events-none" />

      {/* Header Zone: Brand Logo & Studio Details */}
      <div className="flex justify-between items-start pb-6 border-b border-amber-200/80">
        <div>
          <BrandLogo logoUrl={studioProfile.logoDataUrl} size="lg" />
          <p className="text-[11px] text-stone-500 mt-2 max-w-sm leading-relaxed">
            {studioProfile.address}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-600 mt-2 font-medium">
            <span>📞 {studioProfile.phone}</span>
            <span>✉️ {studioProfile.email}</span>
            {studioProfile.gstin && <span>GSTIN: <span className="font-mono">{studioProfile.gstin}</span></span>}
          </div>
        </div>

        {/* Quotation Badge & Reference Block */}
        <div className="text-right">
          <div className="inline-block px-3.5 py-1 bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-300 rounded-md">
            <span className="font-brand font-bold text-base tracking-[0.2em] text-amber-900 uppercase">
              QUOTATION
            </span>
          </div>

          <div className="mt-3 space-y-1 text-xs">
            <div className="text-stone-500">
              Quote Ref: <span className="font-mono font-bold text-stone-900">{quotation.id}</span>
            </div>
            <div className="text-stone-500">
              Date: <span className="font-mono text-stone-800">{formatDate(quotation.createdAt)}</span>
            </div>
            <div className="text-stone-500">
              Status:{' '}
              <span className="font-semibold text-amber-800 uppercase tracking-wider text-[11px]">
                {quotation.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Event Details Grid */}
      <div className="grid grid-cols-2 gap-6 my-6 p-4 bg-stone-50/70 border border-stone-200/80 rounded-lg">
        {/* Bill To */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800/90 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Client Information</span>
          </div>
          <div className="text-sm font-bold text-stone-900">{customer.name || 'Valued Client'}</div>
          <div className="text-xs text-stone-600 mt-1 space-y-0.5">
            <div>Mobile: <span className="font-mono font-medium text-stone-800">{customer.mobile || '—'}</span></div>
            {customer.whatsapp && customer.whatsapp !== customer.mobile && (
              <div>WhatsApp: <span className="font-mono text-stone-800">{customer.whatsapp}</span></div>
            )}
            {customer.email && <div>Email: <span className="text-stone-800">{customer.email}</span></div>}
          </div>
        </div>

        {/* Event Details */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800/90 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Event & Shoot Details</span>
          </div>
          <div className="text-xs text-stone-700 space-y-1">
            <div>
              <span className="text-stone-500">Event Type:</span>{' '}
              <span className="font-semibold text-stone-900">{customer.eventType}</span>
            </div>
            <div>
              <span className="text-stone-500">Event Date:</span>{' '}
              <span className="font-mono font-bold text-amber-900">{formatDate(customer.eventDate)}</span>
            </div>
            <div>
              <span className="text-stone-500">Location:</span>{' '}
              <span className="text-stone-800">{customer.eventLocation || 'Studio / Designated Venue'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="mb-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-amber-100 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 w-12 text-center rounded-l">#</th>
              <th className="py-2.5 px-3">Photography & Cinematography Service</th>
              <th className="py-2.5 px-3 text-right rounded-r w-36">Amount (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 border-b border-stone-200">
            {services.map((service, index) => (
              <tr key={service.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                <td className="py-2.5 px-3 text-center font-mono text-stone-400">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="py-2.5 px-3 font-medium text-stone-900">
                  <div>{service.name}</div>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold text-stone-900">
                  {formatRupees(service.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financials & Payment Details Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6 items-start">
        {/* Booking & Payment Overview */}
        <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-lg text-xs space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Booking & Payment Overview</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            All photography packages include professional high-resolution coverage, color grading, and private cloud delivery. Dates are confirmed upon advance receipt.
          </p>
          <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-700 font-medium">
            <span>Payment Status:</span>
            <span className="font-semibold text-amber-900 uppercase tracking-wide">
              {quotation.paymentStatus}
            </span>
          </div>
        </div>

        {/* Financial Calculation Ledger */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-stone-900">{formatRupees(financials.subtotal)}</span>
          </div>

          {financials.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>
                Discount ({financials.discountType === 'percentage' ? `${financials.discountValue}%` : 'Direct'})
              </span>
              <span className="font-mono font-semibold">-{formatRupees(financials.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
            <span>Final Package Total</span>
            <span className="font-mono text-base text-stone-900">{formatRupees(financials.finalTotal)}</span>
          </div>

          <div className="flex justify-between text-stone-700 pt-1">
            <span>Advance Payment Received</span>
            <span className="font-mono font-semibold text-blue-700">{formatRupees(financials.advancePaid)}</span>
          </div>

          <div className="flex justify-between text-xs font-bold text-amber-900 pt-2 border-t border-amber-200 bg-amber-50/70 p-2 rounded">
            <span>Remaining Balance Due</span>
            <span className="font-mono text-sm">{formatRupees(financials.remainingBalance)}</span>
          </div>
        </div>
      </div>

      {/* Special Notes if present */}
      {quotation.notes && (
        <div className="mb-5 p-3 bg-stone-50 border border-stone-200 rounded text-xs text-stone-600">
          <span className="font-bold text-stone-800">Special Notes: </span>
          {quotation.notes}
        </div>
      )}

      {/* Standard Terms and Conditions */}
      <div className="mb-8 pt-4 border-t border-stone-200">
        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
          Terms & Conditions
        </div>
        <ol className="list-decimal list-inside text-[10px] text-stone-600 space-y-1 leading-relaxed">
          {studioProfile.termsAndConditions.slice(0, 5).map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
      </div>

      {/* Dual Signature Space */}
      <div className="grid grid-cols-2 gap-12 pt-6 border-t border-stone-200 text-center">
        <div>
          <div className="h-14 border-b border-dashed border-stone-300 mx-auto w-48" />
          <div className="text-xs font-semibold text-stone-800 mt-2">Client Acceptance Signature</div>
          <div className="text-[10px] text-stone-400">({customer.name || 'Customer'})</div>
        </div>

        <div>
          <div className="h-16 border-b border-dashed border-stone-300 mx-auto w-48 flex items-end justify-center pb-1 relative">
            {studioProfile.signatureDataUrl ? (
              <img
                src={studioProfile.signatureDataUrl}
                alt="Authorized Signatory"
                crossOrigin="anonymous"
                className="h-14 w-auto max-w-[170px] object-contain select-none pointer-events-none mb-0.5"
              />
            ) : (
              <span className="font-brand font-semibold text-xs tracking-wider text-amber-800">
                SR PHOTOGRAPHY
              </span>
            )}
          </div>
          <div className="text-xs font-semibold text-stone-800 mt-2">Authorized Studio Signatory</div>
          <div className="text-[10px] text-stone-400">Lead Photographer / Management</div>
        </div>
      </div>

      {/* Footer Rule */}
      <div className="mt-8 text-center text-[10px] text-stone-400 pt-3 border-t border-stone-100">
        Thank you for choosing SR PHOTOGRAPHY. We create memories that last for generations.
      </div>
    </div>
  );
};
