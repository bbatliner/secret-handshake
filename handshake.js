var Myo = require('myo');

var LOG_EMG = true;
var LOG_IMU = false;

Myo.connect();

Myo.on('connected', function () {
    console.log('connected');
    var myo = Myo.myos[0];
    myo.streamEMG(true);
    myo.on('emg', function (data) {
        // Array of 8 values, 1 reading for each sensor
        if (LOG_EMG) console.log(data);
    });
    myo.on('imu', function (data) {
        // data.orientation
        //   w
        //   x
        //   y
        //   z
        // data.acclerometer
        //   x
        //   y
        //   z
        // data.gyroscope
        //   x
        //   y
        //   z
        if (LOG_IMU) console.log(data);
    });
});

