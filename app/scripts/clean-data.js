module.exports = function (data) {
    var relevantData = [];

    // Constants
    var DATA_RANGE = 400;
    var DATA_BREADTH = 8;
    var REST_DEVIATION = 20; // Threshold for when four sensors are deviating by 20

    for(i = 0; i < DATA_RANGE; i ++) {
        relevantData[i] = [0, 0, 0, 0, 0, 0, 0, 0];
    }


    function condense() {
        first = firstRelevantRow();
        console.log(first);
        for(i = 0; i < DATA_RANGE; i ++) {
            for(j = 0; j < DATA_BREADTH; j ++) {
                relevantData[i][j] = data[i+first][j];
                //console.log(relevantData[i][j]);
            }
        }
    };

    function firstRelevantRow() {
        for (i = 0; i < 1200; i++) {
                var extremeCount = 0;
                for (j = 0; j < 8; j++) {
                    if (Math.abs(data[i][j]) > REST_DEVIATION) {
                        extremeCount += 1;
                    }
                }
                if (extremeCount >= 4) {
                    return i;
                }
            }
            return 0;
    };

    condense();
    var calibrateCount = localStorage.getItem("calibrateCount");
    if (calibrateCount == 1) {
        localStorage.setItem("MyoData", relevantData);
    }
    else {
        var tempArr = [];
        for(i = 0; i < DATA_RANGE; i ++) {
            tempArr[i] = [0, 0, 0, 0, 0, 0, 0, 0];
        }
        tempArr = localStorage.getItem("MyoData");
        for(a = 0; a < DATA_RANGE; a ++) {
            for(b = 0; b < DATA_BREADTH; b ++) {
                tempArr[a][b] += relevantData[a][b];
            }
        }
        localStorage.setItem("MyoData", tempArr);
    }
};
