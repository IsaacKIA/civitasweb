import { SITE_CONFIG, createWhatsAppUrl } from './site-config.js';
import {
  PRICE_LIST,
  PRICE_VERSION_LINE,
  formatPrice,
  formatFromPrice,
} from './config/pricing.ts';
import { hydratePriceTokens, renderFullPricingSection } from './pricing-ui.ts';
import { mountSmartQuoteApp } from './smartquote-ui.ts';
import { mountAdminQuotesApp } from './admin-quotes.ts';
import { initInteractiveExperience } from './interactive-experience.ts';

document.addEventListener('DOMContentLoaded', () => {
  hydratePriceTokens();
  initPricingSections();
  initMobileMenu();
  initFaqAccordion();
  initQuoteModal();
  initFormHandlers();
  initVideoShowcaseModal();
  initHeroVideoControls();
  initBeforeAfterSlider();
  initPlanEstimator();
  initSuburbCoverageChecker();
  initAnimatedStatsCounter();
  initSmartQuote();
  initReportSimulator();
  initInteractiveExperience();
  initGlobalWhatsAppWidget();
});

/**
 * Mounts dynamic pricing tables, scope matrices, and admin dashboard if present on the page
 */
function initPricingSections() {
  const pricingCatalogue = document.getElementById('civitasPricingCatalogue');
  if (pricingCatalogue) {
    renderFullPricingSection(pricingCatalogue);
  }

  const adminMount = document.getElementById('adminQuotesMount');
  if (adminMount) {
    mountAdminQuotesApp(adminMount);
  }
}

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

  if (!modal) {
    // If no modal on page, route [data-open-quote] buttons directly to /get-a-quote/
    openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/get-a-quote/';
      });
    });
    return;
  }

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

  const careButtons = document.querySelectorAll('[data-care-plan]');
  careButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const planName = btn.getAttribute('data-care-plan');
      const waUrl = createWhatsAppUrl({ planName });
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  });

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
 * 1. Video Lightbox Modal for Field Operations Showcase
 */
function initVideoShowcaseModal() {
  let modal = document.getElementById('videoLightboxModal') || document.getElementById('videoModal');
  let videoPlayer = document.getElementById('videoLightboxPlayer') || document.getElementById('modalVideoPlayer');
  let closeBtn = document.getElementById('videoLightboxClose') || document.getElementById('videoModalClose');

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
  const afterImg = afterWrap?.querySelector('.ba-image');
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
 * 4. Care & Property Watch Starting Price Selector (reads strictly from PRICE_LIST)
 */
function initPlanEstimator() {
  const estimatorBox = document.getElementById('planEstimatorBox');
  if (!estimatorBox) return;

  const tierCards = estimatorBox.querySelectorAll('.tier-option-card');
  const priceDisplay = document.getElementById('estimatorPriceValue');
  const waBtn = document.getElementById('estimatorWhatsAppBtn');

  const tierConfig = {
    careEssential: {
      label: 'Care Essential',
      price: PRICE_LIST.fromPrices.careEssential,
    },
    carePlus: {
      label: 'Care Plus',
      price: PRICE_LIST.fromPrices.carePlus,
    },
    watchMonthly: {
      label: 'Property Watch Monthly',
      price: PRICE_LIST.fromPrices.watchMonthly,
    },
    watchPlus: {
      label: 'Property Watch Plus',
      price: PRICE_LIST.fromPrices.watchPlus,
    }
  };

  let selectedTier = 'careEssential';

  const updateEstimator = () => {
    const current = tierConfig[selectedTier] || tierConfig.careEssential;
    if (priceDisplay) {
      priceDisplay.textContent = formatFromPrice(current.price);
    }

    if (waBtn) {
      const message = `Hello Civitas Estate & Maintenance,
I would like to enquire about ${current.label} (${formatFromPrice(current.price, 'per month')}).
${PRICE_VERSION_LINE}
Please share the full written scope and availability for my property in Accra / Tema.`;

      waBtn.href = createWhatsAppUrl({ customMessage: message });
    }
  };

  tierCards.forEach(card => {
    card.addEventListener('click', () => {
      tierCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTier = card.dataset.tier || 'careEssential';
      updateEstimator();
    });
  });

  updateEstimator();
}

/**
 * 5. Interactive Suburb & Geo-Coverage Checker
 */
function initSuburbCoverageChecker() {
  const chips = document.querySelectorAll('.suburb-chip');
  const bannerName = document.getElementById('activeSuburbName');
  const bannerTime = document.getElementById('activeSuburbDispatch');

  const suburbData = {
    'East Legon': { dispatch: 'Scheduled Coverage', zone: 'Accra Core Coverage' },
    'Airport Residential': { dispatch: 'Scheduled Coverage', zone: 'Accra Core Coverage' },
    'Cantonments': { dispatch: 'Scheduled Coverage', zone: 'Accra Core Coverage' },
    'Trasacco Valley': { dispatch: 'Scheduled Coverage', zone: 'Accra Core Coverage' },
    'Labone': { dispatch: 'Scheduled Coverage', zone: 'Accra Core Coverage' },
    'Ridge': { dispatch: 'Scheduled Coverage', zone: 'Accra Core Coverage' },
    'Dzorwulu': { dispatch: 'Scheduled Coverage', zone: 'Accra Core Coverage' },
    'Roman Ridge': { dispatch: 'Scheduled Coverage', zone: 'Accra Core Coverage' },
    'Spintex': { dispatch: 'Scheduled Coverage', zone: 'Accra East Corridor' },
    'Sakumono': { dispatch: 'Scheduled Coverage', zone: 'Tema & Coastal Corridor' },
    'Tema Comm 1–25': { dispatch: 'Scheduled Coverage', zone: 'Tema Metropolitan Coverage' }
  };

  if (chips.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const name = chip.getAttribute('data-suburb');
        if (bannerName) bannerName.textContent = name;
        if (bannerTime && suburbData[name]) {
          bannerTime.textContent = `${suburbData[name].dispatch} • ${suburbData[name].zone} (Local transport included in cleaning prices)`;
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
 * 7. CIVITAS SMART QUOTE — Mounts the fairness engine into #smartQuoteMount or #smartQuoteApp
 */
function initSmartQuote() {
  const mount = document.getElementById('smartQuoteMount') || document.getElementById('smartQuoteApp');
  if (!mount) return;
  mountSmartQuoteApp(mount);
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
 * 9. Interactive Global WhatsApp Widget (using strictly list prices from PRICE_LIST, no promo codes)
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
          <h5>Civitas Client Support</h5>
          <span>Accra &amp; Tema &bull; Transparent Scope-Based Quotes</span>
        </div>
        <button class="civitas-wa-close-btn" id="civitasWaCloseBtn" aria-label="Close WhatsApp chat popup">&times;</button>
      </div>
      <div class="civitas-wa-popup-body">
        <div class="civitas-wa-msg-bubble">
          <p>Hello! How can we help with your property in Accra or Tema today?</p>
          <span class="civitas-wa-timestamp">${PRICE_VERSION_LINE}</span>
        </div>
        <div class="civitas-wa-quick-options">
          <p class="civitas-wa-quick-title">Select a service or build an instant quote:</p>
          <a href="/get-a-quote/" class="civitas-wa-chip" style="font-weight: 700;">
            Build Itemised Smart Quote (${formatFromPrice(PRICE_LIST.cleaning.standard['1'])})
          </a>
          <a href="${createWhatsAppUrl({ service: `${PRICE_LIST.cleaning.deep.label} (${formatFromPrice(PRICE_LIST.cleaning.deep['1'])})`, location: 'Accra / Tema' })}" target="_blank" rel="noopener noreferrer" class="civitas-wa-chip">
            ${PRICE_LIST.cleaning.deep.label} (${formatFromPrice(PRICE_LIST.cleaning.deep['1'])})
          </a>
          <a href="${createWhatsAppUrl({ service: `Minor Repair (${formatFromPrice(PRICE_LIST.fromPrices.minorRepair)})`, location: 'Accra / Tema' })}" target="_blank" rel="noopener noreferrer" class="civitas-wa-chip">
            Minor Repair (${formatFromPrice(PRICE_LIST.fromPrices.minorRepair)})
          </a>
          <a href="${createWhatsAppUrl({ service: `Property Watch (${formatFromPrice(PRICE_LIST.fromPrices.watchMonthly, 'per month')})`, location: 'Accra / Tema' })}" target="_blank" rel="noopener noreferrer" class="civitas-wa-chip">
            Property Watch (${formatFromPrice(PRICE_LIST.fromPrices.watchMonthly, 'per month')})
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
