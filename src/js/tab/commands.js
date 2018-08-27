// Copyright (c) 2018 Nicholas Gilbert
// Licensed under the Mozilla Public License Version 2.0
// See LICENSE in the root of the repository for details

// All commands that can be run from the tab page

const about = { 
    desc:       
"Displays information about shTab",
    usage:      "about",
    flags: [],
    optstring: {},
    args: [],
    argscol: {},
    /**
     * Displays information about the extension
     * 
     * @param {string} args 
     */
    func:
    function about (args) {
        let manifest = browser.runtime.getManifest();
        let browserInfo = browser.runtime.getBrowserInfo();
        browserInfo.then(gotBrowserInfo);

        function gotBrowserInfo(info) {
            updateOutput(`Browser info: ${info.vendor} ${info.name} v. ${info.version} (${info.buildID}).\n`);
            updateOutput(`${manifest.name} v. ${manifest.version}\n`);
            updateOutput(`${manifest.description}\n\n`);
            updateOutput(`Developed by ${manifest.developer.name} (${manifest.developer.url})\n`);
        }
    }
}

const alias = {
    desc:
"Aliases a shorthand keyword to map to another command\n\
    flags:\n\
        -r|--remove <del>: remove <del> as an alias\n\
        -dl|--display|--list: display the current alias\n\
        -n|--rename <name>=<newname>: assigns alias <name> with <newname>\n\
    arguments:\n\
        <name>: the name of the alias\n\
        <string>: string you want to replace when <name> is entered\n\
        (none): displays the current aliases\n\
    notes:\n\
        No flags can be used when adding an alias due to a limitation in a library function",
    usage:      "alias [-d|-l|--display|--list] [-n|--rename <name>=<newname>] [-r|--remove <del>]\n\
       alias <name>=\"<string>\"",
    flags: ["-d", "--display", "-l", "--list", "-n", "--rename", "-r", "--remove"],
    optstring: {
        "-d, --display": "",
        "-l, --list": "",
        "-r, --remove": "<del>",
        "-n, --rename": "<val>"
    },
    args: [],
    argscol: { "aliases": ["-r", "--remove", "-n", "--rename"] },
    /**
     * Sets an alias from a word to command(s)
     * If empty, displays the aliases
     * expected form of args: WORD="some words"
     * @param {string} args 
     */
    func:
    function alias(args) {
        let opts = parseOpts(args, this.optstring);
        
        let aliasSet = args ? args.match(/^[a-z0-9\-\_]+=".*"/i) : null;

        let flags = opts.options;
        let toAlias = aliasSet ? aliasSet[0] : null;

        let mode = "add";
        let display = false;
        let name = "";
        let performed = false;
        let op = false;

        if (aliasSet == null) {
            for (let option in flags) {
                switch(option) {
                    case "l": case "list":
                    case "d": case "display":
                        display = true;
                        mode = "display";
                        break;
                    case "r": case "remove":
                        mode = "remove";
                        name = flags[option];
                        op = true;
                        break;
                    case "n": case "rename":
                        mode = "rename";
                        name = flags[option];
                        op = true;
                        break;
                    case undefined:
                        break;
                }
                if (op == true) {
                    break;
                }
            }
        }

        switch(mode) {
            case "add":
                if (toAlias != "" || toAlias != null) {
                    if (/^[a-z0-9\-\_]+=".*"/i.test(toAlias) == false) { // regex for WORD="WORD" form
                        throw "Not right form for adding an alias!\nCorrect form: alias name=\"<string>\"";
                    }
                    let aliasSplit = toAlias.split('\"', 2);
                    aliasSplit[0] = aliasSplit[0].slice(0, -1);
                    aliases[aliasSplit[0]] = aliasSplit[1];
                    browser.storage.local.set({aliases});
                    updateOutput(`Added an alias from ${aliasSplit[0]} to ${aliasSplit[1]}.\n`);
                    performed = true;
                }
                break;
            case "remove":
                if (aliases[name]) {
                    updateOutput(`Removed ${name} -> ${aliases[name]} as an alias. Still saved in local storage.\nUse 'save aliases' or 'save' to store\n`);
                    delete aliases[name];
                }
                else {
                    throw `Alias ${name} doen't exist.\n`;
                }
                performed = true;
                break;
            case "rename":
                let split = name.split('=', 2);
                if (split.length != 2) {
                    throw "Name needs to be in the form <oldname>=<newname>.\n";
                }
                let oldName = split[0];
                let newName = split[1];
                if (aliases[oldName]) {
                    aliases[newName] = aliases[oldName];
                    delete aliases[oldName];
                    browser.storage.local.set({aliases});
                    updateOutput(`Changed ${oldName} to ${newName}.\n`);
                }
                else {
                    throw `Alias ${name} doesn't exist.\n`;
                }
                performed = true;
                break;
        }
        if (display) {
            updateOutput(`Current aliases:\n`);
            let keys = Object.keys(aliases);
            keys.sort(function(a,b){
                return a.localeCompare(b, 'en', {'sensitivity': 'base'});
            });
            for (let key of keys) {
                updateOutput(`${key} -> ${aliases[key]}\n`);
            }
        }
        if (Object.keys(flags).length === 0 && performed == false) {
            throw `Usage: ${this.usage}\n`;
        }
    }
}

const bookim = { 
    desc:       
"Imports bookmarks as destinations.\n\
    flags:\n\
        -a|--all: Import all bookmarks as link / destinations \n\
        -n|--name <name>: Import a single bookmark by name\n\
        -s|--short <num>: Imports bookmarks by <num> word only instead of full string",
    usage:      "bookim [-a|--all][-s|--short <num>][-n|--name <name>]",
    flags: ["-a", "--all", "-n", "--name", "-s", "--short"],
    optstring: {
        "-a, --all": "",
        "-n, --name": "<name>",
        "-s, --short": "<short>"
    },
    args: [],
    argscol: {},
    /**
     * Description for bookim
     * 
     * @param {string} args 
     */
    func:
    function bookim(args) {
        let opts = parseOpts(args, this.optstring);

        let flags = opts.options;

        let everything = false;
        let short = false;
        let length = 1;
        let names = [];

        for (let option in flags) {
            switch(option) {
                case "a": case "all":
                    everything = true;
                    break;
                case "n": case "name":
                    names.push(flags[option]);
                    break;
                case "s": case "short":
                    short = true;
                    length = parseInt(flags[option]);
                    break;
            }
        }
        if (everything == true) {
            let importTree = browser.bookmarks.getTree();
            importTree.then(onAccept, onReject);

            /**
             * On accept, process the bookmarks
             * @param {bookmarkNode} bookmarks 
             */
            function onAccept(bookmarks) {
                importNode(bookmarks[0]);
            }

            /**
             * Try and add the current bookmark node as a link
             * @param {bookmarkNode} bookNode 
             */
            function importNode(bookNode) {
                if(bookNode.url && bookNode.title) { // If the node is a url, add a link based on name and url
                    let name = "";
                    if (short == true) { // If we're shortening, grab only the first word
                        name = bookNode.title.split(' ', length).join('_');
                    }
                    else { // Otherwise, replace spaces with underscores
                        name = bookNode.title.replace(/ /g, "_");
                    }
                    name = name.replace(/\//g, "_");
                    link.func(`${name} ${bookNode.url}`);
                }
                else if (bookNode.children && bookNode.title != "Bookmarks Menu") { // otherwise, if it's a folder with children, traverse down
                    for (let child of bookNode.children) {
                        importNode(child);
                    }
                }
            }

            /**
             * Throw an error message when the tree rejects
             * @param {string} error 
             */
            function onReject(error) {
                throw `${error}\n`;
            }
        }
        else if (Object.keys(flags).length !== 0) {
            let importMark = browser.bookmarks.search({});
            importMark.then(onAccept, onReject);

            /**
             * Search the names for a matching bookmark
             */
            function onAccept(bookmark) {
                for (let name of names) {
                    let split = name.split('=');
                    let find = split[0];
                    let actual = split[1] || split[0];
                    for (let mark of bookmark) {
                        if (find == mark.title && mark.title) {
                            link.func(`${actual} ${mark.url}`);
                        }
                    }
                }
            }
            
            /**
             * Throw an error at the user
             */
            function onReject(error) {
                throw `${error}\n`;
            }
        }
        if (Object.keys(flags).length === 0) {
            throw `Usage: ${this.usage}.\n`;
        }
    }
}

const clear = {
    desc:       
"Clears the console, or whatever is passed to it\n\
    arguments:\n\
        aliases: clears aliases for the session\n\
        history: clears command history\n\
        links|dests: clears set links for the session\n\
        (none): clears command prompt",     
    usage:      "clear [aliases|history|links|dests]",
    flags: [],
    optstring: {},
    args:       ["aliases", "dests", "history", "links"],
    argscol: {},
    /**
     * Clears a variety of things based on argument
     * No argument clears output
     * @param {string} args 
     */
    func:
    function clear(args) {
        switch(args) {
            case "aliases":
                aliases = {};
                updateOutput(`Cleared aliases.\n`);
                break;
            case "history":
                commandHistory = [];
                updateOutput(`Cleared command history.\n`);
                break;
            case "links": case "dests":
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
        "-b, --background": "<color>",
        "-d, --display": "",
        "-f, --foreground": "<color>"
    },
    args: [],
    argscol: {},
    // Sets a color element to a specified value
    /**
     * Sets the color for a passed element to either a CSS color value or hex value
     * args expected as <elem> <color>
     * @param {string} args 
     */
    func:
    function colo(args) {
        let opts = parseOpts(args, this.optstring);

        let flags = opts.options;

        for (let option in flags) {
            switch(option) {
                case "b": case "background": {
                    let color = flags[option];
                    if (!isColor(color)) { // Test to see if the color is a valid named color or is in 3 or 6 digit hex form
                        throw "Invalid color!\n";
                    }
                    bgColor = color;
                    browser.storage.local.set({bgColor});
                    document.documentElement.style.setProperty('--bg-color', bgColor);
                    updateOutput(`Set background color to ${color}\n`);
                    break;
                }
                case "d": case "display":
                    updateOutput(`Current background color: ${bgColor}\n`);
                    updateOutput(`Current foreground / text color: ${fgColor}\n`);
                    break;
                case "f": case "foreground":{
                    let color = flags[option];
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
        if (Object.keys(flags).length === 0) {
            throw `Usage: ${this.usage}\n`;
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
    optstring: {},
    args: [],
    argscol: {},
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
"Exports current options and links to a .json file for later import",
    usage:      "export",
    flags: [],
    optstring: {},
    args: [],
    argscol: {},
    /**
     * Exports current options to a .json file
     * args currently aren't used
     * @param {string} args 
     */
    func:
    function exportOpts(args) {
        let file = new File([JSON.stringify({
            bgColor,
            fgColor,
            outputHeight, 
            btmHeight,
            saveHistory,
            ps1fill,
            dests,
            aliases
        }, null, 4)], "output.json", {type: "text/plain;charset=utf-8"});
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

const getopt = { 
    desc:       
"Gets the current set options",
    usage:      "getopt",
    flags: [],
    opstring: {},
    args: [],
    argscol: {},
    /**
     * Description for getopt
     * 
     * @param {string} args 
     */
    func:
    function getopt(args) {
        for (let val in defaultOptions) {
            if (val == "commandHistory"){
                updateOutput(`commandHistory: ${window[val].length} entries.\n`);
            }
            else if (val == "aliases" || val == "dests") {
                let output = `${val}:\n`;
                for (let key in window[val]) {
                    output += `\t${key} -> ${window[val][key]}\n`;
                }
                updateOutput(`${output}\n`);
            }
            else {
                updateOutput(`${val} = ${window[val]}\n`);
            }
        }
    }
}
// url regex found from: https://github.com/cadeyrn/newtaboverride/blob/master/src/js/core/utils.js
const URL_REGEX = /^https?:\/\//i;

const goto = {
    desc:       
"Opens a specified link or url\n\
    flags:\n\
        -n|--new: opens link in new tab / window (dependant on browser settings)\n\
        -h: prepends destination with https:// if it doesn't already contain https://\n\
    arguments:\n\
        <name>: the link to navigate to",
    usage:      "goto [-h][-n|--new] <name>",
    flags: ["-h", "-n", "--new"],
    optstring: {
        "-n, --new": "",
        "-h": ""
    },
    args: [],
    argscol: { "dests": [] },
    /**
     * Opens dest through set links or as a direct url
     * @param {string} args
     */
    func:       
    function goto(args) { // usage: goto [link]
        let opts = parseOpts(args, this.optstring);

        let flags = opts.options;
        let dest = opts.argv.join(' ');

        // Grab the subpages separated by /
        let extra = dest.split('/');
        extra.shift();
        extra = extra.join('/');

        // Trim off the subpages
        let shortdest = dest.split('/', 1);

        let target = "_self";
        let prepend = false;

        for (let option in flags) {
            switch(option) {
                case "h":
                    prepend = true;
                    break;
                case "n": case "new":
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
            else if (prepend == true) {
                window.open('https://' + dest, target);
                return;
            }
            else if (dest){
                throw `${dest} is not a valid destination!\n`;
            }
            else {
                throw `Usage: ${this.usage}\n`;
            }
        }

        let url = dests[shortdest] + '/' + extra;
        if(url.match(URL_REGEX) || prepend == false) {
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
    optstring: {},
    args: [],
    argscol: { "commands": [] },
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
    flags:\n\
        -f|--filter <word>: returns history that contains <word>\
        -s|--save (yes|true|no): Toggles saving of command history between sessions",
    usage: "history [-f|--filter <word>][-s|--save (yes|true|no)]",
    flags: ["-f", "--filter", "-s", "--save"],
    optstring: {
        "-f, --filter": "<word>",
        "-s, --save": "<truefalse>"
    },
    args: [],
    argscol: {},
    func:
    function history(args) {
        let opts = parseOpts(args, this.optstring);
        let flags = opts.options;

        let filter = "";
        for(let option in flags) {
            switch(option) {
                case "f": case "filter":
                    filter = flags[option];
                    break;
                case "s": case "save":
                    if (/(t(rue)?)|(y(es)?)/i.test(flags[option])) {
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

        if (filter != "") {
            updateOutput(`Commands that matched ${filter}:\n`);
        }
        else {
            updateOutput(`Command History:\n`);
        }
        for(var index in commandHistory) {
            if (filter == "" || commandHistory[index].includes(filter)) {
                updateOutput(`${index}: ${commandHistory[index]}\n`);
            }
        }
        let fakeIndex = parseInt(index) + 1;
        if (filter == "" || promptContent.includes(filter)) {
            updateOutput(`${fakeIndex}: ${promptContent}\n`);
        }
    }
}

const importOpts = {
    desc:
"Imports options and links from a selected .json file",
    usage:      "import",
    flags: [],
    optstring: {},
    args: [],
    argscol: {},
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

            bgColor = grab("bgColor");
            fgColor = grab("fgColor");
            outputHeight = grab("outputHeight");
            btmHeight = grab("btmHeight");
            saveHistory = grab("saveHistory");
            ps1fill = grab("ps1fill");

            dests = Object.assign({}, dests, importedOptions.dests);
            aliases = Object.assign({}, aliases, importedOptions.aliases);

            if (importedOptions.bgColor) {
                updateOutput(`Updated background color to ${importedOptions.bgColor}\n`);
            }
            if (importedOptions.fgColor) {
                updateOutput(`Updated foreground color to ${importedOptions.fgColor}\n`);
            }
            if (importedOptions.outputHeight) {
                updateOutput(`Updated output height to ${importedOptions.outputHeight}\n`);
            }
            if (importedOptions.btmHeight) {
                updateOutput(`Updated bottom height to ${importedOptions.btmHeight}\n`);
            }
            if (importedOptions.savedHistory) {
                updateOutput(`Updated saved history setting to ${importedOptions.savedHistory}\n`);
            }
            if (importedOptions.ps1fill) {
                updateOutput(`Updated ps1 prompt setting to ${importedOptions.ps1fill}\n`);
            }

            if (importedOptions.dests) {
                updateOutput(`Added the following links:\n`);
                for (let key in importedOptions.dests) {
                    updateOutput(`    ${key} -> ${dests[key]}\n`);
                }
            }

            if (importedOptions.aliases) {
                updateOutput(`Added the following aliases:\n`);
                for (let key in importedOptions.aliases) {
                    updateOutput(`    ${key} -> ${aliases[key]}\n`);
                }
            }

            applyCurrentOptions();
            /**
             * Returns either the loaded field or the default value for that field
             * @param {string} field Field to retrieve
             * @returns {string} Default or loaded value
             */
            function grab(field) {
                return importedOptions[field] ? importedOptions[field] : window[field];
            }
        }
    }
}

const link = {
    desc:       
"Links a name to a destination, used when running goto\n\
    flags:\n\
        -c|--count: return the number of destinations\n\
        -r|--remove <del>: remove <del> as a name to a destination\n\
        -dl|--display|--list: display the current destinations\n\
        -h: Prepend link destination with https://\n\
        -n|--rename <name>=<newname>: assigns link <name> with <newname>\n\
    arguments:\n\
        <name>: name to set\n\
        <dest>: destination to go to",
    usage:      "link [-c|--count][-h][-d|-l|--display|--list] [-n|--rename <name>=<newname>] [-r|--remove <del>] [<name> <dest>]",
    flags: ["-c", "--count", "-d", "--display", "-h", "-l", "--list", "-n", "--rename", "-r", "--remove"],
    optstring: {
        "-c, --count": "",
        "-d, --display": "",
        "-h": "",
        "-l, --list": "",
        "-r, --remove": "<del>",
        "-n, --rename": "<rename>"
    },
    args: [],
    argscol: { "dests": ["-r", "--remove", "-n", "--rename"] },
    /**
     * Links a name to a dest
     * Given no parameters, displays all dests to the output
     * args is expected as <name> <dest>
     * @param {string} args
     */
    func:
    function link(args) { // usage: link [alias] [dest]
        let opts = parseOpts(args, this.optstring);

        let flags = opts.options;
        let toLink = opts.argv.join(' ');
        
        let mode = "add";
        let display = false;
        let count = false;
        let prepend = false;
        let name = "";
        let performed = false;

        for (let option in flags) {
            switch(option) {
                case "c": case "display":
                    count = true;
                    break;
                case "l": case "list":
                case "d": case "display":
                    display = true;
                    break;
                case "h":
                    prepend = true;
                    break;
                case "r": case "remove":
                    mode = "remove";
                    name = flags[option];
                    break;
                case "n": case "rename":
                    mode = "rename";
                    name = flags[option];
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
                    if (prepend == true) {
                        dest = "https://" + dest;
                    }
                    dests[alias] = dest;
                    browser.storage.local.set({dests});
                    updateOutput(`Added link from ${alias} to ${dest}.\n`)
                    performed = true;
                }
                break;
            case "remove":
                if (dests[name]) {
                    updateOutput(`Removed ${name} -> ${dests[name]} as a destination. Still saved in local storage.\nUse 'save links' or 'save' to store\n`);
                    delete dests[name];
                }
                else {
                    throw `Destination ${name} doesn't exist.\n`;
                }
                performed = true;
                break;
            case "rename":
                let split = name.split('=', 2);
                if (split.length != 2) {
                    throw "Name needs to be in the form <oldname>=<newname>.\n";
                }
                let oldName = split[0];
                let newName = split[1];
                if (dests[oldName]) {
                    dests[newName] = dests[oldName];
                    delete dests[oldName];
                    browser.storage.local.set({dests});
                    updateOutput(`Changed ${oldName} to ${newName}.\n`);
                }
                else {
                    throw `Destination ${name} doesn't exist.\n`;
                }
                performed = true;
                break;
        }
        if (display) {
            updateOutput(`Current links:\n`);
            let keys = Object.keys(dests);
            // Function for case-insensitive sort found at https://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-in-javascript
            keys.sort(function(a,b){
                return a.localeCompare(b, 'en', {'sensitivity': 'base'});
            });
            for (let key of keys) {
                updateOutput(`${key} -> ${dests[key]}\n`);
            }
        }
        if (count) {
            updateOutput(`${Object.keys(dests).length} links.\n`);
        }
        if (Object.keys(flags).length === 0 && performed == false) {
            throw `Usage: ${this.usage}\n`;
        }
    }
}

const ps1 = { 
    desc:       
"Customizes the ps1\n\
    flags:\n\
        -r|--reset: resets the ps1 to default \n\
        -s|--set <ps1>: Sets the ps1 to <ps1>\n\
    ",
    usage:      "ps1 [-r|--reset][-s|--set <ps1>]",
    flags: ["-r", "--reset", "-s", "--set"],
    optstring: {
        "-r, --reset": "",
        "-s, --set": "<ps1>"
    },
    args: [],
    argscol: {},
    /**
     * Description for ps1
     * 
     * @param {string} args 
     */
    func:
    function ps1(args) {
        let opts = parseOpts(args, this.optstring);

        let flags = opts.options;
    
        for (let option in flags) {
            switch(option) {
                case "r": case "reset": {
                    ps1fill = defaultOptions.ps1fill;
                    browser.storage.local.set({ps1fill});
                    break;
                }
                case "s": case "set": {
                    let string = flags[option] + " " + opts.argv.join(" ");
                    ps1fill = string;
                    browser.storage.local.set({ps1fill});
                    break;
                }
            }
        }
        if (Object.keys(flags).length === 0) {
            throw `Usage: ${this.usage}\n`;
        }
        else {
            applyCurrentOptions();
        }
    }
}

const reset = {
    desc:
"Resets all options to default\n\
    flags:\n\
        -y|--yes: confirms to reset\n\
        -s|--save: saves changes to local storage",
    usage:      "reset -y|--y [--s|--save]",
    flags: ["-s", "--save", "-y", "--yes"],
    optstring: {
        "-s, --save": "",
        "y, --yes": ""
    },
    args: [],
    argscol: {},
    /**
     * Resets various elements and options to default values
     */
    func:
    function reset(args) {
        let opts = getOpts(args ? args.split(' ') : [], this.optstring, {noAliasPropagation: true});

        let flags = opts.options;

        let confirm = false;
        let save = false;

        for (let option in flags) {
            switch(option) {
                case "s": case "save":
                    save = true;
                    break;
                case "y": case "yes":
                    confirm = true;
                    break;
            }
        }
        if (confirm == false) {
            throw `Needs -y or --yes to confirm reset.\n`;
        }
        updateOutput(`Resetting options to default.\n`);
        setToDefaultOptions();
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
        -d|--display: outputs the current height for both outputs\n\
        -s|--shift (up|down) <value>: Shifts <dir> prompt <value> lines\n\
        -c|--center: puts prompt in the center of the window",
    usage:      "resize [-b|--bottom <value>] [-d|--display] [-t|--top <value>] [-s|--shift (up|down) <value>]",
    flags: ["-b", "--bottom", "-c", "--center", "-d", "--display", "-s", "--shift", "-t", "--top"],
    optstring: {
        "-b, --bottom": "<value>",
        "-c, --center": "",
        "-d, --display": "",
        "-t, --top": "<value>",
        "-s, --shift": "<dir> <value>"
    },
    args: [],
    argscol: {},
    // Resizes the output terminal to @size lines of text
    /**
     * Sets the number of lines in the output to the passed size
     * Displays number of lines in the output when passed nothing
     * @param {string} size 
     */
    func:
    function resizeOutput(args) {
        let opts = parseOpts(args, this.optstring);

        let flags = opts.options;

        for (let option in flags) {
            switch(option) {
                case "b": case "bottom": {
                    let size = parseInt(flags[option]);
                    if (size + outputHeight > totalLines || size <= 0) {
                        throw `Can't set bottom height to ${size}, outside bounds\n`;
                    }
                    btmOut.style.setProperty('--btm-height', (size * 1.1) + 'em'); 
                    btmHeight = size;
                    browser.storage.local.set({btmHeight});
                    updateOutput(`Resized bottom output to ${size} lines of text.\n`);
                    break;
                }
                case "c": case "center": {
                    outputHeight = defaultOptions.outputHeight = Math.floor(window.innerHeight / (13.2) / 2.25);
                    btmHeight = defaultOptions.btmHeight = Math.floor(window.innerHeight / (13.2) / 2.25);
                    totalLines = defaultOptions.outputHeight + defaultOptions.btmHeight;
                    output.style.setProperty('--output-height', (outputHeight * 1.1) + 'em'); 
                    browser.storage.local.set({outputHeight});
                    btmOut.style.setProperty('--btm-height', (btmHeight * 1.1) + 'em'); 
                    browser.storage.local.set({btmHeight});
                    updateOutput(`Centered prompt!\n`);
                    break;
                }
                case "d": case "display":
                    updateOutput(`Current output height: ${outputHeight} lines.\n`);
                    updateOutput(`Current bottom output height: ${btmHeight} lines.\n`);
                    updateOutput(`Current total lines available: ${totalLines} lines.\n`);
                    break;
                case "t": case "top":{
                    let size = parseInt(flags[option]);
                    if (size + btmHeight > totalLines || size <= 0) {
                        throw `Can't set top height to ${size}, outside bounds\n`;
                    }
                    output.style.setProperty('--output-height', (size * 1.1) + 'em'); 
                    outputHeight = size;
                    browser.storage.local.set({outputHeight});
                    updateOutput(`Resized output to ${size} lines of text.\n`);
                    break;
                }
                case "s": case "shift":{
                    let dir = flags[option][0];
                    let diff = parseInt(flags[option][1]);
                    let oldTop = outputHeight;
                    let oldBtm = btmHeight;
                    if (dir == "down") {
                        outputHeight += diff;
                        btmHeight -= diff;
                    }
                    else {
                        outputHeight -= diff;
                        btmHeight += diff;
                    }
                    if (outputHeight + btmHeight > totalLines || outputHeight <= 0 || btmHeight <= 0) {
                        outputHeight = oldTop;
                        btmHeight = oldBtm;
                        throw `Bounds reached! Couldn't shift ${dir} by ${diff} lines.`;
                    }
                    else {
                        updateOutput(`Shifted prompt ${dir} by ${diff} lines.\n`);
                    }
                    output.style.setProperty('--output-height', (outputHeight * 1.1) + 'em'); 
                    browser.storage.local.set({outputHeight});
                    btmOut.style.setProperty('--btm-height', (btmHeight * 1.1) + 'em'); 
                    browser.storage.local.set({btmHeight});
                    break;
                }
            }
        }
        if (Object.keys(flags).length === 0) {
            throw `Usage: ${this.usage}\n`;
        }
    }
}

const save = {
    desc:       
"Stores the passed option to local storage\n\
    arguments:\n\
        aliases: aliases\n\
        links: link to destination aliases\n\
        back: background color\n\
        text|fore: text / foreground color\n\
        colo|color: both color settings\n\
        output|size|height: output size setting\n\
        (none): if blank, saves all settings",
    usage:      "save [aliases] [links] [back] [text] [fore] [colo] [color] [output] [size] [height]",
    flags: [],
    optstring: {},
    args: ["aliases", "links", "back", "text", "fore", "colo", "color", "output", "size", "height"],
    argscol: {},
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
                case "aliases":
                    browser.storage.local.set({aliases});
                    updateOutput(`Saved aliases to local storage.\n`);
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

const setopt = { 
    desc:       
"Sets option to specificed value\n\
    flags:\n\
        -a|--apply: Apply the option to elements on the page\n\
    arguments:\n\
        <option>: option to set\n\
        <value>: value to set to",
    usage:      "setopt [-a|--apply] <option> <value>",
    flags: ["-a", "--apply"],
    optstring: {
        "-a, --apply": ""
    },
    args: [],
    argscol: { "options": [] },
    /**
     * Description for setopt
     * 
     * @param {string} args 
     */
    func:
    function setopt(args) {
        let opts = parseOpts(args, this.optstring);

        let flags = opts.options;
        let optionArg = opts.argv;
        let apply = false;

        for (let option in flags) {
            switch(option) {
                case "-a": case "--apply":
                    apply = true;
                    break;
            }
        }

        let optionToSet = optionArg[0];
        let valueToSet = optionArg[1];
        if(window[optionToSet] != undefined) {
            window[optionToSet] = valueToSet;
            updateOutput(`Set global option ${optionToSet} to ${valueToSet}\n`);
            if(apply == true) {
                applyCurrentOptions();
            }
        }
    }
}

const splash = { 
    desc:       
"Displays an information splash",
    usage:      "splash",
    flags: [],
    opstring: {},
    args: [],
    argscol: {},
    /**
     * Description for splash
     * 
     * @param {string} args 
     */
    func:
    function splash(args) {
        updateOutput(`Thank you for installing shTab!\n`);
        updateOutput(`List all the commands by typing \`help\`\n`);
        updateOutput(`See help information for an individual command by typing \`help <command>\`\n`);
        updateOutput(`Found a bug? Enter \`new-issue\` to add it to the issue tracker in the repository!\n\n\n`);
        about.func();
    }
}

const storage = { 
    desc:       
"Local storage statistics\n\
    flags:\n\
        -d|--diff: Shows the difference between the contents of local storage and current settings\n\
        -s|--show: Displays the contents of local storage \n\
        -l|--load: Load the contents of local storage to overwrite session",
    usage:      "storage [-s|--show][-d|--diff][-l|--load]",
    flags: ["-s", "--show", "-d", "--diff", "-l", "--load"],
    optstring: {
        "-s, --show": "",
        "-d, --diff": "",
        "-l, --load": ""
    },
    args: [],
    argscol: {},
    /**
     * Description for storage
     * 
     * @param {string} args 
     */
    func:
    function storage(args) {
        let opts = parseOpts(args, this.optstring);

        let flags = opts.options;

        let show = false;
        let diff = false;

        for (let option in flags) {
            switch(option) {
                case "s": case "show":
                    show = true; 
                    break;
                case "d": case "diff":
                    diff = true;
                    break;
                case "l": case "load":
                    optionsLoader.load();
                    updateOutput(`Loaded options from local storage to session storage.\n`);
                    return;
            }
        }
        if (Object.keys(flags).length === 0) {
            throw `Usage: ${this.usage}\n`;
        }

        let getStorage = browser.storage.local.get();
        getStorage.then(onLoad, undefined);

        function onLoad(data) {
            if (show == true) {
                for (let val in data) {
                    if (val == "commandHistory"){
                        updateOutput(`commandHistory: ${data[val].length} entries.\n`);
                    }
                    else if (val == "aliases" || val == "dests") {
                        let output = `${val}:\n`;
                        for (let key in data[val]) {
                            output += `\t${key} -> ${data[val][key]}\n`;
                        }
                        updateOutput(`${output}\n`);
                    }
                    else {
                        updateOutput(`${val} = ${data[val]}\n`);
                    }
                }
            }
            let diffcount = 0;
            if (diff == true) {
                for (let val in data) {
                    if (val != "aliases" && val != "dests" && val != "commandHistory"){
                        if (data[val] != window[val]) {
                            updateOutput(`${val} is ${data[val]} in storage but ${window[val]} in session.\n`);
                            diffcount++;
                        }
                    }
                    else if (val != "commandHistory") {
                        for (let key in window[val]) {
                            if (!data[val][key]) {
                                updateOutput(`${key} is in session but not local storage.\n`);
                                diffcount++;
                            }
                        }
                        for (let key in data[val]) {
                            if (!window[val][key]) {
                                updateOutput(`${key} is in local storage but not in session.\n`);
                                diffcount++;
                            }
                        }
                    }
                }
                if (diffcount == 0) {
                    updateOutput(`Local storage and session are synced!\n`);
                }
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
    optstring: {},
    args: [],
    argscol: {"aliases": [], "commands": [], "dests": []},
    /**
     * Description for type
     * 
     * @param {string} args 
     */
    func:
    function type(args) {
        if (!args) {
            throw `Usage: ${this.usage}\n`;
        }
        let hit = 0;
        if(process[args]) {
            updateOutput(`${args} is a command.\n`);
            hit = 1;
        }
        if (alts[args]) {
            updateOutput(`${args} is a an alternative name for command ${alts[args]}.\n`);
            hit = 1;
        }
        if (aliases[args]) {
            updateOutput(`${args} is an alias for ${aliases[args]}.\n`);
            hit = 1;
        }
        if (dests[args]) {
            updateOutput(`${args} is a destination name for ${dests[args]}.\n`);
            hit = 1;
        }
        if (hit == 0) {
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
    "bookim": bookim,
    "clear": clear,
    "colo": colo,
    "echo": echo,
    "export": exportOpts,
    "getopt": getopt,
    "goto": goto,
    "help": help,
    "history": history,
    "import": importOpts,
    "link": link,
    "ps1": ps1,
    "reset": reset,
    "resize": resize,
    "save": save,
    "setopt": setopt,
    "splash": splash,
    "storage": storage,
    "type": type
};


/**
 * Alternate names for commands, essentially a second level jump table
 */
var alts = {
    "go": "goto",
    ":w": "save",
    "man": "help",
    "color": "colo",
    "add": "link",
    "info": "about",
    "prompt": "ps1"
};
/**
 * Applies the current options to the CSS style
 */
function applyCurrentOptions() {
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--fg-color', fgColor);
    output.style.setProperty('--output-height', (outputHeight * 1.1) + 'em'); 
    btmOut.style.setProperty('--btm-height', (btmHeight * 1.1) + 'em');
    prefix.innerText = ps1fill;
    let ps1info = prefix.getBoundingClientRect();
    document.documentElement.style.setProperty('--prompt-percent', (((window.innerWidth - ps1info.width - 10) / window.innerWidth) * 100) + '%');
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
    browser.storage.local.set({ps1fill});
}

/**
 * Sets the current options back to defaults
 */
function setToDefaultOptions() {
    for (let option in defaultOptions) {
        setDefault(option);
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
    let manifest = browser.runtime.getManifest();
    let output = "";
    output += `Command information accurate as of release [${manifest.version}](https://gitlab.com/gilben/shTab/tags/${manifest.version}).\n\n`
    output += `This information can be generated by running \`helpMarkdown()\` in the Firefox console. It outputs the formatted output in Markdown to the console for copying and pasting.\n\n`;
    for (let command in process) {
        output += `## ${command}\n`;
        output += `\`\`\`\n${process[command].desc}\n\n`;
        output += `usage: ${process[command].usage}\n\`\`\`\n`;
    }
    console.log(output);
}


/**
 * Wrapper for getOpts that checks for arguments expected but not received
 * @param {string[]} args 
 * @param {*} optstring 
 */
function parseOpts(args, optstring) {
    let opts = getOpts(args ? args.split(' ') : [], optstring, {noAliasPropagation: true});
    for (let flag in opts.options) {
        if (opts.options[flag] == undefined) {
            throw `Flag ${flag} expected an argument!\n`;
        }
    }
    return opts;
}
