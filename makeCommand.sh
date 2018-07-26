#!/bin/bash
# Copyright (c) 2018 Nicholas Gilbert


outfile="./src/js/tab/commands.js"

echo "Enter the name of the command: "
read command

echo "Enter the long flags for $command:"
echo "Use the form \"flag\", \"flagwithassing=\", or blank for no flags"
read longflags

split=$(echo $longflags | tr "," "\n")
for flag in $split; do
    short+=${flag:1:1}
    
    if [[ "${flag: -2:1}" == "=" ]]; then
        short+=":"
    fi
    flag=${flag//\"}
    flagnames+="\"-${flag:0:1}\", \"--${flag//=}\", "
    switchblock+="
                case \"-${flag:0:1}\": case \"--${flag//=}\":
    
                    break;"
    descflags+="
        -${flag:0:1}|--${flag//=}:  \n\\"

done
flagnames=${flagnames::-2}
echo "
    

const $command = { 
    desc:       
\"Long description for $command\n\\
    flags:\n\\$descflags
    arguments:\n\\
    \",
    usage:      \"$command\",
    flags: [$flagnames],
    optstring: {
        short: \"$short\",
        long: [$longflags]
    },
    args: [],
    /**
     * Description for $command
     * 
     * @param {string} args 
     */
    func:
    function ${command}(args) {
        let opts = getopt.getopt(args ? args.split(' ') : [], this.optstring.short, this.optstring.long);

        let flags = opts.opts;

        for (let f in flags) {
            let option = flags[f];
            switch(option[0]) {$switchblock
            }
        }
    }
}" >> $outfile