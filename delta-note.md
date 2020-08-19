[x] AttributeMap
    interface AttributeMap {
        [key: string]: any;
    }

    AttributeMap.compose(a: AttributeMap = {}, b: AttributeMap = {}, keepNull: boolean): AttributeMap | undefined;

    AttributeMap.diff(a: AttributeMap = {}, b: AttributeMap = {}): AttributeMap | undefined;

    AttributeMap.invert(attr: AttributeMap = {}, base: AttributeMap = {}): AttributeMap;

    AttributeMap.transform(a: AttributeMap | undefined, b: AttributeMap | undefined): AttributeMap | undefined;

[x] Iterator
    class Iterator {
        ops: Op[];
        index: number;
        offset: number;
        constructor(ops: Op[]);
        hasNext(): boolean;
        next(length?: number): Op;
        peek(): Op;
        peekLength(): number;
        peekType(): string;
        rest(): Op[];
    }

[x] Op
    iterface Op {
        insert?: string | Object;
        delete?: number;
        retain?: number;
        attributes?: AttributeMap;
    }
    Op.iterator(ops: Op[]): Iterator
    Op.length(op: Op): number;
    
[x] Delta
    class Delta {
        static Op = Op;
        static AttributeMap = AttributeMap;
        ops: Op[];
        constructor(ops?: Op[] | { ops: Op[] });
        insert(arg: string | object, attributes?: AttributeMap): this;
        delete(length: number): this;
        retain(length: number, attributes:? AttributeMap): this;
        push(newOp: Op): this;
        chop(): this;
        filter(predicate: (op: Op, index: number) => boolean): Op[];
        forEach(predicate: (op: Op, index: number) => void): void;
        map<T>(predicate: (op: Op, index: number) => T): T[];
        partition(predicate: (op: Op) => boolean): [Op[], Op[]];
        reduce<T>(predicate: (accum: T, curr: Op, index: number) => T, initialValue: T): T;
        changeLength(): number;
        length(): number;
        slice(start = 0, end = Infinity): Delta;
        compose(other: Delta): Delta;
        concat(other: Delta): Delta;
        diff(other: Delta, cursor?: number | diff.CursorInfo): Delta;
        eachLine(predicate: (line: Delta, attributes: AttributeMap, index: number) => boolean | void): void;
        invert(base: Delta): Delta;
        transform(index: number, priority?: boolean): number;
        transform(other: Delta, priority?: boolean): Delta;
        transform(arg: number | Delta, priority = false): typeof arg;
        transformPosition(index: number, priority = false): number;
    }

[x] builder
    [x] insert
    [x] delete
    [x] retain
    [x] push

[x] helpers
    [x] chop
    [x] filter
    [x] forEach
    [x] map
    [x] partition
    [x] reduce
    [x] changeLength
    [x] length
    [x] slice
    [x] concat
    [x] eachLine

[x] compose
* other.retain + this.insert => this.insert(other.retain)
* other.insert => this.insert
* this.delete => this.delete
* other.retain + this.retain => retain(min(other, this))
* other.retain + this.insert => this.insert(min(other, this))
* other.delete + this.retain => other.delete
* other.delete + this.insert => 不做任何操作

[x] diff
[x] invert
[x] transform
[x] transformPosition
