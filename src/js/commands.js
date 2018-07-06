// Copyright (c) 2018 Nicholas Gilbert

// All commands that can be run from the tab page
// url regex found from: https://github.com/cadeyrn/newtaboverride/src/js/core/utils.js
const URL_REGEX = /^https?:\/\//i;

// Goes to @param dest
function goto(dest) { // usage: goto [link]
    if (dest == undefined) {
        throw "No arguments!\n";
    }
    console.log(`Goto activated, dest = ${dest}`);
    let url = dest.match(URL_REGEX);
    if (url != undefined) { // if goto was a url
        window.open(rest, "_self");
    }
    console.log(url);

    url = dests[dest];
    if (url != undefined) { // if there was a link
        window.open(url, "_self");
    }

    return true;
}

function list() { // list all commands
    console.log("List activated");
    updateOutput(`Current links:\n`);
    for (let key in dests) {
        updateOutput(`${key} -> ${dests[key]}\n`);
    }
    return true;
}

// Link an alias to a destination.
// toLink is expected to be two words
function link(toLink) { // usage: link [alias] [dest]
    let toLinkSplit = toLink.split(' ', 2);
    if (toLinkSplit.length != 2) {
        throw "Too few arguments!\n";
    }
    let alias = toLinkSplit[0];
    let dest = toLinkSplit[1];
    dests[alias] = dest;
    updateOutput(`Added link from ${alias} to ${dest}.\n`)
}

function save() {
    browser.storage.local.set({dests});
    updateOutput(`Saved links.\n`);
}

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

function help(args) {
    switch(args) {
        case undefined: // no arguments
            for (let key in process) {
                updateOutput(`${key}\n`)
            }
            for (let key in aliases) {
                updateOutput(`${key} (${aliases[key]})\n`)
            }
            break;
        default:
            if (process[args]) {
                updateOutput(`Help for ${args}:\n`);
                updateOutput(`${process[args].desc}\n`);
                updateOutput(`usage: ${process[args].usage}\n`);
            }
            else if(process[aliases[args]]) {
                updateOutput(`Help for ${args} (alias for ${aliases[args]}):\n`);
                updateOutput(`${process[aliases[args]].desc}\n`);
                updateOutput(`usage: ${process[aliases[args]].usage}\n`);
            }
            else {
                throw "Invalid argument.\n";
            }
            break;

    }
}

// Resizes the output terminal to @size lines of text
function resizeOutput(size) {
    if (size == undefined || !isNumber(size) || size < 0) { // Yell if argument is not a number or isn't there
        throw "Bad argument!\n";
    }
    output.style.setProperty('--output-height', (size * 1.1) + 'em'); 
    let outputHeight = size;
    browser.storage.local.set({outputHeight});
    updateOutput(`Resized output to ${size} lines of text.\n`);

}

// Sets a color element to a specified value
function setColor(args) {
    let argsSplit = args.split(' ', 2);
    if (argsSplit.length != 2) {
        throw "Too few arguments!\n";
    }
    let target = argsSplit[0];
    let color = argsSplit[1];
    let name = '';
    switch(target){
        case "back":
            name = '--bg-color';
            let bgColor = color;
            browser.storage.local.set({bgColor});
            break;
        case "text":
            name = '--fg-color';
            let fgColor = color;
            browser.storage.local.set({fgColor});
            break;
        default:
            throw "Bad element name!\n";
            break;
    }
    document.documentElement.style.setProperty(name, color);
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
var process = {
    "clear": {
        func:       clear,
        desc:       
"Clears the console, or whatever is passed to it\n\
    arguments:\n\
        history: clears command history\n\
        links: clears set links for the session\n\
        (none): clears command prompt",     
        usage:      "clear [history|links]"
    },
    "goto": {
        func:       goto,
        desc:       
"Opens a specified link or url\n\
    arguments:\n\
        <name>: the link to navigate to",
        usage:      "goto <name>"
    },
    "help": {
        func:       help,
        desc:       
"Displays information about the possible commands to run\n\
    arguments:\n\
        <command>: display the help information for this command\n\
        (none): list all commands",
        usage:      "help [<command>]"
    },
    "link": {
        func:       link,
        desc:       
"Links a name to a destination, used when running goto\n\
    arguments:\n\
        <alias>: name to set\n\
        <dest>: destination to go to",
        usage:      "link <alias> <dest>"
    },
    "list": {
        func:       list,
        desc:       
"Lists the links that have been set\n\
    No arguments",
        usage:      "list"
    },
    "resize": {
        func:       resizeOutput,
        desc:
"Resizes the output to the passed value\n\
    arguments:\n\
        <value>: number of lines in the output",
        usage:      "resize <value>"
    },
    "save": {
        func:       save,
        desc:       
"Stores the current links to local storage\n\
    No arguments",
        usage:      "save"
    },
    "colo": {
        func:       setColor,
        desc:
"Sets the color of the given element\n\
    arguments:\n\
        back: the background of every element\n\
        text: the text of every element\n\
        color: the color to set to",
        usage:      "colo <back|text> <color>"
    },
};

var aliases = {
    "ls": "list",
    "go": "goto",
    ":w": "save",
    "man": "help"
};