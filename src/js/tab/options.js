// Copyright (c) 2018 Nicholas Gilbert
// Licensed under the Mozilla Public License Version 2.0
// See LICENSE in the root of the repository for details

var aliases = {};
var dests = {};

var bgColor;
var fgColor;
var outputHeight;
var btmHeight;
var ps1fill;

var commandHistory = [];
var saveHistory;

var firstLoad;

var totalLines = 11;

var defaultOptions = {
    bgColor: "black",
    fgColor: "white",
    outputHeight: 9,
    btmHeight: 2,
    ps1fill: "> ",
    commandHistory: [],
    saveHistory: true,
    firstLoad: true,
    aliases: {
        "issue": "go -n issue",
        "new-issue": "go -n nissue",
        "repo": "go -n repo",
        "wiki": "go -n wiki",
        "list": "link -d",
        "ls": "link -d"
    },
    dests: {
        "issue": "https://gitlab.com/gilben/shTab/issues/",
        "nissue": "https://gitlab.com/gilben/shTab/issues/new",
        "repo": "https://gitlab.com/gilben/shTab/",
        "wiki": "https://gitlab.com/gilben/shTab/wikis/home"
    }
};

const optionsLoader = {
    /**
     * Loads options from file
     */
    async load() {

        // Calculate default height
        defaultOptions.outputHeight = Math.floor(window.innerHeight / (13.2) / 2.25);
        defaultOptions.btmHeight = Math.floor(window.innerHeight / (13.2) / 2.25);
        totalLines = defaultOptions.outputHeight + defaultOptions.btmHeight;

        let getStorage = await browser.storage.local.get();

        console.log(getStorage);

        // Assign the local variables to loaded value if it exists, or the defult otherwise
        outputHeight = grab("outputHeight");
        btmHeight = grab("btmHeight");
        bgColor = grab("bgColor");
        fgColor = grab("fgColor");

        commandHistory = grab("commandHistory");
        commandIndex = commandHistory.length;
        saveHistory = grab("saveHistory");

        ps1fill = grab("ps1fill");

        firstLoad = grab("firstLoad");

        aliases = Object.assign({}, defaultOptions.aliases, grab("aliases"));        
        dests = Object.assign({}, defaultOptions.dests, grab("dests"));

        applyCurrentOptions();

        // Deletes the newtab page from history
        // Modified from: https://github.com/cadeyrn/newtaboverride/blob/master/src/js/core/newtab.js
        browser.history.deleteUrl({ url : browser.extension.getURL('../html/tab.html') });

        /**
         * Returns either the loaded field or the default value for that field
         * @param {string} field Field to retrieve
         * @returns {string} Default or loaded value
         */
        function grab(field) {
            return getStorage[field] ? getStorage[field] : defaultOptions[field];
        }
        window.focus();
    }
};

document.addEventListener('DOMContentLoaded', optionsLoader.load);