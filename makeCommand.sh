#!/bin/bash
echo "Enter the name of the command: "
read command
outfile="./src/js/tab/commands.js"
echo "
    

const $command = { 
    /**
     * Description for $command
     * 
     * @param {string} args 
     */
    func:
    function $command (args) {
        let opts = getopt.getopt(args ? args.split(\' \') : [], \"\", []);
    },
    desc:       
\"Long description for $command\n\\
    flags:\n\\
    arguments:\n\\
    \",
    usage:      \"$command\",
    flags: [],
    optstring: {
        short: \"\",
        long: []
    },
    args: []
}" >> $outfile