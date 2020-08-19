import Delta from '../dist/Delta';

//---------- constructor start ----------
const ops = [
  { insert: 'abc' },
  { retain: 1, attributes: { color: 'red' } },
  { delete: 4 },
  { insert: 'def', attributes: { bold: true } },
  { retain: 6 },
];

// empty
/* const delta = new Delta();
console.log(delta);
console.log(delta.ops);
console.log(delta.ops.length); */

// empty ops
/* const delta = new Delta().insert('').delete(0).retain(0);
console.log(delta);
console.log(delta.ops);
console.log(delta.ops.length); */

// array of ops
/* const delta = new Delta(ops);
console.log(delta.ops === ops); */

// delta in object form
/* const delta = new Delta({ ops: ops });
console.log(delta.ops === ops); */

// delta
// delta配置可以共用。
/* const original = new Delta(ops);
const delta = new Delta(original);
console.log(delta.ops === original.ops);
console.log(delta.ops === ops); */
//---------- constructor end ----------

//---------- insert start ----------
// insert(text)
/* const delta = new Delta().insert('test');
console.log(delta.ops.length);
console.log(delta.ops[0]); */

// insert(text, null)
/* const delta = new Delta().insert('test', null);
console.log(delta.ops.length);
console.log(delta.ops[0]); */

// insert(embed)
/* const delta = new Delta().insert(1);
console.log(delta.ops.length);
console.log(delta.ops[0]); */

// insert(embed, attributes)
/* const delta = new Delta().insert(1, {
  url: 'http://quilljs.com',
  alt: 'Quill',
});
console.log(delta.ops.length);
console.log(delta.ops[0]); */

// insert(embed) non-integer
// 可以插入对象数据。
/* const embed = { url: 'http://quilljs.com' };
const attr = { alt: 'Quill' };
const delta = new Delta().insert(embed, attr);
console.log(delta.ops.length);
console.log(delta.ops[0]); */

// insert(text, attributes)
// 第二个参数进行配置插入数据的属性。
/* const delta = new Delta().insert('test', { bold: true });
console.log(delta.ops.length);
console.log(delta.ops[0]); */

// insert(text) after delete
// 删除的优先级不比插入的优先级高
/* const delta = new Delta().delete(1).insert('a');
const expected = new Delta().insert("a").delete(1);
console.log(delta); */

// insert(text) after delete with merge
// 相同的插入操作会被合并成一个操作。
/* const delta = new Delta().insert('a').delete(1).insert('b');
const expected = new Delta().insert('ab').delete(1);
console.log(delta); */

// insert(text) after delete no merge
/* const delta = new Delta().insert(1).delete(1).insert('a');
const expected = new Delta().insert(1).insert('a').delete(1);
console.log(delta); */

// insert(text) after delete no merge
/* const delta = new Delta().insert('a').delete(1).insert(1);
const expected = new Delta().insert('a').insert(1).delete(1);
console.log(delta); */

// insert(text, {})
/* const delta = new Delta().insert('a', {});
console.log(delta); */
//---------- insert end ----------

//---------- delete start ----------
// delete(0)
/* const delta = new Delta().delete(0);
console.log(delta.ops.length); */

// delete(positive)
/* const delta = new Delta().delete(1);
console.log(delta.ops.length);
console.log(delta.ops[0]); */
//---------- delete end ----------

//---------- retain start ----------
// retain(0)
/* const delta = new Delta().retain(0);
console.log(delta.ops.length); */

// retain(length)
/* const delta = new Delta().retain(2);
console.log(delta.ops.length);
console.log(delta.ops[0]); */

// retain(length, null)
/* const delta = new Delta().retain(2, null);
console.log(delta.ops.length);
console.log(delta.ops[0]); */

// retain(length, attributes)
/* const delta = new Delta().retain(1, { bold: true });
console.log(delta.ops.length);
console.log(delta.ops[0]); */

// retain(length, {})
/* const delta = new Delta().retain(1, {}).delete(1);
console.log(delta.ops); */
//---------- retain end ----------

//---------- push start ----------

//---------- push end ----------

// 紧凑
