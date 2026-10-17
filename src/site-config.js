/**
 * CIVITAS ESTATE & MAINTENANCE
 * Global Site Configuration & Business Data Engine
 * 
 * Easily toggle between 'pre-launch' and 'live' modes.
 * Pre-launch Mode: November–December 2026 (Focus on interest registration & advance Jan 2027 bookings)
 * Live Mode: Commercial operations (Focus on immediate quotes & scheduling)
 */

export const SITE_CONFIG = {
  // Mode toggle: 'pre-launch' or 'live'
  mode: 'pre-launch', 
  
  brand: {
    name: 'Civitas Estate & Maintenance',
    legalName: 'Civitas Estate & Maintenance Ltd.',
    shortName: 'Civitas',
    tagline: 'Smart Living. Sustainable Legacy.',
    positioning: 'Professional property care, dependable maintenance and thoughtful oversight for homes and businesses in Accra and Tema.',
    url: 'https://www.civitasestate.com',
    launchDate: 'January 2027',
    preLaunchPeriod: 'November–December 2026',
    establishedYear: '2026',
    country: 'Ghana',
    cities: ['Accra', 'Tema']
  },

  // Authoritative Assets (strictly from client-supplied logo kit)
  assets: {
    logoOriginal: '/assets/logos/Civitas_Official_Logo_Original.png',
    logoTransparent: '/assets/logos/Civitas_Official_Logo_Transparent.png',
    logoWeb: '/assets/logos/Civitas_Official_Logo_Web.webp',
    symbolCrop: '/assets/logos/Civitas_Original_Symbol_Crop.png',
    symbol256: '/assets/logos/Civitas_Symbol_256.png',
    favicon: '/favicon.png'
  },

  contact: {
    // Official WhatsApp number format: Country code + number without plus or spaces for wa.me
    // Default placeholder is Ghana +233 55 000 0000; can be updated here instantly
    whatsappNumber: '233550000000', 
    whatsappDisplay: '+233 (0) 55 000 0000',
    phone: '+233 (0) 30 000 0000',
    email: 'enquiries@civitasestate.com',
    careersEmail: 'careers@civitasestate.com',
    officeAddress: 'Accra & Tema, Greater Accra Region, Ghana',
    workingHours: 'Monday – Saturday: 8:00 AM – 6:00 PM GMT'
  },

  // Service Divisions
  divisions: [
    {
      id: 'civitas-fix',
      name: 'Civitas Fix',
      subtitle: 'Cleaning, Repairs & Maintenance',
      headline: 'Cleaning, Repairs & Maintenance Made Simpler.',
      summary: 'From routine residential cleaning and deep cleaning to minor repairs and general maintenance, Civitas Fix helps you keep your property in good condition.',
      url: '/services/civitas-fix/',
      badge: 'Immediate Upkeep',
      accent: 'emerald',
      image: '/assets/Images/Plumbing work.png',
      categories: [
        {
          title: 'Cleaning Services',
          items: [
            { name: 'Routine Residential Cleaning', desc: 'Daily/weekly upkeep for living spaces, floors, kitchens, and bathrooms.' },
            { name: 'Deep Cleaning', desc: 'Intensive top-to-bottom sanitize and scrub for built-up grime and neglected areas.' },
            { name: 'Move-In & Move-Out Cleaning', desc: 'Turnover preparation ensuring spotless handovers between tenants or owners.' },
            { name: 'Upholstery Cleaning', desc: 'Fabric-safe deep extraction for sofas, armchairs, and cushions.' },
            { name: 'Pressure Washing', desc: 'High-pressure cleaning for driveways, exterior walls, compounds, and stone paths.' },
            { name: 'Post-Construction Cleaning', desc: 'Debris, paint residue, and fine dust clearance following renovation or construction.' }
          ]
        },
        {
          title: 'Repairs & Maintenance',
          items: [
            { name: 'General Handyman Services', desc: 'Hardware fixtures, minor adjustments, shelf hanging, and practical property repairs.' },
            { name: 'Plumbing Repairs', desc: 'Fixing leaking taps, pipe blockages, toilet siphon issues, and water pressure faults.' },
            { name: 'Electrical Repairs', desc: 'Safety testing, socket replacements, switch repairs, and light fittings by qualified pros.' },
            { name: 'Doors, Locks & Fittings', desc: 'Re-aligning sticking doors, deadbolt replacement, and handle maintenance.' },
            { name: 'Painting & Touch-Ups', desc: 'Patch repairs, interior wall refreshing, baseboard repainting, and scuff restoration.' },
            { name: 'Air Conditioning Servicing', desc: 'Filter cleaning, coil washing, refrigerant level checks, and drainage clearing.' },
            { name: 'Minor Tiling Repairs', desc: 'Regrouting, replacing cracked individual tiles, and wet area sealing.' }
          ]
        }
      ]
    },
    {
      id: 'civitas-care',
      name: 'Civitas Care',
      subtitle: 'Planned Property Care & Preventive Maintenance',
      headline: 'Better Property Care Begins Before Problems Become Expensive.',
      summary: 'Property maintenance should not begin only when something goes wrong. Civitas Care provides structured inspections, maintenance planning and service coordination to help property owners stay informed and organized.',
      url: '/services/civitas-care/',
      badge: 'Recurring Subscription',
      accent: 'terracotta',
      image: '/assets/Images/maintenance officer.png',
      plans: [
        {
          id: 'essential',
          name: 'Essential Care',
          price: 'GH₵350',
          frequency: '/ month',
          description: 'For property owners who need basic scheduled oversight.',
          features: [
            '1 scheduled condition inspection per month',
            'Brief condition summary report',
            'Preventive maintenance reminders',
            'Coordination of approved repair work',
            'Standard customer support'
          ],
          idealFor: 'Apartments, small residential homes, or light-use properties.',
          isPopular: false
        },
        {
          id: 'standard',
          name: 'Standard Care',
          price: 'GH₵650',
          frequency: '/ month',
          description: 'For properties requiring more frequent attention and detailed reporting.',
          features: [
            'Up to 2 scheduled inspections per month',
            'Detailed photographic reporting',
            'Comprehensive maintenance scheduling',
            'Priority coordination of service requests',
            'Dedicated care advisor'
          ],
          idealFor: 'Family homes, rental investments, and properties with busy occupants.',
          isPopular: true
        },
        {
          id: 'premium',
          name: 'Premium Care',
          price: 'From GH₵1,200',
          frequency: '/ month',
          description: 'For properties requiring an active, involved maintenance coordination arrangement.',
          features: [
            'Up to 4 scheduled inspections per month',
            'Enhanced digital condition reporting',
            'Planned preventive maintenance program',
            'Priority dispatch for approved service requests',
            'Assigned personal relationship contact',
            'Vendor supervision on approved contractor visits'
          ],
          idealFor: 'Executive residences, multi-unit buildings, or high-value estates.',
          isPopular: false
        }
      ]
    },
    {
      id: 'property-watch',
      name: 'Civitas Property Watch',
      subtitle: 'Property Inspections & Independent Oversight',
      headline: 'Your Property. Better Visibility.',
      summary: 'Whether you live nearby, elsewhere in Ghana, or abroad, scheduled inspections and independent reporting give you unbiased visibility over your property’s true condition.',
      url: '/services/property-watch/',
      badge: 'Diaspora & Remote Oversight',
      accent: 'emerald',
      image: '/assets/Images/electrical inspection.png',
      offerings: [
        { title: 'Basic Property Inspections', desc: 'Scheduled visual walk-through of accessible interior and exterior spaces.' },
        { title: 'Detailed Condition Reports', desc: 'Structured observations supported by dated photographs and maintenance recommendations.' },
        { title: 'Monthly Property Oversight', desc: 'Regular recurring checks keeping non-resident owners informed on month-to-month condition.' },
        { title: 'Vacant Property Monitoring', desc: 'Scheduled visits for unoccupied homes to detect damp, leaks, weather intrusion, or pests early.' }
      ],
      targetAudience: [
        'Property owners living in the diaspora / abroad',
        'Owners of temporarily vacant or seasonal homes',
        'Landlords living in different regions or cities',
        'Families managing inherited or shared estate properties',
        'Property managers requiring independent quality checks'
      ],
      disclaimer: 'Property Watch is an independent visual inspection and reporting service. It is not continuous security guard surveillance, structural engineering certification, building insurance, or a guarantee against theft, damage or deterioration.'
    }
  ],

  // Service Locations in Ghana
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

  // Practical Insights Articles
  insights: [
    {
      slug: 'how-often-should-you-deep-clean',
      title: 'How Often Should You Deep Clean Your Home?',
      category: 'Cleaning Care',
      readTime: '4 min read',
      date: 'November 2026',
      excerpt: 'Routine sweeping and mopping maintain appearances, but deep cleaning targets grime, unseen bacteria, and hidden fabric allergens.',
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
      excerpt: 'Practical strategies for Ghanaian non-residents to verify property status, avoid family friction, and maintain accountability across time zones.',
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
  const isPreLaunch = SITE_CONFIG.mode === 'pre-launch';
  let message = '';

  if (customMessage) {
    message = customMessage;
  } else if (planName) {
    message = `Hello Civitas Estate & Maintenance,

I would like to enquire about the Civitas Care plan.
*Plan:* ${planName}
*Property Location:* ${location || 'Accra / Tema'}
*My Name:* ${name || '[Please advise]'}
${isPreLaunch ? '\nI am registering my interest for the planned January 2027 launch.' : ''}

Please share details on enrollment terms and availability.`;
  } else {
    message = `Hello Civitas Estate & Maintenance,

I would like to request ${isPreLaunch ? 'an advance quotation / register interest' : 'a quotation'}.

*Service Requested:* ${service}
*Property Type:* ${propertyType}
*Location:* ${location || 'Accra / Tema'}
${preferredDate ? `*Preferred Date:* ${preferredDate}\n` : ''}${name ? `*Name:* ${name}\n` : ''}${description ? `*Details:* ${description}\n` : ''}
${isPreLaunch ? '*(Enquiry for Pre-Launch / January 2027 bookings)*\n' : ''}Please advise on service availability and quotation steps.`;
  }

  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${SITE_CONFIG.contact.whatsappNumber}?text=${encoded}`;
}
