const tabs = document.querySelectorAll('.tab');
const input = document.getElementById('trackingInput');
const label = document.getElementById('inputLabel');
const hint = document.getElementById('trackingHint');
const result = document.getElementById('trackingResult');
const trackingDetailsHeading = document.getElementById('trackingDetailsHeading');
const trackingDetails = document.getElementById('trackingDetails');

function updateTrackingDetails(isPnr) {
  if (!trackingDetailsHeading || !trackingDetails) return;
  trackingDetailsHeading.textContent = isPnr ? 'YOUR TICKET' : 'TRAIN DETAILS';
  trackingDetails.innerHTML = isPnr
    ? '<span>PNR <b>2846159273</b></span><span>Coach & seat <b>B4 · 28 · Side lower</b></span><span>Booking status <b class="confirmed">Confirmed</b></span>'
    : '<span>Train number <b>12952</b></span><span>Service <b>Daily · Superfast</b></span><span>Next stop <b>Ratlam Jn · 22:48</b></span>';
}

function showPlatformChange() {
  const watch = document.getElementById('platformWatch');
  const message = document.getElementById('platformMessage');
  if (!watch || !message) return;
  watch.classList.add('platform-changed');
  message.innerHTML = '<b>Platform changed: Ratlam Jn</b><span>Your train will now arrive at Platform 6, not Platform 4. Please proceed to the updated platform.</span>';
  result.querySelector('.station-timeline li:nth-child(4) small')?.replaceChildren(document.createTextNode('Updated platform 6 · 5 min halt'));
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Platform changed · Mumbai Rajdhani', { body: 'Ratlam Jn: Platform 6 replaces Platform 4.' });
  }
}

function setupPlatformAlerts() {
  if (!result || document.getElementById('platformWatch')) return;
  const liveStrip = result.querySelector('.live-strip');
  liveStrip?.insertAdjacentHTML('afterend', '<section class="platform-watch" id="platformWatch" aria-live="polite"><div class="watch-icon">♧</div><div id="platformMessage"><b>Platform change alerts are ready</b><span>We’ll alert you if the platform for an upcoming stop changes.</span></div><button type="button" class="watch-button" id="enablePlatformAlerts">Enable alerts</button><button type="button" class="demo-link" id="demoPlatformChange">Try demo</button></section>');
  document.getElementById('enablePlatformAlerts')?.addEventListener('click', async (event) => {
    if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
    event.currentTarget.textContent = 'Alerts enabled ✓';
    event.currentTarget.disabled = true;
  });
  document.getElementById('demoPlatformChange')?.addEventListener('click', showPlatformChange);
}

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
  input.value = ''; input.inputMode = isPnr ? 'numeric' : 'text'; input.maxLength = isPnr ? 14 : 40;
  hint.textContent = isPnr ? "Try 2846159273 to view this prototype's live status." : 'Try 12952 or Mumbai Rajdhani to view this prototype\'s live status.';
  updateTrackingDetails(isPnr);
  result.classList.add('hidden');
}));

document.getElementById('trackingForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!input.value.trim()) return;
  result.classList.remove('hidden');
  setupPlatformAlerts();
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.getElementById('bookingForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('bookingNote').textContent = 'Train search is ready to connect to your booking inventory.';
  let results = document.getElementById('trainResults');
  if (!results) {
    results = document.createElement('section');
    results.id = 'trainResults';
    results.className = 'train-results';
    results.innerHTML = '<div class="train-results-head"><div><p class="eyebrow">DEMO SEARCH RESULTS</p><h2>New Delhi → Mumbai Central</h2><p>Thursday, 04 September · 3 trains available</p></div><span>General quota</span></div><article class="train-row"><div class="train-name"><b>12952 · Mumbai Rajdhani</b><span>Daily · Superfast</span></div><div class="train-time"><b>16:55</b><span>New Delhi</span></div><div class="train-duration"><b>15h 40m</b><span>Direct journey</span></div><div class="train-time"><b>08:35</b><span>Mumbai Central</span></div><div class="train-class"><b>3A</b><span>₹ 3,120</span><em>Available 24</em></div><button class="select-train" type="button">Select</button></article><article class="train-row"><div class="train-name"><b>12926 · Paschim Express</b><span>Daily · Superfast</span></div><div class="train-time"><b>17:25</b><span>New Delhi</span></div><div class="train-duration"><b>16h 25m</b><span>1 stop</span></div><div class="train-time"><b>09:50</b><span>Mumbai Central</span></div><div class="train-class"><b>SL</b><span>₹ 685</span><em>Available 89</em></div><button class="select-train" type="button">Select</button></article><article class="train-row"><div class="train-name"><b>22222 · CSMT Rajdhani</b><span>Mon, Wed, Fri · Rajdhani</span></div><div class="train-time"><b>19:55</b><span>New Delhi</span></div><div class="train-duration"><b>15h 50m</b><span>Direct journey</span></div><div class="train-time"><b>11:45</b><span>Mumbai CSMT</span></div><div class="train-class"><b>2A</b><span>₹ 4,280</span><em>Available 12</em></div><button class="select-train" type="button">Select</button></article><p class="booking-selection" id="bookingSelection">Choose a train to continue to passenger details.</p>';
    document.getElementById('bookingForm').closest('.booking-card').after(results);
    results.querySelectorAll('.select-train').forEach((button) => button.addEventListener('click', () => {
      results.querySelectorAll('.select-train').forEach((item) => { item.textContent = 'Select'; item.classList.remove('selected'); });
      button.textContent = 'Selected ✓'; button.classList.add('selected');
      const train = button.closest('.train-row').querySelector('.train-name b').textContent;
      document.getElementById('bookingSelection').textContent = `${train} selected. Continue to passenger details.`;
      renderPassengerStep(train);
    }));
  }
  results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

function bookingStep(title, content) {
  let step = document.getElementById('bookingFlow');
  if (!step) {
    step = document.createElement('section');
    step.id = 'bookingFlow';
    step.className = 'booking-flow';
    document.getElementById('trainResults').after(step);
  }
  step.innerHTML = `<div class="flow-heading"><p class="eyebrow">COMPLETE YOUR BOOKING</p><h2>${title}</h2><div class="flow-steps"><span class="active">1 Train</span><span>2 Passenger</span><span>3 Review</span><span>4 Payment</span></div></div>${content}`;
  step.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return step;
}

function renderPassengerStep(train) {
  const step = bookingStep('Passenger details', `<div class="selected-route"><b>${train}</b><span>New Delhi → Mumbai Central · 04 Sep 2026</span></div><form id="passengerForm" class="passenger-form"><label>Full name<input required value="Aarav Sharma" /></label><label>Age<input required type="number" min="1" max="120" value="28" /></label><label>Gender<select><option>Male</option><option>Female</option><option>Other</option></select></label><label>Berth preference<select><option>Side lower</option><option>Lower</option><option>Upper</option><option>No preference</option></select></label><label class="contact-field">Mobile number<input required inputmode="numeric" value="9876543210" /></label><label class="contact-field">Email for e-ticket<input required type="email" value="aarav@example.com" /></label><div class="flow-actions"><button type="button" class="flow-back" id="backToTrains">Back to trains</button><button class="primary-btn" type="submit">Continue to review →</button></div></form>`);
  step.querySelector('#backToTrains').addEventListener('click', () => { step.remove(); document.getElementById('trainResults').scrollIntoView({ behavior: 'smooth' }); });
  step.querySelector('#passengerForm').addEventListener('submit', (event) => { event.preventDefault(); renderReviewStep(train); });
}

function renderReviewStep(train) {
  const step = bookingStep('Review your booking', `<div class="review-grid"><div><p class="eyebrow">JOURNEY</p><b>${train}</b><span>New Delhi → Mumbai Central</span><span>04 Sep · 16:55 to 08:35</span></div><div><p class="eyebrow">PASSENGER</p><b>Aarav Sharma · 28 years</b><span>Coach preference: Side lower</span><span>Mobile: 9876543210</span></div><div class="fare-box"><p class="eyebrow">FARE BREAKUP</p><span>Base fare <b>₹ 2,940</b></span><span>Reservation charges <b>₹ 60</b></span><span>Travel insurance <b>₹ 20</b></span><strong>Total payable <b>₹ 3,020</b></strong></div></div><label class="consent"><input type="checkbox" required /> I agree to the railway booking terms and cancellation policy.</label><div class="flow-actions"><button type="button" class="flow-back" id="backToPassenger">Edit passenger</button><button class="primary-btn" id="continuePayment" type="button">Proceed to payment →</button></div>`);
  step.querySelector('#backToPassenger').addEventListener('click', () => renderPassengerStep(train));
  step.querySelector('#continuePayment').addEventListener('click', () => {
    if (!step.querySelector('.consent input').checked) { step.querySelector('.consent').classList.add('needs-consent'); return; }
    renderPaymentStep(train);
  });
}

function renderPaymentStep(train) {
  const step = bookingStep('Secure payment', `<div class="payment-layout"><div><p class="eyebrow">PAYMENT METHOD</p><label class="payment-choice"><input type="radio" name="payment" checked /> UPI</label><label class="payment-choice"><input type="radio" name="payment" /> Debit / credit card</label><label class="payment-choice"><input type="radio" name="payment" /> Net banking</label></div><div class="payment-total"><span>Total amount</span><b>₹ 3,020</b><small>Demo payment only · no money will be charged</small></div></div><div class="flow-actions"><button type="button" class="flow-back" id="backToReview">Back to review</button><button class="primary-btn" id="payNow" type="button">Pay ₹ 3,020 →</button></div>`);
  step.querySelector('#backToReview').addEventListener('click', () => renderReviewStep(train));
  step.querySelector('#payNow').addEventListener('click', () => renderConfirmation(train));
}

function renderConfirmation(train) {
  const step = bookingStep('Booking confirmed', `<div class="confirmation"><div class="confirmation-mark">✓</div><h3>Your e-ticket is confirmed</h3><p>Booking ID: <b>RYT-84092716</b> · PNR: <b>2846159273</b></p><div class="ticket-summary"><b>${train}</b><span>New Delhi → Mumbai Central</span><span>04 Sep 2026 · 16:55</span><span>Passenger: Aarav Sharma · Coach B4, Seat 28</span></div><div class="flow-actions"><a class="flow-back" href="trips.html">View my bookings</a><a class="primary-link" href="track.html">Track this train →</a></div></div>`);
  step.querySelector('.flow-steps').innerHTML = '<span class="active">✓ Train selected</span><span class="active">✓ Passenger added</span><span class="active">✓ Payment complete</span>';
}

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
