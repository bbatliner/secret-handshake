var Myo = require('myo');
var cleanData = require('./clean-data');
var baseline = require('./baseline');

// The reference to the Myo connected to this app
var myMyo = null;

Myo.connect();

Myo.on('connected', function () {
    document.getElementById('not-connected').style.display = 'none';
    document.getElementById('calibrate').style.display = 'block';
    document.getElementById('verify').style.display = 'none';
    myMyo = Myo.myos[0];
    myMyo.streamEMG(false);
});

Myo.on('disconnected', function () {
    document.getElementById('not-connected').style.display = 'block';
    document.getElementById('calibrate').style.display = 'none';
    document.getElementById('verify').style.display = 'none';
});

var calibrateCount = 0;
document.getElementById('button-calibrate').addEventListener('click', function (e) {
    if (myMyo !== null) {
        // Array to hold 7 seconds of calibration data
        var calibrationData = [];
        // Handle some DOM updates
        e.target.disabled = true;
        e.target.innerText = 'Calibrating...';
        // Set the end time for 7 seconds in the future
        var later = Date.now() + 7000;
        // Start streaming and listening to EMG data
        myMyo.streamEMG(true);
        myMyo.on('emg', function (data) {
            // Stop listening after 7 seconds
            if (Date.now() > later) {
                // Clear the listener
                myMyo.off('emg');
                // Take care of the DOM
                e.target.disabled = false;
                e.target.innerText = 'Calibrate';
                document.getElementById('calibrate-count').innerText = ++calibrateCount;
                localStorage.setItem('calibrateCount', calibrateCount);
                cleanData(calibrationData);
            } else {
                // Add the EMG data to the array
                calibrationData[calibrationData.length] = data;
            }
        });
    }
});

document.getElementById('button-finish-calibrate').addEventListener('click', function () {
    // Calculate a baseline
    baseline();
    // Transition to verify step
    document.getElementById('not-connected').style.display = 'none';
    document.getElementById('calibrate').style.display = 'none';
    document.getElementById('verify').style.display = 'block';
});
