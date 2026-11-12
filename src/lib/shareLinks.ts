import type { CalculatedOffer, OfferFormState } from '@/types/offer';
import { formatEur } from './pricingEngine';

/**
 * Normalizes a customer phone number into international digits without leading `+` or `00`.
 * Local Bulgarian numbers starting with `0` (e.g. `0888 123 456`) are converted to `359888123456`.
 * Returns `null` when fewer than 7 digits are present.
 */
export function normalizePhoneForMessenger(
  rawPhone: string,
  defaultCountryCode = '359'
): string | null {
  const trimmed = (rawPhone || '').trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;

  if (trimmed.startsWith('00')) {
    digits = digits.slice(2);
  } else if (!trimmed.startsWith('+') && digits.startsWith('0')) {
    digits = `${defaultCountryCode}${digits.slice(1)}`;
  }

  return digits.length >= 7 ? digits : null;
}

/**
 * Formats a concise Bulgarian or English quote summary suitable for WhatsApp / Viber sharing.
 */
export function buildOfferShareMessage(
  form: OfferFormState,
  calc: CalculatedOffer
): string {
  const isEn = form.lang === 'en';
  const totalDisplay = calc.hasTurnkey || form.includeFoundation
    ? formatEur(calc.grandTotalWithTurnkey)
    : formatEur(calc.contractStructureNet);

  if (isEn) {
    const lines = [
      `Flexi Home | Offer № ${form.offerNo}`,
      form.clientName ? `Client: ${form.clientName}` : null,
      `Model: ${form.modelCodeLabel} (${form.areaRzp} m², ${calc.resolvedLabels.floorsLabel})`,
      `System: ${calc.resolvedLabels.systemName}`,
      `Base Structure: ${formatEur(calc.contractStructureNet)}`,
      calc.hasTurnkey ? `Turnkey (${calc.turnkeyName}): +${formatEur(calc.turnkeyTotal)}` : null,
      form.includeFoundation ? `Foundation (${calc.effectiveFoundationArea} m²): +${formatEur(calc.foundationTotal)}` : null,
      `Total: ${totalDisplay}`,
      `flexi-home.eu`,
    ];
    return lines.filter(Boolean).join('\n');
  }

  const lines = [
    `Flexi Home | Оферта № ${form.offerNo}`,
    form.clientName ? `Клиент: ${form.clientName}` : null,
    `Модел: ${form.modelCodeLabel} (${form.areaRzp} м², ${calc.resolvedLabels.floorsLabel})`,
    `Система: ${calc.resolvedLabels.systemName}`,
    `Груба конструкция („до тапа“): ${formatEur(calc.contractStructureNet)}`,
    calc.hasTurnkey ? `Пакет ${calc.turnkeyName}: +${formatEur(calc.turnkeyTotal)}` : null,
    form.includeFoundation ? `Фундамент (${calc.effectiveFoundationArea} м²): +${formatEur(calc.foundationTotal)}` : null,
    `Обща стойност: ${totalDisplay}`,
    `flexi-home.eu`,
  ];
  return lines.filter(Boolean).join('\n');
}

/**
 * Generates a one-click WhatsApp deep link (`https://wa.me/...`).
 * When no valid customer phone is entered, falls back to `https://wa.me/?text=...` so the user can pick a contact.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizePhoneForMessenger(phone);
  const encoded = encodeURIComponent(message);
  return digits
    ? `https://wa.me/${digits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}

/**
 * Generates a one-click Viber deep link (`viber://chat?number=%2B...&draft=...`).
 * When no valid customer phone is entered, falls back to `viber://forward?text=...`.
 */
export function buildViberUrl(phone: string, message: string): string {
  const digits = normalizePhoneForMessenger(phone);
  const encoded = encodeURIComponent(message);
  return digits
    ? `viber://chat?number=%2B${digits}&draft=${encoded}`
    : `viber://forward?text=${encoded}`;
}
