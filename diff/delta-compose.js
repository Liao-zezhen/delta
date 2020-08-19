// import Delta from '../dist/delta';
import Delta from '../src/Delta';

/* const a = new Delta([
  { insert: '11' },
  {
    retain: 22,
    attributes: {
      italic: true,
    },
  },
  {
    insert: '3789',
    attributes: {
      bold: true,
      italic: false,
    },
  },
  { retain: 2 },
  { insert: '4' },
  { insert: '5' },
  { insert: '612321' },
  { retain: 1 },
]);
const b = new Delta([
  {
    retain: 5,
    attributes: {
      name: 'Justin',
      bold: null,
    },
  },
  { delete: 2 },
  { insert: 'abc4' },
]);

console.log(a.compose(b)); */

/* const a = new Delta().insert('A');
const b = new Delta().insert('B');
const expected = new Delta().insert('B').insert('A');
// console.log(expected);
// 将传入的delta插入前面；
console.log(a.compose(b)); */

/* const a = new Delta().insert('A');
const b = new Delta().retain(1, { bold: true, color: 'red', font: null });
const expected = new Delta().insert('A', { bold: true, color: 'red' });
console.log(a.compose(b));
console.log(b.compose(a)); */

// console.log(new Delta().retain(1, { bold: true }).insert('a'));

/* const a = new Delta().insert('A');
const b = new Delta().delete(1);
console.log(a.compose(b)); */

/* const a = new Delta().delete(1);
const b = new Delta().insert('B');
console.log(a.compose(b)); */

/* const a = new Delta().delete(1);
const b = new Delta().retain(1, { bold: true, color: 'red' });
console.log(a.compose(b)); */

/* const a = new Delta().delete(1);
const b = new Delta().delete(1);
console.log(a.compose(b)); */

/* const a = new Delta().retain(1, { color: 'blue' });
const b = new Delta().insert('B');
console.log(a.compose(b)); */

/* const a = new Delta().retain(1, { color: 'blue', italic: false });
const b = new Delta().retain(1, { bold: true, color: 'red', font: null });
console.log(a.compose(b)); */
