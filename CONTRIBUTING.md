Copyright © 2018 Nicholas Gilbert

# Getting Started

Clone repository   
`git clone git@gitlab.com:gilben/shTab.git`

# Building and Running

Uses Mozilla's `web-ext` node utility for running the extension in a test firefox environment.    
A quick reference to installing and using `web-ext` is found [here.](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext)

# Console Commands

New console commands are stored in alphabetical order in [src/js/tab/commands.js](./src/js/tab/commands.js).    
The helper bash script [makeCommand.sh](./makeCommand.sh) should be used to generate the shell form for the command, which will append to the end of the commands.js. That block should be moved to be in alphabetical order. An entry should also be added to `var process` which maps a string name to the command object.    
All help documentation is sourced the members inside each command object, used by the `help` command and `helpMarkdown()` function for printing and formatting command information. Add useful descriptions in the `desc` field for any new commands.