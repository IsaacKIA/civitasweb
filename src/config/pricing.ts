export const PRICE_LIST = {
  version: "1.2",
  date: "2026-11-07",
  nextReview: "2027-03-01",
  currency: "GH₵",
  cleaning: {
    standard:       { label: "Standard clean",          "1": 290, "2": 320, "3": 530 },
    apartmentReady: { label: "Apartment Ready",         "1": 290, "2": 350, "3": 540 },
    moveInOut:      { label: "Move-in / move-out clean", "1": 530, "2": 570, "3": 660 },
    deep:           { label: "Deep clean",              "1": 610, "2": 830, "3": 960 },
  },
  // 4+ bedrooms: custom quote only
  addons: {
    extraBathroomDeep: { label: "Extra bathroom, deep level", price: 70, unit: "each" },
    ovenInterior:      { label: "Oven interior", price: 60, unit: "each" },
    fridgeInterior:    { label: "Fridge or freezer interior", price: 40, unit: "each" },
    balconyWash:       { label: "Balcony or patio wash", price: 40, unit: "each" },
    compoundWash:      { label: "Compound sweep and wash", price: 140, unit: "per job" },
    windowTracks:      { label: "Interior window tracks and sills (whole unit)", price: 40, unit: "whole unit" },
    rubbishTrip:       { label: "Rubbish carried to the on-site waste point", price: 30, unit: "per trip" },
  },
  fromPrices: {
    minorRepair: 300,        // one small defined fault; parts quoted separately
    assessment: 250,         // property condition assessment
    careEssential: 400,      // per month
    carePlus: 650,           // per month
    watchMonthly: 350,       // per month
    watchPlus: 450,          // per month
  },
  policy: {
    quoteValidDays: 14,
    depositRate: 0.30,       // proposed, for one-time jobs of GH₵300 or more [needs management confirmation]
    depositThreshold: 300,
  },
} as const;

export type CleaningServiceKey = keyof typeof PRICE_LIST.cleaning;
export type BedroomTierKey = "1" | "2" | "3";
export type AddonKey = keyof typeof PRICE_LIST.addons;
export type FromPriceKey = keyof typeof PRICE_LIST.fromPrices;

export const PRICE_VERSION_LINE = "Price list version 1.2, November 2026. Next review: March 2027.";

export const PROPERTY_SIZE_PROFILES: Record<BedroomTierKey, {
  label: string;
  bedrooms: number;
  bathrooms: number;
  kitchen: number;
  livingDining: number;
  hall: number;
  summary: string;
}> = {
  "1": {
    label: "1-bedroom",
    bedrooms: 1,
    bathrooms: 1,
    kitchen: 1,
    livingDining: 1,
    hall: 1,
    summary: "1 kitchen, 1 bathroom, 1 bedroom, 1 living/dining, 1 hall",
  },
  "2": {
    label: "2-bedroom",
    bedrooms: 2,
    bathrooms: 2,
    kitchen: 1,
    livingDining: 1,
    hall: 1,
    summary: "1 kitchen, 2 bathrooms, 2 bedrooms, 1 living/dining, 1 hall",
  },
  "3": {
    label: "3-bedroom",
    bedrooms: 3,
    bathrooms: 2,
    kitchen: 1,
    livingDining: 2,
    hall: 2,
    summary: "1 kitchen, 2 bathrooms, 3 bedrooms, 2 living/dining, 2 halls",
  },
};

export interface ScopeMatrixRow {
  task: string;
  standard: boolean;
  apartmentReady: boolean;
  moveInOut: boolean;
  deep: boolean;
}

export const SCOPE_MATRIX: readonly ScopeMatrixRow[] = [
  { task: "Dust reachable surfaces", standard: true, apartmentReady: true, moveInOut: true, deep: true },
  { task: "Sweep, vacuum, mop accessible floors", standard: true, apartmentReady: true, moveInOut: true, deep: true },
  { task: "Wipe kitchen counters and sink", standard: true, apartmentReady: true, moveInOut: true, deep: true },
  { task: "Wipe hob, cabinet fronts, splashback", standard: false, apartmentReady: true, moveInOut: true, deep: true },
  { task: "Kitchen degreasing (hob, splashback, extractor exterior)", standard: false, apartmentReady: false, moveInOut: false, deep: true },
  { task: "Empty cupboard interiors wiped", standard: false, apartmentReady: false, moveInOut: true, deep: false },
  { task: "Accessible appliance exteriors wiped", standard: false, apartmentReady: false, moveInOut: true, deep: true },
  { task: "Clean accessible bathroom fixtures", standard: true, apartmentReady: true, moveInOut: true, deep: true },
  { task: "Bathroom descaling (taps, tiles, shower glass)", standard: false, apartmentReady: false, moveInOut: false, deep: true },
  { task: "Wipe doors, switches, door frames", standard: false, apartmentReady: true, moveInOut: true, deep: true },
  { task: "Interior window glass and sills", standard: false, apartmentReady: true, moveInOut: true, deep: true },
  { task: "Interior window tracks", standard: false, apartmentReady: false, moveInOut: false, deep: true },
  { task: "Detailed skirting boards and floor edges", standard: false, apartmentReady: false, moveInOut: true, deep: true },
  { task: "Spot-clean reachable marks", standard: false, apartmentReady: false, moveInOut: true, deep: true },
  { task: "Small bins emptied to on-site waste point", standard: true, apartmentReady: true, moveInOut: true, deep: true },
  { task: "Final checklist and completion review", standard: true, apartmentReady: true, moveInOut: true, deep: true },
] as const;

export const SERVICE_EXCLUSIONS: Record<CleaningServiceKey, readonly string[]> = {
  standard: [
    "Inside appliances and cupboards",
    "Heavy scale or grease",
    "High external windows",
    "Laundry",
    "Moving heavy furniture",
  ],
  apartmentReady: [
    "Heavy stains",
    "Rubbish haulage",
    "Appliance interiors",
    "Deep descaling",
    "Repairs",
    "Pest treatment",
  ],
  moveInOut: [
    "Oven or fridge interior unless added",
    "Paint removal",
    "Major waste disposal",
    "Stain restoration",
  ],
  deep: [
    "High-risk access",
    "Mould remediation",
    "Biohazards",
    "Specialist stone treatment",
    "Full appliance interiors unless added",
  ],
} as const;

export const SERVICE_DESCRIPTIONS: Record<CleaningServiceKey, string> = {
  standard: "Regular upkeep for lived-in homes covering reachable surfaces, accessible floors, kitchen counters, and bathroom fixtures.",
  apartmentReady: "Thorough refresh between guests or short stays, adding doors, switches, cabinet fronts, and interior window glass.",
  moveInOut: "Unoccupied handover clean including inside empty cupboards, appliance exteriors, skirting boards, and reachable wall marks.",
  deep: "Intensive top-to-bottom clean including kitchen degreasing, bathroom descaling, interior window tracks, and detailed edges.",
};

export const HOW_WE_SET_PRICES = {
  heading: "How we set our prices",
  points: [
    "Price follows scope: every price shows clearly what is included and what is not.",
    "No hidden fees: ordinary cleaning supplies, tools, and local transport within Accra and Tema are included in our cleaning prices.",
    "Quarterly price reviews: we review our price list in March, June, September, and December.",
    "30 days' notice: Civitas Care and Property Watch monthly clients receive at least 30 days' written notice before any price change.",
    "14-day quote guarantee: every written quotation is honoured for 14 days from the date it is issued.",
  ],
  propertyWatchNotice: "Property Watch is a scheduled visual check with dated photos and a written report. It is not security, guarding, or continuous monitoring.",
} as const;

/**
 * Formats an amount in GH₵ with thousands separators, e.g. GH₵1,200
 */
export function formatPrice(amount: number): string {
  return `${PRICE_LIST.currency}${amount.toLocaleString("en-US")}`;
}

/**
 * Formats a starting price, e.g. "From GH₵290" or "From GH₵400 per month"
 */
export function formatFromPrice(amount: number, suffix = ""): string {
  return `From ${formatPrice(amount)}${suffix ? ` ${suffix}` : ""}`;
}

/**
 * Returns the included tasks and excluded items for a given cleaning service
 */
export function getServiceScope(serviceKey: CleaningServiceKey): {
  included: string[];
  excluded: readonly string[];
} {
  const included = SCOPE_MATRIX.filter((row) => row[serviceKey]).map((row) => row.task);
  const excluded = SERVICE_EXCLUSIONS[serviceKey];
  return { included, excluded };
}

/**
 * Canonical map of DOM [data-price-token] keys to formatted price strings.
 */
export const PRICE_TOKEN_MAP: Readonly<Record<string, string>> = {
  // Version line
  "version-line": PRICE_VERSION_LINE,
  "version-number": PRICE_LIST.version,

  // Cleaning 1-bed starting prices & size tiers
  "standard-from": formatFromPrice(PRICE_LIST.cleaning.standard["1"]),
  "standard-1": formatPrice(PRICE_LIST.cleaning.standard["1"]),
  "standard-2": formatPrice(PRICE_LIST.cleaning.standard["2"]),
  "standard-3": formatPrice(PRICE_LIST.cleaning.standard["3"]),
  "cleaning.standard.from": formatFromPrice(PRICE_LIST.cleaning.standard["1"]),
  "cleaning.standard.1": formatPrice(PRICE_LIST.cleaning.standard["1"]),
  "cleaning.standard.2": formatPrice(PRICE_LIST.cleaning.standard["2"]),
  "cleaning.standard.3": formatPrice(PRICE_LIST.cleaning.standard["3"]),

  "apartmentReady-from": formatFromPrice(PRICE_LIST.cleaning.apartmentReady["1"]),
  "apartmentReady-1": formatPrice(PRICE_LIST.cleaning.apartmentReady["1"]),
  "apartmentReady-2": formatPrice(PRICE_LIST.cleaning.apartmentReady["2"]),
  "apartmentReady-3": formatPrice(PRICE_LIST.cleaning.apartmentReady["3"]),
  "cleaning.apartmentReady.from": formatFromPrice(PRICE_LIST.cleaning.apartmentReady["1"]),
  "cleaning.apartmentReady.1": formatPrice(PRICE_LIST.cleaning.apartmentReady["1"]),
  "cleaning.apartmentReady.2": formatPrice(PRICE_LIST.cleaning.apartmentReady["2"]),
  "cleaning.apartmentReady.3": formatPrice(PRICE_LIST.cleaning.apartmentReady["3"]),

  "moveInOut-from": formatFromPrice(PRICE_LIST.cleaning.moveInOut["1"]),
  "moveInOut-1": formatPrice(PRICE_LIST.cleaning.moveInOut["1"]),
  "moveInOut-2": formatPrice(PRICE_LIST.cleaning.moveInOut["2"]),
  "moveInOut-3": formatPrice(PRICE_LIST.cleaning.moveInOut["3"]),
  "cleaning.moveInOut.from": formatFromPrice(PRICE_LIST.cleaning.moveInOut["1"]),
  "cleaning.moveInOut.1": formatPrice(PRICE_LIST.cleaning.moveInOut["1"]),
  "cleaning.moveInOut.2": formatPrice(PRICE_LIST.cleaning.moveInOut["2"]),
  "cleaning.moveInOut.3": formatPrice(PRICE_LIST.cleaning.moveInOut["3"]),

  "deep-from": formatFromPrice(PRICE_LIST.cleaning.deep["1"]),
  "deep-1": formatPrice(PRICE_LIST.cleaning.deep["1"]),
  "deep-2": formatPrice(PRICE_LIST.cleaning.deep["2"]),
  "deep-3": formatPrice(PRICE_LIST.cleaning.deep["3"]),
  "cleaning.deep.from": formatFromPrice(PRICE_LIST.cleaning.deep["1"]),
  "cleaning.deep.1": formatPrice(PRICE_LIST.cleaning.deep["1"]),
  "cleaning.deep.2": formatPrice(PRICE_LIST.cleaning.deep["2"]),
  "cleaning.deep.3": formatPrice(PRICE_LIST.cleaning.deep["3"]),

  // Add-ons
  "addon-extraBathroomDeep": formatPrice(PRICE_LIST.addons.extraBathroomDeep.price),
  "addon-ovenInterior": formatPrice(PRICE_LIST.addons.ovenInterior.price),
  "addon-fridgeInterior": formatPrice(PRICE_LIST.addons.fridgeInterior.price),
  "addon-balconyWash": formatPrice(PRICE_LIST.addons.balconyWash.price),
  "addon-compoundWash": formatPrice(PRICE_LIST.addons.compoundWash.price),
  "addon-windowTracks": formatPrice(PRICE_LIST.addons.windowTracks.price),
  "addon-rubbishTrip": formatPrice(PRICE_LIST.addons.rubbishTrip.price),

  // From prices
  "minorRepair-from": formatFromPrice(PRICE_LIST.fromPrices.minorRepair),
  "minorRepair-price": formatPrice(PRICE_LIST.fromPrices.minorRepair),
  "assessment-from": formatFromPrice(PRICE_LIST.fromPrices.assessment),
  "assessment-price": formatPrice(PRICE_LIST.fromPrices.assessment),
  "careEssential-from": formatFromPrice(PRICE_LIST.fromPrices.careEssential, "per month"),
  "careEssential-price": formatFromPrice(PRICE_LIST.fromPrices.careEssential),
  "carePlus-from": formatFromPrice(PRICE_LIST.fromPrices.carePlus, "per month"),
  "carePlus-price": formatFromPrice(PRICE_LIST.fromPrices.carePlus),
  "watchMonthly-from": formatFromPrice(PRICE_LIST.fromPrices.watchMonthly, "per month"),
  "watchMonthly-price": formatFromPrice(PRICE_LIST.fromPrices.watchMonthly),
  "watchPlus-from": formatFromPrice(PRICE_LIST.fromPrices.watchPlus, "per month"),
  "watchPlus-price": formatFromPrice(PRICE_LIST.fromPrices.watchPlus),
  "otherServices.plumbing.from": formatFromPrice(PRICE_LIST.fromPrices.minorRepair),
  "otherServices.electrical.from": formatFromPrice(PRICE_LIST.fromPrices.minorRepair),
  "otherServices.generalMaintenance.from": formatFromPrice(PRICE_LIST.fromPrices.minorRepair),
  "otherServices.painting.from": formatFromPrice(PRICE_LIST.fromPrices.minorRepair),
  "otherServices.propertyWatch.from": formatFromPrice(PRICE_LIST.fromPrices.watchMonthly, "per month"),

  // Policy
  "deposit-threshold": formatPrice(PRICE_LIST.policy.depositThreshold),
  "deposit-percent": `${Math.round(PRICE_LIST.policy.depositRate * 100)}%`,
  "quote-valid-days": String(PRICE_LIST.policy.quoteValidDays),
} as const;

