<script>
    document.addEventListener('DOMContentLoaded', () => {
        // Inisialisasi data pengguna demo
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([
                { name: "Admin", email: "admin@gmail.com", password: "admin123" }
            ]));
        }

        // === LOGIN ===
        document.getElementById('login-btn').onclick = () => {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                alert("Harap isi email dan password.");
                return;
            }

            // Untuk demo: langsung login sebagai pengguna tetap
            const user = { name: "Pengguna", email: "user@gmail.com" };
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Nonaktifkan klik & mulai fade-out
            const authContainer = document.getElementById('auth-container');
            authContainer.style.pointerEvents = 'none';
            authContainer.style.opacity = '0';

            setTimeout(() => {
                authContainer.classList.add('hidden');
                document.getElementById('app-container').classList.remove('hidden');
                document.getElementById('profile-name-display').textContent = user.name;
                document.getElementById('profile-avatar').textContent = user.name.charAt(0).toUpperCase();
                loadMatches();
            }, 300);
        };

        // === SIGNUP (opsional, untuk konsistensi) ===
        document.getElementById('signup-btn').onclick = () => {
            alert("Fitur daftar belum aktif di demo. Coba login langsung.");
        };

        // === OTP (opsional) ===
        document.getElementById('verify-otp-btn').onclick = () => {
            alert("Verifikasi OTP belum diimplementasi.");
        };

        // === Navigasi antar form ===
        document.getElementById('show-signup').onclick = (e) => {
            e.preventDefault();
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('signup-form').classList.remove('hidden');
        };

        document.getElementById('show-login').onclick = (e) => {
            e.preventDefault();
            document.getElementById('signup-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
        };

        document.getElementById('back-to-login').onclick = (e) => {
            e.preventDefault();
            document.getElementById('otp-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
        };

        // === LOGOUT ===
        document.getElementById('logout-btn').onclick = () => {
            localStorage.removeItem('currentUser');

            const appContainer = document.getElementById('app-container');
            const authContainer = document.getElementById('auth-container');

            appContainer.classList.add('hidden');
            authContainer.classList.remove('hidden');
            authContainer.style.opacity = '1';
            authContainer.style.pointerEvents = 'auto'; // Kembalikan interaksi

            // Reset form (opsional)
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
        };

        // === NAVIGASI MENU (Dashboard & Profil) ===
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');

                document.querySelectorAll('.page').forEach(page => {
                    page.classList.add('hidden');
                });
                document.querySelectorAll('.nav-link').forEach(nav => {
                    nav.classList.remove('active');
                });

                document.getElementById(targetPage + '-page').classList.remove('hidden');
                link.classList.add('active');
            });
        });

        // === FUNGSI MUAT MATCH ===
        function loadMatches() {
            const container = document.getElementById('live-matches');
            container.innerHTML = `
                <div class="match-card live">
                    <div class="match-content">
                        <div class="match-side left"><span class="score home-score">2</span></div>
                        <div class="match-center"><span class="time">68'</span></div>
                        <div class="match-side right"><span class="score away-score">1</span></div>
                    </div>
                    <div class="match-teams">
                        <span>Manchester Utd</span>
                        <span class="vs">–</span>
                        <span>Liverpool</span>
                    </div>
                </div>
                <div class="match-card live">
                    <div class="match-content">
                        <div class="match-side left"><span class="team">Carlsen</span></div>
                        <div class="match-center">
                            <div class="chess-info">
                                <div class="time">Move 42</div>
                                <div class="turn">Black to move</div>
                            </div>
                        </div>
                        <div class="match-side right"><span class="team">Nakamura</span></div>
                    </div>
                    <div class="match-teams">
                        <span class="chess">Magnus Carlsen</span>
                        <span class="vs">–</span>
                        <span class="chess">Hikaru Nakamura</span>
                    </div>
                </div>
            `;
        }

        // === CEK STATUS LOGIN SAAT HALAMAN DIMUAT ===
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            document.getElementById('profile-name-display').textContent = user.name;
            document.getElementById('profile-avatar').textContent = user.name.charAt(0).toUpperCase();
            document.getElementById('profile-name').textContent = user.name;
            document.getElementById('profile-email').textContent = user.email;
            loadMatches();
        }
    });
</script>
