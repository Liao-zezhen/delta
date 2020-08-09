import Delta from '../dist/Delta';
import isequal from 'lodash.isequal';
import clonedeep from 'lodash.clonedeep';

const Op = Delta.Op;

/* // Op.length()
console.log(Op.length({ delete: 10 }));
console.log(Op.length({ retain: 2 }));
console.log(Op.length({ insert: 'text' }));
console.log(Op.length({ insert: 2 }));
 */

const delta = new Delta()
  .insert('Hello', { bold: true })
  .retain(3)
  .insert(2, { src: 'http://quilljs.com/' })
  .delete(4);

// console.log(delta);

const iter = Op.iterator(delta.ops);
// const iter = Op.iterator([]);
/* console.log(iter);
console.log(iter.peekLength());
iter.next();
console.log(iter);
console.log(iter.peekLength());
iter.next();
console.log(iter);
console.log(iter.peekLength());
iter.next();
console.log(iter);
console.log(iter.peekLength()); */

/* iter.next(2);
console.log(iter);
console.log(iter.peekLength()); */

/* console.log(iter.peekType());
console.log(iter.peekLength());
console.log(iter);
iter.next();
console.log(iter.peekType());
console.log(iter.peekLength());
console.log(iter);
iter.next();
console.log(iter.peekType());
console.log(iter.peekLength());
console.log(iter);
iter.next();
console.log(iter.peekType());
console.log(iter.peekLength());
console.log(iter); */

/* for (let i = 0; i < delta.ops.length; i++) {
  //   console.log(isequal(iter.next(), delta.ops[i]));
  console.log(iter.next());
}
console.log(iter.next());
console.log(iter.next(4));
console.log(iter.next()); */

/* console.log(iter.peekLength());
console.log(iter.next(3));
console.log(iter.peekLength());
console.log(iter.next(1));
console.log(iter.peekLength());
console.log(iter.next(1));
console.log(iter.peekLength());
console.log(iter.next(1));
console.log(iter.peekLength());
console.log(iter.next(1));
console.log(iter.peekLength());
console.log(iter.next(1));
console.log(iter.peekLength());
console.log(iter.next(1));
console.log(iter.peekLength()); */

/* iter.next();
console.log(iter.rest());
iter.next(2);
console.log(iter.rest()); */
