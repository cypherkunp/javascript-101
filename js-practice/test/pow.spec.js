const pow = require('../quiz-tests/pow');
const assert = require('assert');

describe('test pow function', () => {
    before(() => console.log('Testing started – before all tests'));
    after(() => console.log('Testing finished – after all tests'));

    beforeEach(() => console.log('Before a test – enter a test'));
    afterEach(() => console.log('After a test – exit a test'));

    it('3 raised to 3 should be 27', () => {
        assert.equal(pow(3, 3), 27);
    });

    it('2 raised to 3 should be 8', () => {
        assert.equal(pow(2, 3), 8);
    });

    it('5 raised to 2 should be 25', () => {
        assert.equal(pow(5, 2), 25);
    });

    it('2 raised to the -1 should be 0.5', () => {
        assert.equal(pow(2, -1), 0.5);
    });

    it('-2 raised to the pow 2 should be 0.5', () => {
        assert.equal(pow(-2, 2), 4);
    });

    describe('raises x to power 3', function() {
        function makeTest(x) {
            const expected = x * x * x;
            it(`${x} in the power 3 is ${expected}`, () => {
                assert.equal(pow(x, 3), expected);
            });
        }

        for (let x = 1; x <= 5; x++) {
            makeTest(x);
        }
    });
});
