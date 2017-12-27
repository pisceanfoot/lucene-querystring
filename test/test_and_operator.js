var assert = require('assert');
var luceneQueryString = require('..');

describe('test complex and operator', function  () {

    it('test sub and', function(done){
        var test = {
            $and: [{
                id: 100
            },{
                num: 10
            }]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'id:100 AND num:10');
        done();
    });

    it('test sub and2', function(done){
        var test = {
            $and: [{
                id: 100,
                name: 'leo'
            },{
                num: 10
            }]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, '(id:100 AND name:leo) AND num:10');
        done();
    });


    it('test sub and with sub or operator', function(done){
        var test = {
            $and: [{
                $or: [{
                    id:1
                },{
                    id:2
                }]
            },{
                $or: [{
                    num:1
                },{
                    num:2
                }]
            }]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, '(id:1 OR id:2) AND (num:1 OR num:2)');
        done();
    });
})