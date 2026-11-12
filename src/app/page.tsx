'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useOfferStore } from '@/store/useOfferStore';
import { calculateOffer } from '@/lib/pricingEngine';
import { generateBulgarianOfferPdf } from '@/lib/pdfGenerator';
import { StudioHeader } from '@/components/ui/StudioHeader/StudioHeader';
import { OfferFormPanel } from '@/components/ui/OfferFormPanel/OfferFormPanel';
import { BulgarianPdfPreview } from '@/components/ui/BulgarianPdfPreview/BulgarianPdfPreview';
import { PricingSettingsModal } from '@/components/ui/PricingSettingsModal/PricingSettingsModal';
import { SavedOffersDrawer } from '@/components/ui/SavedOffersDrawer/SavedOffersDrawer';
import { PwaInstallBanner } from '@/components/ui/PwaInstallBanner/PwaInstallBanner';

export default function HomePage() {
  const {
    form,
    pricingConfig,
    savedOffers,
    setLang,
    selectCatalogModel,
    updateForm,
    resetNewOffer,
    updatePricingConfig,
    resetPricingConfig,
    saveCurrentOffer,
    loadOfferForRevision,
    deleteSavedOffer,
    exportBackupJson,
    importBackupJson,
  } = useOfferStore();

  const [hydrated, setHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const calc = useMemo(
    () => calculateOffer(form, pricingConfig),
    [form, pricingConfig]
  );
  const lang = form.lang || 'bg';

  const handleSaveOffer = () => {
    const saved = saveCurrentOffer();
    showToast(
      'success',
      lang === 'bg'
        ? `Оферта № ${saved.form.offerNo} (${saved.form.clientName}) е запазена.`
        : `Offer No. ${saved.form.offerNo} (${saved.form.clientName}) saved.`
    );
  };

  const handleNewOffer = () => {
    resetNewOffer();
    showToast(
      'success',
      lang === 'bg'
        ? 'Създаден е нов формуляр с автоматичен номер на оферта.'
        : 'Created new offer form with automatic offer number.'
    );
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateBulgarianOfferPdf(form, calc);
      showToast(
        'success',
        lang === 'bg'
          ? `4-страничната PDF оферта (№ ${form.offerNo}) е изтеглена.`
          : `4-page PDF offer (No. ${form.offerNo}) downloaded.`
      );
    } catch (err) {
      console.error('PDF generation failed:', err);
      showToast(
        'error',
        lang === 'bg'
          ? 'Възникна грешка при генериране на PDF документа.'
          : 'An error occurred while generating the PDF document.'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-zinc-300">
            Flexi Home ОФЕРТА Studio...
          </span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-x-hidden">
      <PwaInstallBanner lang={lang} />
      <StudioHeader
        lang={lang}
        offerNo={form.offerNo}
        savedCount={savedOffers.length}
        isGeneratingPdf={isGeneratingPdf}
        darkMode={darkMode}
        onSetLang={setLang}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onNewOffer={handleNewOffer}
        onSaveOffer={handleSaveOffer}
        onDownloadPdf={handleDownloadPdf}
        onOpenPricingModal={() => setIsPricingOpen(true)}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-700'
              : 'bg-rose-950 text-rose-100 border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Split-Screen Studio Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:overflow-hidden">
        {/* Left Panel: Bilingual (BG / EN) Offer Builder Form */}
        <div className="lg:col-span-5 xl:col-span-5 lg:h-full lg:overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 p-4 sm:p-5">
          <OfferFormPanel
            form={form}
            pricingConfig={pricingConfig}
            calc={calc}
            onUpdateForm={updateForm}
            onSelectCatalogModel={selectCatalogModel}
            onOpenPricingModal={() => setIsPricingOpen(true)}
          />
        </div>

        {/* Right Panel: Live 4-Page A4 Preview */}
        <div className="lg:col-span-7 xl:col-span-7 lg:h-full lg:overflow-hidden">
          <BulgarianPdfPreview form={form} calc={calc} />
        </div>
      </main>

      {/* Modals & Drawers */}
      <PricingSettingsModal
        lang={lang}
        isOpen={isPricingOpen}
        pricing={pricingConfig}
        onClose={() => setIsPricingOpen(false)}
        onSavePricing={(next) => {
          updatePricingConfig(next);
          showToast(
            'success',
            lang === 'bg'
              ? 'Тарифите са обновени успешно.'
              : 'Unit pricing rates updated successfully.'
          );
        }}
        onResetDefaults={() => {
          resetPricingConfig();
          showToast(
            'success',
            lang === 'bg'
              ? 'Възстановени са стандартните тарифи на flexi-home.eu.'
              : 'Restored default flexi-home.eu unit rates.'
          );
        }}
      />

      <SavedOffersDrawer
        lang={lang}
        isOpen={isSavedDrawerOpen}
        savedOffers={savedOffers}
        onClose={() => setIsSavedDrawerOpen(false)}
        onLoadOffer={(id, asCopy) => {
          loadOfferForRevision(id, asCopy);
          showToast(
            'success',
            asCopy
              ? lang === 'bg'
                ? 'Офертата е копирана с нов автоматичен номер за ревизия.'
                : 'Offer duplicated with a new automatic offer number for revision.'
              : lang === 'bg'
              ? 'Офертата е заредена в студиото.'
              : 'Offer loaded into the studio.'
          );
        }}
        onDeleteOffer={(id) => {
          deleteSavedOffer(id);
          showToast(
            'success',
            lang === 'bg'
              ? 'Офертата е изтрита от архива.'
              : 'Offer deleted from archive.'
          );
        }}
        onExportJson={exportBackupJson}
        onImportJson={importBackupJson}
      />
    </div>
  );
}
