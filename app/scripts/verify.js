var cleanData = require('./clean-data');
var median = require('filters').median;

// Reads baseline data and new handshake gesture and makes comparison
module.exports = function(data, method) {
    // Constants
    var DATA_RANGE = 400; // Total number of data points being polled
    var MATCHING_DATA = 200; // Number of data points matching with the baseline
    var DEVIATION = 20; // Acceptable deviation threshold
    var RESIDUAL_THRESHOLD = 25;

    // Loads baseline data (space delimited file with 8 values)
    var baselineData = JSON.parse(localStorage.getItem("MyoData")); // One array with 8 values

    // Loads new incoming data
    var currentData = cleanData(data, true);

    if (method === 'deviation') {
	    // Comparing two data files
	    var matching = 0;
	    for(i = 0; i < DATA_RANGE; i ++) {
	        if (Math.abs(baselineData[i] - currentData[i]) < DEVIATION) {
	            matching += 1;
	        }
	    }

	    if (matching > MATCHING_DATA) {
	        console.log("verified!"); // on success
	    }
	    else {
	        console.log("invalid!") // on failure
	    }
	} else if (method === 'residual') {
		var residuals = [];
		for (var i = 0; i < DATA_RANGE; i++) {
			residuals[i] = Math.abs(baselineData[i] - currentData[i]);
		}
		var medianResiduals = median(residuals, 5);
		var avg = 0;
		for (var i = 0; i < DATA_RANGE; i++) {
			avg += medianResiduals[i];
		}
		avg /= DATA_RANGE;
		if (avg < RESIDUAL_THRESHOLD) {
			console.log('verified!');
		} else {
			console.log('invalid');
		}
	}
};
