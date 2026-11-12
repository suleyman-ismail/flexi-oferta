# Post-Edit Full Verification & Consistency Audit Rule

Whenever any code, pricing, form field, or PDF layout change is made in this project:
1. **End-to-End Consistency Scan:** Check `src/types/offer.ts`, `src/lib/schemas.ts`, `src/lib/constants.ts`, `src/lib/pricingEngine.ts`, `src/components/ui/OfferFormPanel/OfferFormPanel.tsx`, `src/components/ui/BulgarianPdfPreview/BulgarianPdfPreview.tsx`, and `src/lib/pdfGenerator.ts` for any logical contradictions, hardcoded values that contradict user-editable fields, missing `localStorage` fallbacks, or language leaks.
2. **Automated Verification:** Run `npx tsc --noEmit`, `npm test`, and `NEXT_PUBLIC_BASE_PATH=/flexi-oferta npm run build` after the final edit.
3. **Report Issues Immediately:** If any discrepancy or potential edge case is found during the scan, fix it immediately or explicitly notify the user before deploying.
