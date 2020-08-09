const Delta = require('../../dist/Delta');

describe('diff()', function () {
  it('insert', function () {
    const a = new Delta().insert('A');
    const b = new Delta().insert('AB');
    const expected = new Delta().retain(1).insert('B');
    expect(a.diff(b)).toEqual(expected);
  });

  it('delete', function () {
    const a = new Delta().insert('AB');
    const b = new Delta().insert('A');
    const expected = new Delta().retain(1).delete(1);
    expect(a.diff(b)).toEqual(expected);
  });

  it('retain', function () {
    const a = new Delta().insert('A');
    const b = new Delta().insert('A');
    const expected = new Delta();
    expect(a.diff(b)).toEqual(expected);
  });

  it('format', function () {
    const a = new Delta().insert('A');
    const b = new Delta().insert('A', { bold: true });
    const expected = new Delta().retain(1, { bold: true });
    expect(a.diff(b)).toEqual(expected);
  });

  it('object attributes', function () {
    const a = new Delta().insert('A', {
      font: { family: 'Helvetica', size: '15px' },
    });
    const b = new Delta().insert('A', {
      font: { family: 'Helvetica', size: '15px' },
    });
    const expected = new Delta();
    expect(a.diff(b)).toEqual(expected);
  });

  it('embed integer match', function () {
    const a = new Delta().insert(1);
    const b = new Delta().insert(1);
    const expected = new Delta();
    expect(a.diff(b)).toEqual(expected);
  });

  it('embed integer mismatch', function () {
    const a = new Delta().insert(1);
    const b = new Delta().insert(2);
    const expected = new Delta().delete(1).insert(2);
    expect(a.diff(b)).toEqual(expected);
  });

  it('embed object match', function () {
    const a = new Delta().insert({ image: 'http://quilljs.com' });
    const b = new Delta().insert({ image: 'http://quilljs.com' });
    const expected = new Delta();
    expect(a.diff(b)).toEqual(expected);
  });

  it('embed object mismatch', function () {
    const a = new Delta().insert({
      image: 'http://quilljs.com',
      alt: 'Overwrite',
    });
    const b = new Delta().insert({ image: 'http://quilljs.com' });
    const expected = new Delta()
      .insert({ image: 'http://quilljs.com' })
      .delete(1);
    expect(a.diff(b)).toEqual(expected);
  });

  it('embed object change', function () {
    const embed = { image: 'http://quilljs.com' };
    const a = new Delta().insert(embed);
    embed.image = 'http://github.com';
    const b = new Delta().insert(embed);
    const expected = new Delta()
      .insert({ image: 'http://github.com' })
      .delete(1);
    expect(a.diff(b)).toEqual(expected);
  });

  it('embed false positive', function () {
    const a = new Delta().insert(1);
    const b = new Delta().insert(String.fromCharCode(0)); // Placeholder char for embed in diff()
    const expected = new Delta().insert(String.fromCharCode(0)).delete(1);
    expect(a.diff(b)).toEqual(expected);
  });

  it('error on non-documents', function () {
    const a = new Delta().insert('A');
    const b = new Delta().retain(1).insert('B');
    expect(function () {
      a.diff(b);
    }).toThrow();
    expect(function () {
      b.diff(a);
    }).toThrow();
  });

  it('inconvenient indexes', function () {
    const a = new Delta()
      .insert('12', { bold: true })
      .insert('34', { italic: true });
    const b = new Delta().insert('123', { color: 'red' });
    const expected = new Delta()
      .retain(2, { bold: null, color: 'red' })
      .retain(1, { italic: null, color: 'red' })
      .delete(1);
    expect(a.diff(b)).toEqual(expected);
  });

  it('combination', function () {
    const a = new Delta()
      .insert('Bad', { color: 'red' })
      .insert('cat', { color: 'blue' });
    const b = new Delta()
      .insert('Good', { bold: true })
      .insert('dog', { italic: true });
    const expected = new Delta()
      .insert('Good', { bold: true })
      .delete(2)
      .retain(1, { italic: true, color: null })
      .delete(3)
      .insert('og', { italic: true });
    expect(a.diff(b)).toEqual(expected);
  });

  it('same document', function () {
    const a = new Delta().insert('A').insert('B', { bold: true });
    expected = new Delta();
    expect(a.diff(a)).toEqual(expected);
  });

  it('immutability', function () {
    const attr1 = { color: 'red' };
    const attr2 = { color: 'red' };
    const a1 = new Delta().insert('A', attr1);
    const a2 = new Delta().insert('A', attr1);
    const b1 = new Delta().insert('A', { bold: true }).insert('B');
    const b2 = new Delta().insert('A', { bold: true }).insert('B');
    const expected = new Delta()
      .retain(1, { bold: true, color: null })
      .insert('B');
    expect(a1.diff(b1)).toEqual(expected);
    expect(a1).toEqual(a2);
    expect(b2).toEqual(b2);
    expect(attr1).toEqual(attr2);
  });

  it('non-document', function () {
    const a = new Delta().insert('Test');
    const b = new Delta().delete(4);
    expect(function () {
      a.diff(b);
    }).toThrow(new Error('diff() called on non-document'));
  });
});
