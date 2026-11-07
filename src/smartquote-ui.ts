import {
  PRICE_LIST,
  PRICE_VERSION_LINE,
  PROPERTY_SIZE_PROFILES,
  SERVICE_DESCRIPTIONS,
  formatPrice,
  formatFromPrice,
  type CleaningServiceKey,
  type AddonKey,
} from "./config/pricing.ts";
import {
  buildQuote,
  recommendService,
  buildQuoteWhatsAppUrl,
  CONDITION_DESCRIPTIONS,
  type QuoteInput,
  type QuoteResult,
  type BedroomSelection,
  type AreaSelection,
  type ConditionFlagKey,
  type RecommenderAnswers,
} from "./lib/quote.ts";
import {
  saveQuoteRecord,
  validateQuoteSubmission,
  checkQuoteRateLimit,
  listSavedQuotes,
  approveQuoteChangeLog,
  QUOTE_CONSENT_TEXT,
  type SavedQuoteRecord,
} from "./lib/quotes-store.ts";

const COUNTABLE_ADDONS: Set<AddonKey> = new Set([
  "ovenInterior",
  "fridgeInterior",
  "balconyWash",
  "rubbishTrip",
]);

const SINGLE_UNIT_ADDONS: AddonKey[] = [
  "ovenInterior",
  "fridgeInterior",
  "balconyWash",
  "compoundWash",
  "windowTracks",
  "rubbishTrip",
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Generates a branded printable PDF view in a dedicated print window using
 * Civitas green (#075545) and orange (#E4693F).
 */
export function downloadQuotePdf(
  quote: QuoteResult,
  input: QuoteInput,
  savedRecord?: SavedQuoteRecord | null
): void {
  const printWin = window.open("", "_blank", "width=840,height=960");
  if (!printWin) {
    window.print();
    return;
  }

  const linesHtml = quote.lines
    .map(
      (line) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;">${escapeHtml(line.label)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;text-align:center;">${line.quantity} (${escapeHtml(line.unit)})</td>
        <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;text-align:right;">${formatPrice(line.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;">${line.isStartingPrice ? "From " : ""}${formatPrice(line.amount)}</td>
      </tr>
    `
    )
    .join("");

  const includedHtml = quote.includedScope
    .map((item) => `<li style="margin-bottom:4px;">&#10003; ${escapeHtml(item)}</li>`)
    .join("");

  const excludedHtml = quote.exclusions
    .map((item) => `<li style="margin-bottom:4px;">&ndash; ${escapeHtml(item)}</li>`)
    .join("");

  const reasonsHtml =
    quote.reasons.length > 0
      ? `<div style="background:#FFF7F3;border-left:4px solid #E4693F;padding:12px 16px;margin:16px 0;border-radius:4px;">
          <strong style="color:#9A3412;display:block;margin-bottom:6px;">Items Subject to Confirmation:</strong>
          <ul style="margin:0;padding-left:18px;color:#7C2D12;font-size:13px;">
            ${quote.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
          </ul>
          <p style="margin:8px 0 0;font-size:12px;color:#7C2D12;">A team member will confirm the final price in writing within one business day.</p>
        </div>`
      : "";

  const changeLog = savedRecord?.change_log || quote.changeLog;
  const changeLogHtml = changeLog
    ? `<div style="background:#FEF3C7;border:1px solid #F59E0B;padding:12px 16px;margin:16px 0;border-radius:6px;">
        <strong style="color:#92400E;">Confirmed Price Change Log:</strong>
        <p style="margin:6px 0;font-size:13px;">Original Instant Quote: <strong>${formatPrice(changeLog.previousTotal)}</strong> &rarr; Confirmed Price: <strong>${formatPrice(changeLog.confirmedTotal)}</strong></p>
        <p style="margin:4px 0;font-size:13px;">Reason: ${escapeHtml(changeLog.reason)}</p>
        <p style="margin:4px 0 0;font-size:12px;">Customer Approval Status: <strong>${changeLog.customerApproved ? "Approved by Customer" : "Awaiting Customer Written Approval"}</strong></p>
      </div>`
    : "";

  printWin.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Civitas Quote ${escapeHtml(quote.reference)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1E293B; margin: 0; padding: 32px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #075545; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { color: #075545; font-size: 22px; font-weight: 800; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #fff; background: ${quote.status === "instant" ? "#075545" : "#E4693F"}; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th { background: #075545; color: #fff; text-align: left; padding: 10px 12px; }
    .total-row td { font-size: 18px; font-weight: 800; color: #075545; border-top: 2px solid #075545; padding: 12px; }
    .scope-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; font-size: 13px; }
    .box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 14px; }
    .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #CBD5E1; font-size: 12px; color: #64748B; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Civitas Estate &amp; Maintenance</div>
      <div style="font-size:13px;color:#475569;">Accra &amp; Tema, Ghana &bull; WhatsApp: +233 (0) 20 952 7426 &bull; admin@civitasestate.com</div>
    </div>
    <div style="text-align:right;">
      <span class="badge">${escapeHtml(quote.statusBadge)}</span>
      <div style="margin-top:8px;font-size:14px;"><strong>Ref:</strong> ${escapeHtml(quote.reference)}</div>
      <div style="font-size:12px;color:#475569;">Issued: ${escapeHtml(quote.issueDate)} &bull; Valid until: ${escapeHtml(quote.validUntil)} (14 days)</div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;background:#F1F5F9;padding:12px 16px;border-radius:6px;font-size:13px;margin-bottom:16px;">
    <div><strong>Customer:</strong> ${escapeHtml(input.customerName || "Valued Customer")} ${input.customerPhone ? `(${escapeHtml(input.customerPhone)})` : ""}</div>
    <div><strong>Location:</strong> ${escapeHtml(input.suburb ? `${input.suburb}, ` : "")}${escapeHtml(input.area.toUpperCase())}</div>
    <div><strong>Preferred Date:</strong> ${escapeHtml(input.preferredDate || "To be scheduled")}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center;">Qty / Unit</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${linesHtml}
      <tr class="total-row">
        <td colspan="3">Total Quoted (${escapeHtml(quote.currency)})</td>
        <td style="text-align:right;">${quote.isStartingTotal ? "From " : ""}${formatPrice(quote.total)}</td>
      </tr>
    </tbody>
  </table>

  <p style="font-size:13px;color:#334155;margin:6px 0;"><strong>Why this price:</strong> ${escapeHtml(quote.whyThisPrice)}</p>
  <p style="font-size:13px;color:#075545;font-weight:600;margin:6px 0;"><strong>Fairness guarantee:</strong> ${escapeHtml(quote.fairnessNote)}</p>

  ${reasonsHtml}
  ${changeLogHtml}

  <div class="scope-grid">
    <div class="box">
      <strong style="color:#075545;display:block;margin-bottom:8px;">What is included (${escapeHtml(quote.serviceLabel)})</strong>
      <ul style="list-style:none;padding:0;margin:0;">${includedHtml}</ul>
    </div>
    <div class="box">
      <strong style="color:#E4693F;display:block;margin-bottom:8px;">What is not included</strong>
      <ul style="list-style:none;padding:0;margin:0;">${excludedHtml}</ul>
    </div>
  </div>

  <div class="box" style="margin-top:16px;font-size:13px;">
    <strong>Payment Terms:</strong> ${escapeHtml(quote.paymentTermsText)}
  </div>

  <div class="footer">
    <span>${escapeHtml(PRICE_VERSION_LINE)}</span>
    <span>www.civitasestate.com/get-a-quote</span>
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`);
  printWin.document.close();
}

/**
 * Mounts the interactive Smart Quote application into the given container.
 */
export function mountSmartQuoteApp(container: HTMLElement): void {
  const urlParams = new URLSearchParams(window.location.search);
  const prefillService = urlParams.get("service") as CleaningServiceKey | null;
  const prefillBedrooms = urlParams.get("bedrooms") as BedroomSelection | null;
  const lookupRef = urlParams.get("ref");

  let isNotSureMode = false;
  const recommenderState: RecommenderAnswers = {
    lastCleaned: "1-to-3-months",
    visibleBuildUp: "no",
    occupancyTransition: "staying",
  };

  const initialBed: BedroomSelection =
    prefillBedrooms && ["1", "2", "3", "4+"].includes(prefillBedrooms)
      ? prefillBedrooms
      : "2";
  const initialBathrooms =
    initialBed === "4+" ? 4 : PROPERTY_SIZE_PROFILES[initialBed].bathrooms;

  const state: QuoteInput = {
    service:
      prefillService && prefillService in PRICE_LIST.cleaning
        ? prefillService
        : "standard",
    bedrooms: initialBed,
    bathrooms: initialBathrooms,
    matchesSizeProfile: true,
    addons: {},
    conditions: {},
    area: "accra",
    suburb: "",
    preferredDate: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    photoName: "",
    consentGiven: false,
    issueDate: PRICE_LIST.date,
  };

  let savedLookupRecord: SavedQuoteRecord | null = null;
  if (lookupRef) {
    const found = listSavedQuotes().find((q) => q.reference === lookupRef);
    if (found) {
      savedLookupRecord = found;
      Object.assign(state, found.inputs);
      state.customerName = found.customer_contact.name;
      state.customerPhone = found.customer_contact.phone;
      state.customerEmail = found.customer_contact.email || "";
      state.consentGiven = found.customer_contact.consentGiven;
    }
  }

  let currentStep = 1;
  let feedbackMsg =
    prefillService && prefillService in PRICE_LIST.cleaning
      ? `Pre-selected: ${PRICE_LIST.cleaning[prefillService].label} (${initialBed === "4+" ? "4+ bedrooms" : PROPERTY_SIZE_PROFILES[initialBed].label}) — review your itemised quote on the right or customize any step below.`
      : "";
  let feedbackType: "info" | "error" | "success" = "info";

  const render = () => {
    const quote = buildQuote(state, PRICE_LIST);
    const recommendation = recommendService(recommenderState);
    const tierKey = state.bedrooms === "4+" ? "3" : state.bedrooms;
    const sizeProfile = PROPERTY_SIZE_PROFILES[tierKey];

    // Check if there is an updated saved record for this quote reference
    const latestSaved =
      listSavedQuotes().find((q) => q.reference === quote.reference) ||
      savedLookupRecord;
    const activeChangeLog = latestSaved?.change_log || quote.changeLog;

    const serviceCardsHtml = (
      ["standard", "apartmentReady", "moveInOut", "deep"] as CleaningServiceKey[]
    )
      .map((key) => {
        const s = PRICE_LIST.cleaning[key];
        const isSelected = !isNotSureMode && state.service === key;
        return `
          <button type="button" class="sq2-choice-card ${isSelected ? "selected" : ""}" data-select-service="${key}" aria-pressed="${isSelected}">
            <div class="sq2-choice-top">
              <span class="sq2-choice-title">${s.label}</span>
              <span class="sq2-choice-price">${formatFromPrice(s["1"])}</span>
            </div>
            <p class="sq2-choice-desc">${SERVICE_DESCRIPTIONS[key]}</p>
          </button>
        `;
      })
      .join("");

    const addonsHtml = SINGLE_UNIT_ADDONS.map((key) => {
      const addon = PRICE_LIST.addons[key];
      const count = state.addons?.[key] || 0;
      const isChecked = count > 0;
      const isCountable = COUNTABLE_ADDONS.has(key);
      const isIncludedInDeep = key === "windowTracks" && state.service === "deep";

      return `
        <div class="sq2-addon-row ${isChecked ? "selected" : ""} ${isIncludedInDeep ? "included-note" : ""}">
          <label class="sq2-addon-label">
            <input
              type="checkbox"
              data-addon-toggle="${key}"
              ${isChecked ? "checked" : ""}
              ${isIncludedInDeep ? "disabled" : ""}
            />
            <span class="sq2-addon-text">
              <strong>${addon.label}</strong>
              <small>${
                isIncludedInDeep
                  ? "Already included in Deep clean scope"
                  : `${formatPrice(addon.price)} (${addon.unit})`
              }</small>
            </span>
          </label>
          ${
            isCountable && isChecked && !isIncludedInDeep
              ? `
              <div class="sq2-qty-stepper" aria-label="Quantity for ${addon.label}">
                <button type="button" class="sq2-qty-btn" data-addon-dec="${key}" aria-label="Decrease ${addon.label}">&minus;</button>
                <span class="sq2-qty-val">${count}</span>
                <button type="button" class="sq2-qty-btn" data-addon-inc="${key}" aria-label="Increase ${addon.label}">+</button>
              </div>
            `
              : `<span class="sq2-addon-badge">${isIncludedInDeep ? "Included" : `+${formatPrice(addon.price)}`}</span>`
          }
        </div>
      `;
    }).join("");

    const conditionsHtml = (
      Object.keys(CONDITION_DESCRIPTIONS) as ConditionFlagKey[]
    )
      .map((key) => {
        const item = CONDITION_DESCRIPTIONS[key];
        const checked = Boolean(state.conditions?.[key]);
        return `
          <label class="sq2-condition-row ${checked ? "selected" : ""}">
            <input type="checkbox" data-condition-toggle="${key}" ${checked ? "checked" : ""} />
            <div>
              <strong>${item.label}</strong>
              <small>${item.reason}</small>
            </div>
          </label>
        `;
      })
      .join("");

    const quoteLinesHtml = quote.lines
      .map(
        (line) => `
        <li class="sq2-line-item">
          <div class="sq2-line-label">
            <span>${escapeHtml(line.label)}</span>
            ${line.quantity > 1 ? `<small>${line.quantity} &times; ${formatPrice(line.unitPrice)} (${escapeHtml(line.unit)})</small>` : `<small>${escapeHtml(line.unit)}</small>`}
          </div>
          <div class="sq2-line-amount">
            ${line.isStartingPrice ? "From " : ""}${formatPrice(line.amount)}
          </div>
        </li>
      `
      )
      .join("");

    const changeLogBannerHtml = activeChangeLog
      ? `
        <div class="sq2-changelog-box" role="region" aria-label="Confirmed price update">
          <h4>Confirmed Price Change Log</h4>
          <div class="sq2-changelog-grid">
            <div>
              <span class="sq2-cl-label">Original Instant Quote</span>
              <strong class="sq2-cl-old">${formatPrice(activeChangeLog.previousTotal)}</strong>
            </div>
            <div class="sq2-cl-arrow" aria-hidden="true">&rarr;</div>
            <div>
              <span class="sq2-cl-label">Confirmed Final Price</span>
              <strong class="sq2-cl-new">${formatPrice(activeChangeLog.confirmedTotal)}</strong>
            </div>
          </div>
          <p class="sq2-cl-reason"><strong>Reason for change:</strong> ${escapeHtml(activeChangeLog.reason)}</p>
          ${
            activeChangeLog.customerApproved
              ? `<div class="sq2-cl-approved">&#10003; You have approved this confirmed price.</div>`
              : `<button type="button" class="btn btn-primary btn-sm" id="sq2ApproveChangeBtn" data-ref="${escapeHtml(quote.reference)}">Approve Confirmed Price (${formatPrice(activeChangeLog.confirmedTotal)})</button>`
          }
        </div>
      `
      : "";

    const progressPct = Math.min(100, Math.max(20, currentStep * 20));

    container.innerHTML = `
      <div class="sq2-wrapper">
        <!-- Left Column: 5-Step Customer Configurator -->
        <div class="sq2-form-panel">
          <div class="sq2-progress-header">
            <nav class="sq2-step-tabs" aria-label="Quote Builder Steps">
              ${[
                { n: 1, num: "01", label: "Service" },
                { n: 2, num: "02", label: "Property" },
                { n: 3, num: "03", label: "Add-ons" },
                { n: 4, num: "04", label: "Conditions" },
                { n: 5, num: "05", label: "Confirm" },
              ]
                .map(
                  (s) => `
                <button
                  type="button"
                  class="sq2-step-tab ${currentStep === s.n ? "active" : ""} ${currentStep > s.n ? "done" : ""}"
                  data-goto-step="${s.n}"
                  aria-current="${currentStep === s.n ? "step" : "false"}"
                >
                  <span class="sq2-tab-num">${currentStep > s.n ? "&#10003;" : s.num}</span>
                  <span class="sq2-tab-label">${s.label}</span>
                </button>
              `
                )
                .join("")}
            </nav>
            <div class="sq2-progress-rail" aria-hidden="true">
              <div class="sq2-progress-fill" style="width: ${progressPct}%;"></div>
            </div>
          </div>

          <!-- STEP 1: SERVICE -->
          <section class="sq2-step-section ${currentStep === 1 ? "active" : ""}" aria-labelledby="sq2Step1Heading">
            <div class="sq2-step-title-group">
              <span class="sq2-step-kicker">Step 01 of 05 &bull; Cleaning Scope</span>
              <h3 id="sq2Step1Heading">Choose your cleaning service</h3>
              <p class="sq2-step-help">Every price follows a clear written scope. Not sure which tier fits? Select "Not sure — help me choose".</p>
            </div>

            <div class="sq2-choices-grid">
              ${serviceCardsHtml}
              <button
                type="button"
                class="sq2-choice-card sq2-notsure-card ${isNotSureMode ? "selected" : ""}"
                id="sq2NotSureBtn"
                aria-pressed="${isNotSureMode}"
              >
                <div class="sq2-choice-top">
                  <span class="sq2-choice-title">Not sure — help me choose</span>
                  <span class="sq2-choice-badge">3 quick questions</span>
                </div>
                <p class="sq2-choice-desc">Answer 3 short questions about your property and we will recommend the right scope.</p>
              </button>
            </div>

            ${
              isNotSureMode
                ? `
              <div class="sq2-recommender-box" role="region" aria-label="Service Recommender">
                <h4>Let’s find the right service in 3 questions</h4>

                <div class="sq2-field-group">
                  <label for="sq2RecLastCleaned">1. When was the property last thoroughly cleaned?</label>
                  <select id="sq2RecLastCleaned" class="sq2-input">
                    <option value="within-2-weeks" ${recommenderState.lastCleaned === "within-2-weeks" ? "selected" : ""}>Within the last 2 weeks</option>
                    <option value="1-to-3-months" ${recommenderState.lastCleaned === "1-to-3-months" ? "selected" : ""}>1 to 3 months ago</option>
                    <option value="over-3-months" ${recommenderState.lastCleaned === "over-3-months" ? "selected" : ""}>More than 3 months ago</option>
                  </select>
                </div>

                <div class="sq2-field-group">
                  <label for="sq2RecBuildUp">2. Is there visible grease, limescale, mould, or construction dust?</label>
                  <select id="sq2RecBuildUp" class="sq2-input">
                    <option value="no" ${recommenderState.visibleBuildUp === "no" ? "selected" : ""}>No — normal household dust only</option>
                    <option value="yes" ${recommenderState.visibleBuildUp === "yes" ? "selected" : ""}>Yes — visible grease, scale, mould, or dust</option>
                  </select>
                </div>

                <div class="sq2-field-group">
                  <label for="sq2RecMoving">3. Are you moving in or out?</label>
                  <select id="sq2RecMoving" class="sq2-input">
                    <option value="staying" ${recommenderState.occupancyTransition === "staying" ? "selected" : ""}>No — staying in the home</option>
                    <option value="short-stay-turnover" ${recommenderState.occupancyTransition === "short-stay-turnover" ? "selected" : ""}>Preparing for a guest / short-let turnaround</option>
                    <option value="moving" ${recommenderState.occupancyTransition === "moving" ? "selected" : ""}>Yes — moving in or moving out</option>
                  </select>
                </div>

                <div class="sq2-rec-result">
                  <div>
                    <span class="sq2-rec-tag">Recommended Service</span>
                    <h5>${recommendation.label}</h5>
                    <p>${recommendation.reason}</p>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" id="sq2AcceptRecBtn" data-rec-service="${recommendation.service}">
                    Use ${recommendation.label}
                  </button>
                </div>
                <p class="sq2-override-hint">You can accept this recommendation or click any service card above to override it.</p>
              </div>
            `
                : ""
            }
          </section>

          <!-- STEP 2: PROPERTY -->
          <section class="sq2-step-section ${currentStep === 2 ? "active" : ""}" aria-labelledby="sq2Step2Heading">
            <div class="sq2-step-title-group">
              <span class="sq2-step-kicker">Step 02 of 05 &bull; Property Profile</span>
              <h3 id="sq2Step2Heading">Property size &amp; bathrooms</h3>
              <p class="sq2-step-help">Select your bedroom count and total bathrooms.</p>
            </div>

            <div class="sq2-field-group">
              <span class="sq2-label" id="sq2BedroomsLabel">Number of bedrooms</span>
              <div class="sq2-pill-row" role="group" aria-labelledby="sq2BedroomsLabel">
                ${(["1", "2", "3", "4+"] as BedroomSelection[])
                  .map(
                    (b) => `
                  <button
                    type="button"
                    class="sq2-pill-btn ${state.bedrooms === b ? "active" : ""}"
                    data-select-bedrooms="${b}"
                    aria-pressed="${state.bedrooms === b}"
                  >
                    ${b === "4+" ? "4 or more" : `${b} Bedroom${b === "1" ? "" : "s"}`}
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div class="sq2-field-group">
              <span class="sq2-label" id="sq2BathroomsLabel">Number of bathrooms</span>
              <div class="sq2-pill-row" role="group" aria-labelledby="sq2BathroomsLabel">
                ${[1, 2, 3, 4, 5]
                  .map(
                    (num) => `
                  <button
                    type="button"
                    class="sq2-pill-btn ${state.bathrooms === num ? "active" : ""}"
                    data-select-bathrooms="${num}"
                    aria-pressed="${state.bathrooms === num}"
                  >
                    ${num}${num === 5 ? "+" : ""} Bathroom${num === 1 ? "" : "s"}
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div class="sq2-profile-check-box">
              <div class="sq2-profile-summary">
                <strong>Standard ${state.bedrooms === "4+" ? "3-bedroom base" : sizeProfile.label} profile assumed:</strong>
                <span>${sizeProfile.summary}.</span>
              </div>
              ${
                quote.extraBathroomsAutoAdded > 0
                  ? `<div class="sq2-auto-bath-notice" role="status">
                      &#8505; Your selection includes <strong>${quote.extraBathroomsAutoAdded} extra bathroom(s)</strong> beyond the ${sizeProfile.bathrooms}-bathroom standard profile. <em>${PRICE_LIST.addons.extraBathroomDeep.label}</em> (${formatPrice(PRICE_LIST.addons.extraBathroomDeep.price)} each) has been added as its own itemised line.
                    </div>`
                  : ""
              }
              <label class="sq2-checkbox-row" style="margin-top:0.75rem;">
                <input
                  type="checkbox"
                  id="sq2MatchesProfileCheck"
                  ${state.matchesSizeProfile !== false ? "checked" : ""}
                />
                <span>My property matches this room profile (no extra kitchens, halls, or living rooms beyond the above).</span>
              </label>
            </div>
          </section>

          <!-- STEP 3: ADD-ONS -->
          <section class="sq2-step-section ${currentStep === 3 ? "active" : ""}" aria-labelledby="sq2Step3Heading">
            <div class="sq2-step-title-group">
              <span class="sq2-step-kicker">Step 03 of 05 &bull; Custom Scope</span>
              <h3 id="sq2Step3Heading">Optional add-ons</h3>
              <p class="sq2-step-help">Tick any extra items you want included in your written scope. Adjust quantities where needed.</p>
            </div>
            <div class="sq2-addons-list">
              ${addonsHtml}
            </div>
          </section>

          <!-- STEP 4: CONDITIONS -->
          <section class="sq2-step-section ${currentStep === 4 ? "active" : ""}" aria-labelledby="sq2Step4Heading">
            <div class="sq2-step-title-group">
              <span class="sq2-step-kicker">Step 04 of 05 &bull; Transparency Check</span>
              <h3 id="sq2Step4Heading">Site conditions</h3>
              <p class="sq2-step-help">
                Do any of the following apply? <strong>These do not change your price silently.</strong> If any is ticked, your quote is marked "Needs confirmation" and we tell you clearly which item may affect the final quote and why.
              </p>
            </div>
            <div class="sq2-conditions-list">
              ${conditionsHtml}
            </div>
          </section>

          <!-- STEP 5: LOCATION, DATE & CONTACT -->
          <section class="sq2-step-section ${currentStep === 5 ? "active" : ""}" aria-labelledby="sq2Step5Heading">
            <div class="sq2-step-title-group">
              <span class="sq2-step-kicker">Step 05 of 05 &bull; Schedule &amp; Lock</span>
              <h3 id="sq2Step5Heading">Location, preferred date &amp; contact</h3>
              <p class="sq2-step-help">Local transport within Accra and Tema is included in our cleaning prices.</p>
            </div>

            <div class="sq2-field-group">
              <label for="sq2AreaSelect">Area</label>
              <select id="sq2AreaSelect" class="sq2-input">
                <option value="accra" ${state.area === "accra" ? "selected" : ""}>Accra (Standard coverage — transport included)</option>
                <option value="tema" ${state.area === "tema" ? "selected" : ""}>Tema (Standard coverage — transport included)</option>
                <option value="other" ${state.area === "other" ? "selected" : ""}>Other area outside Accra / Tema (We will confirm availability)</option>
              </select>
              ${
                state.area === "other"
                  ? `<div class="sq2-area-note" role="status">We will confirm availability for locations outside Accra and Tema within one business day.</div>`
                  : ""
              }
            </div>

            <div class="sq2-grid-2">
              <div class="sq2-field-group">
                <label for="sq2SuburbInput">Neighborhood / Suburb</label>
                <input
                  type="text"
                  id="sq2SuburbInput"
                  class="sq2-input"
                  placeholder="e.g. East Legon, Cantonments, Comm. 25"
                  value="${escapeHtml(state.suburb || "")}"
                />
              </div>
              <div class="sq2-field-group">
                <label for="sq2DateInput">Preferred Date</label>
                <input
                  type="date"
                  id="sq2DateInput"
                  class="sq2-input"
                  value="${escapeHtml(state.preferredDate || "")}"
                />
              </div>
            </div>

            <div class="sq2-grid-2">
              <div class="sq2-field-group">
                <label for="sq2NameInput">Your Name *</label>
                <input
                  type="text"
                  id="sq2NameInput"
                  class="sq2-input"
                  placeholder="e.g. Kwame Boateng"
                  value="${escapeHtml(state.customerName || "")}"
                  required
                />
              </div>
              <div class="sq2-field-group">
                <label for="sq2PhoneInput">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  id="sq2PhoneInput"
                  class="sq2-input"
                  placeholder="e.g. +233 20 952 7426"
                  value="${escapeHtml(state.customerPhone || "")}"
                  required
                />
              </div>
            </div>

            <div class="sq2-grid-2">
              <div class="sq2-field-group">
                <label for="sq2EmailInput">Email Address (optional, for email copy)</label>
                <input
                  type="email"
                  id="sq2EmailInput"
                  class="sq2-input"
                  placeholder="you@example.com"
                  value="${escapeHtml(state.customerEmail || "")}"
                />
              </div>
              <div class="sq2-field-group">
                <label for="sq2PhotoInput">Optional Photo Upload (condition/rooms)</label>
                <input
                  type="file"
                  id="sq2PhotoInput"
                  class="sq2-input"
                  accept="image/*"
                />
                ${state.photoName ? `<small class="sq2-photo-attached">Attached: ${escapeHtml(state.photoName)}</small>` : ""}
              </div>
            </div>

            <label class="sq2-checkbox-row sq2-consent-box">
              <input
                type="checkbox"
                id="sq2ConsentCheck"
                ${state.consentGiven ? "checked" : ""}
              />
              <span>${escapeHtml(QUOTE_CONSENT_TEXT)}</span>
            </label>
          </section>

          <!-- Step Navigation Footer -->
          <div class="sq2-step-nav">
            <button
              type="button"
              class="btn btn-secondary"
              id="sq2PrevStepBtn"
              ${currentStep === 1 ? "disabled" : ""}
            >
              &larr; Previous Step
            </button>
            ${
              currentStep < 5
                ? `<button type="button" class="btn btn-primary" id="sq2NextStepBtn">Continue to Step 0${currentStep + 1} &rarr;</button>`
                : `<button type="button" class="btn btn-primary" id="sq2SaveQuoteBtn">Save &amp; Lock 14-Day Quote</button>`
            }
          </div>

          ${
            feedbackMsg
              ? `<div class="sq2-feedback sq2-feedback-${feedbackType}" role="alert">${escapeHtml(feedbackMsg)}</div>`
              : ""
          }
        </div>

        <!-- Right Column: Iconic Architectural Scope & Quote Certificate -->
        <aside class="sq2-quote-card" aria-label="Your Itemised Smart Quote">
          <!-- Obsidian-Emerald & Champagne-Gold Certificate Crest -->
          <div class="sq2-cert-banner">
            <div class="sq2-cert-top-row">
              <div>
                <span class="sq2-cert-kicker">Official Scope Certificate</span>
                <span class="sq2-ref-label">Ref: <strong>${escapeHtml(quote.reference)}</strong></span>
              </div>
              <span class="sq2-status-badge sq2-status-${quote.status}">
                ${escapeHtml(quote.statusBadge)}
              </span>
            </div>

            <div class="sq2-cert-total-row">
              <div>
                <span class="sq2-cert-total-label">Total Quoted (${escapeHtml(quote.currency)})</span>
                <span class="sq2-valid-label">Valid ${PRICE_LIST.policy.quoteValidDays} days &bull; Until ${escapeHtml(quote.validUntil)}</span>
              </div>
              <strong class="sq2-total-amount">
                ${quote.isStartingTotal ? "From " : ""}${formatPrice(quote.total)}
              </strong>
            </div>
          </div>

          <div class="sq2-cert-body">
            ${changeLogBannerHtml}

            <!-- Itemised Lines -->
            <div class="sq2-lines-section">
              <h4>Itemised Price Breakdown</h4>
              <ul class="sq2-lines-list">
                ${quoteLinesHtml}
              </ul>
              <p class="sq2-why-price">${escapeHtml(quote.whyThisPrice)}</p>
            </div>

            <!-- Needs Confirmation Reasons (if any) -->
            ${
              quote.status === "needs_confirmation"
                ? `
                <div class="sq2-confirmation-box" role="status">
                  <strong>Why this quote needs confirmation:</strong>
                  <ul>
                    ${quote.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
                  </ul>
                  <p class="sq2-confirm-promise">${escapeHtml(quote.confirmationPromiseText)}</p>
                </div>
              `
                : `<div class="sq2-instant-note">&#10003; ${escapeHtml(quote.confirmationPromiseText)}</div>`
            }

            <!-- Primary Action Buttons (Always visible above the fold) -->
            <div class="sq2-actions-stack">
              <button type="button" class="btn btn-whatsapp sq2-action-btn sq2-book-btn" id="sq2BookWhatsAppBtn">
                Accept and book via WhatsApp &rarr;
              </button>
              <div class="sq2-secondary-actions">
                <button type="button" class="btn btn-secondary sq2-action-btn" id="sq2DownloadPdfBtn">
                  Download PDF
                </button>
                <button type="button" class="btn btn-secondary sq2-action-btn" id="sq2EmailQuoteBtn">
                  Email me this quote
                </button>
              </div>
            </div>

            <!-- Collapsible Scope & Terms Drawer (keeps certificate compact while preserving 100% transparency) -->
            <details class="sq2-scope-drawer" open>
              <summary class="sq2-scope-drawer-summary">
                <span>Written Scope (${quote.includedScope.length} Included &bull; ${quote.exclusions.length} Excluded) &amp; Terms</span>
                <span class="sq2-drawer-chevron" aria-hidden="true">&#9662;</span>
              </summary>

              <div class="sq2-scope-columns">
                <div class="sq2-scope-col sq2-scope-inc">
                  <h5>What is included (${quote.includedScope.length})</h5>
                  <ul>
                    ${quote.includedScope.map((t) => `<li><span aria-hidden="true">&#10003;</span> ${escapeHtml(t)}</li>`).join("")}
                  </ul>
                </div>
                <div class="sq2-scope-col sq2-scope-exc">
                  <h5>What is not included</h5>
                  <ul>
                    ${quote.exclusions.map((t) => `<li><span aria-hidden="true">&ndash;</span> ${escapeHtml(t)}</li>`).join("")}
                  </ul>
                </div>
              </div>

              <!-- Payment Terms & Fairness Note -->
              <div class="sq2-terms-box">
                <p><strong>Payment terms:</strong> ${escapeHtml(quote.paymentTermsText)}</p>
                <p class="sq2-fairness-note"><strong>Fairness promise:</strong> ${escapeHtml(quote.fairnessNote)}</p>
              </div>
            </details>

            <div class="sq2-version-note">${escapeHtml(PRICE_VERSION_LINE)}</div>
          </div>
        </aside>
      </div>
    `;

    bindEvents(quote);
  };

  const bindEvents = (quote: QuoteResult) => {
    // Step tabs
    container.querySelectorAll<HTMLElement>("[data-goto-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = Number(btn.getAttribute("data-goto-step"));
        if (target >= 1 && target <= 5) {
          currentStep = target;
          feedbackMsg = "";
          render();
        }
      });
    });

    // Prev / Next buttons
    const prevBtn = container.querySelector<HTMLButtonElement>("#sq2PrevStepBtn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentStep > 1) {
          currentStep--;
          feedbackMsg = "";
          render();
        }
      });
    }

    const nextBtn = container.querySelector<HTMLButtonElement>("#sq2NextStepBtn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentStep < 5) {
          currentStep++;
          feedbackMsg = "";
          render();
        }
      });
    }

    // Step 1: Service selection
    container
      .querySelectorAll<HTMLElement>("[data-select-service]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const svc = btn.getAttribute("data-select-service") as CleaningServiceKey;
          if (svc && svc in PRICE_LIST.cleaning) {
            isNotSureMode = false;
            state.service = svc;
            if (svc === "deep" && state.addons?.windowTracks) {
              delete state.addons.windowTracks;
            }
            render();
          }
        });
      });

    const notSureBtn = container.querySelector<HTMLElement>("#sq2NotSureBtn");
    if (notSureBtn) {
      notSureBtn.addEventListener("click", () => {
        isNotSureMode = true;
        const rec = recommendService(recommenderState);
        state.service = rec.service;
        render();
      });
    }

    // Recommender selects
    const lastCleanedEl = container.querySelector<HTMLSelectElement>(
      "#sq2RecLastCleaned"
    );
    if (lastCleanedEl) {
      lastCleanedEl.addEventListener("change", () => {
        recommenderState.lastCleaned =
          lastCleanedEl.value as RecommenderAnswers["lastCleaned"];
        state.service = recommendService(recommenderState).service;
        render();
      });
    }

    const buildUpEl =
      container.querySelector<HTMLSelectElement>("#sq2RecBuildUp");
    if (buildUpEl) {
      buildUpEl.addEventListener("change", () => {
        recommenderState.visibleBuildUp =
          buildUpEl.value as RecommenderAnswers["visibleBuildUp"];
        state.service = recommendService(recommenderState).service;
        render();
      });
    }

    const movingEl =
      container.querySelector<HTMLSelectElement>("#sq2RecMoving");
    if (movingEl) {
      movingEl.addEventListener("change", () => {
        recommenderState.occupancyTransition =
          movingEl.value as RecommenderAnswers["occupancyTransition"];
        state.service = recommendService(recommenderState).service;
        render();
      });
    }

    const acceptRecBtn =
      container.querySelector<HTMLElement>("#sq2AcceptRecBtn");
    if (acceptRecBtn) {
      acceptRecBtn.addEventListener("click", () => {
        const recSvc = acceptRecBtn.getAttribute(
          "data-rec-service"
        ) as CleaningServiceKey;
        if (recSvc) {
          state.service = recSvc;
          isNotSureMode = false;
          currentStep = 2;
          render();
        }
      });
    }

    // Step 2: Bedrooms & Bathrooms
    container
      .querySelectorAll<HTMLElement>("[data-select-bedrooms]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const b = btn.getAttribute("data-select-bedrooms") as BedroomSelection;
          if (b) {
            state.bedrooms = b;
            render();
          }
        });
      });

    container
      .querySelectorAll<HTMLElement>("[data-select-bathrooms]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const count = Number(btn.getAttribute("data-select-bathrooms"));
          if (count >= 1) {
            state.bathrooms = count;
            render();
          }
        });
      });

    const profileCheck = container.querySelector<HTMLInputElement>(
      "#sq2MatchesProfileCheck"
    );
    if (profileCheck) {
      profileCheck.addEventListener("change", () => {
        state.matchesSizeProfile = profileCheck.checked;
        render();
      });
    }

    // Step 3: Add-ons
    container
      .querySelectorAll<HTMLInputElement>("[data-addon-toggle]")
      .forEach((chk) => {
        chk.addEventListener("change", () => {
          const key = chk.getAttribute("data-addon-toggle") as AddonKey;
          if (!key) return;
          state.addons = state.addons || {};
          if (chk.checked) {
            state.addons[key] = 1;
          } else {
            delete state.addons[key];
          }
          render();
        });
      });

    container
      .querySelectorAll<HTMLElement>("[data-addon-inc]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-addon-inc") as AddonKey;
          if (!key) return;
          state.addons = state.addons || {};
          state.addons[key] = Math.min(10, (state.addons[key] || 1) + 1);
          render();
        });
      });

    container
      .querySelectorAll<HTMLElement>("[data-addon-dec]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-addon-dec") as AddonKey;
          if (!key) return;
          state.addons = state.addons || {};
          const next = (state.addons[key] || 1) - 1;
          if (next <= 0) {
            delete state.addons[key];
          } else {
            state.addons[key] = next;
          }
          render();
        });
      });

    // Step 4: Conditions
    container
      .querySelectorAll<HTMLInputElement>("[data-condition-toggle]")
      .forEach((chk) => {
        chk.addEventListener("change", () => {
          const key = chk.getAttribute(
            "data-condition-toggle"
          ) as ConditionFlagKey;
          if (!key) return;
          state.conditions = state.conditions || {};
          state.conditions[key] = chk.checked;
          render();
        });
      });

    // Step 5: Location, Date & Contact
    const areaSelect =
      container.querySelector<HTMLSelectElement>("#sq2AreaSelect");
    if (areaSelect) {
      areaSelect.addEventListener("change", () => {
        state.area = areaSelect.value as AreaSelection;
        render();
      });
    }

    const suburbInput =
      container.querySelector<HTMLInputElement>("#sq2SuburbInput");
    if (suburbInput) {
      suburbInput.addEventListener("input", () => {
        state.suburb = suburbInput.value;
      });
    }

    const dateInput =
      container.querySelector<HTMLInputElement>("#sq2DateInput");
    if (dateInput) {
      dateInput.addEventListener("change", () => {
        state.preferredDate = dateInput.value;
      });
    }

    const nameInput =
      container.querySelector<HTMLInputElement>("#sq2NameInput");
    if (nameInput) {
      nameInput.addEventListener("input", () => {
        state.customerName = nameInput.value;
      });
    }

    const phoneInput =
      container.querySelector<HTMLInputElement>("#sq2PhoneInput");
    if (phoneInput) {
      phoneInput.addEventListener("input", () => {
        state.customerPhone = phoneInput.value;
      });
    }

    const emailInput =
      container.querySelector<HTMLInputElement>("#sq2EmailInput");
    if (emailInput) {
      emailInput.addEventListener("input", () => {
        state.customerEmail = emailInput.value;
      });
    }

    const photoInput =
      container.querySelector<HTMLInputElement>("#sq2PhotoInput");
    if (photoInput) {
      photoInput.addEventListener("change", () => {
        const file = photoInput.files?.[0];
        state.photoName = file ? file.name : "";
        render();
      });
    }

    const consentCheck =
      container.querySelector<HTMLInputElement>("#sq2ConsentCheck");
    if (consentCheck) {
      consentCheck.addEventListener("change", () => {
        state.consentGiven = consentCheck.checked;
      });
    }

    // Approve confirmed price change log
    const approveChangeBtn = container.querySelector<HTMLButtonElement>(
      "#sq2ApproveChangeBtn"
    );
    if (approveChangeBtn) {
      approveChangeBtn.addEventListener("click", () => {
        const ref = approveChangeBtn.getAttribute("data-ref");
        if (ref) {
          approveQuoteChangeLog(ref);
          feedbackType = "success";
          feedbackMsg =
            "Thank you. Your approval of the confirmed price has been recorded.";
          render();
        }
      });
    }

    // Helper to validate & save quote when customer clicks Save/Book/Email
    const tryPersistQuote = async (requireContact: boolean): Promise<boolean> => {
      if (!requireContact && (!state.customerName || !state.customerPhone)) {
        return true;
      }
      const validation = validateQuoteSubmission(state);
      if (!validation.valid) {
        currentStep = 5;
        feedbackType = "error";
        feedbackMsg = validation.errors.join(" ");
        render();
        return false;
      }
      const rateLimit = checkQuoteRateLimit();
      if (!rateLimit.allowed) {
        feedbackType = "error";
        feedbackMsg = `Too many quote requests. Please wait ${rateLimit.retryAfterSeconds} seconds and try again.`;
        render();
        return false;
      }
      await saveQuoteRecord(state, quote);
      return true;
    };

    const saveQuoteBtn =
      container.querySelector<HTMLButtonElement>("#sq2SaveQuoteBtn");
    if (saveQuoteBtn) {
      saveQuoteBtn.addEventListener("click", async () => {
        const ok = await tryPersistQuote(true);
        if (ok) {
          feedbackType = "success";
          feedbackMsg = `Quote ${quote.reference} saved (Price list v${quote.priceListVersion}, valid until ${quote.validUntil}).`;
          render();
        }
      });
    }

    // Action 1: Accept and book via WhatsApp
    const bookWaBtn = container.querySelector<HTMLButtonElement>(
      "#sq2BookWhatsAppBtn"
    );
    if (bookWaBtn) {
      bookWaBtn.addEventListener("click", async () => {
        if (state.customerName && state.customerPhone && state.consentGiven) {
          const check = checkQuoteRateLimit();
          if (check.allowed) {
            await saveQuoteRecord(state, quote);
          }
        }
        const waUrl = buildQuoteWhatsAppUrl(quote, state);
        window.open(waUrl, "_blank", "noopener,noreferrer");
      });
    }

    // Action 2: Download PDF
    const pdfBtn = container.querySelector<HTMLButtonElement>(
      "#sq2DownloadPdfBtn"
    );
    if (pdfBtn) {
      pdfBtn.addEventListener("click", async () => {
        if (state.customerName && state.customerPhone && state.consentGiven) {
          await saveQuoteRecord(state, quote);
        }
        const saved =
          listSavedQuotes().find((q) => q.reference === quote.reference) ||
          savedLookupRecord;
        downloadQuotePdf(quote, state, saved);
      });
    }

    // Action 3: Email me this quote
    const emailBtn = container.querySelector<HTMLButtonElement>(
      "#sq2EmailQuoteBtn"
    );
    if (emailBtn) {
      emailBtn.addEventListener("click", async () => {
        if (state.customerName && state.customerPhone && state.consentGiven) {
          await saveQuoteRecord(state, quote);
        }
        const subject = `Civitas Quote ${quote.reference} — ${quote.serviceLabel} (${quote.isStartingTotal ? "From " : ""}${formatPrice(quote.total)})`;
        const bodyLines = [
          `Civitas Estate & Maintenance — Smart Quote Summary`,
          `Reference: ${quote.reference}`,
          `Issued: ${quote.issueDate} (Valid for 14 days until ${quote.validUntil})`,
          `Status: ${quote.statusBadge}`,
          ``,
          `Itemised Breakdown:`,
          ...quote.lines.map(
            (l) =>
              `- ${l.label} (${l.quantity} x ${formatPrice(l.unitPrice)}): ${l.isStartingPrice ? "From " : ""}${formatPrice(l.amount)}`
          ),
          `Total: ${quote.isStartingTotal ? "From " : ""}${formatPrice(quote.total)}`,
          ``,
          `Why this price: ${quote.whyThisPrice}`,
          `Fairness promise: ${quote.fairnessNote}`,
          `Payment terms: ${quote.paymentTermsText}`,
          quote.reasons.length > 0
            ? `\nItems to confirm:\n- ${quote.reasons.join("\n- ")}`
            : "",
          ``,
          PRICE_VERSION_LINE,
        ]
          .filter(Boolean)
          .join("\n");

        const recipient = state.customerEmail || "admin@civitasestate.com";
        window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;
      });
    }
  };

  render();
}

