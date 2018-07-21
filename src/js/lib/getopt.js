// Python.getopt

// sourced from https://gist.github.com/ynkdir/911900

var getopt = (function() {

  var POSIXLY_CORRECT = false;

  function Array_indexOf(haystack, needle, start) {
    var i;
    if (start === undefined) {
      start = 0;
    }
    for (i = start; i < haystack.length; ++i) {
      if (haystack[i] === needle) {
        return i;
      }
    }
    return -1;
  }

  function getopt(args, shortopts, longopts) {
    var opts = [];
    var r;
    if (longopts === undefined) {
      longopts = [];
    } else if (typeof longopts === 'string') {
      longopts = [longopts];
    } else {
      longopts = longopts.slice(0);
    }
    while (args.length !== 0 && args[0].match(/^-/) && args[0] !== '-') {
      if (args[0] === '--') {
        args = args.slice(1);
        break;
      }
      if (args[0].match(/^--/)) {
        r = do_longs(opts, args[0].substr(2), longopts, args.slice(1));
        opts = r[0];
        args = r[1];
      } else {
        r = do_shorts(opts, args[0].substr(1), shortopts, args.slice(1));
        opts = r[0];
        args = r[1];
      }
    }

    return {
      "opts": opts, 
      "args": args};
  }

  function gnu_getopt(args, shortopts, longopts) {
    var opts = [];
    var prog_args = [];
    var all_options_first;
    var r;
    if (longopts === undefined) {
      longopts = [];
    } else if (typeof longopts === 'string') {
      longopts = [longopts];
    } else {
      longopts = longopts.slice(0);
    }

    // Allow options after non-option arguments?
    if (shortopts.match(/^\+/)) {
      shortopts = shortopts.substr(1);
      all_options_first = true;
    } else if (POSIXLY_CORRECT) {
      all_options_first = true;
    } else {
      all_options_first = false;
    }

    while (args.length !== 0) {
      if (args[0] === '--') {
        prog_args.concat(args.slice(1));
        break;
      }

      if (args[0].match(/^--/)) {
        r = do_longs(opts, args[0].substr(2), longopts, args.slice(1));
        opts = r[0];
        args = r[1];
      } else if (args[0].match(/^-/) && args[0] !== '-') {
        r = do_shorts(opts, args[0].substr(1), shortopts, args.slice(1));
        opts = r[0];
        args = r[1];
      } else {
        if (all_options_first) {
          prog_args.concat(args);
          break;
        } else {
          prog_args.push(args[0]);
          args = args.slice(1);
        }
      }
    }

    return [opts, prog_args];
  }

  function do_longs(opts, opt, longopts, args) {
    var optarg;
    var has_arg;
    var r;

    if (opt.match(/^(.*?)=(.*)$/)) {
      opt = RegExp.$1;
      optarg = RegExp.$2;
    } else {
      optarg = null;
    }

    r = long_has_args(opt, longopts);
    has_arg = r[0];
    opt = r[1];
    if (has_arg) {
      if (optarg === null) {
        if (args.length === 0) {
          throw new Error('option --' + opt + ' requires argument');
        }
        optarg = args[0];
        args = args.slice(1);
      }
    } else if (optarg !== null) {
      throw new Error('option --' + opt + ' must not have an argument');
    }
    opts.push(['--' + opt, optarg || '']);
    return [opts, args];
  }

  function long_has_args(opt, longopts) {
    var possibilities = [];
    var unique_match;
    var has_arg;
    var i;
    for (i = 0; i < longopts.length; ++i) {
      if (longopts[i].indexOf(opt) === 0) {
        possibilities.push(longopts[i]);
      }
    }
    if (possibilities.length === 0) {
      throw new Error('option --' + opt + ' not recognized');
    }
    // Is there an exact match?
    if (Array_indexOf(possibilities, opt) !== -1) {
      return [false, opt];
    } else if (Array_indexOf(possibilities, opt + '=') !== -1) {
      return [true, opt];
    }
    // No exact match, so better be unique.
    if (possibilities.length > 1) {
        // XXX since possibilities contains all valid continuations, might be
        // nice to work them into the error msg
        throw new Error('option --' + opt + ' not a unique prefix');
    }
    unique_match = possibilities[0];
    has_arg = !!unique_match.match(/\=$/);
    if (has_arg) {
      unique_match = unique_match.substr(0, unique_match.length - 1);
    }
    return [has_arg, unique_match];
  }

  function do_shorts(opts, optstring, shortopts, args) {
    var optarg;
    while (optstring !== '') {
      let opt = optstring.substr(0, 1);
      optstring = optstring.substr(1);
      if (short_has_arg(opt, shortopts)) {
        if (optstring === '') {
          if (args.length === 0) {
            throw new Error('option -' + opt + ' requires argument');
          }
          optstring = args[0];
          args = args.slice(1);
        }
        optarg = optstring;
        optstring = '';
      } else {
        optarg = '';
      }
      opts.push(['-' + opt, optarg]);
    }
    return [opts, args];
  }

  function short_has_arg(opt, shortopts) {
    var i;
    for (i = 0; i < shortopts.length; ++i) {
      if (opt === shortopts.substr(i, 1) && opt !== ':') {
        return !!shortopts.substr(i + 1).match(/^:/);
      }
    }
    throw new Error('option -' + opt + ' not recognized');
  }

  return {
    getopt: getopt,
    gnu_getopt: gnu_getopt
  };

}());

//var sys = require('sys');
//sys.puts(getopt.getopt(process.argv.slice(2), 'a:b', ['alpha=', 'beta']));
