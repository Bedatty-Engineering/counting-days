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
  let selectedEvent = null;

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
    if (month === 11 && day === 24) return { name: 'Christmas Eve', season: 'christmas', description: 'A day of anticipation and gathering before Christmas Day.' };
    if (month === 11 && day === 25) return { name: 'Christmas Day', season: 'christmas', description: 'A Christian celebration of the birth of Jesus Christ.' };
    if (month === 11 && day === 31) return { name: "New Year's Eve", season: 'new-year', description: 'The final day of the year, often marked with celebrations and fireworks.' };
    if (month === 0 && day === 1) return { name: "New Year's Day", season: 'new-year', description: 'The first day of a new calendar year.' };
    if (month === 1 && day === 14) return { name: "Valentine's Day", season: 'valentines', description: 'A celebration of love and affection.' };
    if (month === 9 && day === 31) return { name: 'Halloween', season: 'halloween', description: 'A day for costumes, autumn traditions, and trick-or-treating.' };
    const easter = easterSunday(date.getFullYear());
    if (month === easter.getMonth() && day === easter.getDate()) return { name: 'Easter Sunday', season: 'easter', description: 'A Christian celebration of the resurrection of Jesus Christ.' };
    return null;
  }

  function renderEventView() {
    eventList.replaceChildren();
    if (!selectedEvent) {
      if (eventView.open) eventView.close();
      return;
    }

    eventHeading.textContent = new Intl.DateTimeFormat('en', {
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
      title.textContent = event.name;
      const description = document.createElement('p');
      description.textContent = event.description;
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
    seasonalNote.textContent = holiday.name;
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
    ['christmas', { name: 'Christmas theme preview', season: 'christmas' }],
    ['new-year', { name: 'New Year theme preview', season: 'new-year' }],
    ['valentines', { name: "Valentine's Day theme preview", season: 'valentines' }],
    ['halloween', { name: 'Halloween theme preview', season: 'halloween' }],
    ['easter', { name: 'Easter theme preview', season: 'easter' }]
  ]);
  const requestedPreview = new URLSearchParams(window.location.search).get('preview');
  showSeasonalEffect(previewThemes.get(requestedPreview) || holidayFor(today));

  todayLabel.textContent = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
  const startOfYear = Date.UTC(today.getFullYear(), 0, 1);
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dayNumber = Math.floor((todayUtc - startOfYear) / 86400000) + 1;
  const yearLength = new Date(today.getFullYear(), 1, 29).getDate() === 29 ? 366 : 365;
  dayOfYear.textContent = String(dayNumber).padStart(3, '0');
  document.querySelector('#year-caption').textContent = `${today.getFullYear()} · ${yearLength} days`;
  document.querySelector('#year-progress').style.width = `${dayNumber / yearLength * 100}%`;

  function renderCalendar() {
    monthTitle.textContent = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(displayedMonth);
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
      cell.setAttribute('aria-label', `${new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(date)}${holiday ? `, event: ${holiday.name}` : ''}`);
      if (isCurrent) cell.setAttribute('aria-current', 'date');
      const number = document.createElement(holiday ? 'button' : 'span');
      if (holiday) {
        number.type = 'button';
        number.className = 'day-number event-date';
        number.setAttribute('aria-label', `View event: ${holiday.name}, ${new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(date)}`);
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
      const syncDate = new Date(updatedAt);
      if (!Number.isNaN(syncDate.getTime())) {
        const formattedDate = new Intl.DateTimeFormat('en', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'America/Sao_Paulo'
        }).format(syncDate);
        document.querySelector('#sync-status').textContent = `Last automated update: ${formattedDate}`;
      }
    })
    .catch(() => {});
  renderCalendar();
})();
