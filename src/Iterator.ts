import Op from './Op';

/**
 * 表示一个迭代器。
 */
export default class Iterator {
  ops: Op[];

  /**
   * 当前索引指向的配置项未被处理。
   */
  index: number;

  /**
   * 对配置项的值进行偏移，可以被偏移的值为：删除、保留、插入的字符串；
   * 无法对插入非字符串的数据进行偏移。
   */
  offset: number;

  constructor(ops: Op[]) {
    this.ops = ops;
    this.index = 0;
    this.offset = 0;
  }

  /**
   * 判断当前索引的配置项是否有值。
   */
  hasNext(): boolean {
    return this.peekLength() < Infinity;
  }

  /**
   *
   * 如果传入负数会怎么样？
   */
  next(length?: number): Op {
    if (!length) {
      length = Infinity;
    }
    const nextOp = this.ops[this.index];
    if (nextOp) {
      const offset = this.offset;
      // 返回配置项的长度，如果是插入非字符串的话，始终返回1，那么无法进行偏移。
      const opLength = Op.length(nextOp);
      // 如果偏移量到达或超出边界的话，索引累加；
      if (length >= opLength - offset) {
        length = opLength - offset;
        this.index += 1;
        this.offset = 0;
      } else {
        this.offset += length;
      }
      if (typeof nextOp.delete === 'number') {
        return { delete: length };
      } else {
        const retOp: Op = {};
        if (nextOp.attributes) {
          retOp.attributes = nextOp.attributes;
        }
        if (typeof nextOp.retain === 'number') {
          retOp.retain = length;
        } else if (typeof nextOp.insert === 'string') {
          retOp.insert = nextOp.insert.substr(offset, length);
        } else {
          // offset should === 0, length should === 1
          retOp.insert = nextOp.insert;
        }
        return retOp;
      }
    } else {
      return { retain: Infinity };
    }
  }

  /**
   * 返回当前的配置项。
   */
  peek(): Op {
    return this.ops[this.index];
  }

  /**
   * 如果当前索引指向的配置项有值的话，返回该配置项的长度 - 偏移值；
   * 如果配置项没有值的话，返回Infinity。
   */
  peekLength(): number {
    if (this.ops[this.index]) {
      // Should never return 0 if our index is being managed correctly
      return Op.length(this.ops[this.index]) - this.offset;
    } else {
      return Infinity;
    }
  }

  /**
   * 获取当前索引指向的配置项的类型。
   * 如果配置项为空的话，则返回"retain"；
   * 如果删除有值的话，返回"delete"；（优先级最高）
   * 如果保留有值的话，返回"retain"；（优先级次之）
   * 否则返回insert；
   */
  peekType(): string {
    if (this.ops[this.index]) {
      // 删除优先。
      if (typeof this.ops[this.index].delete === 'number') {
        return 'delete';
      } else if (typeof this.ops[this.index].retain === 'number') {
        return 'retain';
      } else {
        return 'insert';
      }
    }
    return 'retain';
  }

  /**
   * 返回剩余（未被处理过）的配置项。
   */
  rest(): Op[] {
    if (!this.hasNext()) {
      return [];
    } else if (this.offset === 0) {
      return this.ops.slice(this.index);
    } else {
      // 保存偏移值和索引。
      const offset = this.offset;
      const index = this.index;
      // 获取偏移值以后的数据。
      const next = this.next();
      const rest = this.ops.slice(this.index);
      // 还原偏移值和索引。
      this.offset = offset;
      this.index = index;
      // 返回剩余（未被处理过）的配置项。
      return [next].concat(rest);
    }
  }
}
