// The script that controls the tab functionality in tab.html

// html object references
const body = document.querySelector('body');
const prompt = document.querySelector('.prompt');
const status = document.querySelector('.status');
const output = document.getElementById("output");


var promptContent = "";
var shifted = false;

body.onkeydown = function(evt) {
    let keyNum = evt.keyCode;
    let key = keyCodes[evt.keyCode];

    status.innerHTML = "";
    if (key == "shift") { //ignore shift, can't be added to line, used only for modifiers
        shifted = !shifted;
        return;
    }

    if (shifted == true) {
        if(shiftedKeys[key]) {
            key = shiftedKeys[key];
        }
        shifted = false;
    }

    if (key == "enter") { // enter: process command
        let processed = processFirstWord(promptContent);        
        console.log(`0: ${processed.command}, 1-end ${processed.rest}`);
        try {
            process[processed.command](processed.rest)
        }
        catch(err){
            console.log(`Invalid command! Message: ${err}`);
            output.innerText += "Invalid command!\n";
            output.scrollTop = output.scrollHeight;
        }
        promptContent = "";
    }
    else if (key == "delete" || key == "back") {
        promptContent = promptContent.slice(0, -1);
    }
    else {
        //promptContent += key ? key : keyNum;
        promptContent += key ? key : "";
    }
    prompt.innerHTML = `> ${promptContent}`;
}

function processFirstWord(command) { // split string into command and rest
    let comm = command.split(' ')[0];
    let rest = command.substr(command.indexOf(' ') + 1);
    if (command.indexOf(' ') == -1) { //if there never was a space, no arguments
        rest = undefined;
    }
    return {
        "command":  comm, 
        "rest":     rest};
}

function updateOutput(text) {
    output.innerText += text;
    output.scrollTop = output.scrollHeight;
    console.log(text);
}