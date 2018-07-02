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
    if (args == undefined) {
        output.innerText = "";
    }
    else if (args == "history") {
        commandHistory = [];
        updateOutput(`Cleared command history.\n`);
    }
    else if (args == "links") {
        dests = {};
        updateOutput(`Cleared links.\n`);
    }
    else {
        throw `Unknown argument!`;
    }
}

var process = {
    "clear": clear,
    "goto": goto,
    "list": list,
    "link": link,
    "save": save
};