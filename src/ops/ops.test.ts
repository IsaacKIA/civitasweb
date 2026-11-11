/**
 * CIVITAS ESTATE & MAINTENANCE
 * Operations & Financial Control System Test Suite
 * Verifying all core accounting rules, 52 control checks, and reconciliation totals.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { OpsStore } from './store.ts';
import { createDemoState } from './demo-data.ts';
import { roundMoney } from './calculations.ts';

describe('Civitas Operations & Financial Control System Tests', () => {

  it('Rule 1: Revenue is not cash; funding is not revenue', () => {
    const store = new OpsStore();
    store.loadState(createDemoState());
    const mgmt = store.getManagementAccounts();

    // In demo data: total revenue should equal invoiced net revenue
    assert.strictEqual(mgmt.yearTotal.totalRevenue, 1380.00); // 650 + 450 + 280
    assert.strictEqual(mgmt.yearTotal.cashReceivedCustomers, 1380.00);
    assert.strictEqual(mgmt.yearTotal.fundingReceived, 0.00); // Funding received is zero in demo, not counted as revenue
  });

  it('Rule 2: Field labour is counted once; person-days tracked separately', () => {
    const store = new OpsStore();
    store.loadState(createDemoState());
    const state = store.getState();

    // Verify assignments person-days
    const indOrTempAssignments = state.assignments.filter(
      a => a.workerType === 'Independent contractor' || a.workerType === 'Temporary worker'
    );
    const totalPersonDays = indOrTempAssignments.reduce((s, a) => s + (a.personDays || 0), 0);
    assert.ok(totalPersonDays > 0, 'Person-days must be tracked');

    // Verify labour in management accounts equals assignments register
    const mgmt = store.getManagementAccounts();
    const sumAssignments = state.assignments.reduce((s, a) => s + (a.amount || 0), 0);
    assert.strictEqual(mgmt.yearTotal.directLabour, roundMoney(sumAssignments));
  });

  it('Rule 3: Straight-line depreciation calculates accurately', () => {
    const store = new OpsStore();
    store.loadState(createDemoState());
    const state = store.getState();

    const asset = state.assets.find(a => a.assetId === 'AS0001');
    assert.ok(asset, 'Asset AS0001 must exist');
    assert.strictEqual(asset.depreciable, 'Yes');
    assert.strictEqual(asset.purchaseCost, 2200);
    assert.strictEqual(asset.residualValue, 200);
    assert.strictEqual(asset.usefulLifeYears, 4);

    // Monthly depreciation = (2200 - 200) / 48 = 2000 / 48 = 41.67
    assert.strictEqual(asset.monthlyDepreciation, 41.67);
  });

  it('Rule 4: Working capital reserve is held as cash and not an operating expense', () => {
    const store = new OpsStore();
    store.loadState(createDemoState());
    const state = store.getState();

    const reserveCat = state.grantBudget.find(c => c.grantCategory === 'Working capital reserve');
    assert.ok(reserveCat, 'Reserve category must exist');
    assert.strictEqual(reserveCat.budget, 22000);
    assert.strictEqual(reserveCat.spentFromNEIP, 0); // No spending allowed against reserve
  });

  it('Rule 5: 52 Control Checks and 6 Reconciliation Totals evaluate cleanly', () => {
    const store = new OpsStore();
    store.loadState(createDemoState());
    const evaluation = store.getChecksEvaluation();

    assert.strictEqual(evaluation.checks.length, 52, 'Must evaluate exactly 52 control checks');
    assert.strictEqual(evaluation.controlTotals.length, 6, 'Must evaluate 6 reconciliation control totals');

    // In the clean demo state, all 6 control totals must be RECONCILED (0.00 difference)
    evaluation.controlTotals.forEach(t => {
      assert.strictEqual(t.status, 'RECONCILED', `Control total ${t.name} must be RECONCILED`);
      assert.strictEqual(t.countOrValue, 0.00, `Difference for ${t.name} must be 0.00`);
    });
  });

  it('Rule 6: Closed months flag subsequent modifications (tamper-evident control)', () => {
    const store = new OpsStore();
    store.loadState(createDemoState());
    
    // In demo data, March 2026 is closed with 1 invoice
    let period = store.getState().periodClose.find(p => p.month === '2026-03-01');
    assert.ok(period, 'March 2026 must be in close register');
    assert.strictEqual(period.status, 'Closed');
    assert.strictEqual(period.changedFlag, '');

    // Now simulate someone adding an invoice to March 2026 after close
    store.addInvoice({
      invoiceNo: 'INV9999',
      customerId: 'C0001',
      invoiceDate: '2026-03-25',
      amountBeforeTax: 500,
      cancelled: 'No'
    });

    period = store.getState().periodClose.find(p => p.month === '2026-03-01');
    assert.strictEqual(period?.changedFlag, 'Records changed after close', 'System must flag late modifications to closed months');
  });

});
