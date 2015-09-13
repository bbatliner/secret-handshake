var cleanData = require('./clean-data');
var median = require('filters').median;

// Reads baseline data and new handshake gesture and makes comparison
module.exports = function(data, id, method) {
    // Constants
    var DATA_RANGE = 650; // Total number of data points being polled
    var MATCHING_DATA = 325; // Number of data points matching with the baseline
    var DEVIATION = 20; // Acceptable deviation threshold
    var RESIDUAL_THRESHOLD = 30;

    // Loads baseline data (space delimited file with 8 values)
    var baselineData = JSON.parse(localStorage.getItem("MyoData")); // One array with 8 values

    // Loads new incoming data
    var currentData = cleanData(data, true);

    var authenticated = false;
    if (method === 'deviation') {
	    // Comparing two data files
	    var matching = 0;
	    for(i = 0; i < DATA_RANGE; i ++) {
	        if (Math.abs(baselineData[i] - currentData[i]) < DEVIATION) {
	            matching += 1;
	        }
	    }

	    if (matching > MATCHING_DATA) {
	        authenticated = true;
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
			authenticated = true;
		}
	}

    if (authenticated) {
        document.getElementById(id).innerText = 'Security test passed... User verified! (' + avg + ')';
    } else {
        document.getElementById(id).innerText = 'Security test failed... Invalid user! (' + avg + ')';
    }


};
