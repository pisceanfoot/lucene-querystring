var assert = require('assert');
var luceneQueryString = require('..');

describe('basic test', function  () {

    it('test single item', function(done){
        var test = {
            name: 'leo'
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'name:leo');
        done();
    });

    it('test with default and', function(done){
        var test = {
            name: 'leo',
            status: 'A'
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'name:leo AND status:A');
        done();
    });

    it('test in', function(done){
        var test = {
            id: [1,2,3]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'id:(1 OR 2 OR 3)');
        done();
    });

    it('test $in', function(done){
        var test = {
            id: {
                $in: [1,2,3]
            }
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'id:(1 OR 2 OR 3)');
        done();
    });

    it('test id gt && lt', function(done){
        var test = {
            id: {
                $gt: 100
            }
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'id:[ 100 TO * ]');

        test = {
            id: {
                $lt: 100
            }
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'id:[ * TO 100 ]');

        test = {
            id: {
                $gt: 100,
                $lt: 1000
            }
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'id:[ 100 TO 1000 ]');

        done();
    });

    it('test with wildcard', function(done){
        var test = {
            name: 'leo*'
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'name:leo*');
        done();
    });
})