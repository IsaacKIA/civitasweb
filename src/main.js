import { SITE_CONFIG, createWhatsAppUrl } from './site-config.js';

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
  initHealthScoreAudit();
  initReportSimulator();
  initGlobalWhatsAppWidget();
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
  const isPreLaunch = SITE_CONFIG.mode === 'pre-launch';
  const preLaunchBanner = document.querySelector('.pre-launch-bar');
  if (preLaunchBanner) {
    preLaunchBanner.style.display = isPreLaunch ? 'flex' : 'none';
  }

  // Update dynamic labels if in pre-launch
  if (isPreLaunch) {
    document.querySelectorAll('[data-mode-cta]').forEach(el => {
      if (el.getAttribute('data-mode-cta') === 'primary') {
        el.textContent = 'Register Your Interest';
      } else if (el.getAttribute('data-mode-cta') === 'secondary') {
        el.textContent = 'Enquire About January Bookings';
      }
    });
  }
}

/**
 * Optional Dev/Client Mode Switcher in footer
 * Allows stakeholders to toggle between Pre-Launch and Live view in real-time
 */
function initModeSwitcherBadge() {
  const switcher = document.getElementById('modeSwitcherBtn');
  if (!switcher) return;

  switcher.addEventListener('click', () => {
    SITE_CONFIG.mode = SITE_CONFIG.mode === 'pre-launch' ? 'live' : 'pre-launch';
    localStorage.setItem('civitas_site_mode', SITE_CONFIG.mode);
    location.reload();
  });
}

/**
 * 1. Video Lightbox Modal for Field Operations Showcase
 */
function initVideoShowcaseModal() {
  const modal = document.getElementById('videoLightboxModal') || document.getElementById('videoModal');
  const videoPlayer = document.getElementById('videoLightboxPlayer') || document.getElementById('modalVideoPlayer');
  const closeBtn = document.getElementById('videoLightboxClose') || document.getElementById('videoModalClose');
  const triggers = document.querySelectorAll('[data-video-src]');

  if (!modal || !videoPlayer) return;

  const openVideoModal = (videoSrc) => {
    videoPlayer.src = videoSrc;
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    videoPlayer.play().catch(() => {});
  };

  const closeVideoModal = () => {
    modal.classList.remove('active');
    modal.style.display = '';
    document.body.style.overflow = '';
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
  };

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const src = btn.getAttribute('data-video-src');
      if (src) openVideoModal(src);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeVideoModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
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

  if (!heroVideo) return;

  if (togglePlayBtn) {
    togglePlayBtn.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play();
        togglePlayBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          Pause
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
 * 7. Interactive Property Health Score™ & Risk Diagnostic Simulator
 */
function initHealthScoreAudit() {
  const auditContainer = document.getElementById('healthScoreAudit');
  if (!auditContainer) return;

  const chips = auditContainer.querySelectorAll('.health-chip');
  const scoreNum = auditContainer.querySelector('#healthScoreNumber');
  const statusBadge = auditContainer.querySelector('#healthStatusBadge');
  const lossEl = auditContainer.querySelector('#healthLossAmount');
  const whatsAppBtn = auditContainer.querySelector('#healthWhatsAppBtn');

  // Risk breakdown elements
  const valElectrical = auditContainer.querySelector('#riskValElectrical');
  const valHVAC = auditContainer.querySelector('#riskValHVAC');
  const valPlumbing = auditContainer.querySelector('#riskValPlumbing');
  const valSolar = auditContainer.querySelector('#riskValSolar');

  const auditState = {
    location: 'East Legon',
    scale: 'Standalone Villa',
    method: 'Ad-hoc Roadside Artisans',
    systems: ['Solar & Inverter', 'Multi-split ACs']
  };

  const calculateHealth = () => {
    let score = 92;
    let baseLoss = 12000;

    // Method penalty
    if (auditState.method === 'Ad-hoc Roadside Artisans') {
      score -= 28;
      baseLoss += 26500;
      if (valElectrical) { valElectrical.textContent = 'High Fault Risk'; valElectrical.style.color = '#FFAE8C'; }
    } else if (auditState.method === 'Caretaker / Self-Managed') {
      score -= 16;
      baseLoss += 14000;
      if (valElectrical) { valElectrical.textContent = 'Moderate Risk'; valElectrical.style.color = '#F8E5A0'; }
    } else {
      score -= 34;
      baseLoss += 35000;
      if (valElectrical) { valElectrical.textContent = 'Critical Neglect'; valElectrical.style.color = '#FFAE8C'; }
    }

    // Scale impact
    if (auditState.scale === 'Standalone Villa') {
      baseLoss *= 1.35;
    } else if (auditState.scale === 'Executive Residence') {
      baseLoss *= 1.15;
    }

    // Systems impact
    if (auditState.systems.includes('Solar & Inverter')) {
      if (valSolar) { valSolar.textContent = 'Needs Bi-Annual Flush'; valSolar.style.color = '#F8E5A0'; }
    } else {
      if (valSolar) { valSolar.textContent = 'Grid Only'; valSolar.style.color = '#B5D2C8'; }
    }

    if (valHVAC) {
      valHVAC.textContent = score < 65 ? 'High Compressor Wear' : 'Moderate Filter Wash Due';
      valHVAC.style.color = score < 65 ? '#FFAE8C' : '#F8E5A0';
    }

    if (valPlumbing) {
      valPlumbing.textContent = score < 60 ? 'Pressure Fluctuations' : 'Acceptable Head';
      valPlumbing.style.color = score < 60 ? '#FFAE8C' : '#72F19E';
    }

    // Bound score
    score = Math.max(38, Math.min(score, 96));
    const roundedLoss = Math.round(baseLoss / 500) * 500;

    if (scoreNum) scoreNum.textContent = score;

    if (statusBadge) {
      statusBadge.className = 'score-status-badge';
      if (score < 60) {
        statusBadge.classList.add('alert');
        statusBadge.textContent = 'High Depreciation Risk';
      } else if (score < 78) {
        statusBadge.classList.add('caution');
        statusBadge.textContent = 'Moderate Attention Required';
      } else {
        statusBadge.classList.add('optimal');
        statusBadge.textContent = 'Standard Condition';
      }
    }

    if (lossEl) {
      lossEl.textContent = `GH₵ ${roundedLoss.toLocaleString()}`;
    }

    if (whatsAppBtn) {
      const msg = `Hello Civitas Concierge, I completed the Property Health Diagnostic on civitasestate.com for my ${auditState.scale} in ${auditState.location}. My diagnostic score was ${score}/100 with an estimated 3-year risk of GH₵${roundedLoss.toLocaleString()}. I would like to schedule a formal Civitas Condition Assessment.`;
      whatsAppBtn.href = createWhatsAppUrl(msg);
    }
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const category = chip.getAttribute('data-cat');
      const val = chip.getAttribute('data-val');

      if (category === 'systems') {
        chip.classList.toggle('active');
        if (chip.classList.contains('active')) {
          if (!auditState.systems.includes(val)) auditState.systems.push(val);
        } else {
          auditState.systems = auditState.systems.filter(s => s !== val);
        }
      } else {
        const siblings = auditContainer.querySelectorAll(`.health-chip[data-cat="${category}"]`);
        siblings.forEach(s => s.classList.remove('active'));
        chip.classList.add('active');
        auditState[category] = val;
      }

      calculateHealth();
    });
  });

  // Initial calculation
  calculateHealth();
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

