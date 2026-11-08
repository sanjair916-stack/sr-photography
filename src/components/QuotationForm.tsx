import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  Eye, 
  Download, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Percent, 
  IndianRupee, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Layers, 
  Info, 
  RotateCcw,
  Image as ImageIcon,
  FileText,
  Printer,
  AlertCircle
} from 'lucide-react';
import { Quotation, StudioProfile, PhotographyService, BookingStatus, PaymentStatus } from '../types';
import { DEFAULT_SERVICES, EVENT_TYPES } from '../constants';
import { formatRupees, getWhatsAppUrl, generateWhatsAppMessage } from '../utils/formatters';
import { generateAndDownloadPdf, generateAndDownloadJpg } from '../utils/pdfGenerator';
import { QuotationSheetA4 } from './QuotationSheetA4';

interface QuotationFormProps {
  initialQuotation?: Quotation | null;
  studioProfile: StudioProfile;
  onSaveSuccess: (saved: Quotation) => void;
  onOpenPreview: (q: Quotation) => void;
  onCancelEdit?: () => void;
  onSaveDefaultServices?: (services: PhotographyService[]) => Promise<void>;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  initialQuotation,
  studioProfile,
  onSaveSuccess,
  onOpenPreview,
  onCancelEdit,
  onSaveDefaultServices
}) => {
  // Customer Details State
  const [customerName, setCustomerName] = useState(initialQuotation?.customer.name || '');
  const [mobileNumber, setMobileNumber] = useState(initialQuotation?.customer.mobile || '');
  const [whatsappNumber, setWhatsappNumber] = useState(initialQuotation?.customer.whatsapp || '');
  const [email, setEmail] = useState(initialQuotation?.customer.email || '');
  const [eventDate, setEventDate] = useState(initialQuotation?.customer.eventDate || '');
  const [eventLocation, setEventLocation] = useState(initialQuotation?.customer.eventLocation || '');
  const [eventType, setEventType] = useState(initialQuotation?.customer.eventType || 'Wedding Ceremony');
  const [sameAsMobile, setSameAsMobile] = useState(false);

  // Status State
  const [status, setStatus] = useState<BookingStatus>(initialQuotation?.status || 'Quotation');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialQuotation?.paymentStatus || 'Advance Pending');
  const [notes, setNotes] = useState(initialQuotation?.notes || '');

  // Services Catalog State (initialized from Studio Default Services)
  const [services, setServices] = useState<(PhotographyService & { selected: boolean })[]>(() => {
    const catalogBase = studioProfile.defaultServices && studioProfile.defaultServices.length > 0
      ? studioProfile.defaultServices
      : DEFAULT_SERVICES;

    if (initialQuotation?.services) {
      // Initialize with existing services
      const preloaded = catalogBase.map((s) => {
        const found = initialQuotation.services.find((es) => es.id === s.id);
        return {
          ...s,
          name: found ? found.name : s.name,
          price: found ? found.price : s.price,
          selected: !!found
        };
      });

      const customOnes = initialQuotation.services
        .filter((s) => !catalogBase.some((ds) => ds.id === s.id))
        .map((s) => ({
          ...s,
          selected: true,
          isCustom: true
        }));

      return [...preloaded, ...customOnes];
    }

    return catalogBase.map((s) => ({
      ...s,
      selected: s.id === 'srv-wedding-photo' || s.id === 'srv-candid-photo'
    }));
  });

  // Financials State
  const [discountType, setDiscountType] = useState<'rupees' | 'percentage'>(
    initialQuotation?.financials.discountType || 'rupees'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialQuotation?.financials.discountValue ?? 0
  );
  const [advancePaid, setAdvancePaid] = useState<number>(
    initialQuotation?.financials.advancePaid ?? 0
  );

  // Custom Service Input State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('');

  // UI Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  const [jpgStatus, setJpgStatus] = useState('');

  // Sync whatsapp when "same as mobile" checked
  useEffect(() => {
    if (sameAsMobile) {
      setWhatsappNumber(mobileNumber);
    }
  }, [sameAsMobile, mobileNumber]);

  // Subtotal calculation
  const subtotal = useMemo(() => {
    return services
      .filter((s) => s.selected)
      .reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }, [services]);

  // Discount calculation
  const discountAmount = useMemo(() => {
    const val = Number(discountValue) || 0;
    if (val <= 0) return 0;
    if (discountType === 'percentage') {
      const clampedPercent = Math.min(100, Math.max(0, val));
      return Math.round((subtotal * clampedPercent) / 100);
    }
    // In rupees, discount cannot exceed subtotal
    return Math.min(subtotal, Math.max(0, val));
  }, [subtotal, discountType, discountValue]);

  // Final Total calculation
  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // Remaining Balance calculation
  const remainingBalance = useMemo(() => {
    const adv = Number(advancePaid) || 0;
    return Math.max(0, finalTotal - adv);
  }, [finalTotal, advancePaid]);

  // Auto payment status recommendation
  useEffect(() => {
    const adv = Number(advancePaid) || 0;
    if (finalTotal > 0 && adv >= finalTotal) {
      setPaymentStatus('Fully Paid');
    } else if (adv > 0) {
      setPaymentStatus('Partially Paid');
    } else {
      setPaymentStatus('Advance Pending');
    }
  }, [advancePaid, finalTotal]);

  // Service toggle
  const toggleService = (id: string) => {
    if (formError) setFormError(null);
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  // Service price edit
  const updateServicePrice = (id: string, price: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: Math.max(0, price) } : s))
    );
  };

  // Service name edit
  const updateServiceName = (id: string, name: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  };

  // Remove custom service
  const removeService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Add custom service
  const handleAddCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const priceNum = Number(newServicePrice) || 0;

    const newId = `custom-srv-${Date.now()}`;
    const newService: PhotographyService & { selected: boolean } = {
      id: newId,
      name: newServiceName.trim(),
      price: Math.max(0, priceNum),
      selected: true,
      isCustom: true
    };

    setServices((prev) => [...prev, newService]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  // Save current prices as default catalog for future quotes
  const handleSaveDefaultPrices = async () => {
    const listToSave: PhotographyService[] = services.map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price) || 0,
      isCustom: s.isCustom
    }));

    try {
      if (onSaveDefaultServices) {
        await onSaveDefaultServices(listToSave);
      } else {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ defaultServices: listToSave })
        });
      }
      setSaveSuccessMsg('Service names and prices saved as default for all future quotations!');
      setTimeout(() => setSaveSuccessMsg(''), 4500);
    } catch (err) {
      console.error(err);
      alert('Failed to save service prices.');
    }
  };

  // Reset to studio defaults
  const handleResetToStudioDefaults = () => {
    const catalogBase = studioProfile.defaultServices && studioProfile.defaultServices.length > 0
      ? studioProfile.defaultServices
      : DEFAULT_SERVICES;

    setServices(
      catalogBase.map((s) => ({
        ...s,
        selected: s.id === 'srv-wedding-photo' || s.id === 'srv-candid-photo'
      }))
    );
  };

  // Assemble current Quotation object
  const getCurrentQuotationObject = (): Quotation => {
    const selectedServices = services
      .filter((s) => s.selected)
      .map((s) => ({
        id: s.id,
        name: s.name,
        price: Number(s.price) || 0
      }));

    return {
      id: initialQuotation?.id || '',
      createdAt: initialQuotation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: customerName || 'Valued Customer',
        mobile: mobileNumber,
        whatsapp: whatsappNumber || mobileNumber,
        email,
        eventDate,
        eventLocation,
        eventType
      },
      services: selectedServices,
      financials: {
        subtotal,
        discountType,
        discountValue: Number(discountValue) || 0,
        discountAmount,
        finalTotal,
        advancePaid: Number(advancePaid) || 0,
        remainingBalance
      },
      status,
      paymentStatus,
      notes
    };
  };

  // Save Quotation Handler with Zero Alert Suppression
  const handleSave = async () => {
    setFormError(null);
    setSaveSuccessMsg('');

    if (!customerName.trim()) {
      setFormError('Please enter Customer Name before saving the quotation.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const selectedCount = services.filter((s) => s.selected).length;
    if (selectedCount === 0) {
      setFormError('Please select at least one Photography Service before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const quotePayload = getCurrentQuotationObject();

      let saved: Quotation;
      if (initialQuotation?.id) {
        // Update
        const res = await fetch(`/api/quotations/${initialQuotation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quotePayload)
        });
        if (!res.ok) throw new Error('Failed to update quotation');
        saved = await res.json();
      } else {
        // Create new
        const res = await fetch('/api/quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quotePayload)
        });
        if (!res.ok) throw new Error('Failed to create quotation');
        saved = await res.json();
      }

      setSaveSuccessMsg(`✓ Quotation ${saved.id} successfully saved to database!`);
      setFormError(null);
      onSaveSuccess(saved);

      setTimeout(() => {
        setSaveSuccessMsg('');
      }, 6000);
    } catch (err) {
      console.error(err);
      setFormError('Error saving quotation to database. Please check your network and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview Handler
  const handlePreview = () => {
    const quote = getCurrentQuotationObject();
    if (!quote.id) {
      quote.id = 'SRP-PREVIEW';
    }
    onOpenPreview(quote);
  };

  // Direct Download PDF Handler
  const handleDownloadPdf = async () => {
    setFormError(null);
    const el = document.getElementById('hidden-a4-sheet-generator');
    if (!el) {
      setFormError('Quotation sheet renderer is not ready. Please try opening Preview first.');
      return;
    }

    const currentQuote = getCurrentQuotationObject();
    const effectiveId = currentQuote.id || 'SRP-DRAFT';

    try {
      setIsDownloadingPdf(true);
      await generateAndDownloadPdf({
        element: el,
        quotationId: effectiveId,
        customerName: customerName || 'Customer',
        onProgress: (msg) => setPdfStatus(msg)
      });
    } catch (err) {
      console.error(err);
      setFormError('Automatic PDF download blocked. Please click "Preview & Print (Save as PDF)" to save directly.');
    } finally {
      setIsDownloadingPdf(false);
      setPdfStatus('');
    }
  };

  // Direct Download JPG Handler
  const handleDownloadJpg = async () => {
    setFormError(null);
    const el = document.getElementById('hidden-a4-sheet-generator');
    if (!el) {
      setFormError('Quotation sheet renderer is not ready. Please try opening Preview first.');
      return;
    }

    const currentQuote = getCurrentQuotationObject();
    const effectiveId = currentQuote.id || 'SRP-DRAFT';

    try {
      setIsDownloadingJpg(true);
      await generateAndDownloadJpg({
        element: el,
        quotationId: effectiveId,
        customerName: customerName || 'Customer',
        onProgress: (msg) => setJpgStatus(msg)
      });
    } catch (err) {
      console.error(err);
      setFormError('Automatic JPG download encountered an issue. Please click "Preview & Print (Save as PDF)" to view and save.');
    } finally {
      setIsDownloadingJpg(false);
      setJpgStatus('');
    }
  };

  // WhatsApp Share Handler
  const handleWhatsApp = () => {
    setFormError(null);
    const quote = getCurrentQuotationObject();
    if (!quote.id) quote.id = 'SRP-PENDING';
    const message = generateWhatsAppMessage(quote, studioProfile);
    const targetPhone = whatsappNumber || mobileNumber;
    if (!targetPhone) {
      setFormError('Please enter a Mobile or WhatsApp number for this customer to share via WhatsApp.');
      return;
    }
    const url = getWhatsAppUrl(targetPhone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-brand font-bold text-stone-900">
              {initialQuotation ? `Edit Quotation ${initialQuotation.id}` : 'Create New Quotation'}
            </h1>
            {initialQuotation && onCancelEdit && (
              <button
                onClick={onCancelEdit}
                className="text-xs text-stone-500 hover:text-stone-800 underline ml-2 cursor-pointer"
              >
                (Cancel Edit)
              </button>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Assemble client packages, calculate automatic Indian Rupee (₹) totals, and render branded A4 PDFs.
          </p>
        </div>

        {/* Live Status Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Booking Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-stone-300 rounded-lg shadow-xs focus:ring-1 focus:ring-amber-500 text-stone-800 cursor-pointer"
            >
              <option value="Quotation">Quotation (Draft)</option>
              <option value="Confirmed Booking">Confirmed Booking</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-stone-300 rounded-lg shadow-xs focus:ring-1 focus:ring-amber-500 text-stone-800 cursor-pointer"
            >
              <option value="Advance Pending">Advance Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Fully Paid">Fully Paid</option>
            </select>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Financial Ledger Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Details & Service Catalog */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Customer Details */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
              <User className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                1. Customer & Event Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Customer / Couple Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="e.g. Aditya & Sneha Verma"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. +91 98402 11223"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    WhatsApp Number
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-amber-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsMobile}
                      onChange={(e) => setSameAsMobile(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                    />
                    <span>Same as mobile</span>
                  </label>
                </div>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. +91 98402 11223"
                    disabled={sameAsMobile}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono disabled:opacity-75"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. client@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Event / Shoot Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono cursor-pointer"
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Location */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Event Venue / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Leela Palace Ballroom, Chennai"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Photography Services Catalog */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  2. Photography & Cinematography Services
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDefaultPrices}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Save current prices as default for all future quotations"
                >
                  <Save className="w-3 h-3 text-amber-700" />
                  <span>Save Prices as Default</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToStudioDefaults}
                  className="inline-flex items-center gap-1 px-2 py-1 text-stone-500 hover:text-stone-800 text-[11px] rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Reset to studio defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Prices</span>
                </button>

                <span className="text-[11px] text-stone-400 font-mono ml-1">
                  {services.filter((s) => s.selected).length} of {services.length} selected
                </span>
              </div>
            </div>

            {/* Services List Table */}
            <div className="space-y-2 mb-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                    service.selected
                      ? 'bg-amber-50/40 border-amber-300/80 shadow-xs'
                      : 'bg-white border-stone-200/70 hover:border-stone-300'
                  }`}
                >
                  {/* Checkbox & Service Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      id={`chk-${service.id}`}
                      checked={service.selected}
                      onChange={() => toggleService(service.id)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    
                    {/* Editable Service Name */}
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateServiceName(service.id, e.target.value)}
                      className="flex-1 bg-transparent border-0 border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:ring-0 text-xs font-medium text-stone-900 py-0.5 px-1 truncate"
                    />
                    
                    {service.isCustom && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Price Input & Remove Action */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={service.price}
                        onChange={(e) => updateServicePrice(service.id, Number(e.target.value))}
                        disabled={!service.selected}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-stone-200 rounded-md text-xs font-mono font-semibold text-stone-900 text-right focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-40"
                      />
                    </div>

                    {service.isCustom && (
                      <button
                        type="button"
                        onClick={() => removeService(service.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Remove custom service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom Service Form */}
            <form
              onSubmit={handleAddCustomService}
              className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-lg flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Add custom service (e.g. Crane Cam, LED Screen, Vanity Shoot)..."
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="relative w-full sm:w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Price"
                  className="w-full pl-6 pr-2 py-1.5 bg-white border border-stone-200 rounded-md text-xs font-mono text-stone-900 text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-md text-xs font-medium cursor-pointer transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </form>
          </div>

          {/* Section 3: Special Notes */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
              3. Special Instructions & Shoot Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Drone permissions arranged by venue, couple requested sunset beach portraits, 2 deliverables needed..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Right Column: Sticky Financial Ledger & Action Console */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-5">
            {/* Automatic Calculation Ledger */}
            <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-sm relative overflow-hidden">
              {/* Gold Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center justify-between">
                <span>Quotation Financials</span>
                <span className="text-[10px] font-mono text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                  INR (₹)
                </span>
              </h2>

              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">Subtotal</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {formatRupees(subtotal)}
                  </span>
                </div>

                {/* Discount Configuration */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      Discount
                    </label>

                    {/* Toggle: Rupees or Percentage */}
                    <div className="flex items-center p-0.5 bg-stone-100 rounded-md text-[11px]">
                      <button
                        type="button"
                        onClick={() => setDiscountType('rupees')}
                        className={`px-2 py-0.5 rounded cursor-pointer font-medium transition-colors ${
                          discountType === 'rupees'
                            ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        ₹ (Amount)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('percentage')}
                        className={`px-2 py-0.5 rounded cursor-pointer font-medium transition-colors ${
                          discountType === 'percentage'
                            ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        % (Percent)
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono">
                      {discountType === 'rupees' ? '₹' : '%'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? 100 : subtotal}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono font-semibold text-stone-900 text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[11px] text-emerald-700 font-medium">
                      <span>Discount deduction</span>
                      <span className="font-mono">-{formatRupees(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Final Total */}
                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-900">Final Package Total</div>
                    <div className="text-[10px] text-stone-400">Subtotal minus discount</div>
                  </div>
                  <div className="text-lg font-bold font-mono text-stone-950">
                    {formatRupees(finalTotal)}
                  </div>
                </div>

                {/* Advance Paid */}
                <div className="pt-3 border-t border-stone-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      Advance Paid Received
                    </label>
                    <button
                      type="button"
                      onClick={() => setAdvancePaid(Math.round(finalTotal * 0.5))}
                      className="text-[10px] text-amber-800 hover:underline cursor-pointer"
                    >
                      (Set 50%)
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={finalTotal}
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-mono font-bold text-blue-900 text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Remaining Balance */}
                <div className="p-3 bg-gradient-to-br from-amber-50/90 to-amber-100/50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      Remaining Balance
                    </div>
                    <div className="text-[10px] text-amber-700">Due before final album delivery</div>
                  </div>
                  <div className="text-lg font-bold font-mono text-amber-950">
                    {formatRupees(remainingBalance)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Box */}
            <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-xs space-y-3">
              {/* Validation Error Banner */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-xs font-semibold flex items-start gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold">Required Information</div>
                    <div className="text-[11px] font-normal text-red-700 mt-0.5">{formError}</div>
                  </div>
                </div>
              )}

              {/* Save Success Banner */}
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Primary: Save Quotation */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Quotation to Database</span>
                  </>
                )}
              </button>

              {/* Direct Print / Save as PDF Button */}
              <button
                type="button"
                onClick={handlePreview}
                className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                title="Open full A4 preview and print or save as PDF"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Preview & Save as PDF (Print)</span>
              </button>

              {/* Secondary Actions Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadJpg}
                  disabled={isDownloadingJpg}
                  className="py-2 px-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                  title="Download High-Resolution A4 JPG image"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="truncate">{isDownloadingJpg ? jpgStatus || '...' : 'Download JPG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="py-2 px-2 bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                  title="Download A4 PDF file"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">{isDownloadingPdf ? pdfStatus || '...' : 'File PDF'}</span>
                </button>
              </div>

              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Off-Screen A4 Sheet for direct PDF/JPG generation */}
      <div 
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: -99999,
          pointerEvents: 'none',
          opacity: 0.01
        }}
      >
        <QuotationSheetA4
          id="hidden-a4-sheet-generator"
          quotation={getCurrentQuotationObject()}
          studioProfile={studioProfile}
        />
      </div>
    </div>
  );
};
