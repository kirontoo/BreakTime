

let elapsedTimeLabel = document.getElementById('elapsedTime');
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

initiateOptions();

// sync storage values
// chrome.storage.sync.get([ 'remindMinutes', 'remindHours' ], function( data ) {
// 	remindMinutes.value = data.remindMinutes;
// 	remindHours.value = data.remindHours;
// 	breakMinutes.value = data.remindMinutes;
// 	breakHours.value = data.remindHours;
// 	endTime.hours = data.remindHours;
// 	endTime.minutes = data.remindMinutes;
// });


let timer;
startTimer.onclick = onStartTimer;

pauseTimer.onclick = function( element ){
	if ( timer ) {
		clearInterval( timer );
		elapsedTimeLabel.style.color = '#ffc107';
		timer = null;
	}
}

// stopTimer.onclick = function( element ) {
// 	clearInterval( timer );
// 	totalSeconds = 0;
// 	elapsedTimeLabel.innerHTML = '0h 0m 0s';
// 	elapsedTimeLabel.style.color = '#dc3545';
// 	timer = null;
// }

stopTimer.onclick = resetTimer;

saveSettings.onclick = function( elemen ) {
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
	})
}

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

}

function calculateSeconds( hours, minutes) {
	return minutes * 60 + ( hours * 60 * 60 );
}

function setTime() {
	totalSeconds--;
	let minutes = Math.floor( totalSeconds / 60 );
	let seconds = Math.floor( totalSeconds % 60 );
	let hours =  Math.floor( minutes / 60 );

	elapsedTimeLabel.innerHTML = `${hours}h ${minutes}m ${seconds}s`;

	if( totalSeconds === 0 ) {
		// stop timer and reset values
		resetTimer();

		if ( !isBreakTime ) {
			alert( "It's time for a break!" );
			endTime.hours = breakHours.value;
			endTime.minutues = breakMinutes.value;
			timerStateLabel.innerHTML = 'Time to work in:';
		} else {
			alert( "It's time to work!" );
			endTime.hours = remindHours.value;
			endTime.hours = remindMinutes.value;
			timerStateLabel.innerHTML = 'Break time in:';
		}

		totalSeconds = calculateSeconds( endTime.hours, endTime.minutes );
		elapsedTimeLabel.innerHTML = `${endTime.hours}h ${endTime.minutes}m 0s`;
		isBreakTime = !isBreakTime;
	}
}

function onStartTimer() {
	// make sure to use correct end time
	endTime.minutes = remindMinutes.value;
	endTime.hours = remindHours.value;
	totalSeconds = calculateSeconds( endTime.hours, endTime.minutes );
	elapsedTimeLabel.style.color = '#28a745';
	elapsedTimeLabel.value = '0h 0m 0s';
	// make sure to only initiate one set interval
	if ( !timer ) {
		timer = setInterval( setTime, 1000);
	}
}

function resetTimer() {
	clearInterval( timer );
	timer = null;
	elapsedTimeLabel.style.color = 'red';
	elapsedTimeLabel.style.color = '#dc3545';
	elapsedTimeLabel.innerHTML = '0h 0m 0s';
	totalSeconds = 0
}


