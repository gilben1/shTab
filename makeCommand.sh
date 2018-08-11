#!/bin/bash
# Copyright (c) 2018 Nicholas Gilbert


outfile="./src/js/tab/commands.js"

echo "Enter the name of the command: "
read command

echo "Enter the long flags for $command:"
echo "Use the form \"flag\", \"flagwithassing=\", or blank for no flags"
read longflags

split=$(echo $longflags | tr "," "\n")
optstring="    opstring: {"
hasflag=0
for flag in $split; do
    curshort=${flag:1:1}
    hasflag=1
    arg=""
    if [[ $flag = *"="* ]]; then
        arg="<arg>"
    fi
    flag=${flag//\"}

    optstring+="
        \"-${curshort}, --${flag//=}\": \"${arg}\","

    flagnames+="\"-${flag:0:1}\", \"--${flag//=}\", "
    switchblock+="
                case \"${flag:0:1}\": case \"${flag//=}\":
    
                    break;"
    descflags+="
        -${flag:0:1}|--${flag//=}:  \n\\"

done
flagnames=${flagnames::-2}
if [ $hasflag -eq 0 ]; then
    optstring+="},"
else
    optstring+="
    },"
fi

echo "
    

const $command = { 
    desc:       
\"Long description for $command\n\\
    flags:\n\\$descflags
    arguments:\n\\
    \",
    usage:      \"$command\",
    flags: [$flagnames],
$optstring
    args: [],
    argscol: {},
    /**
     * Description for $command
     * 
     * @param {string} args 
     */
    func:
    function ${command}(args) {
        let opts = getOpts(args ? args.split(' ') : [], this.optstring, {noAliasPropagation: true});

        let flags = opts.options;

        for (let option in flags) {
            switch(option) {$switchblock
            }
        }
    }
}" >> $outfile