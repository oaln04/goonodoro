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

startBtn.onclick = function() {
    if(timer === null){
        card.classList.remove('paused', 'break');
        overlay.classList.remove('yellow', 'orange');
        card.classList.add('running');
        overlay.classList.add('red');
        document.getElementById('mode').style.color = 'red';
    if (!sessionStarted && !isBreak) {
            let workInput = parseInt(document.getElementById('workDuration').value);
            if (!isNaN(workInput) && workInput > 0) {
                minutes = workInput;
                seconds = 0;
            }
        }
        sessionStarted = true;
        updateDisplay();
        timer = setInterval(updateTimer, 1000);
        document.getElementById('mode').textContent = 'Lock in!';
    }
};

pauseBtn.onclick = function() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
        card.classList.remove('running', 'break');
        overlay.classList.remove('red', 'orange');
        card.classList.add('paused');
        overlay.classList.add('yellow');
        document.getElementById('mode').textContent = 'Paused, lock in soon or else.';
        document.getElementById('mode').style.color = 'yellow';
    }
};

resetBtn.onclick = function(){
    clearInterval(timer);
    timer = null;
    sessionStarted = false;
    let workInput = parseInt(document.getElementById('workDuration').value);
    if (!isNaN(workInput) && (workInput >0)){
        minutes = workInput;
        seconds = 0;
    } else{
        minutes = 25; //default
    }
    isBreak = false;
        card.classList.remove('running', 'paused', 'break');
        overlay.classList.remove('red', 'yellow', 'orange');
        updateDisplay();
        document.getElementById('mode').textContent = 'Ready to lock in?';
        document.getElementById('mode').style.color = 'white';
};

function updateTimer() {
      if(minutes === 0 && seconds === 0){
        document.getElementById('timer').textContent = '00:00';
        clearInterval(timer);
        timer = null;

        if(!isBreak){
            sessionCount++;
            document.getElementById('sessionCount').textContent = 'Sessions Completed: ' + sessionCount;
            let breakInput = parseInt(document.getElementById('goonDuration').value);
            if (!isNaN(breakInput) && breakInput > 0) {
                minutes = breakInput;
                seconds = 0;
            } else{
                minutes = 5; //default
            }
            isBreak = true;
            card.classList.remove('running', 'paused');
            overlay.classList.remove('red', 'yellow');
            card.classList.add('break');
            overlay.classList.add('orange');
            document.getElementById('mode').style.color = 'orange';
            playSound(523);
            document.getElementById('mode').textContent = 'Enjoy your break!';
            timer = setInterval(updateTimer, 1000);
        }
        else{ 
            isBreak = false;
            card.classList.remove('break');
            overlay.classList.remove('orange');
            sessionStarted = false;
            playSound(330);
            document.getElementById('mode').textContent = 'Ready to lock in?';
        }
        return;
    }

    seconds--;
  
    if (seconds < 0){
        seconds = 59;
        minutes--;
    }

    updateDisplay();
}

document.getElementById('sessionCount').textContent = 'Sessions Completed: ' + sessionCount;

function updateDisplay(){
    let displayMinutes = minutes.toString().padStart(2, '0');
    let displaySeconds = seconds.toString().padStart(2, '0');
    document.getElementById('timer').textContent = displayMinutes + ':' + displaySeconds;
}

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