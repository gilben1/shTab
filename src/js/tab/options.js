// Copyright (c) 2018 Nicholas Gilbert


var bgColor;
var fgColor;
var outputHeight;

const defaultOptions = {
    bgColor: "black",
    fgColor: "white",
    outputHeight: 9
};



const optionsLoader = {
    async load() {
        // Loading output height from file
        let getHeight = await browser.storage.local.get("outputHeight");
        console.log(getHeight);

        outputHeight = getHeight.outputHeight ? getHeight.outputHeight : defaultOptions.outputHeight;

        // Loading background and foreground color from file
        let getBG = await browser.storage.local.get("bgColor");
        console.log(getBG);
        bgColor = getBG.bgColor ? getBG.bgColor : defaultOptions.bgColor;

        let getFG = await browser.storage.local.get("fgColor");
        console.log(getFG);
        fgColor = getFG.fgColor ? getFG.fgColor : defaultOptions.fgColor;

        applyCurrentOptions();

        // Deletes the newtab page from history
        // Modified from: https://github.com/cadeyrn/newtaboverride/blob/master/src/js/core/newtab.js
        browser.history.deleteUrl({ url : browser.extension.getURL('../html/tab.html') });
    }
};

document.addEventListener('DOMContentLoaded', optionsLoader.load);