// Maps keys to destinations

var dests = {

};

const loader = {
    async load() {
        let getItem = await browser.storage.local.get("dests");
        console.log(getItem);
        if (getItem.dests != undefined) {
            dests = getItem.dests;
        }
    }
};

document.addEventListener('DOMContentLoaded', loader.load);