

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'www.gradescope.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({showColors: true});
  chrome.storage.sync.set({hwProb: "all"});
  chrome.storage.sync.set({showResults: false});
  chrome.storage.sync.set({showOutput: false});
})
