import Iterator from '../src/Iterator';

const iter = new Iterator([
  { insert: 2 },
  { insert: 'Hello', attributes: { bold: true } },
  { retain: 3 },
  { insert: 2, attributes: { src: 'http://quilljs.com' } },
  { delete: 4 },
]);

iter.offset = 10;
// console.log(iter.peek());

console.log(iter.next(1000));
iter.next(10000);
iter.next(10000);
iter.next(10000);
iter.next(3);
console.log(iter.rest());

/* ops
index
offset

hasNext()
peekLength()
peekType()
peek()

next(n)
rest() */
