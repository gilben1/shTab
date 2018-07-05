// Copyright (c) 2018 Nicholas Gilbert

const optionsLoader = {
    async load() {
        let getItem = await browser.storage.local.get("outputHeight");
        console.log(getItem);
        if (getItem.outputHeight != undefined) {
            output.style.setProperty('--output-height', (getItem.outputHeight * 1.1) + 'em'); 
        }
    }
};

document.addEventListener('DOMContentLoaded', optionsLoader.load);