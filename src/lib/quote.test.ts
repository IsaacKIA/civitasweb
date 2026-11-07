import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PRICE_LIST } from "../config/pricing.ts";
import {
  buildQuote,
  recommendService,
  applyQuoteAdjustment,
  type QuoteInput,
} from "./quote.ts";

describe("Smart Quote engine (buildQuote)", () => {
  test("matches every service and bedroom size (1, 2, 3) against PRICE_LIST", () => {
    const expectedMatrix = {
      standard: { "1": 290, "2": 320, "3": 530 },
      apartmentReady: { "1": 290, "2": 350, "3": 540 },
      moveInOut: { "1": 530, "2": 570, "3": 660 },
      deep: { "1": 610, "2": 830, "3": 960 },
    } as const;

    const defaultBathroomsForSize = { "1": 1, "2": 2, "3": 2 } as const;

    for (const [service, sizes] of Object.entries(expectedMatrix) as [
      keyof typeof expectedMatrix,
      Record<"1" | "2" | "3", number>,
    ][]) {
      for (const [bedrooms, expectedPrice] of Object.entries(sizes) as [
        "1" | "2" | "3",
        number,
      ][]) {
        const quote = buildQuote(
          {
            service,
            bedrooms,
            bathrooms: defaultBathroomsForSize[bedrooms],
            area: "accra",
            issueDate: "2026-11-07",
          },
          PRICE_LIST
        );

        assert.equal(quote.total, expectedPrice, `${service} ${bedrooms}-bed`);
        assert.equal(quote.status, "instant");
        assert.equal(quote.statusBadge, "Instant quote");
        assert.equal(quote.reasons.length, 0);
        assert.equal(quote.lines.length, 1);
        assert.equal(quote.lines[0].amount, expectedPrice);
        assert.equal(quote.priceListVersion, "1.2");
        assert.equal(quote.validUntil, "2026-11-21");
      }
    }
  });

  test("is purely deterministic: same inputs always give the exact same price and reference", () => {
    const input: QuoteInput = {
      service: "deep",
      bedrooms: "2",
      bathrooms: 2,
      addons: { ovenInterior: 1, balconyWash: 2 },
      area: "tema",
      issueDate: "2026-11-07",
    };

    const q1 = buildQuote(input, PRICE_LIST);
    const q2 = buildQuote(
      { ...input, customerName: "Ama Mensah", suburb: "East Legon" },
      PRICE_LIST
    );

    assert.equal(q1.total, q2.total);
    assert.equal(q1.reference, q2.reference);
    assert.equal(q1.total, 830 + 60 + 40 * 2);
  });

  test("automatically adds Extra bathroom, deep level (GH₵70 each) when bathrooms exceed size profile", () => {
    // 1-bed profile includes 1 bathroom; 3 bathrooms means 2 extra bathrooms (+140)
    const q1Bed = buildQuote(
      {
        service: "standard",
        bedrooms: "1",
        bathrooms: 3,
        area: "accra",
      },
      PRICE_LIST
    );
    assert.equal(q1Bed.extraBathroomsAutoAdded, 2);
    assert.equal(q1Bed.total, 290 + 2 * 70);
    const extraLine = q1Bed.lines.find(
      (l) => l.id === "addon-extraBathroomDeep"
    );
    assert.ok(extraLine);
    assert.equal(extraLine.quantity, 2);
    assert.equal(extraLine.amount, 140);
    assert.equal(extraLine.autoAdded, true);

    // 3-bed profile includes 2 bathrooms; 4 bathrooms means 2 extra bathrooms (+140)
    const q3Bed = buildQuote(
      {
        service: "moveInOut",
        bedrooms: "3",
        bathrooms: 4,
        area: "accra",
      },
      PRICE_LIST
    );
    assert.equal(q3Bed.extraBathroomsAutoAdded, 2);
    assert.equal(q3Bed.total, 660 + 140);
  });

  test("calculates all add-ons accurately", () => {
    const quote = buildQuote(
      {
        service: "apartmentReady",
        bedrooms: "2",
        bathrooms: 2,
        addons: {
          ovenInterior: 2, // 2 * 60 = 120
          fridgeInterior: 1, // 1 * 40 = 40
          balconyWash: 2, // 2 * 40 = 80
          compoundWash: 1, // 1 * 140 = 140
          windowTracks: 1, // 1 * 40 = 40
          rubbishTrip: 3, // 3 * 30 = 90
        },
        area: "accra",
      },
      PRICE_LIST
    );

    const expectedAddons = 120 + 40 + 80 + 140 + 40 + 90;
    assert.equal(quote.total, 350 + expectedAddons);
    assert.equal(quote.status, "instant");
  });

  test("triggers 'needs_confirmation' for 4+ bedrooms and each condition flag without hidden price surcharges", () => {
    // 1. 4+ bedrooms
    const q4Plus = buildQuote(
      {
        service: "deep",
        bedrooms: "4+",
        bathrooms: 2,
        area: "accra",
      },
      PRICE_LIST
    );
    assert.equal(q4Plus.status, "needs_confirmation");
    assert.equal(q4Plus.statusBadge, "Needs confirmation");
    assert.equal(q4Plus.total, 960); // 3-bed starting price
    assert.equal(q4Plus.isStartingTotal, true);
    assert.ok(q4Plus.reasons.some((r) => r.includes("4 or more bedrooms")));

    // 2. Each condition flag
    const flags = [
      "stairsWithoutLift",
      "difficultAccess",
      "noUtilities",
      "heavilySoiled",
      "heavyFurniture",
    ] as const;

    for (const flag of flags) {
      const qCond = buildQuote(
        {
          service: "standard",
          bedrooms: "2",
          bathrooms: 2,
          conditions: { [flag]: true },
          area: "accra",
        },
        PRICE_LIST
      );
      assert.equal(
        qCond.status,
        "needs_confirmation",
        `Expected needs_confirmation for ${flag}`
      );
      // Price must NOT change silently
      assert.equal(qCond.total, 320);
      assert.equal(qCond.reasons.length, 1);
    }

    // 3. Location outside Accra/Tema
    const qOtherArea = buildQuote(
      {
        service: "standard",
        bedrooms: "1",
        bathrooms: 1,
        area: "other",
      },
      PRICE_LIST
    );
    assert.equal(qOtherArea.status, "needs_confirmation");
    assert.equal(qOtherArea.total, 290);
    assert.ok(
      qOtherArea.reasons.some((r) => r.includes("outside Accra and Tema"))
    );

    // 4. Property layout exceeds standard profile
    const qProfile = buildQuote(
      {
        service: "standard",
        bedrooms: "2",
        bathrooms: 2,
        matchesSizeProfile: false,
        area: "accra",
      },
      PRICE_LIST
    );
    assert.equal(qProfile.status, "needs_confirmation");
    assert.equal(qProfile.total, 320);
  });

  test("deposit policy applies 30% deposit for jobs of GH₵300 or more", () => {
    const under300 = buildQuote(
      {
        service: "standard",
        bedrooms: "1",
        bathrooms: 1,
        area: "accra",
      },
      PRICE_LIST
    );
    assert.equal(under300.total, 290);
    assert.equal(under300.depositRequired, false);
    assert.equal(under300.depositAmount, 0);

    const over300 = buildQuote(
      {
        service: "standard",
        bedrooms: "2",
        bathrooms: 2,
        area: "accra",
      },
      PRICE_LIST
    );
    assert.equal(over300.total, 320);
    assert.equal(over300.depositRequired, true);
    assert.equal(over300.depositAmount, 96);
    assert.equal(over300.balanceAmount, 224);
  });

  test("recommendService suggests appropriate service with plain-language reason", () => {
    const recMove = recommendService({
      lastCleaned: "within-2-weeks",
      visibleBuildUp: "no",
      occupancyTransition: "moving",
    });
    assert.equal(recMove.service, "moveInOut");

    const recDeep = recommendService({
      lastCleaned: "within-2-weeks",
      visibleBuildUp: "yes",
      occupancyTransition: "staying",
    });
    assert.equal(recDeep.service, "deep");

    const recApt = recommendService({
      lastCleaned: "within-2-weeks",
      visibleBuildUp: "no",
      occupancyTransition: "short-stay-turnover",
    });
    assert.equal(recApt.service, "apartmentReady");

    const recStd = recommendService({
      lastCleaned: "within-2-weeks",
      visibleBuildUp: "no",
      occupancyTransition: "staying",
    });
    assert.equal(recStd.service, "standard");
  });

  test("applyQuoteAdjustment requires a reason and records both previousTotal and confirmedTotal", () => {
    const baseQuote = buildQuote(
      {
        service: "deep",
        bedrooms: "3",
        bathrooms: 2,
        conditions: { heavilySoiled: true },
        area: "accra",
      },
      PRICE_LIST
    );

    assert.throws(() => applyQuoteAdjustment(baseQuote, 1100, "   "));

    const adjusted = applyQuoteAdjustment(
      baseQuote,
      1100,
      "Additional 2 hours required for post-builders cement residue removal on balcony tiles.",
      "2026-11-08"
    );
    assert.ok(adjusted.changeLog);
    assert.equal(adjusted.changeLog.previousTotal, 960);
    assert.equal(adjusted.changeLog.confirmedTotal, 1100);
    assert.equal(adjusted.changeLog.customerApproved, false);
  });
});

