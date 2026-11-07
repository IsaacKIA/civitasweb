import {
  PRICE_LIST,
  PRICE_VERSION_LINE,
  formatPrice,
} from "./config/pricing.ts";
import { buildQuote } from "./lib/quote.ts";
import {
  listSavedQuotes,
  saveQuoteRecord,
  updateQuoteAdminStatus,
  adjustSavedQuotePrice,
  computeQuoteMetrics,
  type SavedQuoteAdminStatus,
} from "./lib/quotes-store.ts";

const ADMIN_SESSION_KEY = "civitas_admin_authenticated_v1";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function mountAdminQuotesApp(container: HTMLElement): void {
  let isAuthenticated =
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  let authError = "";
  let statusFilter: "ALL" | SavedQuoteAdminStatus = "ALL";
  let activeAdjustRef: string | null = null;
  let actionFeedback = "";

  const render = () => {
    if (!isAuthenticated) {
      container.innerHTML = `
        <div class="adm-auth-card" role="region" aria-labelledby="admAuthTitle">
          <span class="eyebrow eyebrow-emerald">Internal Team Portal</span>
          <h2 id="admAuthTitle">Civitas Quotes Administration</h2>
          <p class="muted">Enter the team access passcode to review saved Smart Quotes, update booking status, and confirm custom quotations.</p>
          <form id="admLoginForm" class="adm-login-form">
            <div class="sq2-field-group">
              <label for="admPasscodeInput">Team Passcode</label>
              <input
                type="password"
                id="admPasscodeInput"
                class="sq2-input"
                placeholder="Enter team passcode (default: civitas-team)"
                required
              />
            </div>
            ${authError ? `<div class="sq2-feedback sq2-feedback-error" role="alert">${escapeHtml(authError)}</div>` : ""}
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:0.75rem;">Unlock Quotes Dashboard</button>
          </form>
        </div>
      `;

      const form = container.querySelector<HTMLFormElement>("#admLoginForm");
      const input =
        container.querySelector<HTMLInputElement>("#admPasscodeInput");
      if (form && input) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const val = input.value.trim();
          const envPass = (
            import.meta as unknown as { env?: Record<string, string> }
          ).env?.VITE_ADMIN_PASSCODE;
          const expected = envPass || "civitas-team";
          if (val === expected) {
            isAuthenticated = true;
            authError = "";
            if (typeof sessionStorage !== "undefined") {
              sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
            }
            render();
          } else {
            authError = "Incorrect passcode. Please try again.";
            render();
          }
        });
      }
      return;
    }

    const allQuotes = listSavedQuotes();
    const metrics = computeQuoteMetrics(allQuotes);
    const filtered =
      statusFilter === "ALL"
        ? allQuotes
        : allQuotes.filter((q) => q.admin_status === statusFilter);

    const rowsHtml =
      filtered.length === 0
        ? `<tr><td colspan="7" style="text-align:center;padding:2rem;">No quotes match the current filter. Use the button above to create a sample quote or generate one at <a href="/get-a-quote/">/get-a-quote</a>.</td></tr>`
        : filtered
            .map((q) => {
              const svcLabel =
                PRICE_LIST.cleaning[q.inputs.service]?.label ||
                q.inputs.service;
              const effectiveTotal = q.change_log
                ? q.change_log.confirmedTotal
                : q.total;

              const isAdjusting = activeAdjustRef === q.reference;

              return `
                <tr>
                  <td>
                    <strong><a href="/get-a-quote/?ref=${encodeURIComponent(q.reference)}">${escapeHtml(q.reference)}</a></strong>
                    <div class="adm-sub">v${escapeHtml(q.price_list_version)} &bull; Valid to ${escapeHtml(q.valid_until)}</div>
                  </td>
                  <td>
                    <strong>${escapeHtml(q.customer_contact.name || "—")}</strong>
                    <div class="adm-sub">${escapeHtml(q.customer_contact.phone || "—")}</div>
                    <div class="adm-sub">${escapeHtml(q.customer_contact.suburb ? `${q.customer_contact.suburb}, ` : "")}${escapeHtml(q.customer_contact.area.toUpperCase())}</div>
                  </td>
                  <td>
                    <strong>${escapeHtml(svcLabel)}</strong>
                    <div class="adm-sub">${escapeHtml(String(q.inputs.bedrooms))} bed, ${q.inputs.bathrooms} bath</div>
                  </td>
                  <td>
                    <span class="sq2-status-badge sq2-status-${q.status}">
                      ${q.status === "instant" ? "Instant quote" : "Needs confirmation"}
                    </span>
                    ${
                      q.reasons.length > 0
                        ? `<ul class="adm-reasons-list">${q.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>`
                        : ""
                    }
                  </td>
                  <td>
                    <div class="adm-price-cell">
                      <strong>${formatPrice(effectiveTotal)}</strong>
                      ${
                        q.change_log
                          ? `<div class="adm-changelog-note">
                              Was ${formatPrice(q.change_log.previousTotal)}<br/>
                              <em>Reason: ${escapeHtml(q.change_log.reason)}</em><br/>
                              <span>${q.change_log.customerApproved ? "&#10003; Customer Approved" : "&#9888; Awaiting Customer Approval"}</span>
                            </div>`
                          : ""
                      }
                    </div>
                  </td>
                  <td>
                    <span class="adm-outcome-pill adm-outcome-${q.admin_status.toLowerCase()}">${escapeHtml(q.admin_status)}</span>
                  </td>
                  <td>
                    <div class="adm-actions-row">
                      <button type="button" class="btn btn-sm adm-status-btn" data-set-status="Accepted" data-ref="${escapeHtml(q.reference)}">Accept</button>
                      <button type="button" class="btn btn-sm adm-status-btn" data-set-status="Declined" data-ref="${escapeHtml(q.reference)}">Decline</button>
                      <button type="button" class="btn btn-sm adm-status-btn" data-set-status="Expired" data-ref="${escapeHtml(q.reference)}">Expire</button>
                      <button type="button" class="btn btn-sm btn-secondary" data-open-adjust="${escapeHtml(q.reference)}">Adjust Price</button>
                    </div>
                    ${
                      isAdjusting
                        ? `
                        <form class="adm-adjust-form" data-adjust-form="${escapeHtml(q.reference)}">
                          <label>
                            Confirmed Price (${PRICE_LIST.currency})
                            <input type="number" name="confirmedTotal" min="${q.total}" value="${effectiveTotal}" class="sq2-input" required />
                          </label>
                          <label>
                            Reason shown to customer (required)
                            <input type="text" name="reason" placeholder="e.g. 4th bedroom + upper-floor stairs carry time" class="sq2-input" required />
                          </label>
                          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
                            <button type="submit" class="btn btn-primary btn-sm">Save Confirmed Price</button>
                            <button type="button" class="btn btn-secondary btn-sm" data-cancel-adjust>Cancel</button>
                          </div>
                        </form>
                      `
                        : ""
                    }
                  </td>
                </tr>
              `;
            })
            .join("");

    container.innerHTML = `
      <div class="adm-dashboard">
        <div class="adm-top-bar">
          <div>
            <span class="eyebrow eyebrow-emerald">Quarterly Price Review &amp; Operations</span>
            <h2>Internal Quotes &amp; Win-Rate Tracker</h2>
            <p class="muted">${escapeHtml(PRICE_VERSION_LINE)}</p>
          </div>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            <button type="button" class="btn btn-secondary btn-sm" id="admSeedSampleBtn">+ Add Sample Quote</button>
            <a href="/get-a-quote/" class="btn btn-primary btn-sm">Open Customer Smart Quote</a>
            <button type="button" class="btn btn-secondary btn-sm" id="admLogoutBtn">Lock Portal</button>
          </div>
        </div>

        <!-- Metrics Cards for Quarterly Price Review -->
        <div class="adm-metrics-grid">
          <div class="adm-metric-card">
            <span class="adm-metric-label">Total Saved Quotes</span>
            <strong class="adm-metric-val">${metrics.totalQuotes}</strong>
            <small>${metrics.needsConfirmationCount} needing confirmation</small>
          </div>
          <div class="adm-metric-card">
            <span class="adm-metric-label">Win Rate (Accepted)</span>
            <strong class="adm-metric-val">${metrics.winRatePercent}%</strong>
            <small>${metrics.acceptedCount} accepted / ${metrics.declinedCount} declined</small>
          </div>
          <div class="adm-metric-card">
            <span class="adm-metric-label">Average Quote Value</span>
            <strong class="adm-metric-val">${formatPrice(metrics.averageQuoteValue)}</strong>
            <small>For quarterly price review</small>
          </div>
          <div class="adm-metric-card">
            <span class="adm-metric-label">Pending / Expired</span>
            <strong class="adm-metric-val">${metrics.pendingCount} / ${metrics.expiredCount}</strong>
            <small>14-day quote validity</small>
          </div>
        </div>

        ${actionFeedback ? `<div class="sq2-feedback sq2-feedback-success" role="status">${escapeHtml(actionFeedback)}</div>` : ""}

        <!-- Filter Bar -->
        <div class="adm-filter-bar" role="group" aria-label="Filter quotes by outcome">
          ${(["ALL", "Pending", "Accepted", "Declined", "Expired"] as const)
            .map(
              (st) => `
            <button
              type="button"
              class="sq2-pill-btn ${statusFilter === st ? "active" : ""}"
              data-filter-status="${st}"
            >
              ${st}
            </button>
          `
            )
            .join("")}
        </div>

        <!-- Quotes Table -->
        <div class="civ-table-scroll" role="region" aria-label="Saved quotes list" tabindex="0">
          <table class="civ-price-table adm-quotes-table">
            <thead>
              <tr>
                <th scope="col">Reference &amp; Version</th>
                <th scope="col">Customer &amp; Area</th>
                <th scope="col">Service &amp; Size</th>
                <th scope="col">Quote Type &amp; Triggers</th>
                <th scope="col">Total &amp; Change Log</th>
                <th scope="col">Outcome</th>
                <th scope="col">Team Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Bind events
    container
      .querySelectorAll<HTMLElement>("[data-filter-status]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          statusFilter = btn.getAttribute("data-filter-status") as
            | "ALL"
            | SavedQuoteAdminStatus;
          actionFeedback = "";
          render();
        });
      });

    container
      .querySelectorAll<HTMLElement>("[data-set-status]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const ref = btn.getAttribute("data-ref");
          const status = btn.getAttribute(
            "data-set-status"
          ) as SavedQuoteAdminStatus;
          if (ref && status) {
            updateQuoteAdminStatus(ref, status);
            actionFeedback = `Quote ${ref} marked as ${status}.`;
            render();
          }
        });
      });

    container
      .querySelectorAll<HTMLElement>("[data-open-adjust]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          activeAdjustRef = btn.getAttribute("data-open-adjust");
          actionFeedback = "";
          render();
        });
      });

    container
      .querySelectorAll<HTMLElement>("[data-cancel-adjust]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          activeAdjustRef = null;
          render();
        });
      });

    container
      .querySelectorAll<HTMLFormElement>("[data-adjust-form]")
      .forEach((form) => {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const ref = form.getAttribute("data-adjust-form");
          const fd = new FormData(form);
          const confirmedTotal = Number(fd.get("confirmedTotal"));
          const reason = String(fd.get("reason") || "").trim();
          if (ref && reason && Number.isFinite(confirmedTotal)) {
            adjustSavedQuotePrice(ref, confirmedTotal, reason);
            activeAdjustRef = null;
            actionFeedback = `Confirmed price for ${ref} updated to ${formatPrice(confirmedTotal)} with reason logged for customer approval.`;
            render();
          }
        });
      });

    const seedBtn = container.querySelector<HTMLElement>("#admSeedSampleBtn");
    if (seedBtn) {
      seedBtn.addEventListener("click", async () => {
        const sampleInput = {
          service: "deep" as const,
          bedrooms: "3" as const,
          bathrooms: 3,
          matchesSizeProfile: true,
          addons: { ovenInterior: 1, balconyWash: 1 },
          conditions: { stairsWithoutLift: true },
          area: "accra" as const,
          suburb: "East Legon",
          preferredDate: "2026-11-18",
          customerName: "Abena Osei",
          customerPhone: "+233 24 000 1122",
          customerEmail: "abena.osei@example.com",
          consentGiven: true,
          issueDate: PRICE_LIST.date,
        };
        const sampleQuote = buildQuote(sampleInput, PRICE_LIST);
        await saveQuoteRecord(sampleInput, sampleQuote);
        actionFeedback = `Sample quote ${sampleQuote.reference} added.`;
        render();
      });
    }

    const logoutBtn = container.querySelector<HTMLElement>("#admLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        isAuthenticated = false;
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
        }
        render();
      });
    }
  };

  render();
}

