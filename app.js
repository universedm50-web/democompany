/**
 * app.js - Logic & Tương tác cho Siêu Dự Án The Breath of Mekong Sea (4.000 ha)
 * Tập đoàn DEMO (DEMO Group)
 */

// Global State
let currentLang = 'vi';
let currentZoom = 1;
let currentZoneFilter = 'all';
let currentNewsFilter = 'all';

// ============================================================================
// 1. INITIALIZATION & ROUTING
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Check stored language or default to 'vi'
  const savedLang = localStorage.getItem('demo_lang') || 'vi';
  setLanguage(savedLang, false);

  // Initialize Routing
  initRouting();

  // Initialize Components
  initHeader();
  renderMasterplanPins();
  renderMasterplanQuicklist();
  renderLeaders();
  renderZonesGallery(currentZoneFilter);
  renderLegalTable();
  renderBiddingPackages();
  renderNews(currentNewsFilter);

  // Auto-select first zone in drawer for demo or keep closed
});

// Routing based on URL Hash
function initRouting() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  const cleanHash = hash.split('?')[0];

  // Specific anchor on home page
  if (cleanHash === '#masterplanAnchor' || cleanHash === '#heroSection' || cleanHash === '#philosophySection' || cleanHash === '#iconicArchitectureSection' || cleanHash === '#investmentCollabSection' || cleanHash === '#esgSection') {
    switchPageView('home');
    const elem = document.querySelector(cleanHash);
    if (elem) {
      setTimeout(() => {
        elem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    updateNavActive('home');
    return;
  }

  // Normal pages
  const pageMap = {
    '#home': 'home',
    '#about': 'about',
    '#project': 'project',
    '#investment': 'investment',
    '#legal-esg': 'legal-esg',
    '#procurement': 'procurement',
    '#news': 'news',
    '#contact': 'contact'
  };

  const pageId = pageMap[cleanHash] || 'home';
  switchPageView(pageId);
  updateNavActive(pageId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchPageView(pageId) {
  const allViews = document.querySelectorAll('.page-view');
  allViews.forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${pageId}`);
  if (targetView) {
    targetView.classList.add('active');
  } else {
    document.getElementById('view-home').classList.add('active');
  }
}

function updateNavActive(pageId) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === `#${pageId}`) {
      link.classList.add('active');
    }
  });

  // Close mobile drawer if open
  const navMenu = document.getElementById('navMenu');
  if (navMenu && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
  }
}

// ============================================================================
// 2. HEADER & NAVIGATION
// ============================================================================
function initHeader() {
  const header = document.getElementById('mainHeader');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  // Sticky header blur effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileBtn.querySelector('i');
      if (navMenu.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });
  }
}

// ============================================================================
// 3. MULTILINGUAL ENGINE (VI / EN)
// ============================================================================
function setLanguage(lang, triggerRerender = true) {
  currentLang = lang;
  localStorage.setItem('demo_lang', lang);

  // Update button active state
  const btnVi = document.getElementById('btnLangVi');
  const btnEn = document.getElementById('btnLangEn');
  if (btnVi && btnEn) {
    if (lang === 'vi') {
      btnVi.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnVi.classList.remove('active');
    }
  }

  // Update static text elements with data-i18n
  const dict = translations[lang] || translations.vi;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Update dynamic components if already initialized
  if (triggerRerender) {
    renderMasterplanPins();
    renderMasterplanQuicklist();
    renderLeaders();
    renderZonesGallery(currentZoneFilter);
    renderLegalTable();
    renderBiddingPackages();
    renderNews(currentNewsFilter);

    // If drawer is open, re-render drawer
    const drawer = document.getElementById('zoneDrawer');
    if (drawer && drawer.classList.contains('open')) {
      const code = document.getElementById('drawerCode').textContent;
      const zone = projectData.zones.find(z => z.code === code);
      if (zone) openZoneDrawer(zone.id);
    }
  }
}

// ============================================================================
// 4. INTERACTIVE MASTERPLAN ENGINE (14 ZONES)
// ============================================================================
function renderMasterplanPins() {
  const container = document.getElementById('masterplanPinsContainer');
  if (!container) return;

  container.innerHTML = '';
  projectData.zones.forEach((zone, index) => {
    const pin = document.createElement('div');
    pin.className = 'zone-pin';
    pin.id = `pin-${zone.id}`;
    pin.style.left = `${zone.x}%`;
    pin.style.top = `${zone.y}%`;

    const name = currentLang === 'vi' ? zone.name_vi : zone.name_en;

    pin.innerHTML = `
      <div class="pin-pulse" style="border-color: ${zone.color};"></div>
      <div class="pin-beacon" style="border-color: ${zone.color};">
        <i class="fa-solid ${zone.icon}"></i>
      </div>
      <div class="pin-label">${zone.code}: ${name}</div>
    `;

    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      openZoneDrawer(zone.id);
    });

    container.appendChild(pin);
  });
}

function renderMasterplanQuicklist() {
  const container = document.getElementById('masterplanQuicklist');
  if (!container) return;

  container.innerHTML = '';
  projectData.zones.forEach(zone => {
    const item = document.createElement('div');
    item.className = 'quicklist-item';
    item.id = `quicklist-${zone.id}`;

    const name = currentLang === 'vi' ? zone.name_vi : zone.name_en;
    const unit = currentLang === 'vi' ? 'Hecta' : 'Hectares';

    item.innerHTML = `
      <span class="quicklist-code">${zone.code}</span>
      <span class="quicklist-name" title="${name}">${name}</span>
      <span class="quicklist-area">${zone.area} ${unit}</span>
    `;

    item.addEventListener('click', () => {
      openZoneDrawer(zone.id);
    });

    container.appendChild(item);
  });
}

function openZoneDrawer(zoneId) {
  const zone = projectData.zones.find(z => z.id === zoneId);
  if (!zone) return;

  const drawer = document.getElementById('zoneDrawer');
  if (!drawer) return;

  // Active pin & quicklist highlight
  document.querySelectorAll('.zone-pin').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.quicklist-item').forEach(q => q.classList.remove('active'));

  const activePin = document.getElementById(`pin-${zoneId}`);
  if (activePin) activePin.classList.add('active');

  const activeQuick = document.getElementById(`quicklist-${zoneId}`);
  if (activeQuick) activeQuick.classList.add('active');

  // Fill drawer info
  const name = currentLang === 'vi' ? zone.name_vi : zone.name_en;
  const desc = currentLang === 'vi' ? zone.desc_vi : zone.desc_en;
  const status = currentLang === 'vi' ? zone.status_vi : zone.status_en;
  const highlights = currentLang === 'vi' ? zone.highlights_vi : zone.highlights_en;
  const unit = currentLang === 'vi' ? 'Hecta' : 'Hectares';

  document.getElementById('drawerCode').textContent = zone.code;
  document.getElementById('drawerTitle').textContent = name;
  document.getElementById('drawerArea').textContent = `${zone.area} ${unit}`;
  document.getElementById('drawerStatus').textContent = status;
  document.getElementById('drawerDesc').textContent = desc;
  document.getElementById('drawerImage').src = zone.image;

  // Render highlights
  const hlContainer = document.getElementById('drawerHighlights');
  hlContainer.innerHTML = '';
  highlights.forEach(h => {
    const li = document.createElement('li');
    li.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${h}`;
    hlContainer.appendChild(li);
  });

  drawer.classList.add('open');
}

function closeZoneDrawer() {
  const drawer = document.getElementById('zoneDrawer');
  if (drawer) drawer.classList.remove('open');
  document.querySelectorAll('.zone-pin').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.quicklist-item').forEach(q => q.classList.remove('active'));
}

function zoomMasterplan(delta) {
  currentZoom = Math.min(Math.max(currentZoom + delta, 0.8), 1.6);
  applyMasterplanTransform();
}

function resetMasterplan() {
  currentZoom = 1;
  applyMasterplanTransform();
}

function applyMasterplanTransform() {
  const canvas = document.getElementById('masterplanCanvasBox');
  const bg = canvas.querySelector('.masterplan-bg-img');
  const svg = canvas.querySelector('.masterplan-svg-layer');
  const pins = document.getElementById('masterplanPinsContainer');

  const transform = `scale(${currentZoom})`;
  if (bg) bg.style.transform = transform;
  if (svg) svg.style.transform = transform;
  if (pins) pins.style.transform = transform;
}

// ============================================================================
// 5. SUB-MODULE RENDERING (LEADERS, GALLERY, LEGAL, BIDDING, NEWS)
// ============================================================================

// Render Leaders on About Page
function renderLeaders() {
  const grid = document.getElementById('leadersGrid');
  if (!grid) return;

  grid.innerHTML = '';
  projectData.leaders.forEach(leader => {
    const card = document.createElement('div');
    card.className = 'leader-card';

    const title = currentLang === 'vi' ? leader.title_vi : leader.title_en;
    const role = currentLang === 'vi' ? leader.role_vi : leader.role_en;

    card.innerHTML = `
      <div class="leader-img-box">
        <img src="${leader.avatar}" alt="${leader.name}">
      </div>
      <div class="leader-info">
        <h4 class="leader-name">${leader.name}</h4>
        <div class="leader-title">${title}</div>
        <div class="leader-role">${role}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      openLeaderModal(leader.id);
    });

    grid.appendChild(card);
  });
}

// Render 14 Zones Gallery on Project Page
function renderZonesGallery(category) {
  const grid = document.getElementById('zonesGalleryGrid');
  if (!grid) return;

  grid.innerHTML = '';
  const filtered = category === 'all' 
    ? projectData.zones 
    : projectData.zones.filter(z => z.category === category);

  filtered.forEach(zone => {
    const card = document.createElement('div');
    card.className = 'zone-grid-card';

    const name = currentLang === 'vi' ? zone.name_vi : zone.name_en;
    const desc = currentLang === 'vi' ? zone.desc_vi : zone.desc_en;
    const unit = currentLang === 'vi' ? 'Hecta' : 'Hectares';
    const btnText = currentLang === 'vi' ? 'Xem vị trí quy hoạch' : 'View on Masterplan';

    card.innerHTML = `
      <div class="zone-grid-img">
        <img src="${zone.image}" alt="${name}">
        <span class="zone-code-tag">${zone.code}</span>
        <span class="zone-area-tag">${zone.area} ${unit}</span>
      </div>
      <div class="zone-grid-body">
        <h4 class="zone-grid-title">${name}</h4>
        <p class="zone-grid-desc">${desc}</p>
        <button class="btn btn-outline-gold btn-sm" onclick="navigateToZone('${zone.id}')">
          <i class="fa-solid fa-location-crosshairs"></i>
          <span>${btnText}</span>
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function filterZones(category) {
  currentZoneFilter = category;
  document.querySelectorAll('#view-project .filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderZonesGallery(category);
}

function navigateToZone(zoneId) {
  window.location.hash = '#home';
  setTimeout(() => {
    const elem = document.getElementById('masterplanAnchor');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    openZoneDrawer(zoneId);
  }, 250);
}

// Render Legal Documents Table
function renderLegalTable() {
  const tbody = document.getElementById('legalTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  projectData.legalDocuments.forEach(doc => {
    const tr = document.createElement('tr');

    const name = currentLang === 'vi' ? doc.name_vi : doc.name_en;
    const auth = currentLang === 'vi' ? doc.authority_vi : doc.authority_en;
    const notes = currentLang === 'vi' ? doc.notes_vi : doc.notes_en;

    const statusBadgeClass = doc.status === 'approved' ? 'approved' : 'reviewing';
    const statusText = doc.status === 'approved' 
      ? (currentLang === 'vi' ? 'Đã phê duyệt' : 'Approved') 
      : (currentLang === 'vi' ? 'Đang thẩm định' : 'Under Appraisal');

    tr.innerHTML = `
      <td><strong>${doc.code}</strong></td>
      <td>
        <div style="font-weight: 700; color: #fff;">${name}</div>
        <div style="font-size: 0.78rem; color: var(--gold-light);">${doc.doc_number}</div>
      </td>
      <td>${auth}</td>
      <td>${doc.date}</td>
      <td>
        <span class="status-badge ${statusBadgeClass}">
          <i class="fa-solid ${doc.status === 'approved' ? 'fa-check-circle' : 'fa-clock'}"></i>
          ${statusText}
        </span>
      </td>
      <td style="font-size: 0.85rem; color: var(--text-secondary);">${notes}</td>
    `;

    tbody.appendChild(tr);
  });
}

// Render Bidding Packages on Procurement Page
function renderBiddingPackages() {
  const grid = document.getElementById('biddingGrid');
  if (!grid) return;

  grid.innerHTML = '';
  projectData.biddingPackages.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'bid-card';

    const title = currentLang === 'vi' ? pkg.title_vi : pkg.title_en;
    const scale = currentLang === 'vi' ? pkg.scale_vi : pkg.scale_en;
    const method = currentLang === 'vi' ? pkg.method_vi : pkg.method_en;
    const status = currentLang === 'vi' ? pkg.status_vi : pkg.status_en;

    card.innerHTML = `
      <div class="bid-top">
        <span class="bid-code">${pkg.code}</span>
        <span class="status-badge reviewing">${status}</span>
      </div>
      <h4 class="bid-title">${title}</h4>
      <p style="font-size: 0.88rem; color: var(--text-secondary);">${scale}</p>

      <div class="bid-meta">
        <div class="bid-meta-item">
          <span>Giá trị dự kiến:</span>
          <strong style="color: var(--gold-light);">${pkg.est_value}</strong>
        </div>
        <div class="bid-meta-item">
          <span>Hạn nộp hồ sơ:</span>
          <strong>${pkg.deadline}</strong>
        </div>
      </div>

      <div style="margin-top: auto; display: flex; gap: 12px;">
        <button class="btn btn-gold btn-sm" onclick="openEoiModal('${pkg.code}')">
          <i class="fa-solid fa-file-signature"></i>
          <span>Nộp EOI</span>
        </button>
        <button class="btn btn-glass btn-sm" onclick="showToast('Đang tạo liên kết tải Hồ sơ Mời thầu...')">
          <i class="fa-solid fa-download"></i>
          <span>Tải HSMT</span>
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Render News on News Page
function renderNews(category) {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  const filtered = category === 'all'
    ? projectData.news
    : projectData.news.filter(n => n.category === category);

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'news-card';

    const title = currentLang === 'vi' ? item.title_vi : item.title_en;
    const summary = currentLang === 'vi' ? item.summary_vi : item.summary_en;
    const catName = currentLang === 'vi' ? item.category_name_vi : item.category_name_en;

    card.innerHTML = `
      <div class="news-img">
        <img src="${item.image}" alt="${title}">
      </div>
      <div class="news-body">
        <div class="news-meta">
          <span class="news-category-tag">${catName}</span>
          <span>•</span>
          <span>${item.date}</span>
          <span>•</span>
          <span><i class="fa-solid fa-eye"></i> ${item.views}</span>
        </div>
        <h4 class="news-title">${title}</h4>
        <p class="news-desc">${summary}</p>
        <div style="margin-top: auto; color: var(--gold-light); font-weight: 700; font-size: 0.9rem;">
          Đọc toàn văn bài viết <i class="fa-solid fa-arrow-right"></i>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      openNewsModal(item.id);
    });

    grid.appendChild(card);
  });
}

function filterNews(category) {
  currentNewsFilter = category;
  document.querySelectorAll('#view-news .filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderNews(category);
}

// ============================================================================
// 6. GLOBAL MODALS & POPUPS
// ============================================================================
function openGlobalModal(htmlContent) {
  const overlay = document.getElementById('globalModalOverlay');
  const container = document.getElementById('modalInnerContainer');
  if (!overlay || !container) return;

  container.innerHTML = htmlContent;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeGlobalModal() {
  const overlay = document.getElementById('globalModalOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'globalModalOverlay') {
    closeGlobalModal();
  }
}

// Leader Bio Modal
function openLeaderModal(leaderId) {
  const leader = projectData.leaders.find(l => l.id === leaderId);
  if (!leader) return;

  const title = currentLang === 'vi' ? leader.title_vi : leader.title_en;
  const role = currentLang === 'vi' ? leader.role_vi : leader.role_en;
  const bio = currentLang === 'vi' ? leader.bio_vi : leader.bio_en;

  const content = `
    <div style="display: flex; gap: 28px; flex-wrap: wrap; align-items: flex-start;">
      <div style="width: 140px; height: 140px; border-radius: 20px; overflow: hidden; border: 2px solid var(--gold-primary); flex-shrink: 0;">
        <img src="${leader.avatar}" alt="${leader.name}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div style="flex: 1; min-width: 240px;">
        <span class="section-badge" style="margin-bottom: 8px;">BAN LÃNH ĐẠO DEMO GROUP</span>
        <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: #fff; margin-bottom: 4px;">${leader.name}</h3>
        <div style="color: var(--gold-light); font-weight: 700; margin-bottom: 6px;">${title}</div>
        <div style="color: var(--emerald-light); font-size: 0.85rem; font-weight: 600; margin-bottom: 16px;">${role}</div>
      </div>
    </div>
    <hr style="border: 0; border-top: 1px solid var(--border-light); margin: 24px 0;">
    <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 12px;">Quá trình Công tác & Năng lực Lãnh đạo:</h4>
    <p style="color: var(--text-secondary); line-height: 1.8; font-size: 0.95rem;">
      ${bio}
    </p>
    <div style="margin-top: 32px; display: flex; justify-content: flex-end;">
      <button class="btn btn-gold btn-sm" onclick="closeGlobalModal()">Đóng</button>
    </div>
  `;

  openGlobalModal(content);
}

// News Detail Modal
function openNewsModal(newsId) {
  const item = projectData.news.find(n => n.id === newsId);
  if (!item) return;

  const title = currentLang === 'vi' ? item.title_vi : item.title_en;
  const summary = currentLang === 'vi' ? item.summary_vi : item.summary_en;
  const catName = currentLang === 'vi' ? item.category_name_vi : item.category_name_en;

  const content = `
    <div style="height: 240px; border-radius: 14px; overflow: hidden; margin-bottom: 24px; border: 1px solid var(--border-light);">
      <img src="${item.image}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
    <div style="display: flex; gap: 12px; font-size: 0.85rem; color: var(--gold-light); font-weight: 700; margin-bottom: 12px;">
      <span>${catName}</span> • <span>${item.date}</span>
    </div>
    <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: #fff; margin-bottom: 16px; line-height: 1.35;">${title}</h3>
    <p style="font-size: 1rem; color: #e2e8f0; font-weight: 500; line-height: 1.7; margin-bottom: 16px;">${summary}</p>
    <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.75; margin-bottom: 24px;">
      Tại buổi làm việc, Ban Lãnh đạo Tập đoàn DEMO khẳng định tiến độ giải phóng mặt bằng và các mốc tiến độ thi công hạ tầng kết nối đang bám sát quy hoạch đã được các bộ ngành thẩm định. Tập đoàn cam kết phối hợp chặt chẽ cùng các tổng thầu và đối tác quốc tế nhằm đưa dự án về đích đúng lộ trình cam kết.
    </p>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-solid fa-eye"></i> ${item.views} lượt xem</span>
      <button class="btn btn-gold btn-sm" onclick="closeGlobalModal()">Đóng bài viết</button>
    </div>
  `;

  openGlobalModal(content);
}

// Company Profile Modal
function openProfileModal() {
  const content = `
    <div style="text-align: center; padding: 12px;">
      <i class="fa-solid fa-file-pdf" style="font-size: 3.5rem; color: #ef4444; margin-bottom: 16px;"></i>
      <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: #fff; margin-bottom: 8px;">
        Bản Tự Giới Thiệu Doanh Nghiệp (Company Profile)
      </h3>
      <p style="font-size: 0.92rem; color: var(--text-secondary); max-width: 500px; margin: 0 auto 24px auto;">
        Tài liệu PDF 48 trang chính thức của <strong>CÔNG TY CỔ PHẦN DEMO (DEMO GROUP)</strong> bao gồm Báo cáo kiểm toán tài chính, Danh mục tài sản và Quy hoạch 4.000 ha.
      </p>

      <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-glass); border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted); font-size: 0.85rem;">Tên tệp:</span>
          <strong style="color: #fff; font-size: 0.85rem;">DEMO_Group_Company_Profile_2026.pdf</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted); font-size: 0.85rem;">Dung lượng:</span>
          <strong style="color: var(--gold-light); font-size: 0.85rem;">24.5 MB</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted); font-size: 0.85rem;">Ngôn ngữ:</span>
          <strong style="color: var(--emerald-light); font-size: 0.85rem;">Song ngữ Anh - Việt (Bilingual)</strong>
        </div>
      </div>

      <div style="display: flex; gap: 14px; justify-content: center;">
        <button class="btn btn-gold" onclick="simulateDownload('Company_Profile.pdf')">
          <i class="fa-solid fa-download"></i> Tải Xuống PDF Ngay
        </button>
        <button class="btn btn-glass" onclick="closeGlobalModal()">Hủy</button>
      </div>
    </div>
  `;
  openGlobalModal(content);
}

// Virtual Data Room (VDR) Modal
function openVdrModal() {
  const content = `
    <div>
      <span class="section-badge" style="margin-bottom: 8px;"><i class="fa-solid fa-lock"></i> BẢO MẬT CẤP ĐỘ CAO</span>
      <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: #fff; margin-bottom: 8px;">
        Yêu Cầu Truy Cập Phòng Dữ Liệu Ảo (VDR)
      </h3>
      <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
        Phòng dữ liệu ảo chứa toàn văn bản vẽ quy hoạch 1/2000, hồ sơ thẩm định tài chính độc lập và báo cáo ĐTM chi tiết. Vui lòng cung cấp thông tin để cấp tài khoản bảo mật.
      </p>

      <form onsubmit="handleVdrRequest(event)">
        <div class="form-group">
          <label class="form-label">Tổ chức / Quỹ đầu tư</label>
          <input type="text" class="form-control" placeholder="Tên đơn vị" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email công vụ</label>
          <input type="email" class="form-control" placeholder="corporate@fund.com" required>
        </div>
        <div class="form-group">
          <label class="form-label">Mục đích tiếp cận hồ sơ</label>
          <textarea class="form-control" style="min-height: 80px;" placeholder="Thẩm định đầu tư PPP / FDI..." required></textarea>
        </div>
        <button type="submit" class="btn btn-gold" style="width: 100%;">
          <i class="fa-solid fa-key"></i> Gửi Yêu Cầu Cấp Khóa VDR
        </button>
      </form>
    </div>
  `;
  openGlobalModal(content);
}

// Expression of Interest (EOI) Modal
function openEoiModal(packageCode = '') {
  const content = `
    <div>
      <span class="section-badge emerald" style="margin-bottom: 8px;"><i class="fa-solid fa-file-signature"></i> ĐẤU THẦU QUỐC TẾ</span>
      <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: #fff; margin-bottom: 8px;">
        Nộp Hồ Sơ Năng Lực (Expression of Interest - EOI)
      </h3>
      <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
        Đăng ký tham gia danh sách nhà thầu đủ điều kiện cho gói thầu <strong>${packageCode || 'Chiến lược'}</strong>.
      </p>

      <form onsubmit="handleEoiSubmit(event)">
        <div class="form-group">
          <label class="form-label">Tên nhà thầu / Liên danh</label>
          <input type="text" class="form-control" placeholder="Tên doanh nghiệp" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Quốc gia</label>
            <input type="text" class="form-control" placeholder="Việt Nam / Hàn Quốc / Nhật Bản..." required>
          </div>
          <div class="form-group">
            <label class="form-label">Email liên hệ</label>
            <input type="email" class="form-control" placeholder="procurement@company.com" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Đính kèm Hồ sơ năng lực (Capacity Profile - PDF)</label>
          <input type="file" class="form-control" accept=".pdf,.doc,.docx" style="padding: 10px;">
        </div>
        <button type="submit" class="btn btn-gold" style="width: 100%;">
          <i class="fa-solid fa-upload"></i> Nộp Hồ Sơ EOI Ngay
        </button>
      </form>
    </div>
  `;
  openGlobalModal(content);
}

function handleVdrRequest(e) {
  e.preventDefault();
  closeGlobalModal();
  showToast('Yêu cầu VDR đã được ghi nhận. Khóa truy cập sẽ gửi qua email trong vòng 2 giờ.');
}

function handleEoiSubmit(e) {
  e.preventDefault();
  closeGlobalModal();
  showToast('Hồ sơ năng lực EOI đã được tiếp nhận thành công vào Cổng Đấu thầu DEMO Group!');
}

function downloadLoiTemplate() {
  simulateDownload('DEMO_Group_LOI_Template_Bilingual.docx');
}

function simulateDownload(filename) {
  showToast(`Đang tải xuống tệp ${filename}...`);
  setTimeout(() => {
    closeGlobalModal();
  }, 1000);
}

// ============================================================================
// 7. FORM SUBMISSION & TOAST NOTIFICATION
// ============================================================================
function handleFormSubmit(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('btnSubmitForm');
  const org = document.getElementById('organization').value;
  const name = document.getElementById('fullName').value;
  const email = document.getElementById('contactEmail').value;

  // Show loading on button
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>${translations[currentLang].form_submitting}</span>`;
  }

  // Simulate network dispatch to corporate inbox tgcg.vn.com@gmail.com
  setTimeout(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>${translations[currentLang].form_submit}</span>`;
    }

    // Success Modal popup
    const successContent = `
      <div style="text-align: center; padding: 16px;">
        <i class="fa-solid fa-circle-check" style="font-size: 3.5rem; color: var(--emerald-light); margin-bottom: 16px;"></i>
        <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: #fff; margin-bottom: 8px;">
          ${translations[currentLang].form_success_title}
        </h3>
        <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7; max-width: 520px; margin: 0 auto 20px auto;">
          ${translations[currentLang].form_success_desc}
        </p>
        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-glass); border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 24px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Thông tin ghi nhận:</div>
          <div style="font-size: 0.92rem; color: #fff;"><strong>${name}</strong> (${org})</div>
          <div style="font-size: 0.85rem; color: var(--gold-light);">Email: ${email}</div>
          <div style="font-size: 0.8rem; color: var(--emerald-light); margin-top: 6px;">
            <i class="fa-solid fa-shield-check"></i> Đã đồng bộ với hòm thư: tgcg.vn.com@gmail.com
          </div>
        </div>
        <button class="btn btn-gold" onclick="closeGlobalModal()">Hoàn tất</button>
      </div>
    `;

    openGlobalModal(successContent);
    showToast('Thông tin đầu tư đã gửi thành công!');

    // Reset form
    document.getElementById('investInquiryForm').reset();
  }, 1200);
}

function showToast(message) {
  const toast = document.getElementById('globalToast');
  const msgElem = document.getElementById('toastMessage');
  if (!toast || !msgElem) return;

  msgElem.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
