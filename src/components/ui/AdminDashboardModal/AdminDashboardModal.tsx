'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Crown,
  Users,
  FileSpreadsheet,
  Hash,
  Search,
  Plus,
  Edit3,
  Trash2,
  FolderOpen,
  Copy,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserCheck,
  UserX,
  Download,
  Upload,
} from 'lucide-react';
import { AppLang, SavedOffer, UserProfile, UserRole } from '@/types/offer';
import { SYSTEM_META, TURNKEY_META } from '@/lib/constants';
import {
  formatEur,
  getOfferSequenceValue,
  setOfferSequenceValue,
} from '@/lib/pricingEngine';
import { formatBgDate } from '@/lib/pdfGenerator';

export interface AdminDashboardModalProps {
  lang: AppLang;
  isOpen: boolean;
  users: UserProfile[];
  savedOffers: SavedOffer[];
  currentOfferNo: string;
  onClose: () => void;
  onAddOrUpdateUser: (
    user: Omit<UserProfile, 'id' | 'createdAt'> & { id?: string }
  ) => { ok: boolean; errorBg?: string; errorEn?: string };
  onDeleteUser: (id: string) => void;
  onToggleUserActive: (id: string) => void;
  onLoadOffer: (id: string, asCopy?: boolean) => void;
  onDeleteOffer: (id: string) => void;
  onSyncCurrentOfferNo: (nextOfferNo: string) => void;
  onExportJson: () => string;
  onImportJson: (raw: string) => { ok: boolean; message: string };
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  lang,
  isOpen,
  users,
  savedOffers,
  onClose,
  onAddOrUpdateUser,
  onDeleteUser,
  onToggleUserActive,
  onLoadOffer,
  onDeleteOffer,
  onSyncCurrentOfferNo,
  onExportJson,
  onImportJson,
}) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'users' | 'numbering'>(
    'offers'
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User Form State
  const [editingUserId, setEditingUserId] = useState<string | undefined>(
    undefined
  );
  const [userName, setUserName] = useState<string>('');
  const [userPin, setUserPin] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('agent');
  const [userActive, setUserActive] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sequential Counter State
  const [seqInput, setSeqInput] = useState<number>(() =>
    getOfferSequenceValue()
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredOffers = useMemo(() => {
    return savedOffers.filter((o) => {
      if (selectedAgentId !== 'all' && o.createdByUserId !== selectedAgentId) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.form.clientName.toLowerCase().includes(q) ||
        o.form.offerNo.toLowerCase().includes(q) ||
        o.form.location.toLowerCase().includes(q) ||
        (o.createdByName || '').toLowerCase().includes(q)
      );
    });
  }, [savedOffers, selectedAgentId, searchQuery]);

  const totalVolumeEur = useMemo(
    () => filteredOffers.reduce((acc, o) => acc + (o.summary.grandTotal || 0), 0),
    [filteredOffers]
  );

  const totalContractEur = useMemo(
    () =>
      filteredOffers.reduce(
        (acc, o) => acc + (o.summary.structureTotal || 0),
        0
      ),
    [filteredOffers]
  );

  if (!isOpen) return null;

  const startEditUser = (u: UserProfile) => {
    setEditingUserId(u.id);
    setUserName(u.name);
    setUserPin(u.pin);
    setUserPhone(u.phone || '');
    setUserRole(u.role);
    setUserActive(u.active);
    setFeedback(null);
  };

  const resetUserForm = () => {
    setEditingUserId(undefined);
    setUserName('');
    setUserPin('');
    setUserPhone('');
    setUserRole('agent');
    setUserActive(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onAddOrUpdateUser({
      id: editingUserId,
      name: userName,
      pin: userPin,
      phone: userPhone,
      role: userRole,
      active: userActive,
    });
    if (!res.ok) {
      setFeedback({
        type: 'error',
        message:
          lang === 'en'
            ? res.errorEn || 'Error saving user'
            : res.errorBg || 'Грешка при запис',
      });
      return;
    }
    setFeedback({
      type: 'success',
      message:
        lang === 'en'
          ? 'User profile & PIN saved successfully!'
          : 'Профилът и PIN кодът са запазени успешно!',
    });
    resetUserForm();
  };

  const handleUpdateSequence = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = setOfferSequenceValue(seqInput);
    onSyncCurrentOfferNo(formatted);
    setFeedback({
      type: 'success',
      message:
        lang === 'en'
          ? `Sequential counter updated! Current Offer No: ${formatted}`
          : `Броячът за номерация е обновен! Текущ № на оферта: ${formatted}`,
    });
  };

  const handleDownloadBackup = () => {
    const json = onExportJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `flexi-home-admin-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
      aria-label={
        lang === 'bg'
          ? 'Административен панел — Всички оферти и Профили'
          : 'Admin Control Center — All Offers & Profiles'
      }
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/75 backdrop-blur-sm"
    >
      <div className="w-full max-w-5xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {lang === 'bg'
                  ? 'Админ Панел — Управление на Екип, PIN Кодове и Всички Оферти'
                  : 'Admin Panel — Team Profiles, PIN Codes & All Quotes'}
              </h2>
              <p className="text-xs text-indigo-100">
                {lang === 'bg'
                  ? 'Пълен контрол върху офертите на всички агенти, правата за достъп и автоматичната номерация'
                  : 'Full visibility into all agent quotes, PIN credentials, and sequential offer numbering'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'bg' ? 'Затвори админ панела' : 'Close admin panel'}
            className="p-1.5 rounded-lg hover:bg-white/15 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('offers');
              setFeedback(null);
            }}
            aria-label="Tab All Offers"
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition cursor-pointer ${
              activeTab === 'offers'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              {lang === 'bg'
                ? `Всички оферти (${savedOffers.length})`
                : `All Team Quotes (${savedOffers.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('users');
              setFeedback(null);
            }}
            aria-label="Tab Team Profiles"
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {lang === 'bg'
                ? `Профили и PIN кодове (${users.length})`
                : `Profiles & PIN Codes (${users.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('numbering');
              setSeqInput(getOfferSequenceValue());
              setFeedback(null);
            }}
            aria-label="Tab Offer Numbering"
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition cursor-pointer ${
              activeTab === 'numbering'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>
              {lang === 'bg'
                ? 'Номерация на оферти & Архив'
                : 'Sequential Numbering & Backup'}
            </span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-zinc-900 dark:text-zinc-100">
          {/* ============================================================== */}
          {/* TAB 1: ALL TEAM OFFERS                                         */}
          {/* ============================================================== */}
          {activeTab === 'offers' && (
            <div className="space-y-5">
              {/* KPI Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50">
                  <span className="text-[11px] font-semibold text-zinc-500 block">
                    {lang === 'bg' ? 'Общ брой оферти' : 'Total Filtered Quotes'}
                  </span>
                  <span className="text-xl font-black text-zinc-900 dark:text-white mt-0.5 block">
                    {filteredOffers.length}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30">
                  <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block">
                    {lang === 'bg'
                      ? 'Общо Договорна стойност (До тапа)'
                      : 'Total Structure Contract Value'}
                  </span>
                  <span className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5 block">
                    {formatEur(totalContractEur)}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30">
                  <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                    {lang === 'bg'
                      ? 'Общ обем на проектите (С До ключ + Фундамент)'
                      : 'Total Grand Project Volume'}
                  </span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                    {formatEur(totalVolumeEur)}
                  </span>
                </div>
              </div>

              {/* Filter Bar: By Agent + Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedAgentId('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      selectedAgentId === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {lang === 'bg' ? 'Всички профили' : 'All Profiles'} (
                    {savedOffers.length})
                  </button>
                  {users.map((u) => {
                    const count = savedOffers.filter(
                      (o) => o.createdByUserId === u.id
                    ).length;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedAgentId(u.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          selectedAgentId === u.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        {u.role === 'admin' ? '👑 ' : '👤 '}
                        {u.name} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'bg'
                        ? 'Търси по № оферта, клиент, град или агент...'
                        : 'Search by Offer No, client, city or agent...'
                    }
                    aria-label="Search team offers"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
              </div>

              {/* Offers Table / Cards */}
              {filteredOffers.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500">
                  {lang === 'bg'
                    ? 'Няма намерени оферти за избрания филтър.'
                    : 'No quotes found for the selected filter.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredOffers.map((item) => {
                    const sys = SYSTEM_META[item.form.system] ?? SYSTEM_META.press_standard;
                    const tk = TURNKEY_META[item.form.turnkeyPackage] ?? TURNKEY_META.none;
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:border-indigo-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded font-mono font-black bg-indigo-600 text-white text-[11px]">
                              № {item.form.offerNo}
                            </span>
                            <span className="px-2 py-0.5 rounded font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-[11px]">
                              {item.createdByRole === 'admin' ? '👑 ' : '👤 '}
                              {item.createdByName || 'Сюлейман Исмаил'}
                            </span>
                            {item.isCustomPrice && (
                              <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300 text-[10px]">
                                {lang === 'bg'
                                  ? '⚡ Индивидуална цена'
                                  : '⚡ Custom Price'}
                              </span>
                            )}
                            <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                              {item.form.clientName ||
                                (lang === 'bg'
                                  ? 'Клиент без име'
                                  : 'Unnamed Client')}
                            </span>
                            {item.form.clientPhone && (
                              <span className="text-zinc-500">
                                ({item.form.clientPhone})
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center gap-2">
                            <span>📍 {item.form.location || '—'}</span>
                            <span>•</span>
                            <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                              {sys.name[lang]}
                            </span>
                            <span>•</span>
                            <span className="font-bold">
                              {item.form.areaRzp} m² ({item.form.floors}{' '}
                              {lang === 'bg' ? 'ет.' : 'fl.'})
                            </span>
                            {item.form.turnkeyPackage !== 'none' && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                  + До ключ ({tk.docName[lang]})
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span>📅 {formatBgDate(item.form.date, lang)}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-400 block">
                              {lang === 'bg'
                                ? `Договорна: ${formatEur(
                                    item.summary.structureTotal
                                  )}`
                                : `Contract: ${formatEur(
                                    item.summary.structureTotal
                                  )}`}
                            </span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                              {formatEur(item.summary.grandTotal)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onLoadOffer(item.id, false);
                                onClose();
                              }}
                              aria-label={`Admin Open ${item.form.offerNo}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              {lang === 'bg' ? 'Отвори' : 'Open'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onLoadOffer(item.id, true);
                                onClose();
                              }}
                              aria-label={`Admin Revise ${item.form.offerNo}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {lang === 'bg' ? 'Ревизия' : 'Revise'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteOffer(item.id)}
                              aria-label={`Admin Delete ${item.form.offerNo}`}
                              className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: TEAM PROFILES & PIN CODES                               */}
          {/* ============================================================== */}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Add / Edit User Form */}
              <form
                onSubmit={handleSaveUser}
                className="lg:col-span-5 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 space-y-4 h-fit"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    {editingUserId
                      ? lang === 'bg'
                        ? 'Редактиране на профил и PIN'
                        : 'Edit User Profile & PIN'
                      : lang === 'bg'
                      ? 'Добави нов профил с PIN код'
                      : 'Add New Profile with PIN'}
                  </h3>
                  {editingUserId && (
                    <button
                      type="button"
                      onClick={resetUserForm}
                      className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800"
                    >
                      {lang === 'bg' ? 'Нов профил' : 'New Profile'}
                    </button>
                  )}
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    {lang === 'bg'
                      ? 'Име на представителя / агента'
                      : 'Representative / Agent Name'}
                  </label>
                  <input
                    type="text"
                    required
                    aria-label="User Profile Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={
                      lang === 'bg' ? 'напр. Мехмед / Георги' : 'e.g. Georgi / Hasan'
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    {lang === 'bg'
                      ? '6-цифрен PIN код за вход'
                      : '6-Digit Login PIN Code'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    aria-label="User Profile PIN"
                    value={userPin}
                    onChange={(e) =>
                      setUserPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="напр. 333333"
                    className="w-full px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 font-mono text-sm font-black tracking-widest text-indigo-700 dark:text-indigo-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">
                      {lang === 'bg' ? 'Роля и права' : 'Role & Access'}
                    </label>
                    <select
                      aria-label="User Profile Role"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold"
                    >
                      <option value="agent">
                        {lang === 'bg'
                          ? '👤 Търговски агент (Само свои оферти)'
                          : '👤 Sales Agent (Own quotes only)'}
                      </option>
                      <option value="admin">
                        {lang === 'bg'
                          ? '👑 Администратор (Вижда всички)'
                          : '👑 Administrator (Sees all)'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      {lang === 'bg' ? 'Телефон (по избор)' : 'Phone (optional)'}
                    </label>
                    <input
                      type="text"
                      aria-label="User Profile Phone"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+359 888 ..."
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  aria-label="Save User Profile"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {editingUserId
                    ? lang === 'bg'
                      ? 'Запази промените по профила'
                      : 'Update Profile & PIN'
                    : lang === 'bg'
                    ? 'Създай профил с PIN'
                    : 'Create Profile with PIN'}
                </button>
              </form>

              {/* Right: Existing Profiles List */}
              <div className="lg:col-span-7 space-y-3">
                {users.map((u) => {
                  const userOffers = savedOffers.filter(
                    (o) => o.createdByUserId === u.id
                  );
                  const userVol = userOffers.reduce(
                    (acc, o) => acc + (o.summary.grandTotal || 0),
                    0
                  );
                  return (
                    <div
                      key={u.id}
                      className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        u.active
                          ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60'
                          : 'border-rose-200 bg-rose-50/30 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                            {u.role === 'admin' ? '👑 ' : '👤 '}
                            {u.name}
                          </span>
                          <span className="px-2 py-0.5 rounded font-mono font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            PIN: {u.pin}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.active
                              ? lang === 'bg'
                                ? 'Активен'
                                : 'Active'
                              : lang === 'bg'
                              ? 'Блокиран'
                              : 'Blocked'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {u.role === 'admin'
                            ? lang === 'bg'
                              ? 'Администратор — Вижда всички оферти и управлява профилите'
                              : 'Administrator — Full access to all quotes & profiles'
                            : lang === 'bg'
                            ? 'Търговски агент — Вижда само своите оферти, може да въвежда индивидуални цени'
                            : 'Sales Agent — Sees own quotes only, can enter custom prices'}{' '}
                          • <strong>{userOffers.length}</strong>{' '}
                          {lang === 'bg' ? 'оферти' : 'quotes'} (
                          {formatEur(userVol)})
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditUser(u)}
                          aria-label={`Edit user ${u.name}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          {lang === 'bg' ? 'PIN / Редакция' : 'Edit PIN'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleUserActive(u.id)}
                          aria-label={`Toggle active ${u.name}`}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                          title={
                            u.active
                              ? lang === 'bg'
                                ? 'Блокирай достъпа'
                                : 'Block access'
                              : lang === 'bg'
                              ? 'Активирай достъпа'
                              : 'Activate access'
                          }
                        >
                          {u.active ? (
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <UserX className="w-4 h-4 text-rose-600" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u.id)}
                          aria-label={`Delete user ${u.name}`}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: SEQUENTIAL OFFER NUMBERING & BACKUP                     */}
          {/* ============================================================== */}
          {activeTab === 'numbering' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form
                onSubmit={handleUpdateSequence}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 space-y-4"
              >
                <h3 className="text-sm font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  {lang === 'bg'
                    ? 'Автоматичен пореден номер на оферта (26-XXXX)'
                    : 'Automatic Sequential Offer Counter (26-XXXX)'}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lang === 'bg'
                    ? 'Системата генерира номерата на офертите автоматично и последователно (напр. 26-0101, 26-0102, 26-0103). Потребителите не могат да пишат произволни номера. Оттук можете да зададете началния/текущия пореден номер:'
                    : 'The system assigns offer numbers automatically in strict sequence (e.g. 26-0101, 26-0102, 26-0103). Agents cannot type arbitrary numbers. Set the current sequence number below:'}
                </p>

                <div>
                  <label className="block font-bold mb-1">
                    {lang === 'bg'
                      ? 'Текущ пореден номер (число, напр. 101 → 26-0101)'
                      : 'Current Sequence Counter (e.g. 101 → 26-0101)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    aria-label="Sequence Counter Input"
                    value={seqInput}
                    onChange={(e) => setSeqInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-sm font-black"
                  />
                </div>

                <button
                  type="submit"
                  aria-label="Save Sequence Counter"
                  className="px-4 py-2 rounded-xl font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition cursor-pointer"
                >
                  {lang === 'bg'
                    ? 'Задай поредния номер'
                    : 'Update Sequential Counter'}
                </button>
              </form>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 space-y-4">
                <h3 className="text-sm font-extrabold text-indigo-700 dark:text-indigo-400">
                  {lang === 'bg'
                    ? 'Пълен архив на системата (Оферти + Профили + Тарифи)'
                    : 'Full System Backup (All Quotes + Profiles + Rates)'}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lang === 'bg'
                    ? 'Изтеглете JSON файл с всички оферти на екипа, всички PIN кодове и текущия брояч за номерация, или възстановете данни от друго устройство.'
                    : 'Download a complete JSON backup containing all team quotes, user PIN profiles, and the sequential counter, or restore from another device.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    aria-label="Admin Export JSON"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-indigo-600" />
                    {lang === 'bg'
                      ? 'Експорт на пълен JSON архив'
                      : 'Export Full JSON Backup'}
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Admin Import JSON"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    {lang === 'bg'
                      ? 'Импорт / Обединяване от JSON'
                      : 'Import / Restore JSON'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    onChange={handleFileChange}
                    aria-label="Admin JSON File Upload"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
