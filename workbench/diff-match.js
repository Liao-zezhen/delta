/* eslint-disable */

const a = 'aeacdacsaad';
const b = 'daeeacdacsaa122';

const res = diff_halfMatch_(a, b);
console.log(res);

/**
 * 快速找出至少大于长文本一半长度的相同字符。
 */
function diff_halfMatch_(text1, text2) {
  // 找出较长文本。
  const longtext = text1.length > text2.length ? text1 : text2;
  // 找较短文本。
  const shorttext = text1.length > text2.length ? text2 : text1;
  // 长文本比较大于4个字符并且短文本的字符个数是长文本字符个数的一半以上。
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    return null; // Pointless.
  }

  /**
   * Does a substring of shorttext exist within longtext such that the substring
   * is at least half the length of longtext?
   * Closure, but does not reference any external variables.
   * 长文本内是否存在短文本的子字符串，使得该子字符串至少为长文本的一半？* 闭包，但不引用任何外部变量。
   * @param {string} longtext Longer string.
   * @param {string} shorttext Shorter string.
   * @param {number} i Start index of quarter length substring within longtext.
   * 长文本中四分之一长度子字符串的起始索引。
   * @return {Array.<string>} Five element Array, containing the prefix of
   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
   *     of shorttext and the common middle.  Or null if there was no match.
   * @private
   */
  // i 定位长文本相同子串的起始，i不会变化。
  function diff_halfMatchI_(longtext, shorttext, i) {
    // Start with a 1/4 length substring at position i as a seed.
    const seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    // j 定位短文本相同子串的起始，j会变化。
    let j = -1;
    let best_common = '';
    let best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;

    // 从长文本取 1/4 字符串来判断是否存在短文本内。
    while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
    // 找出后半段字符串相同前缀的长度。
      const prefixLength = diff_commonPrefix(
        longtext.substring(i),
        shorttext.substring(j),
      );
      console.log(prefixLength);

    // 找出前半段相同后缀的长度。
      const suffixLength = diff_commonSuffix(
        longtext.substring(0, i),
        shorttext.substring(0, j),
      );
      console.log(suffixLength);

      if (best_common.length < suffixLength + prefixLength) {
          // 提取相同字符串。
        best_common =
            // 向前扩充相同的子串。
          shorttext.substring(j - suffixLength, j) +
          // 向后扩充相同的子串。
          shorttext.substring(j, j + prefixLength);

        // 排除相同的子串，找出长文本的前后缀文本。
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);

        // 排除相同的子串，找出短文本的前后缀文本。
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }
    // 相同部分的文本需要是长文本的一半以上。
    if (best_common.length * 2 >= longtext.length) {
      return [
        best_longtext_a,
        best_longtext_b,
        best_shorttext_a,
        best_shorttext_b,
        best_common,
      ];
    } else {
      return null;
    }
  }

  // First check if the second quarter is the seed for a half-match.
  const hm1 = diff_halfMatchI_(
    longtext,
    shorttext,
    Math.ceil(longtext.length / 4),
  );

  // Check again based on the third quarter.
  const hm2 = diff_halfMatchI_(
    longtext,
    shorttext,
    Math.ceil(longtext.length / 2),
  );

  let hm;
  if (!hm1 && !hm2) {
    return null;
  } else if (!hm2) {
    hm = hm1;
  } else if (!hm1) {
    hm = hm2;
  } else {
    // Both matched.  Select the longest.
    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
  }
  // 思考出什么情况下会发生hm2为空，或者不等于hm1。

  // A half-match was found, sort out the return data.
  let text1_a, text1_b, text2_a, text2_b;
  if (text1.length > text2.length) {
    text1_a = hm[0];
    text1_b = hm[1];
    text2_a = hm[2];
    text2_b = hm[3];
  } else {
    text2_a = hm[0];
    text2_b = hm[1];
    text1_a = hm[2];
    text1_b = hm[3];
  }
  const mid_common = hm[4];
  return [text1_a, text1_b, text2_a, text2_b, mid_common];
}

/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */
// 找出两个字符串相同的前缀。
function diff_commonPrefix(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerstart = 0;
  while (pointermin < pointermid) {
    if (
      text1.substring(pointerstart, pointermid) ==
      text2.substring(pointerstart, pointermid)
    ) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  if (is_surrogate_pair_start(text1.charCodeAt(pointermid - 1))) {
    pointermid--;
  }

  return pointermid;
}

/**
 * Determine the common suffix of two strings.
 * 确定两个字符串的通用后缀。
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 * 每个字符串末尾共有的字符数。
 */
function diff_commonSuffix(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 || text1.slice(-1) !== text2.slice(-1)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerend = 0;
  while (pointermin < pointermid) {
    if (
      text1.substring(text1.length - pointermid, text1.length - pointerend) ==
      text2.substring(text2.length - pointermid, text2.length - pointerend)
    ) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }

  if (is_surrogate_pair_end(text1.charCodeAt(text1.length - pointermid))) {
    pointermid--;
  }

  return pointermid;
}

/**
 * 判断是否是代理对的起始。
 */
function is_surrogate_pair_start(charCode) {
  return charCode >= 0xd800 && charCode <= 0xdbff;
}

/**
 * 判断是否是代理对的终止。
 */
function is_surrogate_pair_end(charCode) {
  return charCode >= 0xdc00 && charCode <= 0xdfff;
}

/**
 * 判断是否是代理对的起始。
 */
function starts_with_pair_end(str) {
  return is_surrogate_pair_end(str.charCodeAt(0));
}

/**
 * 判断是否是代理对的终止。
 */
function ends_with_pair_start(str) {
  return is_surrogate_pair_start(str.charCodeAt(str.length - 1));
}
