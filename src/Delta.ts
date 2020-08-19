import diff from 'fast-diff';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import AttributeMap from './AttributeMap';
import Op from './Op';

const NULL_CHARACTER = String.fromCharCode(0); // Placeholder char for embed in diff()

class Delta {
  static Op = Op;
  static AttributeMap = AttributeMap;

  ops: Op[];

  /**
   * 对空配置项做处理，默认为[]。
   */
  constructor(ops?: Op[] | { ops: Op[] }) {
    // Assume we are given a well formed ops
    if (Array.isArray(ops)) {
      this.ops = ops;
    } else if (ops != null && Array.isArray(ops.ops)) {
      this.ops = ops.ops;
    } else {
      this.ops = [];
    }
  }

  /**
   * 插入数据。
   * 对空字符串和空属性集合做处理。
   */
  insert(arg: string | object, attributes?: AttributeMap): this {
    const newOp: Op = {};
    // 插入空字符串，不做任何操作，直接返回实例。
    if (typeof arg === 'string' && arg.length === 0) {
      return this;
    }
    newOp.insert = arg;

    // attributes必须要有属性，才能被设置。
    if (
      attributes != null &&
      typeof attributes === 'object' &&
      Object.keys(attributes).length > 0
    ) {
      newOp.attributes = attributes;
    }
    return this.push(newOp);
  }

  /**
   * 删除操作。
   * 删除长度小于1的话，不做任何操作。
   */
  delete(length: number): this {
    if (length <= 0) {
      return this;
    }
    return this.push({ delete: length });
  }

  /**
   * 保留操作。
   * 保留长度小于1的话，不做任何操作。
   * 对空属性集合做处理。
   */
  retain(length: number, attributes?: AttributeMap): this {
    if (length <= 0) {
      return this;
    }
    const newOp: Op = { retain: length };
    if (
      attributes != null &&
      typeof attributes === 'object' &&
      Object.keys(attributes).length > 0
    ) {
      newOp.attributes = attributes;
    }
    return this.push(newOp);
  }

  /**
   * 如果前后两个配置项都是删除，合并删除操作；
   * 如果在删除操作之后插入数据的话，需要将插入操作放在删除操作之前，并向上调整最后一个配置项；
   * 如果前后两个配置项都是保留或者插入字符串的操作，并且属性集合一致的话，合并这些操作。
   *
   * * 合并删除
   * * 调整插入与删除的顺序
   * * 合并插入（相同属性集合，都是字符串）
   * * 合并保留（相同属性集合）
   */
  push(newOp: Op): this {
    let index = this.ops.length;
    let lastOp = this.ops[index - 1];
    newOp = cloneDeep(newOp);
    if (typeof lastOp === 'object') {
      // 如果最后一个配置项与新增的配置项都是delete操作的话，那么合并delete操作。
      if (
        typeof newOp.delete === 'number' &&
        typeof lastOp.delete === 'number'
      ) {
        this.ops[index - 1] = { delete: lastOp.delete + newOp.delete };
        return this;
      }
      // Since it does not matter if we insert before or after deleting at the same index,
      // always prefer to insert first
      // 如果在删除操作之后插入数据的话，需要将插入操作放在删除操作之前。
      if (typeof lastOp.delete === 'number' && newOp.insert != null) {
        index -= 1;
        lastOp = this.ops[index - 1];
        // 如果配置项不符合规则或者达到起始边界，那 prepend newOp;
        if (typeof lastOp !== 'object') {
          this.ops.unshift(newOp);
          return this;
        }
      }
      // 如果上一个配置项的属性集合与新增的属性集合一致的话。
      if (isEqual(newOp.attributes, lastOp.attributes)) {
        if (
          typeof newOp.insert === 'string' &&
          typeof lastOp.insert === 'string'
        ) {
          // 如果最后一个配置项和新增的配置项都是插入操作，并且数据都是字符串的话，合并两个插入操作。
          this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
          if (typeof newOp.attributes === 'object') {
            this.ops[index - 1].attributes = newOp.attributes;
          }
          return this;
        } else if (
          // 都是保留操作。
          typeof newOp.retain === 'number' &&
          typeof lastOp.retain === 'number'
        ) {
          // 如果最后一个配置项和新增的配置项都是保留操作的话，那么合并两个保留操作。
          this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
          if (typeof newOp.attributes === 'object') {
            this.ops[index - 1].attributes = newOp.attributes;
          }
          return this;
        }
      }
    }

    // 插入数据。
    if (index === this.ops.length) {
      // xxx 如果配置项集合没有数据的话，直接将数据推进集合中。
      this.ops.push(newOp);
    } else {
      // xxx 否则在指定索引处，插入配置项。
      this.ops.splice(index, 0, newOp);
    }
    return this;
  }

  /**
   * 如果最后一个配置项的操作是保留，并且不设置任何属性集合的话，那么抛弃这个操作。
   */
  chop(): this {
    // 如果最后一个配置项的操作是保留，并且不设置任何属性集合的话，那么抛弃这个操作。
    const lastOp = this.ops[this.ops.length - 1];
    if (lastOp && lastOp.retain && !lastOp.attributes) {
      this.ops.pop();
    }
    return this;
  }

  filter(predicate: (op: Op, index: number) => boolean): Op[] {
    return this.ops.filter(predicate);
  }

  forEach(predicate: (op: Op, index: number) => void): void {
    this.ops.forEach(predicate);
  }

  map<T>(predicate: (op: Op, index: number) => T): T[] {
    return this.ops.map(predicate);
  }

  /**
   * 对配置项集合分类。
   */
  partition(predicate: (op: Op) => boolean): [Op[], Op[]] {
    const passed: Op[] = [];
    const failed: Op[] = [];
    this.forEach((op) => {
      const target = predicate(op) ? passed : failed;
      target.push(op);
    });
    return [passed, failed];
  }

  reduce<T>(
    predicate: (accum: T, curr: Op, index: number) => T,
    initialValue: T,
  ): T {
    return this.ops.reduce(predicate, initialValue);
  }

  /**
   * 计算配置项影响的长度。
   * 插入则累加插入的数据长度；
   * 删除则累减删除的长度；
   */
  changeLength(): number {
    return this.reduce((length, elem) => {
      if (elem.insert) {
        return length + Op.length(elem);
      } else if (elem.delete) {
        return length - elem.delete;
      }
      return length;
    }, 0);
  }

  /**
   * 计算配置项的操作长度。
   */
  length(): number {
    return this.reduce((length, elem) => {
      return length + Op.length(elem);
    }, 0);
  }

  /**
   * 对配置项集合进行切片；
   * 以配置项的长度进行累加；
   * 不支持负数。
   */
  slice(start = 0, end = Infinity): Delta {
    const ops = [];
    const iter = Op.iterator(this.ops);
    let index = 0;
    while (index < end && iter.hasNext()) {
      let nextOp;
      if (index < start) {
        // 跳过start之前的操作；
        nextOp = iter.next(start - index);
      } else {
        // 开始对集合切割；
        nextOp = iter.next(end - index);
        ops.push(nextOp);
      }
      index += Op.length(nextOp);
    }
    return new Delta(ops);
  }

  /**
   * 当前的配置项集合与传入的配置项集合合并，不会影响两者原有的数据；
   * 合并顺序：
   * other.retain + this.insert => this.insert(other.retain)
   * other.insert => other.insert
   * this.delete => this.delete
   * other.retain + this.retain => retain(min(other, this))
   * other.retain + this.insert => this.insert(min(other, this))
   * other.delete + this.retain => other.delete
   * other.delete + this.insert => 不做任何操作
   */
  compose(other: Delta): Delta {
    // 分别获取配置项的迭代器。
    const thisIter = Op.iterator(this.ops);
    const otherIter = Op.iterator(other.ops);

    const ops = [];

    // 获取其他配置项集合的第一个配置项；
    const firstOther = otherIter.peek();

    // 如果其他配置项集合的第一个配置项的操作是retain，并且没有设置属性集合的话。
    if (
      firstOther != null &&
      typeof firstOther.retain === 'number' &&
      firstOther.attributes == null
    ) {
      // 保留的个数。
      let firstLeft = firstOther.retain;

      // 优先处理other.retain + curr.insert；
      // 原配置项集合的当前配置项如果是插入操作的话，
      // 并且该配置项的长度小于或等于保留的个数。
      //
      // 不处理配置项的长度大于保留个数的配置项；
      while (
        thisIter.peekType() === 'insert' &&
        thisIter.peekLength() <= firstLeft
      ) {
        firstLeft -= thisIter.peekLength();
        ops.push(thisIter.next());
      }
      // firstOther.retain - firstLeft 计算保留了多少位的数据。
      if (firstOther.retain - firstLeft > 0) {
        otherIter.next(firstOther.retain - firstLeft);
      }
    }

    const delta = new Delta(ops);

    // 两个配置项集合都有数据。
    while (thisIter.hasNext() || otherIter.hasNext()) {
      // 优先执行其他配置项集合的插入操作。
      if (otherIter.peekType() === 'insert') {
        delta.push(otherIter.next());
        // 次之执行原配置项集合的删除操作。
      } else if (thisIter.peekType() === 'delete') {
        delta.push(thisIter.next());
      } else {
        // 原配置项和其他配置项的操作长度取最小值；

        // otherIter.retain
        // thisIter.insert => insert
        // thisIter.retain => retain

        // otherIter.delete
        // thisIter.retain => otherIter.delete
        // thisIter.insert => 不做任何操作

        // 取最短的操作长度。
        const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
        const thisOp = thisIter.next(length);
        const otherOp = otherIter.next(length);

        // 其他配置项的保留操作。
        if (typeof otherOp.retain === 'number') {
          const newOp: Op = {};

          // 判断操作的类型，并保存数据。
          if (typeof thisOp.retain === 'number') {
            newOp.retain = length;
          } else {
            newOp.insert = thisOp.insert;
          }

          // Preserve null when composing with a retain, otherwise remove it for inserts
          // 当retain操作的话，保留null，如果是insert的话，则移除null。
          const attributes = AttributeMap.compose(
            thisOp.attributes,
            otherOp.attributes,
            typeof thisOp.retain === 'number',
          );
          if (attributes) {
            newOp.attributes = attributes;
          }

          delta.push(newOp);

          // Optimization if rest of other is just retain
          // 如果其他配置集合没有数据的话，并且当前数据中最后数据不包含删除操作的话，就合并剩余的原配置项。
          if (
            !otherIter.hasNext() &&
            isEqual(delta.ops[delta.ops.length - 1], newOp)
          ) {
            const rest = new Delta(thisIter.rest());
            return delta.concat(rest).chop();
          }
          // Other op should be delete, we could be an insert or retain
          // Insert + delete cancels out
        } else if (
          typeof otherOp.delete === 'number' &&
          typeof thisOp.retain === 'number'
        ) {
          // 保留删除操作。
          delta.push(otherOp);
        }

        // 如果不被以上程序执行的话，意味着被遍历到的数据不被保存，如：原配置项的插入 + 其他配置项的删除。
      }
    }

    return delta.chop();
  }

  /**
   * 合并其他delta的配置项集合。
   * 对其他delta的第一个配置项push处理；
   */
  concat(other: Delta): Delta {
    const delta = new Delta(this.ops.slice());
    if (other.ops.length > 0) {
      delta.push(other.ops[0]);
      delta.ops = delta.ops.concat(other.ops.slice(1));
    }
    return delta;
  }

  /**
   * 与传入的delta匹配不相同；
   * 使用fast-diff匹配当前delta插入的字符串和传入delta的字符串的差异；
   * 然后将diff的结果转化成delta格式的数据。
   */
  diff(other: Delta, cursor?: number | diff.CursorInfo): Delta {
    // 如果配置项相等的话，返回空的配置项。
    if (this.ops === other.ops) {
      return new Delta();
    }
    const strings = [this, other].map((delta) => {
      return delta
        .map((op) => {
          // 插入操作，非字符串的数据返回空字符串；
          // 使用NULL_CHARACTER作为字符串的话，length会计数为1。
          if (op.insert != null) {
            return typeof op.insert === 'string' ? op.insert : NULL_CHARACTER;
          }
          // diff()不允许非insert的操作。
          const prep = delta === other ? 'on' : 'with';
          throw new Error('diff() called ' + prep + ' non-document');
        })
        .join('');
    });

    const retDelta = new Delta();
    const diffResult = diff(strings[0], strings[1], cursor);
    const thisIter = Op.iterator(this.ops);
    const otherIter = Op.iterator(other.ops);

    // 将diff的结果转化成delta格式的数据。
    diffResult.forEach((component: diff.Diff) => {
      let length = component[1].length;
      while (length > 0) {
        let opLength = 0;
        switch (component[0]) {
          case diff.INSERT:
            opLength = Math.min(otherIter.peekLength(), length);
            // 将diff中的插入数据推入配置项集合中。
            retDelta.push(otherIter.next(opLength));
            break;
          case diff.DELETE:
            opLength = Math.min(length, thisIter.peekLength());
            // 推入一个删除个数为 diff中删除的字符串长度 的操作；
            thisIter.next(opLength);
            retDelta.delete(opLength);
            break;
          case diff.EQUAL:
            opLength = Math.min(
              thisIter.peekLength(),
              otherIter.peekLength(),
              length,
            );
            const thisOp = thisIter.next(opLength);
            const otherOp = otherIter.next(opLength);

            if (isEqual(thisOp.insert, otherOp.insert)) {
              // 保留相同字符串的长度。
              retDelta.retain(
                opLength,
                AttributeMap.diff(thisOp.attributes, otherOp.attributes),
              );
            } else {
              // 插入非字符串的数据，有可能不相同；
              // 可能出现的场景，分别插入非字符串的数据，但数据有所不同。
              retDelta.push(otherOp).delete(opLength);
            }
            break;
        }
        length -= opLength;
      }
    });
    return retDelta.chop();
  }

  /**
   * 读取插入文本的每一行。
   */
  eachLine(
    predicate: (
      line: Delta,
      attributes: AttributeMap,
      index: number,
    ) => boolean | void,
    newline = '\n',
  ): void {
    // 当前的配置项集合的迭代器。
    const iter = Op.iterator(this.ops);

    let line = new Delta();
    let i = 0;
    while (iter.hasNext()) {
      // 不是插入操作的话，则不执行后续操作。
      if (iter.peekType() !== 'insert') {
        return;
      }
      const thisOp = iter.peek();
      const start = Op.length(thisOp) - iter.peekLength();
      const index =
        typeof thisOp.insert === 'string'
          ? thisOp.insert.indexOf(newline, start) - start
          : -1;
      if (index < 0) {
        // 如果插入的文本中没有换行符或者插入的不是文本的话，执行下一个操作；
        line.push(iter.next());
      } else if (index > 0) {
        // 执行到换行处；
        line.push(iter.next(index));
      } else {
        if (predicate(line, iter.next(1).attributes || {}, i) === false) {
          return;
        }
        i += 1;
        line = new Delta();
      }
    }
    if (line.length() > 0) {
      predicate(line, {}, i);
    }
  }

  /**
   * 基于base返回原数据的反转数据，不影响原数据。
   *
   * 插入操作变成删除操作；
   * 保留操作但没有配置属性，则还是保留操作，并且推进base的索引；
   * 删除操作或保留操作带有属性，则根据操作长度去匹配base的数据（注意base数据操作的多样性，可能需要分段处理）；
   *  删除操作的话，则保留base中，长度为「删除操作所影响长度」的数据，包括属性集合；
   *  保留操作带有属性的话，则保留「保留长度」的长度，原数据的属性要与base数据的属性做一次反转处理；!!! 只有这种情况才需要将属性集合做一次反转处理；
   */
  invert(base: Delta): Delta {
    const inverted = new Delta();
    this.reduce((baseIndex, op) => {
      if (op.insert) {
        // 如果是插入的话，则变成删除。
        inverted.delete(Op.length(op));
      } else if (op.retain && op.attributes == null) {
        // 如果是保留操作，并且没有配置属性，则还是保留操作不变，并且推进base的索引。
        inverted.retain(op.retain);
        return baseIndex + op.retain;
      } else if (op.delete || (op.retain && op.attributes)) {
        // 如果是删除操作，或者是保留操作中带有属性值，
        const length = (op.delete || op.retain) as number;
        const slice = base.slice(baseIndex, baseIndex + length);

        slice.forEach((baseOp) => {
          if (op.delete) {
            // 如果是删除操作的话，直接将base数据推入。
            inverted.push(baseOp);
          } else if (op.retain && op.attributes) {
            // 如果是保留操作的话，那么保留base数据的影响长度；
            console.log(baseOp.attributes);
            inverted.retain(
              Op.length(baseOp),
              AttributeMap.invert(op.attributes, baseOp.attributes),
            );
          }
        });

        // 推进base的索引。
        return baseIndex + length;
      }
      return baseIndex;
    }, 0);
    return inverted.chop();
  }

  /* 
  this.insert，优先级高或者other不是insert，保留this.insert的长度；
  other.insert => other.insert

  this.delete => x
  other.delete => other.delete
  this.retain和other.retain => 保留保留的长度
  */
  transform(index: number, priority?: boolean): number;
  transform(other: Delta, priority?: boolean): Delta;
  transform(arg: number | Delta, priority = false): typeof arg {
    // 默认为false；
    priority = !!priority;

    if (typeof arg === 'number') {
      return this.transformPosition(arg, priority);
    }

    const other: Delta = arg;
    const thisIter = Op.iterator(this.ops);
    const otherIter = Op.iterator(other.ops);
    const delta = new Delta();

    while (thisIter.hasNext() || otherIter.hasNext()) {
      if (
        thisIter.peekType() === 'insert' &&
        (priority || otherIter.peekType() !== 'insert')
      ) {
        delta.retain(Op.length(thisIter.next()));
      } else if (otherIter.peekType() === 'insert') {
        delta.push(otherIter.next());
      } else {
        const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
        const thisOp = thisIter.next(length);
        const otherOp = otherIter.next(length);

        // 如果两个操作包含一个删除操作的话，那么抛弃掉其他的操作；
        // 如果是this.delete的话，那么抛弃两者的操作；

        if (thisOp.delete) {
          // Our delete either makes their delete redundant or removes their retain
          continue;
        } else if (otherOp.delete) {
          delta.push(otherOp);
        } else {
          // We retain either their retain or insert
          delta.retain(
            length,
            AttributeMap.transform(
              thisOp.attributes,
              otherOp.attributes,
              priority,
            ),
          );
        }
      }
    }

    return delta.chop();
  }

  /**
   * 给定位置，计算出经过操作后的位置。
   * @param index {number} 未操作前的位置；
   * @param priority {boolean} 设置为false的话，会计算新增的位置；设置为true的话，不会计算新增的位置；
   * @description
   * 增加操作，在给定的位置中增加增加的长度；
   * 删除操作，在给定的位置中减少删除的长度，超出边界的话，则减少到达边界的步数即可；
   */
  transformPosition(index: number, priority = false): number {
    priority = !!priority;
    const thisIter = Op.iterator(this.ops);
    let offset = 0;

    while (thisIter.hasNext() && offset <= index) {
      const length = thisIter.peekLength();
      const nextType = thisIter.peekType();

      thisIter.next();
      if (nextType === 'delete') {
        // 删除操作，index递减；
        // index - offset 到达边界的步数。
        // 每一次删除都需要判断是否超出边界，没有超出边界的话，则删除的长度，如果超出去的话，则仅删除剩余的步数即可。
        index -= Math.min(length, index - offset);
        continue;
      } else if (nextType === 'insert' && (offset < index || !priority)) {
        // 如果优先级高的话，不处理超出范围的插入；

        // 插入操作，index递增；
        index += length;
      }

      // 删除操作，offset不推进。
      offset += length;
    }
    return index;
  }
}

export = Delta;
