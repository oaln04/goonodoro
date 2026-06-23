const API_URL = 'https://goonodoro-backend-production.up.railway.app';

let minutes = 25;
let seconds = 0;
let sessionCount = 0;
let timer = null;
let isBreak = false;
let sessionStarted = false;
let startTime;
let totalSeconds;
let remainingSeconds;

const tokenStorageKey = 'goonodoroToken';
let authToken = localStorage.getItem(tokenStorageKey);
let currentUser = null;

const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const card = document.querySelector('.card');
const overlay = document.getElementById('overlay');
const modeEl = document.getElementById('mode');
const timerEl = document.getElementById('timer');
const sessionCountEl = document.getElementById('sessionCount');
const loggedOutView = document.getElementById('loggedOutView');
const loggedInView = document.getElementById('loggedInView');
const profileText = document.getElementById('profileText');
const authMessage = document.getElementById('authMessage');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showLoginBtn = document.getElementById('showLogin');
const showRegisterBtn = document.getElementById('showRegister');
const logoutBtn = document.getElementById('logout');
const leaderboardEl = document.getElementById('leaderboard');

function setAuthMessage(message, isError = false) {
    authMessage.textContent = message;
    authMessage.classList.toggle('error', isError);
}

function setAuthMode(mode) {
    const isLogin = mode === 'login';

    loginForm.classList.toggle('hidden', !isLogin);
    registerForm.classList.toggle('hidden', isLogin);
    showLoginBtn.classList.toggle('active', isLogin);
    showRegisterBtn.classList.toggle('active', !isLogin);
    setAuthMessage('');
}

async function apiRequest(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error?.message || 'Something went wrong.');
    }

    return data;
}

function updateAuthUI() {
    const isLoggedIn = Boolean(authToken && currentUser);

    loggedOutView.classList.toggle('hidden', isLoggedIn);
    loggedInView.classList.toggle('hidden', !isLoggedIn);

    if (isLoggedIn) {
        profileText.textContent = `${currentUser.username} | Lifetime Sessions: ${sessionCount}`;
    }
}

function updateSessionCount() {
    sessionCountEl.textContent = `Sessions Completed: ${sessionCount}`;
    updateAuthUI();
}

async function loadProfile() {
    if (!authToken) {
        currentUser = null;
        updateAuthUI();
        updateSessionCount();
        return;
    }

    try {
        const data = await apiRequest('/users/me');
        currentUser = data.user;
        sessionCount = Number(data.user.lifetime_sessions || 0);
        updateSessionCount();
    } catch (error) {
        localStorage.removeItem(tokenStorageKey);
        authToken = null;
        currentUser = null;
        sessionCount = 0;
        updateSessionCount();
        setAuthMessage('Session expired. Please log in again.', true);
    }
}

async function loadLeaderboard() {
    try {
        const data = await apiRequest('/leaderboard', {
            headers: {},
        });

        leaderboardEl.innerHTML = '';

        if (!data.leaderboard || data.leaderboard.length === 0) {
            const item = document.createElement('li');
            item.textContent = 'No sessions yet';
            leaderboardEl.appendChild(item);
            return;
        }

        data.leaderboard.forEach((entry) => {
            const item = document.createElement('li');
            const name = document.createElement('span');
            const count = document.createElement('strong');

            name.textContent = entry.username;
            count.textContent = entry.session_count;
            item.append(name, count);
            leaderboardEl.appendChild(item);
        });
    } catch (error) {
        leaderboardEl.innerHTML = '<li>Leaderboard unavailable</li>';
    }
}

async function verifyEmailFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        return;
    }

    try {
        const data = await apiRequest('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });

        setAuthMode('login');
        setAuthMessage(data.message || 'Email verified. You can log in now.');
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        setAuthMessage(error.message, true);
    }
}

async function recordCompletedPomodoro() {
    if (!authToken) {
        sessionCount++;
        updateSessionCount();
        return;
    }

    try {
        const data = await apiRequest('/sessions', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        sessionCount = Number(data.lifetime_sessions || sessionCount + 1);
        updateSessionCount();
        loadLeaderboard();
    } catch (error) {
        setAuthMessage(`Session was not saved: ${error.message}`, true);
    }
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setAuthMessage('Logging in...');

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value,
            }),
        });

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem(tokenStorageKey, authToken);
        loginForm.reset();
        setAuthMessage('Logged in.');
        await loadProfile();
        await loadLeaderboard();
    } catch (error) {
        setAuthMessage(error.message, true);
    }
});

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setAuthMessage('Creating account...');

    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: document.getElementById('registerUsername').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
            }),
        });

        registerForm.reset();
        setAuthMode('login');
        setAuthMessage(data.message || 'Account created. Check your email to verify it.');
    } catch (error) {
        setAuthMessage(error.message, true);
    }
});

showLoginBtn.onclick = () => setAuthMode('login');
showRegisterBtn.onclick = () => setAuthMode('register');

logoutBtn.onclick = () => {
    authToken = null;
    currentUser = null;
    sessionCount = 0;
    localStorage.removeItem(tokenStorageKey);
    updateSessionCount();
    setAuthMessage('Logged out.');
};

startBtn.onclick = function() {
    clickSound();

    if (timer === null) {
        card.classList.remove('paused', 'break');
        overlay.classList.remove('yellow', 'orange');

        card.classList.add('running');
        overlay.classList.add('red');

        modeEl.style.color = 'red';

        if (!sessionStarted && !isBreak) {
            const workInput = parseInt(document.getElementById('workDuration').value, 10);

            if (!isNaN(workInput) && workInput > 0) {
                minutes = workInput;
            } else {
                minutes = 25;
            }

            totalSeconds = minutes * 60;
        }

        startTime = Date.now();
        sessionStarted = true;

        timer = setInterval(updateTimer, 1000);
        modeEl.textContent = 'Lock in!';
    }
};

pauseBtn.onclick = function() {
    clickSound();

    if (timer !== null) {
        clearInterval(timer);
        timer = null;
        totalSeconds = remainingSeconds;

        card.classList.remove('running', 'break');
        overlay.classList.remove('red', 'orange');

        card.classList.add('paused');
        overlay.classList.add('yellow');

        modeEl.textContent = 'Paused, lock in soon or else.';
        modeEl.style.color = 'yellow';
    }
};

resetBtn.onclick = function() {
    clickSound();

    clearInterval(timer);
    timer = null;

    sessionStarted = false;
    isBreak = false;

    const workInput = parseInt(document.getElementById('workDuration').value, 10);

    if (!isNaN(workInput) && workInput > 0) {
        minutes = workInput;
    } else {
        minutes = 25;
    }

    seconds = 0;
    totalSeconds = minutes * 60;
    startTime = null;
    remainingSeconds = totalSeconds;

    card.classList.remove('running', 'paused', 'break');
    overlay.classList.remove('red', 'yellow', 'orange');

    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:00`;
    modeEl.textContent = 'Ready to lock in?';
    modeEl.style.color = '#FF4500';
};

async function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = totalSeconds - elapsed;
    remainingSeconds = Math.max(remaining, 0);

    if (remaining <= 0) {
        timerEl.textContent = '00:00';

        clearInterval(timer);
        timer = null;

        if (!isBreak) {
            await recordCompletedPomodoro();

            const breakInput = parseInt(document.getElementById('goonDuration').value, 10);

            if (!isNaN(breakInput) && breakInput > 0) {
                minutes = breakInput;
            } else {
                minutes = 5;
            }

            seconds = 0;
            isBreak = true;

            card.classList.remove('running', 'paused');
            overlay.classList.remove('red', 'yellow');

            card.classList.add('break');
            overlay.classList.add('orange');

            modeEl.style.color = 'orange';
            modeEl.textContent = 'Enjoy your break!';

            playSound(523);

            totalSeconds = minutes * 60;
            startTime = Date.now();
            timer = setInterval(updateTimer, 1000);
        } else {
            isBreak = false;
            sessionStarted = false;

            card.classList.remove('break');
            overlay.classList.remove('orange');

            modeEl.style.color = '#FF4500';
            modeEl.textContent = 'Ready to lock in?';

            playSound(330);
        }

        return;
    }

    const displayMinutes = Math.floor(remaining / 60);
    const displaySeconds = remaining % 60;

    timerEl.textContent =
        `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
}

function playSound(frequency) {
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    oscillator.type = 'sine';
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = frequency;
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.3);
}

function clickSound() {
    const audioCtx = new AudioContext();
    const bufferSize = audioCtx.sampleRate * 0.08;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start();
}

updateSessionCount();
verifyEmailFromUrl();
loadProfile();
loadLeaderboard();
