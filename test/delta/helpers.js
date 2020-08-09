const Delta = require('../../dist/Delta');

describe('helpers', function () {
  describe('concat()', function () {
    it('empty delta', function () {
      const delta = new Delta().insert('Test');
      const concat = new Delta();
      const expected = new Delta().insert('Test');
      expect(delta.concat(concat)).toEqual(expected);
    });

    it('unmergeable', function () {
      const delta = new Delta().insert('Test');
      const original = new Delta(JSON.parse(JSON.stringify(delta)));
      const concat = new Delta().insert('!', { bold: true });
      const expected = new Delta().insert('Test').insert('!', { bold: true });
      expect(delta.concat(concat)).toEqual(expected);
      expect(delta).toEqual(original);
    });

    it('mergeable', function () {
      const delta = new Delta().insert('Test', { bold: true });
      const original = new Delta(JSON.parse(JSON.stringify(delta)));
      const concat = new Delta().insert('!', { bold: true }).insert('\n');
      const expected = new Delta().insert('Test!', { bold: true }).insert('\n');
      expect(delta.concat(concat)).toEqual(expected);
      expect(delta).toEqual(original);
    });
  });

  describe('chop()', function () {
    it('retain', function () {
      const delta = new Delta().insert('Test').retain(4);
      const expected = new Delta().insert('Test');
      expect(delta.chop()).toEqual(expected);
    });

    it('insert', function () {
      const delta = new Delta().insert('Test');
      const expected = new Delta().insert('Test');
      expect(delta.chop()).toEqual(expected);
    });

    it('formatted retain', function () {
      const delta = new Delta().insert('Test').retain(4, { bold: true });
      const expected = new Delta().insert('Test').retain(4, { bold: true });
      expect(delta.chop()).toEqual(expected);
    });
  });

  describe('eachLine()', function () {
    const spy = {
      predicate: function () {
        /*  */
      },
    };

    beforeEach(function () {
      spyOn(spy, 'predicate').and.callThrough();
    });

    it('expected', function () {
      const delta = new Delta()
        .insert('Hello\n\n')
        .insert('World', { bold: true })
        .insert({ image: 'octocat.png' })
        .insert('\n', { align: 'right' })
        .insert('!');
      delta.eachLine(spy.predicate);
      expect(spy.predicate.calls.count()).toEqual(4);
      expect(spy.predicate.calls.argsFor(0)).toEqual([
        new Delta().insert('Hello'),
        {},
        0,
      ]);
      expect(spy.predicate.calls.argsFor(1)).toEqual([new Delta(), {}, 1]);
      expect(spy.predicate.calls.argsFor(2)).toEqual([
        new Delta()
          .insert('World', { bold: true })
          .insert({ image: 'octocat.png' }),
        { align: 'right' },
        2,
      ]);
      expect(spy.predicate.calls.argsFor(3)).toEqual([
        new Delta().insert('!'),
        {},
        3,
      ]);
    });

    it('trailing newline', function () {
      const delta = new Delta().insert('Hello\nWorld!\n');
      delta.eachLine(spy.predicate);
      expect(spy.predicate.calls.count()).toEqual(2);
      expect(spy.predicate.calls.argsFor(0)).toEqual([
        new Delta().insert('Hello'),
        {},
        0,
      ]);
      expect(spy.predicate.calls.argsFor(1)).toEqual([
        new Delta().insert('World!'),
        {},
        1,
      ]);
    });

    it('non-document', function () {
      const delta = new Delta().retain(1).delete(2);
      delta.eachLine(spy.predicate);
      expect(spy.predicate.calls.count()).toEqual(0);
    });

    it('early return', function () {
      const delta = new Delta().insert('Hello\nNew\nWorld!');
      let count = 0;
      const spy = {
        predicate: function () {
          if (count === 1) return false;
          count += 1;
        },
      };
      spyOn(spy, 'predicate').and.callThrough();
      delta.eachLine(spy.predicate);
      expect(spy.predicate.calls.count()).toEqual(2);
    });
  });

  describe('iteration', function () {
    beforeEach(function () {
      this.delta = new Delta()
        .insert('Hello')
        .insert({ image: true })
        .insert('World!');
    });

    it('filter()', function () {
      const arr = this.delta.filter(function (op) {
        return typeof op.insert === 'string';
      });
      expect(arr.length).toEqual(2);
    });

    it('forEach()', function () {
      const spy = {
        predicate: function () {
          /*  */
        },
      };
      spyOn(spy, 'predicate').and.callThrough();
      this.delta.forEach(spy.predicate);
      expect(spy.predicate.calls.count()).toEqual(3);
    });

    it('map()', function () {
      const arr = this.delta.map(function (op) {
        return typeof op.insert === 'string' ? op.insert : '';
      });
      expect(arr).toEqual(['Hello', '', 'World!']);
    });

    it('partition()', function () {
      const arr = this.delta.partition(function (op) {
        return typeof op.insert === 'string';
      });
      const passed = arr[0],
        failed = arr[1];
      expect(passed).toEqual([this.delta.ops[0], this.delta.ops[2]]);
      expect(failed).toEqual([this.delta.ops[1]]);
    });
  });

  describe('length()', function () {
    it('document', function () {
      const delta = new Delta().insert('AB', { bold: true }).insert(1);
      expect(delta.length()).toEqual(3);
    });

    it('mixed', function () {
      const delta = new Delta()
        .insert('AB', { bold: true })
        .insert(1)
        .retain(2, { bold: null })
        .delete(1);
      expect(delta.length()).toEqual(6);
    });
  });

  describe('changeLength()', function () {
    it('mixed', function () {
      const delta = new Delta()
        .insert('AB', { bold: true })
        .retain(2, { bold: null })
        .delete(1);
      expect(delta.changeLength()).toEqual(1);
    });
  });

  describe('slice()', function () {
    it('start', function () {
      const slice = new Delta().retain(2).insert('A').slice(2);
      const expected = new Delta().insert('A');
      expect(slice).toEqual(expected);
    });

    it('start and end chop', function () {
      const slice = new Delta().insert('0123456789').slice(2, 7);
      const expected = new Delta().insert('23456');
      expect(slice).toEqual(expected);
    });

    it('start and end multiple chop', function () {
      const slice = new Delta()
        .insert('0123', { bold: true })
        .insert('4567')
        .slice(3, 5);
      const expected = new Delta().insert('3', { bold: true }).insert('4');
      expect(slice).toEqual(expected);
    });

    it('start and end', function () {
      const slice = new Delta()
        .retain(2)
        .insert('A', { bold: true })
        .insert('B')
        .slice(2, 3);
      const expected = new Delta().insert('A', { bold: true });
      expect(slice).toEqual(expected);
    });

    it('no params', function () {
      const delta = new Delta()
        .retain(2)
        .insert('A', { bold: true })
        .insert('B');
      const slice = delta.slice();
      expect(slice).toEqual(delta);
    });

    it('split ops', function () {
      const slice = new Delta()
        .insert('AB', { bold: true })
        .insert('C')
        .slice(1, 2);
      const expected = new Delta().insert('B', { bold: true });
      expect(slice).toEqual(expected);
    });

    it('split ops multiple times', function () {
      const slice = new Delta()
        .insert('ABC', { bold: true })
        .insert('D')
        .slice(1, 2);
      const expected = new Delta().insert('B', { bold: true });
      expect(slice).toEqual(expected);
    });
  });
});
