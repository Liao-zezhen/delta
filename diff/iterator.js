import Iterator from '../src/Iterator';

const iter = new Iterator([
  {
    insert: '100',
    attributes: {
      bold: true,
    },
  },
  {
    retain: 100,
  },
  {
    insert: 20,
  },
]);

/* console.log(iter.next(2));
console.log(iter.rest()); */
/* console.log(iter.next(1));
console.log(iter.next(50));
console.log(iter.next(50)); */

// console.log(interator.next(2));

// console.log(interator.hasNext());
// console.log(iter.peekType());

// new Iterator();
