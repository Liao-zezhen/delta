import AttributeMap from '../src/AttributeMap';

const a = { bold: null, italic: false, age: 20, color: undefined };
const b = { italic: false, name: 'Justin', bold: null, color: '#fff' };
// console.log(AttributeMap.compose(a, b));
console.log(AttributeMap.compose(a, b));
console.log(AttributeMap.diff(a, b));
console.log(AttributeMap.invert(a, b));
console.log(AttributeMap.transform(a, b, true));
