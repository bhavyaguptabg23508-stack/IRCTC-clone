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
  setupArrivalReminder();
}

function setupArrivalReminder() {
  const reminderBtn = document.getElementById('setArrivalReminderBtn');
  const alertBox = document.getElementById('travelAlertBox');
  if (!reminderBtn) return;

  let savedReminder = null;
  try {
    savedReminder = JSON.parse(localStorage.getItem('rail_arrival_reminder'));
  } catch (e) {}

  const updateReminderUI = (rem) => {
    if (rem && rem.active) {
      reminderBtn.classList.add('active-reminder');
      reminderBtn.innerHTML = `🔔 Reminder set: ${rem.stationName} (${rem.minutes}m prior) <span style="text-decoration:underline; margin-left:4px;">Edit ✎</span>`;
      if (alertBox) {
        alertBox.className = 'alert reminder-active';
        alertBox.innerHTML = `<b>🔔</b><span>Wake-up alarm active: Alert at ${rem.alertTime} (${rem.minutes} min before ${rem.stationName}).</span>`;
      }
    } else {
      reminderBtn.classList.remove('active-reminder');
      reminderBtn.innerHTML = `Set arrival reminder →`;
      if (alertBox) {
        alertBox.className = 'alert';
        alertBox.innerHTML = `<b>✓</b><span>No disruptions reported on this route.</span>`;
      }
    }
  };

  if (savedReminder) updateReminderUI(savedReminder);

  // Avoid duplicate listeners
  if (reminderBtn.dataset.bound) return;
  reminderBtn.dataset.bound = 'true';

  reminderBtn.addEventListener('click', () => {
    const currentRem = savedReminder || {
      station: 'MMCT',
      stationName: 'Mumbai Central (MMCT)',
      arrTime: '08:35 AM',
      alertTime: '08:05 AM',
      minutes: 30,
      push: true,
      whatsapp: true,
      alarm: true,
      active: true
    };

    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.innerHTML = `
      <div class="modal-content auth-modal-card">
        <div class="auth-modal-head" style="background: linear-gradient(135deg, #173267 0%, #20448c 100%);">
          <div class="auth-brand-badge">
            <span style="font-size:24px;">⏰</span>
            <div>
              <h3 style="color:#ffd94f;">Station Arrival Reminder</h3>
              <p>Live wake-up call & arrival notifications</p>
            </div>
          </div>
          <button type="button" class="close-modal" id="closeReminderModalBtn">✕</button>
        </div>

        <div style="padding:20px 22px;">
          <form id="arrivalReminderForm">
            <div class="form-group" style="margin-bottom:14px;">
              <label style="display:block; font-size:11px; font-weight:700; color:var(--muted); margin-bottom:5px;">Select Destination Station</label>
              <select id="reminderStationSelect" style="width:100%; min-height:40px; border-radius:6px; border:1px solid var(--line); padding:0 10px; font-family:inherit; background:var(--paper); color:var(--ink);">
                <option value="MMCT" data-name="Mumbai Central" data-time="08:35 AM" ${currentRem.station === 'MMCT' ? 'selected' : ''}>Mumbai Central (MMCT) — 08:35 AM (Final Destination)</option>
                <option value="BRC" data-name="Vadodara Jn" data-time="01:16 AM" ${currentRem.station === 'BRC' ? 'selected' : ''}>Vadodara Jn (BRC) — 01:16 AM</option>
                <option value="RTM" data-name="Ratlam Jn" data-time="22:48 PM" ${currentRem.station === 'RTM' ? 'selected' : ''}>Ratlam Jn (RTM) — 22:48 PM</option>
                <option value="KOTA" data-name="Kota Jn" data-time="20:22 PM" ${currentRem.station === 'KOTA' ? 'selected' : ''}>Kota Jn (KOTA) — 20:22 PM</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label style="display:block; font-size:11px; font-weight:700; color:var(--muted); margin-bottom:5px;">Alert Timing (Before Station Arrival)</label>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <label class="radio-pill-card ${currentRem.minutes === 15 ? 'selected' : ''}">
                  <input type="radio" name="reminderMinutes" value="15" ${currentRem.minutes === 15 ? 'checked' : ''} />
                  <span>⏱ 15 mins prior</span>
                </label>
                <label class="radio-pill-card ${currentRem.minutes === 30 ? 'selected' : ''}">
                  <input type="radio" name="reminderMinutes" value="30" ${currentRem.minutes === 30 ? 'checked' : ''} />
                  <span>⏱ 30 mins (Recommended)</span>
                </label>
                <label class="radio-pill-card ${currentRem.minutes === 45 ? 'selected' : ''}">
                  <input type="radio" name="reminderMinutes" value="45" ${currentRem.minutes === 45 ? 'checked' : ''} />
                  <span>⏱ 45 mins prior</span>
                </label>
                <label class="radio-pill-card ${currentRem.minutes === 60 ? 'selected' : ''}">
                  <input type="radio" name="reminderMinutes" value="60" ${currentRem.minutes === 60 ? 'checked' : ''} />
                  <span>⏱ 1 hr prior</span>
                </label>
              </div>
            </div>

            <div style="margin-bottom:18px; padding:12px; background:var(--paper); border:1px solid var(--line); border-radius:8px; font-size:12px;">
              <b style="color:var(--deep); display:block; margin-bottom:8px;">Notification Channels:</b>
              <label style="display:flex; align-items:center; gap:8px; margin-bottom:6px; cursor:pointer;">
                <input type="checkbox" id="reminderPushCheck" checked />
                <span>🔔 Browser Push Notification (Popup Alert)</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; margin-bottom:6px; cursor:pointer;">
                <input type="checkbox" id="reminderWaCheck" checked />
                <span>💬 WhatsApp Alert (+91 ${window.railAuth?.currentUser?.mobile || '9876543210'})</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="reminderSoundCheck" checked />
                <span>🔊 Station Wake-Up Alarm Tone</span>
              </label>
            </div>

            <div style="display:flex; gap:10px;">
              <button type="submit" class="primary-btn" style="flex:1; justify-content:center;">
                Save & Activate Reminder 🔔
              </button>
              ${savedReminder?.active ? `
                <button type="button" class="flow-back" id="turnOffReminderBtn" style="color:#c92a2a; border-color:#f5c2c2;">
                  Turn Off
                </button>
              ` : ''}
            </div>

            <button type="button" class="demo-link" id="testReminderChimeBtn" style="display:block; width:100%; text-align:center; margin-top:12px; font-size:11px; color:#174998; background:none; border:none; cursor:pointer; font-weight:700;">
              ⚡ Test Alarm Notification Demo
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('.radio-pill-card').forEach((card) => {
      card.addEventListener('click', () => {
        modal.querySelectorAll('.radio-pill-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    modal.querySelector('#closeReminderModalBtn')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelector('#testReminderChimeBtn')?.addEventListener('click', async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ RailYatri Station Arrival Alert', {
          body: 'Approaching Mumbai Central (MMCT) in 30 minutes. Expected arrival: 08:35 AM.',
          icon: 'favicon.ico'
        });
      }
      showToast('🔔 [ALARM DEMO]: Approaching Mumbai Central in 30 mins (08:35 AM). Time to prepare your luggage!');
    });

    modal.querySelector('#turnOffReminderBtn')?.addEventListener('click', () => {
      savedReminder = null;
      localStorage.removeItem('rail_arrival_reminder');
      updateReminderUI(null);
      modal.remove();
      showToast('Arrival reminder turned off.');
    });

    modal.querySelector('#arrivalReminderForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const stationSelect = document.getElementById('reminderStationSelect');
      const selectedOption = stationSelect.options[stationSelect.selectedIndex];
      const stationCode = stationSelect.value;
      const stationName = selectedOption.dataset.name;
      const arrTime = selectedOption.dataset.time;
      const minutes = parseInt(modal.querySelector('input[name="reminderMinutes"]:checked')?.value || '30', 10);

      let alertTime = '08:05 AM';
      if (stationCode === 'MMCT') alertTime = minutes === 15 ? '08:20 AM' : (minutes === 30 ? '08:05 AM' : (minutes === 45 ? '07:50 AM' : '07:35 AM'));
      else if (stationCode === 'BRC') alertTime = minutes === 15 ? '01:01 AM' : (minutes === 30 ? '00:46 AM' : (minutes === 45 ? '00:31 AM' : '00:16 AM'));
      else if (stationCode === 'RTM') alertTime = minutes === 15 ? '22:33 PM' : (minutes === 30 ? '22:18 PM' : (minutes === 45 ? '22:03 PM' : '21:48 PM'));
      else if (stationCode === 'KOTA') alertTime = minutes === 15 ? '20:07 PM' : (minutes === 30 ? '19:52 PM' : (minutes === 45 ? '19:37 PM' : '19:22 PM'));

      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      savedReminder = {
        station: stationCode,
        stationName,
        arrTime,
        alertTime,
        minutes,
        push: document.getElementById('reminderPushCheck')?.checked ?? true,
        whatsapp: document.getElementById('reminderWaCheck')?.checked ?? true,
        alarm: document.getElementById('reminderSoundCheck')?.checked ?? true,
        active: true
      };

      localStorage.setItem('rail_arrival_reminder', JSON.stringify(savedReminder));
      updateReminderUI(savedReminder);
      modal.remove();

      showToast(`⏰ Arrival reminder activated for ${stationName} (${minutes}m prior at ${alertTime})!`);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupArrivalReminder();
});


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

function updateTrackingForTrain(trainQuery) {
  if (!result) return;
  const q = trainQuery.toLowerCase();
  const headingEl = result.querySelector('.result-head h3');
  const routeEl = result.querySelector('.result-head p');
  const detailsEl = document.getElementById('trackingDetails');
  const detailsHead = document.getElementById('trackingDetailsHeading');
  if (detailsHead) detailsHead.textContent = 'TRAIN DETAILS';

  if (q.includes('12926') || q.includes('paschim')) {
    if (headingEl) headingEl.textContent = '12926 · Paschim Express';
    if (routeEl) routeEl.innerHTML = 'New Delhi <span>→</span> Mumbai Central';
    if (detailsEl) detailsEl.innerHTML = '<span>Train number <b>12926</b></span><span>Service <b>Daily · Superfast</b></span><span>Next stop <b>Mathura Jn · 18:48</b></span>';
  } else if (q.includes('22222') || q.includes('csmt')) {
    if (headingEl) headingEl.textContent = '22222 · CSMT Rajdhani';
    if (routeEl) routeEl.innerHTML = 'New Delhi <span>→</span> Mumbai CSMT';
    if (detailsEl) detailsEl.innerHTML = '<span>Train number <b>22222</b></span><span>Service <b>Mon, Wed, Fri · Special</b></span><span>Next stop <b>Ratlam Jn · 22:48</b></span>';
  } else {
    if (headingEl) headingEl.textContent = (trainQuery.match(/^\d+$/) ? `${trainQuery} · Express` : trainQuery);
    if (routeEl) routeEl.innerHTML = 'New Delhi <span>→</span> Mumbai Central';
    if (detailsEl) detailsEl.innerHTML = `<span>Train <b>${trainQuery}</b></span><span>Service <b>Daily · Superfast</b></span><span>Next stop <b>Ratlam Jn · 22:48</b></span>`;
  }
}

tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
  tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
  const isPnr = tab.dataset.mode === 'pnr';
  label.textContent = isPnr ? 'Enter your 10-digit PNR number' : 'Enter train number or name';
  input.placeholder = isPnr ? 'e.g. 284 615 9273' : 'e.g. 12952 or Mumbai Rajdhani';
  input.value = ''; input.inputMode = isPnr ? 'numeric' : 'text'; input.maxLength = isPnr ? 14 : 40;
  hint.innerHTML = isPnr ? "Try <b>2846159273</b> to view this prototype's live status." : 'Try <b>12952</b> or <b>Mumbai Rajdhani</b> to view this prototype\'s live status.';
  updateTrackingDetails(isPnr);
  result.classList.add('hidden');
}));

document.getElementById('trackingForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const rawVal = input.value.trim();
  if (!rawVal) return;

  const activeTab = document.querySelector('.tracker-tabs .tab.active');
  const isPnrMode = activeTab ? activeTab.dataset.mode === 'pnr' : false;
  const cleanedDigits = rawVal.replace(/\D/g, '');

  if (!isPnrMode) {
    // Mode: Train Number / Name
    // Reject 10-digit PNR numbers in the Train Name section
    if (cleanedDigits.length >= 10 || (cleanedDigits.length >= 6 && !/[a-zA-Z]/.test(rawVal))) {
      hint.innerHTML = `<span style="color:#c93b2b; font-weight:700;">⚠️ You entered a PNR number ("${rawVal}") in the Train Name section. Please click on the "Track by PNR" tab above to track by PNR, or enter a valid Train Number (e.g. 12952) / Train Name (e.g. Mumbai Rajdhani).</span>`;
      showToast('Invalid: Please use the "Track by PNR" tab for 10-digit PNRs.');
      result.classList.add('hidden');
      return;
    }

    hint.innerHTML = `Showing live tracking for <b>${rawVal}</b>.`;
    updateTrackingForTrain(rawVal);
    result.classList.remove('hidden');
    setupPlatformAlerts();
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    // Mode: Track by PNR
    if (cleanedDigits.length < 10 || /[a-zA-Z]/.test(rawVal)) {
      hint.innerHTML = `<span style="color:#c93b2b; font-weight:700;">⚠️ Invalid PNR format. PNR must be a 10-digit numeric number (e.g. 2846159273). To search by Train Name or Number, click on the "Train number / name" tab above.</span>`;
      showToast('PNR must be a 10-digit number.');
      result.classList.add('hidden');
      return;
    }

    hint.innerHTML = `Showing live tracking for PNR <b>${cleanedDigits}</b>.`;
    updateTrackingDetails(true);
    result.classList.remove('hidden');
    setupPlatformAlerts();
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

// ==========================================================================
// DEDICATED PNR STATUS INQUIRY HANDLER
// ==========================================================================

const pnrForm = document.getElementById('pnrInquiryForm');
const pnrInput = document.getElementById('pnrNumberInput');
const pnrCard = document.getElementById('pnrStatusCard');
const displayPnr = document.getElementById('displayPnrNumber');

pnrForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const val = pnrInput.value.replace(/\D/g, '');
  if (val.length < 5) {
    showToast('Please enter a valid 10-digit PNR number.');
    return;
  }
  if (displayPnr) displayPnr.textContent = val || '2846159273';
  if (pnrCard) {
    pnrCard.classList.remove('hidden');
    pnrCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  showToast(`PNR status retrieved successfully for ${val || '2846159273'}`);
});

document.getElementById('pnrCopyActionBtn')?.addEventListener('click', () => {
  const pnrVal = document.getElementById('displayPnrNumber')?.textContent || '2846159273';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(pnrVal);
    showToast(`PNR ${pnrVal} copied to clipboard!`);
  } else {
    showToast(`PNR: ${pnrVal}`);
  }
});

document.getElementById('pnrPrintBtn')?.addEventListener('click', () => {
  window.print();
});

document.getElementById('pnrShareWaBtn')?.addEventListener('click', () => {
  const pnrVal = document.getElementById('displayPnrNumber')?.textContent || '2846159273';
  const text = encodeURIComponent(`IRCTC PNR Status:\nPNR: ${pnrVal}\nTrain: 12952 Mumbai Rajdhani\nStatus: CNF / Confirmed (Coach B4, Seat 28)\nDate: 04 Sep 2026`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
});

document.getElementById('pnrCancelRuleBtn')?.addEventListener('click', () => {
  const modal = document.createElement('div');
  modal.className = 'payment-processing-overlay';
  modal.innerHTML = `
    <div class="processing-card" style="text-align:left; max-width:480px;">
      <h3 style="margin-top:0; color:var(--deep);">IRCTC Cancellation & Refund Rules</h3>
      <div style="font-size:12px; color:var(--muted); line-height:1.6; margin:12px 0 16px;">
        <p style="margin:0 0 8px;">• <b>> 48 hours before departure:</b> Flat cancellation charge (₹240 for 1A/EC, ₹200 for 2A/1C, ₹180 for 3A/CC, ₹120 for SL).</p>
        <p style="margin:0 0 8px;">• <b>12 to 48 hours before departure:</b> 25% of ticket fare subject to minimum flat charge.</p>
        <p style="margin:0 0 8px;">• <b>< 12 hours up to 4 hrs before chart:</b> 50% of ticket fare subject to minimum flat charge.</p>
        <p style="margin:0 0 8px;">• <b>After Chart preparation:</b> No refund for confirmed tickets as per railway rules.</p>
      </div>
      <button type="button" class="primary-btn" id="closePnrRuleModal" style="width:100%; justify-content:center;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#closePnrRuleModal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
});

// ==========================================================================
// PROFESSIONAL BOOKING FLOW, PASSENGER DETAILS & PAYMENT GATEWAY ENGINE
// ==========================================================================

let bookingState = {
  train: {
    number: '12952',
    name: 'Mumbai Rajdhani Express',
    type: 'Daily · Superfast',
    from: 'New Delhi (NDLS)',
    to: 'Mumbai Central (MMCT)',
    depTime: '16:55',
    arrTime: '08:35',
    date: '04 Sep 2026',
    duration: '15h 40m',
    cls: '3A',
    clsName: 'AC 3 Tier',
    basePrice: 3120,
    quota: 'General Quota',
    available: 24
  },
  passengers: [
    {
      id: 1,
      name: 'Aarav Sharma',
      age: 28,
      gender: 'Male',
      berth: 'Side Lower',
      meal: 'Veg Thali',
      isChild: false
    }
  ],
  irctcUser: 'aarav_rail99',
  irctcVerified: true,
  contact: {
    mobile: '9876543210',
    email: 'aarav.sharma@example.com',
    whatsapp: true
  },
  preferences: {
    insurance: true, // ₹0.45 per passenger
    freeCancellation: false, // ₹149 per passenger
    autoUpgrade: true,
    confirmOnly: true
  },
  coupon: {
    code: '',
    discount: 0,
    applied: false
  },
  payment: {
    tab: 'upi',
    upiMode: 'qr',
    upiId: '',
    selectedBank: 'sbi',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    saveCard: true,
    wallet: 'amazonpay'
  },
  timerSeconds: 599,
  timerInterval: null
};

function syncBookingStateWithAuth() {
  const activeUser = window.railAuth?.currentUser || (localStorage.getItem('rail_active_user') ? JSON.parse(localStorage.getItem('rail_active_user')) : null);
  if (activeUser) {
    bookingState.irctcUser = activeUser.irctcUser || 'aarav_rail99';
    bookingState.contact.mobile = activeUser.mobile || '9876543210';
    bookingState.contact.email = activeUser.email || 'aarav.sharma@example.com';
    if (bookingState.passengers.length > 0 && (!bookingState.passengers[0].name || bookingState.passengers[0].name === 'Aarav Sharma' || bookingState.passengers[0].name === 'Priya Sharma' || bookingState.passengers[0].name === 'Ramesh Sharma')) {
      bookingState.passengers[0].name = activeUser.name;
      bookingState.passengers[0].age = activeUser.age;
      bookingState.passengers[0].gender = activeUser.gender;
    }
  }
}
window.addEventListener('railAuthChanged', () => {
  syncBookingStateWithAuth();
  if (document.getElementById('passengerMasterForm')) {
    renderPassengerStep();
  }
});
syncBookingStateWithAuth();

function showToast(message) {
  const existing = document.querySelector('.toast-notice');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function startSessionTimer() {
  if (bookingState.timerInterval) clearInterval(bookingState.timerInterval);
  bookingState.timerSeconds = 599;
  bookingState.timerInterval = setInterval(() => {
    if (bookingState.timerSeconds > 0) {
      bookingState.timerSeconds--;
      const min = Math.floor(bookingState.timerSeconds / 60);
      const sec = bookingState.timerSeconds % 60;
      const el = document.getElementById('sessionTimerDisplay');
      if (el) el.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    } else {
      clearInterval(bookingState.timerInterval);
    }
  }, 1000);
}

function calculateFare() {
  const paxCount = bookingState.passengers.length;
  const baseFareTotal = bookingState.train.basePrice * paxCount;
  
  let mealTotal = 0;
  bookingState.passengers.forEach((p) => {
    if (p.meal && p.meal !== 'No Food') mealTotal += 180;
  });

  const reservationCharges = 60 * paxCount;
  const insuranceCharges = bookingState.preferences.insurance ? Math.round(0.45 * paxCount) : 0;
  const freeCancelCharges = bookingState.preferences.freeCancellation ? (149 * paxCount) : 0;
  const irctcConvenienceFee = 18; // ₹15 + GST
  const subtotal = baseFareTotal + mealTotal + reservationCharges + insuranceCharges + freeCancelCharges + irctcConvenienceFee;
  const discount = bookingState.coupon.applied ? bookingState.coupon.discount : 0;
  const totalPayable = Math.max(0, subtotal - discount);

  return {
    paxCount,
    baseFareTotal,
    mealTotal,
    reservationCharges,
    insuranceCharges,
    freeCancelCharges,
    irctcConvenienceFee,
    subtotal,
    discount,
    totalPayable
  };
}

function initBookingFlow(stepKey) {
  let flowEl = document.getElementById('bookingFlow');
  if (!flowEl) {
    flowEl = document.createElement('section');
    flowEl.id = 'bookingFlow';
    flowEl.className = 'booking-flow';
    document.getElementById('trainResults').after(flowEl);
  }
  startSessionTimer();
  return flowEl;
}

function getHeaderHTML(activeStep, title) {
  const steps = [
    { num: 1, label: 'Train Selected', key: 'train' },
    { num: 2, label: 'Passenger Details', key: 'passenger' },
    { num: 3, label: 'Review Booking', key: 'review' },
    { num: 4, label: 'Payment Gateway', key: 'payment' },
    { num: 5, label: 'Confirmation', key: 'confirm' }
  ];

  const stepsHTML = steps.map((s, idx) => {
    const stepIdx = idx + 1;
    let cls = 'flow-step';
    let icon = s.num;
    if (stepIdx < activeStep) {
      cls += ' completed';
      icon = '✓';
    } else if (stepIdx === activeStep) {
      cls += ' active';
    }
    return `<div class="${cls}"><span class="step-circle">${icon}</span><span>${s.label}</span></div>`;
  }).join('');

  const min = Math.floor(bookingState.timerSeconds / 60);
  const sec = bookingState.timerSeconds % 60;
  const timerStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  return `
    <div class="flow-heading">
      <p class="eyebrow">IRCTC E-TICKETING RESERVATION</p>
      <h2>${title}</h2>
      <div class="flow-steps">${stepsHTML}</div>
    </div>
    <div class="session-timer-bar">
      <span><span class="timer-pulse"></span> Seat inventory locked for this booking session</span>
      <span class="timer-pill">⏱ <span id="sessionTimerDisplay">${timerStr}</span></span>
    </div>
    <div class="selected-train-banner">
      <div class="train-main-info">
        <div class="train-icon-badge">🚆</div>
        <div class="train-title-block">
          <h3>${bookingState.train.number} · ${bookingState.train.name}</h3>
          <p>${bookingState.train.from} (${bookingState.train.depTime}) → ${bookingState.train.to} (${bookingState.train.arrTime}) · ${bookingState.train.date}</p>
        </div>
      </div>
      <div class="train-meta-tags">
        <span class="badge-tag badge-blue">${bookingState.train.cls} (${bookingState.train.clsName})</span>
        <span class="badge-tag badge-green">${bookingState.train.quota}</span>
        <span class="badge-tag badge-orange">₹ ${bookingState.train.basePrice} / seat</span>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// STEP 1: Search Trains Form Trigger
// --------------------------------------------------------------------------
document.getElementById('bookingForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('bookingNote').textContent = 'Live trains retrieved. Select your train to continue.';
  let results = document.getElementById('trainResults');
  if (!results) {
    results = document.createElement('section');
    results.id = 'trainResults';
    results.className = 'train-results';
    results.innerHTML = `
      <div class="train-results-head">
        <div>
          <p class="eyebrow">AVAILABLE TRAINS (DEMO INVENTORY)</p>
          <h2>New Delhi (NDLS) → Mumbai Central (MMCT)</h2>
          <p>Thursday, 04 September 2026 · 3 express trains found</p>
        </div>
        <span>General quota</span>
      </div>
      <article class="train-row" data-num="12952" data-name="Mumbai Rajdhani Express" data-cls="3A" data-clsname="AC 3 Tier" data-price="3120" data-dep="16:55" data-arr="08:35" data-dur="15h 40m" data-avail="24">
        <div class="train-name"><b>12952 · Mumbai Rajdhani</b><span>Daily · Superfast Premium</span></div>
        <div class="train-time"><b>16:55</b><span>New Delhi (NDLS)</span></div>
        <div class="train-duration"><b>15h 40m</b><span>Direct · 5 halts</span></div>
        <div class="train-time"><b>08:35</b><span>Mumbai Central (MMCT)</span></div>
        <div class="train-class"><b>3A</b><span>₹ 3,120</span><em>Available 24</em></div>
        <button class="select-train" type="button">Select Train</button>
      </article>
      <article class="train-row" data-num="12926" data-name="Paschim Superfast Express" data-cls="SL" data-clsname="Sleeper Class" data-price="685" data-dep="17:25" data-arr="09:50" data-dur="16h 25m" data-avail="89">
        <div class="train-name"><b>12926 · Paschim Express</b><span>Daily · Superfast</span></div>
        <div class="train-time"><b>17:25</b><span>New Delhi (NDLS)</span></div>
        <div class="train-duration"><b>16h 25m</b><span>Direct · 12 halts</span></div>
        <div class="train-time"><b>09:50</b><span>Mumbai Central (MMCT)</span></div>
        <div class="train-class"><b>SL</b><span>₹ 685</span><em>Available 89</em></div>
        <button class="select-train" type="button">Select Train</button>
      </article>
      <article class="train-row" data-num="22222" data-name="CSMT Rajdhani Express" data-cls="2A" data-clsname="AC 2 Tier" data-price="4280" data-dep="19:55" data-arr="11:45" data-dur="15h 50m" data-avail="12">
        <div class="train-name"><b>22222 · CSMT Rajdhani</b><span>Mon, Wed, Fri · Special</span></div>
        <div class="train-time"><b>19:55</b><span>New Delhi (NDLS)</span></div>
        <div class="train-duration"><b>15h 50m</b><span>Direct · 4 halts</span></div>
        <div class="train-time"><b>11:45</b><span>Mumbai CSMT</span></div>
        <div class="train-class"><b>2A</b><span>₹ 4,280</span><em>Available 12</em></div>
        <button class="select-train" type="button">Select Train</button>
      </article>
      <p class="booking-selection" id="bookingSelection">Please select a train to proceed with passenger reservation.</p>
    `;
    document.getElementById('bookingForm').closest('.booking-card').after(results);
    
    results.querySelectorAll('.select-train').forEach((button) => button.addEventListener('click', () => {
      results.querySelectorAll('.select-train').forEach((item) => { item.textContent = 'Select Train'; item.classList.remove('selected'); });
      button.textContent = 'Selected ✓';
      button.classList.add('selected');
      const row = button.closest('.train-row');
      bookingState.train = {
        number: row.dataset.num,
        name: row.dataset.name,
        type: 'Daily · Superfast',
        from: 'New Delhi (NDLS)',
        to: row.dataset.arr === '11:45' ? 'Mumbai CSMT' : 'Mumbai Central (MMCT)',
        depTime: row.dataset.dep,
        arrTime: row.dataset.arr,
        date: '04 Sep 2026',
        duration: row.dataset.dur,
        cls: row.dataset.cls,
        clsName: row.dataset.clsname,
        basePrice: parseInt(row.dataset.price, 10),
        quota: 'General Quota',
        available: parseInt(row.dataset.avail, 10)
      };
      document.getElementById('bookingSelection').textContent = `${bookingState.train.number} ${bookingState.train.name} selected. Proceeding to passenger details.`;
      renderPassengerStep();
    }));
  }
  results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// --------------------------------------------------------------------------
// STEP 2: Enhanced Passenger Details
// --------------------------------------------------------------------------
function renderPassengerStep() {
  const container = initBookingFlow('passenger');
  
  const savedTravelers = [
    { name: 'Aarav Sharma', age: 28, gender: 'Male', berth: 'Side Lower', meal: 'Veg Thali' },
    { name: 'Priya Sharma', age: 26, gender: 'Female', berth: 'Lower', meal: 'Veg Thali' },
    { name: 'Ramesh Sharma', age: 62, gender: 'Male', berth: 'Lower', meal: 'Jain Meal' }
  ];

  let paxCardsHTML = bookingState.passengers.map((pax, index) => {
    return `
      <div class="passenger-card" data-pax-id="${pax.id}">
        <div class="passenger-card-header">
          <h4>
            <span class="passenger-badge-num">${index + 1}</span>
            <span>Passenger ${index + 1} ${pax.isChild ? '(Child · No Berth)' : '(Adult)'}</span>
            ${pax.age >= 60 ? '<span class="badge-tag badge-orange">Senior Citizen (60+)</span>' : ''}
          </h4>
          ${bookingState.passengers.length > 1 ? `<button type="button" class="remove-pax-btn" data-id="${pax.id}">✕ Remove</button>` : ''}
        </div>
        
        <div class="form-grid-3">
          <div class="form-group">
            <label>Full Name <small>(as per Govt ID)</small></label>
            <input type="text" class="pax-name" value="${pax.name}" required placeholder="e.g. Aarav Sharma" />
          </div>
          <div class="form-group">
            <label>Age</label>
            <input type="number" class="pax-age" min="1" max="120" value="${pax.age}" required placeholder="Age" />
          </div>
          <div class="form-group">
            <label>Gender</label>
            <div class="gender-selector">
              <label class="gender-pill ${pax.gender === 'Male' ? 'selected' : ''}">
                <input type="radio" name="gender_${pax.id}" value="Male" ${pax.gender === 'Male' ? 'checked' : ''}> Male
              </label>
              <label class="gender-pill ${pax.gender === 'Female' ? 'selected' : ''}">
                <input type="radio" name="gender_${pax.id}" value="Female" ${pax.gender === 'Female' ? 'checked' : ''}> Female
              </label>
              <label class="gender-pill ${pax.gender === 'Transgender' ? 'selected' : ''}">
                <input type="radio" name="gender_${pax.id}" value="Transgender" ${pax.gender === 'Transgender' ? 'checked' : ''}> Other
              </label>
            </div>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label>Berth Preference</label>
            <select class="pax-berth">
              <option value="No Preference" ${pax.berth === 'No Preference' ? 'selected' : ''}>No Preference</option>
              <option value="Lower" ${pax.berth === 'Lower' ? 'selected' : ''}>Lower Berth</option>
              <option value="Middle" ${pax.berth === 'Middle' ? 'selected' : ''}>Middle Berth</option>
              <option value="Upper" ${pax.berth === 'Upper' ? 'selected' : ''}>Upper Berth</option>
              <option value="Side Lower" ${pax.berth === 'Side Lower' ? 'selected' : ''}>Side Lower (SL)</option>
              <option value="Side Upper" ${pax.berth === 'Side Upper' ? 'selected' : ''}>Side Upper (SU)</option>
              <option value="Window Side" ${pax.berth === 'Window Side' ? 'selected' : ''}>Cabin / Window Side</option>
            </select>
          </div>
          <div class="form-group">
            <label>Meal / Catering Option <small>(+ ₹180 on Rajdhani/Exp)</small></label>
            <select class="pax-meal">
              <option value="Veg Thali" ${pax.meal === 'Veg Thali' ? 'selected' : ''}>Veg Standard Thali (+ ₹180)</option>
              <option value="Non-Veg Thali" ${pax.meal === 'Non-Veg Thali' ? 'selected' : ''}>Non-Veg Thali (+ ₹180)</option>
              <option value="Jain Meal" ${pax.meal === 'Jain Meal' ? 'selected' : ''}>Jain Meal (+ ₹180)</option>
              <option value="No Food" ${pax.meal === 'No Food' ? 'selected' : ''}>No Food / Opt out (₹0)</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const fare = calculateFare();

  container.innerHTML = `
    ${getHeaderHTML(2, 'Enter Passenger Details')}
    <div class="flow-body">
      <form id="passengerMasterForm">
        <div class="quick-fill-box">
          <b>⚡ Quick Fill from Saved Travelers:</b>
          <div class="quick-chips">
            ${savedTravelers.map((t) => `<button type="button" class="chip-btn quick-add-pax" data-name="${t.name}" data-age="${t.age}" data-gender="${t.gender}" data-berth="${t.berth}" data-meal="${t.meal}">+ ${t.name} (${t.age})</button>`).join('')}
          </div>
        </div>

        <div class="section-subhead">
          <h3><span>👤</span> Travelers List (${bookingState.passengers.length} Passenger${bookingState.passengers.length > 1 ? 's' : ''})</h3>
          <span class="subhead-hint">Max 6 passengers per booking</span>
        </div>

        <div id="passengersCardList">${paxCardsHTML}</div>

        <div class="add-pax-actions">
          <button type="button" class="btn-outline-dashed" id="addAdultBtn" ${bookingState.passengers.length >= 6 ? 'disabled' : ''}>
            <span>+</span> Add Adult Passenger
          </button>
          <button type="button" class="btn-outline-dashed" id="addChildBtn" ${bookingState.passengers.length >= 6 ? 'disabled' : ''}>
            <span>+</span> Add Child (Below 5 yrs, No Berth)
          </button>
        </div>

        <!-- IRCTC Verification Card -->
        <div class="irctc-card">
          <div class="irctc-card-top">
            <div class="irctc-badge">
              <span>🇮🇳</span> IRCTC User Account Verification
            </div>
            <span class="verified-tag" id="irctcVerifiedTag">✓ Verified IRCTC User</span>
          </div>
          <div class="irctc-input-row">
            <input type="text" id="irctcUserInput" value="${bookingState.irctcUser}" placeholder="Enter IRCTC Username" required />
            <button type="button" class="btn-verify" id="verifyIrctcBtn">Verify User</button>
          </div>
          <p>Your ticket reservation will be submitted under this IRCTC account. You will receive an official IRCTC confirmation SMS.</p>
        </div>

        <!-- Contact Information Card -->
        <div class="info-section-card">
          <div class="section-subhead">
            <h3><span>📱</span> Contact Details (For E-Ticket & SMS Alerts)</h3>
            <span class="subhead-hint">Sent immediately after confirmation</span>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label>Mobile Number <small>(Indian +91)</small></label>
              <input type="tel" id="contactMobile" inputmode="numeric" maxlength="10" value="${bookingState.contact.mobile}" required placeholder="10-digit mobile" />
            </div>
            <div class="form-group">
              <label>Email Address for E-Ticket PDF</label>
              <input type="email" id="contactEmail" value="${bookingState.contact.email}" required placeholder="e.g. name@example.com" />
            </div>
          </div>
          <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--deep); margin-top:8px; cursor:pointer;">
            <input type="checkbox" id="whatsappOptIn" ${bookingState.contact.whatsapp ? 'checked' : ''} />
            <span>Send booking updates, live running status and PNR chart updates on WhatsApp 💬</span>
          </label>
        </div>

        <!-- Add-ons & Benefits -->
        <div class="section-subhead">
          <h3><span>🛡️</span> Protection & Preferences</h3>
          <span class="subhead-hint">Recommended for peace of mind</span>
        </div>
        <div class="addons-grid">
          <label class="addon-box ${bookingState.preferences.freeCancellation ? 'selected' : ''}">
            <input type="checkbox" class="addon-checkbox" id="freeCancelCheck" ${bookingState.preferences.freeCancellation ? 'checked' : ''} />
            <div class="addon-content">
              <h4><span>Free Cancellation Guarantee</span> <span class="addon-price">₹149 / pax</span></h4>
              <p>Get 100% instant refund with zero cancellation charges if your travel plans change.</p>
            </div>
          </label>

          <label class="addon-box ${bookingState.preferences.insurance ? 'selected' : ''}">
            <input type="checkbox" class="addon-checkbox" id="insuranceCheck" ${bookingState.preferences.insurance ? 'checked' : ''} />
            <div class="addon-content">
              <h4><span>Comprehensive Travel Insurance</span> <span class="addon-price">₹0.45 / pax</span></h4>
              <p>Cover up to ₹10,00,000 for hospitalization, accident, and baggage loss during train transit.</p>
            </div>
          </label>
        </div>

        <div style="margin-top: 10px; display:flex; flex-direction:column; gap:8px; font-size:12px; color:var(--muted);">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="autoUpgradeCheck" ${bookingState.preferences.autoUpgrade ? 'checked' : ''} />
            <span>Consider for free auto-upgrade to higher class (e.g. 3A → 2A) if seats remain vacant</span>
          </label>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="confirmOnlyCheck" ${bookingState.preferences.confirmOnly ? 'checked' : ''} />
            <span>Book only if confirm berths are allotted (do not assign RAC/Waitlist)</span>
          </label>
        </div>

        <div class="flow-actions">
          <button type="button" class="flow-back" id="backToTrainList">← Back to Train List</button>
          <button type="submit" class="primary-btn" id="toReviewBtn">
            Proceed to Review (₹ ${fare.totalPayable.toLocaleString('en-IN')}) <span>→</span>
          </button>
        </div>
      </form>
    </div>
  `;

  setupPassengerEventListeners(container);
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function syncPassengerDataFromDOM() {
  const paxCards = document.querySelectorAll('.passenger-card');
  const updatedPassengers = [];
  paxCards.forEach((card, idx) => {
    const id = parseInt(card.dataset.paxId, 10) || (idx + 1);
    const name = card.querySelector('.pax-name').value.trim();
    const age = parseInt(card.querySelector('.pax-age').value, 10) || 25;
    const gender = card.querySelector('.gender-pill.selected input')?.value || 'Male';
    const berth = card.querySelector('.pax-berth').value;
    const meal = card.querySelector('.pax-meal').value;
    const isChild = age < 5;
    updatedPassengers.push({ id, name, age, gender, berth, meal, isChild });
  });
  if (updatedPassengers.length > 0) bookingState.passengers = updatedPassengers;

  const mobileEl = document.getElementById('contactMobile');
  const emailEl = document.getElementById('contactEmail');
  const irctcEl = document.getElementById('irctcUserInput');
  const waEl = document.getElementById('whatsappOptIn');
  const freeCancelEl = document.getElementById('freeCancelCheck');
  const insEl = document.getElementById('insuranceCheck');
  const autoUpEl = document.getElementById('autoUpgradeCheck');
  const confEl = document.getElementById('confirmOnlyCheck');

  if (mobileEl) bookingState.contact.mobile = mobileEl.value.trim();
  if (emailEl) bookingState.contact.email = emailEl.value.trim();
  if (irctcEl) bookingState.irctcUser = irctcEl.value.trim();
  if (waEl) bookingState.contact.whatsapp = waEl.checked;
  if (freeCancelEl) bookingState.preferences.freeCancellation = freeCancelEl.checked;
  if (insEl) bookingState.preferences.insurance = insEl.checked;
  if (autoUpEl) bookingState.preferences.autoUpgrade = autoUpEl.checked;
  if (confEl) bookingState.preferences.confirmOnly = confEl.checked;
}

function setupPassengerEventListeners(container) {
  // Gender pill buttons
  container.querySelectorAll('.gender-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const parent = pill.closest('.gender-selector');
      parent.querySelectorAll('.gender-pill').forEach((p) => p.classList.remove('selected'));
      pill.classList.add('selected');
      const radio = pill.querySelector('input');
      if (radio) radio.checked = true;
    });
  });

  // Remove Passenger
  container.querySelectorAll('.remove-pax-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      syncPassengerDataFromDOM();
      const removeId = parseInt(btn.dataset.id, 10);
      bookingState.passengers = bookingState.passengers.filter((p) => p.id !== removeId);
      showToast('Passenger removed from booking.');
      renderPassengerStep();
    });
  });

  // Add Adult Passenger
  container.querySelector('#addAdultBtn')?.addEventListener('click', () => {
    syncPassengerDataFromDOM();
    if (bookingState.passengers.length >= 6) {
      showToast('Maximum 6 passengers allowed per booking.');
      return;
    }
    const newId = Date.now();
    bookingState.passengers.push({
      id: newId,
      name: '',
      age: 30,
      gender: 'Male',
      berth: 'No Preference',
      meal: 'Veg Thali',
      isChild: false
    });
    showToast('New passenger card added.');
    renderPassengerStep();
  });

  // Add Child Passenger
  container.querySelector('#addChildBtn')?.addEventListener('click', () => {
    syncPassengerDataFromDOM();
    if (bookingState.passengers.length >= 6) {
      showToast('Maximum 6 passengers allowed per booking.');
      return;
    }
    const newId = Date.now();
    bookingState.passengers.push({
      id: newId,
      name: '',
      age: 4,
      gender: 'Male',
      berth: 'No Preference',
      meal: 'Veg Thali',
      isChild: true
    });
    showToast('Child passenger added (below 5 yrs, no berth allotted).');
    renderPassengerStep();
  });

  // Quick fill saved traveler
  container.querySelectorAll('.quick-add-pax').forEach((btn) => {
    btn.addEventListener('click', () => {
      syncPassengerDataFromDOM();
      const name = btn.dataset.name;
      const age = parseInt(btn.dataset.age, 10);
      const gender = btn.dataset.gender;
      const berth = btn.dataset.berth;
      const meal = btn.dataset.meal;

      const exists = bookingState.passengers.some((p) => p.name === name);
      if (exists) {
        showToast(`${name} is already in your traveler list.`);
        return;
      }
      if (bookingState.passengers.length >= 6) {
        showToast('Maximum 6 passengers allowed per booking.');
        return;
      }
      if (bookingState.passengers.length === 1 && !bookingState.passengers[0].name) {
        bookingState.passengers[0] = { id: 1, name, age, gender, berth, meal, isChild: age < 5 };
      } else {
        bookingState.passengers.push({ id: Date.now(), name, age, gender, berth, meal, isChild: age < 5 });
      }
      showToast(`Added ${name} to travelers.`);
      renderPassengerStep();
    });
  });

  // Verify IRCTC Button
  container.querySelector('#verifyIrctcBtn')?.addEventListener('click', () => {
    const input = document.getElementById('irctcUserInput');
    if (!input.value.trim()) {
      showToast('Please enter a valid IRCTC username.');
      return;
    }
    bookingState.irctcUser = input.value.trim();
    bookingState.irctcVerified = true;
    const tag = document.getElementById('irctcVerifiedTag');
    if (tag) {
      tag.textContent = '✓ Verified IRCTC User';
      tag.style.background = '#d4edda';
      tag.style.color = '#155724';
    }
    showToast(`IRCTC User "${bookingState.irctcUser}" successfully verified.`);
  });

  // Addon Checkbox visual toggles
  container.querySelectorAll('.addon-box').forEach((box) => {
    box.addEventListener('change', () => {
      const checkbox = box.querySelector('input');
      if (checkbox.checked) box.classList.add('selected');
      else box.classList.remove('selected');
      syncPassengerDataFromDOM();
      const fare = calculateFare();
      const btn = document.getElementById('toReviewBtn');
      if (btn) btn.innerHTML = `Proceed to Review (₹ ${fare.totalPayable.toLocaleString('en-IN')}) <span>→</span>`;
    });
  });

  // Back to Trains
  container.querySelector('#backToTrainList')?.addEventListener('click', () => {
    container.remove();
    document.getElementById('trainResults')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Form Submit -> Step 3: Review
  container.querySelector('#passengerMasterForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    syncPassengerDataFromDOM();
    renderReviewStep();
  });
}

// --------------------------------------------------------------------------
// STEP 3: Enhanced Review & Addons Step
// --------------------------------------------------------------------------
function renderReviewStep() {
  const container = initBookingFlow('review');
  const fare = calculateFare();

  const paxListHTML = bookingState.passengers.map((p, idx) => `
    <div class="review-pax-item">
      <div>
        <b>${idx + 1}. ${p.name || 'Unnamed Passenger'}</b>
        <span>${p.age} yrs · ${p.gender} · Pref: <b>${p.berth}</b></span>
      </div>
      <div>
        <span class="badge-tag ${p.meal !== 'No Food' ? 'badge-green' : 'badge-orange'}">${p.meal}</span>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    ${getHeaderHTML(3, 'Review Journey & Travelers')}
    <div class="flow-body">
      <div class="review-layout">
        <!-- Left Main Column: Journey & Passenger Summary -->
        <div class="review-main-col">
          <div class="review-card">
            <h4><span>🚆</span> Train & Timing Details</h4>
            <div class="review-journey-row">
              <div class="time-point">
                <b>${bookingState.train.depTime}</b>
                <span>${bookingState.train.from}</span>
                <small style="color:var(--green); font-weight:600;">Platform 1</small>
              </div>
              <div class="journey-arrow">
                <span>────── ➔</span>
                <small>${bookingState.train.duration} · ${bookingState.train.cls}</small>
              </div>
              <div class="time-point" style="text-align:right;">
                <b>${bookingState.train.arrTime}</b>
                <span>${bookingState.train.to}</span>
                <small style="color:var(--muted);">${bookingState.train.date}</small>
              </div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
              <span class="badge-tag badge-blue">${bookingState.train.number} ${bookingState.train.name}</span>
              <span class="badge-tag badge-green">${bookingState.train.clsName} (${bookingState.train.cls})</span>
              <span class="badge-tag badge-orange">Quota: ${bookingState.train.quota}</span>
            </div>
          </div>

          <div class="review-card">
            <h4><span>👥</span> Passenger Information (${bookingState.passengers.length})</h4>
            <div>${paxListHTML}</div>
          </div>

          <div class="review-card">
            <h4><span>📋</span> IRCTC & Communication Details</h4>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:12px;">
              <div>
                <span style="color:var(--muted); display:block;">IRCTC Account:</span>
                <b style="color:var(--deep);">${bookingState.irctcUser}</b> <span style="color:#1d794e;">(Verified ✓)</span>
              </div>
              <div>
                <span style="color:var(--muted); display:block;">SMS / WhatsApp Updates:</span>
                <b style="color:var(--deep);">+91 ${bookingState.contact.mobile}</b>
              </div>
              <div style="grid-column: 1 / -1;">
                <span style="color:var(--muted); display:block;">E-Ticket PDF Recipient:</span>
                <b style="color:var(--deep);">${bookingState.contact.email}</b>
              </div>
            </div>
          </div>

          <!-- Cancellation Policy Accordion -->
          <div style="background:#f8fafc; border:1px solid var(--line); border-radius:8px; padding:14px; font-size:12px; color:var(--muted);">
            <b style="color:var(--deep); display:block; margin-bottom:4px;">Cancellation & Refund Policy:</b>
            <span>${bookingState.preferences.freeCancellation ? '✓ Free Cancellation is ACTIVE. You will receive 100% full refund upon cancellation.' : 'Standard IRCTC cancellation rules apply: Full refund minus flat clerkage fee if cancelled > 48 hrs before departure.'}</span>
          </div>

          <label class="consent-box" id="consentBox">
            <input type="checkbox" id="termsConsentCheck" checked />
            <span>I confirm that the passenger names match government issued photo IDs (Aadhaar/Voter ID/Passport) and I accept Indian Railways booking conditions.</span>
          </label>
        </div>

        <!-- Right Column: Sticky Detailed Fare Breakdown -->
        <div>
          <div class="fare-card">
            <h3><span>Fare Summary</span> <small style="font-size:11px; font-weight:500; color:var(--muted);">${bookingState.passengers.length} Traveler${bookingState.passengers.length > 1 ? 's' : ''}</small></h3>
            
            <div class="fare-line">
              <span>Base Fare (${bookingState.passengers.length} × ₹ ${bookingState.train.basePrice})</span>
              <b>₹ ${fare.baseFareTotal.toLocaleString('en-IN')}</b>
            </div>

            ${fare.mealTotal > 0 ? `
              <div class="fare-line">
                <span>Catering & Meals</span>
                <b>₹ ${fare.mealTotal.toLocaleString('en-IN')}</b>
              </div>
            ` : ''}

            <div class="fare-line">
              <span>Reservation & Superfast Charges</span>
              <b>₹ ${fare.reservationCharges.toLocaleString('en-IN')}</b>
            </div>

            ${bookingState.preferences.insurance ? `
              <div class="fare-line">
                <span>Travel Insurance (₹0.45 × ${bookingState.passengers.length})</span>
                <b>₹ ${fare.insuranceCharges.toLocaleString('en-IN')}</b>
              </div>
            ` : ''}

            ${bookingState.preferences.freeCancellation ? `
              <div class="fare-line">
                <span>Free Cancellation Guarantee</span>
                <b>₹ ${fare.freeCancelCharges.toLocaleString('en-IN')}</b>
              </div>
            ` : ''}

            <div class="fare-line">
              <span>IRCTC Convenience Fee (incl. GST)</span>
              <b>₹ ${fare.irctcConvenienceFee.toLocaleString('en-IN')}</b>
            </div>

            <!-- Coupon Box -->
            <div class="coupon-box">
              ${bookingState.coupon.applied ? `
                <div class="coupon-applied-tag">
                  <span>🎉 <b>${bookingState.coupon.code}</b> applied (-₹${bookingState.coupon.discount})</span>
                  <button type="button" class="remove-coupon-btn" id="removeCouponBtn">✕ Remove</button>
                </div>
              ` : `
                <div class="coupon-input-group">
                  <input type="text" id="couponCodeInput" placeholder="ENTER PROMO CODE" />
                  <button type="button" class="btn-apply-coupon" id="applyCouponBtn">APPLY</button>
                </div>
                <div class="coupon-chips">
                  <span class="coupon-pill" data-code="RAILFIRST" data-discount="150">⚡ RAILFIRST (₹150 OFF)</span>
                  <span class="coupon-pill" data-code="SUPERUPI" data-discount="100">💳 SUPERUPI (₹100 OFF)</span>
                </div>
              `}
            </div>

            ${bookingState.coupon.applied ? `
              <div class="fare-line discount">
                <span>Promo Code Discount (${bookingState.coupon.code})</span>
                <b>- ₹ ${bookingState.coupon.discount.toLocaleString('en-IN')}</b>
              </div>
            ` : ''}

            <div class="fare-total-row">
              <span>Total Payable</span>
              <b id="reviewTotalPayable">₹ ${fare.totalPayable.toLocaleString('en-IN')}</b>
            </div>

            <div style="margin-top:16px;">
              <button type="button" class="primary-btn" id="proceedToPaymentBtn" style="width:100%; justify-content:center;">
                Proceed to Payment <span>→</span>
              </button>
            </div>
            <p style="margin:10px 0 0; text-align:center; font-size:11px; color:var(--muted);">🔒 256-bit Encrypted IRCTC Authorized Checkout</p>
          </div>
        </div>
      </div>

      <div class="flow-actions">
        <button type="button" class="flow-back" id="backToPaxDetails">← Edit Passenger Details</button>
      </div>
    </div>
  `;

  // Coupon handling
  container.querySelector('#applyCouponBtn')?.addEventListener('click', () => {
    const input = document.getElementById('couponCodeInput');
    const code = input.value.trim().toUpperCase();
    if (code === 'RAILFIRST') {
      bookingState.coupon = { code: 'RAILFIRST', discount: 150, applied: true };
      showToast('Promo code RAILFIRST applied! ₹150 discount added.');
      renderReviewStep();
    } else if (code === 'SUPERUPI') {
      bookingState.coupon = { code: 'SUPERUPI', discount: 100, applied: true };
      showToast('Promo code SUPERUPI applied! ₹100 discount added.');
      renderReviewStep();
    } else if (code) {
      showToast(`Invalid promo code "${code}". Try RAILFIRST or SUPERUPI.`);
    }
  });

  container.querySelectorAll('.coupon-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const code = pill.dataset.code;
      const discount = parseInt(pill.dataset.discount, 10);
      bookingState.coupon = { code, discount, applied: true };
      showToast(`Promo code ${code} applied! ₹${discount} discount added.`);
      renderReviewStep();
    });
  });

  container.querySelector('#removeCouponBtn')?.addEventListener('click', () => {
    bookingState.coupon = { code: '', discount: 0, applied: false };
    showToast('Promo code removed.');
    renderReviewStep();
  });

  // Navigation
  container.querySelector('#backToPaxDetails')?.addEventListener('click', () => renderPassengerStep());
  
  container.querySelector('#proceedToPaymentBtn')?.addEventListener('click', () => {
    const consent = document.getElementById('termsConsentCheck');
    const consentBox = document.getElementById('consentBox');
    if (!consent.checked) {
      consentBox.classList.add('needs-consent');
      showToast('Please agree to the booking and ID verification terms.');
      return;
    }
    renderPaymentStep();
  });

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// --------------------------------------------------------------------------
// STEP 4: Professional Multi-Channel Payment Gateway
// --------------------------------------------------------------------------
function renderPaymentStep() {
  const container = initBookingFlow('payment');
  const fare = calculateFare();

  const tab = bookingState.payment.tab || 'upi';

  let paymentPanelHTML = '';

  if (tab === 'upi') {
    const upiMode = bookingState.payment.upiMode || 'qr';
    paymentPanelHTML = `
      <div class="payment-panel">
        <div class="payment-panel-head">
          <h4>⚡ Unified Payments Interface (UPI)</h4>
          <p>Instant zero-convenience fee payment via any UPI App</p>
        </div>

        <div class="upi-subnav">
          <button type="button" class="upi-subnav-btn ${upiMode === 'qr' ? 'active' : ''}" data-upi-mode="qr">📱 Scan QR Code</button>
          <button type="button" class="upi-subnav-btn ${upiMode === 'id' ? 'active' : ''}" data-upi-mode="id">🆔 Enter UPI ID / VPA</button>
        </div>

        ${upiMode === 'qr' ? `
          <div class="qr-scanner-box">
            <div class="qr-code-graphic">
              <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white" />
                <rect x="5" y="5" width="30" height="30" fill="#173267" rx="3" />
                <rect x="10" y="10" width="20" height="20" fill="white" />
                <rect x="14" y="14" width="12" height="12" fill="#ef8e12" />

                <rect x="65" y="5" width="30" height="30" fill="#173267" rx="3" />
                <rect x="70" y="10" width="20" height="20" fill="white" />
                <rect x="74" y="14" width="12" height="12" fill="#ef8e12" />

                <rect x="5" y="65" width="30" height="30" fill="#173267" rx="3" />
                <rect x="10" y="70" width="20" height="20" fill="white" />
                <rect x="14" y="74" width="12" height="12" fill="#ef8e12" />

                <rect x="42" y="10" width="16" height="6" fill="#173267" />
                <rect x="42" y="22" width="8" height="14" fill="#173267" />
                <rect x="54" y="30" width="6" height="8" fill="#173267" />
                <rect x="10" y="42" width="16" height="6" fill="#173267" />
                <rect x="30" y="42" width="8" height="16" fill="#173267" />
                <rect x="44" y="44" width="12" height="12" fill="#174998" />
                <rect x="64" y="42" width="16" height="8" fill="#173267" />
                <rect x="85" y="42" width="10" height="18" fill="#173267" />
                <rect x="42" y="64" width="18" height="8" fill="#173267" />
                <rect x="42" y="78" width="8" height="16" fill="#173267" />
                <rect x="56" y="80" width="14" height="14" fill="#173267" />
                <rect x="75" y="65" width="20" height="8" fill="#173267" />
                <rect x="75" y="78" width="8" height="16" fill="#173267" />
              </svg>
              <div class="qr-scan-line"></div>
            </div>
            <p style="margin:12px 0 4px; font-size:13px; font-weight:700; color:var(--deep);">Scan & Pay ₹ ${fare.totalPayable.toLocaleString('en-IN')}</p>
            <span style="font-size:11px; color:var(--muted);">Open any UPI app (Google Pay, PhonePe, Paytm, BHIM) and point your camera</span>
            <div class="upi-apps-row">
              <span class="upi-app-badge">🟢 Google Pay</span>
              <span class="upi-app-badge">🟣 PhonePe</span>
              <span class="upi-app-badge">🔵 Paytm</span>
              <span class="upi-app-badge">🟠 BHIM</span>
            </div>
          </div>
        ` : `
          <div style="padding:10px 0;">
            <div class="form-group" style="margin-bottom:14px;">
              <label>Virtual Payment Address (VPA / UPI ID)</label>
              <input type="text" id="upiIdInput" value="${bookingState.payment.upiId}" placeholder="e.g. mobileNumber@upi / username@okhdfcbank" required />
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
              <button type="button" class="chip-btn upi-quick-suffix" data-suffix="@okaxis">+ @okaxis</button>
              <button type="button" class="chip-btn upi-quick-suffix" data-suffix="@okhdfcbank">+ @okhdfcbank</button>
              <button type="button" class="chip-btn upi-quick-suffix" data-suffix="@ybl">+ @ybl</button>
              <button type="button" class="chip-btn upi-quick-suffix" data-suffix="@paytm">+ @paytm</button>
            </div>
            <p style="font-size:11px; color:var(--muted);">A payment collect request will be triggered to your UPI application. Accept within 5 minutes to confirm.</p>
          </div>
        `}
      </div>
    `;
  } else if (tab === 'cards') {
    paymentPanelHTML = `
      <div class="payment-panel">
        <div class="payment-panel-head">
          <h4>💳 Credit / Debit / ATM Cards</h4>
          <p>Visa, MasterCard, RuPay, Maestro & American Express</p>
        </div>
        <div class="card-input-grid">
          <div class="form-group">
            <label>Card Number</label>
            <div class="card-num-wrapper">
              <input type="text" id="cardNumInput" maxlength="19" value="${bookingState.payment.cardNumber}" placeholder="4532 •••• •••• 8912" required />
              <span class="card-brand-icon" id="cardBrandIcon">💳</span>
            </div>
          </div>
          <div class="form-group">
            <label>Cardholder Name</label>
            <input type="text" id="cardNameInput" value="${bookingState.payment.cardName || bookingState.passengers[0]?.name || ''}" placeholder="Name printed on card" required />
          </div>
          <div class="card-subrow">
            <div class="form-group">
              <label>Expiry (MM/YY)</label>
              <input type="text" id="cardExpiryInput" maxlength="5" value="${bookingState.payment.cardExpiry}" placeholder="MM/YY" required />
            </div>
            <div class="form-group">
              <label>CVV / CVC <small>(ℹ️ 3 digits on back)</small></label>
              <input type="password" id="cardCvvInput" maxlength="4" value="${bookingState.payment.cardCvv}" placeholder="•••" required />
            </div>
          </div>
          <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted); cursor:pointer;">
            <input type="checkbox" id="saveCardCheck" ${bookingState.payment.saveCard ? 'checked' : ''} />
            <span>Securely save this card as per RBI tokenization directives</span>
          </label>
        </div>
      </div>
    `;
  } else if (tab === 'netbanking') {
    const selectedBank = bookingState.payment.selectedBank || 'sbi';
    paymentPanelHTML = `
      <div class="payment-panel">
        <div class="payment-panel-head">
          <h4>🏛️ Internet Banking</h4>
          <p>Direct authentic routing to 50+ Indian Banks</p>
        </div>
        <b style="font-size:12px; color:var(--deep); display:block; margin-bottom:8px;">Popular Indian Banks:</b>
        <div class="popular-banks-grid">
          <button type="button" class="bank-option-btn ${selectedBank === 'sbi' ? 'selected' : ''}" data-bank="sbi">
            <span class="bank-logo-circle" style="color:#0071bb;">SBI</span>
            <span>State Bank of India</span>
          </button>
          <button type="button" class="bank-option-btn ${selectedBank === 'hdfc' ? 'selected' : ''}" data-bank="hdfc">
            <span class="bank-logo-circle" style="color:#004c8f;">HDFC</span>
            <span>HDFC Bank</span>
          </button>
          <button type="button" class="bank-option-btn ${selectedBank === 'icici' ? 'selected' : ''}" data-bank="icici">
            <span class="bank-logo-circle" style="color:#bd2026;">ICICI</span>
            <span>ICICI Bank</span>
          </button>
          <button type="button" class="bank-option-btn ${selectedBank === 'axis' ? 'selected' : ''}" data-bank="axis">
            <span class="bank-logo-circle" style="color:#97144d;">AXIS</span>
            <span>Axis Bank</span>
          </button>
          <button type="button" class="bank-option-btn ${selectedBank === 'kotak' ? 'selected' : ''}" data-bank="kotak">
            <span class="bank-logo-circle" style="color:#ee1c25;">KOTAK</span>
            <span>Kotak Bank</span>
          </button>
          <button type="button" class="bank-option-btn ${selectedBank === 'pnb' ? 'selected' : ''}" data-bank="pnb">
            <span class="bank-logo-circle" style="color:#a8182b;">PNB</span>
            <span>Punjab National Bank</span>
          </button>
        </div>
        <div class="form-group" style="margin-top:14px;">
          <label>Or choose from all other banks:</label>
          <select id="allBanksSelect">
            <option value="">Select Other Bank</option>
            <option value="bob">Bank of Baroda</option>
            <option value="canara">Canara Bank</option>
            <option value="union">Union Bank of India</option>
            <option value="indusind">IndusInd Bank</option>
            <option value="idbi">IDBI Bank</option>
            <option value="yes">YES Bank</option>
            <option value="federal">Federal Bank</option>
          </select>
        </div>
      </div>
    `;
  } else if (tab === 'wallets') {
    const selectedWallet = bookingState.payment.wallet || 'amazonpay';
    paymentPanelHTML = `
      <div class="payment-panel">
        <div class="payment-panel-head">
          <h4>👛 Mobile Wallets & PayLater</h4>
          <p>One-click fast authorization</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <label class="addon-box ${selectedWallet === 'amazonpay' ? 'selected' : ''}">
            <input type="radio" name="walletChoice" value="amazonpay" ${selectedWallet === 'amazonpay' ? 'checked' : ''} />
            <div class="addon-content">
              <h4><span>Amazon Pay Balance</span> <span class="addon-price">Instant Cashback</span></h4>
              <p>Link your Amazon account for 1-click lightning checkout.</p>
            </div>
          </label>
          <label class="addon-box ${selectedWallet === 'paytm' ? 'selected' : ''}">
            <input type="radio" name="walletChoice" value="paytm" ${selectedWallet === 'paytm' ? 'checked' : ''} />
            <div class="addon-content">
              <h4><span>Paytm Wallet & Postpaid</span></h4>
              <p>Pay instantly using your linked Paytm wallet balance.</p>
            </div>
          </label>
          <label class="addon-box ${selectedWallet === 'simpl' ? 'selected' : ''}">
            <input type="radio" name="walletChoice" value="simpl" ${selectedWallet === 'simpl' ? 'checked' : ''} />
            <div class="addon-content">
              <h4><span>Simpl PayLater</span> <span class="addon-price">3-Split No Cost</span></h4>
              <p>Book now and pay over 3 easy fortnightly settlements.</p>
            </div>
          </label>
        </div>
      </div>
    `;
  } else if (tab === 'imudra') {
    paymentPanelHTML = `
      <div class="payment-panel">
        <div class="payment-panel-head">
          <h4>🎟️ IRCTC iMudra & RailYatri Credits</h4>
          <p>Dedicated digital rail wallet</p>
        </div>
        <div style="background:#f8fafc; border:1px solid #cfddec; border-radius:8px; padding:16px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-size:11px; color:var(--muted); display:block;">Available Rail Wallet Credits:</span>
              <b style="font-size:18px; color:#174998;">₹ 3,500.00</b>
            </div>
            <span class="badge-tag badge-green">Active & Verified</span>
          </div>
          <p style="margin:8px 0 0; font-size:11px; color:var(--muted);">Full payment of ₹ ${fare.totalPayable.toLocaleString('en-IN')} will be deducted from your RailYatri wallet balance.</p>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    ${getHeaderHTML(4, 'Choose Secure Payment Method')}
    <div class="flow-body">
      <div class="payment-gateway-layout">
        <!-- Left: Payment Options Tabs Card -->
        <div>
          <div class="payment-tabs-card">
            <div class="payment-nav-list">
              <button type="button" class="pay-tab-item ${tab === 'upi' ? 'active' : ''}" data-pay-tab="upi">
                <span class="pay-tab-icon">⚡</span>
                <span>UPI & QR</span>
                <span class="pay-tab-tag">FAST</span>
              </button>
              <button type="button" class="pay-tab-item ${tab === 'cards' ? 'active' : ''}" data-pay-tab="cards">
                <span class="pay-tab-icon">💳</span>
                <span>Credit / Debit Card</span>
              </button>
              <button type="button" class="pay-tab-item ${tab === 'netbanking' ? 'active' : ''}" data-pay-tab="netbanking">
                <span class="pay-tab-icon">🏛️</span>
                <span>Net Banking</span>
              </button>
              <button type="button" class="pay-tab-item ${tab === 'wallets' ? 'active' : ''}" data-pay-tab="wallets">
                <span class="pay-tab-icon">👛</span>
                <span>Wallets & PayLater</span>
              </button>
              <button type="button" class="pay-tab-item ${tab === 'imudra' ? 'active' : ''}" data-pay-tab="imudra">
                <span class="pay-tab-icon">🎟️</span>
                <span>IRCTC iMudra</span>
              </button>
            </div>
            
            ${paymentPanelHTML}
          </div>

          <div class="trust-security-box">
            <div class="trust-icon">🛡️</div>
            <div>
              <b>100% Safe & PCI-DSS 3.2 Level-1 Certified</b>
              <p>Protected by 256-Bit SSL Encryption. Your payment details are transmitted directly to certified banking gateways.</p>
            </div>
          </div>
        </div>

        <!-- Right: Order & Amount Summary Sidebar -->
        <div>
          <div class="fare-card">
            <h3><span>Payment Overview</span></h3>
            <div style="font-size:12px; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #f0f3f8;">
              <b style="display:block; color:var(--deep);">${bookingState.train.number} ${bookingState.train.name}</b>
              <span style="color:var(--muted);">${bookingState.train.from} → ${bookingState.train.to}</span>
              <span style="display:block; color:var(--muted); margin-top:2px;">Travel Date: <b>${bookingState.train.date}</b></span>
              <span style="display:block; color:var(--muted);">Class: <b>${bookingState.train.cls} (${bookingState.train.quota})</b></span>
              <span style="display:block; color:var(--muted);">Travelers: <b>${bookingState.passengers.length} Passenger${bookingState.passengers.length > 1 ? 's' : ''}</b></span>
            </div>

            <div class="fare-line">
              <span>Total Ticket Fare</span>
              <b>₹ ${fare.subtotal.toLocaleString('en-IN')}</b>
            </div>

            ${bookingState.coupon.applied ? `
              <div class="fare-line discount">
                <span>Promo Discount</span>
                <b>- ₹ ${bookingState.coupon.discount.toLocaleString('en-IN')}</b>
              </div>
            ` : ''}

            <div class="fare-total-row">
              <span>Amount to Pay</span>
              <b>₹ ${fare.totalPayable.toLocaleString('en-IN')}</b>
            </div>

            <div style="margin-top:18px;">
              <button type="button" class="primary-btn" id="payNowFinalBtn" style="width:100%; justify-content:center; font-size:15px; padding:14px;">
                🔒 Pay ₹ ${fare.totalPayable.toLocaleString('en-IN')} Now
              </button>
            </div>

            <div style="display:flex; justify-content:center; gap:12px; margin-top:14px; color:var(--muted); font-size:11px;">
              <span>✓ Instant Refund Guarantee</span>
              <span>✓ Verified IRCTC Partner</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flow-actions">
        <button type="button" class="flow-back" id="backToReviewScreen">← Back to Review</button>
      </div>
    </div>
  `;

  setupPaymentEventListeners(container);
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setupPaymentEventListeners(container) {
  // Tab switching
  container.querySelectorAll('.pay-tab-item').forEach((item) => {
    item.addEventListener('click', () => {
      bookingState.payment.tab = item.dataset.payTab;
      renderPaymentStep();
    });
  });

  // UPI submode
  container.querySelectorAll('.upi-subnav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      bookingState.payment.upiMode = btn.dataset.upiMode;
      renderPaymentStep();
    });
  });

  // UPI quick suffix
  container.querySelectorAll('.upi-quick-suffix').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('upiIdInput');
      if (input) {
        let current = input.value.split('@')[0] || 'aarav';
        input.value = current + btn.dataset.suffix;
        bookingState.payment.upiId = input.value;
      }
    });
  });

  // Card input formatting & brand detection
  const cardInput = container.querySelector('#cardNumInput');
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
      e.target.value = formatted;
      bookingState.payment.cardNumber = formatted;

      const brandIcon = document.getElementById('cardBrandIcon');
      if (val.startsWith('4')) brandIcon.textContent = '💳 Visa';
      else if (val.startsWith('5') || val.startsWith('2')) brandIcon.textContent = '💳 MasterCard';
      else if (val.startsWith('6') || val.startsWith('8')) brandIcon.textContent = '💳 RuPay';
      else if (val.startsWith('3')) brandIcon.textContent = '💳 Amex';
      else brandIcon.textContent = '💳';
    });
  }

  const expiryInput = container.querySelector('#cardExpiryInput');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2, 4);
      e.target.value = val;
      bookingState.payment.cardExpiry = val;
    });
  }

  // Net banking bank select
  container.querySelectorAll('.bank-option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.bank-option-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      bookingState.payment.selectedBank = btn.dataset.bank;
    });
  });

  // Wallet choices
  container.querySelectorAll('input[name="walletChoice"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      bookingState.payment.wallet = radio.value;
      container.querySelectorAll('.addon-box').forEach((box) => box.classList.remove('selected'));
      radio.closest('.addon-box')?.classList.add('selected');
    });
  });

  // Navigation
  container.querySelector('#backToReviewScreen')?.addEventListener('click', () => renderReviewStep());

  // Pay Now Final Trigger -> Simulated Processing Engine
  container.querySelector('#payNowFinalBtn')?.addEventListener('click', () => {
    executePaymentSimulation();
  });
}

// --------------------------------------------------------------------------
// STEP 5: Payment Processing Simulation Modal
// --------------------------------------------------------------------------
function executePaymentSimulation() {
  const overlay = document.createElement('div');
  overlay.className = 'payment-processing-overlay';
  overlay.innerHTML = `
    <div class="processing-card">
      <div class="spinner-ring"></div>
      <h3>Securing Your Reservation...</h3>
      <p>Please do not refresh or press the back button.</p>
      <div class="processing-steps-list">
        <div class="proc-step-row current" id="procStep1"><span>⏳</span> Connecting securely to banking gateway...</div>
        <div class="proc-step-row" id="procStep2"><span>○</span> Authorizing transaction & verifying token...</div>
        <div class="proc-step-row" id="procStep3"><span>○</span> Reserving PNR with IRCTC central engine...</div>
        <div class="proc-step-row" id="procStep4"><span>○</span> Generating Electronic Reservation Slip (ERS)...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    const s1 = document.getElementById('procStep1');
    const s2 = document.getElementById('procStep2');
    if (s1) { s1.className = 'proc-step-row done'; s1.innerHTML = '<span>✓</span> Banking gateway authenticated'; }
    if (s2) { s2.className = 'proc-step-row current'; s2.innerHTML = '<span>⏳</span> Authorizing transaction & verifying token...'; }
  }, 700);

  setTimeout(() => {
    const s2 = document.getElementById('procStep2');
    const s3 = document.getElementById('procStep3');
    if (s2) { s2.className = 'proc-step-row done'; s2.innerHTML = '<span>✓</span> Payment authorization successful'; }
    if (s3) { s3.className = 'proc-step-row current'; s3.innerHTML = '<span>⏳</span> Reserving PNR with IRCTC central engine...'; }
  }, 1400);

  setTimeout(() => {
    const s3 = document.getElementById('procStep3');
    const s4 = document.getElementById('procStep4');
    if (s3) { s3.className = 'proc-step-row done'; s3.innerHTML = '<span>✓</span> IRCTC PNR allocated: 2846159273'; }
    if (s4) { s4.className = 'proc-step-row current'; s4.innerHTML = '<span>⏳</span> Generating Electronic Reservation Slip (ERS)...'; }
  }, 2000);

  setTimeout(() => {
    overlay.remove();
    renderConfirmation();
  }, 2600);
}

// --------------------------------------------------------------------------
// STEP 6: Enhanced Official Electronic Reservation Slip (ERS) Confirmation
// --------------------------------------------------------------------------
function renderConfirmation() {
  const container = initBookingFlow('confirm');
  const fare = calculateFare();
  const pnr = '2846159273';
  const txnId = 'TXN-' + Math.floor(100000000 + Math.random() * 900000000);

  let passengerRowsHTML = bookingState.passengers.map((p, idx) => {
    const seatNum = 28 + (idx * 3);
    const coach = bookingState.train.cls === 'SL' ? `S${idx + 2}` : (bookingState.train.cls === '2A' ? 'A1' : 'B4');
    return `
      <tr>
        <td><b>${idx + 1}. ${p.name || 'Aarav Sharma'}</b></td>
        <td>${p.age} / ${p.gender.charAt(0)}</td>
        <td><span class="cnf-badge">CNF / Confirmed</span></td>
        <td><b>Coach ${coach}</b></td>
        <td><b>${seatNum} / ${p.berth}</b></td>
        <td>${p.meal}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="flow-heading">
      <p class="eyebrow">BOOKING COMPLETED</p>
      <h2>Electronic Reservation Slip (ERS) Confirmed</h2>
      <div class="flow-steps">
        <div class="flow-step completed"><span class="step-circle">✓</span><span>1. Train</span></div>
        <div class="flow-step completed"><span class="step-circle">✓</span><span>2. Passenger</span></div>
        <div class="flow-step completed"><span class="step-circle">✓</span><span>3. Review</span></div>
        <div class="flow-step completed"><span class="step-circle">✓</span><span>4. Paid</span></div>
        <div class="flow-step active"><span class="step-circle">✓</span><span>5. Confirmed</span></div>
      </div>
    </div>

    <div class="flow-body">
      <div class="eticket-wrapper">
        <div class="eticket-top-banner">
          <div class="eticket-brand-badge">
            <h3>🎉 Booking Confirmed!</h3>
            <p>IRCTC Rail Connect E-Ticket · Transaction ID: <b>${txnId}</b></p>
          </div>
          <div class="pnr-highlight-box">
            <small>INDIAN RAILWAYS PNR</small>
            <b id="confirmedPnrText">${pnr}</b>
            <br />
            <button type="button" class="pnr-copy-btn" id="copyPnrBtn">📋 Copy PNR</button>
          </div>
        </div>

        <div class="eticket-body">
          <div class="eticket-info-grid">
            <div class="info-cell">
              <span>Train Number & Name</span>
              <b>${bookingState.train.number} · ${bookingState.train.name}</b>
            </div>
            <div class="info-cell">
              <span>Class & Quota</span>
              <b>${bookingState.train.cls} (${bookingState.train.clsName}) · ${bookingState.train.quota}</b>
            </div>
            <div class="info-cell">
              <span>Departure Station</span>
              <b>${bookingState.train.from} · ${bookingState.train.depTime}</b>
            </div>
            <div class="info-cell">
              <span>Arrival Station</span>
              <b>${bookingState.train.to} · ${bookingState.train.arrTime}</b>
            </div>
          </div>

          <div class="section-subhead">
            <h3><span>💺</span> Allocated Passenger Seats</h3>
            <span class="subhead-hint">Charting Status: Charting not yet done</span>
          </div>

          <div class="passenger-table-wrapper">
            <table class="eticket-table">
              <thead>
                <tr>
                  <th>Passenger Name</th>
                  <th>Age / Sex</th>
                  <th>Booking Status</th>
                  <th>Coach</th>
                  <th>Berth / Seat</th>
                  <th>Catering</th>
                </tr>
              </thead>
              <tbody>
                ${passengerRowsHTML}
              </tbody>
            </table>
          </div>

          <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:16px; padding:14px; background:#fbfcfe; border:1px solid #e7edf5; border-radius:8px; font-size:12px; margin-bottom:20px;">
            <div>
              <b style="color:var(--deep); display:block; margin-bottom:4px;">Registered IRCTC User ID:</b>
              <span style="color:#174998; font-weight:700;">${bookingState.irctcUser}</span>
              <p style="margin:4px 0 0; color:var(--muted); font-size:11px;">Confirmation SMS sent to +91 ${bookingState.contact.mobile}. E-ticket PDF dispatched to ${bookingState.contact.email}.</p>
            </div>
            <div style="text-align:right;">
              <span style="color:var(--muted); display:block;">Total Amount Paid:</span>
              <b style="font-size:18px; color:#1d794e;">₹ ${fare.totalPayable.toLocaleString('en-IN')}</b>
              <small style="display:block; color:var(--muted);">Payment Method: ${bookingState.payment.tab.toUpperCase()}</small>
            </div>
          </div>

          <div class="eticket-actions-row">
            <button type="button" class="btn-ticket-action btn-ticket-primary" id="printTicketBtn">
              <span>🖨️</span> Print / Save E-Ticket PDF
            </button>
            <button type="button" class="btn-ticket-action btn-ticket-whatsapp" id="shareWaBtn">
              <span>💬</span> Send to WhatsApp
            </button>
            <a href="track.html?pnr=${pnr}&train=${bookingState.train.number}" class="btn-ticket-action btn-ticket-secondary">
              <span>🚆</span> Live Track This Train
            </a>
            <a href="food.html" class="btn-ticket-action btn-ticket-secondary">
              <span>🍱</span> Order Station Food
            </a>
            <a href="trips.html" class="btn-ticket-action btn-ticket-secondary">
              <span>📋</span> View in My Bookings
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Save confirmed trip to localStorage
  try {
    const newTrip = {
      pnr,
      trainNumber: bookingState.train.number,
      trainName: bookingState.train.name,
      from: bookingState.train.from,
      to: bookingState.train.to,
      depTime: bookingState.train.depTime,
      arrTime: bookingState.train.arrTime,
      date: bookingState.train.date,
      cls: bookingState.train.cls,
      clsName: bookingState.train.clsName,
      coach: bookingState.train.cls === 'SL' ? 'S2' : (bookingState.train.cls === '2A' ? 'A1' : 'B4'),
      seat: '28',
      status: 'Confirmed',
      passengers: bookingState.passengers
    };
    let trips = JSON.parse(localStorage.getItem('rail_booked_trips')) || [];
    trips = [newTrip, ...trips.filter(t => t.pnr !== pnr)];
    localStorage.setItem('rail_booked_trips', JSON.stringify(trips));
  } catch (e) {}

  // Copy PNR
  container.querySelector('#copyPnrBtn')?.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pnr);
      showToast(`PNR ${pnr} copied to clipboard!`);
    } else {
      showToast(`PNR: ${pnr}`);
    }
  });

  // Print PDF
  container.querySelector('#printTicketBtn')?.addEventListener('click', () => {
    window.print();
  });

  // Share WhatsApp
  container.querySelector('#shareWaBtn')?.addEventListener('click', () => {
    const text = encodeURIComponent(`Train Ticket Confirmed!\nTrain: ${bookingState.train.number} ${bookingState.train.name}\nPNR: ${pnr}\nDate: ${bookingState.train.date}\nRoute: ${bookingState.train.from} to ${bookingState.train.to}\nHave a pleasant journey!`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  });

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==========================================================================
// 1-CLICK AUTO-TRACKING FROM URL PARAMS (No Need to Re-Enter PNR / Train)
// ==========================================================================

function autoTrackFromUrl() {
  if (!result || !input) return;
  const urlParams = new URLSearchParams(window.location.search);
  const pnrParam = urlParams.get('pnr');
  const trainParam = urlParams.get('train');

  if (pnrParam) {
    const pnrTab = document.querySelector('.tracker-tabs .tab[data-mode="pnr"]');
    if (pnrTab) pnrTab.click();
    input.value = pnrParam;
    hint.innerHTML = `Auto-tracking live journey for PNR <b>${pnrParam}</b>.`;
    updateTrackingDetails(true);
    result.classList.remove('hidden');
    setupPlatformAlerts();
    setTimeout(() => {
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  } else if (trainParam) {
    const trainTab = document.querySelector('.tracker-tabs .tab[data-mode="train"]');
    if (trainTab) trainTab.click();
    input.value = trainParam;
    hint.innerHTML = `Auto-tracking live running status for Train <b>${trainParam}</b>.`;
    updateTrackingForTrain(trainParam);
    result.classList.remove('hidden');
    setupPlatformAlerts();
    setTimeout(() => {
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  }
}

function autoCheckPnrFromUrl() {
  if (!pnrCard || !pnrInput) return;
  const urlParams = new URLSearchParams(window.location.search);
  const pnrParam = urlParams.get('pnr');
  if (pnrParam) {
    pnrInput.value = pnrParam;
    if (displayPnr) displayPnr.textContent = pnrParam;
    pnrCard.classList.remove('hidden');
    setTimeout(() => {
      pnrCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  }
}

// ==========================================================================
// DYNAMIC MY TRIPS RENDERING (With 1-Click Track and PNR actions)
// ==========================================================================

function initTripsPage() {
  const container = document.getElementById('tripsListContainer');
  if (!container) return;

  let savedTrips = [];
  try {
    savedTrips = JSON.parse(localStorage.getItem('rail_booked_trips')) || [];
  } catch (e) {}

  if (savedTrips.length > 0) {
    container.innerHTML = savedTrips.map((trip) => `
      <section class="trip-card">
        <div class="trip-top">
          <div>
            <p class="eyebrow">UPCOMING · ${trip.date} · PNR: <b>${trip.pnr}</b></p>
            <h2>${trip.from} <span>→</span> ${trip.to}</h2>
            <p>${trip.trainNumber} · ${trip.trainName} · ${trip.clsName || 'AC 3 Tier'} (${trip.cls})</p>
          </div>
          <span class="status">✓ ${trip.status || 'Confirmed'}</span>
        </div>
        <div class="trip-meta">
          <span><b>Departure</b>${trip.depTime} · ${trip.from}</span>
          <span><b>Arrival</b>${trip.arrTime} · ${trip.to}</span>
          <span><b>Coach & Seat</b>Coach ${trip.coach} · Seat ${trip.seat}</span>
        </div>
        <div class="trip-actions">
          <a class="outline-link" style="background:#174998; color:#ffffff; border-color:#174998; display:inline-flex; align-items:center; gap:6px;" href="track.html?pnr=${trip.pnr}&train=${trip.trainNumber}">
            <span>🚆</span> Track this train (Live)
          </a>
          <a class="outline-link" href="pnr.html?pnr=${trip.pnr}">
            <span>📋</span> View PNR status
          </a>
          <a class="outline-link" href="food.html">
            <span>🍱</span> Order meals
          </a>
          <a class="outline-link" style="margin-left:auto; background:var(--paper);" href="pnr.html?pnr=${trip.pnr}">
            <span>🎫</span> View E-Ticket →
          </a>
        </div>
      </section>
    `).join('');
  }
}

// ==========================================================================
// INTERACTIVE CONTACT SUPPORT & TICKET RAISING ENGINE
// ==========================================================================

function initSupportModal() {
  const openSupportCard = document.getElementById('openSupportModalCard');
  if (!openSupportCard) return;

  openSupportCard.addEventListener('click', () => {
    const activeUser = window.railAuth?.currentUser;
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.innerHTML = `
      <div class="modal-content auth-modal-card" style="max-width:520px;">
        <div class="auth-modal-head" style="background: linear-gradient(135deg, #173267 0%, #20448c 100%);">
          <div class="auth-brand-badge">
            <span style="font-size:24px;">💬</span>
            <div>
              <h3 style="color:#ffd94f;">RailYatri Helpdesk & Support</h3>
              <p>Direct priority resolution within 15 minutes</p>
            </div>
          </div>
          <button type="button" class="close-modal" id="closeSupportModalBtn">✕</button>
        </div>

        <div style="padding:20px 22px;">
          <form id="customerSupportForm">
            <div class="form-group" style="margin-bottom:12px;">
              <label style="display:block; font-size:11px; font-weight:700; color:var(--muted); margin-bottom:5px;">Select Issue Category</label>
              <select id="supportCategory" style="width:100%; min-height:40px; border-radius:6px; border:1px solid var(--line); padding:0 10px; font-family:inherit; background:var(--paper); color:var(--ink);" required>
                <option value="payment">💳 Payment Deducted / Refund Inquiry</option>
                <option value="cancellation">🎫 Ticket Cancellation & Clerkage Query</option>
                <option value="pnr">📋 PNR Confirmation & Charting Status</option>
                <option value="delay">🚆 Train Delay, Reschedule or Platform Change</option>
                <option value="food">🍱 Station Food Delivery Issue</option>
                <option value="general">ℹ️ General Inquiry / Other</option>
              </select>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
              <div class="form-group">
                <label style="display:block; font-size:11px; font-weight:700; color:var(--muted); margin-bottom:5px;">PNR / Train No. (Optional)</label>
                <input type="text" id="supportPnrInput" placeholder="e.g. 2846159273" value="2846159273" style="width:100%; min-height:38px; border-radius:6px; border:1px solid var(--line); padding:0 10px; font-family:inherit;" />
              </div>
              <div class="form-group">
                <label style="display:block; font-size:11px; font-weight:700; color:var(--muted); margin-bottom:5px;">Mobile Number</label>
                <input type="tel" id="supportMobileInput" placeholder="e.g. 9876543210" value="${activeUser?.mobile || '9876543210'}" required style="width:100%; min-height:38px; border-radius:6px; border:1px solid var(--line); padding:0 10px; font-family:inherit;" />
              </div>
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label style="display:block; font-size:11px; font-weight:700; color:var(--muted); margin-bottom:5px;">Describe Your Problem</label>
              <textarea id="supportMessageInput" rows="3" placeholder="Please describe how we can assist you with your train journey..." required style="width:100%; border-radius:6px; border:1px solid var(--line); padding:8px 10px; font-family:inherit; font-size:12px; resize:vertical; background:var(--paper); color:var(--ink);"></textarea>
              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
                <button type="button" class="chip-btn quick-support-prompt" data-text="Refund not received for cancelled ticket.">+ Refund issue</button>
                <button type="button" class="chip-btn quick-support-prompt" data-text="Chart not prepared for upcoming journey.">+ Chart status</button>
                <button type="button" class="chip-btn quick-support-prompt" data-text="Train delayed, need updated arrival time.">+ Train delay</button>
              </div>
            </div>

            <button type="submit" class="primary-btn" style="width:100%; justify-content:center; padding:12px;">
              Submit Support Ticket ➔
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#closeSupportModalBtn')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelectorAll('.quick-support-prompt').forEach((chip) => {
      chip.addEventListener('click', () => {
        const textarea = document.getElementById('supportMessageInput');
        if (textarea) textarea.value = chip.dataset.text;
      });
    });

    modal.querySelector('#customerSupportForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const ticketId = 'RY-SUP-' + Math.floor(10000 + Math.random() * 90000);
      const cat = document.getElementById('supportCategory')?.value;
      const pnr = document.getElementById('supportPnrInput')?.value || 'N/A';

      modal.innerHTML = `
        <div class="modal-content auth-modal-card" style="max-width:480px; text-align:center; padding:28px 24px;">
          <div style="font-size:48px; margin-bottom:12px;">🎫</div>
          <h3 style="color:#1d794e; margin:0 0 6px; font-size:20px;">Support Ticket Created!</h3>
          <p style="color:var(--muted); font-size:12px; margin:0 0 16px;">Ticket Reference ID: <b style="color:var(--deep); font-size:15px;">#${ticketId}</b></p>
          
          <div style="background:#f8fafc; border:1px solid var(--line); border-radius:8px; padding:14px; text-align:left; font-size:12px; margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:var(--muted);">Status:</span>
              <span class="badge-tag badge-green">In Progress (Priority)</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:var(--muted);">Est. Response Time:</span>
              <b>< 15 minutes</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--muted);">Linked PNR:</span>
              <b>${pnr}</b>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
            <a href="https://api.whatsapp.com/send?text=Hi%20RailYatri%20Support,%20my%20ticket%20ID%20is%20${ticketId}.%20Please%20assist." target="_blank" class="primary-btn" style="text-decoration:none; justify-content:center; background:#1d794e;">
              <span>💬</span> Chat on WhatsApp with Live Agent
            </a>
            <button type="button" class="flow-back" id="closeTicketSuccessBtn" style="justify-content:center;">
              Done / Close
            </button>
          </div>
        </div>
      `;

      modal.querySelector('#closeTicketSuccessBtn')?.addEventListener('click', () => modal.remove());
      showToast(`Support ticket #${ticketId} submitted! Support agent assigned.`);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  autoTrackFromUrl();
  autoCheckPnrFromUrl();
  initTripsPage();
  initSupportModal();
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

