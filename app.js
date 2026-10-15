(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthTitle = document.querySelector('#month-title');
  const grid = document.querySelector('#calendar-grid');
  const todayLabel = document.querySelector('#today-date');
  const dayOfYear = document.querySelector('#day-of-year');

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
      cell.className = `day-cell${date.getMonth() !== displayedMonth.getMonth() ? ' outside-month' : ''}${isCurrent ? ' today' : ''}`;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(date));
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
