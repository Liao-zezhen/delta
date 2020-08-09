import Delta from '../src/Delta';
import diff from 'fast-diff';

// const t1 = 'good dog';
// const t2 = 'bad dog';

// console.log(t1, t2);

const t1 = 'abc';
const t2 = 'bca';

console.log(diff(t1, t2, 1));

/* const t1 = '中文123字体';
const t2 = 'a122344443'; */

// console.log(diff(t1, t2));

const a = new Delta().insert('ABC');
// const b = new Delta().insert(123123);
const b = new Delta().insert('C');

console.log(b.diff(a));
