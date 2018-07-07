// Copyright (c) 2018 Nicholas Gilbert


var bgColor;
var fgColor;
var outputHeight;

const optionsLoader = {
    async load() {
        // Loading output height from file
        let getHeight = await browser.storage.local.get("outputHeight");
        console.log(getHeight);
        if (getHeight.outputHeight != undefined) {
            output.style.setProperty('--output-height', (getHeight.outputHeight * 1.1) + 'em'); 
            outputHeight = getHeight.outputHeight;
        }
        else {
            outputHeight = 9;
        }

        // Loading background and foreground color from file
        let getBG = await browser.storage.local.get("bgColor");
        console.log(getBG);
        let getFG = await browser.storage.local.get("fgColor");
        console.log(getFG);

        if (getBG.bgColor != undefined) {
            document.documentElement.style.setProperty('--bg-color', getBG.bgColor);
            bgColor = getBG.bgColor;
        }
        if (getFG.fgColor != undefined) {
            document.documentElement.style.setProperty('--fg-color', getFG.fgColor);
            fgColor = getFG.fgColor;
        }

        // Deletes the newtab page from history
        // Modified from: https://github.com/cadeyrn/newtaboverride/blob/master/src/js/core/newtab.js
        browser.history.deleteUrl({ url : browser.extension.getURL('../html/tab.html') });
    }
};

document.addEventListener('DOMContentLoaded', optionsLoader.load);