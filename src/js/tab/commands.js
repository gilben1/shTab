// Copyright (c) 2018 Nicholas Gilbert

// All commands that can be run from the tab page
// url regex found from: https://github.com/cadeyrn/newtaboverride/src/js/core/utils.js
const URL_REGEX = /^https?:\/\//i;

/**
 * Opens dest through set links or as a direct url
 * @param {string} args
 */
function goto(args) { // usage: goto [link]
    let opts = getopt.getopt(args ? args.split(' ') : [], "n", ["new"]);

    let flags = opts[0];
    let dest = opts[1].join(' ');

    let target = "_self";

    for (let f in flags) {
        let option = flags[f];
        switch(option[0]) {
            case "-n": case "--new":
                target = "_blank";
                break;
        }
    }

    if (dest == undefined) {
        throw "No arguments!\n";
    }
    console.log(`Goto activated, dest = ${dest}`);
    let url = dest.match(URL_REGEX);
    if (url != undefined) { // if goto was a url
        window.open(dest, target);
    }
    console.log(url);

    url = dests[dest];
    if (url != undefined) { // if there was a link
        window.open(url, target);
    }
}

/**
 * Lists all dests to the output
 */
function list() { // list all commands
    console.log("List activated");
    updateOutput(`Current links:\n`);
    for (let key in dests) {
        updateOutput(`${key} -> ${dests[key]}\n`);
    }
}

/**
 * Links a name to a dest
 * Given no parameters, displays all dests to the output
 * args is expected as <name> <dest>
 * @param {string} args
 */
function link(args) { // usage: link [alias] [dest]
    let opts = getopt.getopt(args ? args.split(' ') : [], "dlr:", ["display", "list", "remove="]);

    let flags = opts[0];
    let toLink = opts[1].join(' ');
    
    let mode = "add";
    let display = false;
    let name = "";

    for (let flag in flags) {
        let option = flags[flag];
        switch(option[0]) {
            case "-l": case "--list":
            case "-d": case "--display":
                display = true;
                break;
            case "-r": case "--remove":
                mode = "remove";
                name = option[1];
                break;
            case undefined:
                break;
        }
    }

    switch(mode) {
        case "remove":
            if (dests[name]) {
                updateOutput(`Removed ${name} -> ${dests[name]} as a destination.\n`);
                delete dests[name];
            }
            else {
                updateOutput(`Destination ${name} doen't exist.\n`);
            }
            break;
        case "add":
            if (toLink != "") {
                let toLinkSplit = toLink.split(' ', 2);
                if (toLinkSplit.length != 2) {
                    throw "Too few arguments!\n";
                }
                let alias = toLinkSplit[0];
                let dest = toLinkSplit[1];
                dests[alias] = dest;
                updateOutput(`Added link from ${alias} to ${dest}.\n`)
            }
            break;
    }
    if (display) {
        updateOutput(`Current links:\n`);
        for (let key in dests) {
            updateOutput(`${key} -> ${dests[key]}\n`);
        }
    }
}

/**
 * Saves options to local storage.
 * Args defines what is saved to local storage
 * @param {string} args 
 */
function save(args) {

    switch(args) {
        case undefined: // save everything
            saveCurrentOptions();
            updateOutput(`Saved all options to local storage\n`);
            break;
        case "links":
            browser.storage.local.set({dests});
            updateOutput(`Saved links to local storage.\n`);
            break;
        case "back":
            browser.storage.local.set({bgColor});
            updateOutput(`Saved background color to local storage\n`);
            break;
        case "text":
        case "fore":
            browser.storage.local.set({fgColor});
            updateOutput(`Saved foreground color to local storage\n`);
            break;
        case "colo":
        case "color":
            browser.storage.local.set({fgColor});
            browser.storage.local.set({bgColor});
            updateOutput(`Saved color settings to local storage\n`);
            break;
        case "output":
        case "size":
        case "height":
            browser.storage.local.set({outputHeight});
            updateOutput(`Saved output size setting to local storage\n`);
            break;
    }
}

/**
 * Clears a variety of things based on argument
 * No argument clears output
 * @param {string} args 
 */
function clear(args) {
    switch(args) {
        case "history":
            commandHistory = [];
            updateOutput(`Cleared command history.\n`);
            break;
        case "links":
            dests = {};
            updateOutput(`Cleared links.\n`);
            break;
        default: // treat undefined or invalid as simply clearing console
            output.innerText = "";
            break;
    }
}

/**
 * Displays help information when given an command argument
 * Lists all commands when given no argument 
 * @param {string} args 
 */
function help(args) {
    switch(args) {
        case undefined: // no arguments
            for (let key in process) {
                updateOutput(`${key}\n`)
            }
            for (let key in alts) {
                updateOutput(`${key} (${alts[key]})\n`)
            }
            break;
        default:
            if (process[args]) {
                updateOutput(`Help for ${args}:\n`);
                updateOutput(`${process[args].desc}\n`);
                updateOutput(`usage: ${process[args].usage}\n`);
            }
            else if(process[alts[args]]) {
                updateOutput(`Help for ${args} (alias for ${alts[args]}):\n`);
                updateOutput(`${process[alts[args]].desc}\n`);
                updateOutput(`usage: ${process[alts[args]].usage}\n`);
            }
            else {
                throw "Invalid argument.\n";
            }
            break;

    }
}

// Resizes the output terminal to @size lines of text
/**
 * Sets the number of lines in the output to the passed size
 * Displays number of lines in the output when passed nothing
 * @param {string} size 
 */
function resizeOutput(args) {
    let opts = getopt.getopt(args ? args.split(' ') : [], "t:b:d", ["top=", "bottom=", "display"]);

    let flags = opts[0];

    for (let f in flags) {
        let option = flags[f];
        switch(option[0]) {
            case "-b": case "--bottom": {
                let size = option[1];
                btmOut.style.setProperty('--btm-height', (size * 1.1) + 'em'); 
                btmHeight = size;
                browser.storage.local.set({btmHeight});
                updateOutput(`Resized bottom output to ${size} lines of text.\n`);
                break;
            }
            case "-d": case "--display":
                updateOutput(`Current output height: ${outputHeight} lines.\n`);
                updateOutput(`Current bottom output height: ${btmHeight} lines.\n`);
                break;
            case "-t": case "--top":{
                let size = option[1];
                output.style.setProperty('--output-height', (size * 1.1) + 'em'); 
                outputHeight = size;
                browser.storage.local.set({outputHeight});
                updateOutput(`Resized output to ${size} lines of text.\n`);
                break;
            }
        }
    }
}

// Sets a color element to a specified value
/**
 * Sets the color for a passed element to either a CSS color value or hex value
 * args expected as <elem> <color>
 * @param {string} args 
 */
function colo(args) {

    switch(args) {
        case undefined: // No arguments => just print current values
            updateOutput(`Current background color: ${bgColor}\n`);
            updateOutput(`Current foreground / text color: ${fgColor}\n`);
            break;
        default:
            let argsSplit = args.split(' ', 2);
            if (argsSplit.length != 2) {
                throw "Too few arguments!\n";
            }
            let target = argsSplit[0];
            let color = argsSplit[1];
            if (!isColor(color)) { // Test to see if the color is a valid named color or is in 3 or 6 digit hex form
                throw "Invalid color!\n";
            }
            switch(target){
                case "back":
                    bgColor = color;
                    browser.storage.local.set({bgColor});
                    break;
                case "text": case "fore":
                    fgColor = color;
                    browser.storage.local.set({fgColor});
                    break;
                default:
                    throw "Bad element name!\n";
            }
            applyCurrentOptions();
            break;
    }
}

var objectURL;
/**
 * Exports current options to a .json file
 * args currently aren't used
 * @param {string} args 
 */
function exportOpts(args) {
    let file = new File([JSON.stringify({dests, outputHeight, fgColor, bgColor}, null, 4)], "output.json", {type: "text/plain;charset=utf-8"});
    objectURL = URL.createObjectURL(file);
    browser.downloads.download({
        url: objectURL,
        filename: "shTab_settings.json",
        conflictAction: 'uniquify'});

    // Used to remove the object url after the file has finished downloading
    /**
     * Handles the state change for the downloaded file
     * Used to print output and remove object url when the file has finished
     * downloading
     * @param {*} delta 
     */
    function handleChanged(delta) {
        if (delta.state && delta.state.current === "complete") {
            console.log(`Download ${delta.id} has completed.`);
            URL.revokeObjectURL(objectURL);
            updateOutput(`Current settings exported to file!\n`);
        }
    }
    
    browser.downloads.onChanged.addListener(handleChanged); 
}

/**
 * Imports settings from a .json file into the current settings
 */
function importOpts() {
    let importElem = document.getElementById("importFile");
    importElem.addEventListener("change", handleImport, false);
    importElem.click();

    var fr = new FileReader();

    /**
     * Used in the event listener to handle the click event for the importFile element
     * To open the file dialog
     */
    function handleImport() {
        var file = this.files[0];
        console.log(file);
        fr.readAsText(file);
        fr.addEventListener("loadend", doneLoading, false);
    }

    /**
     * Get triggered when the file gets done reading, so it can be parsed in JSON
     */
    function doneLoading() {
        let importedOptions = JSON.parse(fr.result);
        console.log(importedOptions);
        bgColor = importedOptions.bgColor ? importedOptions.bgColor : bgColor;
        fgColor = importedOptions.fgColor ? importedOptions.fgColor : fgColor;
        outputHeight = importedOptions.outputHeight ? importedOptions.outputHeight : outputHeight;
        if (importedOptions.bgColor) {
            updateOutput(`Updated background color to ${importedOptions.bgColor}\n`);
        }
        if (importedOptions.fgColor) {
            updateOutput(`Updated foreground color to ${importedOptions.fgColor}\n`);
        }
        if (importedOptions.outputHeight) {
            updateOutput(`Updated output height to ${importedOptions.outputHeight}\n`);
        }

        dests = Object.assign({}, dests, importedOptions.dests);

        updateOutput(`Added the following links:\n`);
        for (let key in importedOptions.dests) {
            updateOutput(`    ${key} -> ${dests[key]}\n`);
        }

        applyCurrentOptions();
    }
}

/**
 * Sets an alias from a word to command(s)
 * If empty, displays the aliases
 * expected form of args: WORD="some words"
 * @param {string} args 
 */
function alias(args) {
    switch(args) {
        case undefined:
            updateOutput(`Current aliases:\n`);
            for (let key in aliases) {
                updateOutput(`${key} -> ${aliases[key]}\n`);
            }
            break;
        default:
            if (/^[a-z0-9\-\_]+=".*"/i.test(args) == false) { // regex for WORD="WORD" form
                throw "Not right form for alias!\n";
            }
            let argsSplit = args.split('\"', 2);
            argsSplit[0] = argsSplit[0].slice(0, -1);
            console.log(argsSplit);
            aliases[argsSplit[0]] = argsSplit[1];
            browser.storage.local.set({aliases});
            updateOutput(`Added an alias from ${argsSplit[0]} to ${argsSplit[1]}.\n`);
            break;
    }
}

/**
 * Echoes the input to the output
 * @param {string} text 
 */
function echo(text) {
    updateOutput(text + "\n");
}



/**
 * Applies the current options to the CSS style
 */
function applyCurrentOptions() {
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--fg-color', fgColor);
    output.style.setProperty('--output-height', (outputHeight * 1.1) + 'em'); 
    btmOut.style.setProperty('--btm-height', (btmHeight * 1.1) + 'em');
}

/**
 * Saves the current options to local storage
 */
function saveCurrentOptions() {
    browser.storage.local.set({dests});
    browser.storage.local.set({bgColor});
    browser.storage.local.set({fgColor});
    browser.storage.local.set({outputHeight});
    browser.storage.local.set({aliases});
    browser.storage.local.set({btmHeight});
}

/* Each process has the following format:
    {
        func:
        desc:
        usage:
    }
    func is the function to jump to
    desc is the description that gets printed by help
        Since desc is multiline, it needs to be at the start of the line
        Cannot start indented, otherwise the div will interpret the indent
    usage is a separate printout by help
*/

/**
 * Jump table for running commands based on strings
 */
var process = {
    "alias": {
        func: alias,
        desc:
"Aliases a shorthand keyword to map to another command\n\
    arguments:\n\
        <name>: the name of the alias\n\
        <string>: string you want to replace when <name> is entered\n\
        (none): displays the current aliases",
        usage:      "alias <name>=\"<string>\"",
        flags: [],
        args: []
    },
    "clear": {
        func:       clear,
        desc:       
"Clears the console, or whatever is passed to it\n\
    arguments:\n\
        history: clears command history\n\
        links: clears set links for the session\n\
        (none): clears command prompt",     
        usage:      "clear [history|links]",
        flags: [],
        args:       ["history", "links"]
    },
    "colo": {
        func:       colo,
        desc:
"Sets the color of the given element\n\
    arguments:\n\
        back: the background of every element\n\
        text: the text of every element\n\
        color: the color to set to\n\
        (none): display current colors",
        usage:      "colo <back|text> <color>",
        flags: [],
        args:       ["back", "text"]
    },
    "echo": {
        func:       echo,
        desc:
"Echoes the inputted string into the output buffer\n\
    arguments:\n\
        <string>: what to output",
        usage:      "echo <string>",
        flags: [],
        args: []
    },
    "export": {
        func:       exportOpts,
        desc:
"Exports current options and links to a .json file for later import\n\
    No arguments",
        usage:      "export",
        flags: [],
        args: []
    },
    "goto": {
        func:       goto,
        desc:       
"Opens a specified link or url\n\
    flags:\n\
        -n | --new: opens link in new tab / window (dependant on browser settings)\n\
        (none): opens link in current tab\
    arguments:\n\
        <name>: the link to navigate to",
        usage:      "goto [-n|--new] <name>",
        flags: ["-n", "--new"],
        args: []
    },
    "help": {
        func:       help,
        desc:       
"Displays information about the possible commands to run\n\
    arguments:\n\
        <command>: display the help information for this command\n\
        (none): list all commands",
        usage:      "help [<command>]",
        flags: [],
        args: []
    },
    "import": {
        func:       importOpts,
        desc:
"Imports options and links from a selected .json file\n\
    No arguments",
        usage:      "import",
        flags: [],
        args: []
    },
    "link": {
        func:       link,
        desc:       
"Links a name to a destination, used when running goto\n\
    flags:\n\
        -r | --remove <del>: remove <del> as a name to a destination\n\
        -dl | --display | --list: display the current destinations\n\
    arguments:\n\
        <name>: name to set\n\
        <dest>: destination to go to",
        usage:      "link [-d|-l|--display|--list] [-r|--remove <del>] [<name> <dest>]",
        flags: ["-d", "-r", "-l", "--display", "--list", "--remove"],
        args: []
    },
    "list": {
        func:       list,
        desc:       
"Lists the links that have been set\n\
    No arguments",
        usage:      "list",
        flags: [],
        args: []
    },
    "resize": {
        func:       resizeOutput,
        desc:
"Resizes the output to the passed value\n\
    flags:\n\
        -t|--top <value>: sets top output height to <value>\n \
        -b|--bottom <value>: sets bottom output height to <value>\n\
        -d|--display: outputs the current height for both outputs",
        usage:      "resize [-d] [-b|--bottom <value>] [-t|--top <value>]",
        flags: ["-d", "--display", "-b", "--bottom", "-t", "--top"],
        args: []
    },
    "save": {
        func:       save,
        desc:       
"Stores the passed option to local storage\n\
    arguments:\n\
        links: link to destination aliases\n\
        back: background color\n\
        text|fore: text / foreground color\n\
        colo|color: both color settings\n\
        output|size|height: output size setting\n\
        (none): if blank, saves all settings",
        usage:      "save [links|back|text|fore|colo|color|output|size|height]",
        flags: [],
        args: ["links", "back", "text", "fore", "colo", "color", "output", "size", "height"]
    },
};

/**
 * Alternate names for commands, essentially a second level jump table
 */
var alts = {
    "ls": "list",
    "go": "goto",
    ":w": "save",
    "man": "help",
    "color": "colo",
    "add": "link"
};