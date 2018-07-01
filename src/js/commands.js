// All commands that can be run from the tab page

// url regex found from: https://github.com/cadeyrn/newtaboverride/src/js/core/utils.js
const URL_REGEX = /^https?:\/\//i;

function goto(rest) { // usage: goto [link]
    console.log(`Goto activated, rest = ${rest}`);
    var url = rest.match(URL_REGEX);
    if (url != undefined) {
        window.open(rest, "_self");
    }
    console.log(url);

    return true;
}

function list() { // list all commands
    console.log("List activated");
    return true;
}

var process = {
    "goto": goto,
    "list": list
};