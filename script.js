let minutes = 25;
let seconds = 0;
let sessionCount = 0;
let timer = null;
let isBreak = false;
let startBtn= document.getElementById('start');
let pauseBtn= document.getElementById('pause');
let resetBtn= document.getElementById('reset');

startBtn.onclick = function() {
    if (timer === null) {
        if(!isBreak && minutes === 25 && seconds === 0){
            let workInput = parseInt(document.getElementById('workDuration').value);
            if (!isNaN(workInput) && workInput > 0) {
                minutes = workInput;
                seconds = 0;
            }
        }
        let displayMinutes = minutes.toString().padStart(2, '0');
        let displaySeconds = seconds.toString().padStart(2, '0');
        document.getElementById('timer').textContent = displayMinutes + ':' + displaySeconds;

        timer = setInterval(updateTimer, 1000);
        document.getElementById('mode').textContent = 'Lock in!';
    }
};

pauseBtn.onclick = function() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
        document.getElementById('mode').textContent = 'Paused, lock in soon or else.';
    }
};

resetBtn.onclick = function(){
    clearInterval(timer);
    timer = null;

    minutes = 25;
    seconds = 0;
    isBreak = false;

    document.getElementById('timer').textContent = '25:00';
    document.getElementById('mode').textContent = 'Ready to lock in?';
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
            document.getElementById('mode').textContent = 'Enjoy your break!';
            timer = setInterval(updateTimer, 1000);
        }
        else{ 
            isBreak = false;
            document.getElementById('mode').textContent = 'Ready to lock in?';
        }
        return;
    }

    seconds--;
  
    if (seconds < 0){
        seconds = 59;
        minutes--;
    }

    let displayMinutes = minutes.toString().padStart(2, '0');
    let displaySeconds = seconds.toString().padStart(2, '0');

    document.getElementById('timer').textContent = displayMinutes + ':' + displaySeconds;
}

document.getElementById('sessionCount').textContent = 'Sessions Completed: ' + sessionCount;
