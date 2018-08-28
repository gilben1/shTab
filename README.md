# shTab
Copyright © 2018 Nicholas Gilbert

shTab is a replacement for the new tab page in Firefox that has shell-like functionality.

## Get the Extension

Installable from the listing on [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/shtab/).

## Description
A new tab replacement extension for Firefox 60+ that implements functionality that follows a shell environment like Bash. Implemented to mimic the shell functionality for use in a web browser environment. Contains a suite of a commands that facilitates customization, navigation, and shorthand alias creation.    

Developed for anyone that prefers keyboard navigation to frequently accessed sites over mouse-based navigation. Using aliases you can quickly create a packages of links that all open with a single command. Using your already existing bookmarks, you can import into the destination structure and rename them to be shorter and faster to type.

Main Features:
- [x] Alias System    
- [x] Tab-Completion
- [x] Persitent Options
- [x] Importing to and Exporting from .json
- [x] ! History Completion and Peristent History
- [x] Bash-like syntax and usage

## Building Using `web-ext`
Tested building on Mint and Ubuntu, but should work on any regular linux distro. The packages may differ and / or may not be in your distro's repositories.    

### **If you don't intend on modifying the extension, it's easiest to install from the [Installing from Release](#installing-from-release) section.**

### Requirements:   
`nodejs` - Is needed to use npm's `web-ext` for running and building. In most standard distro repos.    
`npm` - Node.js package manager, needed to install the next requirement. In most standard distro repos.     
`web-ext` - Command line tool for building and running the extension. Install with `npm install --global web-ext`. Depending on permission setup, may need to be run as root or through `sudo`. See more [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext)

### Building
1. Clone the repository and submodule  
    `git clone git@gitlab.com:gilben/shTab.git; cd shTab; git submodule init; git submodule update`
2. Testing    
    You can run the extension in a test version of Firefox using `web-ext run` in the `src` directory of the repo (the same directory as `manifest.json`, which what `web-ext` looks at for extension information). You won't be able to load it in to your actual Firefox setup until:
3. Building     
    Modify the `gecko: id` field of `manifest.json` if you want to eventually sign it. The extension is already signed under the current id, and if a separate verision is to be created, needs to be modified.     
    You can then package up the current extension using `web-ext build` in the `src` directory of the repo. A `.zip` is generated in the directory `web-ext-artifacts`, with the file being named off the verision in `manifest.json`. This file is used in the next step.
4. Signing
    You can temporarily load the `.zip` as is, but it will be removed after the session ends.     
    For a persistent and actually installed extension, it needs to be signed by Mozilla.     
    With this, you need to make a profile at [addons.mozilla.org](addons.mozilla.org).      
    There are then two ways to create the signed file:    

    a) Upload the `.zip` to [addons.mozilla.org](addons.mozilla.org) under `Submit A New Add-on`. Follow the prompts, and given no validation errors, download a `.xpi` file that can be opened with Firefox to install.    

    b) Generate [an api key](https://addons.mozilla.org/en-US/developers/addon/api/key) on Mozilla's site. Run `web-ext sign --api-key=$JWTISSUER --api-secret=$JWTSECRET`.  
    Both $JWTISSUER and $JWTSECRET are fields shown in the API key after generation.    
    The file gets generated in the `web-ext-artifacts` directory.

## Installing from Release

These instructions only apply to versions prior to 0.6.4a. 0.6.4a is the first version released on the [Mozilla Addons Store](https://addons.mozilla.org/en-US/firefox/addon/shtab/)

1. Download the install file
    The install files are located with their associated release tag, found in the [Tags](https://gitlab.com/gilben/shTab/tags) section. There you will find the `.xpi` install files. Download the `.xpi` to your machine.

2. Navigate to where you downloaded the install file

3. Install the extension by opening the `.xpi` file with `firefox`

    You can install a particular version of the extension using `firefox shtab-$VER-an+fx.xpi` from a command prompt (tested on Linux, potentially also works on MacOS), replacing `$VER` with the version you downloaded.

    The same can be achieved through a file browser (Window, Linux, maybe MacOS) by right-clicking on the `.xpi` file and selecting "Open with..." and choosing firefox.

## How To Use
Install the extension (see [above](#installing-from-release), or the [Mozilla Addons Store](https://addons.mozilla.org/en-US/firefox/addon/shtab/)).

When installed, this extension replaces the new tab page with the shTab prompt, which allows you to enter commands to perform actions.

All commands have an associated `help` or `man` page that can be ran by entering `help $command` or `man $command` in the shTab prompt.
You can list all commands with `help` or `man` with no arguments.

Current Keybinds (may be changeable in the future):

- `Enter` Process command based on prompt content
- `Up arrow` Cycle up command history
- `Down arrow` Cycle down command history
- `Ctrl-L` Jump to address bar (may be dependant on OS, operation known in Ubuntu and Windows 10)

Some work-in-progress documentation is found on the wiki [here](https://gitlab.com/gilben/shTab/wikis/home).

## Contributing to the Project
Follow the instructions and forms shown in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Permissions
The extension requires the following browser permissions to function properly:

- bookmarks    
    Needed for the importing of bookmarks into destinations
- downloads    
    Needed for the downloading of the exported settings json
- history
    Needed to remove the new tab page itself from history
- storage    
    Needed to save persistent settings into local storage


## License
This software is licensed under the [Mozilla Public License Version 2.0 (MPL-2.0)](./LICENSE).

## Release Notes
Release notes for each version are available in the [Tags](https://gitlab.com/gilben/shTab/tags) section.

## Included Submodules
[GetOptions by Alhadis](https://github.com/Alhadis/GetOptions), see repository for licensing information.


## Contact
<nickgilbert2@gmail.com> / <gnick@pdx.edu>

Join me on freenode at #shTab.

Find a bug? Add it to the [Issue tracker](https://gitlab.com/gilben/shTab/issues).