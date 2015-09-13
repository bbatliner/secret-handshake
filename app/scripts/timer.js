// Countdown timer for calibration
module.exports = function(id, time) {
    var DURATION = time; // In seconds
    document.getElementById(id).innerHTML = time + " seconds";
    var count = DURATION;
    var counter = setInterval(timer, 1000);
    function timer() {
        count -= 1;
        if (count < 0) {
            clearInterval(counter);
            return;
        }
        document.getElementById(id).innerHTML = count + " seconds";
    }
};