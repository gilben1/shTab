# shTab

Copyright © 2018 Nicholas Gilbert

shTab is a replacement for the new tab page in Firefox that has shell-like functionality.

## Description

A new tab replacement extension for Firefox 60+ that implements functionality that follows a shell environment like Bash. Implemented to mimic the shell functionality for use in a web browser environment.    

The following Bash-like features are implemented:
- [x] Aliases   
    Alias command for creating and viewing aliases
- [x] History    
    `Up` and `Down` will populate the prompt with previously run commands
- [x] Tab-completion    
    `Right` will show possible commands, flags, arguments based on current input
- [x] Argument Flags    
    Commands have flags that behave mostly like a shell command (-f, --flag argument)
 


## How to Install

1. Download the install file
    The install files are located with their associated release tag, found in the [Tags](https://gitlab.com/gilben/shTab/tags) section of Gitlab. There you will find the `.xpi` install files. Download the `.xpi` to your machine.

2. Navigate to where you downloaded the install file

3. Install the extension by opening the `.xpi` file with `firefox`

    You can install a particular version of the extension using `firefox shtab-$VER-an+fx.xpi` from a command prompt (tested on Linux, potentially also works on MacOS), replacing `$VER` with the version you downloaded.

    The same can be achieved through a file browser (Window, Linux, maybe MacOS) by right-clicking on the `.xpi` file and selecting "Open with..." and choosing firefox.

## How To Use
Install the extension (see above).

All commands have an associated `help` or `man` page that can be ran by entering `help $command` or `man $command` in the shTab prompt.
You can list all commands with `help` or `man` with no arguments.

Current Keybinds (may be changeable in the future):

- `Enter` Process command based on prompt content
- `Up arrow` Cycle up command history
- `Down arrow` Cycle down command history
- `Ctrl-L` Jump to address bar (may be dependant on OS, operation known in Ubuntu and Windows 10)


Some work-in-progress documentation is found on the wiki [here](https://gitlab.com/gilben/shTab/wikis/home).

## License
This software is licensed under the Mozilla Public License 2.0 (MPL-2.0).

## Release Notes

Release notes for each version are in available in the [Tags](https://gitlab.com/gilben/shTab/tags) section of Gitlab.

## Contact

nickgilbert2@gmail.com / gnick@pdx.edu

Join me on freenode at #shTab.