import { db, initDB } from './db.js';

// App State
let currentTab = 'home';
let isAuthenticated = false;
let activeAdminSubTab = 'travel'; // travel, gallery, articles, art, password

// Data Cache
let travelLogs = [];
let galleries = [];
let articles = [];
let artPieces = [];

// Form Temp States
let tempTravelImage = '';
let tempGalleryImages = [];
let tempArticleImage = '';
let tempArtImage = '';

// Lightbox State
let activeLightboxGallery = null;
let activeLightboxImageIndex = 0;

function init() {
  initDB();
  refreshData();
  setupTheme();
  renderHeader();
  navigate(currentTab);
  
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function refreshData() {
  travelLogs = db.getTravelLogs();
  galleries = db.getGalleries();
  articles = db.getArticles();
  artPieces = db.getArtPieces();
}

function setupTheme() {
  const theme = localStorage.getItem('journal_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('journal_theme', newTheme);
  renderHeader();
}

function navigate(tabId) {
  currentTab = tabId;
  window.scrollTo(0, 0);
  
  // Set overflow hidden for home to prevent scrolling
  document.body.style.overflow = tabId === 'home' ? 'hidden' : 'unset';
  
  // Hide footer on home screen
  const footer = document.getElementById('app-footer');
  if (footer) {
    footer.style.display = tabId === 'home' ? 'none' : 'block';
  }
  
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const contentContainer = document.getElementById('app-content');
  
  switch(tabId) {
    case 'home':
      renderHome(contentContainer);
      break;
    case 'travel':
      renderTravelDiary(contentContainer);
      break;
    case 'gallery':
      renderPhotoGallery(contentContainer);
      break;
    case 'articles':
      renderArticles(contentContainer);
      break;
    case 'art':
      renderArtCollection(contentContainer);
      break;
    case 'admin':
      renderAdminDashboard(contentContainer);
      break;
    default:
      renderHome(contentContainer);
  }

  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  if (mobileOverlay) mobileOverlay.style.display = 'none';
}

function showToast(message, type = 'success') {
  const toastRoot = document.getElementById('toast-root');
  if (!toastRoot) return;

  const toast = document.createElement('div');
  toast.className = 'toast animate-slide';
  
  const accentColor = type === 'success' ? 'var(--accent-olive)' : '#dc3545';
  toast.style.borderLeft = `4px solid ${accentColor}`;
  
  const icon = type === 'success' ? '✓' : '⚠';
  
  toast.innerHTML = `
    <span style="font-weight: bold; color: ${accentColor}; font-size: 1.2rem;">${icon}</span>
    <span>${message}</span>
  `;

  toastRoot.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function renderHeader() {
  const header = document.getElementById('app-header');
  if (!header) return;

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const themeIcon = currentTheme === 'light' 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;

  header.innerHTML = `
    <div class="nav-container">
      <div class="nav-logo" id="logo-btn" style="cursor: pointer;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-terracotta)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-fade"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36Z"/></svg>
      </div>

      <div class="nav-links-desktop" style="display: flex; alignItems: center; gap: 2rem;">
        <button class="nav-link ${currentTab === 'home' ? 'active' : ''}" data-tab="home">หน้าแรก</button>
        <button class="nav-link ${currentTab === 'travel' ? 'active' : ''}" data-tab="travel">บันทึกการเดินทาง</button>
        <button class="nav-link ${currentTab === 'gallery' ? 'active' : ''}" data-tab="gallery">คลังรูปภาพ</button>
        <button class="nav-link ${currentTab === 'articles' ? 'active' : ''}" data-tab="articles">บทความ</button>
        <button class="nav-link ${currentTab === 'art' ? 'active' : ''}" data-tab="art">งานศิลปะ</button>
        <button class="nav-link ${currentTab === 'admin' ? 'active' : ''}" data-tab="admin">ระบบหลังบ้าน</button>
      </div>

      <div class="nav-actions">
        <button class="btn-icon" id="theme-btn" title="เปลี่ยนโหมดสี">${themeIcon}</button>
        <button class="btn-icon mobile-menu-toggle" id="mobile-menu-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <div id="mobile-nav-overlay" style="display: none; position: fixed; top: var(--header-height); left: 0; right: 0; background: var(--glass-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border-color); padding: 2rem; flex-direction: column; gap: 1.5rem; z-index: 999;">
      <button class="nav-link ${currentTab === 'home' ? 'active' : ''}" data-tab="home" style="text-align: left; font-size: 1.1rem; width: 100%; border: none; background: none; padding: 0.5rem 0;">หน้าแรก</button>
      <button class="nav-link ${currentTab === 'travel' ? 'active' : ''}" data-tab="travel" style="text-align: left; font-size: 1.1rem; width: 100%; border: none; background: none; padding: 0.5rem 0;">บันทึกการเดินทาง</button>
      <button class="nav-link ${currentTab === 'gallery' ? 'active' : ''}" data-tab="gallery" style="text-align: left; font-size: 1.1rem; width: 100%; border: none; background: none; padding: 0.5rem 0;">คลังรูปภาพ</button>
      <button class="nav-link ${currentTab === 'articles' ? 'active' : ''}" data-tab="articles" style="text-align: left; font-size: 1.1rem; width: 100%; border: none; background: none; padding: 0.5rem 0;">บทความ</button>
      <button class="nav-link ${currentTab === 'art' ? 'active' : ''}" data-tab="art" style="text-align: left; font-size: 1.1rem; width: 100%; border: none; background: none; padding: 0.5rem 0;">งานศิลปะ</button>
      <button class="nav-link ${currentTab === 'admin' ? 'active' : ''}" data-tab="admin" style="text-align: left; font-size: 1.1rem; width: 100%; border: none; background: none; padding: 0.5rem 0;">ระบบหลังบ้าน</button>
    </div>
  `;

  document.getElementById('logo-btn').addEventListener('click', () => navigate('home'));
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);
  
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  menuBtn.addEventListener('click', () => {
    const isVisible = mobileOverlay.style.display === 'flex';
    mobileOverlay.style.display = isVisible ? 'none' : 'flex';
  });

  const allNavButtons = header.querySelectorAll('.nav-link');
  allNavButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      navigate(e.target.getAttribute('data-tab'));
    });
  });
}

function renderHome(container) {
  container.innerHTML = `
    <section class="hero animate-fade">
      <div class="hero-bg" style="background-image: url('/public/images/hero.png');"></div>
      <div class="hero-overlay"></div>
      <div class="hero-water-reflection"></div>
      
      <div class="hero-content">
        <h1 class="hero-title animate-slide">บันทึกการเดินทาง<br />& คลังศิลปะส่วนตัว</h1>
        <p class="hero-subtitle animate-slide" style="animation-delay: 0.2s;">
          เก็บบันทึกการเดินทาง คลังรูปภาพเก็บความทรงจำ บทความบอกเล่าเรื่องราว และงานศิลปะสุดโปรดของผมไว้ในพื้นที่ส่วนตัวแห่งนี้
        </p>
        <div class="hero-buttons animate-slide" style="animation-delay: 0.4s; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" id="hero-btn-travel">อ่านบันทึกการเดินทาง →</button>
          <button class="btn btn-secondary" id="hero-btn-art" style="background-color: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); border-color: rgba(255, 255, 255, 0.2); color: white;">ชมคลังศิลปะ</button>
        </div>
      </div>
    </section>
  `;

  document.getElementById('hero-btn-travel').addEventListener('click', () => navigate('travel'));
  document.getElementById('hero-btn-art').addEventListener('click', () => navigate('art'));
}

function renderTravelDiary(container) {
  container.innerHTML = `
    <section class="section animate-fade" style="padding-top: calc(var(--header-height) + 3rem);">
      <div class="section-container">
        <div class="section-header" style="flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
          <div>
            <h1 class="section-title">บันทึกการเดินทาง</h1>
            <p class="section-subtitle">รวบรวมเรื่องราว ความทรงจำ และภาพทิวทัศน์ที่พบเจอระหว่างเดินทาง</p>
          </div>
          <div style="position: relative; max-width: 300px; width: 100%;">
            <input type="text" id="travel-search" class="form-input" placeholder="ค้นหาบันทึก..." style="padding-left: 2.5rem;" />
            <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);">🔍</span>
          </div>
        </div>

        <div class="grid-travel" id="travel-grid-content"></div>
      </div>
    </section>
  `;

  const searchInput = document.getElementById('travel-search');
  const gridContent = document.getElementById('travel-grid-content');

  const renderList = (query = '') => {
    const filtered = travelLogs.filter(log => 
      log.title.toLowerCase().includes(query.toLowerCase()) || 
      log.story.toLowerCase().includes(query.toLowerCase())
    );

    let html = '';
    filtered.forEach(log => {
      html += `
        <div class="travel-card">
          <div class="travel-img-container">
            <img src="${log.image}" alt="${log.title}" class="travel-img" />
            <span class="travel-date-badge">${log.date}</span>
          </div>
          <div class="travel-info">
            <h3 class="travel-title">${log.title}</h3>
            <p class="travel-story">${log.story}</p>
            <span class="travel-readmore" data-log-id="${log.id}">อ่านต่อ →</span>
          </div>
        </div>
      `;
    });

    gridContent.innerHTML = html || `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-muted);">
        <p style="font-size: 3rem; margin-bottom: 1rem;">🧭</p>
        <p>ไม่พบบันทึกการเดินทางที่ต้องการค้นหา</p>
      </div>
    `;

    gridContent.querySelectorAll('.travel-readmore').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const logId = e.currentTarget.getAttribute('data-log-id');
        const log = travelLogs.find(l => l.id === logId);
        if (log) openDetailsModal(log, 'travel');
      });
    });
  };

  searchInput.addEventListener('input', (e) => renderList(e.target.value));
  renderList();
}

function renderPhotoGallery(container) {
  let albumHTML = '';
  galleries.forEach(gal => {
    let imagesGrid = '';
    gal.images.slice(0, 4).forEach(img => {
      imagesGrid += `<img src="${img}" alt="" class="gallery-preview-img" />`;
    });
    for (let i = gal.images.length; i < 4; i++) {
      imagesGrid += `<div style="background: var(--bg-tertiary);"></div>`;
    }

    albumHTML += `
      <div class="gallery-album" data-gal-id="${gal.id}">
        <div class="gallery-grid-preview">
          ${imagesGrid}
        </div>
        <div class="gallery-overlay">
          <h3 class="gallery-title">${gal.tripName}</h3>
          <span class="gallery-count">${gal.images.length} รูปภาพ</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <section class="section animate-fade" style="padding-top: calc(var(--header-height) + 3rem);">
      <div class="section-container">
        <div class="section-header">
          <div>
            <h1 class="section-title">คลังรูปภาพ</h1>
            <p class="section-subtitle">ภาพถ่ายความทรงจำ แยกตามทริปการท่องเที่ยว</p>
          </div>
        </div>

        <div class="grid-gallery">
          ${albumHTML || `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">ยังไม่มีอัลบั้มคลังรูปภาพ</p>`}
        </div>
      </div>
    </section>
  `;

  container.querySelectorAll('.gallery-album').forEach(card => {
    card.addEventListener('click', (e) => {
      const galId = e.currentTarget.getAttribute('data-gal-id');
      const gal = galleries.find(g => g.id === galId);
      if (gal) openLightbox(gal);
    });
  });
}

function renderArticles(container) {
  let articlesHTML = '';
  articles.forEach(art => {
    articlesHTML += `
      <div class="article-card" style="cursor: pointer;" data-art-id="${art.id}">
        <div class="article-img-box">
          <img src="${art.image}" alt="${art.title}" class="article-img" />
        </div>
        <span class="article-meta">บทความ</span>
        <h3 class="article-title">${art.title}</h3>
        <p class="article-summary">${art.content}</p>
        <div style="color: var(--accent-terracotta); font-weight: 600; font-size: 0.9rem; margin-top: auto; padding-top: 1rem;">อ่านต่อบทความเต็ม →</div>
      </div>
    `;
  });

  container.innerHTML = `
    <section class="section animate-fade" style="padding-top: calc(var(--header-height) + 3rem);">
      <div class="section-container">
        <div class="section-header">
          <div>
            <h1 class="section-title font-serif">บทความทั้งหมด</h1>
            <p class="section-subtitle">งานเขียน บทกวี และการตกผลึกเรื่องราวชีวิต</p>
          </div>
        </div>

        <div class="grid-articles">
          ${articlesHTML || `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">ยังไม่มีบทความบทกวีเขียนไว้</p>`}
        </div>
      </div>
    </section>
  `;

  container.querySelectorAll('.article-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const artId = e.currentTarget.getAttribute('data-art-id');
      const art = articles.find(a => a.id === artId);
      if (art) openDetailsModal(art, 'article');
    });
  });
}

function renderArtCollection(container) {
  let artHTML = '';
  artPieces.forEach(piece => {
    artHTML += `
      <div class="art-card">
        <div class="art-img-box">
          <img src="${piece.image}" alt="${piece.title}" class="art-img" />
        </div>
        <h3 class="art-title">${piece.title}</h3>
        <span class="art-artist" style="display: flex; align-items: center; gap: 4px;">👤 ศิลปิน: ${piece.artist}</span>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
          ${piece.notes || ''}
        </p>
        <div class="art-meta-row">
          <span>📅 วันที่ไปชม:</span>
          <span>${piece.dateSeen}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <section class="section animate-fade" style="padding-top: calc(var(--header-height) + 3rem);">
      <div class="section-container">
        <div class="section-header">
          <div>
            <h1 class="section-title">คลังงานศิลปะ</h1>
            <p class="section-subtitle">ชิ้นงานศิลปะร่วมสมัยและคลาสสิกที่ได้เข้าชมในแกลเลอรีต่างๆ</p>
          </div>
        </div>

        <div class="grid-art">
          ${artHTML || `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">ยังไม่มีรายการงานศิลปะในคลัง</p>`}
        </div>
      </div>
    </section>
  `;
}

function renderAdminDashboard(container) {
  if (!isAuthenticated) {
    container.innerHTML = `
      <section class="section animate-fade" style="padding-top: calc(var(--header-height) + 4rem);">
        <div class="admin-login-card">
          <div style="display: inline-flex; padding: 1rem; background: var(--bg-secondary); border-radius: 50%; margin-bottom: 1.5rem; color: var(--accent-terracotta);">🔒</div>
          <h2 style="font-family: var(--font-serif); fontSize: 1.8rem; margin-bottom: 0.5rem;">ระบบหลังบ้าน (Preview)</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 2rem;">กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบจัดการข้อมูล</p>
          
          <form id="admin-login-form">
            <div class="form-group">
              <label class="form-label" for="admin-pass">รหัสผ่าน (Default: 1234)</label>
              <input type="password" id="admin-pass" class="form-input" placeholder="ป้อนรหัสผ่านหลังบ้าน..." required />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">เข้าสู่ระบบ</button>
          </form>
        </div>
      </section>
    `;

    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('admin-pass').value;
      if (db.verifyPassword(pass)) {
        isAuthenticated = true;
        showToast('เข้าสู่ระบบสำเร็จ', 'success');
        renderAdminDashboard(container);
      } else {
        showToast('รหัสผ่านไม่ถูกต้อง', 'error');
      }
    });
    return;
  }

  container.innerHTML = `
    <section class="section animate-fade" style="padding-top: calc(var(--header-height) + 2rem);">
      <div class="section-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="section-title">ระบบจัดการหลังบ้าน</h1>
            <p class="section-subtitle">แก้ไขหรือเพิ่มข้อมูลจำลองของคุณ (บันทึกใน localStorage)</p>
          </div>
          <button class="btn btn-secondary text-danger" id="logout-btn">🚪 ออกจากระบบ</button>
        </div>

        <div class="admin-layout">
          <aside class="admin-sidebar">
            <button class="admin-sidebar-btn ${activeAdminSubTab === 'travel' ? 'active' : ''}" data-sub="travel">บันทึกการเดินทาง</button>
            <button class="admin-sidebar-btn ${activeAdminSubTab === 'gallery' ? 'active' : ''}" data-sub="gallery">คลังรูปภาพ</button>
            <button class="admin-sidebar-btn ${activeAdminSubTab === 'articles' ? 'active' : ''}" data-sub="articles">บทความ</button>
            <button class="admin-sidebar-btn ${activeAdminSubTab === 'art' ? 'active' : ''}" data-sub="art">งานศิลปะ</button>
            <button class="admin-sidebar-btn ${activeAdminSubTab === 'password' ? 'active' : ''}" data-sub="password">🔑 เปลี่ยนรหัสผ่าน</button>
          </aside>

          <main class="admin-content" id="admin-subcontent"></main>
        </div>
      </div>
    </section>
  `;

  document.getElementById('logout-btn').addEventListener('click', () => {
    isAuthenticated = false;
    showToast('ออกจากระบบแล้ว', 'success');
    renderAdminDashboard(container);
  });

  const sidebarButtons = container.querySelectorAll('.admin-sidebar-btn');
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sub = e.target.getAttribute('data-sub');
      activeAdminSubTab = sub;
      
      sidebarButtons.forEach(b => {
        if (b.getAttribute('data-sub') === sub) b.classList.add('active');
        else b.classList.remove('active');
      });

      renderAdminSubContent();
    });
  });

  renderAdminSubContent();
}

function renderAdminSubContent() {
  const container = document.getElementById('admin-subcontent');
  if (!container) return;

  if (activeAdminSubTab === 'travel') {
    let rowsHTML = '';
    travelLogs.forEach(log => {
      rowsHTML += `
        <tr>
          <td><img src="${log.image}" alt="" class="admin-table-img" /></td>
          <td style="font-weight: 500;">${log.title}</td>
          <td>${log.date}</td>
          <td>
            <button class="btn btn-icon text-danger delete-travel-log-btn" data-id="${log.id}">🗑️</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <h2 class="admin-section-title">จัดการบันทึกการเดินทาง</h2>
      <form id="add-travel-form" style="margin-bottom: 3rem; padding-bottom: 2.5rem; border-bottom: 1px solid var(--border-color);">
        <h3 style="font-size: 1.2rem; margin-bottom: 1.5rem;">✍️ เขียนบันทึกบทใหม่</h3>
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; flex-wrap: wrap;">
          <div class="form-group">
            <label class="form-label">หัวข้อเรื่องราวการเดินทาง</label>
            <input type="text" id="travel-title-in" class="form-input" placeholder="ป้อนหัวข้อทริป..." required />
          </div>
          <div class="form-group">
            <label class="form-label">วันที่ท่องเที่ยว</label>
            <input type="date" id="travel-date-in" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">เรื่องราวเล่าสู่กันฟัง</label>
          <textarea id="travel-story-in" class="form-input" rows="6" placeholder="เขียนเรื่องราว..." required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">รูปภาพหน้าปกบันทึก</label>
          <div class="upload-zone" style="position: relative;">
            <input type="file" id="travel-img-in" accept="image/*" style="position: absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;" />
            <span>📷 คลิกเพื่ออัปโหลดไฟล์รูปภาพ</span>
          </div>
          <div id="travel-img-preview-box" class="upload-preview-grid" style="display: none;">
            <div class="upload-preview-box">
              <img id="travel-img-preview" src="" class="upload-preview-img" />
              <button type="button" id="remove-travel-img-btn" class="upload-preview-remove">x</button>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">บันทึกและโพสต์</button>
      </form>

      <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">บันทึกทั้งหมด (${travelLogs.length})</h3>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>หัวข้อบันทึก</th>
              <th>วันที่</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML || `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">ยังไม่มีข้อมูลบันทึก</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    const imgIn = document.getElementById('travel-img-in');
    const previewBox = document.getElementById('travel-img-preview-box');
    const previewImg = document.getElementById('travel-img-preview');
    const removeImgBtn = document.getElementById('remove-travel-img-btn');

    imgIn.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        tempTravelImage = reader.result;
        previewImg.src = reader.result;
        previewBox.style.display = 'grid';
      };
      reader.readAsDataURL(file);
    });

    removeImgBtn.addEventListener('click', () => {
      tempTravelImage = '';
      previewImg.src = '';
      previewBox.style.display = 'none';
      imgIn.value = '';
    });

    document.getElementById('add-travel-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('travel-title-in').value;
      const date = document.getElementById('travel-date-in').value;
      const story = document.getElementById('travel-story-in').value;

      if (!tempTravelImage) {
        showToast('กรุณาอัปโหลดรูปภาพด้วยค่ะ', 'error');
        return;
      }

      db.addTravelLog({ title, date, story, image: tempTravelImage });
      tempTravelImage = '';
      refreshData();
      showToast('เพิ่มบันทึกสำเร็จ');
      renderAdminSubContent();
    });

    container.querySelectorAll('.delete-travel-log-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('คุณแน่ใจว่าต้องการลบบันทึกนี้?')) {
          db.deleteTravelLog(id);
          refreshData();
          showToast('ลบเรียบร้อยแล้ว', 'success');
          renderAdminSubContent();
        }
      });
    });

  } else if (activeAdminSubTab === 'gallery') {
    let rowsHTML = '';
    galleries.forEach(gal => {
      rowsHTML += `
        <tr>
          <td><img src="${gal.images[0] || ''}" alt="" class="admin-table-img" /></td>
          <td style="font-weight: 500;">${gal.tripName}</td>
          <td>${gal.images.length} รูปภาพ</td>
          <td>
            <button class="btn btn-icon text-danger delete-gallery-btn" data-id="${gal.id}">🗑️</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <h2 class="admin-section-title">จัดการคลังรูปภาพ</h2>
      <form id="add-gallery-form" style="margin-bottom: 3rem; padding-bottom: 2.5rem; border-bottom: 1px solid var(--border-color);">
        <h3 style="font-size: 1.2rem; margin-bottom: 1.5rem;">📸 สร้างอัลบั้มความทรงจำใหม่</h3>
        <div class="form-group">
          <label class="form-label">ชื่อทริปการท่องเที่ยว</label>
          <input type="text" id="gallery-title-in" class="form-input" placeholder="ป้อนชื่อทริป..." required />
        </div>

        <div class="form-group">
          <label class="form-label">รูปภาพคอลเลกชัน (หลายรูป)</label>
          <div class="upload-zone" style="position: relative;">
            <input type="file" id="gallery-imgs-in" accept="image/*" multiple style="position: absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;" />
            <span>📷 คลิกอัปโหลดไฟล์รูปภาพ</span>
          </div>
          <div id="gallery-preview-container" class="upload-preview-grid" style="margin-top: 1rem;"></div>
        </div>

        <button type="submit" class="btn btn-primary">สร้างอัลบั้ม</button>
      </form>

      <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">อัลบั้มทั้งหมด (${galleries.length})</h3>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>หน้าปก</th>
              <th>ชื่อทริป</th>
              <th>จำนวนรูปภาพ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML || `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">ยังไม่มีอัลบั้ม</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    const previewContainer = document.getElementById('gallery-preview-container');
    const imgsIn = document.getElementById('gallery-imgs-in');

    const updateGalleryPreviews = () => {
      let previewHTML = '';
      tempGalleryImages.forEach((img, idx) => {
        previewHTML += `
          <div class="upload-preview-box">
            <img src="${img}" class="upload-preview-img" />
            <button type="button" class="upload-preview-remove remove-preview-gal-img" data-index="${idx}">x</button>
          </div>
        `;
      });
      previewContainer.innerHTML = previewHTML;

      previewContainer.querySelectorAll('.remove-preview-gal-img').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.getAttribute('data-index'));
          tempGalleryImages = tempGalleryImages.filter((_, i) => i !== index);
          updateGalleryPreviews();
        });
      });
    };

    imgsIn.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      const promises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(promises).then(base64List => {
        tempGalleryImages = [...tempGalleryImages, ...base64List];
        updateGalleryPreviews();
      });
    });

    document.getElementById('add-gallery-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const tripName = document.getElementById('gallery-title-in').value;
      if (tempGalleryImages.length === 0) {
        showToast('กรุณาเลือกรูปภาพด้วยค่ะ', 'error');
        return;
      }
      db.addGallery({ tripName, images: tempGalleryImages });
      tempGalleryImages = [];
      refreshData();
      showToast('สร้างอัลบั้มรูปสำเร็จ');
      renderAdminSubContent();
    });

    container.querySelectorAll('.delete-gallery-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('คุณต้องการลบอัลบั้มนี้?')) {
          db.deleteGallery(id);
          refreshData();
          showToast('ลบเรียบร้อย', 'success');
          renderAdminSubContent();
        }
      });
    });

  } else if (activeAdminSubTab === 'articles') {
    let rowsHTML = '';
    articles.forEach(art => {
      rowsHTML += `
        <tr>
          <td><img src="${art.image}" alt="" class="admin-table-img" /></td>
          <td style="font-weight: 500;">${art.title}</td>
          <td>${new Date(art.createdAt).toLocaleDateString('th-TH')}</td>
          <td>
            <button class="btn btn-icon text-danger delete-article-btn" data-id="${art.id}">🗑️</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <h2 class="admin-section-title">จัดการบทความ</h2>
      <form id="add-article-form" style="margin-bottom: 3rem; padding-bottom: 2.5rem; border-bottom: 1px solid var(--border-color);">
        <h3 style="font-size: 1.2rem; margin-bottom: 1.5rem;">✍️ เขียนบทความใหม่</h3>
        <div class="form-group">
          <label class="form-label">หัวข้อบทความ</label>
          <input type="text" id="article-title-in" class="form-input" placeholder="ป้อนหัวข้อบทความ..." required />
        </div>

        <div class="form-group">
          <label class="form-label">เนื้อหาบทความ</label>
          <textarea id="article-content-in" class="form-input" rows="8" placeholder="เขียนเนื้อหา..." required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">รูปภาพหน้าปกบทความ</label>
          <div class="upload-zone" style="position: relative;">
            <input type="file" id="article-img-in" accept="image/*" style="position: absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;" />
            <span>📷 อัปโหลดรูปหน้าปก</span>
          </div>
          <div id="article-img-preview-box" class="upload-preview-grid" style="display: none;">
            <div class="upload-preview-box">
              <img id="article-img-preview" src="" class="upload-preview-img" />
              <button type="button" id="remove-article-img-btn" class="upload-preview-remove">x</button>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">เผยแพร่บทความ</button>
      </form>

      <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">บทความทั้งหมด (${articles.length})</h3>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>หัวข้อบทความ</th>
              <th>วันที่เผยแพร่</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML || `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">ยังไม่มีบทความ</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    const imgIn = document.getElementById('article-img-in');
    const previewBox = document.getElementById('article-img-preview-box');
    const previewImg = document.getElementById('article-img-preview');
    const removeImgBtn = document.getElementById('remove-article-img-btn');

    imgIn.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        tempArticleImage = reader.result;
        previewImg.src = reader.result;
        previewBox.style.display = 'grid';
      };
      reader.readAsDataURL(file);
    });

    removeImgBtn.addEventListener('click', () => {
      tempArticleImage = '';
      previewImg.src = '';
      previewBox.style.display = 'none';
      imgIn.value = '';
    });

    document.getElementById('add-article-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('article-title-in').value;
      const content = document.getElementById('article-content-in').value;

      if (!tempArticleImage) {
        showToast('กรุณาเลือกรูปด้วยค่ะ', 'error');
        return;
      }

      db.addArticle({ title, content, image: tempArticleImage });
      tempArticleImage = '';
      refreshData();
      showToast('เขียนบทความสำเร็จ');
      renderAdminSubContent();
    });

    container.querySelectorAll('.delete-article-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('คุณต้องการลบบทความนี้?')) {
          db.deleteArticle(id);
          refreshData();
          showToast('ลบเรียบร้อยแล้ว', 'success');
          renderAdminSubContent();
        }
      });
    });

  } else if (activeAdminSubTab === 'art') {
    let rowsHTML = '';
    artPieces.forEach(piece => {
      rowsHTML += `
        <tr>
          <td><img src="${piece.image}" alt="" class="admin-table-img" /></td>
          <td style="font-weight: 500;">${piece.title}</td>
          <td>${piece.artist}</td>
          <td>${piece.dateSeen}</td>
          <td>
            <button class="btn btn-icon text-danger delete-art-btn" data-id="${piece.id}">🗑️</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <h2 class="admin-section-title">จัดการคลังงานศิลปะ</h2>
      <form id="add-art-form" style="margin-bottom: 3rem; padding-bottom: 2.5rem; border-bottom: 1px solid var(--border-color);">
        <h3 style="font-size: 1.2rem; margin-bottom: 1.5rem;">🎨 เพิ่มผลงานศิลปะ</h3>
        <div class="form-group">
          <label class="form-label">ชื่องานศิลปะ</label>
          <input type="text" id="art-title-in" class="form-input" placeholder="ป้อนชื่องาน..." required />
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; flex-wrap: wrap;">
          <div class="form-group">
            <label class="form-label">ศิลปินผู้สร้างสรรค์</label>
            <input type="text" id="art-artist-in" class="form-input" placeholder="ชื่อศิลปิน..." required />
          </div>
          <div class="form-group">
            <label class="form-label">ช่วงเวลาที่ไปชม</label>
            <input type="text" id="art-date-in" class="form-input" placeholder="ป้อนเวลา..." required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">บันทึกความรู้สึกย่อ</label>
          <textarea id="art-notes-in" class="form-input" rows="4" placeholder="เขียนบันทึกย่อ..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">รูปภาพงานศิลปะ</label>
          <div class="upload-zone" style="position: relative;">
            <input type="file" id="art-img-in" accept="image/*" style="position: absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;" />
            <span>📷 คลิกเพื่ออัปโหลดไฟล์ภาพ</span>
          </div>
          <div id="art-img-preview-box" class="upload-preview-grid" style="display: none;">
            <div class="upload-preview-box">
              <img id="art-img-preview" src="" class="upload-preview-img" />
              <button type="button" id="remove-art-img-btn" class="upload-preview-remove">x</button>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">นำผลงานลงคลัง</button>
      </form>

      <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">ชิ้นงานทั้งหมด (${artPieces.length})</h3>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>ชื่องาน</th>
              <th>ศิลปิน</th>
              <th>วันที่ไปชม</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML || `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">ยังไม่มีงานศิลปะ</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    const imgIn = document.getElementById('art-img-in');
    const previewBox = document.getElementById('art-img-preview-box');
    const previewImg = document.getElementById('art-img-preview');
    const removeImgBtn = document.getElementById('remove-art-img-btn');

    imgIn.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        tempArtImage = reader.result;
        previewImg.src = reader.result;
        previewBox.style.display = 'grid';
      };
      reader.readAsDataURL(file);
    });

    removeImgBtn.addEventListener('click', () => {
      tempArtImage = '';
      previewImg.src = '';
      previewBox.style.display = 'none';
      imgIn.value = '';
    });

    document.getElementById('add-art-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('art-title-in').value;
      const artist = document.getElementById('art-artist-in').value;
      const dateSeen = document.getElementById('art-date-in').value;
      const notes = document.getElementById('art-notes-in').value;

      if (!tempArtImage) {
        showToast('กรุณาเลือกรูปภาพด้วยค่ะ', 'error');
        return;
      }

      db.addArtPiece({ title, artist, dateSeen, notes, image: tempArtImage });
      tempArtImage = '';
      refreshData();
      showToast('เพิ่มงานศิลปะสำเร็จ');
      renderAdminSubContent();
    });

    container.querySelectorAll('.delete-art-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('คุณต้องการลบงานชิ้นนี้?')) {
          db.deleteArtPiece(id);
          refreshData();
          showToast('ลบเรียบร้อยแล้ว', 'success');
          renderAdminSubContent();
        }
      });
    });

  } else if (activeAdminSubTab === 'password') {
    container.innerHTML = `
      <h2 class="admin-section-title">เปลี่ยนรหัสผ่านหลังบ้าน (Local Preview)</h2>
      <form id="change-pass-form" style="max-width: 450px;">
        <div class="form-group">
          <label class="form-label">รหัสผ่านเดิม</label>
          <input type="password" id="old-pass-in" class="form-input" placeholder="รหัสปัจจุบัน..." required />
        </div>
        <div class="form-group">
          <label class="form-label">รหัสผ่านใหม่</label>
          <input type="password" id="new-pass-in" class="form-input" placeholder="รหัสผ่านใหม่..." required />
        </div>
        <div class="form-group">
          <label class="form-label">ยืนยันรหัสผ่านใหม่</label>
          <input type="password" id="confirm-pass-in" class="form-input" placeholder="ยืนยันรหัสใหม่..." required />
        </div>
        <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">ยืนยัน</button>
      </form>
    `;

    document.getElementById('change-pass-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const oldPass = document.getElementById('old-pass-in').value;
      const newPass = document.getElementById('new-pass-in').value;
      const confirmPass = document.getElementById('confirm-pass-in').value;

      if (!db.verifyPassword(oldPass)) {
        showToast('รหัสผ่านเดิมไม่ถูกต้อง', 'error');
        return;
      }
      if (newPass !== confirmPass) {
        showToast('ยืนยันรหัสผ่านใหม่ไม่ตรงกัน', 'error');
        return;
      }
      db.changePassword(newPass);
      showToast('เปลี่ยนรหัสสำเร็จ', 'success');
      document.getElementById('change-pass-form').reset();
    });
  }
}

function openDetailsModal(data, type) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const contentParagraphs = (text) => {
    return text.split('\n').map(p => `<p style="margin-bottom: 1.25rem;">${p}</p>`).join('');
  };

  let metaAndTitleHTML = '';
  if (type === 'travel') {
    metaAndTitleHTML = `
      <div class="modal-date">📅 บันทึกเมื่อ: ${data.date}</div>
      <h2 class="modal-title">${data.title}</h2>
      <div class="modal-desc font-sans">${contentParagraphs(data.story)}</div>
    `;
  } else if (type === 'article') {
    metaAndTitleHTML = `
      <div class="modal-date">📅 เขียนเมื่อ: ${new Date(data.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <h2 class="modal-title font-serif">${data.title}</h2>
      <div class="modal-desc font-serif" style="font-size: 1.1rem; color: var(--text-primary); opacity: 0.95;">
        ${contentParagraphs(data.content)}
      </div>
    `;
  }

  modalRoot.innerHTML = `
    <div class="modal-overlay" id="details-modal-overlay">
      <div class="modal-content animate-scale">
        <button class="btn-icon modal-close" id="close-modal-btn">✕</button>
        <div class="modal-body">
          <div class="modal-img-section">
            <img src="${data.image}" alt="" class="modal-detail-img" />
          </div>
          <div class="modal-text-section">
            ${metaAndTitleHTML}
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.style.overflow = 'hidden';

  const overlay = document.getElementById('details-modal-overlay');
  const closeBtn = document.getElementById('close-modal-btn');
  
  const closeModal = () => {
    overlay.remove();
    document.body.style.overflow = 'unset';
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

function openLightbox(gallery) {
  activeLightboxGallery = gallery;
  activeLightboxImageIndex = 0;
  renderLightbox();
}

function renderLightbox() {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot || !activeLightboxGallery) return;

  let thumbsHTML = '';
  if (activeLightboxGallery.images.length > 1) {
    activeLightboxGallery.images.forEach((img, idx) => {
      thumbsHTML += `
        <img src="${img}" class="lightbox-thumb ${idx === activeLightboxImageIndex ? 'active' : ''}" data-thumb-idx="${idx}" />
      `;
    });
  }

  modalRoot.innerHTML = `
    <div class="modal-overlay" id="lightbox-overlay">
      <div class="modal-content animate-scale" style="max-width: 1000px; width: 95%;" id="lightbox-card">
        <button class="btn-icon modal-close" id="close-lightbox-btn">✕</button>

        <div class="lightbox-body">
          <h2 class="lightbox-title">${activeLightboxGallery.tripName}</h2>

          <div class="lightbox-main-img">
            <img src="${activeLightboxGallery.images[activeLightboxImageIndex]}" alt="" class="lightbox-img" />
            ${activeLightboxGallery.images.length > 1 ? `
              <button class="lightbox-nav-btn lightbox-prev" id="lightbox-prev-btn">◀</button>
              <button class="lightbox-nav-btn lightbox-next" id="lightbox-next-btn">▶</button>
            ` : ''}
          </div>

          <div class="lightbox-thumbnails">${thumbsHTML}</div>
        </div>
      </div>
    </div>
  `;

  document.body.style.overflow = 'hidden';

  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');
  const closeBtn = document.getElementById('close-lightbox-btn');
  const overlay = document.getElementById('lightbox-overlay');

  const closeLightbox = () => {
    overlay.remove();
    activeLightboxGallery = null;
    document.body.style.overflow = 'unset';
  };

  const nextImg = () => {
    activeLightboxImageIndex = (activeLightboxImageIndex === activeLightboxGallery.images.length - 1) ? 0 : activeLightboxImageIndex + 1;
    renderLightbox();
  };

  const prevImg = () => {
    activeLightboxImageIndex = (activeLightboxImageIndex === 0) ? activeLightboxGallery.images.length - 1 : activeLightboxImageIndex - 1;
    renderLightbox();
  };

  if (nextBtn) nextBtn.addEventListener('click', nextImg);
  if (prevBtn) prevBtn.addEventListener('click', prevImg);
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  modalRoot.querySelectorAll('.lightbox-thumb').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      activeLightboxImageIndex = parseInt(e.target.getAttribute('data-thumb-idx'));
      renderLightbox();
    });
  });
}

window.addEventListener('DOMContentLoaded', init);
