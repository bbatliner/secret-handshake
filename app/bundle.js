(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var Myo = require('myo');
var cleanData = require('./clean-data');
var baseline = require('./baseline');

// The reference to the Myo connected to this app
var myMyo = null;

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

var calibrateCount = 0;
document.getElementById('button-calibrate').addEventListener('click', function (e) {
    if (myMyo !== null) {
        // Array to hold 7 seconds of calibration data
        var calibrationData = [];
        // Handle some DOM updates
        e.target.disabled = true;
        e.target.innerText = 'Calibrating...';
        // Set the end time for 7 seconds in the future
        var later = Date.now() + 7000;
        // Start streaming and listening to EMG data
        myMyo.streamEMG(true);
        myMyo.on('emg', function (data) {
            // Stop listening after 7 seconds
            if (Date.now() > later) {
                // Clear the listener
                myMyo.off('emg');
                // Take care of the DOM
                e.target.disabled = false;
                e.target.innerText = 'Calibrate';
                document.getElementById('calibrate-count').innerText = ++calibrateCount;
                localStorage.setItem('calibrateCount', calibrateCount);
                cleanData(calibrationData);
            } else {
                // Add the EMG data to the array
                calibrationData[calibrationData.length] = data;
            }
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

},{"./baseline":1,"./clean-data":2,"myo":5}],4:[function(require,module,exports){
// Reads baseline data and new handshake gesture and makes comparison

// Constants
var DATA_RANGE = 400; // Total number of data points being polled
var MATCHING_DATA = 250; // Number of data points matching with the baseline
var DEVIATION = .05; // Acceptable deviation threshold

// Loads baseline data (space delimited file with 8 values)
var baselineData = []; // One array with 8 values


// Loads new incoming data
var currentData = []; 


// Comparing two data files
var matching = 0;
for(i = 0; i < DATA_RANGE; i ++) {
	var lineCount = 0;
	for(j = 0; j < 8; j ++) {
		if (Math.abs(baselineData[j] - currentData[i][j]) < Math.abs(DEVIATION*baselineData[j])) {
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






},{}],5:[function(require,module,exports){
(function(){
	var Socket, myoList = {};
	if(typeof window === 'undefined'){
		Socket = require('ws');
	}else {
		if(!("WebSocket" in window)) console.error('Myo.js : Sockets not supported :(');
		Socket = WebSocket;
	}

	Myo = {
		defaults : {
			api_version : 3,
			socket_url  : "ws://127.0.0.1:10138/myo/",
		},
		lockingPolicy : 'standard',
		events : [],
		myos : [],

		onError : function(){
			throw 'Myo.js had an error with the socket. Myo Connect might not be running. If it is, double check the API version.';
		},

		setLockingPolicy: function(policy) {
			Myo.socket.send(JSON.stringify(['command',{
				"command": "set_locking_policy",
				"type": policy
			}]));
			Myo.lockingPolicy = policy;
			return Myo;
		},
		trigger : function(eventName){
			var args = Array.prototype.slice.apply(arguments).slice(1);
			emitter.trigger.call(Myo, Myo.events, eventName, args);
			return Myo;
		},
		on : function(eventName, fn){
			return emitter.on(Myo.events, eventName, fn);
		},
		off : function(eventName){
			Myo.events = emitter.off(Myo.events, eventName);
			return Myo;
		},

		connect : function(){
			Myo.socket = new Socket(Myo.defaults.socket_url + Myo.defaults.api_version);
			Myo.socket.onmessage = Myo.handleMessage;
			Myo.socket.onopen = Myo.trigger.bind(Myo, 'ready');
			Myo.socket.onclose = Myo.trigger.bind(Myo, 'socket_closed');
			Myo.socket.onerror = Myo.onError;
		},
		disconnect : function(){
			Myo.socket.close();
		},

		handleMessage : function(msg){
			var data = JSON.parse(msg.data)[1];
			if(!data.type || typeof(data.myo) === 'undefined') return;
			if(data.type == 'paired'){
				Myo.myos.push(Myo.create({
					macAddress      : data.mac_address,
					name            : data.name,
					connectIndex    : data.myo
				}));
			}

			Myo.myos.map(function(myo){
				if(myo.connectIndex === data.myo){
					var isStatusEvent = true;
					if(eventTable[data.type]){
						isStatusEvent = eventTable[data.type](myo, data);
					}
					if(!eventTable[data.type] || isStatusEvent){
						myo.trigger(data.type, data, data.timestamp);
						myo.trigger('status', data, data.timestamp);
					}
				}
			})
		},

		create : function(props){
			var myoProps = utils.merge({
				macAddress      : undefined,
				name            : undefined,
				connectIndex    : undefined,
				locked          : true,
				connected       : false,
				synced          : false,
				batteryLevel    : 0,
				lastIMU         : undefined,
				arm             : undefined,
				direction       : undefined,
				warmupState     : undefined,
				orientationOffset : {x : 0,y : 0,z : 0,w : 1},
				events : [],
			}, props || {});
			return utils.merge(Object.create(Myo.methods), myoProps);
		},

		methods : {
			trigger : function(eventName){
				var args = Array.prototype.slice.apply(arguments).slice(1);
				emitter.trigger.call(this, Myo.events, eventName, args);
				emitter.trigger.call(this, this.events, eventName, args);
				return this;
			},
			_trigger : function(eventName){
				var args = Array.prototype.slice.apply(arguments).slice(1);
				emitter.trigger.call(this, this.events, eventName, args);
				return this;
			},
			on : function(eventName, fn){
				return emitter.on(this.events, eventName, fn);
			},
			off : function(eventName){
				this.events = emitter.off(this.events, eventName);
				return this;
			},
			lock : function(){
				Myo.socket.send(JSON.stringify(["command", {
					"command": "lock",
					"myo": this.connectIndex
				}]));
				return this;
			},
			unlock : function(hold){
				Myo.socket.send(JSON.stringify(["command", {
					"command": "unlock",
					"myo": this.connectIndex,
					"type": (hold ? "hold" : "timed")
				}]));
				return this;
			},
			zeroOrientation : function(){
				this.orientationOffset = utils.quatInverse(this.lastQuant);
				this.trigger('zero_orientation');
				return this;
			},
			vibrate : function(intensity){
				intensity = intensity || 'medium';
				Myo.socket.send(JSON.stringify(['command',{
					"command": "vibrate",
					"myo": this.connectIndex,
					"type": intensity
				}]));
				return this;
			},
			requestBluetoothStrength : function(){
				Myo.socket.send(JSON.stringify(['command',{
					"command": "request_rssi",
					"myo": this.connectIndex
				}]));
				return this;
			},
			requestBatteryLevel : function(){
				Myo.socket.send(JSON.stringify(['command',{
					"command": "request_battery_level",
					"myo": this.connectIndex
				}]));
				return this;
			},
			streamEMG : function(enabled){
				Myo.socket.send(JSON.stringify(['command',{
					"command": "set_stream_emg",
					"myo": this.connectIndex,
					"type" : (enabled ? 'enabled' : 'disabled')
				}]));
				return this;
			}
		}
	};

	var eventTable = {
		//Stream Events
		'pose' : function(myo, data){
			if(myo.lastPose){
				myo.trigger(myo.lastPose + '_off');
				myo.trigger('pose_off', myo.lastPose);
			}
			if(data.pose == 'rest'){
				myo.trigger('rest');
				myo.lastPose = null;
				if(Myo.lockingPolicy === 'standard') myo.unlock();
			}else{
				myo.trigger(data.pose);
				myo.trigger('pose', data.pose);
				myo.lastPose = data.pose;
				if(Myo.lockingPolicy === 'standard') myo.unlock(true);
			}
		},
		'orientation' : function(myo, data){
			myo.lastQuant = data.orientation;
			var ori = utils.quatRotate(myo.orientationOffset, data.orientation);
			var imu_data = {
				orientation : ori,
				accelerometer : {
					x : data.accelerometer[0],
					y : data.accelerometer[1],
					z : data.accelerometer[2]
				},
				gyroscope : {
					x : data.gyroscope[0],
					y : data.gyroscope[1],
					z : data.gyroscope[2]
				}
			};
			if(!myo.lastIMU) myo.lastIMU = imu_data;
			myo.trigger('orientation',   imu_data.orientation, data.timestamp);
			myo.trigger('accelerometer', imu_data.accelerometer, data.timestamp);
			myo.trigger('gyroscope',     imu_data.gyroscope, data.timestamp);
			myo.trigger('imu',           imu_data, data.timestamp);
			myo.lastIMU = imu_data;
		},
		'emg' : function(myo, data){
			myo.trigger(data.type, data.emg, data.timestamp);
		},


		//Status Events
		'arm_synced' : function(myo, data){
			myo.arm = data.arm;
			myo.direction = data.x_direction;
			myo.warmupState = data.warmup_state;
			myo.synced = true;
			return true;
		},
		'arm_unsynced' : function(myo, data){
			myo.arm = undefined;
			myo.direction = undefined;
			myo.warmupState = undefined;
			myo.synced = false;
			return true;
		},
		'connected' : function(myo, data){
			myo.connectVersion = data.version.join('.');
			myo.connected = true;
			return true;
		},
		'disconnected' : function(myo, data){
			myo.connected = false;
			return true;
		},
		'locked' : function(myo, data){
			myo.locked = true;
			return true;
		},
		'unlocked' : function(myo, data){
			myo.locked = false;
			return true;
		},
		'warmup_completed' : function(myo, data){
			myo.warmupState = 'warm';
			return true;
		},

		'rssi' : function(myo, data){
			data.bluetooth_strength =  utils.getStrengthFromRssi(data.rssi);
			myo.trigger('bluetooth_strength', data.bluetooth_strength, data.timestamp);
			myo.trigger('rssi', data.rssi, data.timestamp);
			myo.trigger('status', data, data.timestamp);
		},
		'battery_level' : function(myo, data){
			myo.batteryLevel = data.battery_level;
			myo.trigger('battery_level', data.battery_level, data.timestamp);
			myo.trigger('status', data, data.timestamp);
		},
	};


	var emitter = {
		eventCounter : 0,
		trigger : function(events, eventName, args){
			var self = this;
			events.map(function(event){
				if(event.name == eventName) event.fn.apply(self, args);
				if(event.name == '*'){
					var args_temp = args.slice(0);
					args_temp.unshift(eventName);
					event.fn.apply(self, args_temp);
				}
			});
			return this;
		},
		on : function(events, name, fn){
			var id = new Date().getTime() + "" + emitter.eventCounter++;
			events.push({
				id   : id,
				name : name,
				fn   : fn
			});
			return id;
		},
		off : function(events, name){
			events = events.reduce(function(result, event){
				if(event.name == name || event.id == name) {
					return result;
				}
				result.push(event);
				return result;
			}, []);
			return events;
		},
	};

	var utils = {
		merge : function(obj1,obj2){
			for(var attrname in obj2) { obj1[attrname] = obj2[attrname]; }
			return obj1;
		},
		quatInverse : function(q) {
			var len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
			return {
				w: q.w/len,
				x: -q.x/len,
				y: -q.y/len,
				z: -q.z/len
			};
		},
		quatRotate : function(q, r) {
			return {
				w: q.w * r.w - q.x * r.x - q.y * r.y - q.z * r.z,
				x: q.w * r.x + q.x * r.w + q.y * r.z - q.z * r.y,
				y: q.w * r.y - q.x * r.z + q.y * r.w + q.z * r.x,
				z: q.w * r.z + q.x * r.y - q.y * r.x + q.z * r.w
			};
		},
		getStrengthFromRssi : function(rssi){
			var min = -95;
			var max = -40;
			rssi = (rssi < min) ? min : rssi;
			rssi = (rssi > max) ? max : rssi;
			return Math.round(((rssi-min)*100)/(max-min) * 100)/100;
		},
	};

	if(typeof module !== 'undefined') module.exports = Myo;
})();





},{"ws":6}],6:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}]},{},[3,2,1,4]);
