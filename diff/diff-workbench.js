/* eslint-disable */
import clonedeep from 'lodash.clonedeep';
import { ConsoleReporter } from 'jasmine';

// console.log(diff(a, b));

// console.log(diff_commonPrefix("abc123", "abcads"));

// console.log(diffs);

const str1 = String.fromCodePoint(0x2F804);
// const str2 = String.fromCodePoint(0x2F805);
const str2 = "\ud800\udc00";
// String.fromCodePoint(0x2F804)[0] + String.fromCharCode(0xdc00)

const diffs = [
  [0, str1[1]],
  [0, "123"]
];
diff_cleanupMerge(diffs, true);
console.log(diffs);

/**
 * Reorder and merge like edit sections.  Merge equalities.
 * 重新排序并合并类似编辑部分。合并平等。
 * Any edit section can move as long as it doesn't cross an equality.
 * 只要不跨越相等性，任何编辑部分都可以移动。
 * @param {Array} diffs Array of diff tuples.
 * @param {boolean} fix_unicode Whether to normalize to a unicode-correct diff
 */
function diff_cleanupMerge(diffs, fix_unicode) {
  const DIFF_DELETE = -1;
  const DIFF_INSERT = 1;
  const DIFF_EQUAL = 0;

  diffs.push([DIFF_EQUAL, '']); // Add a dummy entry at the end.
  // 索引。
  let pointer = 0;
  // 删除的数量。
  let count_delete = 0;
  // 插入的数量。
  let count_insert = 0;
  // 删除的文本。
  let text_delete = '';
  // 插入的文本。
  let text_insert = '';
  let commonlength;

  while (pointer < diffs.length) {
    // 如果存在下一个数据，那么当前数据为空的话，抛弃该数据。
    if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
      diffs.splice(pointer, 1);
      continue;
    }

    // 判断数据的操作。
    switch (diffs[pointer][0]) {
      // 插入操作；
      case DIFF_INSERT:
        // 累加插入的数量。
        count_insert++;
        // 追加插入的文本。
        text_insert += diffs[pointer][1];
        // 累加索引。
        pointer++;
        break;
      // 删除操作；
      case DIFF_DELETE:
        // 累加删除的数量；
        count_delete++;
        // 追加删除的文本；
        text_delete += diffs[pointer][1];
        // 累加索引；
        pointer++;
        break;
      // 保留操作；
      case DIFF_EQUAL:
        // 计算出上一个保留操作的索引。
        var previous_equality = pointer - count_insert - count_delete - 1;

        if (fix_unicode) {
          // prevent splitting of unicode surrogate pairs.  when fix_unicode is true,
          // we assume that the old and new text in the diff are complete and correct
          // unicode-encoded JS strings, but the tuple boundaries may fall between
          // surrogate pairs.  we fix this by shaving off stray surrogates from the end
          // of the previous equality and the beginning of this equality.  this may create
          // empty equalities or a common prefix or suffix.  for example, if AB and AC are
          // emojis, `[[0, 'A'], [-1, 'BA'], [0, 'C']]` would turn into deleting 'ABAC' and
          // inserting 'AC', and then the common suffix 'AC' will be eliminated.  in this
          // particular case, both equalities go away, we absorb any previous inequalities,
          // and we keep scanning for the next equality before rewriting the tuples.

          // 防止unicode代理对分裂。当fix_unicode为true时，
          // 我们假设diff中的新旧文本是完整的，并且正确的是unicode编码的JS字符串，但是元组边界可能落在代理对之间。
          // 我们通过从先前的等式的结尾和该等式的开头删除杂项替代来解决此问题。
          // 这可能会创建空的等号或通用前缀或后缀。
          // 例如，如果AB和AC是表情符号，则[[[0，'A']，[-1，'BA']，[0，'C']]`会变成删除'ABAC'并插入'AC' ，
          // 然后将消除通用后缀“ AC”。
          // 在这种情况下，两个等式都消失了，我们吸收了之前的所有不等式，并在重写元组之前继续扫描下一个等式。
          if (
            previous_equality >= 0 &&
            ends_with_pair_start(diffs[previous_equality][1])
          ) {
            // 字符串的结尾包含着一个代理对的前半部分。

            var stray = diffs[previous_equality][1].slice(-1);

            // 上一个保留操作抛弃代理对的前半部分。
            diffs[previous_equality][1] = diffs[previous_equality][1].slice(
              0,
              -1,
            );

            text_delete = stray + text_delete;
            text_insert = stray + text_insert;

            // 删除代理对后没有数据的话，清空先前的保留操作；
            if (!diffs[previous_equality][1]) {
              // emptied out previous equality, so delete it and include previous delete/insert
              // 清空先前的等式，因此将其删除并包括先前的删除/插入。
              diffs.splice(previous_equality, 1);
              pointer--;

              let k = previous_equality - 1;
              if (diffs[k] && diffs[k][0] === DIFF_INSERT) {
                count_insert++;
                text_insert = diffs[k][1] + text_insert;
                k--;
              }
              if (diffs[k] && diffs[k][0] === DIFF_DELETE) {
                count_delete++;
                text_delete = diffs[k][1] + text_delete;
                k--;
              }
              previous_equality = k;
            }
            console.log("s: ", text_delete, text_insert);
          }
          if (starts_with_pair_end(diffs[pointer][1])) {
            // 字符串的起始包含一个代理对的后半部分。

            var stray = diffs[pointer][1].charAt(0);
            diffs[pointer][1] = diffs[pointer][1].slice(1);
            text_delete += stray;
            text_insert += stray;
            console.log("s: ", text_delete, text_insert);
          }
        }

        // 当前数据非最后一个，并且为空的话，那么删除掉当前的数据，然后跳出循环。
        // 这种情况只会出现在当前的文本是代理对的后半部分，并且被以上程序修正过的情况下才会执行。
        if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
          // for empty equality not at end, wait for next equality
          // 对于空的平等不是结束，等待下一个平等。
          diffs.splice(pointer, 1);
          console.log(clonedeep(diffs));
          break;
        }

        // 存在删除或新增操作。
        if (text_delete.length > 0 || text_insert.length > 0) {
          // note that diff_commonPrefix and diff_commonSuffix are unicode-aware
          // 请注意，diff_commonPrefix和diff_commonSuffix支持unicode
          // 同时存在删除和新增的操作。
          if (text_delete.length > 0 && text_insert.length > 0) {
            // Factor out any common prefixes.
            // 排除所有常见的前缀。

            // 获取新增和删除操作的前后缀，是比较保留之前的新增和删除操作的总字符串。
            // 找出新增文本和删除文本的相同前缀的长度。
            commonlength = diff_commonPrefix(text_insert, text_delete);

            if (commonlength !== 0) {
              // 上一个保留操作的文本向后追加编辑操作相同的前缀文本。
              if (previous_equality >= 0) {
                diffs[previous_equality][1] += text_insert.substring(
                  0,
                  commonlength,
                );
              } else {
                // 如果不存在上一个保留操作的话，那么在头部新增一个。
                diffs.splice(0, 0, [
                  DIFF_EQUAL,
                  text_insert.substring(0, commonlength),
                ]);
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            // Factor out any common suffixes.
            // 排除所有常见的后缀。

            // 找出新增文本和删除文本的相同后缀的长度。
            commonlength = diff_commonSuffix(text_insert, text_delete);

            if (commonlength !== 0) {
              // 当前保留操作的文本向前新增编辑操作相同的前缀文本。
              diffs[pointer][1] =
                text_insert.substring(text_insert.length - commonlength) +
                diffs[pointer][1];
              text_insert = text_insert.substring(
                0,
                text_insert.length - commonlength,
              );
              text_delete = text_delete.substring(
                0,
                text_delete.length - commonlength,
              );
            }
          }

          // Delete the offending records and add the merged ones.
          // 删除有问题的记录并添加合并的记录。
          // 纠正操作的索引。
          const n = count_insert + count_delete;

          if (text_delete.length === 0 && text_insert.length === 0) {
            // 删除文本与新增文本都为空的话，纠正索引。
            diffs.splice(pointer - n, n);
            pointer = pointer - n;
          } else if (text_delete.length === 0) {
            // 删除文本为空的话，纠正索引，并且合并新增操作。
            diffs.splice(pointer - n, n, [DIFF_INSERT, text_insert]);
            pointer = pointer - n + 1;
          } else if (text_insert.length === 0) {
            // 新增文本为空的话，纠正索引，并且合并删除操作。
            diffs.splice(pointer - n, n, [DIFF_DELETE, text_delete]);
            pointer = pointer - n + 1;
          } else {
            // 合并删除和新增操作，删除优先。
            diffs.splice(
              pointer - n,
              n,
              [DIFF_DELETE, text_delete],
              [DIFF_INSERT, text_insert],
            );
            pointer = pointer - n + 2;
          }
        }

        // 如果上一个操作是保留操作的话，那么进行合并。
        if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
          // Merge this equality with the previous one.
          // 将此平等与上一个合并。
          // 合并上一个保留操作。
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }

        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
    }
  }

  // 如果最后一个数据的字符串为空的话，抛弃该数据。
  if (diffs[diffs.length - 1][1] === '') {
    diffs.pop(); // Remove the dummy entry at the end.
  }

  // Second pass: look for single edits surrounded on both sides by equalities
  // which can be shifted sideways to eliminate an equality.
  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  // 第二遍：寻找在两侧都被等号包围的单个编辑，这些编辑可以横向移动以消除等号。例如：A <ins> BA </ ins> C-> <ins> AB </ ins> AC
  let changes = false;
  pointer = 1;/* 

  diffs = [
    [0, "\ud800"],
    [0, "\udc00\ud800"],
    [0, "\udc00"]
  ]; */

  // 什么情况下会执行以下程序？

  // Intentionally ignore the first and last element (don't need checking).
  // 故意忽略第一个和最后一个元素（不需要检查）。
  // 如果当前文本的后缀包含上一个文本的话，那么以该后缀为界线，分割当前文本，将上一个文本与上一半段文本合并；将下一半段文本与下一个文本合并，删除上一个文本；
  // 如果当前文本的前缀包含下一个文本的话，那么以该前缀为界线，分割当前文本，将上一个文本与上一半段文本合并；将下一半段文本与下一个文本合并，删除下一个文本；
  while (pointer < diffs.length - 1) {
    // 前后的操作都是保留操作。
    if (
      diffs[pointer - 1][0] === DIFF_EQUAL &&
      diffs[pointer + 1][0] === DIFF_EQUAL
    ) {
      // This is a single edit surrounded by equalities.
      // 这是由等号包围的单个编辑。
      if (
        diffs[pointer][1].substring(
          diffs[pointer][1].length - diffs[pointer - 1][1].length,
        ) === diffs[pointer - 1][1]
      ) {
        // 当前文本的后缀包含上一个文本。
        // Shift the edit over the previous equality.
        // 将编辑移至上一个等式。
        diffs[pointer][1] =
          diffs[pointer - 1][1] +
          diffs[pointer][1].substring(
            0,
            diffs[pointer][1].length - diffs[pointer - 1][1].length,
          );
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
        // 将 [abc], [123abc], [456]
        // 变形为 [abc123], [abc456]
      } else if (
        diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
        diffs[pointer + 1][1]
      ) {
        // 当前文本的前缀包含下个文本。
        // Shift the edit over the next equality.
        // 将编辑移至下一个等式。
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] =
          diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
          diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
        // 将 [456], [123abc], [123]
        // 变形为 [456123], [abc123]
      }
    }
    pointer++;
  }

  // If shifts were made, the diff needs reordering and another shift sweep.
  // 如果进行了移位，则差异需要重新排序并进行另一次移位扫描。
  if (changes) {
    diff_cleanupMerge(diffs, fix_unicode);
  }
}

function ends_with_pair_start(str) {
  return is_surrogate_pair_start(str.charCodeAt(str.length - 1));
}

function is_surrogate_pair_start(charCode) {
  return charCode >= 0xd800 && charCode <= 0xdbff;
}

function starts_with_pair_end(str) {
  return is_surrogate_pair_end(str.charCodeAt(0));
}

function is_surrogate_pair_end(charCode) {
  return charCode >= 0xdc00 && charCode <= 0xdfff;
}

// 找出两个字符串相同前缀的长度。
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

  // 如果最后一个字符是代理对的开端，那么不算在相同字符串的长度中。
  if (is_surrogate_pair_start(text1.charCodeAt(pointermid - 1))) {
    pointermid--;
  }

  return pointermid;
}

// 找出两个字符串相同后缀的长度。
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

  // 如果第一个字符是代理对的后端，那么不算在相同字符串的长度中。
  if (is_surrogate_pair_end(text1.charCodeAt(text1.length - pointermid))) {
    pointermid--;
  }

  return pointermid;
}
