// Copyright (c) 2018 Nicholas Gilbert

// All commands that can be run from the tab page

const about = { 
    desc:       
"Displays information about shTab\n\
    no flags or arguments",
    usage:      "about",
    flags: [],
    optstring: {
        short: "",
        long: []
    },
    args: [],
    /**
     * Displays information about the extension
     * 
     * @param {string} args 
     */
    func:
    function about (args) {
        let manifest = browser.runtime.getManifest();
        updateOutput(`${manifest.name} v ${manifest.version}\n`);
        updateOutput(`${manifest.description}\n\n`);
        updateOutput(`Developed by ${manifest.developer.name} (${manifest.developer.url})\n`);
    }
}

const alias = {
    desc:
"Aliases a shorthand keyword to map to another command\n\
    flags:\n\
        -r | --remove <del>: remove <del> as an alias\n\
        -dl | --display | --list: display the current alias\n\
    arguments:\n\
        <name>: the name of the alias\n\
        <string>: string you want to replace when <name> is entered\n\
        (none): displays the current aliases",
    usage:      "alias [-d|-l|--display|--list] [-r|--remove <del>] <name>=\"<string>\"",
    flags: ["-d", "--display", "-l", "--list", "-r", "--remove"],
    optstring: {
        short: "dlr:",
        long: [ "display", "list", "remove=" ]
    },
    args: [],
    /**
     * Sets an alias from a word to command(s)
     * If empty, displays the aliases
     * expected form of args: WORD="some words"
     * @param {string} args 
     */
    func:
    function alias(args) {
        let opts = getopt.getopt(args ? args.split(' ') : [], this.optstring.short, this.optstring.long);

        let flags = opts.opts;
        let toAlias = opts.args.join(' ');
        
        let mode = "add";
        let display = false;
        let name = "";

        for (let option of flags) {
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
            case "add":
                if (toAlias != "") {
                    if (/^[a-z0-9\-\_]+=".*"/i.test(toAlias) == false) { // regex for WORD="WORD" form
                        throw "Not right form for alias!\n";
                    }
                    let aliasSplit = toAlias.split('\"', 2);
                    aliasSplit[0] = aliasSplit[0].slice(0, -1);
                    aliases[aliasSplit[0]] = aliasSplit[1];
                    browser.storage.local.set({aliases});
                    updateOutput(`Added an alias from ${aliasSplit[0]} to ${aliasSplit[1]}.\n`);
                }
                break;
            case "remove":
                if (aliases[name]) {
                    updateOutput(`Removed ${name} -> ${aliases[name]} as an alias.\n`);
                    delete aliases[name];
                }
                else {
                    updateOutput(`Alias ${name} doen't exist.\n`);
                }
                break;
        }
        if (display) {
            updateOutput(`Current aliases:\n`);
            for (let key in aliases) {
                updateOutput(`${key} -> ${aliases[key]}\n`);
            }
        }
    }
}

const clear = {
    desc:       
"Clears the console, or whatever is passed to it\n\
    arguments:\n\
        history: clears command history\n\
        links: clears set links for the session\n\
        (none): clears command prompt",     
    usage:      "clear [history|links]",
    flags: [],
    optstring: {
        short: "",
        long: []
    },
    args:       ["history", "links"],
    /**
     * Clears a variety of things based on argument
     * No argument clears output
     * @param {string} args 
     */
    func:
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
}

const colo = {
    desc:
"Sets the color of the given element\n\
    flags:\n\
        -b|--background <color>: sets the background color to <color>\n\
        -d|--display: displays the current color settings\n\
        -f|--foreground <color>: sets the foreground color to <color>",
    usage:      "colo [-b|--background <color>] [-d|--display] [-f|--foreground <color>]",
    flags: ["-b", "--background", "-d", "--display", "-f", "--foreground"],
    optstring: {
        short: "b:df:",
        long: ["background=", "display", "foreground="]
    },
    args: [],
    // Sets a color element to a specified value
    /**
     * Sets the color for a passed element to either a CSS color value or hex value
     * args expected as <elem> <color>
     * @param {string} args 
     */
    func:
    function colo(args) {
        let opts = getopt.getopt(args ? args.split(' ') : [], this.optstring.short, this.optstring.long);

        let flags = opts.opts;

        for (let option of flags) {
            switch(option[0]) {
                case "-b": case "--background": {
                    let color = option[1];
                    if (!isColor(color)) { // Test to see if the color is a valid named color or is in 3 or 6 digit hex form
                        throw "Invalid color!\n";
                    }
                    bgColor = color;
                    browser.storage.local.set({bgColor});
                    document.documentElement.style.setProperty('--bg-color', bgColor);
                    updateOutput(`Set background color to ${color}\n`);
                    break;
                }
                case "-d": case "--display":
                    updateOutput(`Current background color: ${bgColor}\n`);
                    updateOutput(`Current foreground / text color: ${fgColor}\n`);
                    break;
                case "-f": case "--foreground":{
                    let color = option[1];
                    if (!isColor(color)) { // Test to see if the color is a valid named color or is in 3 or 6 digit hex form
                        throw "Invalid color!\n";
                    }
                    fgColor = color;
                    browser.storage.local.set({fgColor});
                    document.documentElement.style.setProperty('--fg-color', fgColor);
                    updateOutput(`Set foreground color to ${color}\n`);
                    break;
                }
            }
        }
    },
}

const echo = {
    desc:
"Echoes the inputted string into the output buffer\n\
    arguments:\n\
        <string>: what to output",
    usage:      "echo <string>",
    flags: [],
    optstring: {
        short: "",
        long: []
    },
    args: [],
    /**
     * Echoes the input to the output
     * @param {string} text 
     */
    func:
    function echo(text) {
        updateOutput(text + "\n");
    }
}

var objectURL;
const exportOpts = {
    desc:
"Exports current options and links to a .json file for later import\n\
    No arguments",
    usage:      "export",
    flags: [],
    optstring: {
        short: "",
        long: []
    },
    args: [],
    /**
     * Exports current options to a .json file
     * args currently aren't used
     * @param {string} args 
     */
    func:
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
}

// url regex found from: https://github.com/cadeyrn/newtaboverride/src/js/core/utils.js
const URL_REGEX = /^https?:\/\//i;

const goto = {
    desc:       
"Opens a specified link or url\n\
    flags:\n\
        -n | --new: opens link in new tab / window (dependant on browser settings)\n\
        (none): opens link in current tab\n\
    arguments:\n\
        <name>: the link to navigate to",
    usage:      "goto [-n|--new] <name>",
    flags: ["-n", "--new"],
    optstring: {
        short: "n",
        long: ["new"]
    },
    args: [],
    /**
     * Opens dest through set links or as a direct url
     * @param {string} args
     */
    func:       
    function goto(args) { // usage: goto [link]
        let opts = getopt.getopt(args ? args.split(' ') : [], this.optstring.short, this.optstring.long);

        let flags = opts.opts;
        let dest = opts.args.join(' ');

        // Grab the subpages separated by /
        let extra = dest.split('/');
        extra.shift();
        extra = extra.join('/');

        // Trim off the subpages
        let shortdest = dest.split('/', 1);

        let target = "_self";

        for (let option of flags) {
            switch(option[0]) {
                case "-n": case "--new":
                    target = "_blank";
                    break;
            }
        }

        if (shortdest == undefined) {
            throw "No arguments!\n";
        }

        if (!dests[shortdest]) {
            if (dest.match(URL_REGEX)) {
                window.open(dest, target);
                return;
            }
            else {
                throw `${dest} is not a valid destination!\n`;
            }
        }

        let url = dests[shortdest] + '/' + extra;
        if(url.match(URL_REGEX)) {
            window.open(url, target);
        }
        else {
            window.open('https://' + url, target);
        }
    }
}

const help = {
    desc:       
"Displays information about the possible commands to run\n\
    arguments:\n\
        <command>: display the help information for this command\n\
        (none): list all commands",
    usage:      "help [<command>]",
    flags: [],
    optstring: {
        short: "",
        long: []
    },
    args: [],
    /**
     * Displays help information when given an command argument
     * Lists all commands when given no argument 
     * @param {string} args 
     */
    func:
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
}

const history = {
    desc:
"Displays the current history of entered commands\n\
    No arguments or flags",
    usage: "history",
    flags: ["-s", "--save"],
    optstring: {
        short: "s",
        long: ["save="]
    },
    args: [],
    func:
    function history(args) {
        let opts = getopt.getopt(args ? args.split(' ') : [], this.optstring.short, this.optstring.long);
        let flags = opts.opts;

        for(let option of flags) {
            switch(option[0]) {
                case "-s": case "--save":
                    if (/(t(rue)?)|(y(es)?)/i.test(option[1])) {
                        updateOutput(`Local history set to save to local storage (Persistent history)\n`);
                        saveHistory = true;
                        browser.storage.local.set({saveHistory});
                    }
                    else {
                        updateOutput(`Local history set to not save to local storage (Volatile history)\n`);
                        saveHistory = false;
                        browser.storage.local.set({saveHistory});
                        let commandHistory = [];
                        browser.storage.local.set({commandHistory});
                    }
                    return;
            }
        }

        updateOutput(`Command History:\n`);
        for(var index in commandHistory) {
            updateOutput(`${index}: ${commandHistory[index]}\n`);
        }
        let fakeIndex = parseInt(index) + 1;
        updateOutput(`${fakeIndex}: ${promptContent}\n`);
    }
}

const importOpts = {
    desc:
"Imports options and links from a selected .json file\n\
    No arguments",
    usage:      "import",
    flags: [],
    optstring: {
        short: "",
        long: []
    },
    args: [],
    /**
     * Imports settings from a .json file into the current settings
     */
    func:
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
}

const link = {
    desc:       
"Links a name to a destination, used when running goto\n\
    flags:\n\
        -r | --remove <del>: remove <del> as a name to a destination\n\
        -dl | --display | --list: display the current destinations\n\
    arguments:\n\
        <name>: name to set\n\
        <dest>: destination to go to",
    usage:      "link [-d|-l|--display|--list] [-r|--remove <del>] [<name> <dest>]",
    flags: ["-d", "--display",  "-l", "--list", "-r", "--remove"],
    optstring: {
        short: "dlr:",
        long: ["display", "list", "remove="]
    },
    args: [],
    /**
     * Links a name to a dest
     * Given no parameters, displays all dests to the output
     * args is expected as <name> <dest>
     * @param {string} args
     */
    func:
    function link(args) { // usage: link [alias] [dest]
        let opts = getopt.getopt(args ? args.split(' ') : [], this.optstring.short, this.optstring.long);

        let flags = opts.opts;
        let toLink = opts.args.join(' ');
        
        let mode = "add";
        let display = false;
        let name = "";

        for (let option of flags) {
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
            case "remove":
                if (dests[name]) {
                    updateOutput(`Removed ${name} -> ${dests[name]} as a destination.\n`);
                    delete dests[name];
                }
                else {
                    updateOutput(`Destination ${name} doen't exist.\n`);
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
}

const list = {
    desc:       
"Lists the links that have been set\n\
    No arguments",
    usage:      "list",
    flags: [],
    optstring: {
        short: "",
        long: []
    },
    args: [],
    /**
     * Lists all dests to the output
     */
    func:
    function list() { // list all commands
        console.log("List activated");
        updateOutput(`Current links:\n`);
        for (let key in dests) {
            updateOutput(`${key} -> ${dests[key]}\n`);
        }
    }
}

const reset = {
    desc:
"Resets all options to default\n\
    flags:\n\
        -y|--yes: confirms to reset\n\
        -s|--save: saves changes to local storage\n\
        -d|--dests: resets destinations to empty\n\
        -a|--aliases: resets aliases to empty",
    usage:      "reset -y|--y [-a|--aliases][-d|--dests][--s|--save]",
    flags: ["-a", "--aliases", "-d", "--dests", "-s", "--save", "-y", "--yes"],
    optstring: {
        short: "adsy",
        long: ["aliases", "dests", "save", "yes"]
    },
    args: [],
    /**
     * Resets various elements and options to default values
     */
    func:
    function reset(args) {
        let opts = getopt.getopt(args ? args.split(' ') : [], this.optstring.short, this.optstring.long);
        let flags = opts.opts;

        let confirm = false;
        let save = false;
        let wipeAlias = false;
        let wipeDest = false;

        for (let option of flags) {
            switch(option[0]) {
                case "-a": case "--aliases":
                    wipeAlias = true;
                    break;
                case "-d": case "--dests":
                    wipeDest = true;
                    break;
                case "-s": case "--save":
                    save = true;
                    break;
                case "-y": case "--yes":
                    confirm = true;
                    break;
            }
        }
        if (confirm == false) {
            updateOutput(`Needs -y or --yes to confirm reset.\n`);
            return;
        }
        updateOutput(`Resetting options to default.\n`);
        setToDefaultOptions(wipeAlias, wipeDest);
        applyCurrentOptions();
        if (save == true) {
            updateOutput(`Saving defaults to local storage.\n`);
            saveCurrentOptions();
        }
    }
}

const resize = {
    desc:
"Resizes the output to the passed value\n\
    flags:\n\
        -t|--top <value>: sets top output height to <value>\n \
        -b|--bottom <value>: sets bottom output height to <value>\n\
        -d|--display: outputs the current height for both outputs",
    usage:      "resize [-b|--bottom <value>] [-d|--display] [-t|--top <value>]",
    flags: ["-b", "--bottom", "-d", "--display", "-t", "--top"],
    optstring: {
        short: "b:dt:",
        long: ["bottom=", "display", "top="]
    },
    args: [],
    // Resizes the output terminal to @size lines of text
    /**
     * Sets the number of lines in the output to the passed size
     * Displays number of lines in the output when passed nothing
     * @param {string} size 
     */
    func:
    function resizeOutput(args) {
        let opts = getopt.getopt(args ? args.split(' ') : [], this.optstring.short, this.optstring.long);

        let flags = opts.opts;

        for (let option of flags) {
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
}

const save = {
    desc:       
"Stores the passed option to local storage\n\
    arguments:\n\
        links: link to destination aliases\n\
        back: background color\n\
        text|fore: text / foreground color\n\
        colo|color: both color settings\n\
        output|size|height: output size setting\n\
        (none): if blank, saves all settings",
    usage:      "save [links] [back] [text] [fore] [colo] [color] [output] [size] [height]",
    flags: [],
    optstring: {
        short: "",
        long: []
    },
    args: ["links", "back", "text", "fore", "colo", "color", "output", "size", "height"],
    /**
     * Saves options to local storage.
     * Args defines what is saved to local storage
     * @param {string} args 
     */
    func:
    function save(args) {
        let toSave = args ? args.split(' ') : [undefined];
        for (let output of toSave) {
            switch(output) {
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
    }
}

const type = { 
    desc:       
"Displays what sort of thing a passed name is\n\
    arguments:\n\
        <name>: name to process",
    usage:      "type <name>",
    flags: [],
    optstring: {
        short: "",
        long: []
    },
    args: [],
    /**
     * Description for type
     * 
     * @param {string} args 
     */
    func:
    function type(args) {
        if (!args) {
            return;
        }
        if(process[args]) {
            updateOutput(`${args} is a command.\n`);
        }
        else if (alts[args]) {
            updateOutput(`${args} is a an alternative name for command ${alts[args]}.\n`);
        }
        else if (aliases[args]) {
            updateOutput(`${args} is an alias for ${aliases[args]}.\n`);
        }
        else if (dests[args]) {
            updateOutput(`${args} is a destination name for ${dests[args]}.\n`);
        }
        else {
            updateOutput(`${args} is not anything right now.\n`);
        }
    }
}
/**
 * Jump table for running commands based on strings
 */
var process = {
    "about": about,
    "alias": alias,
    "clear": clear,
    "colo": colo,
    "echo": echo,
    "export": exportOpts,
    "goto": goto,
    "help": help,
    "history": history,
    "import": importOpts,
    "link": link,
    "list": list,
    "reset": reset,
    "resize": resize,
    "save": save,
    "type": type
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
    "add": "link",
    "info": "about"
};
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
    browser.storage.local.set({bgColor});
    browser.storage.local.set({fgColor});
    browser.storage.local.set({outputHeight});
    browser.storage.local.set({btmHeight});
    browser.storage.local.set({aliases});
    browser.storage.local.set({dests});
}

/**
 * Sets the current options back to defaults
 */
function setToDefaultOptions(wipeAlias, wipeDest) {
    for (let option in defaultOptions) {
        setDefault(option);
    }

    if (wipeAlias == true) {
        aliases = {};
    }
    if (wipeDest == true) {
        dests = {};
    }

    function setDefault(name) {
        window[name] = defaultOptions[name];
        console.log(`${name} set back to ${defaultOptions[name]}\n`);
    }
}

/**
 * Internal function for outputting current desc and usage to console in a markdown style for easy wiki
 * maintanence
 */
function helpMarkdown() {
    let output = "";
    output += `This information can be generated by running \`helpMarkdown()\` in the Firefox console. It outputs the formatted output in Markdown to the console for copying and pasting.\n\n`;
    for (let command in process) {
        output += `## ${command}\n`;
        output += `\`${process[command].desc}\`\n\n`;
        output += `\`${process[command].usage}\`\n\n`;
    }
    console.log(output);
}
    

