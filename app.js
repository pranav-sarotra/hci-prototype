// ===== OscarAnalytics Prototype — App Logic =====

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initForgotPassword();
  initNavigation();
  initSidebarToggle();
  initConsentBanner();
  initFunnelDropoffs();
  initChatbot();
  initNotifications();
  initGlossary();
  initBackLinks();
});

// ===== SIDEBAR TOGGLE =====
function initSidebarToggle() {
  const toggle = document.getElementById('sidebarToggle');
  const appLayout = document.getElementById('appLayout');
  if (!toggle || !appLayout) return;

  toggle.addEventListener('click', () => {
    appLayout.classList.toggle('sidebar-collapsed');
    toggle.title = appLayout.classList.contains('sidebar-collapsed') ? 'Expand sidebar' : 'Collapse sidebar';
  });
}

// ===== PAGE TITLE MAP =====
const pageTitles = {
  'page-dashboard': 'Dashboard',
  'page-funnel': 'Checkout Funnel',
  'page-peak-hours': 'Peak Hours',
  'page-top-products': 'Top Products',
  'page-heatmap': 'Click Heatmap',
  'page-scroll-depth': 'Scroll Depth',
  'page-report': 'Weekly Report',
  'page-export': 'Export / Reports',
  'page-comparison': 'Comparison',
  'page-search': 'Site Search',
  'page-customers': 'Customers',
  'page-inventory': 'Inventory & Delivery',
  'page-notifications': 'Notifications',
  'page-goals': 'Goals & Targets',
  'page-settings': 'Settings',
  'page-help': 'Help Centre',
  'page-product-detail': 'Product Detail',
  'page-session-detail': 'User Session',
};

// ===== LOGIN =====
function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-primary');
    btn.textContent = 'Signing in...';
    btn.disabled = true;
    setTimeout(() => {
      document.querySelector('.login-wrapper').classList.add('hidden');
      document.querySelector('.app-layout').classList.add('active');
      // Show chatbot FAB after login
      const chatFab = document.getElementById('chatbotFab');
      if (chatFab) chatFab.classList.remove('hidden');
      initCharts();
      // Show consent banner on first visit
      setTimeout(() => showConsent(), 800);
    }, 1000);
  });
}

// ===== FORGOT PASSWORD =====
function initForgotPassword() {
  const forgotLink = document.getElementById('forgotPasswordLink');
  const backLink = document.getElementById('backToLoginLink');
  const forgotForm = document.getElementById('forgotForm');

  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('loginPage').classList.add('hidden');
      document.getElementById('forgotPasswordPage').classList.remove('hidden');
    });
  }

  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('forgotPasswordPage').classList.add('hidden');
      document.getElementById('loginPage').classList.remove('hidden');
      // Reset form state
      if (forgotForm) forgotForm.classList.remove('hidden');
      const success = document.getElementById('resetSuccess');
      if (success) success.classList.add('hidden');
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value;
      const btn = forgotForm.querySelector('.btn-primary');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        forgotForm.classList.add('hidden');
        const success = document.getElementById('resetSuccess');
        success.classList.remove('hidden');
        document.getElementById('resetEmailDisplay').textContent = email || 'your email';
      }, 1200);
    });
  }
}

// ===== NAVIGATION =====
function initNavigation() {
  const links = document.querySelectorAll('.sidebar-nav a');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-page');
      navigateToPage(target);
      // Update active nav highlight
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function navigateToPage(pageId) {
  // Update page title
  document.getElementById('pageTitle').textContent = pageTitles[pageId] || pageId;
  // Show target section
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(pageId);
  if (section) section.classList.add('active');
  // Init charts/animations if needed
  if (pageId === 'page-dashboard') initCharts();
  if (pageId === 'page-peak-hours') initPeakHoursChart();
  if (pageId === 'page-scroll-depth') animateScrollBars();
  // Scroll to top of content area
  const content = document.querySelector('.page-content');
  if (content) content.scrollTop = 0;
}

// ===== CONSENT BANNER =====
function initConsentBanner() {
  document.querySelectorAll('.consent-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = document.getElementById('consentOverlay');
      overlay.classList.remove('active');
      const level = btn.getAttribute('data-level');
      const indicator = document.getElementById('consentStatus');
      if (indicator) {
        const labels = { full: 'Full Tracking', essential: 'Essential Only', decline: 'Anonymised' };
        indicator.textContent = labels[level] || level;
      }
    });
  });
}

function showConsent() {
  const overlay = document.getElementById('consentOverlay');
  if (overlay) overlay.classList.add('active');
}

// ===== FUNNEL DROP-OFF DETAILS =====
function initFunnelDropoffs() {
  // Clickable drop-off arrows
  document.querySelectorAll('.clickable-dropoff').forEach(arrow => {
    arrow.addEventListener('click', () => {
      const targetId = arrow.getAttribute('data-dropoff');
      const panel = document.getElementById(targetId);
      if (!panel) return;
      // Toggle panel visibility
      if (panel.classList.contains('active')) {
        panel.classList.remove('active');
      } else {
        // Close any other open panels first
        document.querySelectorAll('.dropoff-detail-panel.active').forEach(p => p.classList.remove('active'));
        panel.classList.add('active');
      }
    });
  });

  // Close buttons
  document.querySelectorAll('.dropoff-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-close');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.remove('active');
    });
  });
}

// ===== DASHBOARD CHARTS =====
let revenueChart, peakChart;

function initCharts() {
  // Revenue mini chart in dashboard
  const ctx = document.getElementById('revenueLineChart');
  if (!ctx) return;
  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Revenue (KES)',
        data: [142000, 185000, 167000, 210000, 245000, 310000, 278000],
        borderColor: '#4f6ef7',
        backgroundColor: 'rgba(79,110,247,0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#4f6ef7',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f1729',
          titleFont: { family: 'Inter' },
          bodyFont: { family: 'Inter' },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => 'KES ' + ctx.parsed.y.toLocaleString()
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 12 }, color: '#9ca3af' }
        },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: {
            font: { family: 'Inter', size: 12 },
            color: '#9ca3af',
            callback: (v) => 'KES ' + (v / 1000).toFixed(0) + 'k'
          }
        }
      }
    }
  });
}

function initPeakHoursChart() {
  const ctx = document.getElementById('peakHoursChart');
  if (!ctx) return;
  if (peakChart) peakChart.destroy();
  const hours = Array.from({length: 24}, (_, i) => {
    const h = i % 12 || 12;
    return h + (i < 12 ? 'AM' : 'PM');
  });
  const data = [2,1,0,0,1,3,8,15,22,18,14,12,16,13,11,14,19,28,35,42,38,25,15,8];
  const colors = data.map(v => {
    if (v >= 35) return '#4f6ef7';
    if (v >= 20) return 'rgba(79,110,247,0.7)';
    if (v >= 10) return 'rgba(79,110,247,0.45)';
    return 'rgba(79,110,247,0.2)';
  });

  peakChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hours,
      datasets: [{
        label: 'Orders',
        data: data,
        backgroundColor: colors,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f1729',
          titleFont: { family: 'Inter' },
          bodyFont: { family: 'Inter' },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ctx.parsed.y + ' orders'
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 10 }, color: '#9ca3af', maxRotation: 45 }
        },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: { font: { family: 'Inter', size: 12 }, color: '#9ca3af' },
          title: {
            display: true,
            text: 'Number of Orders',
            font: { family: 'Inter', size: 12, weight: '500' },
            color: '#6b7280'
          }
        }
      }
    }
  });
}

// ===== SCROLL DEPTH ANIMATION =====
function animateScrollBars() {
  const bars = document.querySelectorAll('.scroll-bar-fill');
  bars.forEach(bar => {
    const target = bar.getAttribute('data-width');
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target; }, 100);
  });
}

// ===== AI CHATBOT =====
function initChatbot() {
  const fab = document.getElementById('chatbotFab');
  const panel = document.getElementById('chatbotPanel');
  const closeBtn = document.getElementById('chatbotClose');
  if (!fab || !panel) return;

  fab.addEventListener('click', () => {
    panel.classList.toggle('hidden');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.add('hidden');
    });
  }

  // Page-specific AI responses
  const pageResponses = {
    'page-dashboard': 'Your Dashboard shows 5 key metrics this week. Revenue is KES 1.54M (↑12.1%) with 247 orders. Nairobi contributes 48% of revenue. The "Free Shipping Mombasa" campaign has the highest ROI at 540%. Consider expanding this to Kisumu and Nakuru.',
    'page-funnel': 'Your checkout funnel shows the biggest drop-off (58.2%) between product view and add-to-cart. Mombasa users struggle most at cart→checkout (38% drop), likely due to shipping cost visibility. M-Pesa timeouts cause 47% of payment failures.',
    'page-peak-hours': 'Peak ordering happens between 7–9 PM EAT. Mombasa customers order latest (8–10:30 PM) while Nakuru peaks earliest (5–7 PM). Consider staggering flash sale timings per region to maximise conversions.',
    'page-top-products': 'Samsung Galaxy A15 leads with 1,842 views and 4.8% conversion. Watch out for Ankara Print Dress (38% return rate) and Wool Winter Jacket (100% returns). Cooling products dominate Mombasa due to coastal heat.',
    'page-heatmap': 'On the Samsung Galaxy A15 page, "Add to Cart" gets the most clicks in Nairobi (41%), while Mombasa users prefer "Buy Now — M-Pesa" (52%). Kisumu users focus on the price area (38%), suggesting price sensitivity.',
    'page-scroll-depth': 'Average scroll depth is just 38%. Mombasa is critical at 28% (78% mobile). Move your "Add to Cart" button and key product details higher on the page. Nakuru has the best scroll depth at 56%.',
    'page-report': 'Your weekly report covers 5 May – 11 May 2026. Key highlights: Revenue up 12.1%, Nairobi leads at 48% revenue share, M-Pesa accounts for 73% of payments. Delivery success is at 94%.',
    'page-search': 'Top search: "samsung" with 89% click-through rate. "wireless earbuds" and "office chair" have 232 combined searches but zero results — these are missed revenue opportunities. Consider stocking these products.',
    'page-customers': 'You have 7,712 unique visitors this week. 64% are on mobile. Mombasa has the highest CLV (KES 24,800) and repeat rate (38%). 345 visitors from Tanzania, Uganda, and Rwanda converted zero — consider cross-border shipping.',
    'page-notifications': 'You have 7 unread alerts, 2 are critical. Samsung Galaxy A15 has only 3 units left — it will sell out tomorrow at current velocity. Orders dropped 22% in Mombasa — check M-Pesa gateway.',
    'page-comparison': 'This week vs last week: Revenue up 12.3%, Orders up 8.3%, Conversion up from 2.8% to 3.2%. Nakuru is the biggest mover (+32.1%) driven by Solar Panel Kit sales. Kisumu dipped 2%.',
    'page-export': 'You can download your weekly PDF report, monthly summary, or export raw product/customer data as CSV. Reports are automatically generated every Monday at 06:00 EAT.',
    'page-inventory': 'You have 3 low-stock items and 1 out-of-stock (Yoga Mat). Samsung Galaxy A15 has only 3 units — restock is due tomorrow. Nakuru delivery success is only 84% — consider a different courier.',
    'page-goals': 'Your Monthly Revenue target is 72% achieved (KES 4.32M of 6M). AOV is on track at 89%. Conversion Rate is at risk (3.2% vs 5% target). Monthly Orders are behind at 62%.',
    'page-settings': 'Your store settings are configured. Weekly PDF reports and email alerts are active. All tracking complies with the Kenya Data Protection Act (2019).',
    'page-help': 'Welcome to the Help Centre! Browse the Quick Start Guide for onboarding, check the Glossary for metric definitions, or contact support for assistance.',
  };

  const improvementResponses = {
    'page-dashboard': '1. Expand the "Free Shipping" promo from Mombasa to Kisumu/Nakuru — it has 540% ROI.\n2. Investigate the M-Pesa timeout issue — it causes 47% of payment drop-offs.\n3. Focus marketing on the 7–9 PM peak window.',
    'page-funnel': '1. Add shipping cost calculator earlier in the flow (before checkout) — Mombasa drops 38% at cart→checkout.\n2. Implement M-Pesa payment retry with SMS fallback.\n3. Simplify the product page layout to improve the 58% view→cart drop-off.',
    'page-top-products': '1. Remove or significantly discount the Wool Winter Jacket (100% return rate — wrong product for Kenya).\n2. Improve Ankara Print Dress sizing guide to reduce 38% returns.\n3. Stock more cooling products for Mombasa.',
    'page-customers': '1. Enable TZS/UGX/RWF payments to convert 345 cross-border visitors.\n2. Target Mombasa with loyalty programmes — they have the highest CLV.\n3. Optimise mobile checkout — 64% of traffic is mobile.',
  };

  // Chip click handlers
  document.querySelectorAll('.chatbot-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const action = chip.getAttribute('data-action');
      const activePage = document.querySelector('.page-section.active');
      const pageId = activePage ? activePage.id : 'page-dashboard';
      const body = document.getElementById('chatbotBody');

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'chatbot-message user';
      userMsg.innerHTML = `<div class="chatbot-bubble">${chip.textContent}</div>`;
      body.appendChild(userMsg);

      // Generate bot response
      let response = '';
      if (action === 'explain') {
        response = pageResponses[pageId] || 'I can provide insights about this page. Try asking about specific metrics.';
      } else if (action === 'improve') {
        response = improvementResponses[pageId] || 'Based on the data, consider: 1) Optimising for mobile users, 2) Expanding regional coverage, 3) Reducing funnel drop-offs.';
      } else if (action === 'trends') {
        response = 'Key trends this week: Revenue ↑12.1%, Conversion ↑14.3%, Bounce Rate ↓5.6%. Mombasa is your fastest-growing region (+23.8%). Nakuru revenue jumped 32.1% driven by Solar Panel Kit sales.';
      }

      // Add bot response with typing delay
      setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'chatbot-message bot';
        botMsg.innerHTML = `<div class="chatbot-avatar">🤖</div><div class="chatbot-bubble">${response}</div>`;
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
      }, 600);

      body.scrollTop = body.scrollHeight;
    });
  });

  // Text input send
  const sendBtn = document.querySelector('.chatbot-send');
  const input = document.querySelector('.chatbot-input');
  if (sendBtn && input) {
    const sendMessage = () => {
      const text = input.value.trim();
      if (!text) return;
      const body = document.getElementById('chatbotBody');
      const userMsg = document.createElement('div');
      userMsg.className = 'chatbot-message user';
      userMsg.innerHTML = `<div class="chatbot-bubble">${text}</div>`;
      body.appendChild(userMsg);
      input.value = '';

      setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'chatbot-message bot';
        botMsg.innerHTML = `<div class="chatbot-avatar">🤖</div><div class="chatbot-bubble">That's a great question! Based on your store data, I'd recommend checking the relevant analytics page for detailed insights. Use the sidebar navigation to explore your data, or click one of the quick action chips above for instant analysis.</div>`;
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
      }, 800);
    };
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
}

// ===== NOTIFICATIONS =====
function initNotifications() {
  const tabs = document.querySelectorAll('.alert-tab');
  const cards = document.querySelectorAll('.alert-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      cards.forEach(card => {
        if (filter === 'all') {
          card.style.display = 'flex';
        } else {
          card.style.display = card.getAttribute('data-type') === filter ? 'flex' : 'none';
        }
      });
    });
  });

  // Dismiss / Snooze / Clear buttons
  document.querySelectorAll('.alert-action-btn.outline').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.alert-card');
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        card.style.transition = 'all 0.3s ease';
        setTimeout(() => { card.style.display = 'none'; }, 300);
      }
    });
  });
}

// ===== GLOSSARY ACCORDION =====
function initGlossary() {
  document.querySelectorAll('.glossary-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.glossary-item');
      if (!item) return;
      // Close others
      document.querySelectorAll('.glossary-item.open').forEach(i => {
        if (i !== item) i.classList.remove('open');
      });
      // Toggle this one
      item.classList.toggle('open');
    });
  });
}

// ===== BACK LINKS (Drill-down Navigation) =====
function initBackLinks() {
  document.querySelectorAll('.back-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-back');
      navigateToPage(target);
      // Update sidebar active state
      const navLink = document.querySelector(`.sidebar-nav a[data-page="${target}"]`);
      if (navLink) {
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        navLink.classList.add('active');
      }
    });
  });

  // Product name click → Product Detail drill-down
  const topProductsSection = document.getElementById('page-top-products');
  if (topProductsSection) {
    topProductsSection.querySelectorAll('.product-name').forEach(name => {
      name.style.cursor = 'pointer';
      name.style.color = 'var(--accent)';
      name.title = 'Click to view product details';
      name.addEventListener('click', () => {
        navigateToPage('page-product-detail');
      });
    });
  }

  // User ID click in funnel drop-off tables → Session Detail drill-down
  document.querySelectorAll('.dropoff-table tbody tr').forEach(row => {
    const userCell = row.querySelector('td:first-child');
    if (userCell) {
      userCell.style.cursor = 'pointer';
      userCell.style.color = 'var(--accent)';
      userCell.style.fontWeight = '600';
      userCell.title = 'Click to view full session replay';
      userCell.addEventListener('click', () => {
        navigateToPage('page-session-detail');
      });
    }
  });
}
