/* eslint-disable */

/* 
editBefore
  以 newCursor(oldCursor + newLength - oldLength) 分割后缀，比较后缀；
  以 min(oldCursor, newcursor) 分割前缀，比较前缀；
editAfter
  以 oldCursor 分割前缀，比较前缀；
  以 min(oldLength - oldCursor, newLength - oldCurosr) 分割后缀（从后算起），比较后缀；
 */

const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

const a = "aaa";
const b = "aa";

console.log(find_cursor_edit_diff(a, b, {
  oldRange: { index: 3 },
  newRange: { index: 3 }
}));

function boo() {
  const a = 'yyy123';
  const b = '123123';
  
  console.log(a, b);
  
  // 由自定义光标来决定前后缀。
  // 新值和旧值的前后缀必须一致。
  
  // 猜想1：会不会负数不被支持？
  // 经测试负数可能不被支持。
  
  // 模拟删除、插入或替换的操作。
  
  // 传入不符合规则的配置都会返回null；
  console.log(find_cursor_edit_diff(a, b, /* {
      oldRange: {
          index: 3,
          length: 0
      },
      newRange: {
          index: 7,
          length: 0
      }
  } *//* {
    oldRange: {
      index: 3,
      length: 3
    },
    newRange: {
      // index: 0,
      length: 0
    }
  } */{
    oldRange: {
      index: 0,
      length: 3
    },
    newRange: {
      length: 0
    }
  }));
}

/**
 * 一共四种Case：
 * 1.
 * a = "abcxxxx123";
 * b = "abc123";
 * find(a, b, 3) => editAfter;
 * 2.
 * a = "abcxxxx123";
 * b = "abc123";
 * find(a, b, 7) => editBefore;
 * 3.
 * a = "abc123";
 * b = "abcxxxx123";
 * find(a, b, 3) => editBefore;
 * 4.
 * a = "abcxxx123";
 * b = "abcyyy123";
 * find(a, b, {
 *  oldRange: {
 *    index: 3,
 *    length: 3
 *  },
 *  newRange: {
 *    length: 0
 *  }
 * }) => editReplace
 * 
 * newRange.index的作用是新值后缀索引的预期；
 * 如果要匹配替换的话，需要指定oldRange的index和length的属性，以及newRange的length设置成0；
 */


// 必须是字符长度不限但字符相同的值。
function find_cursor_edit_diff(oldText, newText, cursor_pos) {
  // note: this runs after equality check has ruled out exact equality
  // 在相等性检查排除了完全相等性之后运行。
  const oldRange =
    typeof cursor_pos === 'number'
      ? { index: cursor_pos, length: 0 }
      : cursor_pos.oldRange;
  const newRange = typeof cursor_pos === 'number' ? null : cursor_pos.newRange;
  // take into account the old and new selection to generate the best diff
  // possible for a text edit.  for example, a text change from "xxx" to "xx"
  // could be a delete or forwards-delete of any one of the x's, or the
  // result of selecting two of the x's and typing "x".
  // 考虑到旧的和新的选择，以生成文本编辑可能的最佳差异。例如，从“ xxx”到“ xx”的文本更改可能是对x中任何一个的删除或转发删除，或者是选择了x中的两个并键入“ x”的结果。
  const oldLength = oldText.length;
  const newLength = newText.length;

  // 当cursor_pos类型是数字类型的数据。
  // 值删减的操作。
  if (oldRange.length === 0 && (newRange === null || newRange.length === 0)) {
    // see if we have an insert or delete before or after cursor
    // 看看我们在光标之前或之后是否有插入或删除。

    // 根据传入的索引，将旧的数据拆分成两份。
    const oldCursor = oldRange.index;
    const oldBefore = oldText.slice(0, oldCursor);
    const oldAfter = oldText.slice(oldCursor);

    const maybeNewCursor = newRange ? newRange.index : null;

    // 处理前缀变化。
    // 从新旧值的前缀中找出不同；
    editBefore: {
      // is this an insert or delete right before oldCursor?
      // 这是在oldCursor之前的插入或删除吗？

        // 计算新值后缀的光标。
        // update: (newLength - oldLength) 求出新旧值的差值，可得出新增或删除了多少个字符；
        // update: oldCursor + (newLength - oldLength) 旧值索引加上差值就可以计算出新值的后缀索引；
      const newCursor = oldCursor + newLength - oldLength;

      // 如果有指定预期索引，那么如果新值索引不是预期索引的话，则不处理前缀变化；
      if (maybeNewCursor !== null && maybeNewCursor !== newCursor) {
        break editBefore;
      }

      // 不得超出前缀的处理范围。
      // 超出前缀范围的情况：
      // 新增的光标超过前缀或者在光标处向前删除超过前缀。
      if (newCursor < 0 || newCursor > newLength) {
        break editBefore;
      }

      // 分割新值。
      var newBefore = newText.slice(0, newCursor);
      var newAfter = newText.slice(newCursor);

      // 判断新值和旧值的后缀是否一致。
      if (newAfter !== oldAfter) {
        break editBefore;
      }

      // 找出插入点的光标。
      var prefixLength = Math.min(oldCursor, newCursor);

      // 从前缀中找出新增的数据。
      var oldPrefix = oldBefore.slice(0, prefixLength);
      var newPrefix = newBefore.slice(0, prefixLength);

      // 判断新值和旧值的前缀是否一致。
      if (oldPrefix !== newPrefix) {
        break editBefore;
      }

      /**
       * const b = 'aaaaaaaa';
       * const a = 'aaaaaa';
       * find_cursor_edit_diff(b, a, 2)
       * 光标不得小于删除字符的长度。
       */
      // 找出删除的字符串。
      // 如果旧值多出字符串，意味着新值缺失这一部分的字符串。
      var oldMiddle = oldBefore.slice(prefixLength);

      /**
       * const b = 'aaaaa';
       * const a = 'aa1aaa';
       * console.log(find_cursor_edit_diff(b, a, 2));
       */
      // 找出新增的字符串。
      // 如果新值多出字符串，意味着旧值缺失这一部分的字符串。
      var newMiddle = newBefore.slice(prefixLength);

      console.log('editBefore');

      // 不需要处理尾部。
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldAfter);
    }

    // 处理后面部分的字符串。
    // 从新旧值的后缀中找出不同；
    editAfter: {
      // is this an insert or delete right after oldCursor?
      // 这是oldCursor之后的插入或删除吗？
      if (maybeNewCursor !== null && maybeNewCursor !== oldCursor) {
        break editAfter;
      }

      const cursor = oldCursor;
      var newBefore = newText.slice(0, cursor);
      var newAfter = newText.slice(cursor);

      // 旧值与新值的前缀需要一致。
      if (newBefore !== oldBefore) {
        break editAfter;
      }

      // 计算出新值与旧值后缀交集的长度。
      var suffixLength = Math.min(oldLength - cursor, newLength - cursor);

      // 获取旧值后缀。
      var oldSuffix = oldAfter.slice(oldAfter.length - suffixLength);
      // 获取新值后缀。
      var newSuffix = newAfter.slice(newAfter.length - suffixLength);

      console.log(oldAfter.length - suffixLength);

      console.log(oldSuffix, newSuffix);

      // 判断后缀是否是一致的。
      if (oldSuffix !== newSuffix) {
        break editAfter;
      }

    /**
     * 找出删除的字符串。
     */
      var oldMiddle = oldAfter.slice(0, oldAfter.length - suffixLength);

    /**
     * 找出新增的字符串。
     */
      var newMiddle = newAfter.slice(0, newAfter.length - suffixLength);

      console.log("editAfter");

      return make_edit_splice(oldBefore, oldMiddle, newMiddle, oldSuffix);
    }
  }

  // 值替换的操作。
  if (oldRange.length > 0 && newRange && newRange.length === 0) {
    replaceRange: {
      // see if diff could be a splice of the old selection range
      // 看看diff是否可能是旧选择范围的拼接。

      // 获取旧值的新后缀；
      var oldPrefix = oldText.slice(0, oldRange.index);
      var oldSuffix = oldText.slice(oldRange.index + oldRange.length);

      // 获取旧值前后缀的长度。
      var prefixLength = oldPrefix.length;
      var suffixLength = oldSuffix.length;

      // 旧值范围大于新值的话，不做任何处理。
      // xxx Update: 旧值的长度需要大于等于新值的长度才会执行后续的程序；
      // 注意：prefixLength + suffixLength 不是旧值的长度，而是指定的旧值前后缀的长度；
      // 新值长度如果小于旧值的前后缀，那么说明新值不可能同时包含旧值的前后缀，所以不构成匹配的条件；
      if (newLength < prefixLength + suffixLength) {
        break replaceRange;
      }

      // 获取新值的前缀。
      var newPrefix = newText.slice(0, prefixLength);
      // 获取新值的后缀。
      var newSuffix = newText.slice(newLength - suffixLength);

      // 新值的前后缀与旧值的前后缀必须一致。
      if (oldPrefix !== newPrefix || oldSuffix !== newSuffix) {
        break replaceRange;
      }

      // 获取旧值变化的字符串。（删除优先）
      var oldMiddle = oldText.slice(prefixLength, oldLength - suffixLength);
      // 获取新值变化的字符串。（插入）
      var newMiddle = newText.slice(prefixLength, newLength - suffixLength);

      console.log("replaceRange");
      
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
    }
  }

  return null;
}

function make_edit_splice(before, oldMiddle, newMiddle, after) {
  if (ends_with_pair_start(before) || starts_with_pair_end(after)) {
    return null;
  }

  // 不可能同时出现删除或新增的值。
  return remove_empty_tuples([
    [DIFF_EQUAL, before],
    [DIFF_DELETE, oldMiddle],
    [DIFF_INSERT, newMiddle],
    [DIFF_EQUAL, after],
  ]);
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

/**
 * 移除空的字符串。
 */
function remove_empty_tuples(tuples) {
  const ret = [];
  for (let i = 0; i < tuples.length; i++) {
    if (tuples[i][1].length > 0) {
      ret.push(tuples[i]);
    }
  }
  return ret;
}
