// Copyright (c) 2018 Nicholas Gilbert
// Map from keyCodes to output strings

// Sourced and modified from https://github.com/wesbos/keycodes
/**
 * Dictionary of keycode numbers to human names
 */
const keyCodes = {
  8 : "back",
  13 : "enter",
  16 : "shift",
  //17 : "ctrl",
  //18 : "alt",
  27 : "escape",
  //32 : "spacebar",
  32 : " ",
  37 : "left",
  38 : "up",
  39 : "right",
  40 : "down",
  46: 'delete',
  48 : "0",
  49 : "1",
  50 : "2",
  51 : "3",
  52 : "4",
  53 : "5",
  54 : "6",
  55 : "7",
  56 : "8",
  57 : "9",
  58 : ":",
  59 : ";",
  61 : "=",
  65 : "a",
  66 : "b",
  67 : "c",
  68 : "d",
  69 : "e",
  70 : "f",
  71 : "g",
  72 : "h",
  73 : "i",
  74 : "j",
  75 : "k",
  76 : "l",
  77 : "m",
  78 : "n",
  79 : "o",
  80 : "p",
  81 : "q",
  82 : "r",
  83 : "s",
  84 : "t",
  85 : "u",
  86 : "v",
  87 : "w",
  88 : "x",
  89 : "y",
  90 : "z",
  96 : "0", // start numpad
  97 : "1",
  98 : "2",
  99 : "3",
  100 : "4",
  101 : "5",
  102 : "6",
  103 : "7",
  104 : "8",
  105 : "9", // end numpad
  96 : "0", // start top row
  97 : "1",
  98 : "2",
  99 : "3",
  100 : "4",
  101 : "5",
  102 : "6",
  103 : "7",
  104 : "8",
  105 : "9", // end top row
  160 : "^",
  161 : "!",
  163 : "#",
  164 : "$",
  170 : "*",
  173 : "-",
  188: ",",
  190: ".",
  191: "/",
  192: "`",
  //193 : "?, / or °",
  193 : "?",
  219 : "[",
  220 : "\\",
  221 : "]",
  222 : "\'"
};

const shiftedKeys = {
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "0": ")",
  "-": "_",
  "=": "+",
  "[": "{",
  "]": "}",
  "\\": "|",
  ";": ":",
  "\'": "\"",
  ",": "<",
  ".": ">",
  "/": "?",
  "\`": "~",
  "a": "A", 
  "b": "B",
  "c": "C",
  "d": "D",
  "e": "E",
  "f": "F",
  "g": "G",
  "h": "H",
  "i": "I",
  "j": "J",
  "k": "K",
  "l": "L",
  "m": "M",
  "n": "N",
  "o": "O",
  "p": "P",
  "q": "Q",
  "r": "R",
  "s": "S",
  "t": "T",
  "u": "U",
  "v": "V",
  "w": "W",
  "x": "X",
  "y": "Y",
  "z": "Z"

};