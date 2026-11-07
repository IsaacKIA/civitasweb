import {
  PRICE_LIST,
  PRICE_VERSION_LINE,
  PRICE_TOKEN_MAP,
  PROPERTY_SIZE_PROFILES,
  SCOPE_MATRIX,
  SERVICE_EXCLUSIONS,
  SERVICE_DESCRIPTIONS,
  HOW_WE_SET_PRICES,
  formatPrice,
  formatFromPrice,
  type CleaningServiceKey,
  type AddonKey,
} from "./config/pricing.ts";

/**
 * Hydrates all [data-price-token] elements in the DOM from PRICE_LIST
 * so no hard-coded GH₵ numbers ever live in HTML files.
 */
export function hydratePriceTokens(): void {
  document.querySelectorAll<HTMLElement>("[data-price-token]").forEach((el) => {
    const key = el.getAttribute("data-price-token");
    if (key && PRICE_TOKEN_MAP[key]) {
      el.textContent = PRICE_TOKEN_MAP[key];
    }
  });

  document
    .querySelectorAll<HTMLElement>("[data-care-plan-tier]")
    .forEach((el) => {
      const tier = el.getAttribute("data-care-plan-tier");
      if (tier === "careEssential") {
        el.setAttribute(
          "data-care-plan",
          `Care Essential (${formatFromPrice(PRICE_LIST.fromPrices.careEssential, "per month")})`
        );
      } else if (tier === "carePlus") {
        el.setAttribute(
          "data-care-plan",
          `Care Plus (${formatFromPrice(PRICE_LIST.fromPrices.carePlus, "per month")})`
        );
      } else if (tier === "watchMonthly") {
        el.setAttribute(
          "data-care-plan",
          `Watch Monthly (${formatFromPrice(PRICE_LIST.fromPrices.watchMonthly, "per month")})`
        );
      } else if (tier === "watchPlus") {
        el.setAttribute(
          "data-care-plan",
          `Watch Plus (${formatFromPrice(PRICE_LIST.fromPrices.watchPlus, "per month")})`
        );
      }
    });
}

/**
 * Renders a calm, editorial Pricing & Scope Sheet:
 * - Cleaning prices by bedroom size
 * - Accessible Scope Matrix table (desktop) + clean collapsible cards (mobile) with exclusions integrated
 * - Add-ons and Care / Property Watch / Repairs side-by-side
 * - Concise "How we set our prices" summary and version line
 */
export function renderFullPricingSection(container: HTMLElement): void {
  const cleaningKeys: CleaningServiceKey[] = [
    "standard",
    "apartmentReady",
    "moveInOut",
    "deep",
  ];
  const addonKeys = Object.keys(PRICE_LIST.addons) as AddonKey[];

  const priceRowsHtml = cleaningKeys
    .map((key) => {
      const s = PRICE_LIST.cleaning[key];
      return `
        <tr>
          <th scope="row" class="civ-price-table-service">
            <div class="civ-service-title">${s.label}</div>
            <div class="civ-service-desc">${SERVICE_DESCRIPTIONS[key]}</div>
          </th>
          <td class="civ-num-cell"><span class="civ-from-prefix">From</span> <strong>${formatPrice(s["1"])}</strong></td>
          <td class="civ-num-cell"><span class="civ-from-prefix">From</span> <strong>${formatPrice(s["2"])}</strong></td>
          <td class="civ-num-cell"><span class="civ-from-prefix">From</span> <strong>${formatPrice(s["3"])}</strong></td>
          <td class="civ-action-cell"><a href="/get-a-quote/?service=${key}" class="civ-table-quote-link">Get quote &rarr;</a></td>
        </tr>
      `;
    })
    .join("");

  const scopeTableRowsHtml = SCOPE_MATRIX.map((row) => {
    const cell = (included: boolean) =>
      included
        ? `<td class="civ-scope-yes" aria-label="Included"><span class="civ-yes-pill" aria-hidden="true">&#10003;</span></td>`
        : `<td class="civ-scope-no" aria-label="Not included"><span aria-hidden="true">&mdash;</span></td>`;
    return `
      <tr>
        <th scope="row">${row.task}</th>
        ${cell(row.standard)}
        ${cell(row.apartmentReady)}
        ${cell(row.moveInOut)}
        ${cell(row.deep)}
      </tr>
    `;
  }).join("");

  const exclusionsRowCellsHtml = cleaningKeys
    .map((key) => {
      const items = SERVICE_EXCLUSIONS[key].join(", ");
      return `<td class="civ-scope-exclusion-cell">${items}.</td>`;
    })
    .join("");

  const mobileCollapsibleScopeHtml = cleaningKeys
    .map((key, index) => {
      const s = PRICE_LIST.cleaning[key];
      const includedTasks = SCOPE_MATRIX.filter((r) => r[key]).map(
        (r) => `<li><span class="civ-check-icon" aria-hidden="true">&#10003;</span> ${r.task}</li>`
      );
      const excludedItems = SERVICE_EXCLUSIONS[key].join(", ");

      return `
        <details class="civ-mobile-scope-card" ${index === 0 ? "open" : ""}>
          <summary class="civ-mobile-scope-summary">
            <div>
              <strong>${s.label}</strong>
              <span class="civ-mobile-from">1-bed ${formatFromPrice(s["1"])} &bull; 2-bed ${formatFromPrice(s["2"])} &bull; 3-bed ${formatFromPrice(s["3"])}</span>
            </div>
            <span class="civ-details-chevron" aria-hidden="true">&#9662;</span>
          </summary>
          <div class="civ-mobile-scope-body">
            <p class="civ-mobile-desc">${SERVICE_DESCRIPTIONS[key]}</p>
            <h5>Included in this tier (${includedTasks.length} tasks)</h5>
            <ul class="civ-scope-list">${includedTasks.join("")}</ul>
            <p class="civ-mobile-exclusion-note"><strong>Not included / quoted extra:</strong> ${excludedItems}.</p>
            <div style="margin-top: 1rem;">
              <a href="/get-a-quote/?service=${key}" class="btn btn-primary btn-sm">Quote ${s.label} &rarr;</a>
            </div>
          </div>
        </details>
      `;
    })
    .join("");

  const addonsRowsHtml = addonKeys
    .map((key) => {
      const a = PRICE_LIST.addons[key];
      return `
        <tr>
          <th scope="row">${a.label}</th>
          <td class="civ-num-cell"><strong>${formatPrice(a.price)}</strong> <span class="civ-unit-muted">/ ${a.unit}</span></td>
        </tr>
      `;
    })
    .join("");

  const howPointsHtml = HOW_WE_SET_PRICES.points
    .map((pt) => `<li>${pt}</li>`)
    .join("");

  container.innerHTML = `
    <div class="civ-pricing-master">
      <div class="civ-pricing-header">
        <span class="eyebrow eyebrow-emerald">Published Price List</span>
        <h2>Clear Scope. Transparent Starting Prices.</h2>
        <p class="lead">
          Price follows scope. Ordinary cleaning supplies, tools, and local transport in Accra and Tema are included in our cleaning prices. All prices below are starting ("from") prices, confirmed in a written quotation.
        </p>
      </div>

      <!-- Part 1: Cleaning Prices by Bedroom Size -->
      <div class="civ-pricing-sheet">
        <div class="civ-sheet-header">
          <div>
            <h3>Cleaning Prices by Property Size</h3>
            <p class="muted">Select any service to calculate an instant, itemised quote for your home. 4+ bedroom homes receive a custom quotation.</p>
          </div>
          <a href="/get-a-quote/" class="btn btn-primary btn-sm">Open Smart Quote &rarr;</a>
        </div>

        <div class="civ-table-scroll" role="region" aria-labelledby="cleaningPriceTableCap" tabindex="0">
          <table class="civ-price-table">
            <caption id="cleaningPriceTableCap" class="sr-only">Cleaning starting prices by service and bedroom size in GH₵</caption>
            <thead>
              <tr>
                <th scope="col">Service &amp; Summary</th>
                <th scope="col">1-Bedroom</th>
                <th scope="col">2-Bedroom</th>
                <th scope="col">3-Bedroom</th>
                <th scope="col"><span class="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              ${priceRowsHtml}
            </tbody>
          </table>
        </div>

        <div class="civ-size-footnote">
          <strong>Assumed room profiles:</strong>
          1-bed (${PROPERTY_SIZE_PROFILES["1"].summary}) &bull;
          2-bed (${PROPERTY_SIZE_PROFILES["2"].summary}) &bull;
          3-bed (${PROPERTY_SIZE_PROFILES["3"].summary}).
          Extra bathrooms beyond the profile add <em>${PRICE_LIST.addons.extraBathroomDeep.label}</em> (${formatPrice(PRICE_LIST.addons.extraBathroomDeep.price)} ${PRICE_LIST.addons.extraBathroomDeep.unit}).
        </div>
      </div>

      <!-- Part 2: Cleaning Scope Comparison -->
      <div class="civ-pricing-sheet">
        <div class="civ-sheet-header">
          <div>
            <h3>What Each Cleaning Service Includes</h3>
            <p class="muted">Every task included across our four cleaning tiers, plus what is normally excluded or quoted extra.</p>
          </div>
        </div>

        <!-- Desktop/Tablet Accessible Table -->
        <div class="civ-table-scroll civ-desktop-scope-table" role="region" aria-labelledby="scopeMatrixCap" tabindex="0">
          <table class="civ-price-table civ-scope-matrix-table">
            <caption id="scopeMatrixCap" class="sr-only">Cleaning scope matrix comparing tasks across Standard, Apartment Ready, Move-in/move-out, and Deep clean</caption>
            <thead>
              <tr>
                <th scope="col">Checklist Task</th>
                <th scope="col">${PRICE_LIST.cleaning.standard.label}</th>
                <th scope="col">${PRICE_LIST.cleaning.apartmentReady.label}</th>
                <th scope="col">${PRICE_LIST.cleaning.moveInOut.label}</th>
                <th scope="col">${PRICE_LIST.cleaning.deep.label}</th>
              </tr>
            </thead>
            <tbody>
              ${scopeTableRowsHtml}
              <tr class="civ-scope-exclusions-row">
                <th scope="row">Normally excluded or quoted extra</th>
                ${exclusionsRowCellsHtml}
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Collapsible Per Service -->
        <div class="civ-mobile-scope-stack" aria-label="Cleaning scope by service">
          ${mobileCollapsibleScopeHtml}
        </div>
      </div>

      <!-- Part 3: Add-ons & Monthly Care / Watch / Repairs -->
      <div class="civ-grid-2col">
        <div class="civ-pricing-sheet">
          <h3>Optional Cleaning Add-ons</h3>
          <p class="muted">Fixed unit prices when added to any cleaning service:</p>
          <div class="civ-table-scroll" role="region" aria-labelledby="addonsTableCap" tabindex="0">
            <table class="civ-price-table">
              <caption id="addonsTableCap" class="sr-only">Optional cleaning add-on prices and units</caption>
              <thead>
                <tr>
                  <th scope="col">Add-on</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                ${addonsRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="civ-pricing-sheet">
          <h3>Repairs, Assessments, Care &amp; Property Watch</h3>
          <p class="muted">Starting ("from") prices confirmed in a written quotation:</p>
          <div class="civ-table-scroll" role="region" aria-labelledby="otherPricesCap" tabindex="0">
            <table class="civ-price-table">
              <caption id="otherPricesCap" class="sr-only">Starting prices for minor repairs, assessments, Civitas Care, and Property Watch</caption>
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Starting Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <div class="civ-service-title">Minor repair</div>
                    <div class="civ-service-desc">One small defined fault; parts quoted separately</div>
                  </th>
                  <td class="civ-num-cell"><strong>${formatFromPrice(PRICE_LIST.fromPrices.minorRepair)}</strong></td>
                </tr>
                <tr>
                  <th scope="row">
                    <div class="civ-service-title">Property condition assessment</div>
                    <div class="civ-service-desc">On-site visual walk-through and written summary</div>
                  </th>
                  <td class="civ-num-cell"><strong>${formatFromPrice(PRICE_LIST.fromPrices.assessment)}</strong></td>
                </tr>
                <tr>
                  <th scope="row">
                    <div class="civ-service-title">Care Essential</div>
                    <div class="civ-service-desc">Monthly inspection, report &amp; maintenance coordination</div>
                  </th>
                  <td class="civ-num-cell"><strong>${formatFromPrice(PRICE_LIST.fromPrices.careEssential, "per month")}</strong></td>
                </tr>
                <tr>
                  <th scope="row">
                    <div class="civ-service-title">Care Plus</div>
                    <div class="civ-service-desc">Up to 2 scheduled visits per month &amp; priority coordination</div>
                  </th>
                  <td class="civ-num-cell"><strong>${formatFromPrice(PRICE_LIST.fromPrices.carePlus, "per month")}</strong></td>
                </tr>
                <tr>
                  <th scope="row">
                    <div class="civ-service-title">Watch Monthly</div>
                    <div class="civ-service-desc">Scheduled monthly visual check with dated photos</div>
                  </th>
                  <td class="civ-num-cell"><strong>${formatFromPrice(PRICE_LIST.fromPrices.watchMonthly, "per month")}</strong></td>
                </tr>
                <tr>
                  <th scope="row">
                    <div class="civ-service-title">Watch Plus</div>
                    <div class="civ-service-desc">Enhanced visual check with room-by-room photo report</div>
                  </th>
                  <td class="civ-num-cell"><strong>${formatFromPrice(PRICE_LIST.fromPrices.watchPlus, "per month")}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="civ-watch-calm-note" role="note">
            ${HOW_WE_SET_PRICES.propertyWatchNotice}
          </p>
        </div>
      </div>

      <!-- Part 4: How We Set Our Prices -->
      <div class="civ-how-we-price-strip">
        <div class="civ-how-strip-header">
          <h4>${HOW_WE_SET_PRICES.heading}</h4>
          <span class="civ-version-pill" data-price-token="version-line">${PRICE_VERSION_LINE}</span>
        </div>
        <ul class="civ-how-strip-list">
          ${howPointsHtml}
        </ul>
      </div>
    </div>
  `;
}
