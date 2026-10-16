(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthTitle = document.querySelector('#month-title');
  const grid = document.querySelector('#calendar-grid');
  const todayLabel = document.querySelector('#today-date');
  const dayOfYear = document.querySelector('#day-of-year');
  const seasonalNote = document.querySelector('#seasonal-note');
  const eventView = document.querySelector('#event-view');
  const eventHeading = document.querySelector('#event-view-heading');
  const eventList = document.querySelector('#event-list');
  const themeToggle = document.querySelector('#theme-toggle');
  const themeIcon = document.querySelector('#theme-icon');
  const themeLabel = document.querySelector('#theme-label');
  const localeByLanguage = { en: 'en', pt: 'pt-BR' };
  const copy = {
    en: {
      title: 'Every Day — an endless calendar', description: 'A calendar that follows every day, with no end date.',
      ongoing: 'ongoing', todayIs: 'Today is', intro: 'One day at a time', headlineFirst: 'Time moves on.', headlineSecond: 'This calendar does too.',
      lede: 'Every day has its place. Keep going; there is no last page.', dayOfYear: 'day of the year',
      calendar: 'Your calendar', today: 'Today', previous: 'Previous month', next: 'Next month', weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      daysOfMonth: 'Days of the month', events: 'Events on this date', closeEvent: 'Close event details', todayLegend: 'today',
      eventLegend: 'event · select date for details', footer: 'No required start. No ending in sight.', byline: 'A calendar by', live: 'Live calendar',
      update: 'Last automated update:', dark: 'Dark mode', light: 'Light mode', language: 'Language', viewEvent: 'View event'
    },
    pt: {
      title: 'Every Day — um calendário sem fim', description: 'Um calendário que acompanha todos os dias, sem data final.',
      ongoing: 'em andamento', todayIs: 'Hoje é', intro: 'Um dia de cada vez', headlineFirst: 'O tempo passa.', headlineSecond: 'Este calendário também.',
      lede: 'Cada dia tem seu lugar. Continue: não existe última página.', dayOfYear: 'dia do ano',
      calendar: 'Seu calendário', today: 'Hoje', previous: 'Mês anterior', next: 'Próximo mês', weekdays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      daysOfMonth: 'Dias do mês', events: 'Eventos nesta data', closeEvent: 'Fechar detalhes do evento', todayLegend: 'hoje',
      eventLegend: 'evento · selecione a data para ver detalhes', footer: 'Sem data de início obrigatória. Sem fim à vista.', byline: 'Um calendário da', live: 'Calendário ativo',
      update: 'Última atualização automática:', dark: 'Tema escuro', light: 'Tema claro', language: 'Idioma', viewEvent: 'Ver evento'
    }
  };
  function storedPreference(key, allowed, fallback) {
    try {
      const value = localStorage.getItem(key);
      return allowed.includes(value) ? value : fallback;
    } catch {
      return fallback;
    }
  }
  let language = storedPreference('counting-days-language', ['en', 'pt'], 'en');
  let theme = storedPreference('counting-days-theme', ['light', 'dark'], 'light');
  let lastSyncDate = null;
  let selectedEvent = null;

  function text(value) {
    return typeof value === 'string' ? value : value[language];
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#121820' : '#f3f5f8';
    const nextThemeCopy = copy[language][theme === 'dark' ? 'light' : 'dark'];
    themeLabel.textContent = nextThemeCopy;
    themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', nextThemeCopy);
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    try { localStorage.setItem('counting-days-theme', theme); } catch { /* Preferences remain usable without storage. */ }
  }

  function applyLanguage() {
    const strings = copy[language];
    const locale = localeByLanguage[language];
    document.documentElement.lang = locale;
    document.title = strings.title;
    document.querySelector('meta[name="description"]').content = strings.description;
    document.querySelector('meta[property="og:description"]').content = strings.description;
    document.querySelector('#ongoing-label').textContent = strings.ongoing;
    document.querySelector('#today-label').textContent = strings.todayIs;
    document.querySelector('#intro-eyebrow').textContent = strings.intro;
    document.querySelector('#headline-first').textContent = strings.headlineFirst;
    document.querySelector('#headline-second').textContent = strings.headlineSecond;
    document.querySelector('#page-lede').textContent = strings.lede;
    document.querySelector('#progress-caption').textContent = strings.dayOfYear;
    document.querySelector('#calendar-panel').setAttribute('aria-label', strings.calendar);
    document.querySelector('#calendar-eyebrow').textContent = strings.calendar;
    document.querySelector('#go-today').textContent = strings.today;
    document.querySelector('#previous-month').setAttribute('aria-label', strings.previous);
    document.querySelector('#next-month').setAttribute('aria-label', strings.next);
    document.querySelector('#weekday-row').replaceChildren(...strings.weekdays.map((day) => {
      const item = document.createElement('span'); item.textContent = day; return item;
    }));
    document.querySelector('#calendar-grid').setAttribute('aria-label', strings.daysOfMonth);
    document.querySelector('#event-view-label').textContent = strings.events;
    document.querySelector('#close-event-view').setAttribute('aria-label', strings.closeEvent);
    document.querySelector('#today-legend').textContent = strings.todayLegend;
    document.querySelector('#event-legend').textContent = strings.eventLegend;
    document.querySelector('#footer-note').textContent = strings.footer;
    document.querySelector('#byline-prefix').textContent = strings.byline;
    document.querySelector('#sync-status').textContent = lastSyncDate ? `${strings.update} ${formatSyncDate(lastSyncDate)}` : strings.live;
    document.querySelector('.language-switch').setAttribute('aria-label', strings.language);
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    try { localStorage.setItem('counting-days-language', language); } catch { /* Preferences remain usable without storage. */ }
    applyTheme();
    updateDateCopy();
    renderCalendar();
    if (selectedEvent) renderEventView();
  }

  function formatSyncDate(date) {
    return new Intl.DateTimeFormat(localeByLanguage[language], {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Sao_Paulo'
    }).format(date);
  }

  function updateDateCopy() {
    const locale = localeByLanguage[language];
    todayLabel.textContent = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
    document.querySelector('#year-caption').textContent = `${today.getFullYear()} · ${yearLength} ${language === 'pt' ? 'dias' : 'days'}`;
    if (lastSyncDate) document.querySelector('#sync-status').textContent = `${copy[language].update} ${formatSyncDate(lastSyncDate)}`;
  }

  function easterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function holidayFor(date) {
    const month = date.getMonth();
    const day = date.getDate();
    if (month === 11 && day === 24) return { name: { en: 'Christmas Eve', pt: 'Véspera de Natal' }, season: 'christmas', description: { en: 'A day of anticipation and gathering before Christmas Day.', pt: 'Um dia de expectativa e encontros antes do Natal.' } };
    if (month === 11 && day === 25) return { name: { en: 'Christmas Day', pt: 'Natal' }, season: 'christmas', description: { en: 'A Christian celebration of the birth of Jesus Christ.', pt: 'Celebração cristã do nascimento de Jesus Cristo.' } };
    if (month === 11 && day === 31) return { name: { en: "New Year's Eve", pt: 'Véspera de Ano-Novo' }, season: 'new-year', description: { en: 'The final day of the year, often marked with celebrations and fireworks.', pt: 'O último dia do ano, geralmente celebrado com festas e fogos de artifício.' } };
    if (month === 0 && day === 1) return { name: { en: "New Year's Day", pt: 'Ano-Novo' }, season: 'new-year', description: { en: 'The first day of a new calendar year.', pt: 'O primeiro dia de um novo ano.' } };
    if (month === 1 && day === 14) return { name: { en: "Valentine's Day", pt: 'Dia de São Valentim' }, season: 'valentines', description: { en: 'A celebration of love and affection.', pt: 'Uma celebração do amor e do afeto.' } };
    if (month === 9 && day === 31) return { name: { en: 'Halloween', pt: 'Halloween' }, season: 'halloween', description: { en: 'A day for costumes, autumn traditions, and trick-or-treating.', pt: 'Um dia de fantasias, tradições de outono e doces ou travessuras.' } };
    const easter = easterSunday(date.getFullYear());
    if (month === easter.getMonth() && day === easter.getDate()) return { name: { en: 'Easter Sunday', pt: 'Domingo de Páscoa' }, season: 'easter', description: { en: 'A Christian celebration of the resurrection of Jesus Christ.', pt: 'Celebração cristã da ressurreição de Jesus Cristo.' } };
    return null;
  }

  function renderEventView() {
    eventList.replaceChildren();
    if (!selectedEvent) {
      if (eventView.open) eventView.close();
      return;
    }

    eventHeading.textContent = new Intl.DateTimeFormat(localeByLanguage[language], {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }).format(selectedEvent.date);
    selectedEvent.events.forEach((event) => {
      const entry = document.createElement('article');
      entry.className = `event-entry event-entry-${event.season}`;
      const marker = document.createElement('span');
      marker.className = 'event-entry-marker';
      marker.setAttribute('aria-hidden', 'true');
      const content = document.createElement('div');
      const title = document.createElement('h4');
      title.textContent = text(event.name);
      const description = document.createElement('p');
      description.textContent = text(event.description);
      content.append(title, description);
      entry.append(marker, content);
      eventList.append(entry);
    });
    if (!eventView.open) eventView.showModal();
  }

  function clearEventView() {
    selectedEvent = null;
    renderEventView();
  }

  function selectEvent(date, event) {
    selectedEvent = { date: new Date(date), events: [event] };
    displayedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    renderCalendar();
    renderEventView();
  }

  function showSeasonalEffect(holiday) {
    if (!holiday) return;
    document.body.dataset.season = holiday.season;
    seasonalNote.textContent = text(holiday.name);
    seasonalNote.hidden = false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = document.createElement('div');
    layer.className = 'seasonal-effect';
    layer.setAttribute('aria-hidden', 'true');
    const mountEffect = () => {
      document.body.append(layer);
    };

    if (holiday.season === 'christmas') {
      for (let index = 0; index < 48; index += 1) {
        const flake = document.createElement('span');
        flake.className = 'seasonal-particle snowflake';
        flake.textContent = '❄';
        flake.style.setProperty('--x', `${Math.random() * 100}%`);
        flake.style.setProperty('--drift', `${Math.round(Math.random() * 150 - 75)}px`);
        flake.style.setProperty('--size', `${12 + Math.random() * 18}px`);
        flake.style.setProperty('--duration', `${7 + Math.random() * 12}s`);
        flake.style.setProperty('--delay', `${Math.random() * -18}s`);
        layer.append(flake);
      }

      const lights = document.createElement('img');
      lights.className = 'christmas-lights';
      lights.src = 'assets/seasonal/christmas-lights-edge-to-edge.png';
      lights.alt = '';
      lights.addEventListener('error', () => { lights.hidden = true; }, { once: true });
      lights.setAttribute('aria-hidden', 'true');
      document.body.append(lights);

      const decorations = document.createElement('div');
      decorations.className = 'christmas-decorations';
      decorations.setAttribute('aria-hidden', 'true');
      [
        ['christmas-decoration tree-decoration tree-decoration-left', 'assets/seasonal/christmas-tree-with-presents.png'],
        ['christmas-decoration tree-decoration tree-decoration-right', 'assets/seasonal/christmas-tree-with-presents.png']
      ].forEach(([className, source]) => {
        const decoration = document.createElement('img');
        decoration.className = className;
        decoration.src = source;
        decoration.alt = '';
        decoration.addEventListener('error', () => { decoration.hidden = true; }, { once: true });
        decorations.append(decoration);
      });
      document.body.append(decorations);
      mountEffect();
      return;
    }

    if (holiday.season === 'new-year') {
      const colors = ['#ffd166', '#ff5c8a', '#55d6be', '#83aaff', '#ffffff'];
      const decorations = document.createElement('div');
      decorations.className = 'new-year-decorations';
      decorations.setAttribute('aria-hidden', 'true');
      ['left', 'right'].forEach((side) => {
        const decoration = document.createElement('img');
        decoration.className = `new-year-decoration new-year-decoration-${side}`;
        decoration.src = 'assets/seasonal/new-year-fireworks-cannon.png';
        decoration.alt = '';
        decoration.addEventListener('error', () => { decoration.hidden = true; }, { once: true });
        decorations.append(decoration);
      });
      document.body.append(decorations);

      const burstPositions = [[8, 18], [26, 32], [44, 13], [63, 27], [82, 16], [94, 36], [16, 39], [36, 22], [72, 39], [55, 10]];
      burstPositions.forEach(([x, y], burstIndex) => {
        const burst = document.createElement('div');
        burst.className = 'firework';
        burst.style.setProperty('--x', `${x}%`);
        burst.style.setProperty('--y', `${y}%`);
        burst.style.setProperty('--travel-distance', `${Math.round(window.innerHeight * (0.9 - y / 100))}px`);
        const burstDelay = Math.random() * 0.7;
        burst.style.setProperty('--launch-delay', `${burstDelay}s`);
        for (let index = 0; index < 18; index += 1) {
          const spark = document.createElement('i');
          const distance = 62 + Math.random() * 58;
          spark.style.setProperty('--angle', `${index * 20}deg`);
          spark.style.setProperty('--distance', `-${distance}px`);
          spark.style.setProperty('--distance-end', `-${distance * 1.2}px`);
          spark.style.setProperty('--burst-color', colors[(index + burstIndex) % colors.length]);
          spark.style.setProperty('--delay', `${burstDelay + 2.05 + Math.random() * 0.18}s`);
          burst.append(spark);
        }
        layer.append(burst);
      });
      mountEffect();
      return;
    }

    const cornerArt = {
      valentines: 'assets/seasonal/valentines-hearts-roses.png',
      halloween: 'assets/seasonal/halloween-pumpkins-cat.png',
      easter: 'assets/seasonal/easter-bunny-eggs.png'
    }[holiday.season];
    const decorations = document.createElement('div');
    decorations.className = `holiday-corner-decorations ${holiday.season}-decorations`;
    decorations.setAttribute('aria-hidden', 'true');
    ['left', 'right'].forEach((side) => {
      const decoration = document.createElement('img');
      decoration.className = `holiday-corner-art holiday-corner-art-${side}`;
      decoration.src = cornerArt;
      decoration.alt = '';
      decoration.addEventListener('error', () => { decoration.hidden = true; }, { once: true });
      decorations.append(decoration);
    });
    if (holiday.season === 'easter') {
      ['left', 'right'].forEach((side) => {
        const cross = document.createElement('span');
        cross.className = `easter-cross easter-cross-${side}`;
        cross.textContent = '✝';
        decorations.append(cross);
      });
    }
    document.body.append(decorations);

    const symbols = {
      valentines: ['♥', '♡', '♥'],
      halloween: ['🦇', '🎃', '✦'],
      easter: ['🥚', '✿', '🦋']
    }[holiday.season];
    const particleCount = { valentines: 28, halloween: 22, easter: 30 }[holiday.season];
    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement('span');
      particle.className = `seasonal-particle ${holiday.season}-particle ${holiday.season}-particle-${index % symbols.length}`;
      particle.textContent = symbols[index % symbols.length];
      particle.style.setProperty('--x', `${Math.random() * 100}%`);
      const drift = Math.round(Math.random() * 120 - 60);
      particle.style.setProperty('--drift', `${drift}px`);
      particle.style.setProperty('--reverse-drift', `${-drift}px`);
      particle.style.setProperty('--y', `${8 + Math.random() * 76}%`);
      particle.style.setProperty('--duration', `${8 + Math.random() * 9}s`);
      particle.style.setProperty('--delay', `${Math.random() * -16}s`);
      layer.append(particle);
    }
    mountEffect();
  }

  const previewThemes = new Map([
    ['christmas', { name: { en: 'Christmas theme preview', pt: 'Prévia do tema de Natal' }, season: 'christmas' }],
    ['new-year', { name: { en: 'New Year theme preview', pt: 'Prévia do tema de Ano-Novo' }, season: 'new-year' }],
    ['valentines', { name: { en: "Valentine's Day theme preview", pt: 'Prévia do tema de São Valentim' }, season: 'valentines' }],
    ['halloween', { name: { en: 'Halloween theme preview', pt: 'Prévia do tema de Halloween' }, season: 'halloween' }],
    ['easter', { name: { en: 'Easter theme preview', pt: 'Prévia do tema de Páscoa' }, season: 'easter' }]
  ]);
  const requestedPreview = new URLSearchParams(window.location.search).get('preview');
  showSeasonalEffect(previewThemes.get(requestedPreview) || holidayFor(today));

  todayLabel.textContent = new Intl.DateTimeFormat(localeByLanguage[language], { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
  const startOfYear = Date.UTC(today.getFullYear(), 0, 1);
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dayNumber = Math.floor((todayUtc - startOfYear) / 86400000) + 1;
  const yearLength = new Date(today.getFullYear(), 1, 29).getDate() === 29 ? 366 : 365;
  dayOfYear.textContent = String(dayNumber).padStart(3, '0');
  document.querySelector('#year-caption').textContent = `${today.getFullYear()} · ${yearLength} ${language === 'pt' ? 'dias' : 'days'}`;
  document.querySelector('#year-progress').style.width = `${dayNumber / yearLength * 100}%`;

  function renderCalendar() {
    const locale = localeByLanguage[language];
    monthTitle.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(displayedMonth);
    grid.replaceChildren();
    const first = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - mondayOffset);
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const cell = document.createElement('div');
      const isCurrent = date.getTime() === today.getTime();
      const holiday = holidayFor(date);
      const isSelectedEvent = selectedEvent && date.getTime() === selectedEvent.date.getTime();
      cell.className = `day-cell${date.getMonth() !== displayedMonth.getMonth() ? ' outside-month' : ''}${isCurrent ? ' today' : ''}${holiday ? ` holiday holiday-${holiday.season}` : ''}${isSelectedEvent ? ' selected-event' : ''}`;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `${new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date)}${holiday ? `, ${copy[language].eventLegend.split(' ·')[0]}: ${text(holiday.name)}` : ''}`);
      if (isCurrent) cell.setAttribute('aria-current', 'date');
      const number = document.createElement(holiday ? 'button' : 'span');
      if (holiday) {
        number.type = 'button';
        number.className = 'day-number event-date';
        number.setAttribute('aria-label', `${copy[language].viewEvent}: ${text(holiday.name)}, ${new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date)}`);
        number.setAttribute('aria-controls', 'event-view');
        number.setAttribute('aria-expanded', isSelectedEvent ? 'true' : 'false');
        number.dataset.date = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        number.addEventListener('click', () => selectEvent(date, holiday));
      }
      number.textContent = String(date.getDate());
      if (!holiday) number.className = 'day-number';
      cell.append(number);
      grid.append(cell);
    }
  }

  document.querySelector('#previous-month').addEventListener('click', () => {
    clearEventView();
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  document.querySelector('#next-month').addEventListener('click', () => {
    clearEventView();
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  document.querySelector('#go-today').addEventListener('click', () => {
    clearEventView();
    displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
  });
  document.querySelector('#close-event-view').addEventListener('click', () => {
    eventView.close();
  });
  themeToggle.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    applyTheme();
  });
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => {
      language = button.dataset.language;
      applyLanguage();
    });
  });
  eventView.addEventListener('close', () => {
    if (!selectedEvent) return;
    selectedEvent = null;
    renderCalendar();
  });
  eventView.addEventListener('click', (event) => {
    const bounds = eventView.getBoundingClientRect();
    const clickedInside = event.clientX >= bounds.left && event.clientX <= bounds.right
      && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!clickedInside) eventView.close();
  });
  fetch('data/current-day.json')
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('Calendar data unavailable')))
    .then(({ updatedAt }) => {
      lastSyncDate = new Date(updatedAt);
      if (!Number.isNaN(lastSyncDate.getTime())) updateDateCopy();
    })
    .catch(() => {});
  applyLanguage();
})();
