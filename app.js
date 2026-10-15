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

    const symbols = {
      christmas: ['❄', '✦'],
      'new-year': ['✦', '•'],
      valentines: ['♥', '♡'],
      halloween: ['🎃', '·'],
      easter: ['✿', '·']
    }[holiday.season];
    const layer = document.createElement('div');
    layer.className = 'seasonal-effect';
    layer.setAttribute('aria-hidden', 'true');
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
    document.body.append(layer);
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
