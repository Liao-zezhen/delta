import AttributeMap from './AttributeMap';
import Iterator from './Iterator';

/**
 * 表示一个配置项。
 */
interface Op {
  // only one property out of {insert, delete, retain} will be present
  insert?: string | object;
  delete?: number;
  retain?: number;

  attributes?: AttributeMap;
}

namespace Op {
  /**
   * 返回给定配置项集合的迭代器。
   */
  export function iterator(ops: Op[]): Iterator {
    return new Iterator(ops);
  }

  /**
   * 返回配置项影响的长度。
   * 删除或保留直接返回设置的值；
   * 而插入操作，如果是字符串的话，则返回字符串的长度；如果是其他数据的话，则返回1。
   */
  export function length(op: Op): number {
    if (typeof op.delete === 'number') {
      return op.delete;
    } else if (typeof op.retain === 'number') {
      return op.retain;
    } else {
      return typeof op.insert === 'string' ? op.insert.length : 1;
    }
  }
}

export default Op;
