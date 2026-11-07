import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  Trash2, 
  Save, 
  Key, 
  CheckCircle, 
  ShieldCheck, 
  FileText, 
  Plus, 
  Image as ImageIcon,
  Layers,
  Sparkles,
  RotateCcw,
  PenTool
} from 'lucide-react';
import { StudioProfile, PhotographyService } from '../types';
import { DEFAULT_SERVICES } from '../constants';
import { BrandLogo } from './BrandLogo';
import { formatRupees } from '../utils/formatters';

interface StudioSettingsViewProps {
  studioProfile: StudioProfile;
  onUpdateSettings: (settings: Partial<StudioProfile>) => Promise<void>;
  onChangePassword: (curr: string, next: string, user?: string) => Promise<{ success: boolean; message: string }>;
}

export const StudioSettingsView: React.FC<StudioSettingsViewProps> = ({
  studioProfile,
  onUpdateSettings,
  onChangePassword
}) => {
  // Studio Profile Form State
  const [businessName, setBusinessName] = useState(studioProfile.businessName || 'SR PHOTOGRAPHY');
  const [tagline, setTagline] = useState(studioProfile.tagline || '');
  const [phone, setPhone] = useState(studioProfile.phone || '');
  const [whatsapp, setWhatsapp] = useState(studioProfile.whatsapp || '');
  const [email, setEmail] = useState(studioProfile.email || '');
  const [website, setWebsite] = useState(studioProfile.website || '');
  const [address, setAddress] = useState(studioProfile.address || '');
  const [gstin, setGstin] = useState(studioProfile.gstin || '');

  // Default Services & Pricing State
  const [servicesList, setServicesList] = useState<PhotographyService[]>(() => {
    return studioProfile.defaultServices && studioProfile.defaultServices.length > 0
      ? studioProfile.defaultServices
      : DEFAULT_SERVICES;
  });

  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState<number | ''>('');

  // Terms and Conditions State
  const [terms, setTerms] = useState<string[]>(studioProfile.termsAndConditions || []);
  const [newTerm, setNewTerm] = useState('');

  // Logo & Signature State
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(studioProfile.logoDataUrl);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>(studioProfile.signatureDataUrl);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Save Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Handle Logo File Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setLogoDataUrl(undefined);
  };

  // Handle Signature File Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSignatureDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleResetSignature = () => {
    setSignatureDataUrl(undefined);
  };

  // Service Price Change
  const handleServicePriceChange = (id: string, price: number) => {
    setServicesList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: Math.max(0, price) } : s))
    );
  };

  // Service Name Change
  const handleServiceNameChange = (id: string, name: string) => {
    setServicesList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  };

  // Remove Service
  const handleRemoveService = (id: string) => {
    setServicesList((prev) => prev.filter((s) => s.id !== id));
  };

  // Reset to original default services
  const handleResetToFactoryDefaults = () => {
    if (window.confirm('Reset all service names and prices to default studio values?')) {
      setServicesList(DEFAULT_SERVICES);
    }
  };

  // Add New Service
  const handleAddNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName.trim()) return;
    const priceNum = Number(newSrvPrice) || 0;

    const newService: PhotographyService = {
      id: `srv-${Date.now()}`,
      name: newSrvName.trim(),
      price: Math.max(0, priceNum),
      isCustom: true
    };

    setServicesList((prev) => [...prev, newService]);
    setNewSrvName('');
    setNewSrvPrice('');
  };

  // Save only services pricing directly
  const handleSaveServicesOnly = async () => {
    try {
      setIsSaving(true);
      await onUpdateSettings({ defaultServices: servicesList });
      setSaveSuccessMsg('Default photography service prices saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to save service prices.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add Term
  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim()) return;
    setTerms([...terms, newTerm.trim()]);
    setNewTerm('');
  };

  // Remove Term
  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  // Update Term
  const handleUpdateTerm = (index: number, val: string) => {
    const updated = [...terms];
    updated[index] = val;
    setTerms(updated);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      await onUpdateSettings({
        businessName,
        tagline,
        phone,
        whatsapp,
        email,
        website,
        address,
        gstin,
        termsAndConditions: terms,
        logoDataUrl,
        signatureDataUrl,
        defaultServices: servicesList
      });

      setSaveSuccessMsg('Studio profile and default service prices saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Change Password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    const res = await onChangePassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: res.message || 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.message || 'Failed to change password.' });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Title */}
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-xl sm:text-2xl font-brand font-bold text-stone-900">
          Studio Profile & Quotation Settings
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Configure business branding, official logo, default photography service prices, contact information, and legal quotation terms.
        </p>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: Official Logo & Brand Styling */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              1. SR PHOTOGRAPHY Official Logo
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Live Preview Box */}
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl flex flex-col items-center justify-center min-w-[280px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                Live Document & PDF Logo Preview
              </div>
              <BrandLogo logoUrl={logoDataUrl} size="lg" />
              <div className="text-[11px] text-stone-500 mt-3 font-medium">
                {logoDataUrl ? 'Custom Studio Logo Active' : 'Default Royal Gold Monogram Active'}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="space-y-3 flex-1 text-xs">
              <p className="text-stone-600 leading-relaxed">
                Upload your high-resolution SR PHOTOGRAPHY logo. It will appear on all generated A4 portrait PDF quotations, print invoices, and the admin dashboard.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Logo File (PNG / JPG / SVG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoDataUrl && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-stone-600 hover:text-red-700 hover:bg-red-50 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Default Gold Badge</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-stone-400">
                Recommended: Transparent PNG or high-resolution graphic (at least 400x200 px).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Authorized Signatory */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
            <PenTool className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              2. Authorized Studio Signatory
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Live Signature Preview */}
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl flex flex-col items-center justify-center min-w-[280px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                Live Signatory Preview
              </div>
              <div className="h-16 w-56 border-b border-dashed border-stone-400 flex items-center justify-center bg-white rounded-t-lg px-2">
                {signatureDataUrl ? (
                  <img
                    src={signatureDataUrl}
                    alt="Authorized Signatory"
                    className="h-14 max-h-14 max-w-[200px] object-contain"
                  />
                ) : (
                  <span className="font-brand font-semibold text-xs tracking-wider text-stone-400 italic">
                    (No signature image - text fallback will be used)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-500 mt-2 font-medium">
                {signatureDataUrl ? 'Digital Signature Active' : 'Text Fallback Active'}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="space-y-3 flex-1 text-xs">
              <p className="text-stone-600 leading-relaxed">
                Upload your official authorized signature image. It will be printed directly in the authorized signatory block at the bottom right of every A4 quotation sheet, PDF, and JPG export.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Signature File (PNG / JPG / WebP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                </label>

                {signatureDataUrl && (
                  <button
                    type="button"
                    onClick={handleResetSignature}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-stone-600 hover:text-red-700 hover:bg-red-50 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Signature</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-stone-400">
                Recommended: Transparent PNG or dark ink signature on clean white background.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Studio Contact Information */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
            <Building2 className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              3. Studio Profile & Contact Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Studio / Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Studio Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Studio Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Studio WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Studio Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                GSTIN / Tax Registration No
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 33AABCS8891D1ZV"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Photography Services & Default Pricing Catalog */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  4. Photography Services & Default Pricing Catalog
                </h2>
                <p className="text-[11px] text-stone-500">
                  Set default rates in INR (₹) that auto-fill whenever you create a new quotation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToFactoryDefaults}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-stone-500 hover:text-stone-800 text-[11px] border border-stone-200 rounded-md cursor-pointer transition-colors"
                title="Reset to factory preset service rates"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Presets</span>
              </button>

              <button
                type="button"
                onClick={handleSaveServicesOnly}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                <span>Save Service Prices</span>
              </button>
            </div>
          </div>

          {/* List of services with editable prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {servicesList.map((service, index) => (
              <div
                key={service.id || index}
                className="flex items-center justify-between gap-3 p-3 bg-stone-50/80 border border-stone-200 rounded-lg hover:border-amber-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleServiceNameChange(service.id, e.target.value)}
                    className="w-full text-xs font-medium text-stone-900 bg-transparent border-0 border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:ring-0 py-0.5 truncate"
                  />
                  {service.isCustom && (
                    <span className="text-[9px] font-mono text-amber-800 font-semibold bg-amber-100/60 px-1.5 py-0.2 rounded">
                      Custom Package
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={service.price}
                      onChange={(e) => handleServicePriceChange(service.id, Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1 bg-white border border-stone-300 rounded-md text-xs font-mono font-bold text-stone-900 text-right focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveService(service.id)}
                    className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                    title="Remove service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Default Service Form */}
          <div className="p-3 bg-stone-50/60 border border-dashed border-stone-300 rounded-lg flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newSrvName}
              onChange={(e) => setNewSrvName(e.target.value)}
              placeholder="Add new standard service / package (e.g. Crane Cam, Haldi Shoot)..."
              className="flex-1 w-full px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-900 focus:ring-1 focus:ring-amber-500"
            />
            <div className="relative w-full sm:w-32">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={newSrvPrice}
                onChange={(e) => setNewSrvPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Default Price"
                className="w-full pl-6 pr-2 py-1.5 bg-white border border-stone-200 rounded-md text-xs font-mono text-stone-900 text-right focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddNewService}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-md text-xs font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Catalog</span>
            </button>
          </div>
        </div>

        {/* Section 5: Terms and Conditions */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
            <FileText className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              5. Standard Quotation Terms & Conditions
            </h2>
          </div>

          <div className="space-y-2 mb-4">
            {terms.map((term, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="font-mono text-xs text-stone-400 w-6 text-right">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => handleUpdateTerm(index, e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(index)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                  title="Remove term"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Add new term or policy condition..."
              className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={handleAddTerm}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-md cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Term</span>
            </button>
          </div>
        </div>

        {/* Save Settings Trigger */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Studio Settings & Prices</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Section 5: Admin Password & Security Settings */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-xs mt-12">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
          <Key className="w-4 h-4 text-amber-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            5. Admin Security & Password Change
          </h2>
        </div>

        {passwordMsg && (
          <div
            className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePasswordSubmit} className="max-w-md space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 4 chars)"
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Update Admin Password</span>
          </button>
        </form>
      </div>
    </div>
  );
};
