// Copyright (c) 2018 Nicholas Gilbert

// Maps keys to destinations

var dests = {

};

const destsLoader = {
    async load() {
        let getItem = await browser.storage.local.get("dests");
        console.log(getItem);
        if (getItem.dests != undefined) {
            dests = getItem.dests;
        }
    }
};

document.addEventListener('DOMContentLoaded', destsLoader.load);