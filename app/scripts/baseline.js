module.exports = function () {
    // Constants
    var DATA_RANGE = 400;
    var DATA_BREADTH = 8;

    var calibrateCount = localStorage.getItem("calibrateCount");
    var tempArr = localStorage.getItem("MyoData");

    for(i = 0; i < DATA_RANGE; i ++) {
        for(j = 0; j < DATA_BREADTH; j ++) {
            tempArr[i][j] /= calibrateCount;
        }
    }

    localStorage.setItem("MyoData", tempArr);
};
