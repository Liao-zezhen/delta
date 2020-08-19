import diff from 'fast-diff';
import cloneDeep from 'lodash.clonedeep';

/* eslint-disable */

let a = "123a4ngmsdev5t45few";
let b = "ab23mcde12367ad";

a = "12ab3bbb45as6";
b = "1abdbbcsasd";

console.log(a.length, b.length, a.length + b.length, Math.ceil((a.length + b.length) / 2),  b.length - a.length);

// console.log(diff(a, b));

/* a = "";
b = "bfgbbg"; */

const res = diff_bisect_(a, b);

console.log(a, b);
console.log(res);

// 不会大于总长度的一半。

function diff_bisect_(text1, text2) {
  // Cache the text lengths to prevent multiple calls.
  // 缓存文本长度以防止多次调用。
  const text1_length = text1.length;
  const text2_length = text2.length;
  const max_d = Math.ceil((text1_length + text2_length) / 2);
  
  /**
   * 两个文本长度之和的中间值。
   */
  const v_offset = max_d;

  const v_length = 2 * max_d;
  const v1 = new Array(v_length);
  const v2 = new Array(v_length);
  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
  // integers and undefined.
  // 在Chrome和Firefox中，将所有元素设置为-1比混合整数和undefined更快。
  for (let x = 0; x < v_length; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  const delta = text1_length - text2_length;
  // If the total number of characters is odd, then the front path will collide
  // with the reverse path.
  // 如果字符总数为奇数，则前路径将与后路径相撞。
  const front = delta % 2 !== 0;
  console.log("front: ", front);
  // Offsets for start and end of k loop.
  // k循环开始和结束的偏移量。
  // Prevents mapping of space beyond the grid.
  // 防止超出网格的空间映射。

  // 在第一个循环。
  let k1start = 0; // 有可能的变化累加2。
  let k1end = 0; // 有可能的变化累加2。

  // 在第二个循环。
  let k2start = 0; // 有可能的变化累加2。
  let k2end = 0; // 有可能的变化累加2。

  const showStartConsole = false;
  const showNextConsole = true;
  const showValueConsole = false;

  console.log(cloneDeep(v1), cloneDeep(v2));
  console.log("================================================================================");

  for (let d = 0; d < max_d; d++) {
    // Walk the front path one step.
    // console.log(d, "k1start: ", k1start, "k1end: ", k1end, "k2start: ", k2start, "k2end: ", k2end);

    // d 在两个循环内不会被改变。

    // x1如果大于文本1的长度，那么k1end累加2；
    // y1如果大于文本2的长度，那么k1start累加2；
    // x1和y1会被改变；
    // 向前匹配。
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
        // 每次进来时，从v_offset递减；
        // 如果同一个数值进来的话，v_offset+2;
      var k1_offset = v_offset + k1;
      var x1;

      showStartConsole && console.log(`${d}: ${k1}, k1_offset: ${k1_offset}, k1start: ${k1start}, k1end: ${k1end} ===> k1'START`);

      showNextConsole && console.log(k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1]), `===> k1: ${k1_offset} [${d}: ${k1}] ${v1[k1_offset - 1]} ${v1[k1_offset]} ${v1[k1_offset + 1]}`);

      if (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }

      var y1 = x1 - k1;

      console.log(`x1: ${x1}, y1: ${y1}`);

      showValueConsole && console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")

      // 当x1和y1都小于两个文本的话，并且两个文本对应的索引相等的话，x1和y1累加1。
      while (
        x1 < text1_length &&
        y1 < text2_length &&
        text1.charAt(x1) === text2.charAt(y1)
      ) {
        showValueConsole && console.log(text1.charAt(x1), text2.charAt(y1));
        x1++;
        y1++;
      }

      showValueConsole && console.log(text1.charAt(x1), text2.charAt(y1));

      showValueConsole && console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")

      v1[k1_offset] = x1;
      console.log(`k1_offset: ${k1_offset}, x1: ${x1} ==========> EDIT`);

      if (x1 > text1_length) {
        // Ran off the right of the graph.
        k1end += 2;
      } else if (y1 > text2_length) {
        // Ran off the bottom of the graph.
        k1start += 2;
      } else if (front) {
        var k2_offset = v_offset + delta - k1;

        // console.log(`k2_offset: ${k2_offset}, v_offset: ${v_offset}, delta: ${delta}, k1: ${k1} ===> END`);

        if (k2_offset >= 0

            && k2_offset < v_length

            && v2[k2_offset] !== -1) {
          // Mirror x2 onto top-left coordinate system.
          // 将x2镜像到左上角坐标系上。
          var x2 = text1_length - v2[k2_offset];

        //   console.log(`v2: ${v2[k2_offset]}, x1: ${x1}, x2: ${x2} ===> FINALLY`);

        //   console.log(x1 >= x2);
          if (x1 >= x2) {
            // console.log(v1, v2, x1, y1);
            // Overlap detected.

            // 检测到重叠。
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }

    }

    // console.log(cloneDeep(v1), cloneDeep(v2));

    // Walk the reverse path one step.
    // 从后向前。
    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2;

      showStartConsole && console.log(`${d}: ${k2}, k2_offset: ${k2_offset}, k2start: ${k2start}, k2end: ${k2end} ===> k2'START`);

      showNextConsole && console.log(k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1]), `===> k2: ${k2_offset} [${d}: ${k2}] ${v2[k2_offset - 1]} ${v2[k2_offset]} ${v2[k2_offset + 1]}`);

      if (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }

      let y2 = x2 - k2;

      console.log(`x2: ${x2}, y2: ${y2}`);

      showValueConsole && console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")

      while (
        x2 < text1_length &&
        y2 < text2_length &&
        text1.charAt(text1_length - x2 - 1) ===
          text2.charAt(text2_length - y2 - 1)
      ) {
        showValueConsole && console.log(text1.charAt(text1_length - x2 - 1), text2.charAt(text2_length - y2 - 1));

        x2++;
        y2++;
      }

      showValueConsole && console.log(text1.charAt(text1_length - x2 - 1), text2.charAt(text2_length - y2 - 1));

      showValueConsole && console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")

      v2[k2_offset] = x2;
      console.log(`k2_offset: ${k2_offset}, x2: ${x2} ==========> EDIT`);

      if (x2 > text1_length) {
        // Ran off the left of the graph.
        k2end += 2;
      } else if (y2 > text2_length) {
        // Ran off the top of the graph.
        k2start += 2;
      } else if (!front) {
        // 判断是否重叠。
        var k1_offset = v_offset + delta - k2;
        console.log(k1_offset, "------------------------------>>>>");

        if (k1_offset >= 0

            && k1_offset < v_length

            && v1[k1_offset] !== -1) {

          var x1 = v1[k1_offset];
          var y1 = v_offset + x1 - k1_offset;
          console.log(y1);

          // Mirror x2 onto top-left coordinate system.
          x2 = text1_length - x2;

          if (x1 >= x2) {
            // console.log(v1, v2, x1, y1);

            // Overlap detected.
            // 检测到重叠。
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }

    console.log(cloneDeep(v1), cloneDeep(v2));

    console.log("================================================================================");

    // console.log(v1, v2);
  }
  // Diff took too long and hit the deadline or
  // number of diffs equals number of characters, no commonality at all.
  // Diff花费的时间太长，无法赶上截止日期，或者Diff的数量等于字符数，一点也不通用。

    var DIFF_DELETE = -1;
    var DIFF_INSERT = 1;
    var DIFF_EQUAL = 0;

// 两个文本没有发现重叠部分。
  return [
    [DIFF_DELETE, text1],
    [DIFF_INSERT, text2],
  ];
}

function diff_bisectSplit_(text1, text2, x, y) {
    var text1a = text1.substring(0, x);
    var text2a = text2.substring(0, y);
    var text1b = text1.substring(x);
    var text2b = text2.substring(y);
  
    // Compute both diffs serially.
    /* var diffs = diff_main(text1a, text2a);
    var diffsb = diff_main(text1b, text2b);
  
    return diffs.concat(diffsb); */
    return [
        text1a,
        text2a,
        text1b,
        text2b
    ];
  };
