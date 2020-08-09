const AttributeMap = require('../dist/Delta').AttributeMap;

// compose()
// null置空
// undefined 无效
/* const attributes = { bold: true, color: 'red' };
console.log(AttributeMap.compose(undefined, attributes));
console.log(AttributeMap.compose(attributes, undefined));
console.log(AttributeMap.compose(undefined, undefined));
console.log(AttributeMap.compose(attributes, { italic: true }));
console.log(AttributeMap.compose(attributes, { bold: false, color: 'blue' }));
console.log(AttributeMap.compose(attributes, { bold: null }));
console.log(AttributeMap.compose(attributes, { bold: null, color: null }));
console.log(AttributeMap.compose(attributes, { italic: null })); */

// diff()
// undefined => null
// left <= right
/* const format = { bold: true, color: 'red' };
const added = { bold: true, italic: true, color: 'red' };
const removed = { bold: true };
const overwritten = { bold: true, color: 'blue' };
console.log(AttributeMap.diff(undefined, format));
console.log(AttributeMap.diff(format, undefined));
console.log(AttributeMap.diff(format, format));
console.log(AttributeMap.diff(format, added));
console.log(AttributeMap.diff(format, removed));
console.log(AttributeMap.diff(format, overwritten)); */

// invert()
// undefined => null
// 值相同的抵消
// left <= right
/* console.log(AttributeMap.invert(undefined, { bold: true }));
console.log(AttributeMap.invert({ bold: true }, undefined));
console.log(AttributeMap.invert());
console.log(AttributeMap.invert({ bold: null }, { italic: true }));
console.log(AttributeMap.invert({ bold: null }, { bold: true }));
console.log(AttributeMap.invert({ color: 'red' }, { color: 'blue' }));
console.log(AttributeMap.invert({ color: 'red' }, { color: 'red' }));
console.log(
  AttributeMap.invert(
    {
      bold: true,
      italic: null,
      color: 'red',
      size: '12px',
    },
    {
      font: 'serif',
      italic: true,
      color: 'blue',
      size: '12px',
    },
  ),
); */

// transform()
// 意义何在
/* const left = { bold: true, color: 'red', font: null };
const right = { color: 'blue', font: 'serif', italic: true };

console.log(AttributeMap.transform(undefined, left, false));
console.log(AttributeMap.transform(left, undefined, false));
console.log(AttributeMap.transform(undefined, undefined, false));
// right中的属性在left中是undefined就保留。
console.log(AttributeMap.transform(left, right, true));
console.log(AttributeMap.transform(left, right, false)); // ? */
