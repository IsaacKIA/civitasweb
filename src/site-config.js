/**
 * CIVITAS ESTATE & MAINTENANCE
 * Global Site Configuration & Business Data Engine
 */

import {
  PRICE_LIST,
  PRICE_VERSION_LINE,
  HOW_WE_SET_PRICES,
  formatPrice,
  formatFromPrice,
} from './config/pricing.ts';

export const SITE_CONFIG = {
  mode: 'live',
  priceVersionLine: PRICE_VERSION_LINE,

  brand: {
    name: 'Civitas Estate & Maintenance',
    legalName: 'Civitas Estate & Maintenance Ltd.',
    shortName: 'Civitas',
    tagline: 'Smart Living. Sustainable Legacy.',
    positioning: 'Professional property care, dependable maintenance and thoughtful oversight for homes and businesses in Accra and Tema.',
    url: 'https://www.civitasestate.com',
    establishedYear: '2026',
    country: 'Ghana',
    cities: ['Accra', 'Tema']
  },

  assets: {
    logoOriginal: '/assets/logos/Civitas_Official_Logo_Original.png',
    logoTransparent: '/assets/logos/Civitas_Official_Logo_Transparent.png',
    logoWeb: '/assets/logos/Civitas_Official_Logo_Web.webp',
    symbolCrop: '/assets/logos/Civitas_Original_Symbol_Crop.png',
    symbol256: '/assets/logos/Civitas_Symbol_256.png',
    favicon: '/favicon.png'
  },

  contact: {
    whatsappNumber: '233209527426',
    whatsappDisplay: '+233 (0) 20 952 7426',
    phone: '+233 (0) 20 952 7426',
    email: 'admin@civitasestate.com',
    careersEmail: 'admin@civitasestate.com',
    officeAddress: 'Accra & Tema, Greater Accra Region, Ghana',
    workingHours: 'Monday – Saturday: 8:00 AM – 6:00 PM GMT'
  },

  divisions: [
    {
      id: 'civitas-fix',
      name: 'Civitas Fix',
      subtitle: 'Cleaning, Repairs & Maintenance',
      headline: 'Cleaning, Repairs & Maintenance Made Simpler.',
      summary: 'From standard residential cleaning, Apartment Ready turnarounds, move-in/move-out cleaning and deep cleaning to minor defined-fault repairs, Civitas Fix keeps your property in good condition with clear scope-based pricing.',
      url: '/services/civitas-fix/',
      badge: 'Immediate Upkeep',
      accent: 'emerald',
      image: '/assets/Images/Plumbing work.png',
      categories: [
        {
          title: 'Cleaning Services',
          items: [
            { name: PRICE_LIST.cleaning.standard.label, desc: `From ${formatPrice(PRICE_LIST.cleaning.standard['1'])} — Reachable surfaces, accessible floors, kitchen counters and bathroom fixtures.` },
            { name: PRICE_LIST.cleaning.apartmentReady.label, desc: `From ${formatPrice(PRICE_LIST.cleaning.apartmentReady['1'])} — Adds cabinet fronts, splashback, doors, switches and interior window glass.` },
            { name: PRICE_LIST.cleaning.moveInOut.label, desc: `From ${formatPrice(PRICE_LIST.cleaning.moveInOut['1'])} — Adds empty cupboard interiors, appliance exteriors, skirting boards and spot-cleaning.` },
            { name: PRICE_LIST.cleaning.deep.label, desc: `From ${formatPrice(PRICE_LIST.cleaning.deep['1'])} — Intensive kitchen degreasing, bathroom descaling, interior window tracks and detailed edges.` }
          ]
        },
        {
          title: 'Repairs & Assessments',
          items: [
            { name: 'Minor Repair', desc: `${formatFromPrice(PRICE_LIST.fromPrices.minorRepair)} for one small defined fault; replacement parts quoted separately.` },
            { name: 'Property Condition Assessment', desc: `${formatFromPrice(PRICE_LIST.fromPrices.assessment)} for a structured on-site condition check and written summary.` }
          ]
        }
      ]
    },
    {
      id: 'civitas-care',
      name: 'Civitas Care',
      subtitle: 'Planned Property Care & Preventive Maintenance',
      headline: 'Better Property Care Begins Before Problems Become Expensive.',
      summary: 'Civitas Care provides scheduled inspections, maintenance planning and service coordination to help property owners stay informed and organized.',
      url: '/services/civitas-care/',
      badge: 'Monthly Care',
      accent: 'terracotta',
      image: '/assets/Images/maintenance officer.png',
      plans: [
        {
          id: 'care-essential',
          name: 'Care Essential',
          price: formatFromPrice(PRICE_LIST.fromPrices.careEssential),
          frequency: 'per month',
          description: 'For property owners who need scheduled monthly condition checks and repair coordination.',
          features: [
            '1 scheduled condition inspection per month',
            'Written condition summary report with photos',
            'Preventive maintenance reminders',
            'Coordination of approved repair work',
            '30 days written notice before any price change'
          ],
          idealFor: 'Apartments, small residential homes, or light-use properties.',
          isPopular: false
        },
        {
          id: 'care-plus',
          name: 'Care Plus',
          price: formatFromPrice(PRICE_LIST.fromPrices.carePlus),
          frequency: 'per month',
          description: 'For properties requiring more frequent attention, detailed reporting and priority coordination.',
          features: [
            'Up to 2 scheduled inspections per month',
            'Detailed photographic condition reporting',
            'Comprehensive maintenance scheduling',
            'Priority coordination of approved service requests',
            'Dedicated care coordinator'
          ],
          idealFor: 'Family homes, rental investments, and busy households.',
          isPopular: true
        }
      ]
    },
    {
      id: 'property-watch',
      name: 'Civitas Property Watch',
      subtitle: 'Scheduled Visual Checks & Photo Reporting',
      headline: 'Your Property. Better Visibility.',
      summary: 'Whether you live nearby, elsewhere in Ghana, or abroad, scheduled visual checks with dated photographs give you clear visibility over your property’s condition.',
      url: '/services/property-watch/',
      badge: 'Diaspora & Remote Oversight',
      accent: 'emerald',
      image: '/assets/Images/electrical inspection.png',
      plans: [
        {
          id: 'watch-monthly',
          name: 'Watch Monthly',
          price: formatFromPrice(PRICE_LIST.fromPrices.watchMonthly),
          frequency: 'per month',
          description: 'Scheduled monthly visual check of accessible interior and exterior spaces with dated photos.'
        },
        {
          id: 'watch-plus',
          name: 'Watch Plus',
          price: formatFromPrice(PRICE_LIST.fromPrices.watchPlus),
          frequency: 'per month',
          description: 'Enhanced visual checks with detailed room-by-room photo logs and follow-up coordination.'
        },
        {
          id: 'condition-assessment',
          name: 'One-Time Property Condition Assessment',
          price: formatFromPrice(PRICE_LIST.fromPrices.assessment),
          frequency: 'per visit',
          description: 'Single scheduled visual walk-through and written condition assessment.'
        }
      ],
      offerings: [
        { title: 'Scheduled Visual Checks', desc: 'Walk-through visual inspection of accessible interior and exterior spaces.' },
        { title: 'Dated Photo Reports', desc: 'Structured observations supported by dated photographs and practical maintenance notes.' },
        { title: 'Watch Monthly & Watch Plus', desc: `Recurring monthly checks starting ${formatFromPrice(PRICE_LIST.fromPrices.watchMonthly, 'per month').toLowerCase()}.` },
        { title: 'Vacant Home Checks', desc: 'Scheduled visits for unoccupied homes to spot visible leaks, damp, or weather wear early.' }
      ],
      targetAudience: [
        'Property owners living in the diaspora / abroad',
        'Owners of temporarily vacant or seasonal homes',
        'Landlords living in different regions or cities',
        'Families managing shared estate properties'
      ],
      disclaimer: HOW_WE_SET_PRICES.propertyWatchNotice
    }
  ],

  serviceLocations: {
    accra: [
      { name: 'East Legon', status: 'Core Coverage' },
      { name: 'Spintex Road', status: 'Core Coverage' },
      { name: 'Adenta & Oyarifa', status: 'Core Coverage' },
      { name: 'Airport Residential', status: 'Scheduled' },
      { name: 'Cantonments & Labone', status: 'Scheduled' },
      { name: 'Dzorwulu & Roman Ridge', status: 'Scheduled' },
      { name: 'Achimota & Dome', status: 'On Request' },
      { name: 'Other Accra Areas', status: 'Location Assessed' }
    ],
    tema: [
      { name: 'Community 25', status: 'Core Coverage' },
      { name: 'Communities 1 – 12', status: 'Scheduled' },
      { name: 'Sakumono & Lashibi', status: 'Scheduled' },
      { name: 'Community 18 – 20', status: 'Scheduled' },
      { name: 'Prampram / Dawhenya corridors', status: 'Location Assessed' }
    ]
  },

  insights: [
    {
      slug: 'how-often-should-you-deep-clean',
      title: 'How Often Should You Deep Clean Your Home?',
      category: 'Cleaning Care',
      readTime: '4 min read',
      date: 'November 2026',
      excerpt: 'Routine sweeping and mopping maintain appearances, but deep cleaning targets built-up grease, bathroom scale, and window tracks.',
      image: '/assets/Images/Commercial cleaning.png'
    },
    {
      slug: 'seven-maintenance-checks-for-landlords',
      title: 'Seven Property Maintenance Checks Every Landlord Should Consider',
      category: 'Rental Management',
      readTime: '5 min read',
      date: 'November 2026',
      excerpt: 'A practical, structured checklist for monitoring plumbing pressure, electrical earthing, roof seals, and drainage before minor faults become costly repairs.',
      image: '/assets/Images/Meter checking.png'
    },
    {
      slug: 'preparing-rental-property-for-new-tenant',
      title: 'Preparing a Rental Property for a New Tenant',
      category: 'Turnaround',
      readTime: '5 min read',
      date: 'November 2026',
      excerpt: 'Clean handovers prevent disputes. Here is the step-by-step cleaning, hardware inspection, and handover documentation guide for Ghanaian landlords.',
      image: '/assets/Images/Helper cleaner.png'
    },
    {
      slug: 'managing-property-from-abroad',
      title: 'Managing Your Property from Abroad: What to Monitor',
      category: 'Diaspora Oversight',
      readTime: '6 min read',
      date: 'November 2026',
      excerpt: 'Practical strategies for Ghanaian non-residents to verify property condition with dated photos and maintain clear records across time zones.',
      image: '/assets/Images/architectural design.png'
    },
    {
      slug: 'why-preventive-maintenance-matters',
      title: 'Why Preventive Maintenance Matters',
      category: 'Property Preservation',
      readTime: '4 min read',
      date: 'November 2026',
      excerpt: 'Fixing leaks, servicing air conditioners, and checking roof seals periodically costs a fraction of emergency water damage restoration.',
      image: '/assets/Images/maintenance officer.png'
    },
    {
      slug: 'common-maintenance-mistakes-to-avoid',
      title: 'Common Property Maintenance Mistakes to Avoid',
      category: 'Property Advice',
      readTime: '5 min read',
      date: 'November 2026',
      excerpt: 'From postponing slow plumbing leaks to neglecting electrical earthing tests in humid coastal climates, here are pitfalls that degrade property value.',
      image: '/assets/Images/electrical inspection.png'
    },
    {
      slug: 'how-to-prepare-your-home-for-cleaning',
      title: 'How to Prepare Your Home for Professional Cleaning',
      category: 'Practical Guide',
      readTime: '3 min read',
      date: 'November 2026',
      excerpt: 'Simple steps to clear personal items, secure valuables, and communicate specific priorities to ensure your cleaning team works efficiently.',
      image: '/assets/Images/glass cleaning.png'
    },
    {
      slug: 'practical-property-inspection-checklist',
      title: 'A Practical Property Inspection Checklist for Homes in Accra',
      category: 'Inspection Guide',
      readTime: '5 min read',
      date: 'November 2026',
      excerpt: 'A room-by-room guide to assessing moisture ingress, hairline plaster cracks, window seals, and AC drainage during dry and rainy seasons.',
      image: '/assets/Images/Painting expert.png'
    }
  ]
};

/**
 * Generates an official WhatsApp Click-to-Chat URL
 * Automatically formatted with tailored message context
 */
export function createWhatsAppUrl({
  service = 'General Enquiry',
  propertyType = 'Residential Property',
  location = 'Accra / Tema',
  preferredDate = '',
  description = '',
  name = '',
  planName = '',
  customMessage = ''
} = {}) {
  let message = '';

  if (customMessage) {
    message = customMessage;
  } else if (planName) {
    message = `Hello Civitas Estate & Maintenance,

I would like to enquire about the following plan:
*Plan:* ${planName}
*Property Location:* ${location || 'Accra / Tema'}
*My Name:* ${name || '[Please advise]'}

Please share details on scope, terms and availability.`;
  } else {
    message = `Hello Civitas Estate & Maintenance,

I would like to request a written quotation.

*Service Requested:* ${service}
*Property Type:* ${propertyType}
*Location:* ${location || 'Accra / Tema'}
${preferredDate ? `*Preferred Date:* ${preferredDate}\n` : ''}${name ? `*Name:* ${name}\n` : ''}${description ? `*Details:* ${description}\n` : ''}
Please advise on service availability and quotation steps.`;
  }

  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${SITE_CONFIG.contact.whatsappNumber}?text=${encoded}`;
}
