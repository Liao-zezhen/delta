import AttributeMap from '../src/AttributeMap';

/* const a = { bold: '123', count: 10 };
const b = { bold: null, italic: false };

const res = AttributeMap.compose(a, b);
console.log(res); */

/* const a = { bold: false, count: 20 };
const b = { bold: false, count: 30 };

const res = AttributeMap.diff(a, b);
console.log(res); */

/* const a = { bold: false, count: 20, name: 'Justin' };
const b = { bold: false, count: 30 };

const res = AttributeMap.invert(a, b);
console.log(res); */

const a = { name: 'Justin' };
const b = { name: 'Justin', count: 30 };
const res = AttributeMap.transform(a, b, true);
console.log(res);
