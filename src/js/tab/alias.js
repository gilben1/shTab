// Copyright (c) 2018 Nicholas Gilbert

var aliases = {

};

const aliasLoader = {
    async load() {
        let getItem = await browser.storage.local.get("aliases");
        console.log(getItem);
        if (getItem.aliases != undefined) {
            aliases = getItem.aliases;
        }
    }
};

document.addEventListener('DOMContentLoaded', aliasLoader.load);