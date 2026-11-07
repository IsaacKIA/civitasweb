import {
  PRICE_LIST,
  PROPERTY_SIZE_PROFILES,
  SCOPE_MATRIX,
  SERVICE_EXCLUSIONS,
  formatPrice,
  type CleaningServiceKey,
  type BedroomTierKey,
  type AddonKey,
} from "../config/pricing.ts";

export type BedroomSelection = "1" | "2" | "3" | "4+";
export type AreaSelection = "accra" | "tema" | "other";

export type ConditionFlagKey =
  | "stairsWithoutLift"
  | "difficultAccess"
  | "noUtilities"
  | "heavilySoiled"
  | "heavyFurniture";

export interface ConditionFlags {
  stairsWithoutLift?: boolean;
  difficultAccess?: boolean;
  noUtilities?: boolean;
  heavilySoiled?: boolean;
  heavyFurniture?: boolean;
}

export const CONDITION_DESCRIPTIONS: Record<
  ConditionFlagKey,
  { label: string; reason: string }
> = {
  stairsWithoutLift: {
    label: "Stairs without lift (upper floors)",
    reason:
      "Stairs without a lift: carrying equipment and water across multiple flights may require extra team time.",
  },
  difficultAccess: {
    label: "Difficult access or parking",
    reason:
      "Difficult access or parking: long carry distances from the nearest parking point may affect setup time.",
  },
  noUtilities: {
    label: "No water or electricity on site",
    reason:
      "No water or electricity on site: cleaning requires running water and power; we must confirm supply arrangements before work.",
  },
  heavilySoiled: {
    label: "Heavily soiled or post-builders dust",
    reason:
      "Heavily soiled condition: heavy paint, cement, or thick build-up may require specialist products or extra hours.",
  },
  heavyFurniture: {
    label: "Heavy furniture to move",
    reason:
      "Heavy furniture to move: moving large items safely requires extra staff and written agreement on scope.",
  },
};

export interface RecommenderAnswers {
  lastCleaned: "within-2-weeks" | "1-to-3-months" | "over-3-months";
  visibleBuildUp: "yes" | "no";
  occupancyTransition: "moving" | "short-stay-turnover" | "staying";
}

export interface ServiceRecommendation {
  service: CleaningServiceKey;
  label: string;
  reason: string;
}

/**
 * Pure recommendation helper for customers who choose "Not sure".
 */
export function recommendService(
  answers: RecommenderAnswers
): ServiceRecommendation {
  if (answers.occupancyTransition === "moving") {
    if (answers.visibleBuildUp === "yes") {
      return {
        service: "deep",
        label: PRICE_LIST.cleaning.deep.label,
        reason:
          "You are moving in or out and noted visible grease, scale, mould, or dust. A Deep clean includes kitchen degreasing, bathroom descaling, and interior window tracks.",
      };
    }
    return {
      service: "moveInOut",
      label: PRICE_LIST.cleaning.moveInOut.label,
      reason:
        "You are moving in or out of the property. A Move-in / move-out clean includes wiping empty cupboard interiors, skirting boards, and accessible appliance exteriors.",
    };
  }

  if (
    answers.visibleBuildUp === "yes" ||
    answers.lastCleaned === "over-3-months"
  ) {
    return {
      service: "deep",
      label: PRICE_LIST.cleaning.deep.label,
      reason:
        answers.visibleBuildUp === "yes"
          ? "Because there is visible grease, limescale, mould, or construction dust, a Deep clean is needed to properly descale bathrooms, degrease the kitchen, and clean window tracks."
          : "Because it has been over 3 months since the last thorough clean, a Deep clean will reset built-up grime on edges, tiles, switches, and tracks.",
    };
  }

  if (
    answers.occupancyTransition === "short-stay-turnover" ||
    answers.lastCleaned === "1-to-3-months"
  ) {
    return {
      service: "apartmentReady",
      label: PRICE_LIST.cleaning.apartmentReady.label,
      reason:
        answers.occupancyTransition === "short-stay-turnover"
          ? "For guest turnarounds and short-let preparation, Apartment Ready covers standard cleaning plus cabinet fronts, doors, switches, and interior window glass."
          : "Since it was last cleaned 1 to 3 months ago, Apartment Ready adds interior window glass, cabinet fronts, doors, and switches to a standard clean.",
    };
  }

  return {
    service: "standard",
    label: PRICE_LIST.cleaning.standard.label,
    reason:
      "Your home was cleaned recently and has no heavy build-up. A Standard clean covers reachable surfaces, floors, kitchen counters, and bathroom fixtures.",
  };
}

export interface QuoteInput {
  service: CleaningServiceKey;
  bedrooms: BedroomSelection;
  bathrooms: number;
  matchesSizeProfile?: boolean; // defaults to true
  addons?: Partial<Record<AddonKey, number>>;
  conditions?: ConditionFlags;
  area: AreaSelection;
  suburb?: string;
  preferredDate?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  photoName?: string;
  consentGiven?: boolean;
  issueDate?: string; // YYYY-MM-DD, defaults to PRICE_LIST.date for deterministic calculation if omitted
}

export interface QuoteLineItem {
  id: string;
  label: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isStartingPrice?: boolean;
  autoAdded?: boolean;
}

export interface QuoteChangeLogEntry {
  previousTotal: number;
  confirmedTotal: number;
  reason: string;
  updatedAt: string;
  customerApproved: boolean;
}

export interface QuoteResult {
  reference: string;
  issueDate: string;
  validUntil: string;
  priceListVersion: string;
  currency: string;
  service: CleaningServiceKey;
  serviceLabel: string;
  bedrooms: BedroomSelection;
  bathrooms: number;
  profileBathroomsIncluded: number;
  extraBathroomsAutoAdded: number;
  lines: QuoteLineItem[];
  total: number;
  isStartingTotal: boolean;
  status: "instant" | "needs_confirmation";
  statusBadge: "Instant quote" | "Needs confirmation";
  reasons: string[];
  depositRequired: boolean;
  depositRate: number;
  depositThreshold: number;
  depositAmount: number;
  balanceAmount: number;
  includedScope: string[];
  exclusions: readonly string[];
  whyThisPrice: string;
  fairnessNote: string;
  paymentTermsText: string;
  confirmationPromiseText: string;
  changeLog?: QuoteChangeLogEntry;
}

/**
 * Deterministic 4-digit hash from quote inputs so the same inputs on the same day
 * produce a consistent, non-random reference code.
 */
function computeDeterministicSuffix(input: QuoteInput, dateStr: string): string {
  const canonical = JSON.stringify({
    s: input.service,
    b: input.bedrooms,
    ba: input.bathrooms,
    m: input.matchesSizeProfile ?? true,
    a: input.addons ?? {},
    c: input.conditions ?? {},
    ar: input.area,
    d: dateStr,
  });
  let hash = 0;
  for (let i = 0; i < canonical.length; i++) {
    hash = (hash * 31 + canonical.charCodeAt(i)) % 10000;
  }
  return String(Math.abs(hash)).padStart(4, "0");
}

function addDays(isoDate: string, days: number): string {
  const parts = isoDate.split("-").map(Number);
  const year = parts[0] || 2026;
  const month = (parts[1] || 11) - 1;
  const day = parts[2] || 7;
  const dt = new Date(Date.UTC(year, month, day));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/**
 * Pure function buildQuote(input, PRICE_LIST)
 * - Same inputs always give the same price.
 * - No randomness, no hidden multipliers, no surge pricing, no location wealth pricing.
 * - Never shows a price lower than the list price and never adds a line the customer did not see.
 */
export function buildQuote(
  input: QuoteInput,
  priceList: typeof PRICE_LIST = PRICE_LIST
): QuoteResult {
  const serviceConfig = priceList.cleaning[input.service];
  if (!serviceConfig) {
    throw new Error(`Unknown cleaning service: ${String(input.service)}`);
  }

  const issueDate =
    input.issueDate && /^\d{4}-\d{2}-\d{2}$/.test(input.issueDate)
      ? input.issueDate
      : priceList.date;
  const validUntil = addDays(issueDate, priceList.policy.quoteValidDays);

  const lines: QuoteLineItem[] = [];
  const reasons: string[] = [];

  // 1. Base cleaning line
  const isFourPlus = input.bedrooms === "4+";
  const tierKey: BedroomTierKey = isFourPlus ? "3" : input.bedrooms;
  const basePrice = serviceConfig[tierKey];
  const profile = PROPERTY_SIZE_PROFILES[tierKey];

  if (isFourPlus) {
    reasons.push(
      "4 or more bedrooms: properties with 4+ bedrooms require a custom quote. The 3-bedroom rate is shown as a starting minimum."
    );
  }

  if (input.matchesSizeProfile === false) {
    reasons.push(
      `Property layout exceeds standard ${profile.label} profile (${profile.summary}): additional living areas, kitchens, or halls will be confirmed before work.`
    );
  }

  lines.push({
    id: `base-${input.service}-${input.bedrooms}`,
    label: isFourPlus
      ? `${serviceConfig.label} (4+ bedrooms — starting from 3-bedroom rate)`
      : `${serviceConfig.label} (${profile.label})`,
    unit: isFourPlus ? "starting price" : profile.summary,
    quantity: 1,
    unitPrice: basePrice,
    amount: basePrice,
    isStartingPrice: isFourPlus,
  });

  // 2. Automatic extra bathrooms check against size profile
  const requestedBathrooms = Math.max(1, Math.floor(input.bathrooms || 1));
  const profileBathroomsIncluded = profile.bathrooms;
  const autoExtraBathrooms = Math.max(
    0,
    requestedBathrooms - profileBathroomsIncluded
  );

  // Also check if user manually requested extraBathroomDeep in addons
  const manualExtraBathrooms = Math.max(
    0,
    Math.floor(input.addons?.extraBathroomDeep || 0)
  );
  const totalExtraBathrooms = Math.max(
    autoExtraBathrooms,
    manualExtraBathrooms
  );

  if (totalExtraBathrooms > 0) {
    const addonSpec = priceList.addons.extraBathroomDeep;
    lines.push({
      id: "addon-extraBathroomDeep",
      label: `${addonSpec.label} (${requestedBathrooms} bathrooms vs ${profileBathroomsIncluded} in standard ${profile.label} profile)`,
      unit: addonSpec.unit,
      quantity: totalExtraBathrooms,
      unitPrice: addonSpec.price,
      amount: addonSpec.price * totalExtraBathrooms,
      autoAdded: autoExtraBathrooms > 0,
    });
  }

  // 3. Selected add-ons (excluding extraBathroomDeep which is handled above)
  const addonOrder: AddonKey[] = [
    "ovenInterior",
    "fridgeInterior",
    "balconyWash",
    "compoundWash",
    "windowTracks",
    "rubbishTrip",
  ];

  for (const key of addonOrder) {
    const rawCount = input.addons?.[key] || 0;
    const count = Math.max(0, Math.floor(rawCount));
    if (count > 0) {
      const addonSpec = priceList.addons[key];
      lines.push({
        id: `addon-${key}`,
        label: addonSpec.label,
        unit: addonSpec.unit,
        quantity: count,
        unitPrice: addonSpec.price,
        amount: addonSpec.price * count,
      });
    }
  }

  // 4. Condition flags — NEVER change price silently; add explicit reason and mark Needs confirmation
  const conditions = input.conditions || {};
  const conditionKeys = Object.keys(
    CONDITION_DESCRIPTIONS
  ) as ConditionFlagKey[];
  for (const condKey of conditionKeys) {
    if (conditions[condKey]) {
      reasons.push(CONDITION_DESCRIPTIONS[condKey].reason);
    }
  }

  // 5. Location check
  if (input.area === "other") {
    reasons.push(
      "Location outside Accra and Tema: we will confirm availability and any travel arrangement for your area."
    );
  }

  // 6. Total & Deposit
  const total = lines.reduce((sum, item) => sum + item.amount, 0);
  const status: "instant" | "needs_confirmation" =
    reasons.length > 0 ? "needs_confirmation" : "instant";
  const statusBadge =
    status === "instant" ? "Instant quote" : "Needs confirmation";

  const depositRequired = total >= priceList.policy.depositThreshold;
  const depositAmount = depositRequired
    ? Math.round(total * priceList.policy.depositRate)
    : 0;
  const balanceAmount = total - depositAmount;

  const includedScope = SCOPE_MATRIX.filter((row) => row[input.service]).map(
    (row) => row.task
  );
  const exclusions = SERVICE_EXCLUSIONS[input.service];

  const compactDate = issueDate.replace(/-/g, "");
  const suffix = computeDeterministicSuffix(input, issueDate);
  const reference = `CIV-Q-${compactDate}-${suffix}`;

  const paymentTermsText = depositRequired
    ? `30% deposit (${formatPrice(depositAmount)}) to confirm for jobs of ${formatPrice(priceList.policy.depositThreshold)} or more; balance (${formatPrice(balanceAmount)}) on satisfactory completion. Approved mobile money or bank transfer only.`
    : `Full payment (${formatPrice(total)}) on satisfactory completion. (30% deposit applies to jobs of ${formatPrice(priceList.policy.depositThreshold)} or more.) Approved mobile money or bank transfer only.`;

  return {
    reference,
    issueDate,
    validUntil,
    priceListVersion: priceList.version,
    currency: priceList.currency,
    service: input.service,
    serviceLabel: serviceConfig.label,
    bedrooms: input.bedrooms,
    bathrooms: requestedBathrooms,
    profileBathroomsIncluded,
    extraBathroomsAutoAdded: autoExtraBathrooms,
    lines,
    total,
    isStartingTotal: isFourPlus,
    status,
    statusBadge,
    reasons,
    depositRequired,
    depositRate: priceList.policy.depositRate,
    depositThreshold: priceList.policy.depositThreshold,
    depositAmount,
    balanceAmount,
    includedScope,
    exclusions,
    whyThisPrice: "Price is based on your property size and the scope above.",
    fairnessNote:
      "This price is for the scope shown. We will not add charges without your written approval.",
    paymentTermsText,
    confirmationPromiseText:
      status === "needs_confirmation"
        ? "A team member will review the items noted below and confirm your final written price within one business day."
        : "Your quote is ready to book immediately at the price shown.",
  };
}

/**
 * Applies a staff price confirmation / adjustment with a mandatory reason,
 * preserving the original instant quote total for transparency.
 */
export function applyQuoteAdjustment(
  quote: QuoteResult,
  confirmedTotal: number,
  reason: string,
  updatedAt: string = PRICE_LIST.date
): QuoteResult {
  const cleanReason = reason.trim();
  if (!cleanReason) {
    throw new Error(
      "A plain-language reason is required when adjusting a quote."
    );
  }
  return {
    ...quote,
    changeLog: {
      previousTotal: quote.total,
      confirmedTotal,
      reason: cleanReason,
      updatedAt,
      customerApproved: false,
    },
  };
}

/**
 * Builds the pre-filled WhatsApp booking URL for a generated quote.
 */
export function buildQuoteWhatsAppUrl(
  quote: QuoteResult,
  input: Partial<QuoteInput>,
  whatsappNumber = "233209527426"
): string {
  const areaLabel =
    input.area === "accra"
      ? "Accra"
      : input.area === "tema"
        ? "Tema"
        : "Outside Accra/Tema";
  const locText = input.suburb ? `${input.suburb} (${areaLabel})` : areaLabel;
  const totalDisplay = `${ quote.isStartingTotal ? "From " : "" }${formatPrice(quote.total)}`;

  const messageLines = [
    "Hello Civitas Estate & Maintenance,",
    "",
    "I would like to accept and book my Smart Quote:",
    `• Quote Reference: ${quote.reference}`,
    `• Price List Version: ${quote.priceListVersion}`,
    `• Status: ${quote.statusBadge}`,
    `• Service: ${quote.serviceLabel}`,
    `• Property Size: ${quote.bedrooms === "4+" ? "4+ bedrooms" : `${quote.bedrooms}-bedroom`}, ${quote.bathrooms} bathroom(s)`,
    ...quote.lines.map(
      (line) =>
        `  - ${line.label}${line.quantity > 1 ? ` × ${line.quantity}` : ""}: ${line.isStartingPrice ? "From " : ""}${formatPrice(line.amount)}`
    ),
    `• Total Quoted: ${totalDisplay} (Valid until ${quote.validUntil})`,
    `• Location: ${locText}`,
    input.preferredDate ? `• Preferred Date: ${input.preferredDate}` : null,
    input.customerName ? `• Name: ${input.customerName}` : null,
    input.customerPhone ? `• Phone/WhatsApp: ${input.customerPhone}` : null,
    quote.reasons.length > 0
      ? `• Items to confirm: ${quote.reasons.join(" | ")}`
      : null,
    "",
    "Please confirm my booking schedule and payment details.",
  ].filter(Boolean);

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageLines.join("\n"))}`;
}

