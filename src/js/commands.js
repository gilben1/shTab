// All commands that can be run from the tab page

const output = document.getElementById("output");

// url regex found from: https://github.com/cadeyrn/newtaboverride/src/js/core/utils.js
const URL_REGEX = /^https?:\/\//i;

// Goes to @param dest
function goto(dest) { // usage: goto [link]
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

function list(garbage) { // list all commands
    console.log("List activated");
    for (let key in dests) {
        console.log(`${key} -> ${dests[key]}`);
        output.innerText += `${key} -> ${dests[key]}\n`;
        output.scrollTop = output.scrollHeight;
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
}

function save(garbage) {
    browser.storage.local.set({dests});
    output.innerText += `Saved links!`;
    output.scrollTop = output.scrollHeight;
}


var process = {
    "goto": goto,
    "list": list,
    "link": link,
    "save": save
};