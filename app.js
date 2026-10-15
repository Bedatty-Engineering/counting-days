(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthTitle = document.querySelector('#month-title');
  const grid = document.querySelector('#calendar-grid');
  const todayLabel = document.querySelector('#today-date');
  const dayOfYear = document.querySelector('#day-of-year');
  const seasonalNote = document.querySelector('#seasonal-note');

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
    if (month === 11 && day === 24) return { name: 'Christmas Eve', season: 'christmas' };
    if (month === 11 && day === 25) return { name: 'Christmas Day', season: 'christmas' };
    if (month === 11 && day === 31) return { name: "New Year's Eve", season: 'new-year' };
    if (month === 0 && day === 1) return { name: "New Year's Day", season: 'new-year' };
    if (month === 1 && day === 14) return { name: "Valentine's Day", season: 'valentines' };
    if (month === 9 && day === 31) return { name: 'Halloween', season: 'halloween' };
    const easter = easterSunday(date.getFullYear());
    if (month === easter.getMonth() && day === easter.getDate()) return { name: 'Easter Sunday', season: 'easter' };
    return null;
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
      if (holiday.season !== 'christmas' && holiday.season !== 'new-year') {
        window.setTimeout(() => layer.remove(), 10000);
      }
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
      lights.src = 'assets/seasonal/christmas-lights.png';
      lights.alt = '';
      lights.addEventListener('error', () => { lights.hidden = true; }, { once: true });
      lights.setAttribute('aria-hidden', 'true');
      layer.append(lights);

      const decorations = document.createElement('div');
      decorations.className = 'christmas-decorations';
      decorations.setAttribute('aria-hidden', 'true');
      [
        ['christmas-decoration tree-decoration tree-decoration-left', 'assets/seasonal/christmas-tree-with-presents.png'],
        ['christmas-decoration presents-decoration presents-decoration-left', 'assets/seasonal/colorful-presents.png'],
        ['christmas-decoration presents-decoration presents-decoration-right', 'assets/seasonal/colorful-presents.png'],
        ['christmas-decoration tree-decoration tree-decoration-right', 'assets/seasonal/christmas-tree-with-presents.png']
      ].forEach(([className, source]) => {
        const decoration = document.createElement('img');
        decoration.className = className;
        decoration.src = source;
        decoration.alt = '';
        decoration.addEventListener('error', () => { decoration.hidden = true; }, { once: true });
        decorations.append(decoration);
      });
      layer.append(decorations);
      mountEffect();
      return;
    }

    if (holiday.season === 'new-year') {
      const colors = ['#ffd166', '#ff5c8a', '#55d6be', '#83aaff', '#ffffff'];
      const burstPositions = [[12, 12], [35, 25], [64, 9], [88, 40], [9, 66], [24, 88], [52, 16], [72, 83], [92, 16], [80, 57]];
      burstPositions.forEach(([x, y], burstIndex) => {
        const burst = document.createElement('div');
        burst.className = 'firework';
        burst.style.setProperty('--x', `${x}%`);
        burst.style.setProperty('--y', `${y}%`);
        const burstDelay = Math.random() * 0.7;
        burst.style.setProperty('--launch-delay', `${burstDelay}s`);
        for (let index = 0; index < 18; index += 1) {
          const spark = document.createElement('i');
          const distance = 62 + Math.random() * 58;
          spark.style.setProperty('--angle', `${index * 20}deg`);
          spark.style.setProperty('--distance', `-${distance}px`);
          spark.style.setProperty('--distance-end', `-${distance * 1.2}px`);
          spark.style.setProperty('--burst-color', colors[(index + burstIndex) % colors.length]);
          spark.style.setProperty('--delay', `${burstDelay + 0.38 + Math.random() * 0.18}s`);
          burst.append(spark);
        }
        layer.append(burst);
      });
      mountEffect();
      return;
    }

    const symbols = {
      valentines: ['♥', '♡'],
      halloween: ['🎃', '·'],
      easter: ['✿', '·']
    }[holiday.season];
    for (let index = 0; index < 24; index += 1) {
      const particle = document.createElement('span');
      particle.className = 'seasonal-particle';
      particle.textContent = symbols[index % symbols.length];
      particle.style.setProperty('--x', `${Math.random() * 100}%`);
      particle.style.setProperty('--drift', `${Math.round(Math.random() * 120 - 60)}px`);
      particle.style.setProperty('--duration', `${8 + Math.random() * 9}s`);
      particle.style.setProperty('--delay', `${Math.random() * -16}s`);
      layer.append(particle);
    }
    mountEffect();
  }

  showSeasonalEffect(holidayFor(today));

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
      cell.className = `day-cell${date.getMonth() !== displayedMonth.getMonth() ? ' outside-month' : ''}${isCurrent ? ' today' : ''}${holiday ? ` holiday holiday-${holiday.season}` : ''}`;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `${new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(date)}${holiday ? `, ${holiday.name}` : ''}`);
      if (isCurrent) cell.setAttribute('aria-current', 'date');
      const number = document.createElement('span');
      number.textContent = String(date.getDate());
      cell.append(number);
      grid.append(cell);
    }
  }

  document.querySelector('#previous-month').addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  document.querySelector('#next-month').addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  document.querySelector('#go-today').addEventListener('click', () => {
    displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
  });
  fetch('data/current-day.json')
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('Calendar data unavailable')))
    .then(({ date }) => {
      const syncDate = new Date(`${date}T00:00:00`);
      if (!Number.isNaN(syncDate.getTime())) {
        document.querySelector('#sync-status').textContent = `Last automated update: ${new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(syncDate)}`;
      }
    })
    .catch(() => {});
  renderCalendar();
})();
