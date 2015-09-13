module.exports = function () {
    // Constants
    var DATA_RANGE = 650;

    var calibrateCount = localStorage.getItem("calibrateCount");
    var tempArr = JSON.parse(localStorage.getItem("MyoData"));

    for(i = 0; i < DATA_RANGE; i ++) {
        tempArr[i] /= calibrateCount;
    }

    localStorage.setItem("MyoData", JSON.stringify(tempArr));
};
