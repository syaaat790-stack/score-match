/**
 * 🏆 SCOREMATCH — Live Sports & Chess
 * 📜 JavaScript Core Module
 * ✅ Modular | Type-safe | Error-resilient | Testable
 * 📅 Last Updated: December 23, 2025
 */

// ==============================
// 🔧 MAIN MODULE: ScoreMatch
// ==============================
class ScoreMatch {
    // ------------------------------
    // 🧩 Constructor & Init
    // ------------------------------
    constructor() {
        // 🗃️ State
        this.state = {
            currentUser: null,
            emailCheckTimeout: null,
            dailyUpdateScheduled: false
        };

        // 🧭 DOM Cache (Optimized: query once)
        this.DOM = {
            // Auth
            authContainer: document.getElementById('auth-container'),
            appContainer: document.getElementById('app-container'),
            loginForm: document.getElementById('login-form'),
            signupForm: document.getElementById('signup-form'),
            otpForm: document.getElementById('otp-form'),
            loginEmail: document.getElementById('login-email'),
            loginPassword: document.getElementById('login-password'),
            signupName: document.getElementById('signup-name'),
            signupEmail: document.getElementById('signup-email'),
            signupPassword: document.getElementById('signup-password'),
            otpCode: document.getElementById('otp-code'),
            loginBtn: document.getElementById('login-btn'),
            signupBtn: document.getElementById('signup-btn'),
            verifyOtpBtn: document.getElementById('verify-otp-btn'),
            showSignupBtn: document.getElementById('show-signup'),
            showLoginBtn: document.getElementById('show-login'),
            backToLoginBtn: document.getElementById('back-to-login'),
            
            // Email Status
            loginEmailStatus: document.getElementById('login-email-status'),
            signupEmailStatus: document.getElementById('signup-email-status'),
            otpStatus: document.getElementById('otp-status'),
            
            // App
            logoutBtn: document.getElementById('logout-btn'),
            userDisplay: document.getElementById('user-display'),
            profileNameDisplay: document.getElementById('profile-name-display'),
            profileName: document.getElementById('profile-name'),
            profileEmail: document.getElementById('profile-email'),
            profileAvatar: document.getElementById('profile-avatar'),
            liveMatchesContainer: document.getElementById('live-matches'),
            navLinks: document.querySelectorAll('.nav-link'),
            pages: document.querySelectorAll('.page'),
            notificationContainer: document.getElementById('notification-container'),
            forceDailyUpdateBtn: document.getElementById('force-daily-update')
        };

        // 🔄 Bind methods
        this.bindMethods();
    }

    bindMethods() {
        // Bind context for event handlers
        this.handleLogin = this.handleLogin.bind(this);
        this.handleSignup = this.handleSignup.bind(this);
        this.handleOTPVerify = this.handleOTPVerify.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.checkEmail = this.checkEmail.bind(this);
        this.debounce = this.debounce.bind(this);
    }

    // ------------------------------
    // 🚀 Initialize App
    // ------------------------------
    init() {
        this.setupStorage();
        this.setupEventListeners();
        this.checkInitialLogin();
        this.showToast('👋 Selamat datang di ScoreMatch!', 'info', 3000);
    }

    // ------------------------------
    // 🗃️ Storage Management
    // ------------------------------
    setupStorage() {
        // Initialize demo users if none exist
        const users = this.getUsers();
        if (users.length === 0) {
            this.saveUsers([
                { name: "Admin ScoreMatch", email: "admin@gmail.com", password: "admin123" },
                { name: "User Demo", email: "user@gmail.com", password: "user123" }
            ]);
        }

        // Load current user
        this.state.currentUser = this.getCurrentUser();
    }

    getUsers() {
        try {
            return JSON.parse(localStorage.getItem('users') || '[]');
        } catch (e) {
            console.error('❌ Gagal memuat users:', e);
            return [];
        }
    }

    saveUsers(users) {
        try {
            localStorage.setItem('users', JSON.stringify(users));
        } catch (e) {
            console.error('❌ Gagal menyimpan users:', e);
            this.showToast('Gagal menyimpan data. Penyimpanan penuh?', 'error');
        }
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser') || 'null');
        } catch (e) {
            console.error('❌ Gagal memuat currentUser:', e);
            return null;
        }
    }

    saveCurrentUser(user) {
        try {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.state.currentUser = user;
        } catch (e) {
            console.error('❌ Gagal menyimpan currentUser:', e);
            this.showToast('Gagal login. Penyimpanan penuh?', 'error');
        }
    }

    removeCurrentUser() {
        localStorage.removeItem('currentUser');
        this.state.currentUser = null;
    }

    getLastDailyUpdate() {
        return localStorage.getItem('lastDailyUpdate');
    }

    setLastDailyUpdate() {
        localStorage.setItem('lastDailyUpdate', Date.now().toString());
    }

    // ------------------------------
    // 🎯 Event Listeners
    // ------------------------------
    setupEventListeners() {
        // 🔐 Auth Toggles
        this.DOM.showSignupBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('signup');
        });
        this.DOM.showLoginBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });
        this.DOM.backToLoginBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
            sessionStorage.clear();
        });

        // 📝 Form Submits
        this.DOM.loginBtn?.addEventListener('click', this.handleLogin);
        this.DOM.signupBtn?.addEventListener('click', this.handleSignup);
        this.DOM.verifyOtpBtn?.addEventListener('click', this.handleOTPVerify);
        this.DOM.logoutBtn?.addEventListener('click', this.handleLogout);

        // ✉️ Email Validation (Debounced)
        this.DOM.loginEmail?.addEventListener('input', this.debounce(() => {
            this.checkEmail(this.DOM.loginEmail.value.trim(), true);
        }, 500));
        this.DOM.signupEmail?.addEventListener('input', this.debounce(() => {
            this.checkEmail(this.DOM.signupEmail.value.trim(), false);
        }, 500));

        // 🔔 Navigation
        this.DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e, link));
        });

        // 🔄 Force Daily Update (Debug)
        this.DOM.forceDailyUpdateBtn?.addEventListener('click', () => {
            localStorage.removeItem('lastDailyUpdate');
            this.performDailyUpdate();
            this.showToast('✅ Daily update dipaksa dijalankan!', 'daily');
        });

        // 📲 Auto-refresh every 30s
        setInterval(() => {
            if (!this.DOM.appContainer.classList.contains('hidden')) {
                this.loadMatches();
            }
        }, 30000);
    }

    showForm(formType) {
        this.DOM.loginForm.classList.toggle('hidden', formType !== 'login');
        this.DOM.signupForm.classList.toggle('hidden', formType !== 'signup');
        this.DOM.otpForm.classList.add('hidden');
        this.clearEmailStatus();
    }

    clearEmailStatus() {
        this.DOM.loginEmailStatus?.classList.add('hidden');
        this.DOM.signupEmailStatus?.classList.add('hidden');
    }

    // ------------------------------
    // 🔐 Authentication Logic
    // ------------------------------
    handleLogin() {
        const email = this.DOM.loginEmail.value.trim();
        const password = this.DOM.loginPassword.value.trim();

        // ✅ Validation
        if (!email || !password) {
            return this.showToast('❌ Email dan password wajib diisi', 'error');
        }
        if (!this.isGmail(email)) {
            return this.showToast('❌ Hanya akun @gmail.com yang diizinkan', 'error');
        }

        // 🔍 Find user
        const user = this.getUsers().find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );

        if (!user) {
            const isRegistered = this.getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
            return this.showToast(isRegistered ? '❌ Password salah!' : '❌ Akun tidak ditemukan', 'error');
        }

        // 📲 Simulate OTP flow
        this.initiateOTPFlow({ name: user.name, email: user.email }, 'login');
    }

    handleSignup() {
        const name = this.DOM.signupName.value.trim();
        const email = this.DOM.signupEmail.value.trim();
        const password = this.DOM.signupPassword.value.trim();

        // ✅ Validation
        if (!name || !email || !password) {
            return this.showToast('❌ Semua field wajib diisi', 'error');
        }
        if (password.length < 6) {
            return this.showToast('⚠️ Password minimal 6 karakter', 'warning');
        }
        if (!this.isGmail(email)) {
            return this.showToast('❌ Hanya @gmail.com yang diizinkan', 'error');
        }

        // 🔍 Check duplicate
        if (this.getUsers().some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return this.showToast('❌ Email sudah terdaftar!', 'error');
        }

        // 📲 Simulate OTP flow
        this.initiateOTPFlow({ name, email, password }, 'signup');
    }

    initiateOTPFlow(userData, type) {
        const otp = this.generateOTP();
        console.log(`[DEBUG] OTP untuk ${userData.email}: ${otp} (type: ${type})`);

        // 🧠 Store in session
        sessionStorage.setItem(type === 'signup' ? 'pendingSignup' : 'pendingUser', JSON.stringify(userData));
        sessionStorage.setItem('expectedOtp', otp);

        // 🎯 Switch to OTP form
        this.showForm('otp');
        document.getElementById('otp-instruction').textContent = 
            `Kode verifikasi untuk ${userData.email}: ${otp} (simulasi)`;
        this.DOM.otpCode.value = '';
        this.DOM.otpCode.focus();
    }

    handleOTPVerify() {
        const inputOtp = this.DOM.otpCode.value.trim();
        const expectedOtp = sessionStorage.getItem('expectedOtp');
        
        if (!expectedOtp) {
            return this.showToast('⏳ Sesi kadaluarsa. Silakan login ulang.', 'error');
        }

        if (inputOtp !== expectedOtp) {
            this.DOM.otpCode.value = '';
            this.DOM.otpCode.focus();
            return this.showToast('❌ Kode OTP salah! Coba lagi.', 'error');
        }

        // ✅ Success: finalize auth
        const pendingUser = JSON.parse(sessionStorage.getItem('pendingUser') || 'null');
        const pendingSignup = JSON.parse(sessionStorage.getItem('pendingSignup') || 'null');
        let user = null;

        if (pendingSignup) {
            const users = this.getUsers();
            users.push(pendingSignup);
            this.saveUsers(users);
            user = { name: pendingSignup.name, email: pendingSignup.email };
            sessionStorage.removeItem('pendingSignup');
        } else if (pendingUser) {
            user = pendingUser;
            sessionStorage.removeItem('pendingUser');
        }

        sessionStorage.removeItem('expectedOtp');
        this.saveCurrentUser(user);
        this.showApp(user);
        this.showToast('✅ Login berhasil!', 'success');
    }

    handleLogout() {
        this.removeCurrentUser();
        sessionStorage.clear();
        this.DOM.appContainer.classList.add('hidden');
        this.DOM.authContainer.classList.remove('hidden');
        this.DOM.authContainer.style.opacity = '1';
        this.clearLoginForm();
        this.DOM.navLinks[0]?.click(); // Reset nav to dashboard
    }

    clearLoginForm() {
        this.DOM.loginEmail.value = '';
        this.DOM.loginPassword.value = '';
        this.clearEmailStatus();
    }

    // ------------------------------
    // ✉️ Email Validation
    // ------------------------------
    isGmail(email) {
        return typeof email === 'string' && email.toLowerCase().endsWith('@gmail.com');
    }

    checkEmail(email, isLogin) {
        const statusEl = isLogin ? this.DOM.loginEmailStatus : this.DOM.signupEmailStatus;
        if (!email || email.length < 5) {
            statusEl?.classList.add('hidden');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        const isGoogle = this.isGmail(email);

        statusEl?.classList.remove('hidden');
        statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memeriksa...';

        if (!isValid) {
            statusEl.className = 'email-status warning';
            statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Format email tidak valid';
            return;
        }

        if (!isGoogle) {
            statusEl.className = 'email-status warning';
            statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Hanya @gmail.com yang diizinkan!';
            return;
        }

        // 🕒 Simulate API delay
        setTimeout(() => {
            const exists = this.getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());

            if (isLogin) {
                statusEl.className = `email-status ${exists ? 'available' : 'taken'}`;
                statusEl.innerHTML = exists 
                    ? '<i class="fas fa-check-circle"></i> Akun Google ditemukan'
                    : '<i class="fas fa-times-circle"></i> Akun tidak terdaftar';
            } else {
                statusEl.className = `email-status ${exists ? 'taken' : 'available'}`;
                statusEl.innerHTML = exists 
                    ? '<i class="fas fa-times-circle"></i> Email sudah terdaftar'
                    : '<i class="fas fa-check-circle"></i> Email tersedia';
            }
        }, 300);
    }

    // ------------------------------
    // 🧠 Utilities
    // ------------------------------
    debounce(func, delay) {
        return (...args) => {
            clearTimeout(this.state.emailCheckTimeout);
            this.state.emailCheckTimeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    setButtonLoading(btn, loading = true) {
        if (!btn) return;
        if (loading) {
            btn.disabled = true;
            btn.innerHTML = '<span class="loader"></span> Memproses...';
        } else {
            btn.disabled = false;
            btn.innerHTML = btn.textContent.replace(' Memproses...', '');
        }
    }

    // ------------------------------
    // 📣 Notifications
    // ------------------------------
    showToast(message, type = 'info', duration = 5000) {
        if (!this.DOM.notificationContainer) return;

        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            daily: 'sync-alt'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;

        this.DOM.notificationContainer.appendChild(toast);

        // Auto-remove
        setTimeout(() => {
            toast.style.animation = 'fadeOutRight 0.5s forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 500);
        }, duration);
    }

    // ------------------------------
    // 📅 Daily Update System
    // ------------------------------
    performDailyUpdate() {
        const now = Date.now();
        const lastUpdate = this.getLastDailyUpdate();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        // 🔍 Count live matches
        const liveCount = this.DOM.liveMatchesContainer.querySelectorAll('.match-card.live').length;
        if (liveCount === 0) return; // Skip if no live matches

        // 🕒 Check if 24h passed
        if (!lastUpdate || (now - parseInt(lastUpdate)) >= twentyFourHours) {
            const msg = `📈 Update harian: ${liveCount} pertandingan live hari ini!`;
            this.showToast(msg, 'daily', 6000);
            this.setLastDailyUpdate();
            console.log('[DAILY UPDATE]', msg);
        }
    }

    // ------------------------------
    // 🎮 App UI Management
    // ------------------------------
    showApp(user) {
        if (!user) return;

        const initial = user.name.charAt(0).toUpperCase();
        
        // 🖼️ Update UI
        this.DOM.userDisplay.textContent = initial;
        this.DOM.profileAvatar.textContent = initial;
        this.DOM.profileName.textContent = user.name;
        this.DOM.profileEmail.textContent = user.email;
        this.DOM.profileNameDisplay.textContent = user.name;

        // 🎬 Smooth transition
        this.DOM.authContainer.style.opacity = '0';
        setTimeout(() => {
            this.DOM.authContainer.classList.add('hidden');
            this.DOM.appContainer.classList.remove('hidden');
            this.loadMatches();
        }, 300);
    }

    handleNavClick(e, link) {
        e.preventDefault();
        const target = link.dataset.page;

        // 🧭 Update active state
        this.DOM.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // 📄 Show target page
        this.DOM.pages.forEach(page => page.classList.add('hidden'));
        document.getElementById(`${target}-page`)?.classList.remove('hidden');
    }

    loadMatches() {
        if (!this.DOM.liveMatchesContainer) return;

        // 📊 Mock data (replace with API call in production)
        const matches = [
            { home: "Manchester United", away: "Liverpool", homeScore: 2, awayScore: 1, time: "68'", live: true, sport: "football" },
            { home: "Real Madrid", away: "Barcelona", homeScore: 1, awayScore: 3, time: "82'", live: true, sport: "football" },
            { home: "Lakers", away: "Warriors", homeScore: 94, awayScore: 98, time: "Q4 2:18", live: true, sport: "basketball" },
            { home: "Magnus Carlsen", away: "Hikaru Nakamura", time: "Move 42", turn: "Black to move", live: true, sport: "chess" },
            { home: "Djokovic", away: "Alcaraz", homeScore: 2, awayScore: 1, time: "4th Set", live: true, sport: "tennis" }
        ];

        // 🎨 Render
        this.DOM.liveMatchesContainer.innerHTML = matches.map(match => this.renderMatchCard(match)).join('');

        // 🔁 Trigger daily update check
        this.performDailyUpdate();
    }

    renderMatchCard(match) {
        let left, center, right;

        if (match.sport === 'chess') {
            left = `<span class="team chess">${match.home}</span>`;
            right = `<span class="team chess">${match.away}</span>`;
            center = `
                <div class="chess-info">
                    <div class="time">${match.time}</div>
                    <div class="turn">${match.turn}</div>
                </div>
            `;
        } else {
            left = `<span class="score home-score">${match.homeScore}</span>`;
            right = `<span class="score away-score">${match.awayScore}</span>`;
            center = `<span class="time">${match.time}</span>`;
        }

        return `
            <div class="match-card ${match.live ? 'live' : ''}">
                <div class="match-content">
                    <div class="match-side left">${left}</div>
                    <div class="match-center">${center}</div>
                    <div class="match-side right">${right}</div>
                </div>
                <div class="match-teams">
                    <span class="team home">${match.home}</span>
                    <span class="vs">–</span>
                    <span class="team away">${match.away}</span>
                </div>
            </div>
        `;
    }

    // ------------------------------
    // ▶️ Initial Check
    // ------------------------------
    checkInitialLogin() {
        if (this.state.currentUser) {
            this.showApp(this.state.currentUser);
        }
    }
}

// ==============================
// 🚀 APP BOOTSTRAP
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    // ✅ Initialize ScoreMatch
    const app = new ScoreMatch();
    app.init();

    // 🌐 Optional: Expose to global for debugging
    window.ScoreMatchApp = app;
});
