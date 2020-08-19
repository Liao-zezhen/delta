import Delta from '../src/Delta'; // 1

/* const delta = new Delta().insert('A');
console.log(delta.transform(2)); */

/* const delta = new Delta().retain(2).insert('A');
console.log(delta.transform(1)); */

/* const delta = new Delta().retain(2).insert('A');
console.log(delta.transform(2, true));
console.log(delta.transform(2, false)); */

/* const delta = new Delta().delete(2);
console.log(delta.transform(4)); */

/* const delta = new Delta().retain(4).delete(2);
console.log(delta.transform(2)); */

/* const delta = new Delta().retain(1).delete(4);
console.log(delta.transform(2)); */

/* const delta = new Delta().retain(2).insert('A').delete(2);
console.log(delta.transform(4)); */

/* const delta = new Delta().retain(2).insert('A').delete(4);
console.log(delta.transform(4)); */

/* const delta = new Delta().delete(1).retain(1).delete(4);
console.log(delta.transform(4)); */

/* const a1 = new Delta().insert('A');
const b1 = new Delta().insert('B');
const a2 = new Delta(a1);
const b2 = new Delta(b1);

console.log(a1.transform(b1, true));
console.log(a2.transform(b2, false)); */

/* const a = new Delta().insert('A');
const b = new Delta().retain(1, { bold: true, color: 'red' });
console.log(a.transform(b, true)); */

/* const a = new Delta().insert('A');
const b = new Delta().delete(1);
console.log(a.transform(b, true)); */

/* const a = new Delta().delete(1);
const b = new Delta().insert('B');
console.log(a.transform(b, true)); */

/* const a = new Delta().delete(1);
const b = new Delta().retain(1, { bold: true, color: 'red' });
console.log(a.transform(b, true)); */

/* const a = new Delta().delete(1);
const b = new Delta().delete(1);
console.log(a.transform(b, true)); */

/* const a = new Delta().retain(1, { color: 'blue' });
const b = new Delta().insert('B');
console.log(a.transform(b, true)); */

/* const a1 = new Delta().retain(1, { color: 'blue' });
const b1 = new Delta().retain(1, { bold: true, color: 'red' });
console.log(a1.transform(b1, true)); */

/* const a2 = new Delta().retain(1, { color: 'blue' });
const b2 = new Delta().retain(1, { bold: true, color: 'red' });
console.log(b2.transform(a2, true)); */

/* const a1 = new Delta().retain(1, { color: 'blue' });
const b1 = new Delta().retain(1, { bold: true, color: 'red' });
const a2 = new Delta().retain(1, { color: 'blue' });
const b2 = new Delta().retain(1, { bold: true, color: 'red' });
console.log(a1.transform(b1, false));
console.log(b2.transform(a2, false)); */

/* const a = new Delta().retain(1, { color: 'blue' });
const b = new Delta().delete(1);
console.log(a.transform(b, true)); */

/* const b1 = new Delta().retain(1).insert('e').delete(5).retain(1).insert('ow');
const a1 = new Delta().retain(2).insert('si').delete(5);
console.log(a1.transform(b1, false)); */

/* const a2 = new Delta(a1);
const b2 = new Delta(b1);
console.log(b2.transform(a2, false)); */

/* const a1 = new Delta().retain(3).insert('aa');
const b1 = new Delta().retain(3).insert('bb');
const a2 = new Delta(a1);
const b2 = new Delta(b1);
console.log(a1.transform(b1, true));
console.log(b2.transform(a2, false)); */

/* const a1 = new Delta().insert('aa');
const b1 = new Delta().retain(3).insert('bb');
const a2 = new Delta(a1);
const b2 = new Delta(b1);
console.log(a1.transform(b1, false));
console.log(b2.transform(a2, false)); */

/* const a1 = new Delta().retain(2).delete(1);
const b1 = new Delta().delete(3);
const a2 = new Delta(a1);
const b2 = new Delta(b1);
console.log(a1.transform(b1, false));
console.log(b2.transform(a2, false)); */

/* const a1 = new Delta().insert('A');
// const a2 = new Delta().insert('A');
const b1 = new Delta().insert('B');
// const b2 = new Delta().insert('B');
console.log(a1.transform(b1, true)); */
/* expect(a1).toEqual(a2);
expect(b1).toEqual(b2); */
