document.addEventListener('DOMContentLoaded', () => {
  // Slideshow Utility Functions
  window.createSlideshowHTML = function(imageString, title = '', isBackground = false) {
    if (!imageString || imageString.trim() === '') return '';
    
    // カンマ、読点、改行などで分割
    const images = imageString.split(/[,、\n]+/).map(s => s.trim()).filter(s => s !== '');
    if (images.length === 0) return '';
    if (images.length === 1) {
      if (isBackground) {
        return `url('${images[0]}')`;
      } else {
        return `<img src="${images[0]}" alt="${title}" class="slideshow-img">`;
      }
    }

    let html = `<div class="slideshow-container">`;
    images.forEach((imgUrl, i) => {
      const activeClass = i === 0 ? 'active' : '';
      html += `<div class="slideshow-slide ${activeClass}">`;
      if (isBackground) {
        html += `<div class="slideshow-bg" style="background-image: url('${imgUrl}')"></div>`;
      } else {
        html += `<img src="${imgUrl}" alt="${title} ${i+1}" class="slideshow-img">`;
      }
      html += `</div>`;
    });

    html += `<div class="slideshow-indicators">`;
    images.forEach((_, i) => {
      const activeClass = i === 0 ? 'active' : '';
      html += `<div class="slideshow-indicator ${activeClass}" data-index="${i}"></div>`;
    });
    html += `</div></div>`;

    return html;
  };

  window.initSlideshows = function() {
    const containers = document.querySelectorAll('.slideshow-container');
    containers.forEach(container => {
      if (container.dataset.initialized) return;
      container.dataset.initialized = 'true';

      const slides = container.querySelectorAll('.slideshow-slide');
      const indicators = container.querySelectorAll('.slideshow-indicator');
      if (slides.length <= 1) return;

      let current = 0;
      const switchSlide = (index) => {
        slides[current].classList.remove('active');
        if (indicators[current]) indicators[current].classList.remove('active');
        current = index;
        slides[current].classList.add('active');
        if (indicators[current]) indicators[current].classList.add('active');
      };

      let interval = setInterval(() => {
        switchSlide((current + 1) % slides.length);
      }, 4000);

      indicators.forEach((ind, idx) => {
        ind.addEventListener('click', (e) => {
          e.stopPropagation();
          clearInterval(interval);
          switchSlide(idx);
          interval = setInterval(() => {
            switchSlide((current + 1) % slides.length);
          }, 4000);
        });
      });
    });
  };

  // --- Google Sheets Configuration ---
  // お客様のGoogleスプレッドシートIDをここに貼り付けてください
  const SPREADSHEET_ID = '1rVMxwnwv_kr9hkiIu8rlBWsxU4j_MkLHNJZYBlJB248';

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Mobile menu toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isMenuOpen = navLinks.classList.contains('mobile-open');
      menuBtn.innerHTML = isMenuOpen
        ? '<i data-lucide="x"></i>'
        : '<i data-lucide="menu"></i>';
      lucide.createIcons();
    });
  }

  // Active link highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  // Members Page 3D Carousel Logic
  function initMembersCarousel() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const allCards = document.querySelectorAll('.carousel-item');
    const carouselContainer = document.getElementById('members-carousel');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const emptyMessage = document.getElementById('empty-message');

    if (tabBtns.length > 0 && carouselContainer) {
      let currentRotation = 0;
      let activeIndex = 0;
      let visibleCards = [];
      let theta = 0;

      function updateCarousel() {
        if (visibleCards.length === 0) return;

        theta = 360 / visibleCards.length;
        // Calculate radius dynamically based on item width (260px) and item count
        const radius = Math.round((260 / 2) / Math.tan(Math.PI / visibleCards.length)) + 80;

        visibleCards.forEach((card, index) => {
          card.style.transform = `rotateY(${index * theta}deg) translateZ(${radius}px)`;
          card.classList.remove('active-item');
        });

        // Normalize active index
        const normalizedIndex = ((activeIndex % visibleCards.length) + visibleCards.length) % visibleCards.length;
        if (visibleCards[normalizedIndex]) {
          visibleCards[normalizedIndex].classList.add('active-item');
        }

        carouselContainer.style.transform = `translateZ(${-radius}px) rotateY(${currentRotation}deg)`;
      }

      function setActiveTab(grade) {
        tabBtns.forEach(btn => {
          if (btn.getAttribute('data-grade') === grade) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });

        visibleCards = [];
        allCards.forEach(card => {
          if (card.getAttribute('data-grade') === grade) {
            card.classList.remove('hidden');
            visibleCards.push(card);
          } else {
            card.classList.add('hidden');
          }
        });

        if (emptyMessage) {
          emptyMessage.style.display = visibleCards.length === 0 ? 'block' : 'none';
        }

        currentRotation = 0;
        activeIndex = 0;

        // Allow DOM to update before applying 3D transforms
        setTimeout(() => {
          updateCarousel();
        }, 50);
      }

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const grade = btn.getAttribute('data-grade');
          setActiveTab(grade);
        });
      });

      if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
          if (visibleCards.length === 0) return;
          currentRotation += theta;
          activeIndex--;
          updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
          if (visibleCards.length === 0) return;
          currentRotation -= theta;
          activeIndex++;
          updateCarousel();
        });
      }

      // Default active tab to 4
      setActiveTab('4');
    }
  }

  // Records Page Search Logic
  const searchInput = document.getElementById('record-search');
  const emptyRecordMsg = document.getElementById('empty-record-msg');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      let count = 0;
      const currentRows = document.querySelectorAll('.record-row');

      currentRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(term)) {
          row.style.display = '';
          count++;
        } else {
          row.style.display = 'none';
        }
      });

      if (emptyRecordMsg) {
        emptyRecordMsg.style.display = count === 0 ? 'block' : 'none';
      }
    });
  }

  // Parts Page Dynamic Data Fetching
  function fetchPartsData() {
    const circleContainer = document.getElementById('parts-circle-container');
    const bgContainer = document.getElementById('parts-bg-container');
    const detailsContainer = document.getElementById('parts-details-container');
    const loadingMsg = document.getElementById('parts-loading-msg');
    
    if (!circleContainer || !bgContainer || !detailsContainer) return;

    if (SPREADSHEET_ID === 'ダミーのIDをここに入れます_後で書き換えてください') {
      if (loadingMsg) loadingMsg.textContent = 'ダミーIDのため読み込みをスキップしました。';
      return;
    }

    const callbackName = 'gvizCallback_parts_' + Date.now();
    const queryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}&sheet=${encodeURIComponent('パート紹介')}`;

    window[callbackName] = function(data) {
      if (loadingMsg) loadingMsg.remove();

      if (data.status === 'error' || !data.table || !data.table.rows || data.table.rows.length === 0) {
        circleContainer.innerHTML += '<p style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-muted); font-size: 0.9rem;">データがありません</p>';
        return;
      }

      let skipHeader = true;
      let index = 0;

      const customIcons = {
        '1': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="var(--primary)" class="item-icon" style="width:{SIZE}px; height:{SIZE}px;"><path d="M482-425 245-188q-12 12-28.5 12T188-188q-12-12-12-28.5t12-28.5l356-355H440v40q0 17-11.5 28.5T400-520q-17 0-28.5-11.5T360-560v-80q0-17 11.5-28.5T400-680h194q16 0 30.5 6t25.5 17l120 119q20 20 46.5 33.5T874-485q17 3 29.5 15.5T916-440q0 17-14 28t-31 9q-45-6-83-24t-70-49l-40-42-88 88 53 53q14 14 11.5 33.5T635-314L453-209q-14 8-30.5 4T398-223q-8-14-3.5-30.5T413-278l137-79-68-68Zm-322-15q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520h120q17 0 28.5 11.5T320-480q0 17-11.5 28.5T280-440H160ZM80-560q-17 0-28.5-11.5T40-600q0-17 11.5-28.5T80-640h120q17 0 28.5 11.5T240-600q0 17-11.5 28.5T200-560H80Zm699-80q-33 0-57-23.5T698-720q0-33 24-56.5t57-23.5q33 0 57 23.5t24 56.5q0 33-24 56.5T779-640Zm-619-40q-17 0-28.5-11.5T120-720q0-17 11.5-28.5T160-760h120q17 0 28.5 11.5T320-720q0 17-11.5 28.5T280-680H160Z"/></svg>`,
        '2': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="var(--secondary)" class="item-icon" style="width:{SIZE}px; height:{SIZE}px;"><path d="M520-80v-200l-84-80-31 138q-4 16-17.5 24.5T358-192l-198-40q-17-3-26-17t-6-31q3-17 17-26.5t31-5.5l152 32 64-324-72 28v96q0 17-11.5 28.5T280-440q-17 0-28.5-11.5T240-480v-122q0-12 6.5-21.5T264-638l134-58q35-15 51.5-19.5T480-720q21 0 39 11t29 29l40 64q21 34 54.5 59t77.5 33q17 3 28.5 15t11.5 29q0 17-11.5 28t-27.5 9q-54-8-101-33.5T540-540l-24 120 72 68q6 6 9 13.5t3 15.5v243q0 17-11.5 28.5T560-40q-17 0-28.5-11.5T520-80Zm-36.5-683.5Q460-787 460-820t23.5-56.5Q507-900 540-900t56.5 23.5Q620-853 620-820t-23.5 56.5Q573-740 540-740t-56.5-23.5Z"/></svg>`,
        '3': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#10b981" class="item-icon" style="width:{SIZE}px; height:{SIZE}px;"><rect x="10" y="60" width="80" height="4" rx="2" fill="currentColor"/><rect x="15" y="60" width="4" height="35" rx="1" fill="currentColor"/><rect x="81" y="60" width="4" height="35" rx="1" fill="currentColor"/><circle cx="80" cy="40" r="7" fill="currentColor"/><path d="M 76 43 Q 50 15 25 43" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M 65 30 L 70 12" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M 27 41 L 15 25" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M 29 44 L 10 40" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>`,
        '4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#8b5cf6" class="item-icon" style="width:{SIZE}px; height:{SIZE}px;"><path d="m350-292-40 69q-8 14-24.5 18.5T255-208q-14-8-18.5-24.5T240-263l186-321q-38-39-57-89t-19-103q0-26 4.5-52.5T370-880q6-15 22-19.5t30 3.5q14 8 18.5 24t-.5 32q-5 15-7.5 30.5T430-778q0 53 26 99.5t74 74.5l90 52q62 36 91 103.5T740-322q0 27-5 53.5T720-217q-6 16-22 20.5t-31-3.5q-14-8-19-24t0-33q5-16 7.5-31.5T658-320q0-32-9-62t-29-56L388-39q-8 14-24.5 18.5T333-24q-14-8-18.5-24.5T318-79l100-173-68-40Zm290-308q-33 0-56.5-23.5T560-680q0-33 23.5-56.5T640-760q33 0 56.5 23.5T720-680q0 33-23.5 56.5T640-600ZM540-800q-26 0-43-18t-17-42q0-26 18-43t42-17q26 0 43 18t17 42q0 26-18 43t-42 17Z"/></svg>`,
        '5': `<i data-lucide="clipboard-list" class="item-icon" style="width:{SIZE}px; height:{SIZE}px; color: #f59e0b;"></i>`
      };

      const getIconHTML = (iconNameRaw, size, fallbackColor) => {
        const iconKey = String(iconNameRaw).trim();
        if (customIcons[iconKey]) {
          return customIcons[iconKey].replaceAll('{SIZE}', size);
        }
        return `<i data-lucide="${iconKey || 'activity'}" width="${size}" height="${size}" class="item-icon" style="color: ${fallbackColor};"></i>`;
      };

      data.table.rows.forEach(row => {
        if (!row.c || !row.c[0] || row.c[0].v === null) return;
        if (skipHeader && row.c[0].v === 'パート名') {
          skipHeader = false;
          return;
        }
        skipHeader = false;

        const name = row.c[0] && row.c[0].v !== null ? row.c[0].v : '名無し';
        const iconName = row.c[1] && row.c[1].v !== null ? row.c[1].v : 'activity';
        const imageUrl = row.c[2] && row.c[2].v !== null ? row.c[2].v : '';
        const desc = row.c[3] && row.c[3].v !== null ? row.c[3].v : '';
        const partId = 'part_' + index;
        const isActive = index === 0 ? 'active' : '';

        // 1. Circle Item
        const circleItem = document.createElement('div');
        circleItem.className = `circle-item ${isActive}`;
        circleItem.setAttribute('data-part', partId);
        circleItem.style.setProperty('--i', index);
        circleItem.innerHTML = `
          ${getIconHTML(iconName, 28, 'var(--text)')}
          <span class="item-label">${name}</span>
        `;
        circleContainer.appendChild(circleItem);

        // 2. Background Layer
        const bgLayer = document.createElement('div');
        bgLayer.className = `parts-bg-layer ${isActive}`;
        bgLayer.id = `bg-layer-${partId}`;
        if (imageUrl && imageUrl.trim() !== '') {
          const slideHtml = window.createSlideshowHTML(imageUrl, name, true);
          if (slideHtml.startsWith('url(')) {
            bgLayer.style.backgroundImage = slideHtml;
          } else {
            bgLayer.innerHTML = slideHtml;
          }
        } else {
          bgLayer.style.backgroundColor = 'var(--surface-hover)';
        }
        bgContainer.appendChild(bgLayer);

        // 3. Detail Card
        const detailCard = document.createElement('div');
        detailCard.className = `part-detail-card ${isActive}`;
        detailCard.id = `detail-${partId}`;
        detailCard.innerHTML = `
          <div style="margin-bottom: 1.5rem;">
            ${getIconHTML(iconName, 48, 'var(--primary)')}
          </div>
          <h3>${name}パート</h3>
          <p>${desc}</p>
        `;
        detailsContainer.appendChild(detailCard);

        index++;
      });
      
      const actualTotal = index;
      circleContainer.style.setProperty('--total', Math.max(1, actualTotal));

      // Setup Circular Navigation Logic
      const circleItems = document.querySelectorAll('.circle-item');
      const detailCards = document.querySelectorAll('.part-detail-card');
      if (circleItems.length > 0) {
        let currentOffset = 0;
        circleItems.forEach((item, idx) => {
          item.addEventListener('click', () => {
            circleItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            let delta = idx - (currentOffset % actualTotal);
            // Dynamic shortest path handling for N items
            const half = actualTotal / 2;
            if (delta > half) delta -= actualTotal;
            if (delta < -half) delta += actualTotal;

            currentOffset += delta;
            circleContainer.style.setProperty('--offset', currentOffset);

            detailCards.forEach(card => card.classList.remove('active'));
            const partId = item.getAttribute('data-part');
            const targetCard = document.getElementById(`detail-${partId}`);
            if (targetCard) targetCard.classList.add('active');

            const bgLayers = document.querySelectorAll('.parts-bg-layer');
            bgLayers.forEach(bg => bg.classList.remove('active'));
            const targetBg = document.getElementById(`bg-layer-${partId}`);
            if (targetBg) targetBg.classList.add('active');
          });
        });
      }

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      
      const wrapper = document.querySelector('.parts-circle-wrapper');
      const contentDesktop = document.querySelector('.parts-content-desktop');
      if (wrapper) wrapper.classList.add('reveal');
      // removed reveal from contentDesktop to ensure it's always visible for debugging
      if (contentDesktop) {
        contentDesktop.style.opacity = '1'; 
        contentDesktop.style.transform = 'none';
      }
      
      if (typeof window.initSlideshows === 'function') {
        window.initSlideshows();
      }
      
      applyScrollReveal();
    };

    const script = document.createElement('script');
    script.src = queryUrl;
    script.onerror = function() {
      if (loadingMsg) loadingMsg.textContent = 'データの読み込みに失敗しました。';
      delete window[callbackName];
      script.remove();
    };
    document.head.appendChild(script);
  }

  fetchPartsData();

  // Scroll Reveal Logic
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Stop observing once revealed
      }
    });
  }, observerOptions);

  function applyScrollReveal() {
    const elementsToReveal = document.querySelectorAll('.card:not(.reveal), .page-title:not(.reveal), .hero-content:not(.reveal), .data-table:not(.reveal), .parts-circle-wrapper:not(.reveal), .member-card:not(.reveal)');
    elementsToReveal.forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  applyScrollReveal();

  // Member Card Click Logic
  function initMemberCardClicks() {
    const memberCardsProfile = document.querySelectorAll('.member-card:not(.click-bound)');
    memberCardsProfile.forEach(card => {
      card.classList.add('click-bound');
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const name = card.querySelector('h3')?.textContent || '';
        const partBadge = card.querySelector('.badge');
        const part = partBadge?.textContent || '';
        const pbText = card.querySelector('.member-pb')?.textContent || '';
        const quoteText = card.querySelector('.member-quote')?.textContent || '';

        // "PB: 1'52"34" -> "1'52"34"
        const pb = pbText.replace(/PB:\s*/, '').replace(/Support\s*/, 'サポート').trim();
        const quote = quoteText.replace(/^"|"$/g, '').trim(); // Remove quotes

        // Get avatar color to theme the profile page
        const avatar = card.querySelector('.member-avatar');
        const color = avatar ? getComputedStyle(avatar).borderColor : '#0ea5e9';

        // Get highschool from data attribute if it exists, otherwise default
        const highschool = card.getAttribute('data-highschool') || '未設定 (クリックして編集可能)';

        // Get department from data attribute
        const department = card.getAttribute('data-department') || '未設定 (クリックして編集可能)';

        const imageUrl = card.getAttribute('data-imageurl') || '';

        sessionStorage.setItem('currentMemberProfile', JSON.stringify({
          name: name,
          part: part,
          pb: pb,
          quote: quote,
          color: color,
          highschool: highschool,
          department: department,
          imageUrl: imageUrl
        }));

        window.location.href = `profile.html`;
      });
    });
  }

  initMemberCardClicks();

  // --- Google Sheets Integration ---
  function fetchSheetData(sheetName, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (SPREADSHEET_ID === 'ダミーのIDをここに入れます_後で書き換えてください') {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 3rem; color: var(--text-muted);">ダミーIDのため読み込みをスキップしました。<br>正しいスプレッドシートIDを設定してください。</td></tr>';
      return;
    }

    // ローカル環境（file:///）でのCORSエラーを回避するため、JSONPを使用します
    const callbackName = 'gvizCallback_' + tbodyId.replace(/-/g, '_') + '_' + Date.now();
    const queryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}&sheet=${encodeURIComponent(sheetName)}`;

    window[callbackName] = function(data) {
      tbody.innerHTML = ''; // Clear loading message

      if (!data.table.rows || data.table.rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">データがありません</td></tr>';
      } else {
        let skipHeader = true;
        data.table.rows.forEach(row => {
          if (!row.c || !row.c[0] || row.c[0].v === null) return; // Skip empty rows

          // APIがヘッダー行をデータとして返すことがあるためスキップ
          if (skipHeader && row.c[0].v === '種目') {
            skipHeader = false;
            return;
          }
          skipHeader = false;

          // Extract values handling potential nulls
          const event = row.c[0] && row.c[0].v !== null ? row.c[0].v : '-';
          const record = row.c[1] && row.c[1].v !== null ? (row.c[1].f || row.c[1].v) : '-';
          const name = row.c[2] && row.c[2].v !== null ? row.c[2].v : '-';
          let year = '-';
          if (row.c[3] && row.c[3].v !== null) {
            year = row.c[3].f || row.c[3].v;
          }

          const tr = document.createElement('tr');
          tr.className = 'record-row';
          tr.innerHTML = `
            <td style="font-weight: 600; color: var(--primary);">${event}</td>
            <td style="font-size: 1.2rem; font-family: monospace;">${record}</td>
            <td>${name}</td>
            <td style="color: var(--text-muted);">${year}</td>
          `;
          tbody.appendChild(tr);
        });

        // データ読み込み後に検索を再適用（入力がある場合）
        const searchInput = document.getElementById('record-search');
        if (searchInput && searchInput.value) {
          searchInput.dispatchEvent(new Event('input'));
        }
      }

      // クリーンアップ
      delete window[callbackName];
      const scriptToRemove = document.getElementById(callbackName);
      if (scriptToRemove) scriptToRemove.remove();
    };

    const script = document.createElement('script');
    script.src = queryUrl;
    script.id = callbackName;
    script.onerror = function() {
      console.error('Error fetching sheet data');
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: red;">データの読み込みに失敗しました。URLや共有設定を確認してください。</td></tr>';
      delete window[callbackName];
      script.remove();
    };
    document.head.appendChild(script);
  }

  function fetchMembersData() {
    const container = document.getElementById('members-carousel');
    if (!container) return;

    if (SPREADSHEET_ID === 'ダミーのIDをここに入れます_後で書き換えてください') {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">ダミーIDのため読み込みをスキップしました。</p>';
      return;
    }

    const callbackName = 'gvizCallback_members_' + Date.now();
    const queryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}&sheet=${encodeURIComponent('メンバー')}`;

    window[callbackName] = function(data) {
      container.innerHTML = ''; // プレースホルダーをクリア

      if (!data.table.rows || data.table.rows.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">データがありません</p>';
      } else {
        let skipHeader = true;
        
        // 学年ごとのカラー設定
        const gradeColors = {
          '4': '#0ea5e9', // 青
          '3': '#f43f5e', // 赤
          '2': '#10b981', // 緑
          '1': '#8b5cf6'  // 紫
        };

        data.table.rows.forEach(row => {
          if (!row.c || !row.c[0] || row.c[0].v === null) return;
          if (skipHeader && row.c[0].v === '学年') {
            skipHeader = false;
            return;
          }
          skipHeader = false;

          const grade = row.c[0] && row.c[0].v !== null ? row.c[0].v.toString() : '';
          const name = row.c[1] && row.c[1].v !== null ? row.c[1].v : '';
          const part = row.c[2] && row.c[2].v !== null ? row.c[2].v : '';
          const pb = row.c[3] && row.c[3].v !== null ? row.c[3].v : '';
          const quote = row.c[4] && row.c[4].v !== null ? row.c[4].v : '';
          const highschool = row.c[5] && row.c[5].v !== null ? row.c[5].v : '未設定 (クリックして編集可能)';
          const department = row.c[6] && row.c[6].v !== null ? row.c[6].v : '未設定 (クリックして編集可能)';
          const imageUrl = row.c[7] && row.c[7].v !== null ? row.c[7].v : '';

          const color = gradeColors[grade] || '#0ea5e9';

          // 記録アイコン (サポートの場合はタイマー)
          const pbIcon = pb.toLowerCase().includes('support') || pb === 'サポート' ? 'timer' : 'award';
          const pbDisplay = pbIcon === 'timer' ? 'Support' : `PB: ${pb}`;

          const div = document.createElement('div');
          div.className = 'carousel-item member-card hidden';
          div.setAttribute('data-grade', grade);
          div.setAttribute('data-highschool', highschool);
          div.setAttribute('data-department', department);
          div.setAttribute('data-imageurl', imageUrl);

          div.innerHTML = `
            <div class="member-avatar" style="border-color: ${color};"><i data-lucide="user" width="40" height="40" color="${color}"></i></div>
            <h3>${name}</h3>
            <div class="badge" style="background-color: ${color}33; color: ${color};">${part}</div>
            <p class="member-pb"><i data-lucide="${pbIcon}" width="16" height="16"></i> ${pbDisplay}</p>
            <p class="member-quote">"${quote}"</p>
          `;
          container.appendChild(div);
        });

        // 動的追加後に再描画・初期化
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        initMembersCarousel();
        initMemberCardClicks();
        applyScrollReveal();
      }

      delete window[callbackName];
      const scriptToRemove = document.getElementById(callbackName);
      if (scriptToRemove) scriptToRemove.remove();
    };

    const script = document.createElement('script');
    script.src = queryUrl;
    script.id = callbackName;
    script.onerror = function() {
      console.error('Error fetching members data');
      container.innerHTML = '<p style="text-align: center; color: red;">データの読み込みに失敗しました。</p>';
      delete window[callbackName];
      script.remove();
    };
    document.head.appendChild(script);
  }

  function fetchBlogData() {
    const container = document.getElementById('blog-container');
    if (!container) return;

    if (SPREADSHEET_ID === 'ダミーのIDをここに入れます_後で書き換えてください') {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1;">ダミーIDのため読み込みをスキップしました。</p>';
      return;
    }

    const callbackName = 'gvizCallback_blog_' + Date.now();
    const queryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}&sheet=${encodeURIComponent('ブログ')}`;

    window[callbackName] = function(data) {
      container.innerHTML = ''; // Clear skeleton

      if (data.status === 'error' || !data.table || !data.table.rows || data.table.rows.length === 0) {
        document.getElementById('empty-blog-msg').style.display = 'block';
        if (data.status === 'error') {
          console.error('Google Sheets Error:', data.errors);
        }
      } else {
        let skipHeader = true;
        
        // Rows are usually ordered top-to-bottom, we might want to reverse them so newest is first.
        // Assuming the sheet is added chronologically (newest at bottom).
        const rows = [...data.table.rows].reverse();

        rows.forEach(row => {
          if (!row.c || !row.c[0] || row.c[0].v === null) return;
          // When reversed, header will be at the end, let's just check for '日付'
          if (row.c[0].v === '日付') return;

          const dateStr = row.c[0] && row.c[0].v !== null ? (row.c[0].f || row.c[0].v) : '';
          const title = row.c[1] && row.c[1].v !== null ? row.c[1].v : '無題';
          const content = row.c[2] && row.c[2].v !== null ? row.c[2].v : '';
          const imageUrl = row.c[3] && row.c[3].v !== null ? row.c[3].v : '';

          const div = document.createElement('div');
          div.className = 'card blog-card';
          div.style.cursor = 'pointer';

          div.addEventListener('click', () => {
            sessionStorage.setItem('currentBlogPost', JSON.stringify({
              title: title,
              date: dateStr,
              content: content,
              imageUrl: imageUrl
            }));
            window.location.href = 'blog-post.html';
          });
          
          let imageHtml = '';
          if (imageUrl && imageUrl.trim() !== '') {
            const firstImg = imageUrl.split(/[,、\n]+/)[0].trim();
            imageHtml = `<img src="${firstImg}" alt="${title}" class="blog-image">`;
          } else {
            imageHtml = `<div class="blog-image"><i data-lucide="image" width="48" height="48" style="opacity: 0.2;"></i></div>`;
          }

          div.innerHTML = `
            ${imageHtml}
            <div class="blog-content">
              <div class="blog-date"><i data-lucide="calendar" width="14" height="14"></i> ${dateStr}</div>
              <h3 class="blog-title">${title}</h3>
              <p class="blog-excerpt">${content}</p>
            </div>
          `;
          container.appendChild(div);
        });

        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        applyScrollReveal();
      }

      delete window[callbackName];
      const scriptToRemove = document.getElementById(callbackName);
      if (scriptToRemove) scriptToRemove.remove();
    };

    const script = document.createElement('script');
    script.src = queryUrl;
    script.id = callbackName;
    script.onerror = function() {
      console.error('Error fetching blog data');
      container.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">データの読み込みに失敗しました。</p>';
      delete window[callbackName];
      script.remove();
    };
    document.head.appendChild(script);
  }

  // Blog Search Logic
  const blogSearchInput = document.getElementById('blog-search');
  const emptyBlogMsg = document.getElementById('empty-blog-msg');

  if (blogSearchInput) {
    blogSearchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      let count = 0;
      const blogCards = document.querySelectorAll('.blog-card');

      blogCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(term)) {
          card.style.display = 'flex';
          count++;
        } else {
          card.style.display = 'none';
        }
      });

      if (emptyBlogMsg) {
        emptyBlogMsg.style.display = count === 0 ? 'block' : 'none';
      }
    });
  }

  // Trigger data fetching for respective pages
  if (document.getElementById('all-time-records-tbody')) {
    fetchSheetData('歴代記録', 'all-time-records-tbody');
  }

  if (document.getElementById('last-year-records-tbody')) {
    fetchSheetData('去年の記録', 'last-year-records-tbody');
  }

  if (document.getElementById('members-carousel')) {
    fetchMembersData();
  }

  if (document.getElementById('blog-container')) {
    fetchBlogData();
  }
});
