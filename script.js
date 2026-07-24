document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.BLUEBLACK_CONFIG || {};
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const loader = q('#loader');
  const navToggle = q('.nav-toggle');
  const navLinks = q('.nav-links');
  const toast = q('#toast');
  const toTop = q('#toTop');

  const audio = q('#audio');
  const coverImg = q('#coverImg');
  const trackTitle = q('#trackTitle');
  const trackArtist = q('#trackArtist');
  const currentTime = q('#currentTime');
  const duration = q('#duration');
  const progress = q('#progress');
  const playBtn = q('#playBtn');
  const prevBtn = q('#prevBtn');
  const nextBtn = q('#nextBtn');
  const repeatBtn = q('#repeatBtn');
  const shuffleBtn = q('#shuffleBtn');
  const trackCount = q('#trackCount');
  const playlistItems = q('#playlistItems');
  const contactGrid = q('#contactGrid');
  const projectGrid = q('#projectGrid');
  const footerSocials = q('#footerSocials');

  const heroName = q('#heroName');
  const heroRole = q('#heroRole');
  const heroLead = q('#heroLead');
  const chipRow = q('#chipRow');
  const heroAsideTitle = q('#heroAsideTitle');
  const heroAsideText = q('#heroAsideText');
  const aboutText = q('#aboutText');
  const aboutQuote = q('#aboutQuote');
  const aboutMeta = q('#aboutMeta');
  const aboutPoints = q('#aboutPoints');
  const supportTitle = q('#supportTitle');
  const supportBank = q('#supportBank');
  const supportOwner = q('#supportOwner');
  const supportAccount = q('#supportAccount');
  const supportMiniTitle = q('#supportMiniTitle');
  const supportMiniText = q('#supportMiniText');

  let currentIndex = 0;
  let repeatOn = false;
  let shuffleOn = false;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1500);
  };

  const formatTime = (secs) => {
    if (!isFinite(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const setTheme = (track) => {
    if (!track) return;
    document.documentElement.style.setProperty('--accent', track.accent);
    document.documentElement.style.setProperty('--accent2', track.accent2);
    document.documentElement.style.setProperty('--theme-glow', `${track.accent}33`);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', track.accent);
  };

  const renderStaticContent = () => {
    if (heroName && cfg.name) heroName.textContent = cfg.name;
    if (heroRole && cfg.role) heroRole.textContent = cfg.role;
    if (heroLead && cfg.lead) heroLead.textContent = cfg.lead;

    if (chipRow && Array.isArray(cfg.chips)) {
      chipRow.innerHTML = cfg.chips.map((chip) => `<span>${chip}</span>`).join('');
    }

    if (heroAsideTitle && cfg.hero?.title) heroAsideTitle.textContent = cfg.hero.title;
    if (heroAsideText && cfg.hero?.text) heroAsideText.textContent = cfg.hero.text;

    const asideStats = qa('.aside-stats div');
    if (asideStats.length) {
      const tracks = Array.isArray(cfg.tracks) ? cfg.tracks.length : 0;
      const contacts = Array.isArray(cfg.socials) ? cfg.socials.length : 0;
      const statsData = [
        { value: String(tracks).padStart(2, '0'), label: 'Tracks' },
        { value: String(contacts).padStart(2, '0'), label: 'Contacts' },
        { value: '100%', label: 'Responsive' }
      ];
      asideStats.forEach((box, index) => {
        const item = statsData[index];
        const strong = box.querySelector('strong');
        const span = box.querySelector('span');
        if (item && strong) strong.textContent = item.value;
        if (item && span) span.textContent = item.label;
      });
    }

    const asideLines = qa('.aside-lines div');
    if (asideLines.length && Array.isArray(cfg.hero?.lines)) {
      asideLines.forEach((line, index) => {
        const text = cfg.hero.lines[index];
        if (text && line) line.lastChild.textContent = ` ${text}`;
      });
    }

    if (aboutText && cfg.about?.text) aboutText.textContent = cfg.about.text;
    if (aboutQuote && cfg.about?.quote) aboutQuote.textContent = cfg.about.quote;
    if (aboutMeta && Array.isArray(cfg.about?.meta)) {
      aboutMeta.innerHTML = cfg.about.meta.map((meta) => `<span>${meta}</span>`).join('');
    }
    if (aboutPoints && Array.isArray(cfg.about?.points)) {
      aboutPoints.innerHTML = cfg.about.points.map((point, idx) => `
        <div>
          <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-${idx % 2 === 0 ? 'spark' : 'bolt'}"></use></svg>
          ${point}
        </div>
      `).join('');
    }

    if (supportTitle && cfg.support?.title) supportTitle.textContent = cfg.support.title;
    if (supportBank && cfg.support?.bank) supportBank.textContent = `Ngân hàng: ${cfg.support.bank}`;
    if (supportOwner && cfg.support?.owner) supportOwner.textContent = `Chủ tài khoản: ${cfg.support.owner}`;
    if (supportAccount && cfg.support?.account) supportAccount.textContent = cfg.support.account;
    if (supportMiniTitle) supportMiniTitle.textContent = 'Ủng Hộ Tôi';
    if (supportMiniText && cfg.support?.note) supportMiniText.textContent = cfg.support.note;

    if (footerSocials && Array.isArray(cfg.socials)) {
      footerSocials.innerHTML = cfg.socials
        .filter((item) => item.key !== 'support')
        .map((item) => `
          <a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-${item.icon}"></use></svg>
          </a>
        `).join('');
    }
  };

  const renderContacts = () => {
    if (!contactGrid || !Array.isArray(cfg.socials)) return;
    contactGrid.innerHTML = cfg.socials.map((item) => {
      const isLocal = item.href.startsWith('#');
      return `
        <a
          class="glass contact-card reveal contact-${item.key}"
          href="${item.href}"
          target="${isLocal ? '_self' : '_blank'}"
          rel="noopener noreferrer"
          style="--card-accent:${item.accent}; --card-accent2:${item.accent2}"
        >
          <span class="contact-badge">
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-${item.icon}"></use></svg>
          </span>
          <strong>${item.label}</strong>
          <p>${item.subtitle}</p>
        </a>
      `;
    }).join('');
  };

  const renderProjects = () => {
    if (!projectGrid || !Array.isArray(cfg.projects)) return;
    projectGrid.innerHTML = cfg.projects.map((item, index) => `
      <article class="glass project-card reveal" style="--project-accent:${item.accent}">
        <div class="project-thumb thumb-${index + 1}">
          <span>${String(index + 1).padStart(2, '0')}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-${item.icon}"></use></svg>
        </div>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        <a href="${item.href}">
          ${item.tag}
          <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-arrow-up-right"></use></svg>
        </a>
      </article>
    `).join('');
  };

  const renderPlaylist = () => {
    if (!playlistItems || !Array.isArray(cfg.tracks)) return;
    playlistItems.innerHTML = cfg.tracks.map((track, index) => `
      <button class="play-item ${index === 0 ? 'active' : ''}" type="button" data-index="${index}">
        <img src="${track.cover}" alt="${track.title}" loading="lazy">
        <div class="meta">
          <strong>${track.title}</strong>
          <p>${track.artist}</p>
        </div>
        <span>${String(index + 1).padStart(2, '0')}</span>
      </button>
    `).join('');
  };

  const updatePlaylistActive = () => {
    qa('.play-item').forEach((el, idx) => el.classList.toggle('active', idx === currentIndex));
  };

  const updatePlayerUI = () => {
    const track = cfg.tracks?.[currentIndex];
    if (!track) return;
    if (coverImg) {
      coverImg.src = track.cover;
      coverImg.alt = track.title;
    }
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    if (trackCount) {
      trackCount.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(cfg.tracks.length).padStart(2, '0')}`;
    }
    setTheme(track);
    updatePlaylistActive();
  };

  const setPlayButton = () => {
    if (!playBtn) return;
    playBtn.innerHTML = audio.paused
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-play"></use></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-pause"></use></svg>';
  };

  const setToggleState = (btn, on) => {
    if (!btn) return;
    btn.classList.toggle('active', on);
  };

  const loadTrack = (index, autoplay = false) => {
    if (!Array.isArray(cfg.tracks) || !cfg.tracks.length) return;
    currentIndex = (index + cfg.tracks.length) % cfg.tracks.length;
    const track = cfg.tracks[currentIndex];
    audio.src = track.src;
    audio.load();
    updatePlayerUI();
    if (autoplay) {
      audio.play().then(setPlayButton).catch(() => {});
    }
  };

  const getRandomIndex = (exclude = currentIndex) => {
    if (!Array.isArray(cfg.tracks) || cfg.tracks.length < 2) return 0;
    let next = exclude;
    while (next === exclude) {
      next = Math.floor(Math.random() * cfg.tracks.length);
    }
    return next;
  };

  const goNext = () => {
    if (shuffleOn) return loadTrack(getRandomIndex(), true);
    return loadTrack(currentIndex + 1, true);
  };

  const goPrev = () => loadTrack(currentIndex - 1, true);

  const toggleRepeat = () => {
    repeatOn = !repeatOn;
    setToggleState(repeatBtn, repeatOn);
    showToast(repeatOn ? 'Đã bật lặp bài' : 'Đã tắt lặp bài');
  };

  const toggleShuffle = () => {
    shuffleOn = !shuffleOn;
    setToggleState(shuffleBtn, shuffleOn);
    showToast(shuffleOn ? 'Đã bật trộn bài' : 'Đã tắt trộn bài');
  };

  renderStaticContent();
  renderContacts();
  renderProjects();
  renderPlaylist();
  loadTrack(0, false);
  setPlayButton();

  playlistItems?.addEventListener('click', (event) => {
    const btn = event.target.closest('.play-item');
    if (!btn) return;
    loadTrack(Number(btn.dataset.index), true);
  });

  playBtn?.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  prevBtn?.addEventListener('click', goPrev);
  nextBtn?.addEventListener('click', goNext);
  repeatBtn?.addEventListener('click', toggleRepeat);
  shuffleBtn?.addEventListener('click', toggleShuffle);

  audio?.addEventListener('loadedmetadata', () => {
    if (duration) duration.textContent = formatTime(audio.duration);
  });

  audio?.addEventListener('timeupdate', () => {
    if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
    if (audio.duration && progress) progress.value = (audio.currentTime / audio.duration) * 100;
  });

  progress?.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (progress.value / 100) * audio.duration;
  });

  audio?.addEventListener('play', setPlayButton);
  audio?.addEventListener('pause', setPlayButton);
  audio?.addEventListener('ended', () => {
    if (repeatOn) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }
    if (shuffleOn) {
      loadTrack(getRandomIndex(), true);
      return;
    }
    loadTrack(currentIndex + 1, true);
  });

  window.addEventListener('load', () => {
    setTimeout(() => loader?.classList.add('hide'), 1050);
  });

  navToggle?.addEventListener('click', () => {
    const open = navLinks?.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(!!open));
    navToggle.innerHTML = open
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-close"></use></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-menu"></use></svg>';
  });

  navLinks?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-menu"></use></svg>';
  }));

  const revealEls = qa('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.16 });
  revealEls.forEach((el) => revealObserver.observe(el));
  qa('#contactGrid .reveal').forEach((el) => revealObserver.observe(el));
  qa('#projectGrid .reveal').forEach((el) => revealObserver.observe(el));

  const sections = qa('section[id]');
  const navAnchors = qa('.nav-links a');
  const scrollSpy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { threshold: 0.48 });
  sections.forEach((s) => scrollSpy.observe(s));

  const lightbox = q('#lightbox');
  const lightboxImg = q('#lightbox-img');
  const closeBtn = q('.lightbox-close');

  const openLightbox = (src) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  q('#zoomBtn')?.addEventListener('click', () => openLightbox('assets/qr.jpg'));
  q('#copyBtn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(cfg.support?.account || '0123456789990');
      const old = q('#copyBtn').innerHTML;
      q('#copyBtn').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-copy"></use></svg>Đã sao chép';
      showToast('Đã sao chép số tài khoản');
      setTimeout(() => { const btn = q('#copyBtn'); if (btn) btn.innerHTML = old; }, 1400);
    } catch {
      showToast('Sao chép thất bại');
    }
  });

  const updateTopButton = () => {
    if (!toTop) return;
    toTop.classList.toggle('show', window.scrollY > 600);
  };
  updateTopButton();

  window.addEventListener('scroll', updateTopButton);
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mouse-x', `${x}%`);
    document.documentElement.style.setProperty('--mouse-y', `${y}%`);
  }, { passive: true });
});
