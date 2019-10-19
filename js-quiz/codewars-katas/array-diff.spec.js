const assert = require('assert');
const array_diff = require('./array-diff');

describe('array_diff tests', () => {
    it('array_diff([1,2,2,2,3],[2]) == [1,3]', () => {
        assert.deepEqual(array_diff([1, 2, 2, 2, 3], [2]), [1, 3]);
    });

    it('array_diff([],[2]) == []', () => {
        assert.deepEqual(array_diff([], [2]), []);
    });

    it('array_diff([1,2],[]) == [1,2]', () => {
        assert.deepEqual(array_diff([1, 2], []), [1, 2]);
    });

    it('array_diff([1,2,3],[4]) == [1,2,3]', () => {
        assert.deepEqual(array_diff([1, 2, 3], [4]), [1, 2, 3]);
    });
});
