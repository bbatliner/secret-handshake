var Myo = require('myo');

Myo.connect();

Myo.on('connected', function () {
    console.log('connected');
    var myo = Myo.myos[0];
    myo.streamEMG(true);
    myo.on('emg', function (data) {
        console.log(data);
    });
});

