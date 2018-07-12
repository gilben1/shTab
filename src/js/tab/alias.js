// Copyright (c) 2018 Nicholas Gilbert

/**
 * Aliases that map to commands
 */
var aliases = {

};

const aliasLoader = {
    /**
     * Loads aliases into variables from local storage
     */
    async load() {
        let getItem = await browser.storage.local.get("aliases");
        console.log(getItem);
        if (getItem.aliases != undefined) {
            aliases = getItem.aliases;
        }
    }
};

document.addEventListener('DOMContentLoaded', aliasLoader.load);