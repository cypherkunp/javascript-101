const assert = require('assert');
const vowelFilter = require('./filter-vowels');

describe('vowelFilter tests', () => {
    it('should return Hll when string Hello is passed to it', () => {
        assert.equal(vowelFilter('Hello'), 'Hll');
    });
});
