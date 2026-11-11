/**
 * CIVITAS ESTATE & MAINTENANCE
 * Executive Operations & Financial Control System Application UI
 * Modern, responsive, zero-external-dependency TypeScript interface.
 */

import { opsStore, type OpsDatabaseState } from './ops/store.ts';
import { createDemoState } from './ops/demo-data.ts';
import { roundMoney, formatYMD } from './ops/calculations.ts';
import {
  renderPrintQuoteHtml,
  renderPrintInvoiceHtml,
  renderPrintMonthlyReportHtml,
  renderPrintInspectionHtml
} from './ops/reports.ts';
import type { Customer, Property, Enquiry, Quote, Job, Assignment, Contractor, Invoice, Payment, Expense } from './ops/types.ts';

type ActiveTab = 
  | 'dashboard'
  | 'financial'
  | 'receivables'
  | 'sales'
  | 'operations'
  | 'contractors'
  | 'expenses'
  | 'grant'
  | 'assets'
  | 'governance'
  | 'checks'
  | 'print';

class OpsApp {
  private mountEl: HTMLElement;
  private currentTab: ActiveTab = 'dashboard';
  private selectedCustomerForQuote?: string;

  constructor(mountId: string) {
    const el = document.getElementById(mountId);
    if (!el) throw new Error(`Mount element #${mountId} not found`);
    this.mountEl = el;

    // Listen to changes in the store
    opsStore.subscribe(() => {
      this.render();
    });

    this.render();
  }

  public setTab(tab: ActiveTab): void {
    this.currentTab = tab;
    this.render();
  }

  public render(): void {
    const state = opsStore.getState();
    const settings = state.settings;
    const mgmt = opsStore.getManagementAccounts();
    const evaluation = opsStore.getChecksEvaluation();
    const currency = settings.currencySymbol;

    this.mountEl.innerHTML = `
      <!-- Top Navigation & Branding -->
      <header class="ops-header">
        <div class="ops-header-top">
          <div style="display: flex; align-items: center; gap: 14px;">
            <a href="/" style="display: flex; align-items: center; text-decoration: none;">
              <img src="/assets/logos/Civitas_Official_Logo_Web.webp" alt="Civitas" style="height: 38px; width: auto; object-fit: contain; filter: brightness(0) invert(1);" onerror="this.style.display='none'">
            </a>
            <div>
              <h1 style="font-size: 18px; font-weight: 800; margin: 0; color: #ffffff; letter-spacing: -0.3px;">
                ${settings.companyName}
              </h1>
              <p style="font-size: 11px; color: var(--brand-terracotta); font-weight: 600; margin: 0;">
                Operations &amp; Financial Control Platform &bull; ${settings.tagline}
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <a href="/" class="btn-brand-outline" style="color: #ffffff; border-color: rgba(255,255,255,0.4); font-size: 11px; text-decoration: none;">Public Site</a>
            <a href="/get-a-quote/" class="btn-brand-outline" style="color: #ffffff; border-color: rgba(255,255,255,0.4); font-size: 11px; text-decoration: none;">Smart Quote</a>
            <a href="/admin/quotes/" class="btn-brand-outline" style="color: #ffffff; border-color: rgba(255,255,255,0.4); font-size: 11px; text-decoration: none;">Quote Admin</a>
            <div style="font-size: 12px; background: rgba(255, 255, 255, 0.1); padding: 5px 10px; border-radius: 4px; color: #e2e8f0;">
              Year: <strong>${settings.reportingYear}</strong> &bull; Date: <strong>${settings.reportDateOverride || 'Today'}</strong>
            </div>

            <button id="btnPreloadDemo" class="btn-brand-outline" style="color: #ffffff; border-color: rgba(255,255,255,0.4); font-size: 11px;">
              Preload Demo
            </button>
            <button id="btnResetClean" class="btn-brand-outline" style="color: #f87171; border-color: rgba(248,113,113,0.4); font-size: 11px;">
              Reset Clean
            </button>
            <button id="btnExportJson" class="btn-brand-outline" style="color: #ffffff; border-color: rgba(255,255,255,0.4); font-size: 11px;">
              Backup JSON
            </button>
          </div>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="ops-nav-tabs">
        <button class="ops-nav-btn ${this.currentTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
          Command Centre
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'financial' ? 'active' : ''}" data-tab="financial">
          Financial Performance
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'receivables' ? 'active' : ''}" data-tab="receivables">
          Invoices &amp; Receivables
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'sales' ? 'active' : ''}" data-tab="sales">
          Sales &amp; Customers
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'operations' ? 'active' : ''}" data-tab="operations">
          Service Operations
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'contractors' ? 'active' : ''}" data-tab="contractors">
          Field Workforce
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'expenses' ? 'active' : ''}" data-tab="expenses">
          Expenses &amp; Procurement
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'grant' ? 'active' : ''}" data-tab="grant">
          Grant &amp; NEIP Funding
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'assets' ? 'active' : ''}" data-tab="assets">
          Equipment &amp; Assets
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'governance' ? 'active' : ''}" data-tab="governance">
          Governance &amp; Risk
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'checks' ? 'active' : ''}" data-tab="checks">
          52 Control Checks (${evaluation.itemsNeedingAttention > 0 ? `<span style="color: #f87171;">${evaluation.itemsNeedingAttention} Attention</span>` : 'All OK'})
        </button>
        <button class="ops-nav-btn ${this.currentTab === 'print' ? 'active' : ''}" data-tab="print">
          Printable Documents
        </button>
      </nav>

      <!-- Main Tab Content Body -->
      <main style="padding: 24px; max-width: 1400px; margin: 0 auto;">
        ${this.renderActiveTabContent(state, mgmt, evaluation, currency)}
      </main>
    `;

    this.bindEvents();
  }

  private renderActiveTabContent(
    state: OpsDatabaseState,
    mgmt: ReturnType<typeof opsStore.getManagementAccounts>,
    evaluation: ReturnType<typeof opsStore.getChecksEvaluation>,
    currency: string
  ): string {
    switch (this.currentTab) {
      case 'dashboard':
        return this.renderDashboardTab(state, mgmt, evaluation, currency);
      case 'financial':
        return this.renderFinancialTab(state, mgmt, currency);
      case 'receivables':
        return this.renderReceivablesTab(state, currency);
      case 'sales':
        return this.renderSalesTab(state, currency);
      case 'operations':
        return this.renderOperationsTab(state, currency);
      case 'contractors':
        return this.renderContractorsTab(state, currency);
      case 'expenses':
        return this.renderExpensesTab(state, currency);
      case 'grant':
        return this.renderGrantTab(state, currency);
      case 'assets':
        return this.renderAssetsTab(state, currency);
      case 'governance':
        return this.renderGovernanceTab(state);
      case 'checks':
        return this.renderChecksTab(evaluation);
      case 'print':
        return this.renderPrintSuiteTab(state);
      default:
        return `<p>Tab under construction</p>`;
    }
  }

  // ==========================================
  // TAB 1: EXECUTIVE DASHBOARD
  // ==========================================
  private renderDashboardTab(
    state: OpsDatabaseState,
    mgmt: ReturnType<typeof opsStore.getManagementAccounts>,
    evaluation: ReturnType<typeof opsStore.getChecksEvaluation>,
    currency: string
  ): string {
    const totalRev = mgmt.yearTotal.totalRevenue;
    const cashRec = mgmt.yearTotal.cashReceivedCustomers;
    const receivables = mgmt.yearTotal.receivables;
    const opex = mgmt.yearTotal.totalOpex;
    const grossContr = mgmt.yearTotal.grossContribution;
    const opProfit = mgmt.yearTotal.operatingProfit;
    const cashBal = mgmt.yearTotal.closingCash;
    const workingCap = mgmt.yearTotal.workingCapital;

    const activeCust = state.customers.filter(c => c.status === 'Active').length;
    const newCust = state.customers.length;
    const enqCount = state.enquiries.length;
    const openQuoteVal = roundMoney(
      state.quotes.filter(q => q.status === 'Sent').reduce((s, q) => s + (q.netOfDiscount || 0), 0)
    );

    const jobsBooked = state.jobs.length;
    const jobsCompleted = state.jobs.filter(j => ['Accepted by customer', 'Invoiced', 'Paid', 'Closed'].includes(j.status)).length;
    const jobsOverdue = state.jobs.filter(j => j.overdueFlag === 'Overdue').length;
    const contractorDays = state.assignments.reduce((s, a) => s + (a.personDays || 0), 0);

    const alertRowsHtml = evaluation.alerts.map(a => `
      <tr>
        <td style="font-weight: 700; color: #1e293b;">${a.alert}</td>
        <td>
          <span class="ops-badge ${a.status === 'OK' ? 'badge-ok' : 'badge-attention'}">
            ${a.status}
          </span>
        </td>
        <td style="color: #334155; font-size: 12px;">${a.evidence}</td>
        <td style="color: #64748b; font-size: 12px;">${a.whyItMatters}</td>
        <td style="font-weight: 600; color: #075545; font-size: 12px;">${a.nextAction}</td>
      </tr>
    `).join('');

    return `
      <!-- Top Row: Money Overview -->
      <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0 0 14px 0; letter-spacing: 0.5px;">
        1. Financial &amp; Cash Flow Overview
      </h2>
      <div class="ops-kpi-grid">
        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Revenue Invoiced</p>
          <h3 style="font-size: 24px; font-weight: 800; color: #075545; margin: 0;">${currency}${totalRev.toFixed(2)}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Before tax, net of credit notes</p>
        </div>

        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Cash Received</p>
          <h3 style="font-size: 24px; font-weight: 800; color: #15803d; margin: 0;">${currency}${cashRec.toFixed(2)}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Payments register only</p>
        </div>

        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Outstanding Receivables</p>
          <h3 style="font-size: 24px; font-weight: 800; color: ${receivables > 0 ? '#b91c1c' : '#1e293b'}; margin: 0;">${currency}${receivables.toFixed(2)}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Unpaid invoice balances</p>
        </div>

        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Operating Expenses</p>
          <h3 style="font-size: 24px; font-weight: 800; color: #1e293b; margin: 0;">${currency}${opex.toFixed(2)}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Overhead running costs</p>
        </div>
      </div>

      <!-- Second Row: Margin & Balance Sheet -->
      <div class="ops-kpi-grid">
        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Gross Contribution</p>
          <h3 style="font-size: 22px; font-weight: 800; color: #075545; margin: 0;">${currency}${grossContr.toFixed(2)}</h3>
          <p style="font-size: 11px; color: #15803d; margin: 4px 0 0 0; font-weight: 600;">Margin: ${mgmt.yearTotal.contributionMargin ? Math.round(mgmt.yearTotal.contributionMargin * 100) : 0}% (Min: 35%)</p>
        </div>

        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Operating Profit / (Loss)</p>
          <h3 style="font-size: 22px; font-weight: 800; color: ${opProfit >= 0 ? '#15803d' : '#b91c1c'}; margin: 0;">${currency}${opProfit.toFixed(2)}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">After depreciation, before tax</p>
        </div>

        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Available Cash Balance</p>
          <h3 style="font-size: 22px; font-weight: 800; color: #075545; margin: 0;">${currency}${cashBal.toFixed(2)}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Reserve threshold: ${currency}${state.settings.minimumCashReserve}</p>
        </div>

        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Working Capital</p>
          <h3 style="font-size: 22px; font-weight: 800; color: #075545; margin: 0;">${currency}${workingCap.toFixed(2)}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Cash + Receivables &minus; Payables</p>
        </div>
      </div>

      <!-- Third Row: Activity & Service Delivery -->
      <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 24px 0 14px 0; letter-spacing: 0.5px;">
        2. Sales &amp; Operations Activity
      </h2>
      <div class="ops-kpi-grid">
        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Active Customers</p>
          <h3 style="font-size: 22px; font-weight: 800; color: #1e293b; margin: 0;">${activeCust}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Total registered: ${newCust}</p>
        </div>

        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Enquiries Received</p>
          <h3 style="font-size: 22px; font-weight: 800; color: #1e293b; margin: 0;">${enqCount}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Pipeline opportunities</p>
        </div>

        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Open Quotations Value</p>
          <h3 style="font-size: 22px; font-weight: 800; color: #E4693F; margin: 0;">${currency}${openQuoteVal.toFixed(2)}</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Status: Sent; awaiting decision</p>
        </div>

        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 6px 0;">Jobs (Done / Overdue)</p>
          <h3 style="font-size: 22px; font-weight: 800; color: #1e293b; margin: 0;">${jobsCompleted} / <span style="color: ${jobsOverdue > 0 ? '#b91c1c' : '#15803d'}">${jobsOverdue}</span></h3>
          <p style="font-size: 11px; color: var(--text-muted); margin: 4px 0 0 0;">Contractor Person-Days: ${contractorDays}</p>
        </div>
      </div>

      <!-- Action Panel: What Management Should Pay Attention To -->
      <div style="margin-top: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">
              What Management Should Pay Attention To
            </h2>
            <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">
              Executive decision-making panel. Rule-based exceptions with exact evidence and next actions.
            </p>
          </div>
          <span class="ops-badge ${evaluation.itemsNeedingAttention > 0 ? 'badge-attention' : 'badge-ok'}" style="font-size: 12px; padding: 6px 12px;">
            ${evaluation.itemsNeedingAttention} Attention Item(s)
          </span>
        </div>

        <div class="ops-table-container">
          <table class="ops-table">
            <thead>
              <tr>
                <th style="width: 20%;">Alert Category</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 25%;">What Happened &amp; Evidence</th>
                <th style="width: 25%;">Why It Matters</th>
                <th style="width: 20%;">Practical Next Action</th>
              </tr>
            </thead>
            <tbody>
              ${alertRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 2: FINANCIAL PERFORMANCE & P&L
  // ==========================================
  private renderFinancialTab(
    state: OpsDatabaseState,
    mgmt: ReturnType<typeof opsStore.getManagementAccounts>,
    currency: string
  ): string {
    const monthHeaders = mgmt.months.map(m => `<th style="text-align: right;">${m.monthLabel}</th>`).join('');

    const renderMetricRow = (label: string, getter: (m: typeof mgmt.months[0]) => number, isBold = false, isAccent = false) => {
      const cells = mgmt.months.map(m => `<td style="text-align: right; ${isBold ? 'font-weight: 700;' : ''}">${currency}${roundMoney(getter(m)).toFixed(2)}</td>`).join('');
      const total = mgmt.months.reduce((s, m) => s + getter(m), 0);
      return `
        <tr style="${isAccent ? 'background: #FAF8F4;' : ''}">
          <td style="${isBold ? 'font-weight: 700; color: #075545;' : 'color: #334155;'}">${label}</td>
          ${cells}
          <td style="text-align: right; font-weight: 800; color: #075545;">${currency}${roundMoney(total).toFixed(2)}</td>
        </tr>
      `;
    };

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h2 style="font-size: 18px; font-weight: 800; color: #075545; margin: 0;">12-Month Management Accounts</h2>
          <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">
            Reporting Year ${state.settings.reportingYear}. Built from verified transaction registers.
          </p>
        </div>
      </div>

      <div class="ops-table-container" style="margin-bottom: 24px;">
        <table class="ops-table">
          <thead>
            <tr>
              <th style="text-align: left; min-width: 240px;">Item (${currency})</th>
              ${monthHeaders}
              <th style="text-align: right; min-width: 100px;">Year Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #f1f5f9;"><td colspan="14" style="font-weight: 800; color: #075545;">REVENUE (Invoiced, before tax, net of credit notes)</td></tr>
            ${renderMetricRow('Civitas Fix', m => m.revCivitasFix)}
            ${renderMetricRow('Civitas Care', m => m.revCivitasCare)}
            ${renderMetricRow('Civitas Property Watch', m => m.revCivitasWatch)}
            ${renderMetricRow('Total Revenue', m => m.totalRevenue, true, true)}

            <tr style="background: #f1f5f9;"><td colspan="14" style="font-weight: 800; color: #075545;">DIRECT COSTS</td></tr>
            ${renderMetricRow('Field labour (paid assignments)', m => m.directLabour)}
            ${renderMetricRow('Direct materials', m => m.directMaterials)}
            ${renderMetricRow('Direct transport', m => m.directTransport)}
            ${renderMetricRow('Total Direct Costs', m => m.totalDirectCosts, true, true)}

            <tr style="background: #e2e8f0;">
              <td style="font-weight: 800; color: #075545;">GROSS CONTRIBUTION</td>
              ${mgmt.months.map(m => `<td style="text-align: right; font-weight: 800; color: #075545;">${currency}${m.grossContribution.toFixed(2)}</td>`).join('')}
              <td style="text-align: right; font-weight: 800; color: #075545;">${currency}${mgmt.yearTotal.grossContribution.toFixed(2)}</td>
            </tr>

            <tr style="background: #f1f5f9;"><td colspan="14" style="font-weight: 800; color: #075545;">OPERATING EXPENSES (Opex)</td></tr>
            ${renderMetricRow('Marketing & Acquisition', m => m.opexMarketing)}
            ${renderMetricRow('Workforce Training & Safety', m => m.opexTraining)}
            ${renderMetricRow('Regulatory Compliance', m => m.opexCompliance)}
            ${renderMetricRow('Digital Operations', m => m.opexDigital)}
            ${renderMetricRow('Branding & Materials', m => m.opexBranding)}
            ${renderMetricRow('Administration & Communication', m => m.opexAdmin)}
            ${renderMetricRow('Insurance', m => m.opexInsurance)}
            ${renderMetricRow('Professional Fees', m => m.opexProfessionalFees)}
            ${renderMetricRow('Salaries & Employer Pension', m => m.opexSalaries)}
            ${renderMetricRow('Other Operating Expenses', m => m.opexOther)}
            ${renderMetricRow('Total Operating Expenses', m => m.totalOpex, true, true)}

            <tr style="background: #FAF8F4;">
              <td style="font-weight: 700; color: #1e293b;">EBITDA</td>
              ${mgmt.months.map(m => `<td style="text-align: right; font-weight: 700;">${currency}${m.ebitda.toFixed(2)}</td>`).join('')}
              <td style="text-align: right; font-weight: 800; color: #075545;">${currency}${mgmt.yearTotal.ebitda.toFixed(2)}</td>
            </tr>
            ${renderMetricRow('Straight-line Depreciation', m => m.depreciation)}
            <tr style="background: #e2e8f0;">
              <td style="font-weight: 800; color: #1e293b;">OPERATING PROFIT / (LOSS)</td>
              ${mgmt.months.map(m => `<td style="text-align: right; font-weight: 800; color: ${m.operatingProfit >= 0 ? '#15803d' : '#b91c1c'};">${currency}${m.operatingProfit.toFixed(2)}</td>`).join('')}
              <td style="text-align: right; font-weight: 800; color: ${mgmt.yearTotal.operatingProfit >= 0 ? '#15803d' : '#b91c1c'};">${currency}${mgmt.yearTotal.operatingProfit.toFixed(2)}</td>
            </tr>

            <tr style="background: #f1f5f9;"><td colspan="14" style="font-weight: 800; color: #075545;">CASH FLOW (By payment date)</td></tr>
            <tr style="background: #ffffff;">
              <td style="color: #64748b;">Opening Cash Balance</td>
              ${mgmt.months.map(m => `<td style="text-align: right; color: #64748b;">${currency}${m.openingCash.toFixed(2)}</td>`).join('')}
              <td style="text-align: right; color: #64748b;">-</td>
            </tr>
            ${renderMetricRow('Cash Received from Customers', m => m.cashReceivedCustomers)}
            ${renderMetricRow('Cash Paid: Expenses (Opex & Direct)', m => m.cashPaidOpexDirect)}
            ${renderMetricRow('Cash Paid: Capex Equipment', m => m.cashPaidCapex)}
            ${renderMetricRow('Cash Paid: Field Professionals', m => m.cashPaidLabour)}
            ${renderMetricRow('Funding Received (Capital, not Revenue)', m => m.fundingReceived)}
            <tr style="background: #FAF8F4;">
              <td style="font-weight: 700;">Net Cash Movement</td>
              ${mgmt.months.map(m => `<td style="text-align: right; font-weight: 700; color: ${m.netCashMovement >= 0 ? '#15803d' : '#b91c1c'};">${currency}${m.netCashMovement.toFixed(2)}</td>`).join('')}
              <td style="text-align: right; font-weight: 800; color: #075545;">${currency}${mgmt.yearTotal.netCashMovement.toFixed(2)}</td>
            </tr>
            <tr style="background: #e2e8f0;">
              <td style="font-weight: 800; color: #075545;">CLOSING CASH BALANCE</td>
              ${mgmt.months.map(m => `<td style="text-align: right; font-weight: 800; color: #075545;">${currency}${m.closingCash.toFixed(2)}</td>`).join('')}
              <td style="text-align: right; font-weight: 800; color: #075545;">${currency}${mgmt.yearTotal.closingCash.toFixed(2)}</td>
            </tr>

            <tr style="background: #f1f5f9;"><td colspan="14" style="font-weight: 800; color: #075545;">BALANCE SHEET ITEMS (End of month)</td></tr>
            <tr style="background: #ffffff;">
              <td style="color: #64748b;">Receivables (Unpaid Invoices)</td>
              ${mgmt.months.map(m => `<td style="text-align: right;">${currency}${m.receivables.toFixed(2)}</td>`).join('')}
              <td style="text-align: right; font-weight: 700;">${currency}${mgmt.yearTotal.receivables.toFixed(2)}</td>
            </tr>
            <tr style="background: #ffffff;">
              <td style="color: #64748b;">Payables (Unpaid Costs &amp; Labour)</td>
              ${mgmt.months.map(m => `<td style="text-align: right;">${currency}${m.payables.toFixed(2)}</td>`).join('')}
              <td style="text-align: right; font-weight: 700;">${currency}${mgmt.yearTotal.payables.toFixed(2)}</td>
            </tr>
            <tr style="background: #FAF8F4;">
              <td style="font-weight: 800; color: #075545;">WORKING CAPITAL</td>
              ${mgmt.months.map(m => `<td style="text-align: right; font-weight: 800; color: #075545;">${currency}${m.workingCapital.toFixed(2)}</td>`).join('')}
              <td style="text-align: right; font-weight: 800; color: #075545;">${currency}${mgmt.yearTotal.workingCapital.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 3: RECEIVABLES & INVOICES
  // ==========================================
  private renderReceivablesTab(state: OpsDatabaseState, currency: string): string {
    const invoices = state.invoices;
    const payments = state.payments;

    // Ageing summary
    const current = invoices.filter(i => i.ageingBucket === 'Current').reduce((s, i) => s + (i.balance || 0), 0);
    const b30 = invoices.filter(i => i.ageingBucket === '1-30 days').reduce((s, i) => s + (i.balance || 0), 0);
    const b60 = invoices.filter(i => i.ageingBucket === '31-60 days').reduce((s, i) => s + (i.balance || 0), 0);
    const b90 = invoices.filter(i => i.ageingBucket === '61-90 days').reduce((s, i) => s + (i.balance || 0), 0);
    const over90 = invoices.filter(i => i.ageingBucket === 'Over 90 days').reduce((s, i) => s + (i.balance || 0), 0);
    const totalRec = current + b30 + b60 + b90 + over90;

    const invoiceRowsHtml = invoices.map(i => `
      <tr>
        <td style="font-weight: 700; color: #075545;">${i.invoiceNo}</td>
        <td>${i.customerName}</td>
        <td>${i.invoiceDate}</td>
        <td>${i.dueDate}</td>
        <td style="text-align: right;">${currency}${roundMoney(i.amountBeforeTax).toFixed(2)}</td>
        <td style="text-align: right; color: #15803d;">${currency}${roundMoney(i.paymentsReceived || 0).toFixed(2)}</td>
        <td style="text-align: right; font-weight: 700; color: ${(i.balance || 0) > 0 ? '#b91c1c' : '#15803d'};">
          ${currency}${roundMoney(i.balance || 0).toFixed(2)}
        </td>
        <td>
          <span class="ops-badge ${(i.balance || 0) <= 0.005 ? 'badge-ok' : 'badge-attention'}">
            ${i.status}
          </span>
        </td>
        <td>${i.ageingBucket}</td>
        <td>
          <button class="btn-brand-outline btn-print-inv" data-id="${i.invoiceNo}" style="padding: 3px 8px; font-size: 11px;">
            Print / PDF
          </button>
        </td>
      </tr>
    `).join('');

    const paymentRowsHtml = payments.map(p => `
      <tr>
        <td style="font-weight: 700;">${p.paymentId}</td>
        <td>${p.paymentDate}</td>
        <td style="font-weight: 600; color: #075545;">${p.invoiceNo}</td>
        <td>${p.customerName || 'N/A'}</td>
        <td style="text-align: right; font-weight: 700; color: #15803d;">${currency}${roundMoney(p.amount).toFixed(2)}</td>
        <td>${p.method}</td>
        <td style="font-family: monospace;">${p.reference || 'N/A'}</td>
        <td>
          <span class="ops-badge ${p.reconciliationStatus === 'Reconciled' ? 'badge-ok' : 'badge-pending'}">
            ${p.reconciliationStatus}
          </span>
        </td>
      </tr>
    `).join('');

    return `
      <!-- Ageing Cards -->
      <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0 0 14px 0;">
        Receivables Ageing Breakdown
      </h2>
      <div class="ops-kpi-grid">
        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 4px 0;">Current (Not Due)</p>
          <h3 style="font-size: 20px; font-weight: 800; color: #075545; margin: 0;">${currency}${current.toFixed(2)}</h3>
        </div>
        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 4px 0;">1 - 30 Days Overdue</p>
          <h3 style="font-size: 20px; font-weight: 800; color: #d97706; margin: 0;">${currency}${b30.toFixed(2)}</h3>
        </div>
        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 4px 0;">31 - 60 Days Overdue</p>
          <h3 style="font-size: 20px; font-weight: 800; color: #b91c1c; margin: 0;">${currency}${b60.toFixed(2)}</h3>
        </div>
        <div class="ops-card">
          <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 4px 0;">61 - 90+ Days Overdue</p>
          <h3 style="font-size: 20px; font-weight: 800; color: #7f1d1d; margin: 0;">${currency}${(b90 + over90).toFixed(2)}</h3>
        </div>
      </div>

      <!-- Invoices Register -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin: 24px 0 12px 0;">
        <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
          Invoices &amp; Receivables Register
        </h2>
        <button id="btnNewInvoice" class="btn-brand-primary">+ Create Invoice</button>
      </div>
      <div class="ops-table-container" style="margin-bottom: 32px;">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th style="text-align: right;">Amount</th>
              <th style="text-align: right;">Paid</th>
              <th style="text-align: right;">Balance</th>
              <th>Status</th>
              <th>Ageing</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceRowsHtml || '<tr><td colspan="10" style="text-align: center; color: #64748b;">No invoices issued yet.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Payments Register -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin: 24px 0 12px 0;">
        <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
          Payments &amp; Cash Received Register (Cash &ne; Revenue)
        </h2>
        <button id="btnNewPayment" class="btn-brand-primary">+ Record Payment</button>
      </div>
      <div class="ops-table-container">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Customer</th>
              <th style="text-align: right;">Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Recon Status</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRowsHtml || '<tr><td colspan="8" style="text-align: center; color: #64748b;">No cash receipts recorded yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 4: SALES PIPELINE & CUSTOMERS
  // ==========================================
  private renderSalesTab(state: OpsDatabaseState, currency: string): string {
    const custRowsHtml = state.customers.map(c => `
      <tr>
        <td style="font-weight: 700; color: #075545;">${c.customerId}</td>
        <td style="font-weight: 600;">${c.customerName}</td>
        <td>${c.category}</td>
        <td>${c.phone}</td>
        <td>${c.area}</td>
        <td>${c.leadSource}</td>
        <td style="text-align: right; font-weight: 600;">${currency}${roundMoney(c.totalBilled || 0).toFixed(2)}</td>
        <td style="text-align: right; color: ${(c.outstanding || 0) > 0 ? '#b91c1c' : '#15803d'}; font-weight: 700;">
          ${currency}${roundMoney(c.outstanding || 0).toFixed(2)}
        </td>
        <td>
          <span class="ops-badge ${c.status === 'Active' ? 'badge-ok' : c.status === 'Closed' ? 'badge-attention' : 'badge-pending'}">
            ${c.status}
          </span>
        </td>
      </tr>
    `).join('');

    const enqRowsHtml = state.enquiries.map(e => `
      <tr>
        <td style="font-weight: 700;">${e.enquiryId}</td>
        <td>${e.enquiryDate}</td>
        <td style="font-weight: 600;">${e.contactName}</td>
        <td>${e.phone}</td>
        <td>${e.area}</td>
        <td>${e.leadSource}</td>
        <td>${e.serviceInterest || 'N/A'}</td>
        <td><span class="ops-badge ${e.stage === 'Accepted' ? 'badge-ok' : e.stage === 'Declined' ? 'badge-attention' : 'badge-pending'}">${e.stage}</span></td>
        <td>${e.quoteId || '-'}</td>
      </tr>
    `).join('');

    const quoteRowsHtml = state.quotes.map(q => `
      <tr>
        <td style="font-weight: 700; color: #075545;">${q.quoteId}</td>
        <td>${q.quoteDate}</td>
        <td style="font-weight: 600;">${q.customerName}</td>
        <td style="text-align: right;">${currency}${roundMoney(q.subtotal || 0).toFixed(2)}</td>
        <td style="text-align: right; color: #15803d;">${currency}${roundMoney(q.discountAmount || 0).toFixed(2)}</td>
        <td style="text-align: right; font-weight: 700; color: #075545;">${currency}${roundMoney(q.netOfDiscount || 0).toFixed(2)}</td>
        <td style="text-align: center; font-weight: 600;">${q.marginPct ? Math.round(q.marginPct * 100) : 0}%</td>
        <td><span class="ops-badge ${q.status === 'Accepted' ? 'badge-ok' : q.status === 'Declined' ? 'badge-attention' : 'badge-pending'}">${q.status}</span></td>
        <td>
          <button class="btn-brand-outline btn-print-quote" data-id="${q.quoteId}" style="padding: 3px 8px; font-size: 11px;">
            Print / PDF
          </button>
        </td>
      </tr>
    `).join('');

    return `
      <!-- Customers Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
          Customer Register (One row per client)
        </h2>
        <button id="btnNewCustomer" class="btn-brand-primary">+ Add New Customer</button>
      </div>
      <div class="ops-table-container" style="margin-bottom: 32px;">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Category</th>
              <th>Phone</th>
              <th>Area</th>
              <th>Lead Source</th>
              <th style="text-align: right;">Total Billed</th>
              <th style="text-align: right;">Outstanding</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${custRowsHtml || '<tr><td colspan="9" style="text-align: center; color: #64748b;">No customers registered yet.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Enquiries Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
          Sales Pipeline: Enquiries
        </h2>
        <button id="btnNewEnquiry" class="btn-brand-primary">+ Log Enquiry</button>
      </div>
      <div class="ops-table-container" style="margin-bottom: 32px;">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Enquiry ID</th>
              <th>Date</th>
              <th>Contact Name</th>
              <th>Phone</th>
              <th>Area</th>
              <th>Source</th>
              <th>Interest</th>
              <th>Stage</th>
              <th>Quote</th>
            </tr>
          </thead>
          <tbody>
            ${enqRowsHtml || '<tr><td colspan="9" style="text-align: center; color: #64748b;">No enquiries logged yet.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Quotations Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
          Quotations Register
        </h2>
        <button id="btnNewQuote" class="btn-brand-primary">+ Create Quotation</button>
      </div>
      <div class="ops-table-container">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th style="text-align: right;">Subtotal</th>
              <th style="text-align: right;">Discount</th>
              <th style="text-align: right;">Total Net</th>
              <th style="text-align: center;">Margin %</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${quoteRowsHtml || '<tr><td colspan="9" style="text-align: center; color: #64748b;">No quotations created yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 5: SERVICE OPERATIONS & JOBS
  // ==========================================
  private renderOperationsTab(state: OpsDatabaseState, currency: string): string {
    const jobRowsHtml = state.jobs.map(j => `
      <tr>
        <td style="font-weight: 700; color: #075545;">${j.jobId}</td>
        <td>${j.customerName}</td>
        <td style="font-size: 12px;">${j.description || 'Job service'}</td>
        <td>${j.scheduledDate || 'TBD'}</td>
        <td>${j.effectiveDueDate || 'TBD'}</td>
        <td><span class="ops-badge ${['Accepted by customer', 'Closed', 'Paid'].includes(j.status) ? 'badge-ok' : j.status === 'Cancelled' ? 'badge-attention' : 'badge-pending'}">${j.status}</span></td>
        <td style="text-align: right;">${currency}${roundMoney(j.quotedAmount || 0).toFixed(2)}</td>
        <td style="text-align: right; color: #64748b;">${currency}${roundMoney(j.actualDirectCost || 0).toFixed(2)}</td>
        <td style="text-align: right; font-weight: 700; color: (j.jobContribution || 0) >= 0 ? '#15803d' : '#b91c1c';">
          ${j.jobContribution !== null ? `${currency}${roundMoney(j.jobContribution).toFixed(2)}` : '-'}
        </td>
        <td>${j.overdueFlag ? `<span class="ops-badge badge-attention">Overdue</span>` : ''}</td>
      </tr>
    `).join('');

    const serviceRowsHtml = state.services.map(s => `
      <tr>
        <td style="font-weight: 700;">${s.serviceId}</td>
        <td>${s.division}</td>
        <td style="font-weight: 600;">${s.service}</td>
        <td>${s.unit}</td>
        <td style="text-align: right; font-weight: 700; color: #075545;">${currency}${s.standardPrice.toFixed(2)}</td>
        <td style="text-align: right; color: #64748b;">${currency}${s.standardDirectCost.toFixed(2)}</td>
        <td style="text-align: right; font-weight: 600; color: #15803d;">${currency}${roundMoney(s.standardPrice - s.standardDirectCost).toFixed(2)}</td>
        <td style="text-align: center;">${Math.round(((s.standardPrice - s.standardDirectCost) / s.standardPrice) * 100)}%</td>
      </tr>
    `).join('');

    return `
      <!-- Jobs Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
          Jobs &amp; Service Management
        </h2>
        <button id="btnNewJob" class="btn-brand-primary">+ Book Job</button>
      </div>
      <div class="ops-table-container" style="margin-bottom: 32px;">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Customer</th>
              <th>Description</th>
              <th>Scheduled</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style="text-align: right;">Quoted</th>
              <th style="text-align: right;">Actual Cost</th>
              <th style="text-align: right;">Contribution</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            ${jobRowsHtml || '<tr><td colspan="10" style="text-align: center; color: #64748b;">No jobs booked yet.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Service Catalogue -->
      <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0 0 12px 0;">
        Service Price Catalogue (S01 – S16 Reference)
      </h2>
      <div class="ops-table-container">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Service ID</th>
              <th>Division</th>
              <th>Service Name</th>
              <th>Unit</th>
              <th style="text-align: right;">Standard Price</th>
              <th style="text-align: right;">Standard Direct Cost</th>
              <th style="text-align: right;">Contribution</th>
              <th style="text-align: center;">Margin %</th>
            </tr>
          </thead>
          <tbody>
            ${serviceRowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 6: CONTRACTORS & FIELD WORKFORCE
  // ==========================================
  private renderContractorsTab(state: OpsDatabaseState, currency: string): string {
    const contractorRowsHtml = state.contractors.map(c => `
      <tr>
        <td style="font-weight: 700; color: #075545;">${c.contractorId}</td>
        <td style="font-weight: 600;">${c.contractorName}</td>
        <td>${c.workerType}</td>
        <td>${c.trade}</td>
        <td>${c.phone}</td>
        <td>
          <span class="ops-badge ${c.vettingStatus === 'Verified' ? 'badge-ok' : 'badge-attention'}">
            ${c.vettingStatus}
          </span>
        </td>
        <td>${c.trainingStatus}</td>
        <td style="text-align: right;">${currency}${c.agreedRate || 0} (${c.rateBasis || 'Per day'})</td>
        <td><span class="ops-badge ${c.eligibility === 'Eligible' ? 'badge-ok' : 'badge-attention'}">${c.eligibility}</span></td>
      </tr>
    `).join('');

    const assignmentRowsHtml = state.assignments.map(a => `
      <tr>
        <td style="font-weight: 700;">${a.assignmentId}</td>
        <td style="font-weight: 600; color: #075545;">${a.jobId}</td>
        <td>${a.contractorName}</td>
        <td>${a.assignmentDate}</td>
        <td>${a.trade || 'N/A'}</td>
        <td style="text-align: center;">${a.quantity}</td>
        <td style="text-align: right;">${currency}${a.rate.toFixed(2)}</td>
        <td style="text-align: right; font-weight: 700;">${currency}${roundMoney(a.amount || 0).toFixed(2)}</td>
        <td style="text-align: center; font-weight: 600;">${a.personDays || 0}</td>
        <td><span class="ops-badge ${a.paymentStatus === 'Paid' ? 'badge-ok' : 'badge-attention'}">${a.paymentStatus}</span></td>
      </tr>
    `).join('');

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
            Field Professionals &amp; Workforce Register
          </h2>
          <p style="font-size: 11px; color: var(--text-muted); margin: 2px 0 0 0;">
            Paid per assignment. Salaried staff are not paid through assignments.
          </p>
        </div>
        <button id="btnNewContractor" class="btn-brand-primary">+ Add Professional</button>
      </div>
      <div class="ops-table-container" style="margin-bottom: 32px;">
        <table class="ops-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Worker Type</th>
              <th>Trade</th>
              <th>Phone</th>
              <th>Vetting</th>
              <th>Training</th>
              <th style="text-align: right;">Agreed Rate</th>
              <th>Eligibility</th>
            </tr>
          </thead>
          <tbody>
            ${contractorRowsHtml || '<tr><td colspan="9" style="text-align: center; color: #64748b;">No workers registered yet.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
            Paid Assignments (Single-Entry Labour Register)
          </h2>
          <p style="font-size: 11px; color: var(--text-muted); margin: 2px 0 0 0;">
            This is the only place field labour is recorded (never duplicated in expenses). Paid person-days are never reported as jobs.
          </p>
        </div>
        <button id="btnNewAssignment" class="btn-brand-primary">+ Assign Work</button>
      </div>
      <div class="ops-table-container">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Assignment ID</th>
              <th>Job ID</th>
              <th>Professional</th>
              <th>Date</th>
              <th>Trade</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Total Amount</th>
              <th style="text-align: center;">Person Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${assignmentRowsHtml || '<tr><td colspan="10" style="text-align: center; color: #64748b;">No assignments recorded yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 7: EXPENSES & PROCUREMENT
  // ==========================================
  private renderExpensesTab(state: OpsDatabaseState, currency: string): string {
    const expenseRowsHtml = state.expenses.map(e => `
      <tr>
        <td style="font-weight: 700; color: #075545;">${e.expenseId}</td>
        <td>${e.expenseDate}</td>
        <td style="font-weight: 600;">${e.supplier}</td>
        <td>${e.category}</td>
        <td><span class="ops-badge ${e.class === 'Direct' ? 'badge-ok' : e.class === 'Capex' ? 'badge-reconciled' : 'badge-pending'}">${e.class}</span></td>
        <td>${e.jobId || '-'}</td>
        <td style="text-align: right; font-weight: 700;">${currency}${roundMoney(e.amount).toFixed(2)}</td>
        <td>${e.paymentStatus}</td>
        <td><span class="ops-badge ${e.approvalStatus === 'Approved' ? 'badge-ok' : 'badge-attention'}">${e.approvalStatus}</span></td>
        <td style="font-family: monospace; font-size: 11px;">${e.evidenceReference || 'NO EVIDENCE'}</td>
      </tr>
    `).join('');

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
            Expenses &amp; Procurement Register
          </h2>
          <p style="font-size: 11px; color: var(--text-muted); margin: 2px 0 0 0;">
            Threshold: Expenses &gt; ${currency}${state.settings.spendingApprovalThreshold} require approval. Direct costs must carry a Job ID.
          </p>
        </div>
        <button id="btnNewExpense" class="btn-brand-primary">+ Record Expense</button>
      </div>
      <div class="ops-table-container">
        <table class="ops-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Category</th>
              <th>Class</th>
              <th>Job ID</th>
              <th style="text-align: right;">Amount</th>
              <th>Pay Status</th>
              <th>Approval</th>
              <th>Evidence Ref</th>
            </tr>
          </thead>
          <tbody>
            ${expenseRowsHtml || '<tr><td colspan="10" style="text-align: center; color: #64748b;">No expenses recorded yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 8: GRANT & NEIP FUNDING
  // ==========================================
  private renderGrantTab(state: OpsDatabaseState, currency: string): string {
    const grantRowsHtml = state.grantBudget.map(cat => `
      <tr>
        <td style="font-weight: 700; text-align: center;">${cat.code}</td>
        <td style="font-weight: 600;">${cat.grantCategory}</td>
        <td style="text-align: right; font-weight: 700;">${currency}${cat.budget.toFixed(2)}</td>
        <td style="text-align: right;">${currency}${cat.stage1Planned.toFixed(2)}</td>
        <td style="text-align: right;">${currency}${cat.stage2Planned.toFixed(2)}</td>
        <td style="text-align: right; color: #d97706;">${currency}${(cat.committed || 0).toFixed(2)}</td>
        <td style="text-align: right; color: #15803d; font-weight: 700;">${currency}${(cat.spentFromNEIP || 0).toFixed(2)}</td>
        <td style="text-align: right; font-weight: 800; color: #075545;">${currency}${(cat.availableBudget || cat.budget).toFixed(2)}</td>
        <td>${cat.budgetFlag ? `<span class="ops-badge badge-attention">${cat.budgetFlag}</span>` : '<span class="ops-badge badge-ok">OK</span>'}</td>
      </tr>
    `).join('');

    return `
      <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0 0 8px 0;">
        NEIP Grant Funding Request &amp; Utilisation (${currency}80,000 Budget)
      </h2>
      <p style="font-size: 12px; color: var(--text-muted); margin: 0 0 16px 0;">
        Funding requested or approved is NOT cash. The working capital reserve (Category H) is held as cash and is not an operating expense.
      </p>

      <div class="ops-table-container">
        <table class="ops-table">
          <thead>
            <tr>
              <th style="text-align: center;">Code</th>
              <th>Grant Category</th>
              <th style="text-align: right;">Budget</th>
              <th style="text-align: right;">Stage 1</th>
              <th style="text-align: right;">Stage 2</th>
              <th style="text-align: right;">Committed</th>
              <th style="text-align: right;">Spent (NEIP)</th>
              <th style="text-align: right;">Available</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${grantRowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 9: ASSETS & DEPRECIATION
  // ==========================================
  private renderAssetsTab(state: OpsDatabaseState, currency: string): string {
    const assetRowsHtml = state.assets.map(a => `
      <tr>
        <td style="font-weight: 700; color: #075545;">${a.assetId}</td>
        <td style="font-weight: 600;">${a.description}</td>
        <td>${a.assetCategory}</td>
        <td>${a.purchaseDate}</td>
        <td style="text-align: right; font-weight: 700;">${currency}${a.purchaseCost.toFixed(2)}</td>
        <td>${a.custodian || 'N/A'}</td>
        <td style="text-align: center;">${a.condition}</td>
        <td style="text-align: right;">${currency}${roundMoney(a.monthlyDepreciation || 0).toFixed(2)}</td>
        <td style="text-align: right; color: #b91c1c;">${currency}${roundMoney(a.accumulatedDepreciation || 0).toFixed(2)}</td>
        <td style="text-align: right; font-weight: 800; color: #075545;">${currency}${roundMoney(a.netBookValue || a.purchaseCost).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
            Equipment &amp; Asset Register (Straight-Line Depreciation)
          </h2>
          <p style="font-size: 11px; color: var(--text-muted); margin: 2px 0 0 0;">
            Items &ge; ${currency}${state.settings.capitalThreshold} are capitalised and depreciated over useful life (default 4 years).
          </p>
        </div>
        <button id="btnNewAsset" class="btn-brand-primary">+ Add Equipment Asset</button>
      </div>
      <div class="ops-table-container">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Description</th>
              <th>Category</th>
              <th>Purchase Date</th>
              <th style="text-align: right;">Cost</th>
              <th>Custodian</th>
              <th style="text-align: center;">Condition</th>
              <th style="text-align: right;">Monthly Depr.</th>
              <th style="text-align: right;">Accum. Depr.</th>
              <th style="text-align: right;">Net Book Value</th>
            </tr>
          </thead>
          <tbody>
            ${assetRowsHtml || '<tr><td colspan="10" style="text-align: center; color: #64748b;">No assets registered yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 10: GOVERNANCE & RISK
  // ==========================================
  private renderGovernanceTab(state: OpsDatabaseState): string {
    const riskRowsHtml = state.risks.map(r => `
      <tr>
        <td style="font-weight: 700;">${r.riskId}</td>
        <td style="font-weight: 600;">${r.riskDescription}</td>
        <td>${r.category}</td>
        <td style="text-align: center;">${r.probability}</td>
        <td style="text-align: center;">${r.impact}</td>
        <td style="text-align: center; font-weight: 700;">${r.score || r.probability * r.impact}</td>
        <td>
          <span class="ops-badge ${r.rating === 'Critical' || r.rating === 'High' ? 'badge-attention' : r.rating === 'Medium' ? 'badge-pending' : 'badge-ok'}">
            ${r.rating}
          </span>
        </td>
        <td style="font-size: 12px;">${r.mitigation || 'No mitigation assigned'}</td>
        <td>${r.owner || 'Unassigned'}</td>
      </tr>
    `).join('');

    const complianceRowsHtml = state.compliance.map(cp => `
      <tr>
        <td style="font-weight: 700;">${cp.itemId}</td>
        <td>${cp.type}</td>
        <td style="font-weight: 600;">${cp.item}</td>
        <td><span class="ops-badge ${cp.status === 'Valid' ? 'badge-ok' : 'badge-pending'}">${cp.status}</span></td>
        <td style="font-size: 12px; color: #64748b;">${cp.notes || '-'}</td>
      </tr>
    `).join('');

    return `
      <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0 0 12px 0;">
        Risk Register (Probability &times; Impact Scoring)
      </h2>
      <div class="ops-table-container" style="margin-bottom: 32px;">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Risk ID</th>
              <th>Description</th>
              <th>Category</th>
              <th style="text-align: center;">Prob (1-5)</th>
              <th style="text-align: center;">Impact (1-5)</th>
              <th style="text-align: center;">Score</th>
              <th>Rating</th>
              <th>Mitigation</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            ${riskRowsHtml || '<tr><td colspan="9" style="text-align: center; color: #64748b;">No risks logged yet.</td></tr>'}
          </tbody>
        </table>
      </div>

      <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0 0 12px 0;">
        Compliance Prompts &amp; Policy Register (CP0001 – CP0011)
      </h2>
      <div class="ops-table-container">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Type</th>
              <th>Compliance Check Item</th>
              <th>Status</th>
              <th>Notes / Requirement Source</th>
            </tr>
          </thead>
          <tbody>
            ${complianceRowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 11: 52 CONTROL CHECKS & RECONCILIATION
  // ==========================================
  private renderChecksTab(evaluation: ReturnType<typeof opsStore.getChecksEvaluation>): string {
    const checkRowsHtml = evaluation.checks.map(c => `
      <tr>
        <td style="font-weight: 700; text-align: center;">${c.checkNumber}</td>
        <td style="font-weight: 600; color: #1e293b;">${c.name}</td>
        <td style="text-align: center; font-weight: 700;">${c.countOrValue}</td>
        <td>
          <span class="ops-badge ${c.severity === 'High' ? 'badge-attention' : c.severity === 'Medium' ? 'badge-pending' : 'badge-ok'}">
            ${c.severity}
          </span>
        </td>
        <td>
          <span class="ops-badge ${c.status === 'OK' ? 'badge-ok' : 'badge-attention'}">
            ${c.status}
          </span>
        </td>
        <td style="font-size: 11px; color: #64748b;">${c.whereToLook}</td>
        <td style="font-size: 12px; color: #334155;">${c.whyItMatters}</td>
      </tr>
    `).join('');

    const totalsRowsHtml = evaluation.controlTotals.map(t => `
      <tr>
        <td style="font-weight: 700; color: #075545;">${t.name}</td>
        <td style="text-align: right; font-weight: 700;">Diff: ${t.countOrValue.toFixed(2)}</td>
        <td><span class="ops-badge badge-reconciled">${t.status}</span></td>
        <td style="font-size: 12px; color: #64748b;">${t.whyItMatters}</td>
      </tr>
    `).join('');

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <div>
          <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0;">
            Data Quality &amp; Control Checks (52 Checks)
          </h2>
          <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">
            Automatic exception verification. Every ATTENTION item highlights records requiring management review.
          </p>
        </div>
        <span class="ops-badge ${evaluation.itemsNeedingAttention > 0 ? 'badge-attention' : 'badge-ok'}" style="padding: 6px 12px; font-size: 13px;">
          ${evaluation.itemsNeedingAttention} Attention Item(s)
        </span>
      </div>

      <div class="ops-table-container" style="margin-bottom: 32px;">
        <table class="ops-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">#</th>
              <th style="width: 25%;">Control Check Description</th>
              <th style="width: 10%; text-align: center;">Count / Value</th>
              <th style="width: 10%;">Severity</th>
              <th style="width: 10%;">Status</th>
              <th style="width: 15%;">Where to Look</th>
              <th style="width: 25%;">Why It Matters &amp; Action</th>
            </tr>
          </thead>
          <tbody>
            ${checkRowsHtml}
          </tbody>
        </table>
      </div>

      <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0 0 12px 0;">
        Workbook Reconciliation Control Totals (Must Balance 1:1)
      </h2>
      <div class="ops-table-container">
        <table class="ops-table">
          <thead>
            <tr>
              <th>Control Total Verification</th>
              <th style="text-align: right;">Difference</th>
              <th>Status</th>
              <th>Reconciliation Scope</th>
            </tr>
          </thead>
          <tbody>
            ${totalsRowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // TAB 12: PRINTABLE DOCUMENTS SUITE
  // ==========================================
  private renderPrintSuiteTab(state: OpsDatabaseState): string {
    const quotes = state.quotes;
    const invoices = state.invoices;
    const inspections = state.inspections;

    return `
      <h2 style="font-size: 16px; font-weight: 800; color: #075545; text-transform: uppercase; margin: 0 0 12px 0;">
        Official Printable Document Suite
      </h2>
      <p style="font-size: 12px; color: var(--text-muted); margin: 0 0 24px 0;">
        Generate pixel-perfect, branded printable PDFs directly in the browser for quotations, invoices, monthly reports, and property condition assessments.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        <!-- Printable Quotation -->
        <div class="ops-card">
          <h3 style="font-size: 16px; font-weight: 800; color: #075545; margin: 0 0 8px 0;">Official Quotation</h3>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 14px 0;">Select a quotation to view, print, or export as PDF with full terms.</p>
          <select id="selectPrintQuote" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1; margin-bottom: 12px; font-size: 13px;">
            ${quotes.map(q => `<option value="${q.quoteId}">Quote ${q.quoteId} &bull; ${q.customerName} (${state.settings.currencySymbol}${q.netOfDiscount})</option>`).join('')}
          </select>
          <button id="btnTriggerPrintQuote" class="btn-brand-primary" style="width: 100%; justify-content: center;">
            Generate Quotation PDF
          </button>
        </div>

        <!-- Printable Invoice -->
        <div class="ops-card">
          <h3 style="font-size: 16px; font-weight: 800; color: #075545; margin: 0 0 8px 0;">Tax Invoice</h3>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 14px 0;">Select an invoice to generate official receipt/invoice with balance.</p>
          <select id="selectPrintInvoice" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1; margin-bottom: 12px; font-size: 13px;">
            ${invoices.map(i => `<option value="${i.invoiceNo}">Invoice ${i.invoiceNo} &bull; ${i.customerName} (Bal: ${state.settings.currencySymbol}${i.balance})</option>`).join('')}
          </select>
          <button id="btnTriggerPrintInvoice" class="btn-brand-primary" style="width: 100%; justify-content: center;">
            Generate Invoice PDF
          </button>
        </div>

        <!-- Monthly Report -->
        <div class="ops-card">
          <h3 style="font-size: 16px; font-weight: 800; color: #075545; margin: 0 0 8px 0;">Monthly Management Report</h3>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 14px 0;">Executive summary of monthly results, cash flow, and control status.</p>
          <select id="selectPrintMonth" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1; margin-bottom: 12px; font-size: 13px;">
            <option value="2">March 2026</option>
            <option value="3">April 2026</option>
            <option value="5">June 2026</option>
            <option value="9">October 2026</option>
            <option value="10">November 2026</option>
          </select>
          <button id="btnTriggerPrintMonthly" class="btn-brand-primary" style="width: 100%; justify-content: center;">
            Generate Monthly Report PDF
          </button>
        </div>

        <!-- Property Condition Report -->
        <div class="ops-card">
          <h3 style="font-size: 16px; font-weight: 800; color: #075545; margin: 0 0 8px 0;">Property Condition Report</h3>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 14px 0;">Property Watch visual inspection report for owners and diaspora clients.</p>
          <select id="selectPrintInspection" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1; margin-bottom: 12px; font-size: 13px;">
            ${inspections.map(ins => `<option value="${ins.inspectionId}">Inspection ${ins.inspectionId} &bull; ${ins.customerName || ins.propertyId} (${ins.conditionRating})</option>`).join('')}
          </select>
          <button id="btnTriggerPrintInspection" class="btn-brand-primary" style="width: 100%; justify-content: center;">
            Generate Condition Report PDF
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  private bindEvents(): void {
    // Nav Tabs
    const tabBtns = this.mountEl.querySelectorAll<HTMLButtonElement>('.ops-nav-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as ActiveTab;
        if (tab) this.setTab(tab);
      });
    });

    // Top action buttons
    document.getElementById('btnPreloadDemo')?.addEventListener('click', () => {
      if (confirm('Preload verified demonstration dataset with full transactions, jobs, and financial history?')) {
        opsStore.loadState(createDemoState());
        alert('Demonstration dataset loaded and fully calculated!');
      }
    });

    document.getElementById('btnResetClean')?.addEventListener('click', () => {
      if (confirm('Reset system to clean production state (all transactional data emptied)?')) {
        opsStore.resetToEmpty();
        alert('System reset to clean production state.');
      }
    });

    document.getElementById('btnExportJson')?.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(opsStore.getState(), null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Civitas_Ops_Backup_${formatYMD(new Date())}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    // Quick creation modals
    document.getElementById('btnNewCustomer')?.addEventListener('click', () => this.showNewCustomerModal());
    document.getElementById('btnNewEnquiry')?.addEventListener('click', () => this.showNewEnquiryModal());
    document.getElementById('btnNewQuote')?.addEventListener('click', () => this.showNewQuoteModal());
    document.getElementById('btnNewJob')?.addEventListener('click', () => this.showNewJobModal());
    document.getElementById('btnNewInvoice')?.addEventListener('click', () => this.showNewInvoiceModal());
    document.getElementById('btnNewPayment')?.addEventListener('click', () => this.showNewPaymentModal());
    document.getElementById('btnNewExpense')?.addEventListener('click', () => this.showNewExpenseModal());
    document.getElementById('btnNewAssignment')?.addEventListener('click', () => this.showNewAssignmentModal());

    // Print triggers
    document.getElementById('btnTriggerPrintQuote')?.addEventListener('click', () => {
      const sel = (document.getElementById('selectPrintQuote') as HTMLSelectElement)?.value;
      if (sel) this.printQuote(sel);
    });

    document.getElementById('btnTriggerPrintInvoice')?.addEventListener('click', () => {
      const sel = (document.getElementById('selectPrintInvoice') as HTMLSelectElement)?.value;
      if (sel) this.printInvoice(sel);
    });

    document.getElementById('btnTriggerPrintMonthly')?.addEventListener('click', () => {
      const sel = parseInt((document.getElementById('selectPrintMonth') as HTMLSelectElement)?.value, 10);
      this.printMonthly(sel);
    });

    document.getElementById('btnTriggerPrintInspection')?.addEventListener('click', () => {
      const sel = (document.getElementById('selectPrintInspection') as HTMLSelectElement)?.value;
      if (sel) this.printInspection(sel);
    });

    // Table action print buttons
    this.mountEl.querySelectorAll<HTMLButtonElement>('.btn-print-quote').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id) this.printQuote(id);
      });
    });

    this.mountEl.querySelectorAll<HTMLButtonElement>('.btn-print-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id) this.printInvoice(id);
      });
    });
  }

  // ==========================================
  // PRINT EXECUTION
  // ==========================================
  private printQuote(quoteId: string): void {
    const state = opsStore.getState();
    const q = state.quotes.find(item => item.quoteId === quoteId);
    if (!q) return alert('Quote not found');
    const c = state.customers.find(item => item.customerId === q.customerId) || {
      customerId: q.customerId,
      customerName: q.customerName || 'Client',
      phone: '',
      email: '',
      area: 'East Legon'
    } as Customer;
    const p = state.properties.find(item => item.propertyId === q.propertyId);

    const html = renderPrintQuoteHtml(q, state.quoteLines, c, p, state.settings);
    this.openPrintWindow(html);
  }

  private printInvoice(invoiceNo: string): void {
    const state = opsStore.getState();
    const inv = state.invoices.find(item => item.invoiceNo === invoiceNo);
    if (!inv) return alert('Invoice not found');
    const c = state.customers.find(item => item.customerId === inv.customerId) || {
      customerId: inv.customerId,
      customerName: inv.customerName || 'Client',
      phone: '',
      email: '',
      area: 'Accra'
    } as Customer;

    const html = renderPrintInvoiceHtml(inv, c, state.payments, state.settings);
    this.openPrintWindow(html);
  }

  private printMonthly(monthIdx: number): void {
    const state = opsStore.getState();
    const mgmt = opsStore.getManagementAccounts();
    const m = mgmt.months[monthIdx] || mgmt.months[0];
    const evalData = opsStore.getChecksEvaluation();

    const html = renderPrintMonthlyReportHtml(m, state.settings.reportingYear, state.settings, evalData.itemsNeedingAttention);
    this.openPrintWindow(html);
  }

  private printInspection(inspectionId: string): void {
    const state = opsStore.getState();
    const ins = state.inspections.find(item => item.inspectionId === inspectionId);
    if (!ins) return alert('Inspection not found');
    const p = state.properties.find(item => item.propertyId === ins.propertyId);
    const c = p ? state.customers.find(item => item.customerId === p.customerId) : undefined;

    const html = renderPrintInspectionHtml(ins, p, c, state.settings);
    this.openPrintWindow(html);
  }

  private openPrintWindow(html: string): void {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      // Fallback in-page
      const printArea = document.getElementById('printArea');
      if (printArea) {
        printArea.innerHTML = html;
        printArea.style.display = 'block';
        window.print();
        printArea.style.display = 'none';
      }
      return;
    }
    printWin.document.open();
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Civitas Document Print</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { margin: 0; background: #ffffff; }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  // ==========================================
  // QUICK TRANSACTION MODALS
  // ==========================================
  private showNewCustomerModal(): void {
    const nextId = opsStore.nextCustomerId();
    const modalHtml = `
      <div class="ops-modal-backdrop" id="opsModal">
        <div class="ops-modal-content">
          <h3 style="font-size: 18px; font-weight: 800; color: #075545; margin: 0 0 16px 0;">Register New Customer (${nextId})</h3>
          <form id="formNewCustomer">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Customer Name *</label>
                <input type="text" id="custName" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Category</label>
                <select id="custCat" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="Homeowner">Homeowner</option>
                  <option value="Landlord">Landlord</option>
                  <option value="Tenant">Tenant</option>
                  <option value="Short-let operator">Short-let operator</option>
                  <option value="Diaspora owner">Diaspora owner</option>
                  <option value="Small business">Small business</option>
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Phone (WhatsApp) *</label>
                <input type="text" id="custPhone" required placeholder="+233 24 000 0000" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Email</label>
                <input type="email" id="custEmail" placeholder="client@example.com" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Area</label>
                <select id="custArea" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="East Legon">East Legon</option>
                  <option value="Spintex">Spintex</option>
                  <option value="Adenta">Adenta</option>
                  <option value="Tema Community 25">Tema Community 25</option>
                  <option value="Airport Residential">Airport Residential</option>
                  <option value="Other Accra">Other Accra</option>
                  <option value="Other Tema">Other Tema</option>
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Lead Source</label>
                <select id="custSource" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telephone">Telephone</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                  <option value="Social media">Social media</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom: 16px;">
              <label style="font-size: 12px; font-weight: 700; color: #475569;">Consent Recorded</label>
              <select id="custConsent" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                <option value="Yes">Yes (Consent recorded to store details)</option>
                <option value="No">No</option>
              </select>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" id="btnModalCancel" class="btn-brand-outline">Cancel</button>
              <button type="submit" class="btn-brand-primary">Save Customer</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(modalHtml, () => {
      document.getElementById('formNewCustomer')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const c: Customer = {
          customerId: nextId,
          customerName: (document.getElementById('custName') as HTMLInputElement).value,
          category: (document.getElementById('custCat') as HTMLSelectElement).value as any,
          phone: (document.getElementById('custPhone') as HTMLInputElement).value,
          email: (document.getElementById('custEmail') as HTMLInputElement).value,
          preferredChannel: 'WhatsApp',
          area: (document.getElementById('custArea') as HTMLSelectElement).value as any,
          leadSource: (document.getElementById('custSource') as HTMLSelectElement).value as any,
          dateAcquired: formatYMD(new Date()),
          relationshipOwner: 'Founder/CEO',
          consentRecorded: (document.getElementById('custConsent') as HTMLSelectElement).value as any,
          closed: 'No'
        };
        opsStore.addCustomer(c);
        this.closeModal();
      });
    });
  }

  private showNewEnquiryModal(): void {
    const nextId = opsStore.nextEnquiryId();
    const state = opsStore.getState();
    const modalHtml = `
      <div class="ops-modal-backdrop" id="opsModal">
        <div class="ops-modal-content">
          <h3 style="font-size: 18px; font-weight: 800; color: #075545; margin: 0 0 16px 0;">Log Sales Enquiry (${nextId})</h3>
          <form id="formNewEnquiry">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Contact Name *</label>
                <input type="text" id="enqContact" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Phone Number *</label>
                <input type="text" id="enqPhone" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Link Existing Customer (Optional)</label>
                <select id="enqCustomer" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="">None (New Prospect)</option>
                  ${state.customers.map(c => `<option value="${c.customerId}">${c.customerName}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Lead Source</label>
                <select id="enqSource" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telephone">Telephone</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                  <option value="Social media">Social media</option>
                  <option value="Google">Google</option>
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Service Interest</label>
                <input type="text" id="enqInterest" placeholder="e.g. Deep cleaning, leak fix" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Service Area</label>
                <select id="enqArea" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="East Legon">East Legon</option>
                  <option value="Spintex">Spintex</option>
                  <option value="Adenta">Adenta</option>
                  <option value="Tema Community 25">Tema Community 25</option>
                  <option value="Other Accra">Other Accra</option>
                </select>
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" id="btnModalCancel" class="btn-brand-outline">Cancel</button>
              <button type="submit" class="btn-brand-primary">Log Enquiry</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(modalHtml, () => {
      document.getElementById('formNewEnquiry')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const e: Enquiry = {
          enquiryId: nextId,
          enquiryDate: formatYMD(new Date()),
          contactName: (document.getElementById('enqContact') as HTMLInputElement).value,
          phone: (document.getElementById('enqPhone') as HTMLInputElement).value,
          customerId: (document.getElementById('enqCustomer') as HTMLSelectElement).value || undefined,
          leadSource: (document.getElementById('enqSource') as HTMLSelectElement).value as any,
          serviceInterest: (document.getElementById('enqInterest') as HTMLInputElement).value,
          area: (document.getElementById('enqArea') as HTMLSelectElement).value as any,
          stage: 'New Enquiry',
          qualified: 'Yes',
          owner: 'Founder/CEO'
        };
        opsStore.addEnquiry(e);
        this.closeModal();
      });
    });
  }

  private showNewQuoteModal(): void {
    const nextId = opsStore.nextQuoteId();
    const state = opsStore.getState();
    const modalHtml = `
      <div class="ops-modal-backdrop" id="opsModal">
        <div class="ops-modal-content">
          <h3 style="font-size: 18px; font-weight: 800; color: #075545; margin: 0 0 16px 0;">Prepare Quotation (${nextId})</h3>
          <form id="formNewQuote">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Customer *</label>
                <select id="quoteCust" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  ${state.customers.map(c => `<option value="${c.customerId}">${c.customerName}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Primary Catalogue Service *</label>
                <select id="quoteService" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  ${state.services.map(s => `<option value="${s.serviceId}">${s.service} (GH₵${s.standardPrice})</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Quantity</label>
                <input type="number" id="quoteQty" value="1" min="1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Discount (GH₵)</label>
                <input type="number" id="quoteDiscount" value="0" min="0" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
            </div>
            <div style="margin-bottom: 16px;">
              <label style="font-size: 12px; font-weight: 700; color: #475569;">Scope / Custom Description</label>
              <textarea id="quoteDesc" rows="2" placeholder="Specific areas, room layout, or inclusions" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" id="btnModalCancel" class="btn-brand-outline">Cancel</button>
              <button type="submit" class="btn-brand-primary">Generate Quotation</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(modalHtml, () => {
      document.getElementById('formNewQuote')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const custId = (document.getElementById('quoteCust') as HTMLSelectElement).value;
        const serviceId = (document.getElementById('quoteService') as HTMLSelectElement).value;
        const qty = parseInt((document.getElementById('quoteQty') as HTMLInputElement).value, 10) || 1;
        const discount = parseFloat((document.getElementById('quoteDiscount') as HTMLInputElement).value) || 0;
        const desc = (document.getElementById('quoteDesc') as HTMLTextAreaElement).value;

        const q: Quote = {
          quoteId: nextId,
          quoteDate: formatYMD(new Date()),
          customerId: custId,
          preparedBy: 'Founder/CEO',
          status: 'Sent',
          discountAmount: discount,
          discountApproval: discount > 0 ? 'Approved' : 'Not required'
        };

        const line = {
          quoteId: nextId,
          serviceId,
          customDescription: desc,
          quantity: qty
        };

        opsStore.addQuoteWithLines(q, [line]);
        this.closeModal();
      });
    });
  }

  private showNewJobModal(): void {
    const nextId = opsStore.nextJobId();
    const state = opsStore.getState();
    const modalHtml = `
      <div class="ops-modal-backdrop" id="opsModal">
        <div class="ops-modal-content">
          <h3 style="font-size: 18px; font-weight: 800; color: #075545; margin: 0 0 16px 0;">Book New Service Job (${nextId})</h3>
          <form id="formNewJob">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Customer *</label>
                <select id="jobCust" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  ${state.customers.map(c => `<option value="${c.customerId}">${c.customerName}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Service Item *</label>
                <select id="jobService" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  ${state.services.map(s => `<option value="${s.serviceId}">${s.service} (GH₵${s.standardPrice})</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Scheduled Date *</label>
                <input type="date" id="jobSchedDate" required value="${formatYMD(new Date())}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Agreed Quoted Amount (GH₵)</label>
                <input type="number" id="jobAmount" placeholder="Standard price or quote" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
            </div>
            <div style="margin-bottom: 16px;">
              <label style="font-size: 12px; font-weight: 700; color: #475569;">Job Description</label>
              <textarea id="jobDesc" rows="2" placeholder="Specific property instructions" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" id="btnModalCancel" class="btn-brand-outline">Cancel</button>
              <button type="submit" class="btn-brand-primary">Book Job</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(modalHtml, () => {
      document.getElementById('formNewJob')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const sId = (document.getElementById('jobService') as HTMLSelectElement).value;
        const sObj = state.services.find(s => s.serviceId === sId);
        const quotedAmt = parseFloat((document.getElementById('jobAmount') as HTMLInputElement).value) || (sObj ? sObj.standardPrice : 300);

        const j: Job = {
          jobId: nextId,
          customerId: (document.getElementById('jobCust') as HTMLSelectElement).value,
          serviceId: sId,
          description: (document.getElementById('jobDesc') as HTMLTextAreaElement).value,
          requestDate: formatYMD(new Date()),
          scheduledDate: (document.getElementById('jobSchedDate') as HTMLInputElement).value,
          status: 'Scheduled',
          manualQuotedAmount: quotedAmt,
          estimatedLabour: sObj ? sObj.standardDirectCost * 0.6 : 100,
          estimatedMaterials: sObj ? sObj.standardDirectCost * 0.3 : 50,
          estimatedTransport: sObj ? sObj.standardDirectCost * 0.1 : 30
        };

        opsStore.addJob(j);
        this.closeModal();
      });
    });
  }

  private showNewInvoiceModal(): void {
    const nextNo = opsStore.nextInvoiceNo();
    const state = opsStore.getState();
    const modalHtml = `
      <div class="ops-modal-backdrop" id="opsModal">
        <div class="ops-modal-content">
          <h3 style="font-size: 18px; font-weight: 800; color: #075545; margin: 0 0 16px 0;">Create Invoice (${nextNo})</h3>
          <form id="formNewInvoice">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Customer *</label>
                <select id="invCust" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  ${state.customers.map(c => `<option value="${c.customerId}">${c.customerName}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Link Job (Optional)</label>
                <select id="invJob" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="">No linked job (Direct billing)</option>
                  ${state.jobs.map(j => `<option value="${j.jobId}">Job ${j.jobId} &bull; ${j.customerName} (${j.description || 'Job'})</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Amount Before Tax (GH₵) *</label>
                <input type="number" id="invAmount" required min="1" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Payment Terms (Days)</label>
                <input type="number" id="invTerms" value="${state.settings.defaultPaymentTermsDays}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
            </div>
            <div style="margin-bottom: 16px;">
              <label style="font-size: 12px; font-weight: 700; color: #475569;">Notes / Billing Description</label>
              <input type="text" id="invNotes" placeholder="Service billing details" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" id="btnModalCancel" class="btn-brand-outline">Cancel</button>
              <button type="submit" class="btn-brand-primary">Issue Invoice</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(modalHtml, () => {
      document.getElementById('formNewInvoice')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const amt = parseFloat((document.getElementById('invAmount') as HTMLInputElement).value);
        const inv: Invoice = {
          invoiceNo: nextNo,
          customerId: (document.getElementById('invCust') as HTMLSelectElement).value,
          jobId: (document.getElementById('invJob') as HTMLSelectElement).value || undefined,
          invoiceDate: formatYMD(new Date()),
          termsDays: parseInt((document.getElementById('invTerms') as HTMLInputElement).value, 10) || 7,
          amountBeforeTax: amt,
          cancelled: 'No',
          notes: (document.getElementById('invNotes') as HTMLInputElement).value
        };
        opsStore.addInvoice(inv);
        this.closeModal();
      });
    });
  }

  private showNewPaymentModal(): void {
    const nextId = opsStore.nextPaymentId();
    const state = opsStore.getState();
    const modalHtml = `
      <div class="ops-modal-backdrop" id="opsModal">
        <div class="ops-modal-content">
          <h3 style="font-size: 18px; font-weight: 800; color: #075545; margin: 0 0 16px 0;">Record Cash Receipt (${nextId})</h3>
          <p style="font-size: 12px; color: var(--text-muted); margin: 0 0 14px 0;">Cash received is recorded here only, never from invoices. Cash &ne; Revenue.</p>
          <form id="formNewPayment">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Target Invoice *</label>
                <select id="payInvoice" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  ${state.invoices.filter(i => (i.balance || 0) > 0).map(i => `<option value="${i.invoiceNo}">${i.invoiceNo} &bull; ${i.customerName} (Bal: GH₵${i.balance})</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Amount Received (GH₵) *</label>
                <input type="number" id="payAmount" required min="0.01" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Payment Method</label>
                <select id="payMethod" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="Mobile money">Mobile money</option>
                  <option value="Bank transfer">Bank transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Transaction Reference *</label>
                <input type="text" id="payRef" required placeholder="MoMo / Bank transaction reference" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" id="btnModalCancel" class="btn-brand-outline">Cancel</button>
              <button type="submit" class="btn-brand-primary">Record Payment</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(modalHtml, () => {
      document.getElementById('formNewPayment')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const p: Payment = {
          paymentId: nextId,
          paymentDate: formatYMD(new Date()),
          invoiceNo: (document.getElementById('payInvoice') as HTMLSelectElement).value,
          amount: parseFloat((document.getElementById('payAmount') as HTMLInputElement).value),
          method: (document.getElementById('payMethod') as HTMLSelectElement).value as any,
          reference: (document.getElementById('payRef') as HTMLInputElement).value,
          receivedBy: 'Founder/CEO',
          reconciliationStatus: 'Unreconciled'
        };
        opsStore.addPayment(p);
        this.closeModal();
      });
    });
  }

  private showNewExpenseModal(): void {
    const nextId = opsStore.nextExpenseId();
    const state = opsStore.getState();
    const modalHtml = `
      <div class="ops-modal-backdrop" id="opsModal">
        <div class="ops-modal-content">
          <h3 style="font-size: 18px; font-weight: 800; color: #075545; margin: 0 0 16px 0;">Record Operating / Direct Expense (${nextId})</h3>
          <p style="font-size: 12px; color: var(--text-muted); margin: 0 0 14px 0;">Field labour is not recorded here (use Assignments). Direct costs must carry a Job ID.</p>
          <form id="formNewExpense">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Supplier / Vendor *</label>
                <input type="text" id="expSupplier" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Amount (GH₵) *</label>
                <input type="number" id="expAmount" required min="0.01" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Expense Category *</label>
                <select id="expCategory" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="Direct materials">Direct materials (Job supplies)</option>
                  <option value="Direct transport">Direct transport (Job travel)</option>
                  <option value="Marketing and customer acquisition">Marketing and customer acquisition</option>
                  <option value="Workforce training and safety">Workforce training and safety</option>
                  <option value="Administration and communication">Administration and communication</option>
                  <option value="Equipment (capital)">Equipment (capital)</option>
                  <option value="Digital operations">Digital operations</option>
                  <option value="Salaries and employer pension">Salaries and employer pension</option>
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Link Job (Required for Direct costs)</label>
                <select id="expJob" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="">None (Overhead running cost)</option>
                  ${state.jobs.map(j => `<option value="${j.jobId}">Job ${j.jobId} &bull; ${j.customerName}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Receipt Reference *</label>
                <input type="text" id="expEvidence" required placeholder="Receipt # or photo doc reference" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Funding Source</label>
                <select id="expFunding" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="Operations (customer receipts)">Operations (customer receipts)</option>
                  <option value="Own funds">Own funds</option>
                  <option value="NEIP funding">NEIP funding</option>
                </select>
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" id="btnModalCancel" class="btn-brand-outline">Cancel</button>
              <button type="submit" class="btn-brand-primary">Record Expense</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(modalHtml, () => {
      document.getElementById('formNewExpense')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const amt = parseFloat((document.getElementById('expAmount') as HTMLInputElement).value);
        const e: Expense = {
          expenseId: nextId,
          expenseDate: formatYMD(new Date()),
          supplier: (document.getElementById('expSupplier') as HTMLInputElement).value,
          category: (document.getElementById('expCategory') as HTMLSelectElement).value as any,
          jobId: (document.getElementById('expJob') as HTMLSelectElement).value || undefined,
          amount: amt,
          paymentMethod: 'Mobile money',
          paymentStatus: 'Paid',
          approvalStatus: amt > state.settings.spendingApprovalThreshold ? 'Approved' : 'Not required',
          approvedBy: amt > state.settings.spendingApprovalThreshold ? 'Founder/CEO' : undefined,
          evidenceReference: (document.getElementById('expEvidence') as HTMLInputElement).value,
          fundingSource: (document.getElementById('expFunding') as HTMLSelectElement).value as any
        };
        opsStore.addExpense(e);
        this.closeModal();
      });
    });
  }

  private showNewAssignmentModal(): void {
    const nextId = opsStore.nextAssignmentId();
    const state = opsStore.getState();
    const modalHtml = `
      <div class="ops-modal-backdrop" id="opsModal">
        <div class="ops-modal-content">
          <h3 style="font-size: 18px; font-weight: 800; color: #075545; margin: 0 0 16px 0;">Assign Field Professional (${nextId})</h3>
          <p style="font-size: 12px; color: var(--text-muted); margin: 0 0 14px 0;">Assign a vetted professional to an active job. Paid per assignment/day.</p>
          <form id="formNewAssignment">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Target Job *</label>
                <select id="asnJob" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  ${state.jobs.map(j => `<option value="${j.jobId}">Job ${j.jobId} &bull; ${j.customerName}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Field Professional *</label>
                <select id="asnContractor" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  ${state.contractors.map(c => `<option value="${c.contractorId}">${c.contractorName} (${c.trade}) &bull; GH₵${c.agreedRate}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Quantity (Days or Visits)</label>
                <input type="number" id="asnQty" value="1" min="1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Agreed Assignment Rate (GH₵) *</label>
                <input type="number" id="asnRate" required min="1" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" id="btnModalCancel" class="btn-brand-outline">Cancel</button>
              <button type="submit" class="btn-brand-primary">Confirm Assignment</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.showModal(modalHtml, () => {
      document.getElementById('formNewAssignment')?.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const a: Assignment = {
          assignmentId: nextId,
          jobId: (document.getElementById('asnJob') as HTMLSelectElement).value,
          contractorId: (document.getElementById('asnContractor') as HTMLSelectElement).value,
          assignmentDate: formatYMD(new Date()),
          payBasis: 'Per day',
          quantity: parseInt((document.getElementById('asnQty') as HTMLInputElement).value, 10) || 1,
          rate: parseFloat((document.getElementById('asnRate') as HTMLInputElement).value),
          paymentStatus: 'Unpaid'
        };
        opsStore.addAssignment(a);
        this.closeModal();
      });
    });
  }

  private showModal(html: string, onMounted: () => void): void {
    const existing = document.getElementById('opsModal');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild as HTMLElement);

    document.getElementById('btnModalCancel')?.addEventListener('click', () => this.closeModal());
    onMounted();
  }

  private closeModal(): void {
    document.getElementById('opsModal')?.remove();
  }
}

// Instantiate on DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    new OpsApp('opsMount');
  });
}
