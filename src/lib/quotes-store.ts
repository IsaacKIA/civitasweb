import { PRICE_LIST } from "../config/pricing.ts";
import {
  applyQuoteAdjustment,
  type QuoteInput,
  type QuoteResult,
  type QuoteChangeLogEntry,
} from "./quote.ts";

export type SavedQuoteAdminStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "Expired";

export interface SavedQuoteRecord {
  reference: string;
  inputs: QuoteInput;
  price_list_version: string;
  lines: QuoteResult["lines"];
  total: number;
  status: QuoteResult["status"];
  admin_status: SavedQuoteAdminStatus;
  reasons: string[];
  created_at: string;
  valid_until: string;
  customer_contact: {
    name: string;
    phone: string;
    email?: string;
    preferredDate?: string;
    area: string;
    suburb?: string;
    photoName?: string;
    consentGiven: boolean;
    consentText: string;
  };
  change_log?: QuoteChangeLogEntry;
}

export const QUOTE_CONSENT_TEXT =
  "I consent to Civitas Estate & Maintenance storing my contact and property details to prepare, send, and follow up on this quotation in accordance with the Privacy Policy.";

const STORAGE_KEY = "civitas_saved_quotes_v1_2";
const RATE_LIMIT_KEY = "civitas_quote_ratelimit_v1";
const MAX_QUOTES_PER_WINDOW = 10;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates quote submission inputs (no payment details allowed, valid service, bedrooms, bathrooms, contact & consent).
 */
export function validateQuoteSubmission(input: QuoteInput): ValidationResult {
  const errors: string[] = [];

  if (!input.service || !(input.service in PRICE_LIST.cleaning)) {
    errors.push("Please select a valid cleaning service.");
  }

  if (!["1", "2", "3", "4+"].includes(input.bedrooms)) {
    errors.push("Please select a valid bedroom count (1, 2, 3, or 4+).");
  }

  if (
    typeof input.bathrooms !== "number" ||
    !Number.isFinite(input.bathrooms) ||
    input.bathrooms < 1 ||
    input.bathrooms > 20
  ) {
    errors.push("Please enter a valid number of bathrooms (1 to 20).");
  }

  if (!["accra", "tema", "other"].includes(input.area)) {
    errors.push("Please select a valid service area.");
  }

  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.push("Please enter your name (at least 2 characters).");
  }

  if (!input.customerPhone || input.customerPhone.trim().length < 7) {
    errors.push("Please enter a valid phone or WhatsApp number.");
  }

  if (!input.consentGiven) {
    errors.push("Please tick the consent box so we can save and send your quote.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Rate-limits quote submissions to prevent abuse.
 */
export function checkQuoteRateLimit(nowMs: number = Date.now()): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  if (typeof localStorage === "undefined") {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const recent = timestamps.filter((t) => nowMs - t < RATE_WINDOW_MS);
    if (recent.length >= MAX_QUOTES_PER_WINDOW) {
      const oldest = recent[0] || nowMs;
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((RATE_WINDOW_MS - (nowMs - oldest)) / 1000)
      );
      return { allowed: false, retryAfterSeconds };
    }
    recent.push(nowMs);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
    return { allowed: true, retryAfterSeconds: 0 };
  } catch {
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

export function listSavedQuotes(): SavedQuoteRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedQuotes(records: SavedQuoteRecord[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Saves a quote snapshot (including price_list_version) to storage and optionally Supabase if configured.
 * Never stores payment details.
 */
export async function saveQuoteRecord(
  input: QuoteInput,
  quote: QuoteResult
): Promise<SavedQuoteRecord> {
  const record: SavedQuoteRecord = {
    reference: quote.reference,
    inputs: {
      service: input.service,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      matchesSizeProfile: input.matchesSizeProfile ?? true,
      addons: input.addons ?? {},
      conditions: input.conditions ?? {},
      area: input.area,
      suburb: input.suburb ?? "",
      preferredDate: input.preferredDate ?? "",
      issueDate: quote.issueDate,
    },
    price_list_version: quote.priceListVersion,
    lines: quote.lines,
    total: quote.total,
    status: quote.status,
    admin_status: "Pending",
    reasons: quote.reasons,
    created_at: new Date().toISOString(),
    valid_until: quote.validUntil,
    customer_contact: {
      name: (input.customerName || "").trim(),
      phone: (input.customerPhone || "").trim(),
      email: (input.customerEmail || "").trim(),
      preferredDate: input.preferredDate || "",
      area: input.area,
      suburb: (input.suburb || "").trim(),
      photoName: input.photoName || "",
      consentGiven: Boolean(input.consentGiven),
      consentText: QUOTE_CONSENT_TEXT,
    },
    change_log: quote.changeLog,
  };

  const existing = listSavedQuotes();
  const idx = existing.findIndex((q) => q.reference === record.reference);
  if (idx >= 0) {
    existing[idx] = record;
  } else {
    existing.unshift(record);
  }
  writeSavedQuotes(existing);

  // Optional Supabase REST sync if public anon credentials are provided via Vite env
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    const supabaseUrl = env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey && typeof fetch !== "undefined") {
      await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(record),
      });
    }
  } catch {
    // Non-blocking fallback to local storage when offline or Supabase is not configured
  }

  return record;
}

export function updateQuoteAdminStatus(
  reference: string,
  adminStatus: SavedQuoteAdminStatus
): SavedQuoteRecord | null {
  const quotes = listSavedQuotes();
  const idx = quotes.findIndex((q) => q.reference === reference);
  if (idx < 0) return null;
  quotes[idx].admin_status = adminStatus;
  writeSavedQuotes(quotes);
  return quotes[idx];
}

export function adjustSavedQuotePrice(
  reference: string,
  confirmedTotal: number,
  reason: string
): SavedQuoteRecord | null {
  const cleanReason = reason.trim();
  if (!cleanReason) {
    throw new Error("A plain-language reason is required to adjust a quote.");
  }
  if (!Number.isFinite(confirmedTotal) || confirmedTotal <= 0) {
    throw new Error("Confirmed total must be a positive amount.");
  }

  const quotes = listSavedQuotes();
  const idx = quotes.findIndex((q) => q.reference === reference);
  if (idx < 0) return null;

  const current = quotes[idx];
  const originalTotal = current.change_log
    ? current.change_log.previousTotal
    : current.total;

  // Apply adjustment using pure engine helper
  const dummyResult = applyQuoteAdjustment(
    {
      reference: current.reference,
      issueDate: current.inputs.issueDate || PRICE_LIST.date,
      validUntil: current.valid_until,
      priceListVersion: current.price_list_version,
      currency: PRICE_LIST.currency,
      service: current.inputs.service,
      serviceLabel: PRICE_LIST.cleaning[current.inputs.service].label,
      bedrooms: current.inputs.bedrooms,
      bathrooms: current.inputs.bathrooms,
      profileBathroomsIncluded: 1,
      extraBathroomsAutoAdded: 0,
      lines: current.lines,
      total: originalTotal,
      isStartingTotal: current.inputs.bedrooms === "4+",
      status: current.status,
      statusBadge:
        current.status === "instant" ? "Instant quote" : "Needs confirmation",
      reasons: current.reasons,
      depositRequired: originalTotal >= PRICE_LIST.policy.depositThreshold,
      depositRate: PRICE_LIST.policy.depositRate,
      depositThreshold: PRICE_LIST.policy.depositThreshold,
      depositAmount: 0,
      balanceAmount: 0,
      includedScope: [],
      exclusions: [],
      whyThisPrice: "",
      fairnessNote: "",
      paymentTermsText: "",
      confirmationPromiseText: "",
    },
    confirmedTotal,
    cleanReason,
    new Date().toISOString().slice(0, 10)
  );

  current.change_log = dummyResult.changeLog;
  writeSavedQuotes(quotes);
  return current;
}

export function approveQuoteChangeLog(
  reference: string
): SavedQuoteRecord | null {
  const quotes = listSavedQuotes();
  const idx = quotes.findIndex((q) => q.reference === reference);
  if (idx < 0 || !quotes[idx].change_log) return null;
  quotes[idx].change_log!.customerApproved = true;
  quotes[idx].admin_status = "Accepted";
  writeSavedQuotes(quotes);
  return quotes[idx];
}

export interface QuoteMetrics {
  totalQuotes: number;
  acceptedCount: number;
  declinedCount: number;
  expiredCount: number;
  pendingCount: number;
  needsConfirmationCount: number;
  winRatePercent: number;
  averageQuoteValue: number;
}

export function computeQuoteMetrics(
  records: SavedQuoteRecord[] = listSavedQuotes()
): QuoteMetrics {
  const totalQuotes = records.length;
  if (totalQuotes === 0) {
    return {
      totalQuotes: 0,
      acceptedCount: 0,
      declinedCount: 0,
      expiredCount: 0,
      pendingCount: 0,
      needsConfirmationCount: 0,
      winRatePercent: 0,
      averageQuoteValue: 0,
    };
  }

  let acceptedCount = 0;
  let declinedCount = 0;
  let expiredCount = 0;
  let pendingCount = 0;
  let needsConfirmationCount = 0;
  let sumValue = 0;

  for (const r of records) {
    if (r.admin_status === "Accepted") acceptedCount++;
    else if (r.admin_status === "Declined") declinedCount++;
    else if (r.admin_status === "Expired") expiredCount++;
    else pendingCount++;

    if (r.status === "needs_confirmation") needsConfirmationCount++;

    const effectiveTotal = r.change_log
      ? r.change_log.confirmedTotal
      : r.total;
    sumValue += effectiveTotal;
  }

  const decidedCount = acceptedCount + declinedCount;
  const winRatePercent =
    decidedCount > 0
      ? Math.round((acceptedCount / decidedCount) * 100)
      : Math.round((acceptedCount / totalQuotes) * 100);

  return {
    totalQuotes,
    acceptedCount,
    declinedCount,
    expiredCount,
    pendingCount,
    needsConfirmationCount,
    winRatePercent,
    averageQuoteValue: Math.round(sumValue / totalQuotes),
  };
}

