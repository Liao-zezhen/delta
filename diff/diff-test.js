/* eslint-disable */
import _ from 'lodash';
import seedrandom from 'seedrandom';
import diff from './diff';

var ITERATIONS = 10000;
var ALPHABET = 'GATTACA';
var LENGTH = 100;
var EMOJI_MAX_LENGTH = 50;

var seed = Math.floor(Math.random() * 10000);
var random = seedrandom(seed);

/* console.log('Running regression tests...');
[
  ['GAATAAAAAAAGATTAACAT', 'AAAAACTTGTAATTAACAAC'],
  ['🔘🤘🔗🔗', '🔗🤗🤗__🤗🤘🤘🤗🔗🤘🔗'],
  ['🔗🤗🤗__🤗🤘🤘🤗🔗🤘🔗', '🤗🤘🔘'],
  ['🤘🤘🔘🔘_🔘🔗🤘🤗🤗__🔗🤘', '🤘🔘🤘🔗🤘🤘🔗🤗🤘🔘🔘'],
  [
    '🤗🤘🤗🔘🤘🔘🤗_🤗🔗🤘🤗_🤘🔗🤗🤘🔗🤘🤘🤘🔗🤗🔗🔗🔗🤗_🤘🔗🤗🤗🔘🤗🤗🤘🤗',
    '_🤗🤘_🤘🤘🔘🤗🔘🤘_🔘🤗🔗🔘🔗🤘🔗🤘🤗🔗🔗🔗🤘🔘_🤗🤘🤘🤘__🤘_🔘🤘🤘_🔗🤘🔘',
  ],
  ['🔗🤘🤗🔘🔘🤗', '🤘🤘🤘🤗🔘🔗🔗'],
  ['🔘_🔗🔗🔗🤗🔗', '🤘🤗🔗🤗_🤘🔘_'],
].forEach(function (data) {
  var result = diff(data[0], data[1]);
  applyDiff(result, data[0], data[1]);
}); */

/* console.log('Running computing ' + ITERATIONS + ' diffs with seed ' + seed + '...');

console.log('Generating strings...');
var strings = [];
for (var i = 0; i <= ITERATIONS; ++i) {
  var chars = [];
  for (var l = 0; l < LENGTH; ++l) {
    var letter = ALPHABET.substr(Math.floor(random() * ALPHABET.length), 1);
    chars.push(letter);
  }
  strings.push(chars.join(''));
} */

/* console.log('Running fuzz tests *without* cursor information...');
for (var i = 0; i < ITERATIONS; ++i) {
  var result = diff(strings[i], strings[i + 1]);
  applyDiff(result, strings[i], strings[i + 1]);
} */

/* console.log('Running fuzz tests *with* cursor information');
for (var i = 0; i < ITERATIONS; ++i) {
  var cursor_pos = Math.floor(random() * strings[i].length + 1);
  var diffs = diff(strings[i], strings[i + 1], cursor_pos);
  applyDiff(diffs, strings[i], strings[i + 1]);
} */

function parseDiff(str) {
  if (!str) {
    return [];
  }
  return str.split(/(?=[+\-=])/).map(function (piece) {
    var symbol = piece.charAt(0);
    var text = piece.slice(1);
    return [
      symbol === '+' ? diff.INSERT : symbol === '-' ? diff.DELETE : diff.EQUAL,
      text,
    ];
  });
}

// 在第一个保留操作的文本 prepend 文本，如果第一个不是保留操作的话，手动创建一个；
function diffPrepend(tuples, text) {
  if (tuples.length > 0 && tuples[0][0] === diff.EQUAL) {
    return [[diff.EQUAL, text + tuples[0][1]]].concat(tuples.slice(1));
  } else {
    return [[diff.EQUAL, text]].concat(tuples);
  }
}

// 在最后一个保留操作的文本 append 文本，如果最后一个不是保留操作的话，手动创建一个；
function diffAppend(tuples, text) {
    console.log(tuples);
  var lastTuple = tuples[tuples.length - 1];
  if (lastTuple && lastTuple[0] === diff.EQUAL) {
    return tuples.slice(0, -1).concat([[diff.EQUAL, lastTuple[1] + text]]);
  } else {
    return tuples.concat([[diff.EQUAL, text]]);
  }
}

// index + amount
function shiftCursorInfo(cursorInfo, amount) {
  if (typeof cursorInfo === 'number') {
    return cursorInfo + amount;
  } else {
    return {
      oldRange: {
        index: cursorInfo.oldRange.index + amount,
        length: cursorInfo.oldRange.length,
      },
      newRange: {
        index: cursorInfo.newRange.index + amount,
        length: cursorInfo.newRange.length,
      },
    };
  }
}

function doCursorTest(oldText, newText, cursorInfo, expected) {
  var result = diff(oldText, newText, cursorInfo);
  if (!_.isEqual(result, expected)) {
    console.log([oldText, newText, cursorInfo]);
    console.log(result, '!==', expected);
    throw new Error('cursor test failed');
  }
}

// console.log(diff('👨🏽', '👩🏽'));

// emojis chosen to share high and low surrogates!
var EMOJI_ALPHABET = ['_', '🤗', '🔗', '🤘', '🔘'];
/* 
console.log('Generating emoji strings...');
var emoji_strings = [];
for (var i = 0; i <= ITERATIONS; ++i) {
  var letters = [];
  var len = Math.floor(random() * EMOJI_MAX_LENGTH);
  for (var l = 0; l < len; ++l) {
    var letter = EMOJI_ALPHABET[Math.floor(random() * EMOJI_ALPHABET.length)];
    letters.push(letter);
  }
  emoji_strings.push(letters.join(''));
}

console.log('Running emoji fuzz tests...');
for (var i = 0; i < ITERATIONS; ++i) {
  var oldText = emoji_strings[i];
  var newText = emoji_strings[i + 1];
  var result = diff(oldText, newText);
  applyDiff(result, oldText, newText);
} */

// console.log(diff("\ud801\udc01", "\ud801\udc00"));

/* const a = 'abcxxx123';
const b = 'abcyyy123';

console.log(
  diff(a, b, {
    oldRange: {
      index: 3,
      length: 3,
    },
    newRange: {
      length: 0,
    },
  }),
);
 */

/**
 * diffs
 * text: oldText
 * expectedResult: newText
 */
function applyDiff(diffs, text, expectedResult) {
  var pos = 0;
  function throwError(message) {
    console.log(diffs, text, expectedResult);
    throw new Error(message);
  }
  function expect(expected) {
    var found = text.substr(pos, expected.length);
    if (found !== expected) {
      throwError('Expected "' + expected + '", found "' + found + '"');
    }
  }
  var result = '';
  var inserts_since_last_equality = 0;
  var deletes_since_last_equality = 0;
  for (var i = 0; i < diffs.length; i++) {
    var d = diffs[i];

    // 出现空数据；
    if (!d[1]) {
      throwError('Empty tuple in diff');
    }
    var firstCharCode = d[1].charCodeAt(0);
    var lastCharCode = d[1].slice(-1).charCodeAt(0);

    // 第一个字符是代理对结尾或者最后一个字符是代理对起始；
    if (
      (firstCharCode >= 0xdc00 && firstCharCode <= 0xdfff) ||
      (lastCharCode >= 0xd800 && lastCharCode <= 0xdbff)
    ) {
      throwError('Bad unicode diff tuple');
    }

    switch (d[0]) {
      case diff.EQUAL:
        // 连续出现保留操作；
        if (
          i !== 0 &&
          !inserts_since_last_equality &&
          !deletes_since_last_equality
        ) {
          throwError('two consecutive equalities in diff');
        }
        inserts_since_last_equality = 0;
        deletes_since_last_equality = 0;
        expect(d[1]);
        result += d[1];
        pos += d[1].length;
        break;
      case diff.DELETE:
        // 连续出现删除操作；
        if (deletes_since_last_equality) {
          throwError('multiple deletes between equalities');
        }
        // 删除操作优先级低于插入操作；
        if (inserts_since_last_equality) {
          throwError('delete following insert in diff');
        }
        deletes_since_last_equality++;
        expect(d[1]);
        pos += d[1].length;
        break;
      case diff.INSERT:
        // 连续出现插入操作；
        if (inserts_since_last_equality) {
          throwError('multiple inserts between equalities');
        }
        inserts_since_last_equality++;
        result += d[1];
        break;
    }
  }

  if (pos !== text.length) {
    throwError('Diff did not consume entire input text');
  }

  // 不是预期的结果；
  if (result !== expectedResult) {
    console.log(diffs, text, expectedResult, result);
    throw new Error('Diff not correct');
  }
  return result;
}
