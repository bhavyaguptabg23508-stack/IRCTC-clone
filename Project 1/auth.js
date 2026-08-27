// auth.js — Comprehensive Demo Authentication & User State Management for RailYatri

const DEMO_USERS = {
  aarav: {
    id: 'aarav',
    name: 'Aarav Sharma',
    shortName: 'Aarav S.',
    age: 28,
    gender: 'Male',
    irctcUser: 'aarav_rail99',
    mobile: '9876543210',
    email: 'aarav.sharma@example.com',
    walletBalance: 3500,
    avatar: '👨‍💼',
    badge: 'Frequent Traveler',
    badgeColor: 'badge-blue'
  },
  priya: {
    id: 'priya',
    name: 'Priya Sharma',
    shortName: 'Priya S.',
    age: 26,
    gender: 'Female',
    irctcUser: 'priya_exp',
    mobile: '9811223344',
    email: 'priya.sharma@example.com',
    walletBalance: 1200,
    avatar: '👩‍💼',
    badge: 'Executive Traveler',
    badgeColor: 'badge-green'
  },
  ramesh: {
    id: 'ramesh',
    name: 'Ramesh Sharma',
    shortName: 'Ramesh S.',
    age: 65,
    gender: 'Male',
    irctcUser: 'ramesh_sharma',
    mobile: '9822334455',
    email: 'ramesh.sharma@example.com',
    walletBalance: 500,
    avatar: '👨‍🦳',
    badge: 'Senior Citizen (65+)',
    badgeColor: 'badge-orange'
  }
};

class AuthManager {
  constructor() {
    this.currentUser = this.loadUser();
    this.initDOM();
  }

  loadUser() {
    try {
      const saved = localStorage.getItem('rail_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  saveUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('rail_active_user', JSON.stringify(user));
      localStorage.setItem('demoUserName', user.name);
    } else {
      localStorage.removeItem('rail_active_user');
      localStorage.removeItem('demoUserName');
    }
    window.dispatchEvent(new CustomEvent('railAuthChanged', { detail: { user } }));
    this.updateHeaderUI();
  }

  signInAs(profileKey) {
    const user = DEMO_USERS[profileKey];
    if (user) {
      this.saveUser(user);
      this.closeModal();
      if (typeof showToast === 'function') {
        showToast(`Signed in as ${user.name} (${user.badge})`);
      }
    }
  }

  signInCustom(name, irctcUser, mobile, email) {
    const user = {
      id: 'custom_' + Date.now(),
      name: name || 'Guest Passenger',
      shortName: name ? name.split(' ')[0] : 'Guest',
      age: 30,
      gender: 'Male',
      irctcUser: irctcUser || 'irctc_user',
      mobile: mobile || '9876543210',
      email: email || `${(name || 'guest').toLowerCase().replace(/\s+/g, '')}@example.com`,
      walletBalance: 1500,
      avatar: '👤',
      badge: 'Verified Traveler',
      badgeColor: 'badge-green'
    };
    this.saveUser(user);
    this.closeModal();
    if (typeof showToast === 'function') {
      showToast(`Welcome, ${user.name}!`);
    }
  }

  signOut() {
    this.saveUser(null);
    if (typeof showToast === 'function') {
      showToast('Signed out of demo account.');
    }
  }

  initDOM() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.injectModal();
    this.updateHeaderUI();
    this.attachEvents();
  }

  updateHeaderUI() {
    const profileBtns = document.querySelectorAll('.profile, #signInBtn');
    const existingDropdown = document.getElementById('userProfileDropdown');
    if (existingDropdown) existingDropdown.remove();

    profileBtns.forEach((btn) => {
      if (this.currentUser) {
        btn.classList.add('logged-in');
        btn.innerHTML = `
          <span class="user-chip-avatar">${this.currentUser.avatar}</span>
          <span class="user-chip-name">${this.currentUser.shortName}</span>
          <span class="user-chip-wallet">₹ ${this.currentUser.walletBalance.toLocaleString('en-IN')}</span>
          <span class="user-chip-arrow">▾</span>
        `;
        btn.setAttribute('aria-label', `Signed in as ${this.currentUser.name}`);
      } else {
        btn.classList.remove('logged-in');
        btn.innerHTML = `Sign in <span>→</span>`;
        btn.setAttribute('aria-label', 'Sign in');
      }
    });
  }

  toggleDropdown(triggerBtn) {
    const existing = document.getElementById('userProfileDropdown');
    if (existing) {
      existing.remove();
      return;
    }
    if (!this.currentUser) {
      this.openModal();
      return;
    }

    const rect = triggerBtn.getBoundingClientRect();
    const dropdown = document.createElement('div');
    dropdown.id = 'userProfileDropdown';
    dropdown.className = 'user-profile-dropdown';
    dropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
    dropdown.style.right = `${Math.max(16, window.innerWidth - rect.right)}px`;

    dropdown.innerHTML = `
      <div class="dropdown-header">
        <div class="user-info-row">
          <div class="user-avatar-large">${this.currentUser.avatar}</div>
          <div>
            <b>${this.currentUser.name}</b>
            <span class="user-email-tag">${this.currentUser.email}</span>
            <span class="badge-tag ${this.currentUser.badgeColor}" style="margin-top:4px; display:inline-block;">${this.currentUser.badge}</span>
          </div>
        </div>
        <div class="dropdown-wallet-strip">
          <span>RailYatri Wallet Balance:</span>
          <b>₹ ${this.currentUser.walletBalance.toLocaleString('en-IN')}</b>
        </div>
      </div>
      <div class="dropdown-menu-list">
        <a href="trips.html" class="dropdown-menu-item">
          <span>🎫</span>
          <div><b>My Bookings & E-Tickets</b><small>View confirmed & past journeys</small></div>
        </a>
        <a href="book.html" class="dropdown-menu-item">
          <span>🚆</span>
          <div><b>Book New Ticket</b><small>Search trains & reserve seats</small></div>
        </a>
        <a href="food.html" class="dropdown-menu-item">
          <span>🍱</span>
          <div><b>Order Food on Train</b><small>Station delivered hot meals</small></div>
        </a>
        <button type="button" class="dropdown-menu-item" id="switchDemoUserBtn">
          <span>🔄</span>
          <div><b>Switch Demo Profile</b><small>Aarav / Priya / Ramesh</small></div>
        </button>
      </div>
      <div class="dropdown-footer">
        <button type="button" class="sign-out-btn" id="signOutActionBtn">
          <span>🚪</span> Sign Out
        </button>
      </div>
    `;

    document.body.appendChild(dropdown);

    dropdown.querySelector('#switchDemoUserBtn')?.addEventListener('click', () => {
      dropdown.remove();
      this.openModal();
    });

    dropdown.querySelector('#signOutActionBtn')?.addEventListener('click', () => {
      dropdown.remove();
      this.signOut();
    });

    // Close when clicking outside
    const closeListener = (e) => {
      if (!dropdown.contains(e.target) && !triggerBtn.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('click', closeListener);
      }
    };
    setTimeout(() => document.addEventListener('click', closeListener), 10);
  }

  injectModal() {
    let modal = document.getElementById('signInModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'signInModal';
      modal.className = 'modal';
      modal.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content auth-modal-card">
        <div class="auth-modal-head">
          <div class="auth-brand-badge">
            <span class="auth-brand-logo">R</span>
            <div>
              <h3>RailYatri Demo Sign In</h3>
              <p>IRCTC Authorized E-Ticketing Partner</p>
            </div>
          </div>
          <button type="button" class="close-modal" id="closeModalBtn" aria-label="Close modal">✕</button>
        </div>

        <div class="auth-tabs-nav">
          <button type="button" class="auth-tab-btn active" data-auth-tab="quick">⚡ 1-Tap Demo Profiles</button>
          <button type="button" class="auth-tab-btn" data-auth-tab="otp">📱 Mobile & OTP</button>
          <button type="button" class="auth-tab-btn" data-auth-tab="custom">✍️ Custom Login</button>
        </div>

        <!-- Tab 1: 1-Tap Quick Profiles -->
        <div class="auth-tab-panel active" id="authPanelQuick">
          <p class="auth-panel-hint">Select a pre-configured demo traveler to test full e-ticketing and payments:</p>
          <div class="demo-profiles-list">
            <div class="demo-profile-card" data-profile="aarav">
              <div class="demo-profile-avatar">👨‍💼</div>
              <div class="demo-profile-info">
                <div class="demo-name-row">
                  <b>Aarav Sharma</b>
                  <span class="badge-tag badge-blue">Frequent Traveler</span>
                </div>
                <span>IRCTC ID: <b>aarav_rail99</b> (Verified ✓)</span>
                <span>Mobile: +91 9876543210 · Wallet: <b>₹3,500</b></span>
              </div>
              <button type="button" class="demo-login-btn">Select ➔</button>
            </div>

            <div class="demo-profile-card" data-profile="priya">
              <div class="demo-profile-avatar">👩‍💼</div>
              <div class="demo-profile-info">
                <div class="demo-name-row">
                  <b>Priya Sharma</b>
                  <span class="badge-tag badge-green">Executive Traveler</span>
                </div>
                <span>IRCTC ID: <b>priya_exp</b> (Verified ✓)</span>
                <span>Mobile: +91 9811223344 · Wallet: <b>₹1,200</b></span>
              </div>
              <button type="button" class="demo-login-btn">Select ➔</button>
            </div>

            <div class="demo-profile-card" data-profile="ramesh">
              <div class="demo-profile-avatar">👨‍🦳</div>
              <div class="demo-profile-info">
                <div class="demo-name-row">
                  <b>Ramesh Sharma</b>
                  <span class="badge-tag badge-orange">Senior Citizen (65+)</span>
                </div>
                <span>IRCTC ID: <b>ramesh_sharma</b> (Verified ✓)</span>
                <span>Mobile: +91 9822334455 · Wallet: <b>₹500</b></span>
              </div>
              <button type="button" class="demo-login-btn">Select ➔</button>
            </div>
          </div>
        </div>

        <!-- Tab 2: Mobile Number & Demo OTP -->
        <div class="auth-tab-panel" id="authPanelOtp">
          <form id="otpAuthForm" class="auth-subform">
            <div class="form-group" style="margin-bottom:12px;">
              <label>Mobile Number (+91)</label>
              <input type="tel" id="otpMobileInput" maxlength="10" placeholder="e.g. 9876543210" value="9876543210" required />
            </div>
            <div class="otp-input-group" style="margin-bottom:14px;">
              <label>Enter 4-digit OTP</label>
              <div style="display:flex; gap:8px;">
                <input type="text" id="otpCodeInput" maxlength="4" placeholder="4829" value="4829" required style="letter-spacing:4px; font-weight:700; text-align:center; font-size:16px;" />
                <button type="button" class="chip-btn" id="autoFillOtpBtn" style="white-space:nowrap;">Auto-fill 4829</button>
              </div>
              <small style="color:var(--muted); font-size:11px; margin-top:4px; display:block;">Demo mode: OTP is prefilled as <b>4829</b>.</small>
            </div>
            <button type="submit" class="primary-btn" style="width:100%; justify-content:center;">Verify & Sign In <span>→</span></button>
          </form>
        </div>

        <!-- Tab 3: Custom Login -->
        <div class="auth-tab-panel" id="authPanelCustom">
          <form id="customAuthForm" class="auth-subform">
            <div class="form-group" style="margin-bottom:12px;">
              <label>Full Name</label>
              <input type="text" id="customNameInput" placeholder="e.g. Rohan Verma" required />
            </div>
            <div class="form-group" style="margin-bottom:12px;">
              <label>IRCTC User ID</label>
              <input type="text" id="customIrctcInput" placeholder="e.g. rohan_rail" required />
            </div>
            <div class="form-group" style="margin-bottom:14px;">
              <label>Mobile Number (+91)</label>
              <input type="tel" id="customMobileInput" maxlength="10" placeholder="e.g. 9876543210" required />
            </div>
            <button type="submit" class="primary-btn" style="width:100%; justify-content:center;">Sign In with Custom Profile <span>→</span></button>
          </form>
        </div>

        <div class="auth-modal-footer">
          <span>🔒 100% Safe Demo Authentication · Zero real data stored</span>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Open Modal / Dropdown triggers
    document.querySelectorAll('.profile, #signInBtn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.currentUser) {
          this.toggleDropdown(btn);
        } else {
          this.openModal();
        }
      });
    });

    const modal = document.getElementById('signInModal');
    const closeBtn = document.getElementById('closeModalBtn');

    closeBtn?.addEventListener('click', () => this.closeModal());
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Tab switching
    modal?.querySelectorAll('.auth-tab-btn').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        modal.querySelectorAll('.auth-tab-btn').forEach((b) => b.classList.remove('active'));
        modal.querySelectorAll('.auth-tab-panel').forEach((p) => p.classList.remove('active'));
        tabBtn.classList.add('active');
        const targetId = tabBtn.dataset.authTab === 'quick' ? 'authPanelQuick' : (tabBtn.dataset.authTab === 'otp' ? 'authPanelOtp' : 'authPanelCustom');
        const panel = document.getElementById(targetId);
        if (panel) panel.classList.add('active');
      });
    });

    // 1-Tap Quick Profiles
    modal?.querySelectorAll('.demo-profile-card').forEach((card) => {
      card.addEventListener('click', () => {
        const key = card.dataset.profile;
        this.signInAs(key);
      });
    });

    // Auto fill OTP
    modal?.querySelector('#autoFillOtpBtn')?.addEventListener('click', () => {
      const input = document.getElementById('otpCodeInput');
      if (input) input.value = '4829';
    });

    // OTP Form submit
    modal?.querySelector('#otpAuthForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const mobile = document.getElementById('otpMobileInput')?.value || '9876543210';
      this.signInCustom(`User (+91 ${mobile.slice(-4)})`, `user_${mobile.slice(-4)}`, mobile);
    });

    // Custom Form submit
    modal?.querySelector('#customAuthForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('customNameInput')?.value.trim();
      const irctc = document.getElementById('customIrctcInput')?.value.trim();
      const mobile = document.getElementById('customMobileInput')?.value.trim();
      this.signInCustom(name, irctc, mobile);
    });
  }

  openModal() {
    const modal = document.getElementById('signInModal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('open');
    }
  }

  closeModal() {
    const modal = document.getElementById('signInModal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('open');
    }
  }
}

// Instantiate globally
window.railAuth = new AuthManager();
