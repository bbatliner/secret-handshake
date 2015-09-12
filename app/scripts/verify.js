// Reads baseline data and new handshake gesture and makes comparison
module.exports = function(data) {
	// Constants
	var DATA_RANGE = 400; // Total number of data points being polled
	var MATCHING_DATA = 200; // Number of data points matching with the baseline
	var DEVIATION = 50; // Acceptable deviation threshold

	// Loads baseline data (space delimited file with 8 values)
	var baselineData = JSON.parse(localStorage.getItem("MyoData")); // One array with 8 values


	// Loads new incoming data
	var currentData = data; 


	// Comparing two data files
	var matching = 0;
	for(i = 0; i < DATA_RANGE; i ++) {
		var lineCount = 0;
		for(j = 0; j < 8; j ++) {
			if (Math.abs(baselineData[i][j] - currentData[i][j]) < DEVIATION) {
				lineCount += 1;
			}
		}
		if (lineCount == 8) {
			matching += 1;
		}
	}

	if (matching > MATCHING_DATA) {
		console.log("verified!"); // on success
	}
	else {
		console.log("invalid!") // on failure
	}
};





