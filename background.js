chrome.runtime.onInstalled.addListener( function () {
	chrome.storage.sync.set({
		remindHours: 0,
		remindMinutes: 20,
		breakHours: 0,
		breakMinutes: 5
	}, function () {
		console.log('remind time initiated');
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
