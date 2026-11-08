import React, { useState, useEffect, useCallback } from 'react';
import { Quotation, StudioProfile, BookingStatus, PaymentStatus } from './types';
import { DEFAULT_STUDIO_PROFILE } from './constants';
import { api } from './services/api';
import { Navbar, NavTab } from './components/Navbar';
import { AdminLogin } from './components/AdminLogin';
import { DashboardView } from './components/DashboardView';
import { QuotationForm } from './components/QuotationForm';
import { QuotationHistoryView } from './components/QuotationHistoryView';
import { StudioSettingsView } from './components/StudioSettingsView';
import { QuotationPreviewModal } from './components/QuotationPreviewModal';
import { generateWhatsAppMessage, getWhatsAppUrl } from './utils/formatters';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sr_admin_auth');
      return saved ? JSON.parse(saved).isAuthenticated : false;
    } catch {
      return false;
    }
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [studioProfile, setStudioProfile] = useState<StudioProfile>(DEFAULT_STUDIO_PROFILE);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Active Edit Quotation (if editing an existing one)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  // A4 Preview Modal State
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInitialAction, setPreviewInitialAction] = useState<'jpg' | 'pdf' | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Fetch quotations and studio settings
  const loadData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const [quotesData, settingsData] = await Promise.all([
        api.getQuotations(),
        api.getSettings()
      ]);
      setQuotations(quotesData);
      setStudioProfile(settingsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    api.getSettings().then((settings) => setStudioProfile(settings)).catch(() => {});
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Auth Handlers
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
    loadData();
    showToast('Welcome to SR PHOTOGRAPHY Admin Portal');
  };

  const handleLogout = () => {
    localStorage.removeItem('sr_admin_auth');
    setIsAuthenticated(false);
    setEditingQuotation(null);
    setIsPreviewOpen(false);
  };

  // Navigation Handlers
  const handleCreateNew = () => {
    setEditingQuotation(null);
    setCurrentTab('create');
  };

  const handleEditQuotation = (q: Quotation) => {
    setEditingQuotation(q);
    setCurrentTab('create');
  };

  // Preview Handlers
  const handlePreviewQuotation = (q: Quotation, action: 'jpg' | 'pdf' | null = null) => {
    setPreviewQuotation(q);
    setPreviewInitialAction(action);
    setIsPreviewOpen(true);
  };

  // Download PDF Handler - Opens Preview with direct print options
  const handleDownloadPdf = (q: Quotation) => {
    handlePreviewQuotation(q, 'pdf');
  };

  // Download JPG Handler - Opens Preview and auto-starts high-res JPG export
  const handleDownloadJpg = (q: Quotation) => {
    handlePreviewQuotation(q, 'jpg');
    showToast(`Generating high-resolution JPG for ${q.id}...`);
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = (q: Quotation) => {
    const msg = generateWhatsAppMessage(q, studioProfile);
    const targetPhone = q.customer.whatsapp || q.customer.mobile;
    if (!targetPhone) {
      showToast('No phone number saved for this quotation.');
      return;
    }
    const url = getWhatsAppUrl(targetPhone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Save Quotation Success
  const handleSaveSuccess = (saved: Quotation) => {
    setQuotations((prev) => {
      const index = prev.findIndex((item) => item.id === saved.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = saved;
        return next;
      }
      return [saved, ...prev];
    });

    setEditingQuotation(saved);
    showToast(`Quotation ${saved.id} successfully saved!`);
  };

  // Duplicate Quotation
  const handleDuplicateQuotation = async (id: string) => {
    const duplicated = await api.duplicateQuotation(id);
    setQuotations((prev) => [duplicated, ...prev]);
    showToast(`Created duplicate quotation ${duplicated.id}`);
  };

  // Delete Quotation
  const handleDeleteQuotation = async (id: string) => {
    await api.deleteQuotation(id);
    setQuotations((prev) => prev.filter((q) => q.id !== id));
    showToast(`Quotation ${id} deleted`);
  };

  // Update Status
  const handleUpdateStatus = async (
    id: string,
    status: BookingStatus,
    paymentStatus: PaymentStatus
  ) => {
    const updated = await api.updateQuotation(id, { status, paymentStatus });
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: updated.status, paymentStatus: updated.paymentStatus } : q))
    );
    showToast(`Updated status for ${id}`);
  };

  // Update Studio Settings
  const handleUpdateSettings = async (settings: Partial<StudioProfile>) => {
    const updated = await api.updateSettings(settings);
    setStudioProfile(updated);
    showToast('Studio settings updated successfully');
  };

  // Change Password
  const handleChangePassword = async (curr: string, next: string, user?: string) => {
    return await api.changePassword(curr, next, user);
  };

  // If Not Authenticated -> Show Admin Login
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} logoUrl={studioProfile.logoDataUrl} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-amber-500/40 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'create') setEditingQuotation(null);
          setCurrentTab(tab);
        }}
        onLogout={handleLogout}
        logoUrl={studioProfile.logoDataUrl}
        quotationCount={quotations.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isLoadingData ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-stone-500 font-medium">Loading SR PHOTOGRAPHY database...</span>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                quotations={quotations}
                studioProfile={studioProfile}
                onCreateNew={handleCreateNew}
                onViewHistory={() => setCurrentTab('history')}
                onPreviewQuotation={handlePreviewQuotation}
                onDownloadPdf={handleDownloadPdf}
                onDownloadJpg={handleDownloadJpg}
                onShareWhatsApp={handleShareWhatsApp}
                onEditQuotation={handleEditQuotation}
              />
            )}

            {currentTab === 'create' && (
              <QuotationForm
                key={editingQuotation ? editingQuotation.id : 'new-quotation'}
                initialQuotation={editingQuotation}
                studioProfile={studioProfile}
                onSaveSuccess={handleSaveSuccess}
                onOpenPreview={handlePreviewQuotation}
                onCancelEdit={() => {
                  setEditingQuotation(null);
                  setCurrentTab('history');
                }}
                onSaveDefaultServices={async (newServices) => {
                  await handleUpdateSettings({ defaultServices: newServices });
                }}
              />
            )}

            {currentTab === 'history' && (
              <QuotationHistoryView
                quotations={quotations}
                studioProfile={studioProfile}
                onPreviewQuotation={handlePreviewQuotation}
                onDownloadPdf={handleDownloadPdf}
                onDownloadJpg={handleDownloadJpg}
                onEditQuotation={handleEditQuotation}
                onDuplicateQuotation={handleDuplicateQuotation}
                onDeleteQuotation={handleDeleteQuotation}
                onUpdateStatus={handleUpdateStatus}
                onCreateNew={handleCreateNew}
              />
            )}

            {currentTab === 'settings' && (
              <StudioSettingsView
                studioProfile={studioProfile}
                onUpdateSettings={handleUpdateSettings}
                onChangePassword={handleChangePassword}
              />
            )}
          </>
        )}
      </main>

      {/* A4 Portrait Preview & PDF Modal */}
      <QuotationPreviewModal
        quotation={previewQuotation}
        studioProfile={studioProfile}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewInitialAction(null);
        }}
        initialExportAction={previewInitialAction}
      />


    </div>
  );
}
