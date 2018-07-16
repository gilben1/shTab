// Copyright (c) 2018 Nicholas Gilbert

var aliases = {};
var dests = {};

var bgColor;
var fgColor;
var outputHeight;
var btmHeight;

const defaultOptions = {
    bgColor: "black",
    fgColor: "white",
    outputHeight: 9,
    btmHeight: 2
};

const optionsLoader = {
    /**
     * Loads options from file
     */
    async load() {
        let getStorage = await browser.storage.local.get();

        console.log(getStorage);

        // Assign the local variables to loaded value if it exists, or the defult otherwise
        outputHeight = getStorage.outputHeight ? getStorage.outputHeight : defaultOptions.outputHeight;
        btmHeight = getStorage.btmHeight ? getStorage.btmHeight : defaultOptions.btmHeight;
        bgColor = getStorage.bgColor ? getStorage.bgColor : defaultOptions.bgColor;
        fgColor = getStorage.fgColor ? getStorage.fgColor : defaultOptions.fgColor;

        aliases = getStorage.aliases ? getStorage.aliases : aliases;
        dests = getStorage.dests ? getStorage.dests : dests;

        applyCurrentOptions();

        // Deletes the newtab page from history
        // Modified from: https://github.com/cadeyrn/newtaboverride/blob/master/src/js/core/newtab.js
        browser.history.deleteUrl({ url : browser.extension.getURL('../html/tab.html') });
    }
};

document.addEventListener('DOMContentLoaded', optionsLoader.load);