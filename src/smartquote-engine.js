/**
 * CIVITAS SMART QUOTE ADAPTER
 * Bridges legacy SmartQuote callers directly to the single source of truth
 * (`src/config/pricing.ts`) and pure fairness engine (`src/lib/quote.ts`).
 * Contains zero internal costs, margins, or hidden multipliers.
 */

import {
  PRICE_LIST,
  PRICE_VERSION_LINE,
  PROPERTY_SIZE_PROFILES,
  SCOPE_MATRIX,
  SERVICE_EXCLUSIONS,
  formatPrice,
  formatFromPrice,
} from './config/pricing.ts';
import {
  buildQuote,
  recommendService,
  buildQuoteWhatsAppUrl,
  CONDITION_DESCRIPTIONS,
} from './lib/quote.ts';

export {
  PRICE_LIST,
  PRICE_VERSION_LINE,
  PROPERTY_SIZE_PROFILES,
  SCOPE_MATRIX,
  SERVICE_EXCLUSIONS,
  formatPrice,
  formatFromPrice,
  buildQuote,
  recommendService,
  buildQuoteWhatsAppUrl,
  CONDITION_DESCRIPTIONS,
};
