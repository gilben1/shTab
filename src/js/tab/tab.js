// Copyright (c) 2018 Nicholas Gilbert
// The script that controls the tab functionality in tab.html

// Ever thanksful to bobspace who gave this nice handy array of the 140 valid css named colors to compare against
// https://gist.github.com/bobspace/2712980
const CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

// html object references
const body = document.querySelector('body');
const prompt = document.querySelector('.prompt');
const output = document.getElementById("output");
const btmOut = document.getElementById("btmOutput");
const prefix = document.getElementById("ps1");

var promptContent = "";

var commandIndex = 0;

var autoCompleteMatches = [];
let countMatches = 0;
var autoIndex = 0;

var commands = [];

prompt.addEventListener("keyup", function(evt){
    let keyNum = evt.keyCode;
    let key = keyCodes[evt.keyCode];

    if (key == "enter") { // enter: process command
        let promptCopy = promptContent;
        commands.forEach(function(elem){
            processCommand(elem);
        });
        commandHistory.push(promptCopy);
        commandIndex = commandHistory.length;
        removeBangs();
        if (saveHistory == true) {
            browser.storage.local.set({commandHistory});
        }
        btmOut.innerText = "";
    }
    else if (key == "up") {
        commandIndex = (commandIndex - 1 < 0) ? 0 : commandIndex - 1;
        let lastCommand = commandHistory[commandIndex];
        if (lastCommand != undefined) {
            promptContent = prompt.value = lastCommand;

            commands = processPrompt(promptContent);
            countMatches = buildCompletion(commands[commands.length - 1]);
            
            btmOut.innerText = "";
        }
        else {
            promptContent = prompt.value = "";
        }
    }
    else if (key == "down") {
        commandIndex = (commandIndex + 1 > commandHistory.length) ? commandHistory.length : commandIndex + 1;
        let lastCommand = commandHistory[commandIndex];
        if (lastCommand != undefined) {
            promptContent = prompt.value = lastCommand;

            commands = processPrompt(promptContent);
            countMatches = buildCompletion(commands[commands.length - 1]);
            
            btmOut.innerText = "";
        }
        else {
            promptContent = prompt.value = "";
        }
    }
    else if (key == "right" && promptContent.length > 0 && countMatches > 0) {
        if (countMatches == 1) { // only one, let's just complete it
            let autoComp = autoCompleteMatches[autoIndex];
            let replace = commands[commands.length - 1].split(' ');
            replace[replace.length - 1] = autoComp;
            commands[commands.length - 1] = replace.join(' ');
            promptContent = prompt.value = commands.join('; ');
            
            commands = processPrompt(promptContent);
        }
        else { // otherwise, complete up to common word and print rest below
            let autoComp = findCommonFromStart(autoCompleteMatches);

            let replace = commands[commands.length - 1].split(' ');
            replace[replace.length - 1] = autoComp;
            commands[commands.length - 1] = replace.join(' ');
            promptContent = prompt.value = commands.join('; ');



            let out = "";
            autoCompleteMatches.reverse();
            for (let match of autoCompleteMatches) {
                out += (match + "   ");
            }
            out += "\n";
            btmOut.innerText = "";
            autoCompleteMatches.reverse();
            updateBtmOutput(out);
        }
    }
    else {
        promptContent = prompt.value;
        
        commands = processPrompt(promptContent);
        countMatches = buildCompletion(commands[commands.length - 1]);

        btmOut.innerText = "";
    }
});

/**
 * Processes the content of the prompt
 * Includes allowing multiple commands separated by semi-colons
 * @param {string} promptString 
 */
function processPrompt(promptString) {
    let comm = promptString.split(/;\s*/);
    comm = joinMatchingQuotes(comm);
    return comm;
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
        if (processed.command[0] == '!') {
            processed.command = expandHistory(processed.command);
        }
        processed.command = expandAlias(processed.command); // Expand alias if it exists

        if (process[processed.command]) { // try and process as a command
            process[processed.command].func(processed.rest);
        }
        else if (alts[processed.command]) { // try and process as an alt
            process[alts[processed.command]].func(processed.rest);
        }
        else if (processed.command != old){ // An alias expanded to multiple commands, try processing it
            let subcommands = [];
            let success = true;
            if (processed.rest) {
                subcommands = processPrompt(processed.command + " " + processed.rest);
            }
            else {
                subcommands = processPrompt(processed.command);
            }
            subcommands.forEach(function(elem){
                let status = processCommand(elem);
                success = (success == false) ? false : status;
            });
            return success;
        }
        else {
            updateOutput(`"${processed.command}" is an invalid command.\n`);
            promptContent = prompt.value = "";
            return false;
        }
    }
    catch(err){
        updateOutput(`!! ${err}\n`);
        promptContent = prompt.value = "";
        return false;
    }
    promptContent = prompt.value = "";
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
 * Expands commands beginning with ! to most recent match
 * in history, or the original command
 * @param {string} command 
 * @returns {string} result of history expansion
 */
function expandHistory(command) {
    commandHistory.reverse();
    command = command.substr(1);
    for (let his of commandHistory) {
        if(his.indexOf(command) == 0) {
            let ret = his;
            commandHistory.reverse();
            return ret;
        }
    }
    commandHistory.reverse();
    return "!" + command;
}

/**
 * Removes history that starts with ! to match bash
 */
function removeBangs() {
    for (let index in commandHistory) {
        if (commandHistory[index][0] == '!') {
            commandHistory.splice(index, 1);
        }
    }
}

/**
 * Returns the common characters from the start of each word for autocompletion
 * @param {string[]} matches 
 */
function findCommonFromStart(matches) {
    let common = "";
    let index = 0;
    while (index >= 0) {
        let addToCommon = true;
        for (let match of matches) {
            if (addToCommon == true) {
                common += match[index];
                addToCommon = false;
            }
            if (!match.startsWith(common)) {
                common = common.slice(0, -1);
                index = -2;
                break;
            }
        }
        index++;
    }
    return common;
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
 * Builds autocompletion based on the passed in string
 * @param {string} input Input string to evaluate, is generally a command
 * @returns {number} Number of matches created for autocompletion
 */
function buildCompletion(input){
    let processed = processFirstWord(input);
    let mode = "";
    if (processed.rest == undefined) { // if we are trying to complete based on command
        mode = "command";
    }
    else {
        mode = "arg";
    }

    switch(mode) {
        case "command":
            autoCompleteMatches = [];
            for (let key in process) {
                if(key.indexOf(input) == 0) {
                    autoCompleteMatches.unshift(key);
                }
            }
            for (let key in alts) {
                if(key.indexOf(input) == 0) {
                    autoCompleteMatches.unshift(key);
                }
            }
            for (let key in aliases) {
                if (key.indexOf(input) == 0) {
                    autoCompleteMatches.unshift(key);
                }
            }
            break;
        case "arg":
            autoCompleteMatches = [];
            argCompletion(processed);
            break;
    }
    return autoCompleteMatches.length;
}

/**
 * Completes arguments based on the command
 * @param {{"command": string, "rest": string}} proc 
 */
function argCompletion(proc) {
    if (aliases[proc.command]) { // expand the alias before trying to complete
        let aliasExpand = processFirstWord(aliases[proc.command]);
        proc.command = aliasExpand.command;
        proc.rest = aliasExpand.rest + " " + (proc.rest ? proc.rest : " ");
    }

    let match = process[proc.command] ? proc.command :
                        alts[proc.command] ? alts[proc.command] : undefined;

    if (!match) {
        return;
    }
    // The last word of the rest is what we're trying to complete
    let compareSplit = proc.rest.split(' ');
    let opt = {};
    try {
        opt = getOpts(compareSplit, process[match].optstring, {noAliasPropagation: true});
    }
    catch(err) {
        opt = undefined;
    }

    let compare = compareSplit[compareSplit.length - 1];
    let prev = compareSplit.length > 1 ? compareSplit[compareSplit.length - 2] : undefined;

    for (let key in process[match].args) { // match based on command's arguments
        if (process[match].args[key].indexOf(compare) == 0) {
            autoCompleteMatches.unshift(process[match].args[key]);
        } 
    }

    for (let key in process[match].flags) { // match based on command's flags
        if (process[match].flags[key].indexOf(compare) == 0) {
            autoCompleteMatches.unshift(process[match].flags[key]);
        }
    }

    // Process collection based arguments defined in each command
    let matchcol = process[match].argscol;
    for (let col in matchcol) {
        if (matchcol[col].length != 0 && !matchcol[col].includes(prev)) { // if there's a restriction that's not met
            continue;
        }
        switch(col) {
            case "aliases":
                for (let key in aliases) {
                    if (key.indexOf(compare) == 0 && !autoCompleteMatches.includes(key)) {
                        autoCompleteMatches.unshift(key);
                    }
                }
                break;
            case "commands":
                for (let key in process) {
                    if (key.indexOf(compare) == 0 && !autoCompleteMatches.includes(key)) {
                        autoCompleteMatches.unshift(key);
                    }
                }
                for (let key in alts) {
                    if (key.indexOf(compare) == 0 && !autoCompleteMatches.includes(key)) {
                        autoCompleteMatches.unshift(key);
                    }
                }
                break;
            case "dests":
                for (let key in dests) {
                    if (key.indexOf(compare) == 0 && !autoCompleteMatches.includes(key)) {
                        autoCompleteMatches.unshift(key);
                    }
                }
                break;
            case "options":
                for (let key in defaultOptions) {
                    if (key.indexOf(compare) == 0 && !autoCompleteMatches.includes(key)) {
                        autoCompleteMatches.unshift(key);
                    }
                }
                break;
        }
    }
    // Function for case-insensitive sort found at https://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-in-javascript
    autoCompleteMatches.sort(function(a,b){
        return a.localeCompare(b, 'en', {'sensitivity': 'base'});
    });
    autoCompleteMatches.reverse();
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

/**
 * Prints the passed text to the bottom output and js console
 * @param {string} text 
 */
function updateBtmOutput(text) {
    btmOut.innerText += text;
    btmOut.scrollTop = btmOut.scrollHeight;
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