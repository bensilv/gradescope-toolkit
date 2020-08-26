const preStyle = "font-size:14px; font-weight:400; line-height: 24px; font:inherit"
function setupColors() {
    let tests = document.getElementsByClassName('testCase')
    for (let test of tests) {
        if (test.getElementsByClassName('testCase--header')[0].innerText.startsWith('Autograder Output')) {
            continue;
        }
        let testOut = test.getElementsByClassName('testCase--body')[0];
        testOut.getElementsByTagName('pre')[0].classList.add('uncolored');
        const lines = testOut.innerText.split('\n');
        let color = null;
        let keepColor = false;
        let colorOut = ""
        for (let line of lines) {
            let tabless = line.replace("\t", "")
            if (line === "") {
                color = null;
                keepColor = false;
            }
            else if (tabless.startsWith('CAUGHT')) {
                color = 'green'
                keepColor = true;
            } else if (tabless.startsWith('QUESTIONABLY')) {
                color = 'magenta'
                keepColor = true;
            } else if (tabless.startsWith('UNCAUGHT')) {
                color = 'red'
                keepColor = true;
            } else if (tabless === 'STUDENT TEST ERRORS ON TA SOLUTION') {
                color = 'red'
                keepColor = true;
            } else if (tabless === 'NO STUDENT TEST ERRORS ON TA SOLUTION') {
                color = 'green'
            } else if (tabless.startsWith('PASSED =>')) {
                color = 'green'
            } else if (tabless.startsWith('FAILED =>')) {
                color = 'red'
            } else if (tabless.startsWith('ERROR:')) {
                color = 'red'
            }
            if (color){
                colorOut += `<pre style="color:${color}; ${preStyle}">${line}</pre>`
            } else if (line === "") {
                colorOut += `</br>`
            } else {
                colorOut += `<pre style="${preStyle}">${line}</pre>`
            }
        }
        testOut.innerHTML += (`<div class="coloredOutput">${colorOut}</div>`);
    }
}

function getProbNumbers() {
    let probSet = new Set();
    const probTitles = document.getElementsByClassName('testCase--header');
    for (let title of probTitles) {
        let a_tag = title.getElementsByTagName('a');
        if (a_tag.length !== 0) {
            probSet.add(a_tag[0].innerText.split(')')[0]);
        }
    }
    return Array.from(probSet);
}

async function load() {
    await setupColors();
    reloadPlugin();
}
function reloadPlugin() {
    // shows or hides coloring
    chrome.storage.sync.get('showColors', function(data) {
      if (data.showColors) {
          Array.from(document.getElementsByClassName('uncolored')).forEach(element => element.style.display = "none");
          Array.from(document.getElementsByClassName('coloredOutput')).forEach(element => element.style.display = "block");
      } else {
          Array.from(document.getElementsByClassName('uncolored')).forEach(element => element.style.display = "block");
          Array.from(document.getElementsByClassName('coloredOutput')).forEach(element => element.style.display = "none");
      }
    });
    chrome.storage.sync.get('hwProb', function(data) {
        updateProbNum(data.hwProb);
    });
    chrome.storage.sync.get('showOutput', function(data) {
        const allTests = document.getElementsByClassName('testCase');
        let autograderOutput;
        for (let test of allTests) {
            if (test.getElementsByClassName('testCase--header')[0].innerText.startsWith('Autograder Output')) {
               autograderOutput = test;
            }
        }
        if (!autograderOutput) {
            autograderOutput = document.getElementsByClassName('autograderResults--stdout')[0];
        }
        if (data.showOutput) {
            autograderOutput.style.display = "block";
        } else {
            autograderOutput.style.display = "none";
        }
    });
    chrome.storage.sync.get('showResults', function(data) {
        let output = document.getElementsByClassName('autograderResults--topLevelOutput')[0];
        if (data.showResults) {
            output.style.display = "block";
        } else {
            output.style.display = "none";
        }
    });
}

let loadedLater = false;

let autograderResultsToggleHeader = document.getElementsByClassName('autograderResultsContainer--header')[0];
if (autograderResultsToggleHeader) {
    let autograderResultsToggle = autograderResultsToggleHeader.getElementsByTagName('button')[0];
    autograderResultsToggle.onclick = () => {
        if (!loadedLater) {
            //loadedLater = true;
            setTimeout(function () {
            setupColors();
            reloadPlugin();
        }, 500);
        }

    }
}


load();

function updateProbNum(probNum) {
    if (!getProbNumbers().includes(probNum)) {
        probNum = "all";
    }
    const allTests = document.getElementsByClassName('testCase');
    for (let test of allTests) {
        let a_tag = test.getElementsByClassName('testCase--header')[0].getElementsByTagName('a');
        if (a_tag.length !== 0) {
            let curProbSet = a_tag[0].innerText.split(')')[0];
            if (probNum === "all") {
                test.style.display = "block"
            } else if (probNum === curProbSet) {
                test.style.display = "block"
            } else {
                test.style.display = "none"
            }
        }
    }
}

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msgObj) => {
        if (msgObj.msg === "reloadPlugin") {
            reloadPlugin();
        } else if (msgObj.msg === 'getProbNumbs') {
            port.postMessage({msg: "probNumbs", probNumbers: getProbNumbers()});
        }
    })
});