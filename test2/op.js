const Delta = require('../dist/Delta');
const Op = Delta.Op;

describe('Op', function () {
  describe('length()', function () {
    it('delete', function () {
      expect(Op.length({ delete: 5 })).toEqual(5);
    });
  });
});
