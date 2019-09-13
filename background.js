// automatically store data with defualt values when the extension is installed
chrome.runtime.onInstalled.addListener( function () {
	chrome.storage.sync.set({
		remindHours: 0,
		remindMinutes: 20,
		breakHours: 0,
		breakMinutes: 5
	}, function () {
		console.log('stored all default values');
	});

	chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [ new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {
					hostEquals: 'developer.chrome.com'
				},
			})],
			actions: [ new chrome.declarativeContent.ShowPageAction() ]
		}]);
	});
});

// GLOBALS
let isBreakTime = false;
let timer = null;
let totalSecondsRemaining = null;

// Handle requests to start, pause or stop the timer
chrome.runtime.onMessage.addListener( function ( request, sender, sendResponse ) {
	if ( request.type === 'start_timer') {
		console.log( "starting timer" );
		startTimer( request.data.endTime );

	} else if ( request.type === 'pause_timer') {
		console.log( "pausing timer" );
		pauseTimer();

	} else if ( request.type === 'stop_timer' ) {
		console.log( "stopping timer");
		stopTimer();
	}
});


function startTimer( endTime ) {
	if ( !totalSecondsRemaining ) {
		totalSecondsRemaining = calculateSeconds( endTime.hours, endTime.minutes );
	}

	if ( !timer ) {
		timer = setInterval( setTime, 1000 );
	}
}

function pauseTimer() {
	if ( timer ) {
		clearInterval( timer );
		timer = null;
	}
}

function stopTimer() {
	clearInterval( timer );
	timer = null;
	totalSecondsRemaining = null;
}

function setTime() {
	--totalSecondsRemaining;
	const MINUTES = Math.floor( totalSecondsRemaining / 60 );
	const SECONDS = Math.floor( totalSecondsRemaining % 60 );
	const HOURS =  Math.floor( MINUTES / 60 );

	// change elapsed time label
	chrome.runtime.sendMessage({
		type: 'elapsed_time_changed',
		data: {
			time: `${HOURS}h ${MINUTES}m ${SECONDS}s`
		}
	});

	// stop timer when the timer reaches 0
	if ( totalSecondsRemaining === 0 ) {
		stopTimer();

		// change to break time timer
		isBreakTime = !isBreakTime;

		chrome.runtime.sendMessage({
			type: 'is_break_time',
			isBreakTime: isBreakTime
		}, async function( response ) {
			msg = ''
			if ( isBreakTime ) {
				msg = "It's time for a break!";
			} else {
				msg = "It's time to work!";
			}

			alert( msg );
		});
	}
}

function calculateSeconds( hours, minutes) {
	return minutes * 60 + ( hours * 60 * 60 );
}