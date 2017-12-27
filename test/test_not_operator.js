var assert = require('assert');
var luceneQueryString = require('..');

describe('test not operator', function  () {

    it('test basic not', function(done){
        var test = {
            "$not": {times: 10, id:10},
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, '-times:10 AND -id:10');
        done();
    });
})