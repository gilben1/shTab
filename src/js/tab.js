// The script that controls the tab functionality in tab.html
  
const body = document.querySelector('body');
const prompt = document.querySelector('.prompt');

var promptContent = "";

body.onkeydown = function(evt) {
    let keyNum = evt.keyCode;
    let key = keyCodes[evt.keyCode];

    if (key == "enter") {
        promptContent = "";
    }
    else if (key == "delete" || key == "back") {
        promptContent = promptContent.slice(0, -1);
    }
    else {
        promptContent += key ? key : keyNum;
    }
    prompt.innerHTML = promptContent;
}




/*var foo = {
    name: "bar",
    length: 3
};


const thing = {
    async load() {
        let getItem = await browser.storage.local.get("foo");
        console.log(getItem);
        browser.storage.local.set({foo});
    }
};

document.addEventListener('DOMContentLoaded', thing.load);*/