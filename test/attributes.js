const AttributeMap = require('../dist/Delta').AttributeMap;

describe('AttributeMap', function () {
  describe('compose()', function () {
    const attributes = { bold: true, color: 'red' };

    it('left is undefined', function () {
      expect(AttributeMap.compose(undefined, attributes)).toEqual(attributes);
    });

    it('right is undefined', function () {
      expect(AttributeMap.compose(attributes, undefined)).toEqual(attributes);
    });

    it('both are undefined', function () {
      expect(AttributeMap.compose(undefined, undefined)).toBe(undefined);
    });

    it('missing', function () {
      expect(AttributeMap.compose(attributes, { italic: true })).toEqual({
        bold: true,
        italic: true,
        color: 'red',
      });
    });

    it('overwrite', function () {
      expect(
        AttributeMap.compose(attributes, { bold: false, color: 'blue' }),
      ).toEqual({
        bold: false,
        color: 'blue',
      });
    });

    it('remove', function () {
      expect(AttributeMap.compose(attributes, { bold: null })).toEqual({
        color: 'red',
      });
    });

    it('remove to none', function () {
      expect(
        AttributeMap.compose(attributes, { bold: null, color: null }),
      ).toEqual(undefined);
    });

    it('remove missing', function () {
      expect(AttributeMap.compose(attributes, { italic: null })).toEqual(
        attributes,
      );
    });
  });

  describe('diff()', function () {
    const format = { bold: true, color: 'red' };

    it('left is undefined', function () {
      expect(AttributeMap.diff(undefined, format)).toEqual(format);
    });

    it('right is undefined', function () {
      const expected = { bold: null, color: null };
      expect(AttributeMap.diff(format, undefined)).toEqual(expected);
    });

    it('same format', function () {
      expect(AttributeMap.diff(format, format)).toEqual(undefined);
    });

    it('add format', function () {
      const added = { bold: true, italic: true, color: 'red' };
      const expected = { italic: true };
      expect(AttributeMap.diff(format, added)).toEqual(expected);
    });

    it('remove format', function () {
      const removed = { bold: true };
      const expected = { color: null };
      expect(AttributeMap.diff(format, removed)).toEqual(expected);
    });

    it('overwrite format', function () {
      const overwritten = { bold: true, color: 'blue' };
      const expected = { color: 'blue' };
      expect(AttributeMap.diff(format, overwritten)).toEqual(expected);
    });
  });

  describe('invert()', function () {
    it('attributes is undefined', function () {
      const base = { bold: true };
      expect(AttributeMap.invert(undefined, base)).toEqual({});
    });

    it('base is undefined', function () {
      const attributes = { bold: true };
      const expected = { bold: null };
      expect(AttributeMap.invert(attributes, undefined)).toEqual(expected);
    });

    it('both undefined', function () {
      expect(AttributeMap.invert()).toEqual({});
    });

    it('merge', function () {
      const attributes = { bold: true };
      const base = { italic: true };
      const expected = { bold: null };
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });

    it('null', function () {
      const attributes = { bold: null };
      const base = { bold: true };
      const expected = { bold: true };
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });

    it('replace', function () {
      const attributes = { color: 'red' };
      const base = { color: 'blue' };
      const expected = base;
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });

    it('noop', function () {
      const attributes = { color: 'red' };
      const base = { color: 'red' };
      const expected = {};
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });

    it('combined', function () {
      const attributes = {
        bold: true,
        italic: null,
        color: 'red',
        size: '12px',
      };
      const base = { font: 'serif', italic: true, color: 'blue', size: '12px' };
      const expected = { bold: null, italic: true, color: 'blue' };
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });
  });

  describe('transform()', function () {
    const left = { bold: true, color: 'red', font: null };
    const right = { color: 'blue', font: 'serif', italic: true };

    it('left is undefined', function () {
      expect(AttributeMap.transform(undefined, left, false)).toEqual(left);
    });

    it('right is undefined', function () {
      expect(AttributeMap.transform(left, undefined, false)).toEqual(undefined);
    });

    it('both are undefined', function () {
      expect(AttributeMap.transform(undefined, undefined, false)).toEqual(
        undefined,
      );
    });

    it('with priority', function () {
      expect(AttributeMap.transform(left, right, true)).toEqual({
        italic: true,
      });
    });

    it('without priority', function () {
      expect(AttributeMap.transform(left, right, false)).toEqual(right);
    });
  });
});
