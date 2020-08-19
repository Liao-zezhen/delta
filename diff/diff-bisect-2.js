/* eslint-disable */
import diff from "./diff";


let a = 'ABCABBA122';
let b = 'CBABAC1212sf';

// console.log(diff(a, b));

// a = "b1cdaa";
// b = "1234561";

/* a = "abcabc";
b = "12aabc" */

// console.log(diff(a, b));
// console.log(myers(a, b));
// console.log(myers(a.split("").reverse().join(""), b.split("").reverse().join("")));

// a < b end
// a > b start

console.log(diff_bisect_(a, b));

/**
 * 关于Myers算法的疑问：
 * 为什么使用Myers算法就能找出最短编辑脚本？
 * 
 * 关于Diff-bisect的疑问：
 * 在比较前后序列的索引时，为什么要取相反数？
 * 取k的相反数：delta - k
 * 
 * 为什么正反Myers算法得出的坐标点不一样，也可以作为判断序列最优中间点呢？
 */

/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @return {Array} Array of diff tuples.
 * @private
 */
function diff_bisect_(text1, text2) {
  // Cache the text lengths to prevent multiple calls.
  const text1_length = text1.length;
  const text2_length = text2.length;
  // 获取最大步数。
  const max_d = Math.ceil((text1_length + text2_length) / 2);
  const v_offset = max_d;
  const v_length = 2 * max_d;

  const v1 = new Array(v_length);
  const v2 = new Array(v_length);

  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
  // integers and undefined.
  for (let x = 0; x < v_length; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;

  // 判断字符总数是否是奇数。
  const delta = text1_length - text2_length;
  // If the total number of characters is odd, then the front path will collide
  // with the reverse path.
  const front = delta % 2 !== 0;
  console.log("front: ", front);
  console.log("delta: ", delta);

  // 用于记录D步数的所有可能的坐标；
  const vs1 = {};
  const vs2 = {};

  // 用于记录D步数下，满足判断前后序列碰头的K；
  const tmp1 = {};
  const tmp2 = {};


  // Offsets for start and end of k loop.
  // k循环开始和结束的偏移量。
  // Prevents mapping of space beyond the grid.
  // 防止超出网格的空间映射。
  // 为了提升性能，不判断超出网格的坐标点，使用start和end来限制坐标点在合理的范围内；
  let k1start = 0;
  let k1end = 0;
  let k2start = 0;
  let k2end = 0;

  /**
   * 两边分头使用Myers算法查找，如果碰头了，就进行截取字符串。
   * 
   * 那么它们相互碰头的条件是什么？
   */

  for (let d = 0; d < max_d; d++) {
    let tmp = {};
    let _tmp = {};
    let _tmp2 = {};
    
    // Walk the front path one step.
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      var k1_offset = v_offset + k1;
      var x1;
      if (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }
      var y1 = x1 - k1;
      while (
        x1 < text1_length &&
        y1 < text2_length &&
        text1.charAt(x1) === text2.charAt(y1)
      ) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      tmp[k1] = [x1, y1];

      // 避免遍历超出边界的值。
      if (x1 > text1_length) {
        // Ran off the right of the graph.
        // 偏离图表的右边；
        k1end += 2;
      } else if (y1 > text2_length) {
        // console.log(k1start);
        // Ran off the bottom of the graph.
        // 偏离图表的底部；
        k1start += 2;
      } else if (front) {
        // 求出当前正向Myers的K值的相反数，作为反向Myers的K值；
        var k2_offset = v_offset + delta - k1;

        /* 
        两个序列的长度之和是奇数的话，那么碰撞检测则在正向Myers的循环中执行，因此正向Myers的记录会比反向Myers的记录多出一步（d），
        所以每次检测的时候，都是拿当前正向Myers的步数（d）与反向Myers的上一步（d）做比较；
         */
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
          _tmp[k1] = true;
          _tmp2[k2_offset - v_offset] = true;

          // Mirror x2 onto top-left coordinate system.
          // 站在从后向前遍历的角度，求出未遍历的长度。
          // 求出当前后向Myers未遍历的长度；
          var x2 = text1_length - v2[k2_offset];

          // x1 + _x2(:v2[k2_offset]) >= text1_length 意味着x1与x2碰头；
          if (x1 >= x2) {
            vs1[d] = tmp;
            tmp1[d] = _tmp;
            tmp2[d - 1] = _tmp2;
            draw(vs1, tmp1);
            draw(vs2, tmp2);
            // Overlap detected.
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }

    vs1[d] = tmp;

    tmp = {};

    // Walk the reverse path one step.
    // 从后往前遍历的意义何在？
    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2;
      if (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }
      let y2 = x2 - k2;
      while (
        x2 < text1_length &&
        y2 < text2_length &&
        text1.charAt(text1_length - x2 - 1) ===
          text2.charAt(text2_length - y2 - 1)
      ) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      tmp[k2] = [x2, y2];
      if (x2 > text1_length) {
        // Ran off the left of the graph.
        k2end += 2;
      } else if (y2 > text2_length) {
        // Ran off the top of the graph.
        // console.log(k2start);
        k2start += 2;
      } else if (!front) {
        var k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
          // 找出k1对应的坐标。
          var x1 = v1[k1_offset];
          var y1 = v_offset + x1 - k1_offset;

          _tmp[k1_offset - v_offset] = true;
          _tmp2[k2] = true;

          // Mirror x2 onto top-left coordinate system.
          // x2从尾到头定位text1的索引。
          // 站在从后向前遍历的角度，求出未遍历的长度。
          // 求出当前后向Myers未遍历的长度；
          x2 = text1_length - x2;

          if (x1 >= x2) {
            vs2[d] = tmp;
            tmp1[d] = _tmp;
            tmp2[d] = _tmp2;
            
            draw(vs1, tmp1);
            draw(vs2, tmp2);
            // Overlap detected.
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }

    vs2[d] = tmp;
    tmp1[d] = _tmp;
    if (front) {
      tmp2[d - 1] = _tmp2;
    } else {
      tmp2[d] = _tmp2;
    }
  }

  var DIFF_DELETE = -1;
  var DIFF_INSERT = 1;
  var DIFF_EQUAL = 0;
  // Diff took too long and hit the deadline or
  // number of diffs equals number of characters, no commonality at all.
  return [
    [DIFF_DELETE, text1],
    [DIFF_INSERT, text2],
  ];
}

function diff_bisectSplit_(text1, text2, x, y) {
  const text1a = text1.substring(0, x);
  const text2a = text2.substring(0, y);
  const text1b = text1.substring(x);
  const text2b = text2.substring(y);

  // Compute both diffs serially.
  /* var diffs = diff_main(text1a, text2a);
    var diffsb = diff_main(text1b, text2b);
  
    return diffs.concat(diffsb); */
  return [text1a, text2a, text1b, text2b];
}

function draw(data, tmp) {
  const container = document.createElement("div");
  const cols = Object.keys(data).map(item => parseInt(item)).sort((a, b) => b - a)[0];
  const rows = Object.keys(data[cols]).map(item => Math.abs(parseInt(item))).sort((a, b) => b - a)[0];
  const fragment = document.createDocumentFragment();

  const realCols = cols + 1;
  const realRows = realCols * 2;

  container.className = "myers-box";

  for (let i = 0; i <= realCols; i++) {
    const p = document.createElement("p");
    const realIndex = i - 1;

    for (let j = 0; j < realRows; j++) {
      const elem = document.createElement("i");
      const index = ~(j - cols - 2);

      if (tmp && tmp[realIndex] && tmp[realIndex][index]) {
        elem.className = "active";
      }

      if (i === 0 && j > 0) {
        elem.innerHTML = index;
      }

      if (i > 0 && j === 0) {
        elem.innerHTML = realIndex;
      }

      if (data[realIndex] && data[realIndex][index]) {
        elem.innerHTML = data[realIndex][index];
      }

      p.appendChild(elem);
    }

    fragment.appendChild(p);
  }

  container.appendChild(fragment);
  document.body.appendChild(container);
}

function myers(stra, strb) {
  const m = stra.length;
  const n = strb.length;

  const V = {
    '1': 0,
  };

  const VS = {
    '0': { '1': [0, 0] },
  };

  loop: for (let d = 0; d <= m + n; d++) {
    const tmp = {};
    let x, y;

    for (let k = -d; k <= d; k += 2) {
      if (k === -d || (k !== d && V[k + 1] > V[k - 1])) {
        x = V[k + 1];
      } else {
        x = V[k - 1] + 1;
      }
      y = x - k;
      while (x < m && y < n && stra[x] === strb[y]) {
        x++;
        y++;
      }

      V[k] = x;
      tmp[k] = [x, y];

      if (x === m && y === n) {
        VS[d] = tmp;
        draw(VS);
        break loop;
      }
    }

    VS[d] = tmp;
  }
}
