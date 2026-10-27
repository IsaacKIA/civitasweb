/**
 * CIVITAS SMARTQUOTE™ — Commercial Pricing & Quotation Engine
 * 
 * Cost-Plus-Contribution Pricing Architecture:
 * Direct Service Cost = Labour + Consumables + Equipment Usage + Transport + Materials + Other Direct Costs
 * Estimated Selling Price = Direct Service Cost / (1 - Target Contribution Margin)
 * 
 * Confidentially abstracts internal contractor wage rates and internal margin metrics.
 * Client UI receives customer-safe indicative selling prices and structured quotation summaries.
 */

import { SITE_CONFIG } from './site-config.js';

export const SMARTQUOTE_CONFIG = {
  // Configurable Service Catalog (Ghana-market-sensitive pricing — Oct 2026)
  services: {
    'standard-cleaning': {
      id: 'standard-cleaning',
      name: 'Standard Property Cleaning',
      subtitle: 'Routine, recurring or scheduled surface upkeep',
      icon: 'sparkles',
      requiresAssessment: false,
      baseLabourHours: 2.5,
      crewSize: 1.5,
      baseLabourRatePerHour: 18,
      consumablesAllowance: 20,
      equipmentAllowance: 10,
      materialsAllowance: 0,
      targetMargin: 0.18,
      minimumCharge: 180,
      propertyMultipliers: {
        'apartment': 0.85,
        'townhouse': 1.0,
        'villa': 1.25,
        'commercial': 1.3
      },
      bedroomRates: {
        'studio-1': 0,
        '2-bed': 20,
        '3-bed': 40,
        '4-bed': 70,
        '5-plus': 100
      },
      bathroomRates: {
        '1': 0,
        '2': 15,
        '3': 30,
        '4': 50,
        '5-plus': 70
      },
      conditionMultipliers: {
        'well-maintained': 1.0,
        'lived-in': 1.1,
        'heavy-dust': 1.2
      },
      frequencyDiscounts: {
        'one-off': 0,
        'bi-weekly': 0.10,
        'monthly': 0.05
      }
    },

    'deep-cleaning': {
      id: 'deep-cleaning',
      name: 'Deep Cleaning',
      subtitle: 'Intensive restorative detailing, grime removal & steam sanitisation',
      icon: 'shield-check',
      requiresAssessment: false,
      baseLabourHours: 3.5,
      crewSize: 2,
      baseLabourRatePerHour: 20,
      consumablesAllowance: 40,
      equipmentAllowance: 25,
      materialsAllowance: 0,
      targetMargin: 0.20,
      minimumCharge: 350,
      propertyMultipliers: {
        'apartment': 0.85,
        'townhouse': 1.0,
        'villa': 1.3,
        'commercial': 1.4
      },
      bedroomRates: {
        'studio-1': 0,
        '2-bed': 35,
        '3-bed': 70,
        '4-bed': 120,
        '5-plus': 180
      },
      bathroomRates: {
        '1': 0,
        '2': 25,
        '3': 50,
        '4': 80,
        '5-plus': 120
      },
      conditionMultipliers: {
        'well-maintained': 1.0,
        'lived-in': 1.12,
        'heavy-dust': 1.25
      },
      frequencyDiscounts: {
        'one-off': 0,
        'bi-weekly': 0.12,
        'monthly': 0.08
      }
    },

    'move-in-out': {
      id: 'move-in-out',
      name: 'Move-In / Move-Out Cleaning',
      subtitle: 'Full handover readiness, internal cabinetry, disinfection & move polish',
      icon: 'truck',
      requiresAssessment: false,
      baseLabourHours: 3.5,
      crewSize: 2,
      baseLabourRatePerHour: 20,
      consumablesAllowance: 45,
      equipmentAllowance: 25,
      materialsAllowance: 10,
      targetMargin: 0.20,
      minimumCharge: 380,
      propertyMultipliers: {
        'apartment': 0.85,
        'townhouse': 1.0,
        'villa': 1.3,
        'commercial': 1.4
      },
      bedroomRates: {
        'studio-1': 0,
        '2-bed': 40,
        '3-bed': 80,
        '4-bed': 130,
        '5-plus': 190
      },
      bathroomRates: {
        '1': 0,
        '2': 30,
        '3': 60,
        '4': 90,
        '5-plus': 130
      },
      conditionMultipliers: {
        'well-maintained': 1.0,
        'lived-in': 1.12,
        'heavy-dust': 1.25
      },
      frequencyDiscounts: {
        'one-off': 0
      }
    },

    'turnover-cleaning': {
      id: 'turnover-cleaning',
      name: 'Apartment Turnover Cleaning',
      subtitle: 'Fast tenant & short-let turnaround (Airbnb / executive suites)',
      icon: 'refresh',
      requiresAssessment: false,
      baseLabourHours: 2.5,
      crewSize: 2,
      baseLabourRatePerHour: 18,
      consumablesAllowance: 25,
      equipmentAllowance: 15,
      materialsAllowance: 5,
      targetMargin: 0.18,
      minimumCharge: 220,
      propertyMultipliers: {
        'apartment': 0.9,
        'townhouse': 1.05,
        'villa': 1.25,
        'commercial': 1.2
      },
      bedroomRates: {
        'studio-1': 0,
        '2-bed': 25,
        '3-bed': 50,
        '4-bed': 90,
        '5-plus': 130
      },
      bathroomRates: {
        '1': 0,
        '2': 20,
        '3': 40,
        '4': 65,
        '5-plus': 90
      },
      conditionMultipliers: {
        'well-maintained': 1.0,
        'lived-in': 1.10,
        'heavy-dust': 1.20
      },
      frequencyDiscounts: {
        'one-off': 0,
        'bi-weekly': 0.15,
        'monthly': 0.08
      }
    },

    'condition-inspection': {
      id: 'condition-inspection',
      name: 'Property Condition Inspection',
      subtitle: 'Independent engineering audit of structural, electrical, plumbing & damp risks',
      icon: 'clipboard-check',
      requiresAssessment: false,
      baseLabourHours: 3,
      crewSize: 1.5,
      baseLabourRatePerHour: 30,
      consumablesAllowance: 15,
      equipmentAllowance: 45,
      materialsAllowance: 15,
      targetMargin: 0.20,
      minimumCharge: 350,
      propertyMultipliers: {
        'apartment': 0.85,
        'townhouse': 1.0,
        'villa': 1.25,
        'commercial': 1.4
      },
      sizeRates: {
        'under-250': 0,
        '250-500': 80,
        'over-500': 160
      },
      scopeRates: {
        'standard-audit': 0,
        'pre-purchase': 100,
        'diaspora-oversight': 80
      },
      conditionMultipliers: {
        'well-maintained': 1.0,
        'lived-in': 1.0,
        'heavy-dust': 1.0
      },
      frequencyDiscounts: {
        'one-off': 0,
        'quarterly': 0.15
      }
    },

    'minor-repairs': {
      id: 'minor-repairs',
      name: 'Minor Repairs & Maintenance',
      subtitle: 'Plumbing, electrical fixtures, AC servicing & handyman multi-trade repairs',
      icon: 'wrench',
      requiresAssessment: true,
      assessmentNotice: 'On-site technical diagnosis required. Repair costs vary according to spare part specifications, conduit access, and electrical/piping materials.'
    }
  },

  // Service Location Zones (Accra & Tema)
  locationZones: {
    'accra-core': {
      id: 'accra-core',
      name: 'Core Accra',
      suburbs: 'East Legon, Airport Res, Cantonments, Ridge, Osu, Labone',
      logisticsCost: 0,
      isServiceable: true
    },
    'accra-east': {
      id: 'accra-east',
      name: 'Greater Accra East',
      suburbs: 'Spintex, Trasacco, Dzorwulu, Abelemkpe, Adjiringanor',
      logisticsCost: 0,
      isServiceable: true
    },
    'tema': {
      id: 'tema',
      name: 'Tema & Surrounds',
      suburbs: 'Tema Comm 1–25, Sakumono, Lashibi',
      logisticsCost: 50, // Logistics zone allowance
      isServiceable: true
    },
    'accra-outer': {
      id: 'accra-outer',
      name: 'Outer Accra Suburbs',
      suburbs: 'Pokuase, Adenta West, Abokobi, Amasaman, Kasoa corridor',
      logisticsCost: 80,
      isServiceable: true
    },
    'custom-zone': {
      id: 'custom-zone',
      name: 'Outside Standard Service Zones',
      suburbs: 'Other regions or extended Greater Accra areas',
      logisticsCost: 0,
      isServiceable: false, // Triggers Custom Quotation Required
      customNotice: 'Civitas coordinates bespoke operations outside standard zones upon route review.'
    }
  },

  // Contextual Add-ons Catalog — Ghana-market-friendly add-on pricing
  addons: {
    // Cleaning Add-ons
    'balcony-wash': {
      id: 'balcony-wash',
      name: 'Balcony & Veranda Deep Pressure Wash',
      price: 60,
      categories: ['standard-cleaning', 'deep-cleaning', 'move-in-out', 'turnover-cleaning']
    },
    'exterior-windows': {
      id: 'exterior-windows',
      name: 'High-Reach Exterior Glass & Railing Polish',
      price: 80,
      categories: ['standard-cleaning', 'deep-cleaning', 'move-in-out', 'turnover-cleaning']
    },
    'appliance-interior': {
      id: 'appliance-interior',
      name: 'Major Appliance Interior Degreasing (Oven & Refrigerator)',
      price: 70,
      categories: ['standard-cleaning', 'deep-cleaning', 'move-in-out', 'turnover-cleaning']
    },
    'driveway-sweep': {
      id: 'driveway-sweep',
      name: 'Compound, Paved Carpark & Driveway Power Scrub',
      price: 80,
      categories: ['standard-cleaning', 'deep-cleaning', 'move-in-out', 'turnover-cleaning']
    },

    // Inspection Add-ons
    'drone-roof': {
      id: 'drone-roof',
      name: 'Aerial Drone Roof & Gutter Audit',
      price: 180,
      categories: ['condition-inspection']
    },
    'water-lab-test': {
      id: 'water-lab-test',
      name: 'Borehole / Storage Tank Water Quality Laboratory Test',
      price: 200,
      categories: ['condition-inspection']
    },
    'earthing-test': {
      id: 'earthing-test',
      name: 'Precision Earth Electrode & Electrical Surge Testing',
      price: 120,
      categories: ['condition-inspection']
    }
  },

  // Rounding Rule: round to nearest GH₵ 10 for clean Ghanaian market presentation
  roundingStep: 10
};

/**
 * Calculates a verified indicative quotation based on the cost-plus-contribution model.
 * 
 * @param {Object} input
 * @param {string} input.serviceId - Selected service identifier
 * @param {string} input.propertyType - apartment | townhouse | villa | commercial
 * @param {string} [input.bedrooms] - studio-1 | 2-bed | 3-bed | 4-bed | 5-plus
 * @param {string} [input.bathrooms] - 1 | 2 | 3 | 4 | 5-plus
 * @param {string} [input.condition] - well-maintained | lived-in | heavy-dust
 * @param {string} [input.frequency] - one-off | bi-weekly | monthly
 * @param {string} [input.propertySize] - under-250 | 250-500 | over-500 (Inspection)
 * @param {string} [input.inspectionType] - standard-audit | pre-purchase | diaspora-oversight
 * @param {string} input.locationZone - accra-core | accra-east | tema | accra-outer | custom-zone
 * @param {string[]} [input.addons] - Array of add-on identifiers
 * @param {string} [input.repairCategory] - For minor repairs
 * @param {string} [input.customerNotes] - Additional customer remarks
 * @returns {Object} Quotation Result
 */
export function calculateSmartQuote(input = {}) {
  const service = SMARTQUOTE_CONFIG.services[input.serviceId];

  // 1. Service Validation
  if (!service) {
    return {
      status: 'invalid_service',
      message: 'Please select a valid Civitas service to proceed.'
    };
  }

  // 2. Services requiring physical inspection
  if (service.requiresAssessment) {
    return {
      status: 'assessment_required',
      serviceName: service.name,
      requiresAssessment: true,
      headline: 'Diagnostic Site Assessment Required',
      explanation: service.assessmentNotice || 'Technical diagnosis is required prior to formal quotation.',
      indicativePrice: null,
      disclaimer: 'Due to varying material costs, circuit topologies, or plumbing conditions, an on-site artisan assessment is required for an exact quote.'
    };
  }

  // 3. Location Validation
  const zone = SMARTQUOTE_CONFIG.locationZones[input.locationZone] || SMARTQUOTE_CONFIG.locationZones['accra-core'];
  if (!zone.isServiceable) {
    return {
      status: 'custom_quotation',
      serviceName: service.name,
      customQuotation: true,
      headline: 'Custom Quotation Required',
      explanation: zone.customNotice || 'This address is outside our standard automated quotation zones.',
      indicativePrice: null,
      disclaimer: 'Civitas supports bespoke arrangements for properties outside standard Accra/Tema service corridors upon logistics review.'
    };
  }

  // 4. Contribution Margin & Cost Calculation
  const rawMargin = service.targetMargin !== undefined ? service.targetMargin : 0.40;
  if (typeof rawMargin !== 'number' || isNaN(rawMargin) || rawMargin < 0 || rawMargin >= 1.0) {
    throw new Error('Invalid target margin configuration: must be >= 0 and < 1.0');
  }
  const divisor = 1 - rawMargin;

  // Baseline Labour Cost
  const baseLabourCost = (service.baseLabourHours || 4) * (service.crewSize || 2) * (service.baseLabourRatePerHour || 25);
  
  // Property Scale Multiplier
  const propMultiplier = service.propertyMultipliers?.[input.propertyType] || 1.0;
  
  // Room / Feature Additions
  let roomAdditions = 0;
  if (service.bedroomRates && input.bedrooms) {
    roomAdditions += service.bedroomRates[input.bedrooms] || 0;
  }
  if (service.bathroomRates && input.bathrooms) {
    roomAdditions += service.bathroomRates[input.bathrooms] || 0;
  }
  if (service.sizeRates && input.propertySize) {
    roomAdditions += service.sizeRates[input.propertySize] || 0;
  }
  if (service.scopeRates && input.inspectionType) {
    roomAdditions += service.scopeRates[input.inspectionType] || 0;
  }

  // Condition Multiplier
  const conditionMult = service.conditionMultipliers?.[input.condition] || 1.0;

  // Compute Direct Service Cost
  const directLabour = (baseLabourCost + roomAdditions) * propMultiplier * conditionMult;
  const consumables = (service.consumablesAllowance || 0) * propMultiplier;
  const equipment = (service.equipmentAllowance || 0);
  const materials = (service.materialsAllowance || 0);
  const logistics = zone.logisticsCost || 0;

  const totalDirectCost = directLabour + consumables + equipment + materials + logistics;

  // Estimated Selling Price before add-ons
  let rawSellingPrice = totalDirectCost / divisor;

  // Add-ons addition
  let addonsTotal = 0;
  const activeAddons = [];
  if (Array.isArray(input.addons)) {
    input.addons.forEach(addonId => {
      const addon = SMARTQUOTE_CONFIG.addons[addonId];
      if (addon && addon.categories.includes(service.id)) {
        addonsTotal += addon.price;
        activeAddons.push({
          id: addon.id,
          name: addon.name,
          price: addon.price
        });
      }
    });
  }

  // Frequency Discount (applied to base service)
  const discountRate = service.frequencyDiscounts?.[input.frequency] || 0;
  rawSellingPrice = rawSellingPrice * (1 - discountRate);

  // Combine with Add-ons
  let finalPrice = rawSellingPrice + addonsTotal;

  // Enforce Minimum Charge
  if (service.minimumCharge && finalPrice < service.minimumCharge) {
    finalPrice = service.minimumCharge;
  }

  // Consistent Rounding Rule
  const step = SMARTQUOTE_CONFIG.roundingStep || 10;
  finalPrice = Math.round(finalPrice / step) * step;

  return {
    status: 'estimate',
    serviceId: service.id,
    serviceName: service.name,
    propertyType: input.propertyType || 'Residential',
    locationName: zone.name,
    locationZone: zone.id,
    suburbsSummary: zone.suburbs,
    logisticsCost: logistics,
    indicativePrice: finalPrice,
    addonsTotal: addonsTotal,
    addons: activeAddons,
    discountApplied: discountRate > 0 ? `${Math.round(discountRate * 100)}%` : null,
    currency: 'GH₵',
    disclaimer: 'This is an indicative estimate, not a final quotation. Final pricing is subject to confirmation of service scope, property condition, accessibility, materials and applicable taxes.'
  };
}

/**
 * Builds the exact structured WhatsApp quotation request message
 * as mandated in the specification.
 */
export function buildWhatsAppQuotationMessage({
  serviceName,
  propertyType,
  propertySize,
  propertyCondition,
  location,
  additionalServices,
  indicativeEstimate,
  quotationStatus,
  customerNotes
}) {
  const lines = [
    'CIVITAS SMARTQUOTE — QUOTATION REQUEST',
    `Service: ${serviceName || 'Property Care'}`,
    `Property Type: ${propertyType || 'Residential'}`,
    `Property Size: ${propertySize || 'Standard'}`,
    `Property Condition: ${propertyCondition || 'Standard'}`,
    `Location: ${location || 'Accra / Tema'}`,
    `Additional Services: ${additionalServices || 'None selected'}`,
    `Indicative Estimate: ${indicativeEstimate || 'Site Assessment Required'}`,
    `Quotation Status: ${quotationStatus || 'Indicative Estimate'}`,
    customerNotes ? `Additional Notes: ${customerNotes}` : null,
    '',
    'Message:',
    '“Hello Civitas, I would like to request a formal quotation based on the details above. Kindly advise on the next steps.”'
  ].filter(line => line !== null);

  const rawMessage = lines.join('\n');
  const encoded = encodeURIComponent(rawMessage);
  const waNumber = SITE_CONFIG?.contact?.whatsappNumber || '233209527426';
  
  return {
    rawMessage,
    whatsappUrl: `https://wa.me/${waNumber}?text=${encoded}`
  };
}
