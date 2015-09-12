var Myo = require('myo');
var cleanData = require('./clean-data');
var baseline = require('./baseline');
var verify = require('./verify');

// The reference to the Myo connected to this app
var myMyo = null;
var calibrateCount = 0;

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

var getUserMyoData = function (cb) {
    if (myMyo === null) return cb([]);

    var userData = [];

    var later = Date.now() + 7000;
    myMyo.streamEMG(true);
    myMyo.on('emg', function (data) {
        // Stop listening after 7 seconds
        if (Date.now() > later) {
            // Clear the listener
            myMyo.off('emg');
            myMyo.streamEMG(false);
            calibrateCount++;
            localStorage.setItem('calibrateCount', calibrateCount);
            cb(userData);
        } else {
            // Add the EMG data to the array
            userData[userData.length] = data;
        }
    });
};

document.getElementById('button-calibrate').addEventListener('click', function (e) {
    if (myMyo !== null) {
        // Handle some DOM updates
        e.target.disabled = true;
        e.target.innerText = 'Calibrating...';
        document.getElementById('button-finish-calibrate').disabled = true;
        getUserMyoData(function (calibrationData) {
            // Take care of the DOM
            e.target.disabled = false;
            e.target.innerText = 'Calibrate';
            document.getElementById('button-finish-calibrate').disabled = false;
            document.getElementById('calibrate-count').innerText = calibrateCount;
            localStorage.setItem('calibrateCount', calibrateCount);
            cleanData(calibrationData);
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
document.getElementById('button-verify').addEventListener('click', function() {
    document.getElementById('button-verify').disabled = true;
    document.getElementById('button-verify').innerText = 'Verifying...';
    getUserMyoData(function (data) {
        document.getElementById('button-verify').disabled = false;
        document.getElementById('button-verify').innerText = 'Verify';
        verify(data);
    });
});
