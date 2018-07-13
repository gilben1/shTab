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
var commandIndex = 0;

prompt.addEventListener("keyup", function(evt){
    let keyNum = evt.keyCode;
    let key = keyCodes[evt.keyCode];

    if (key == "enter") { // enter: process command
        let promptCopy = promptContent;
        if(processPrompt(promptContent) == true) {
            commandHistory.unshift(promptCopy);
        }
    }
    else if (key == "up") {
        let lastCommand = commandHistory[commandIndex];
        if (lastCommand != undefined) {
            commandIndex = (commandIndex + 1) % (commandHistory.length);
            promptContent = lastCommand;
            prompt.value = promptContent;
        }
    }
    else if (key == "down") {
        let lastCommand = commandHistory[commandIndex];
        if (lastCommand != undefined) {
            commandIndex = (commandIndex - 1 < 0) ? commandHistory.length - 1 : commandIndex - 1;
            promptContent = lastCommand;
            prompt.value = promptContent;
        }
    }
    else {
        promptContent = prompt.value;
    }
});

/**
 * Processes the content of the prompt
 * Includes allowing multiple commands separated by semi-colons
 * @param {string} promptString 
 */
function processPrompt(promptString) {
    let commands = promptString.split(/;\s*/);
    try {
        commands = joinMatchingQuotes(commands);
    }
    catch(err) {
        updateOutput(`${err}\n`);
        promptContent = "";
        prompt.value = "";
        return;
    }
    let success = true;
    commands.forEach(function(elem){
        let status = processCommand(elem);
        success = (success == false) ? false : status;
    });
    return success;
}

/**
 * Join together elements in the passed array based on quotes
 * Effectively, unsplits strings separated by semicolons if they're surrounded by quotes
 * @param {string[]} input 
 */
function joinMatchingQuotes(input) {
    let output = [];
    for (let i = 0; i < input.length; ++i) {
        let countQuote = input[i].split('\"').length - 1;
        if (countQuote > 0 && countQuote % 2 != 0) { // odd non-zero number of quotes in string
            // look for a matching quote in subsequent strings
            let built = input[i];
            let foundQuotes = 0;
            for (let j = i + 1; j < input.length; ++j) {
                built = built + "; " + input[j];
                let findQuote = input[j].split('\"').length - 1;
                if (findQuote % 2 != 0) {
                    foundQuotes++;
                    i = j;
                    break;
                }
            }
            if (foundQuotes < 1) {
                throw "Not enough quotes!\n";
            }
            output.push(built);
        }
        else {
            output.push(input[i]);
        }
    }
    return output;
}

/**
 * Run the command through the jump and alt tables
 * @param {string} command 
 * @returns {boolean} Success or failure
 */
function processCommand(command) {
    let processed = processFirstWord(command);
    let error = false;        
    console.log(`0: ${processed.command}, 1-end ${processed.rest}`);
    try {
        let old = processed.command; // pre-expansion
        processed.command = expandAlias(processed.command); // Expand alias if it exists

        if (process[processed.command]) {
            process[processed.command].func(processed.rest);
        }
        else if (alts[processed.command]) {
            process[alts[processed.command]].func(processed.rest);
        }
        else if (processed.command != old){ // An alias expanded, try processing it
            processPrompt(processed.command + " " + processed.rest);
        }
        else {
            updateOutput(`"${processed.command}" is an invalid command.\n`);
            promptContent = "";
            prompt.value = "";
            return false;
        }
    }
    catch(err){
        updateOutput(`Invalid command! Message: ${err}\n`);
        promptContent = "";
        prompt.value = "";
        return false;
    }
    promptContent = "";
    prompt.value = "";
    return true;
}

/**
 * Returns the expanded form of the passed alias
 * If there is no expansion, returns the original parameter
 * @param {string} alias 
 * @return {string} expanded alias command
 */
function expandAlias(alias) {
    let expanded = aliases[alias] || alias;
    return expanded;
}

/**
 * Takes a command and splits it into first word followed by
 * rest of the arguments
 * @param {string} command 
 * @return {{"command": string, "rest": string}} Object with separated command and rest
 */
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

/**
 * Prints the passed text to the output and js console
 * @param {string} text 
 */
function updateOutput(text) {
    output.innerText += text;
    output.scrollTop = output.scrollHeight;
    console.log(text);
}

// function for determining if a value is a valid number using regex found from:
// https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript

/**
 * Returns whether the passed string is a number or not
 * @param {string} n 
 * @return {boolean} whether n is a number or not
 */
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); } 

/**
 * 
 * function for determining if the passed string is a color in either:
 * 3 digit or 6 digit hex form or
 * one of the 140 CSS named colors supported by all browsers
 * @param {string} color 
 * @return {boolean} whether color is a hex or CSS color
 */
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