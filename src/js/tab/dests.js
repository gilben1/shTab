// Copyright (c) 2018 Nicholas Gilbert

// Maps keys to destinations

/**
 * Dictonary from names to destinations
 */
var dests = {

};

const destsLoader = {
    /**
     * Loads destinations from local storage
     */
    async load() {
        let getItem = await browser.storage.local.get("dests");
        console.log(getItem);
        if (getItem.dests != undefined) {
            dests = getItem.dests;
        }
    }
};

document.addEventListener('DOMContentLoaded', destsLoader.load);