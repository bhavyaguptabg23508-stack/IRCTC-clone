const tabs = document.querySelectorAll('.tab');
const input = document.getElementById('trackingInput');
const label = document.getElementById('inputLabel');
const hint = document.getElementById('trackingHint');
const result = document.getElementById('trackingResult');

const savedTheme = localStorage.getItem('rail-theme');
if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';
const header = document.querySelector('.site-header');
if (header) {
  const utility = document.createElement('div');
  utility.className = 'irctc-utility';
  utility.innerHTML = '<span>IRCTC Rail Connect</span><span>Indian Railways · Safe, secure & reliable</span><div><a href="help.html">Contact us</a><button type="button" class="theme-toggle" aria-label="Toggle dark mode"><span class="theme-icon">☾</span> Theme</button></div>';
  header.before(utility);
  const themeToggle = utility.querySelector('.theme-toggle');
  const setThemeLabel = () => { themeToggle.querySelector('.theme-icon').textContent = document.documentElement.dataset.theme === 'dark' ? '☀' : '☾'; };
  setThemeLabel();
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    if (isDark) delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = 'dark';
    localStorage.setItem('rail-theme', isDark ? 'light' : 'dark');
    setThemeLabel();
  });
}

tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
  tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
  const isPnr = tab.dataset.mode === 'pnr';
  label.textContent = isPnr ? 'Enter your 10-digit PNR number' : 'Enter train number or name';
  input.placeholder = isPnr ? 'e.g. 284 615 9273' : 'e.g. 12952 or Mumbai Rajdhani';
  input.value = ''; input.inputMode = isPnr ? 'numeric' : 'text';
  hint.textContent = isPnr ? "Try 2846159273 to view this prototype's live status." : 'Try 12952 or Mumbai Rajdhani to view this prototype\'s live status.';
  result.classList.add('hidden');
}));

document.getElementById('trackingForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!input.value.trim()) return;
  result.classList.remove('hidden');
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.getElementById('bookingForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('bookingNote').textContent = 'Train search is ready to connect to your booking inventory.';
});

document.getElementById('refreshStatus')?.addEventListener('click', (event) => {
  event.currentTarget.textContent = 'Updated just now';
  setTimeout(() => { event.currentTarget.textContent = 'Refresh'; }, 2200);
});

document.getElementById('foodForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('foodResults').classList.remove('hidden');
  document.getElementById('foodResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.querySelectorAll('.add-food').forEach((button) => button.addEventListener('click', () => {
  document.getElementById('cartMessage').textContent = `${button.closest('article').querySelector('h3').textContent} added to your order.`;
  button.textContent = 'Added ✓';
  button.disabled = true;
}));
