'use client';

import React, { useRef, useState } from 'react';
import {
  X,
  FolderOpen,
  Copy,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
} from 'lucide-react';
import { AppLang, SavedOffer } from '@/types/offer';
import { SYSTEM_META, TURNKEY_META } from '@/lib/constants';
import { formatEur } from '@/lib/pricingEngine';
import { formatBgDate } from '@/lib/pdfGenerator';

export interface SavedOffersDrawerProps {
  lang: AppLang;
  isOpen: boolean;
  savedOffers: SavedOffer[];
  onClose: () => void;
  onLoadOffer: (id: string, asCopy?: boolean) => void;
  onDeleteOffer: (id: string) => void;
  onExportJson: () => string;
  onImportJson: (raw: string) => { ok: boolean; message: string };
}

export function SavedOffersDrawer({
  lang,
  isOpen,
  savedOffers,
  onClose,
  onLoadOffer,
  onDeleteOffer,
  onExportJson,
  onImportJson,
}: SavedOffersDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const drawerTitle =
    lang === 'bg'
      ? 'Архив на запазени оферти и JSON резервно копие'
      : 'Saved Offers Archive & JSON Backup';
  const drawerSub =
    lang === 'bg'
      ? 'Заредете, копирайте за ревизия с нов автоматичен № или експортирайте в JSON'
      : 'Load, duplicate for revision with a new auto offer No., or export/import JSON';
  const closeLabel = lang === 'bg' ? 'Затвори' : 'Close';
  const exportLabel = lang === 'bg' ? 'JSON Архив' : 'Export JSON';
  const importLabel = lang === 'bg' ? 'JSON Възстановяване' : 'Restore JSON';
  const emptyLabel =
    lang === 'bg' ? 'Все още няма запазени оферти.' : 'No saved offers yet.';
  const openOfferLabel = lang === 'bg' ? 'Отвори' : 'Open';
  const reviseCopyLabel =
    lang === 'bg' ? 'Копирай (Ревизия)' : 'Duplicate (Revise)';
  const deleteOfferLabel = lang === 'bg' ? 'Изтрий' : 'Delete';

  const handleDownloadBackup = () => {
    const json = onExportJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `flexi-home-oferti-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({
      type: 'success',
      message:
        lang === 'bg'
          ? 'JSON архивът е изтеглен успешно.'
          : 'JSON backup downloaded successfully.',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const res = onImportJson(content);
      setFeedback({
        type: res.ok ? 'success' : 'error',
        message: res.message,
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={drawerTitle}
      className="fixed inset-0 z-50 flex justify-end bg-zinc-950/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl h-full bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold">{drawerTitle}</h2>
            <p className="text-xs text-zinc-400">{drawerSub}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backup / Restore Toolbar */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {savedOffers.length}{' '}
            {lang === 'bg' ? 'запазени оферти' : 'saved offers'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              aria-label={exportLabel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              {exportLabel}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={importLabel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              {importLabel}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              aria-label="JSON File Upload"
              className="hidden"
            />
          </div>
        </div>

        {feedback && (
          <div
            className={`mx-6 mt-3 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Saved Offers List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {savedOffers.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                {emptyLabel}
              </p>
            </div>
          ) : (
            savedOffers.map((item) => {
              const sys = SYSTEM_META[item.form.system];
              const tk = TURNKEY_META[item.form.turnkeyPackage];
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:border-indigo-400 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          № {item.form.offerNo}
                        </span>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {item.form.clientName ||
                            (lang === 'bg'
                              ? 'Клиент без име'
                              : 'Unnamed Client')}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.form.location || '—'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatBgDate(item.form.date, lang)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">
                        {lang === 'bg' ? 'Общо проект' : 'Project Total'}
                      </span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {formatEur(item.summary.grandTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold">{sys.name[lang]}</span> •{' '}
                      <span>{item.form.areaRzp} m²</span>
                      {item.form.turnkeyPackage !== 'none' && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-indigo-300 font-semibold text-[11px]">
                          + {tk.docName[lang]}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadOffer(item.id, false);
                          onClose();
                        }}
                        aria-label={`${openOfferLabel} ${item.form.clientName}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        {openOfferLabel}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onLoadOffer(item.id, true);
                          onClose();
                        }}
                        aria-label={`${reviseCopyLabel} ${item.form.clientName}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {reviseCopyLabel}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteOffer(item.id)}
                        aria-label={`${deleteOfferLabel} ${item.form.clientName}`}
                        className="p-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
