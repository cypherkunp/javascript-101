process.env.NODE_ENV = 'test';
const assert = require('assert');
const merge = require('../quiz-tests/sorting/merge-sort');
console.log(merge);

describe('merge function', () => {
    it('should be able to merge two arrays sorted in ascending order', () => {
        const left = [1, 3, 5, 7];
        const right = [2, 4, 6, 8, 7, 9];
        const expectedSortedArray = [1, 2, 3, 4, 5, 6, 7, 7, 8, 9];
        const mergeSortedArray = merge(left, right);
        assert.strictEqual(mergeSortedArray, expectedSortedArray);
    });
});
