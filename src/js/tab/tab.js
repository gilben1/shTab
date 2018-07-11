// Copyright (c) 2018 Nicholas Gilbert
// The script that controls the tab functionality in tab.html

// Ever thanksful to bobspace who gave this nice handy array of the 140 valid css named colors to compare against
// https://gist.github.com/bobspace/2712980
const CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

// html object references
const body = document.querySelector('body');
const prompt = document.querySelector('.prompt');
const output = document.getElementById("output");


var promptContent = "";
var commandHistory = [];


prompt.addEventListener("keyup", function(evt){
    let keyNum = evt.keyCode;
    let key = keyCodes[evt.keyCode];

    if (key == "enter") { // enter: process command
        processPrompt(promptContent);
    }
    else if (key == "up") {
        let lastCommand = commandHistory.shift();
        if (lastCommand != undefined) {
            commandHistory.push(lastCommand);
            promptContent = lastCommand.command;
            if (lastCommand.rest != undefined) {
                promptContent += ` ${lastCommand.rest}`;
            }
            prompt.value = promptContent;
        }
    }
    else if (key == "down") {
        let lastCommand = commandHistory.pop();
        if (lastCommand != undefined) {
            commandHistory.unshift(lastCommand);
            promptContent = lastCommand.command;
            if (lastCommand.rest != undefined) {
                promptContent += ` ${lastCommand.rest}`;
            }
            prompt.value = promptContent;
        }
    }
    else {
        promptContent = prompt.value;
    }
});

function processPrompt(prompt) {
    let commands = prompt.split(/;\s*/);
    console.log(commands);
    commands.forEach(function(elem){
        processCommand(elem);
    });
}

function processCommand(command) {
    let processed = processFirstWord(command);
    let error = false;        
    console.log(`0: ${processed.command}, 1-end ${processed.rest}`);
    try {
        if (process[processed.command]) {
            process[processed.command].func(processed.rest);
        }
        else if (alts[processed.command]) {
            process[alts[processed.command]].func(processed.rest);
        }
        else {
            updateOutput(`"${processed.command}" is not a valid command.\n`);
        }
    }
    catch(err){
        console.log(`Invalid command! Message: ${err}`);
        output.innerText += "Invalid command!\n";
        output.scrollTop = output.scrollHeight;
        error = true;
    }
    if (!error) { // if the process was successful, add to command history
        commandHistory.unshift(processed);
    }
    promptContent = "";
    prompt.value = "";
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

// function for determining if a value is a valid number using regex found from:
// https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); } 

// function for determining if the passed string is a color in either:
// 3 digit or 6 digit hex form or
// one of the 140 CSS named colors supported by all browsers
function isColor(color) {
    let isHex = /(^#[0-9a-f]{6}$)|(^#[0-9a-f]{3}$)/i.test(color);
    console.log(`isHex: ${isHex}\n`);
    if (isHex) { // if the color is a valid hex, return true
        return true;
    }
    else { // otherwise, see if it's in the array of valid CSS color names
        let filter = new RegExp(CSS_COLOR_NAMES.join("|"), "i");
        return filter.test(color);
    }
}