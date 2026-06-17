let minutes = 25;
let seconds = 0;
let sessionCount = 0;
let timer = null;
let isBreak = false;
let sessionStarted = false;
let startBtn= document.getElementById('start');
let pauseBtn= document.getElementById('pause');
let resetBtn= document.getElementById('reset');
let card = document.querySelector('.card');
let overlay = document.getElementById('overlay');
let startTime;
let totalSeconds;
let remainingSeconds;

startBtn.onclick = function() {
    clickSound();

    if (timer === null) {

        card.classList.remove('paused', 'break');
        overlay.classList.remove('yellow', 'orange');

        card.classList.add('running');
        overlay.classList.add('red');

        document.getElementById('mode').style.color = 'red';

        // ✅ ONLY set new time if not resuming
        if (!sessionStarted && !isBreak) {
            let workInput = parseInt(
                document.getElementById('workDuration').value
            );

            if (!isNaN(workInput) && workInput > 0) {
                minutes = workInput;
            } else {
                minutes = 25;
            }

            totalSeconds = minutes * 60;
        }

        // ✅ ALWAYS reset clock reference
        startTime = Date.now();

        sessionStarted = true;

        timer = setInterval(updateTimer, 1000);
        document.getElementById('mode').textContent = 'Lock in!';
    }
};
pauseBtn.onclick = function() {
    clickSound();

    if (timer !== null) {
        clearInterval(timer);
        timer = null;

        // ✅ lock current remaining time
        totalSeconds = remainingSeconds;

        card.classList.remove('running', 'break');
        overlay.classList.remove('red', 'orange');

        card.classList.add('paused');
        overlay.classList.add('yellow');

        document.getElementById('mode').textContent =
            'Paused, lock in soon or else.';
        document.getElementById('mode').style.color = 'yellow';
    }
};

resetBtn.onclick = function () {
    clickSound();

    clearInterval(timer);
    timer = null;

    sessionStarted = false;
    isBreak = false;

    // ✅ get input value
    let workInput = parseInt(document.getElementById('workDuration').value);

    if (!isNaN(workInput) && workInput > 0) {
        minutes = workInput;
    } else {
        minutes = 25; // default
    }

    seconds = 0;

    // ✅ reset timing system properly
    totalSeconds = minutes * 60;
    startTime = null;
    remainingSeconds = totalSeconds;

    // ✅ reset visuals
    card.classList.remove('running', 'paused', 'break');
    overlay.classList.remove('red', 'yellow', 'orange');

    // ✅ reset UI text
    document.getElementById('timer').textContent =
        minutes.toString().padStart(2, '0') + ':00';

    document.getElementById('mode').textContent = 'Ready to lock in?';
    document.getElementById('mode').style.color = '#FF4500';
};


function updateTimer() {

    let elapsed = Math.floor((Date.now() - startTime) / 1000);
    let remaining = totalSeconds - elapsed;
    remainingSeconds = Math.max(remaining, 0);

    if (remaining <= 0) {
        document.getElementById('timer').textContent = '00:00';

        clearInterval(timer);
        timer = null;

        if (!isBreak) {
            sessionCount++;
            document.getElementById('sessionCount').textContent =
                'Sessions Completed: ' + sessionCount;

            let breakInput = parseInt(
                document.getElementById('goonDuration').value
            );

            if (!isNaN(breakInput) && breakInput > 0) {
                minutes = breakInput;
            } else {
                minutes = 5;
            }

            seconds = 0;

            // ✅ switch to break
            isBreak = true;

            card.classList.remove('running', 'paused');
            overlay.classList.remove('red', 'yellow');

            card.classList.add('break');
            overlay.classList.add('orange');

            document.getElementById('mode').style.color = 'orange';
            document.getElementById('mode').textContent =
                'Enjoy your break!';

            playSound(523);

            // ✅ restart timing correctly
            totalSeconds = minutes * 60;
            startTime = Date.now();

            timer = setInterval(updateTimer, 1000);
        } else {
            // ✅ break finished
            isBreak = false;
            sessionStarted = false;

            card.classList.remove('break');
            overlay.classList.remove('orange');

            document.getElementById('mode').style.color = '#FF4500';
            document.getElementById('mode').textContent =
                'Ready to lock in?';

            playSound(330);
        }

        return;
    }

    let displayMinutes = Math.floor(remaining / 60);
    let displaySeconds = remaining % 60;

    document.getElementById('timer').textContent =
        displayMinutes.toString().padStart(2, '0') + ':' +
        displaySeconds.toString().padStart(2, '0');
}

document.getElementById('sessionCount').textContent = 'Sessions Completed: ' + sessionCount;


function playSound(frequency) {
    let audioCtx = new AudioContext();
    let oscillator = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1); // fade out
    oscillator.type = 'sine';
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = frequency;
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.3); // plays sound for 1.3 seconds
}

function clickSound() {
    let audioCtx = new AudioContext();
    let bufferSize = audioCtx.sampleRate * 0.08;
    let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    let data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
    }
    let source = audioCtx.createBufferSource();
    source.buffer = buffer;

    let gainNode = audioCtx.createGain();
    let filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08); // fade out

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start();
}