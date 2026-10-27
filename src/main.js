import { SITE_CONFIG, createWhatsAppUrl } from './site-config.js';
import { calculateSmartQuote, buildWhatsAppQuotationMessage, SMARTQUOTE_CONFIG } from './smartquote-engine.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFaqAccordion();
  initQuoteModal();
  initFormHandlers();
  initPreLaunchModeUI();
  initModeSwitcherBadge();
  initVideoShowcaseModal();
  initHeroVideoControls();
  initBeforeAfterSlider();
  initPlanEstimator();
  initSuburbCoverageChecker();
  initAnimatedStatsCounter();
  initSmartQuote();
  initHealthScoreAudit();
  initReportSimulator();
  initGlobalWhatsAppWidget();
  initHolidayQuoteForm();
});


/**
 * Initializes mobile navigation drawer and backdrop
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close');

  if (!toggleBtn || !drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Close drawer on link click
  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/**
 * FAQ Accordion with accessible ARIA state management
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items for a clean single-open behavior
      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherBtn = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 32 + 'px';
      }
    });
  });
}

/**
 * Interactive Quote & Service Request Modal
 */
function initQuoteModal() {
  const modal = document.getElementById('quoteModal');
  const openButtons = document.querySelectorAll('[data-open-quote]');
  const closeBtn = modal?.querySelector('.modal-close');

  if (!modal) return;

  const openModal = (servicePrefill = '', suburbPrefill = '') => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (servicePrefill) {
      const serviceSelect = modal.querySelector('select[name="service"]');
      if (serviceSelect) {
        serviceSelect.value = servicePrefill;
      }
    }

    if (suburbPrefill) {
      const locationInput = modal.querySelector('input[name="location"], select[name="location"]');
      if (locationInput) {
        locationInput.value = suburbPrefill;
      }
    }
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || '';
      const suburb = btn.getAttribute('data-suburb') || '';
      openModal(service, suburb);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle modal quote form submission -> WhatsApp redirect
  const modalForm = modal.querySelector('form');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(modalForm);
      const service = formData.get('service') || 'General Service';
      const propertyType = formData.get('propertyType') || 'Residential';
      const location = formData.get('location') || 'Accra / Tema';
      const preferredDate = formData.get('preferredDate') || '';
      const description = formData.get('description') || '';
      const name = formData.get('name') || '';

      const waUrl = createWhatsAppUrl({
        service,
        propertyType,
        location,
        preferredDate,
        description,
        name
      });

      closeModal();
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }
}

/**
 * Contact & Enquiry Page Forms Handler
 */
function initFormHandlers() {
  // General Contact Form
  const contactForm = document.getElementById('contactEnquiryForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const waUrl = createWhatsAppUrl({
        name: fd.get('name'),
        service: fd.get('service'),
        propertyType: fd.get('propertyType'),
        location: fd.get('location'),
        preferredDate: fd.get('preferredDate'),
        description: fd.get('description')
      });
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Civitas Care Plan Enquire Buttons
  const careButtons = document.querySelectorAll('[data-care-plan]');
  careButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const planName = btn.getAttribute('data-care-plan');
      const waUrl = createWhatsAppUrl({ planName });
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  });

  // Technician / Contractor Onboarding Form
  const talentForm = document.getElementById('talentOnboardingForm');
  if (talentForm) {
    talentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(talentForm);
      const trade = fd.get('trade') || 'Technician';
      const name = fd.get('name') || '';
      const experience = fd.get('experience') || '';
      const area = fd.get('area') || 'Accra / Tema';

      const customMessage = `Hello Civitas Team,

I am interested in working with Civitas Estate & Maintenance as a vetted service specialist.

*My Name:* ${name}
*Trade / Specialty:* ${trade}
*Years of Experience / Qualifications:* ${experience}
*Primary Area of Availability:* ${area}

Please advise on your contractor onboarding and vetting process.`;

      const waUrl = createWhatsAppUrl({ customMessage });
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }
}

/**
 * Pre-launch vs Live mode UI adaptation
 */
function initPreLaunchModeUI() {
  const preLaunchBanner = document.querySelector('.pre-launch-bar');
  if (preLaunchBanner) {
    preLaunchBanner.remove();
  }

  // Ensure high-converting commercial CTAs are active everywhere
  document.querySelectorAll('[data-mode-cta]').forEach(el => {
    if (el.getAttribute('data-mode-cta') === 'primary') {
      el.textContent = 'Request a Free Quote';
    } else if (el.getAttribute('data-mode-cta') === 'secondary') {
      el.textContent = 'Book Immediate Service';
    }
  });
}

function initModeSwitcherBadge() {
  const switcher = document.getElementById('modeSwitcherBtn');
  if (switcher) switcher.remove();
}

/**
 * 1. Video Lightbox Modal for Field Operations Showcase
 */
function initVideoShowcaseModal() {
  let modal = document.getElementById('videoLightboxModal') || document.getElementById('videoModal');
  let videoPlayer = document.getElementById('videoLightboxPlayer') || document.getElementById('modalVideoPlayer');
  let closeBtn = document.getElementById('videoLightboxClose') || document.getElementById('videoModalClose');

  // If modal doesn't exist on page, dynamically create it
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'video-lightbox';
    modal.id = 'videoLightboxModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Field Operations Video Player');
    modal.innerHTML = `
      <div class="video-lightbox-content">
        <button class="video-lightbox-close" id="videoLightboxClose" aria-label="Close video player">&times;</button>
        <video class="video-lightbox-player" id="videoLightboxPlayer" controls playsinline disablePictureInPicture controlsList="nodownload noplaybackrate">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
    document.body.appendChild(modal);
    videoPlayer = modal.querySelector('#videoLightboxPlayer');
    closeBtn = modal.querySelector('#videoLightboxClose');
  }

  const openVideoModal = (videoSrc) => {
    if (!videoSrc || !videoPlayer) return;
    videoPlayer.src = videoSrc;
    modal.classList.add('open');
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const playPromise = videoPlayer.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        videoPlayer.muted = true;
        videoPlayer.play().catch(() => {});
      });
    }
  };

  const closeVideoModal = () => {
    if (!modal || !videoPlayer) return;
    modal.classList.remove('open');
    modal.classList.remove('active');
    modal.style.display = '';
    document.body.style.overflow = '';
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
  };

  // Global click delegate for any video triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-video-src], .video-play-btn, .video-trigger-link');
    if (trigger) {
      e.preventDefault();
      const src = trigger.getAttribute('data-video-src');
      if (src) openVideoModal(src);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeVideoModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (modal.classList.contains('open') || modal.classList.contains('active'))) {
      closeVideoModal();
    }
  });
}

/**
 * 2. Hero Video Controls (Play/Pause, Sound Toggle)
 */
function initHeroVideoControls() {
  const heroVideo = document.getElementById('heroShowcaseVideo');
  const togglePlayBtn = document.getElementById('heroVideoPlayBtn');
  const toggleMuteBtn = document.getElementById('heroVideoMuteBtn');

  // Autoplay all ambient videos safely with muted property
  const ambientVideos = document.querySelectorAll('.hero-video-background, .hero-showcase-video, video[autoplay]');
  ambientVideos.forEach(v => {
    v.muted = true;
    v.playsInline = true;
    const p = v.play();
    if (p !== undefined) {
      p.catch(() => {
        const startOnTouch = () => {
          v.play().catch(() => {});
          document.removeEventListener('touchstart', startOnTouch);
          document.removeEventListener('click', startOnTouch);
        };
        document.addEventListener('touchstart', startOnTouch, { once: true });
        document.addEventListener('click', startOnTouch, { once: true });
      });
    }
  });

  if (!heroVideo) return;

  if (togglePlayBtn) {
    togglePlayBtn.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play().catch(() => {});
        togglePlayBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          Field Operations
        `;
      } else {
        heroVideo.pause();
        togglePlayBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Play Reel
        `;
      }
    });
  }

  if (toggleMuteBtn) {
    toggleMuteBtn.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      toggleMuteBtn.innerHTML = heroVideo.muted ? `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        Muted
      ` : `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        Sound On
      `;
    });
  }
}

/**
 * 3. Interactive Before & After Property Transformation Slider
 */
function initBeforeAfterSlider() {
  const slider = document.getElementById('propertyBeforeAfterSlider');
  if (!slider) return;

  const afterWrap = slider.querySelector('.ba-image-after-wrap');
  const handle = slider.querySelector('.ba-slider-handle');
  const afterImg = afterWrap.querySelector('.ba-image');
  const updateSliderWidth = () => {
    if (afterImg && slider) {
      afterImg.style.width = `${slider.offsetWidth}px`;
    }
  };
  updateSliderWidth();
  window.addEventListener('resize', updateSliderWidth);

  let isDragging = false;

  const updatePosition = (clientX) => {
    const rect = slider.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const percent = (x / rect.width) * 100;
    afterWrap.style.width = `${percent}%`;
    handle.style.left = `${percent}%`;
  };

  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePosition(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  });

  slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches[0]) updatePosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    updatePosition(e.touches[0].clientX);
  }, { passive: true });
}

/**
 * 4. Interactive "Build Your Property Care Plan" Estimator
 */
function initPlanEstimator() {
  const estimatorBox = document.getElementById('planEstimatorBox');
  if (!estimatorBox) return;

  const propCards = estimatorBox.querySelectorAll('.prop-type-card');
  const tierCards = estimatorBox.querySelectorAll('.tier-option-card');
  const addonChecks = estimatorBox.querySelectorAll('.addon-input');
  const priceDisplay = document.getElementById('estimatorPriceValue');
  const waBtn = document.getElementById('estimatorWhatsAppBtn');

  // Base pricing matrix (GH₵ / month)
  const basePrices = {
    apartment: { essential: 350, standard: 650, executive: 1100 },
    house: { essential: 450, standard: 850, executive: 1450 },
    villa: { essential: 700, standard: 1350, executive: 2200 },
    commercial: { essential: 850, standard: 1600, executive: 2600 }
  };

  let selectedProp = 'apartment';
  let selectedTier = 'standard';

  const calculateTotal = () => {
    let total = basePrices[selectedProp][selectedTier] || 650;

    addonChecks.forEach(chk => {
      if (chk.checked) {
        total += parseInt(chk.value, 10) || 0;
      }
    });

    if (priceDisplay) {
      priceDisplay.textContent = `GH₵${total.toLocaleString()}`;
    }

    // Update WhatsApp pre-filled action link
    if (waBtn) {
      const propNames = {
        apartment: 'Modern Apartment / Flat',
        house: '3–4 Bedroom Residential Home',
        villa: 'Luxury Estate / Multi-Storey Villa',
        commercial: 'Commercial Office / Short-Let Facility'
      };

      const tierNames = {
        essential: 'Essential Care Plan (Monthly)',
        standard: 'Standard Care Plan (Bi-Weekly)',
        executive: 'Executive Comprehensive Plan (Full-Service)'
      };

      const selectedAddons = [];
      addonChecks.forEach(chk => {
        if (chk.checked) selectedAddons.push(chk.dataset.label);
      });

      const message = `Hello Civitas Estate & Maintenance! 👋
I just configured a tailored Property Care Plan on your website:

• Property Type: ${propNames[selectedProp]}
• Plan Tier: ${tierNames[selectedTier]}
• Add-On Services: ${selectedAddons.length ? selectedAddons.join(', ') : 'None selected'}
• Estimated Plan Total: GH₵${total.toLocaleString()} / month

I would like to confirm service availability and lock in the 2026/2027 introductory reservation.`;

      waBtn.href = createWhatsAppUrl({ customMessage: message });
    }
  };

  propCards.forEach(card => {
    card.addEventListener('click', () => {
      propCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedProp = card.dataset.propType;
      calculateTotal();
    });
  });

  tierCards.forEach(card => {
    card.addEventListener('click', () => {
      tierCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTier = card.dataset.tier;
      calculateTotal();
    });
  });

  addonChecks.forEach(chk => {
    chk.addEventListener('change', calculateTotal);
  });

  calculateTotal();
}

/**
 * 5. Interactive Suburb & Geo-Coverage Checker + Priority Dispatch Radar
 */
function initSuburbCoverageChecker() {
  const chips = document.querySelectorAll('.suburb-chip');
  const bannerName = document.getElementById('activeSuburbName');
  const bannerTime = document.getElementById('activeSuburbDispatch');

  const suburbData = {
    'East Legon': { dispatch: '20–35 mins', zone: 'Zone A (Premier Residential)' },
    'Airport Residential': { dispatch: '15–30 mins', zone: 'Zone A (Central Core)' },
    'Cantonments': { dispatch: '15–25 mins', zone: 'Zone A (Embassy Enclave)' },
    'Trasacco Valley': { dispatch: '30–45 mins', zone: 'Zone A (Luxury Gated)' },
    'Labone': { dispatch: '15–30 mins', zone: 'Zone A (Residential)' },
    'Ridge': { dispatch: '15–25 mins', zone: 'Zone A (Executive Enclave)' },
    'Dzorwulu': { dispatch: '20–35 mins', zone: 'Zone B (West Central)' },
    'Roman Ridge': { dispatch: '20–30 mins', zone: 'Zone A (Central)' },
    'Spintex': { dispatch: '25–40 mins', zone: 'Zone B (Commercial Corridor)' },
    'Sakumono': { dispatch: '30–45 mins', zone: 'Zone B (Coastal Residential)' },
    'Tema Comm 1–25': { dispatch: '25–45 mins', zone: 'Zone C (Tema Metropolitan)' }
  };

  if (chips.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const name = chip.getAttribute('data-suburb');
        if (bannerName) bannerName.textContent = name;
        if (bannerTime && suburbData[name]) {
          bannerTime.textContent = `Average Rapid Dispatch: ${suburbData[name].dispatch} • ${suburbData[name].zone}`;
        }
      });
    });
  }

  // Priority Dispatch Radar Dashboard
  const radarBtns = document.querySelectorAll('.suburb-radar-btn');
  const radarSuburbName = document.getElementById('radarSuburbName');
  const radarSlaTime = document.getElementById('radarSlaTime');
  const radarZoneName = document.getElementById('radarZoneName');
  const radarUnitsOnDuty = document.getElementById('radarUnitsOnDuty');
  const radarTradesActive = document.getElementById('radarTradesActive');
  const radarZoneDesc = document.getElementById('radarZoneDesc');
  const radarDispatchBtn = document.getElementById('radarDispatchActionBtn');

  const zoneDescriptions = {
    'East Legon': 'Primary residential coverage sector with permanent mobile crew stationed along Boundary Road and Adjiringanor Corridor.',
    'Airport Residential': 'Central metropolitan core with rapid-access deployment for diplomatic residences, luxury penthouses, and corporate villas.',
    'Cantonments': 'High-security embassy and residential district with dedicated hydraulic and technical diagnostics specialists.',
    'Trasacco Valley': 'Gated private estate enclave with dedicated property watch inspectors, solar technicians, and facade cleaning teams.',
    'Ridge': 'Financial and ministerial district hub equipped for corporate facility upkeep, high-rise glass washing, and boardrooms.',
    'Spintex': 'High-density commercial-residential corridor with rapid AC, electrical, and scheduled deep sanitization units.',
    'Tema Comm 1–25': 'Comprehensive metropolitan coverage extending through industrial zones, coastal properties, and master-planned residential blocks.'
  };

  if (radarBtns.length) {
    radarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        radarBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const suburb = btn.getAttribute('data-suburb');
        const sla = btn.getAttribute('data-sla');
        const zone = btn.getAttribute('data-zone');
        const units = btn.getAttribute('data-units');
        const trades = btn.getAttribute('data-trades');

        if (radarSuburbName) radarSuburbName.textContent = btn.querySelector('span')?.textContent || suburb;
        if (radarSlaTime) radarSlaTime.textContent = sla;
        if (radarZoneName) radarZoneName.textContent = zone;
        if (radarUnitsOnDuty) radarUnitsOnDuty.textContent = units;
        if (radarTradesActive) radarTradesActive.textContent = trades;
        if (radarZoneDesc && zoneDescriptions[suburb]) radarZoneDesc.textContent = zoneDescriptions[suburb];
        if (radarDispatchBtn) {
          radarDispatchBtn.setAttribute('data-suburb', suburb);
          radarDispatchBtn.textContent = `Book Priority Dispatch in ${suburb}`;
        }
      });
    });
  }
}

/**
 * 6. Animated Stats Counter with IntersectionObserver
 */
function initAnimatedStatsCounter() {
  const statNumbers = document.querySelectorAll('[data-counter-target]');
  if (!statNumbers.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-counter-target'), 10);
        const prefix = el.getAttribute('data-counter-prefix') || '';
        const suffix = el.getAttribute('data-counter-suffix') || '';
        const duration = 1500;
        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + (target - start) * easeProgress);

          el.textContent = `${prefix}${current}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = `${prefix}${target}${suffix}`;
          }
        };

        requestAnimationFrame(updateCounter);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(num => observer.observe(num));
}

/**
 * 7. CIVITAS SMARTQUOTE™ — Interactive Service Pricing & Quotation Engine
 */
function initSmartQuote() {
  const container = document.getElementById('smartQuoteApp');
  if (!container) return;

  // Track user interaction state
  const state = {
    currentStep: 1,
    serviceId: 'standard-cleaning',
    propertyType: 'villa',
    bedrooms: '3-bed',
    bathrooms: '3',
    condition: 'well-maintained',
    frequency: 'one-off',
    propertySize: 'under-250',
    inspectionType: 'standard-audit',
    repairCategory: 'plumbing',
    repairScope: '1-2',
    repairNotes: '',
    locationZone: 'accra-core',
    addons: []
  };

  // DOM Elements
  const progressBar = document.getElementById('sqProgressBar');
  const stepButtons = container.querySelectorAll('.sq-step-node');
  const panes = container.querySelectorAll('.sq-pane');
  const backBtn = document.getElementById('sqNavBackBtn');
  const nextBtn = document.getElementById('sqNavNextBtn');

  // Sidebar Elements
  const livePriceDisplay = document.getElementById('sqLivePriceDisplay');
  const liveAmountNum = document.getElementById('sqLiveAmountNum');
  const livePriceSubtext = document.getElementById('sqLivePriceSubtext');
  const liveServiceLabel = document.getElementById('sqLiveServiceLabel');
  const livePropertyLabel = document.getElementById('sqLivePropertyLabel');
  const liveLocationLabel = document.getElementById('sqLiveLocationLabel');
  const liveAddonsLabel = document.getElementById('sqLiveAddonsLabel');
  const sidebarWhatsAppBtn = document.getElementById('sqSidebarWhatsAppBtn');

  // Step 5 Result Elements
  const heroAmountNum = document.getElementById('sqHeroAmountNum');
  const heroStatusTag = document.getElementById('sqHeroStatusTag');
  const resService = document.getElementById('sqResService');
  const resProperty = document.getElementById('sqResProperty');
  const resLocation = document.getElementById('sqResLocation');
  const resAddons = document.getElementById('sqResAddons');
  const finalWhatsAppBtn = document.getElementById('sqFinalWhatsAppBtn');
  const copyQuoteBtn = document.getElementById('sqCopyQuoteBtn');
  const restartBtn = document.getElementById('sqRestartBtn');
  const toast = document.getElementById('sqToast');

  // Dynamic Form Field Containers
  const cleaningFields = document.getElementById('sqCleaningFields');
  const inspectionFields = document.getElementById('sqInspectionFields');
  const repairsFields = document.getElementById('sqRepairsFields');
  const cleaningAddons = document.getElementById('sqCleaningAddons');
  const inspectionAddons = document.getElementById('sqInspectionAddons');
  const repairsAddonsNotice = document.getElementById('sqRepairsAddonsNotice');

  // Dispatch Analytics Helper
  const triggerEvent = (eventName, detail = {}) => {
    try {
      const evt = new CustomEvent(eventName, { detail });
      window.dispatchEvent(evt);
    } catch (_) {}
  };

  // Step Navigation Logic
  const goToStep = (targetStep) => {
    if (targetStep < 1 || targetStep > 5) return;
    state.currentStep = targetStep;

    // Update Stepper Progress
    const progressPercentages = { 1: '20%', 2: '40%', 3: '60%', 4: '80%', 5: '100%' };
    if (progressBar) progressBar.style.width = progressPercentages[targetStep];

    stepButtons.forEach(btn => {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      btn.classList.remove('active', 'completed');
      btn.setAttribute('aria-selected', 'false');

      if (step === targetStep) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else if (step < targetStep) {
        btn.classList.add('completed');
      }
    });

    // Toggle Panes
    panes.forEach(pane => {
      pane.classList.remove('active');
      if (pane.id === `sqPane${targetStep}`) {
        pane.classList.add('active');
      }
    });

    // Update Navigation Buttons
    if (backBtn) {
      backBtn.disabled = targetStep === 1;
    }

    if (nextBtn) {
      if (targetStep === 1) {
        nextBtn.innerHTML = '<span>Continue to Property Details</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        nextBtn.style.display = 'inline-flex';
      } else if (targetStep === 2) {
        nextBtn.innerHTML = '<span>Continue to Location</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        nextBtn.style.display = 'inline-flex';
      } else if (targetStep === 3) {
        nextBtn.innerHTML = '<span>Continue to Add-ons</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        nextBtn.style.display = 'inline-flex';
      } else if (targetStep === 4) {
        nextBtn.innerHTML = '<span>Get My Estimate</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        nextBtn.style.display = 'inline-flex';
      } else if (targetStep === 5) {
        nextBtn.style.display = 'none'; // Replaced by primary conversion CTA in pane 5
      }
    }

    triggerEvent('smartquote_step_completed', { step: targetStep });

    // Scroll smoothly to top of card on mobile
    if (window.innerWidth < 900 && targetStep > 1) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Switch Sub-form Views Based On Service Category
  const syncServicePanels = () => {
    const isInspection = state.serviceId === 'condition-inspection';
    const isRepairs = state.serviceId === 'minor-repairs';

    // Step 2 Form Switching
    if (cleaningFields) cleaningFields.style.display = (!isInspection && !isRepairs) ? 'block' : 'none';
    if (inspectionFields) inspectionFields.style.display = isInspection ? 'block' : 'none';
    if (repairsFields) repairsFields.style.display = isRepairs ? 'block' : 'none';

    // Step 4 Add-ons Switching
    if (cleaningAddons) cleaningAddons.style.display = (!isInspection && !isRepairs) ? 'grid' : 'none';
    if (inspectionAddons) inspectionAddons.style.display = isInspection ? 'grid' : 'none';
    if (repairsAddonsNotice) repairsAddonsNotice.style.display = isRepairs ? 'block' : 'none';

    // Purge incompatible add-ons
    const validAddonIds = Object.keys(SMARTQUOTE_CONFIG.addons).filter(id => {
      const addon = SMARTQUOTE_CONFIG.addons[id];
      return addon.categories.includes(state.serviceId);
    });
    state.addons = state.addons.filter(id => validAddonIds.includes(id));

    // Update active state of addon checkboxes
    container.querySelectorAll('.sq-addon-card').forEach(card => {
      const addonId = card.getAttribute('data-addon-id');
      card.classList.toggle('selected', state.addons.includes(addonId));
    });
  };

  // Recalculate Live Quote and Update All UI Touchpoints
  const recalculate = () => {
    const result = calculateSmartQuote({
      serviceId: state.serviceId,
      propertyType: state.propertyType,
      bedrooms: state.bedrooms,
      bathrooms: state.bathrooms,
      condition: state.condition,
      frequency: state.frequency,
      propertySize: state.propertySize,
      inspectionType: state.inspectionType,
      locationZone: state.locationZone,
      addons: state.addons,
      repairCategory: state.repairCategory,
      customerNotes: state.repairNotes
    });

    const isInspection = state.serviceId === 'condition-inspection';
    const isRepairs = state.serviceId === 'minor-repairs';

    // Generate Human-Readable Summaries
    let propertySummary = '';
    if (isRepairs) {
      const catLabels = {
        'plumbing': 'Plumbing & Drainage',
        'electrical': 'Electrical & Lighting',
        'hvac': 'AC Servicing & Gas',
        'carpentry': 'Carpentry & Locks',
        'multi-trade': 'Multi-Trade Punch List'
      };
      propertySummary = `${catLabels[state.repairCategory] || 'General Repairs'} (${state.repairScope} faults)`;
    } else if (isInspection) {
      const sizeLabels = {
        'under-250': 'Up to 250 m²',
        '250-500': '250–500 m²',
        'over-500': '500+ m²'
      };
      const scopeLabels = {
        'standard-audit': 'Routine Condition Audit',
        'pre-purchase': 'Pre-Purchase Due Diligence',
        'diaspora-oversight': 'Diaspora Remote Oversight'
      };
      propertySummary = `${scopeLabels[state.inspectionType] || 'Inspection'} (${sizeLabels[state.propertySize] || 'Standard'})`;
    } else {
      const propLabels = {
        'villa': 'Villa / House',
        'apartment': 'Luxury Apartment',
        'townhouse': 'Townhouse',
        'commercial': 'Commercial / Office'
      };
      propertySummary = `${state.bedrooms.replace('-', ' ')}, ${state.bathrooms} Bath (${propLabels[state.propertyType] || 'Residential'})`;
    }

    const addonNames = state.addons.map(id => SMARTQUOTE_CONFIG.addons[id]?.name).filter(Boolean);
    const addonsSummary = addonNames.length > 0 ? addonNames.join(', ') : 'None selected';

    // Update Sidebar Scorecard
    if (liveServiceLabel) liveServiceLabel.textContent = result.serviceName || 'Property Care';
    if (livePropertyLabel) livePropertyLabel.textContent = propertySummary;
    if (liveLocationLabel) liveLocationLabel.textContent = result.locationName || 'Accra / Tema';
    if (liveAddonsLabel) {
      liveAddonsLabel.textContent = state.addons.length > 0 ? `${state.addons.length} item(s) (+GH₵ ${result.addonsTotal})` : '0 selected';
    }

    if (result.status === 'estimate') {
      if (livePriceDisplay) {
        livePriceDisplay.innerHTML = `<span class="sq-c-symbol">GH₵</span><span id="sqLiveAmountNum">${result.indicativePrice.toLocaleString()}</span>`;
      }
      if (livePriceSubtext) {
        livePriceSubtext.textContent = result.logisticsCost > 0 ? `Includes GH₵ ${result.logisticsCost} logistics allowance` : 'Includes labour, materials & equipment';
      }
      if (heroAmountNum) {
        heroAmountNum.textContent = result.indicativePrice.toLocaleString();
        const heroDisplay = document.getElementById('sqHeroPriceDisplay');
        if (heroDisplay) heroDisplay.innerHTML = `<span class="sq-currency">GH₵</span><span>${result.indicativePrice.toLocaleString()}</span>`;
      }
      if (heroStatusTag) {
        heroStatusTag.textContent = result.discountApplied ? `Indicative Estimate (${result.discountApplied} Savings)` : 'Indicative Estimate';
        heroStatusTag.style.background = 'rgba(212, 175, 55, 0.2)';
        heroStatusTag.style.color = '#F8E5A0';
      }
    } else if (result.status === 'assessment_required') {
      if (livePriceDisplay) {
        livePriceDisplay.innerHTML = `<span style="font-size: 1.35rem; color: #FFAE8C;">Assessment Required</span>`;
      }
      if (livePriceSubtext) {
        livePriceSubtext.textContent = 'Technician site diagnosis needed';
      }
      if (heroStatusTag) {
        heroStatusTag.textContent = 'Site Assessment Required';
        heroStatusTag.style.background = 'rgba(228, 105, 63, 0.25)';
        heroStatusTag.style.color = '#FFAE8C';
      }
      const heroDisplay = document.getElementById('sqHeroPriceDisplay');
      if (heroDisplay) heroDisplay.innerHTML = `<span style="font-size: 1.75rem; color: #FFAE8C;">Assessment Required</span>`;
    } else if (result.status === 'custom_quotation') {
      if (livePriceDisplay) {
        livePriceDisplay.innerHTML = `<span style="font-size: 1.35rem; color: #FFAE8C;">Custom Quotation</span>`;
      }
      if (livePriceSubtext) {
        livePriceSubtext.textContent = 'Outside standard zone corridors';
      }
      if (heroStatusTag) {
        heroStatusTag.textContent = 'Custom Quotation Required';
        heroStatusTag.style.background = 'rgba(228, 105, 63, 0.25)';
        heroStatusTag.style.color = '#FFAE8C';
      }
      const heroDisplay = document.getElementById('sqHeroPriceDisplay');
      if (heroDisplay) heroDisplay.innerHTML = `<span style="font-size: 1.75rem; color: #FFAE8C;">Custom Quotation</span>`;
    }

    // Update Step 5 Result Breakdown
    if (resService) resService.textContent = result.serviceName;
    if (resProperty) resProperty.textContent = propertySummary;
    if (resLocation) {
      resLocation.textContent = `${result.locationName}${result.logisticsCost > 0 ? ` (+GH₵ ${result.logisticsCost} Logistics)` : ' (Base Logistics)'}`;
    }
    if (resAddons) resAddons.textContent = addonsSummary;

    // Generate WhatsApp Quotation Link
    const waPayload = buildWhatsAppQuotationMessage({
      serviceName: result.serviceName,
      propertyType: state.propertyType ? state.propertyType.charAt(0).toUpperCase() + state.propertyType.slice(1) : 'Residential',
      propertySize: propertySummary,
      propertyCondition: state.condition || 'Standard',
      location: `${result.locationName} (${result.suburbsSummary || 'Greater Accra'})`,
      additionalServices: addonsSummary,
      indicativeEstimate: result.indicativePrice ? `GH₵ ${result.indicativePrice.toLocaleString()}` : 'Site Assessment Required',
      quotationStatus: result.status === 'estimate' ? 'Indicative Estimate' : (result.status === 'assessment_required' ? 'Assessment Required' : 'Custom Quotation Required'),
      customerNotes: state.repairNotes || (result.discountApplied ? `Customer selected ${state.frequency} frequency (${result.discountApplied} savings).` : '')
    });

    if (finalWhatsAppBtn) {
      finalWhatsAppBtn.href = waPayload.whatsappUrl;
      finalWhatsAppBtn.onclick = () => {
        triggerEvent('smartquote_whatsapp_clicked', { service: result.serviceName, estimate: result.indicativePrice });
      };
    }
    if (sidebarWhatsAppBtn) {
      sidebarWhatsAppBtn.href = waPayload.whatsappUrl;
      sidebarWhatsAppBtn.onclick = () => {
        triggerEvent('smartquote_whatsapp_clicked', { service: result.serviceName, estimate: result.indicativePrice });
      };
    }

    // Attach copy button action
    if (copyQuoteBtn) {
      copyQuoteBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(waPayload.rawMessage);
          if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3500);
          }
        } catch (_) {
          // Fallback if clipboard API is restricted
          alert('SmartQuote Summary:\n\n' + waPayload.rawMessage);
        }
      };
    }
  };

  // Wire Event Listeners: Service Selection Cards
  const serviceCards = container.querySelectorAll('.sq-service-card');
  serviceCards.forEach(card => {
    const handleSelect = () => {
      serviceCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.serviceId = card.getAttribute('data-service-id');

      syncServicePanels();
      recalculate();
      triggerEvent('smartquote_service_selected', { serviceId: state.serviceId });
    };

    card.addEventListener('click', handleSelect);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    });
  });

  // Wire Event Listeners: Chips (Property Details)
  const chips = container.querySelectorAll('.sq-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.getAttribute('data-group');
      const val = chip.getAttribute('data-val');
      if (!group || !val) return;

      const groupChips = container.querySelectorAll(`.sq-chip[data-group="${group}"]`);
      groupChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      state[group] = val;
      recalculate();
    });
  });

  // Wire Event Listeners: Location Cards
  const locationCards = container.querySelectorAll('.sq-location-card');
  locationCards.forEach(card => {
    card.addEventListener('click', () => {
      locationCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.locationZone = card.getAttribute('data-zone-id');
      recalculate();
    });
  });

  // Wire Event Listeners: Add-ons Cards
  const addonCards = container.querySelectorAll('.sq-addon-card');
  addonCards.forEach(card => {
    card.addEventListener('click', () => {
      const addonId = card.getAttribute('data-addon-id');
      if (!addonId) return;

      if (state.addons.includes(addonId)) {
        state.addons = state.addons.filter(id => id !== addonId);
        card.classList.remove('selected');
      } else {
        state.addons.push(addonId);
        card.classList.add('selected');
      }
      recalculate();
    });
  });

  // Wire Repair Notes Field
  const repairNotesInput = document.getElementById('sqRepairNotes');
  if (repairNotesInput) {
    repairNotesInput.addEventListener('input', (e) => {
      state.repairNotes = e.target.value.trim();
      recalculate();
    });
  }

  // Wire Navigation Buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToStep(state.currentStep + 1);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      goToStep(state.currentStep - 1);
    });
  }

  // Wire Stepper Node Buttons
  stepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      goToStep(step);
    });
  });

  // Wire Restart Button
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      state.serviceId = 'standard-cleaning';
      state.locationZone = 'accra-core';
      state.addons = [];
      syncServicePanels();
      recalculate();
      goToStep(1);
    });
  }

  // IntersectionObserver for Analytics view event
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerEvent('smartquote_viewed');
        observer.unobserve(container);
      }
    });
  }, { threshold: 0.25 });
  observer.observe(container);

  // Initial Sync & Run
  syncServicePanels();
  recalculate();
}

/**
 * Backward compatibility stub for healthScoreAudit (if referenced on subpages)
 */
function initHealthScoreAudit() {
  const auditContainer = document.getElementById('healthScoreAudit');
  if (!auditContainer) return;
}

/**
 * 8. Live Civitas Digital Inspection Report Simulator
 */
function initReportSimulator() {
  const container = document.getElementById('reportSimulator');
  if (!container) return;

  const tabBtns = container.querySelectorAll('.report-tab-btn');
  const panes = container.querySelectorAll('.report-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = container.querySelector(`.report-pane[data-pane="${target}"]`);
      if (activePane) activePane.classList.add('active');
    });
  });
}

/**
 * 9. Interactive Global VIP WhatsApp Concierge Widget
 * Injects a sleek floating widget across all pages with pre-filled service triggers
 */
function initGlobalWhatsAppWidget() {
  if (document.getElementById('civitasWhatsAppWidget')) return;

  const widget = document.createElement('div');
  widget.id = 'civitasWhatsAppWidget';
  widget.className = 'civitas-wa-widget';
  widget.innerHTML = `
    <div class="civitas-wa-popup" id="civitasWaPopup" aria-hidden="true">
      <div class="civitas-wa-popup-header">
        <div class="civitas-wa-avatar-wrap">
          <img src="/assets/logos/Civitas_Symbol_256.png" alt="Civitas Concierge" class="civitas-wa-avatar">
          <span class="civitas-wa-status-dot"></span>
        </div>
        <div class="civitas-wa-header-info">
          <h5>Civitas Client Concierge</h5>
          <span>Online &bull; Accra &amp; Tema &bull; Typically replies under 15m</span>
        </div>
        <button class="civitas-wa-close-btn" id="civitasWaCloseBtn" aria-label="Close WhatsApp chat popup">&times;</button>
      </div>
      <div class="civitas-wa-popup-body">
        <div class="civitas-wa-msg-bubble">
          <p>Hello! Welcome to Civitas Estate & Maintenance. How can our technical team assist your property today?</p>
          <span class="civitas-wa-timestamp">Just now</span>
        </div>
        <div class="civitas-wa-quick-options">
          <p class="civitas-wa-quick-title">Quick Select Your Request:</p>
          <a href="${createWhatsAppUrl({ customMessage: 'Hello Civitas Estate & Maintenance! 🎄 I would like to claim your Christmas & December Homecoming Offer (Free 12-Point Electrical & AC Safety Audit with Deep Clean) for my property in Accra / Tema. Promo Code: XMAS-PREP26.' })}" target="_blank" rel="noopener noreferrer" class="civitas-wa-chip" style="background: #FFFDF0; border-color: #D4AF37; color: #7C1818; font-weight: 700;">
            🎄 Christmas &amp; December Homecoming Offer
          </a>
          <a href="${createWhatsAppUrl({ service: 'Move-in / Move-out Deep Cleaning', location: 'Accra / Tema' })}" target="_blank" rel="noopener noreferrer" class="civitas-wa-chip">
            🧹 Deep Cleaning / Move-In Scrub
          </a>
          <a href="${createWhatsAppUrl({ service: 'Emergency Plumbing / Electrical Repairs', location: 'Accra / Tema' })}" target="_blank" rel="noopener noreferrer" class="civitas-wa-chip">
            ⚡ Electrical or Plumbing Repair
          </a>
          <a href="${createWhatsAppUrl({ service: 'Diaspora Property Watch & Photographic Audit', location: 'Accra / Tema' })}" target="_blank" rel="noopener noreferrer" class="civitas-wa-chip">
            🌍 Diaspora Photographic Inspection
          </a>
          <a href="${createWhatsAppUrl({ service: 'Solar PV Cleaning & System Inspection', location: 'Accra / Tema' })}" target="_blank" rel="noopener noreferrer" class="civitas-wa-chip">
            ☀️ Solar Care &amp; Inverter Check
          </a>
        </div>
      </div>
      <div class="civitas-wa-popup-footer">
        <a href="https://wa.me/${SITE_CONFIG.contact.whatsappNumber}?text=Hello%20Civitas%20Estate%20%26%20Maintenance!%20I%20have%20an%20enquiry%20about%20my%20property." target="_blank" rel="noopener noreferrer" class="civitas-wa-direct-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.355.101.174.449.741.964 1.2.662.591 1.221.774 1.394.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/></svg>
          Open Chat Directly (+233 20 952 7426)
        </a>
      </div>
    </div>

    <button class="civitas-wa-trigger-btn" id="civitasWaTriggerBtn" aria-label="Open WhatsApp conversation" aria-expanded="false">
      <span class="civitas-wa-trigger-pulse"></span>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.355.101.174.449.741.964 1.2.662.591 1.221.774 1.394.861.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/></svg>
      <span class="civitas-wa-trigger-label">WhatsApp Us</span>
    </button>
  `;

  document.body.appendChild(widget);

  const trigger = document.getElementById('civitasWaTriggerBtn');
  const popup = document.getElementById('civitasWaPopup');
  const closeBtn = document.getElementById('civitasWaCloseBtn');

  if (!trigger || !popup) return;

  const togglePopup = () => {
    const isOpen = popup.classList.contains('active');
    if (isOpen) {
      popup.classList.remove('active');
      popup.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      popup.classList.add('active');
      popup.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
    }
  };

  trigger.addEventListener('click', togglePopup);
  if (closeBtn) closeBtn.addEventListener('click', () => {
    popup.classList.remove('active');
    popup.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('active')) {
      popup.classList.remove('active');
      popup.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * 10. Christmas & December Homecoming Interactive Instant Quote Form
 */
function initHolidayQuoteForm() {
  const form = document.getElementById('holidayQuoteForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const propertyType = form.querySelector('#holidayPropertyType')?.value || 'Residential Property';
    const location = form.querySelector('#holidayLocation')?.value || 'Accra / Tema';
    const packageChoice = form.querySelector('#holidayPackage')?.value || 'Christmas Holiday Prep Package';
    const targetDate = form.querySelector('#holidayTargetDate')?.value || 'December 2026';
    const clientName = form.querySelector('#holidayName')?.value || '';

    const customMessage = `Hello Civitas Estate & Maintenance! 🎄

I would like to claim the *Christmas & December Homecoming Property Care Offer*.

*Promo Code:* XMAS-PREP26 (Free 12-Point Electrical & AC Safety Audit)
*Property Type:* ${propertyType}
*Location:* ${location}
*Package Selected:* ${packageChoice}
*Preferred Target Date:* ${targetDate}
${clientName ? `*Name:* ${clientName}\n` : ''}
Please confirm availability for my neighborhood and provide my instant quotation with the holiday perks included.`;

    const waUrl = createWhatsAppUrl({ customMessage });
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}


