module.exports = function (data, sum) {
    var relevantData = [];

    var sum = sum || false;

    // Constants
    var DATA_RANGE = 400;
    var REST_THRESHOLD = 40; // Threshold for when four sensors are deviating by 20

    function condense() {
        first = firstRelevantRow();
        console.log('FIRST RELEVANT ROW:', first);
        for(i = 0; i < DATA_RANGE; i ++) {
            relevantData[i] = data[i+first];
                //console.log(relevantData[i][j]);
        }
    };

    function firstRelevantRow() {
        for (i = 0; i < 1200; i++) {
            if (data[i] > REST_THRESHOLD) {
                // Ensure the following 10 points are also not at rest
                var actuallyIsActive = true;
                for (var j = i + 1; j < i + 11; j++) {
                    if (data[j] < REST_THRESHOLD) {
                        actuallyIsActive = false;
                        break;
                    }
                }
                if (actuallyIsActive) {
                    return i;
                }
            }
        }
        return 0;
    };

    condense();
    var calibrateCount = localStorage.getItem("calibrateCount");
    if (calibrateCount == 1 || sum) {
        // localStorage.setItem("MyoData", JSON.stringify(relevantData));
        return relevantData;
    }
    else {
        var tempArr = [];
        tempArr = JSON.parse(localStorage.getItem("MyoData"));
        for(a = 0; a < DATA_RANGE; a ++) {
            tempArr[a] += relevantData[a];
        }
        // localStorage.setItem("MyoData", JSON.stringify(tempArr));
        return tempArr;
    }
};
