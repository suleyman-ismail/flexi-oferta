'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useOfferStore } from '@/store/useOfferStore';
import { calculateOffer, getOfferSequenceValue, setOfferSequenceValue } from '@/lib/pricingEngine';
import {
  generateBulgarianOfferPdf,
  shareBulgarianOfferPdf,
} from '@/lib/pdfGenerator';
import { StudioHeader } from '@/components/ui/StudioHeader/StudioHeader';
import { OfferFormPanel } from '@/components/ui/OfferFormPanel/OfferFormPanel';
import { BulgarianPdfPreview } from '@/components/ui/BulgarianPdfPreview/BulgarianPdfPreview';
import { PricingSettingsModal } from '@/components/ui/PricingSettingsModal/PricingSettingsModal';
import { SavedOffersDrawer } from '@/components/ui/SavedOffersDrawer/SavedOffersDrawer';
import { PwaInstallBanner } from '@/components/ui/PwaInstallBanner/PwaInstallBanner';
import { PinLoginScreen } from '@/components/ui/PinLoginScreen/PinLoginScreen';
import { AdminDashboardModal } from '@/components/ui/AdminDashboardModal/AdminDashboardModal';
import { parseProfileInviteFromUrl } from '@/lib/profileInvite';
import {
  buildCloudSetupUrl,
  clearSavedFirebaseConfig,
  getActiveFirebaseConfig,
  getEnvFirebaseConfig,
  parseCloudConfigFromUrl,
  parseFirebaseConfigInput,
  saveFirebaseConfig,
} from '@/lib/firebaseConfig';
import {
  CloudSyncStatus,
  claimNextCloudOfferNumber,
  pushFullSnapshotToCloud,
  startCloudSync,
  stopCloudSync,
} from '@/lib/cloudSync';

export default function HomePage() {
  const {
    form,
    pricingConfig,
    savedOffers,
    users,
    currentUserId,
    setLang,
    loginWithPin,
    logout,
    addOrUpdateUser,
    upsertInvitedUser,
    deleteUser,
    toggleUserActive,
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
    applyCloudUsers,
    applyCloudOffers,
    applyCloudPricingConfig,
  } = useOfferStore();

  const [hydrated, setHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharingPdf, setIsSharingPdf] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<string>('');
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>({
    state: 'local',
  });
  const [cloudConfigTick, setCloudConfigTick] = useState(0);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setHydrated(true);
    let urlChanged = false;
    const invited = parseProfileInviteFromUrl(
      window.location.search,
      window.location.hash
    );
    if (invited) {
      upsertInvitedUser(invited);
      urlChanged = true;
      setInviteNotice(
        `Профилът за ${invited.name} е активиран на това устройство! Въведете Вашия 6-цифрен PIN код.`
      );
    }
    const cloudCfg = parseCloudConfigFromUrl(
      window.location.search,
      window.location.hash
    );
    if (cloudCfg) {
      saveFirebaseConfig(cloudCfg);
      urlChanged = true;
      setCloudConfigTick((t) => t + 1);
      setInviteNotice((prev) =>
        prev
          ? `${prev} Облачната синхронизация е активирана.`
          : 'Облачната синхронизация е активирана на това устройство! Въведете Вашия 6-цифрен PIN код.'
      );
    }
    if (urlChanged) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [upsertInvitedUser]);

  useEffect(() => {
    if (!hydrated) return;
    const cfg = getActiveFirebaseConfig();
    if (!cfg) {
      stopCloudSync();
      setCloudStatus({ state: 'local' });
      return;
    }

    let cancelled = false;
    const state = useOfferStore.getState();
    let cleanup: (() => void) | undefined;

    startCloudSync(
      cfg,
      {
        users: state.users,
        savedOffers: state.savedOffers,
        pricingConfig: state.pricingConfig,
        lastOfferSeq: getOfferSequenceValue(),
      },
      {
        onUsers: (remoteUsers) => {
          if (!cancelled) applyCloudUsers(remoteUsers);
        },
        onOffers: (remoteOffers) => {
          if (!cancelled) applyCloudOffers(remoteOffers);
        },
        onPricing: (remotePricing) => {
          if (!cancelled) applyCloudPricingConfig(remotePricing);
        },
        onCounter: (remoteSeq) => {
          if (!cancelled) setOfferSequenceValue(remoteSeq);
        },
        onStatus: (nextStatus) => {
          if (!cancelled) setCloudStatus(nextStatus);
        },
      }
    ).then((fn) => {
      if (cancelled) {
        fn();
      } else {
        cleanup = fn;
      }
    });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
      else stopCloudSync();
    };
  }, [
    hydrated,
    cloudConfigTick,
    applyCloudUsers,
    applyCloudOffers,
    applyCloudPricingConfig,
  ]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId && u.active) || null,
    [users, currentUserId]
  );

  const isAdmin = currentUser?.role === 'admin';

  // Agents see ONLY their own saved offers; Admin sees all offers
  const visibleOffers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return savedOffers;
    return savedOffers.filter((o) => o.createdByUserId === currentUser.id);
  }, [savedOffers, currentUser]);

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
        ? `Оферта № ${saved.form.offerNo} (${saved.form.clientName}) е запазена от ${saved.createdByName}.`
        : `Offer No. ${saved.form.offerNo} (${saved.form.clientName}) saved by ${saved.createdByName}.`
    );
  };

  const handleNewOffer = async () => {
    resetNewOffer();
    if (cloudStatus.state === 'synced') {
      const nextCloudNo = await claimNextCloudOfferNumber();
      if (nextCloudNo) {
        updateForm({ offerNo: nextCloudNo });
      }
    }
    showToast(
      'success',
      lang === 'bg'
        ? 'Създаден е нов формуляр с автоматичен пореден номер.'
        : 'Created new offer form with automatic sequential number.'
    );
  };

  const handleSharePdf = async () => {
    try {
      setIsSharingPdf(true);
      const outcome = await shareBulgarianOfferPdf(form, calc);
      if (outcome === 'shared') {
        showToast(
          'success',
          lang === 'bg'
            ? `PDF офертата (№ ${form.offerNo}) е подготвена за споделяне.`
            : `PDF offer (No. ${form.offerNo}) shared.`
        );
      } else if (outcome === 'downloaded') {
        showToast(
          'success',
          lang === 'bg'
            ? `Браузърът не поддържа директно споделяне — PDF офертата (№ ${form.offerNo}) беше изтеглена.`
            : `Direct file sharing unsupported here — PDF offer (No. ${form.offerNo}) downloaded instead.`
        );
      }
    } catch (err) {
      console.error('PDF share failed:', err);
      showToast(
        'error',
        lang === 'bg'
          ? 'Възникна грешка при споделяне на PDF документа.'
          : 'An error occurred while sharing the PDF document.'
      );
    } finally {
      setIsSharingPdf(false);
    }
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

  // PIN Lock Screen when not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-dvh flex flex-col">
        <PwaInstallBanner lang={lang} />
        <div className="flex-1">
          <PinLoginScreen
            lang={lang}
            noticeMsg={inviteNotice}
            cloudStatus={cloudStatus.state}
            onSetLang={setLang}
            onLoginWithPin={(pin) => {
              const res = loginWithPin(pin);
              if (res.ok && res.user) {
                showToast(
                  'success',
                  lang === 'bg'
                    ? `Добре дошли, ${res.user.name}!`
                    : `Welcome, ${res.user.name}!`
                );
              }
              return res;
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-x-hidden">
      <PwaInstallBanner lang={lang} />
      <StudioHeader
        lang={lang}
        offerNo={form.offerNo}
        savedCount={visibleOffers.length}
        totalTeamOffersCount={savedOffers.length}
        currentUser={currentUser}
        isGeneratingPdf={isGeneratingPdf}
        isSharingPdf={isSharingPdf}
        cloudStatus={cloudStatus.state}
        darkMode={darkMode}
        onSetLang={setLang}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onNewOffer={handleNewOffer}
        onSaveOffer={handleSaveOffer}
        onDownloadPdf={handleDownloadPdf}
        onSharePdf={handleSharePdf}
        onOpenPricingModal={() => setIsPricingOpen(true)}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onOpenAdminModal={() => setIsAdminOpen(true)}
        onLogout={() => {
          setIsAdminOpen(false);
          setIsPricingOpen(false);
          setIsSavedDrawerOpen(false);
          logout();
        }}
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
            isAdmin={isAdmin}
            isSharingPdf={isSharingPdf}
            onUpdateForm={updateForm}
            onSelectCatalogModel={selectCatalogModel}
            onOpenPricingModal={() => setIsPricingOpen(true)}
            onSharePdf={handleSharePdf}
          />
        </div>

        {/* Right Panel: Live 4-Page A4 Preview */}
        <div className="lg:col-span-7 xl:col-span-7 lg:h-full lg:overflow-hidden">
          <BulgarianPdfPreview form={form} calc={calc} />
        </div>
      </main>

      {/* Modals & Drawers */}
      {isAdmin && (
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
      )}

      {isAdmin && (
        <AdminDashboardModal
          lang={lang}
          isOpen={isAdminOpen}
          users={users}
          savedOffers={savedOffers}
          currentOfferNo={form.offerNo}
          cloudStatus={cloudStatus}
          isEnvCloudConfigured={Boolean(getEnvFirebaseConfig())}
          onClose={() => setIsAdminOpen(false)}
          onAddOrUpdateUser={addOrUpdateUser}
          onDeleteUser={deleteUser}
          onToggleUserActive={toggleUserActive}
          onLoadOffer={(id, asCopy) => {
            loadOfferForRevision(id, asCopy);
            showToast(
              'success',
              asCopy
                ? lang === 'bg'
                  ? 'Офертата е копирана с нов пореден номер за ревизия.'
                  : 'Offer duplicated with a new sequential number for revision.'
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
          onSyncCurrentOfferNo={(nextOfferNo) => {
            updateForm({ offerNo: nextOfferNo });
          }}
          onExportJson={exportBackupJson}
          onImportJson={importBackupJson}
          onConnectCloud={(rawConfigInput) => {
            const parsed = parseFirebaseConfigInput(rawConfigInput);
            if (!parsed) {
              return {
                ok: false,
                message:
                  lang === 'bg'
                    ? 'Невалиден Firebase конфиг. Поставете JSON или const firebaseConfig = { apiKey, authDomain, projectId, appId }.'
                    : 'Invalid Firebase config. Paste JSON or const firebaseConfig = { apiKey, authDomain, projectId, appId }.',
              };
            }
            saveFirebaseConfig(parsed);
            setCloudConfigTick((t) => t + 1);
            return {
              ok: true,
              message:
                lang === 'bg'
                  ? `Свързване към Firebase проект "${parsed.projectId}"...`
                  : `Connecting to Firebase project "${parsed.projectId}"...`,
            };
          }}
          onDisconnectCloud={() => {
            clearSavedFirebaseConfig();
            stopCloudSync();
            setCloudStatus({ state: 'local' });
            setCloudConfigTick((t) => t + 1);
          }}
          onSyncCloudNow={async () => {
            const cur = useOfferStore.getState();
            await pushFullSnapshotToCloud({
              users: cur.users,
              savedOffers: cur.savedOffers,
              pricingConfig: cur.pricingConfig,
              lastOfferSeq: getOfferSequenceValue(),
            });
          }}
          onCopyCloudSetupLink={async () => {
            const cfg = getActiveFirebaseConfig();
            if (!cfg) return;
            const url = buildCloudSetupUrl(cfg);
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(url);
            }
          }}
        />
      )}

      <SavedOffersDrawer
        lang={lang}
        isOpen={isSavedDrawerOpen}
        savedOffers={visibleOffers}
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
