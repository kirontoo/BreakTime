

let remainingTimeLabel = document.getElementById('remainingTime');
let startTimer = document.getElementById('startTimer');
let pauseTimer = document.getElementById('pauseTimer');
let stopTimer = document.getElementById('stopTimer');
let remindMinutes = document.getElementById( 'remindMinutes' );
let remindHours = document.getElementById( 'remindHours' );
let breakMinutes = document.getElementById( 'breakMinutes' );
let breakHours = document.getElementById( 'breakHours' );
let saveSettings = document.getElementById( 'save' );
let timerStateLabel = document.getElementById( 'timerState' );

let totalSeconds = 0;
let isBreakTime = false;
let endTime = {
	hours: 0,
	minutes: 0
};

// sync storage values
chrome.storage.sync.get([
	'remindMinutes',
	'remindHours',
	'breakHours',
	'breakMinutes' ],
	function( data ) {

	remindMinutes.value = data.remindMinutes;
	remindHours.value = data.remindHours;
	breakMinutes.value = data.breakMinutes;
	breakHours.value = data.breakHours;
	endTime.hours = data.remindHours;
	endTime.minutes = data.remindMinutes;

	// set initial remaining time
	remainingTimeLabel.innerHTML = `${endTime.hours}h ${endTime.minutes}m 0s`;
});

// handle requests from the background
chrome.runtime.onMessage.addListener( async function ( request, sender, sendResponse ) {
	if ( request.type === 'elapsed_time_changed' ) {
		onRemainingTimeChanged( request.data.time );
	} else if ( request.type === 'is_break_time' ) {
		isBreakTime = request.isBreakTime;
		onBreakTime();
	}
});

// handle on click button events
startTimer.onclick = onStartTimer;
pauseTimer.onclick = onPauseTimer;
stopTimer.onclick = onStopTimer;
saveSettings.onclick =  onSaveSettings;

// fill up selection options for hours and minutes
initiateOptions();

function initiateOptions() {
	let options = '';
	for( var i = 0; i < 60; i++ ) {
		options += `<option value="${i}">${i}</option>`;
		if ( i === 9 ) {
			remindHours.innerHTML = options;
			breakHours.innerHTML = options;
		}
	}
	remindMinutes.innerHTML = options;
	breakMinutes.innerHTML = options;

	// Set default value
	endTime.minutes = remindMinutes.value;
	endTime.hours = remindHours.value;
}

// Adjust end timer values and labels depending on break or work mode.
function onBreakTime() {
		if ( isBreakTime ) {
			endTime.hours = breakHours.value;
			endTime.minutues = breakMinutes.value;
			timerStateLabel.innerHTML = 'Time to work in:';
		} else {
			endTime.hours = remindHours.value;
			endTime.minutes = remindMinutes.value;
			timerStateLabel.innerHTML = 'Break time in:';
		}

		remainingTimeLabel.innerHTML = `${endTime.hours}h ${endTime.minutes}m 0s`;
}

function onStartTimer() {
	chrome.runtime.sendMessage( {
		type: "start_timer",
		data: {
			endTime: endTime
		}
	});

	remainingTimeLabel.style.color = '#28a745';
}

function onPauseTimer(){
	chrome.runtime.sendMessage({
		type: "pause_timer"
	});

	remainingTimeLabel.style.color = '#ffc107';
}

function onStopTimer() {
	chrome.runtime.sendMessage( {
		type: "stop_timer"
	});

	// reset remaining time label
	remainingTimeLabel.style.color = 'red';
	remainingTimeLabel.style.color = '#dc3545';
	remainingTimeLabel.innerHTML = '0h 0m 0s';
}

function onRemainingTimeChanged( timeRemaining ) {
	remainingTimeLabel.style.color = '#28a745';
	remainingTimeLabel.innerHTML = timeRemaining;
}

function onSaveSettings() {
	chrome.storage.sync.set( {
		remindHours: remindHours.value,
		remindMinutes: remindMinutes.value,
		breakHours: breakHours.value,
		breakMinutes: breakMinutes.value
	}, function() {
		if ( isBreakTime ) {
			endTime.hours = remindHours.value;
			endTime.minutes = remindMinutes.value;
		} else {
			endTime.hours = breakHours.value;
			endTime.minutes = breakMinutes.value;
		}

		onStopTimer();
	});
}