var assert = require('assert');
var luceneQueryString = require('..');

describe('test null operator', function  () {

    it('test not null', function(done){
        var test = {
            name: {
                "$null": false
            },
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'name:[* TO *]');
        done();
    });

    it('test null', function(done){
        var test = {
            name: {
                "$null": true
            },
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, '-name:["" TO *]');
        done();
    });
})