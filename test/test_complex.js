var assert = require('assert');
var luceneQueryString = require('..');

describe('test lucene query string', function  () {


    it('test 1', function(done){
        var test = {
            name: 'leo',
            id: [1,2,3],
            age: {
                "$gt": 10,
                "$lt": 100
            },
            "$or": [{
                "times":1
            },{
                "times":2
            }],
            "$not": [{times: 10},{times:100}, {b:2}]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'name:leo AND id:(1 OR 2 OR 3) AND age:[ 10 TO 100 ] AND (times:1 OR times:2) AND (-times:10 AND -times:100 AND -b:2)');

        done();
    });

    it('test 2', function(done){
        var test = {
            name: 'leo',
            find: true,
            nofound: false,
            id: [1,2,3],
            name1: {
                "$null": true
            },
            name2: {
                "$null": false
            },
            age: {
                "$gt": 10,
                "$lt": 100
            },
            "$or": [{
                "times":1,
                a:11
            },{
                "times":2,
                "value": 3
            }],
            "$not": {
                "$or":[{
                    "id": 1,
                    "age": {
                        "$gt": 10
                    }
                },{
                    "id":2
                }]
            },
            hello: [new Date('2017-01-01'),new Date('2017-01-02')],
            $and: [{
                $or: [{
                    a:1
                },{
                    a:1
                }]
            },
            {
                $or: [{
                    a:2
                },{
                    a:2
                }]
            }]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'name:leo AND find:true AND nofound:false AND id:(1 OR 2 OR 3) AND -name1:["" TO *] AND name2:[* TO *] AND age:[ 10 TO 100 ] AND ((times:1 AND a:11) OR (times:2 AND value:3)) AND (((-id:1 AND -age:[ 10 TO * ]) OR -id:2)) AND hello:(2017-01-01T00:00:00.000Z OR 2017-01-02T00:00:00.000Z) AND ((a:1 OR a:1) AND (a:2 OR a:2))');

        done();
    });
})