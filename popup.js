
'use strict';

const runningToggle = document.getElementById('runningToggle');
const pubResultsToggle = document.getElementById('pubResultsToggle');
const autoOutputToggle = document.getElementById('autoOutputToggle');
chrome.storage.sync.get('showColors', function(data) {
  runningToggle.checked = data.showColors;
});
chrome.storage.sync.get('showResults', function(data) {
  pubResultsToggle.checked = data.showResults;
});
chrome.storage.sync.get('showOutput', function(data) {
  autoOutputToggle.checked = data.showOutput;
});


runningToggle.onclick = () => {
  chrome.storage.sync.set({showColors: runningToggle.checked});
  port.postMessage({msg: "reloadPlugin"});
}


function setProbNumbers(numberSet) {
  numberSet = numberSet.sort();
  let options = '<option selected value="all">All</option>'
  for (let prob of numberSet) {
    options += `<option value="${prob}">${prob}</option>`;
  }
  document.getElementById('prob-selector').innerHTML = options;
  chrome.storage.sync.get('hwProb', function(data) {
    let probNum = data.hwProb;
    if (!numberSet.includes(probNum)) {
      probNum = "all";
      chrome.storage.sync.set({hwProb: probNum});
    }
    $('#prob-selector').val(probNum);
  });
}

let port = null;
function connect() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    port = chrome.tabs.connect(tabs[0].id);
    port.postMessage({msg: "getProbNumbs"});
    port.onMessage.addListener((msgObj) => {
      if (msgObj.msg === "probNumbs") {
        setProbNumbers(msgObj.probNumbers);
      }
    });
  });
}

window.addEventListener('load', (event) => {
  connect();
});

$('#prob-selector').on('change',function() {
  chrome.storage.sync.set({hwProb: $('#prob-selector').val()});
  port.postMessage({msg: "reloadPlugin"});
});
pubResultsToggle.onclick = function() {
  chrome.storage.sync.set({showResults: pubResultsToggle.checked});
  port.postMessage({msg: "reloadPlugin"});
};
autoOutputToggle.onclick = function() {
  chrome.storage.sync.set({showOutput: autoOutputToggle.checked});
  port.postMessage({msg: "reloadPlugin"});
};
