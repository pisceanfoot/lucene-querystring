var assert = require('assert');
var luceneQueryString = require('..');

describe('test complex or operator', function  () {

    it('test basic or', function(done){
        var test = {
            $or: [{
                id: 100
            },{
                id: 10
            }]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'id:100 OR id:10');
        done();
    });

    it('test complex or', function(done){
        var test = {
            $or: [{
                $and:[{
                    id:1
                },{
                    num:1
                }]
            },{
                $and:[{
                    id:2
                },{
                    num:2
                }]
            }]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, '(id:1 AND num:1) OR (id:2 AND num:2)');
        done();
    });

    it('test complex or2', function(done){
        var test = {
            $or: [{
                id:1
            },{
                $and:[{
                    id:2
                },{
                    num:2
                }]
            }]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'id:1 OR (id:2 AND num:2)');
        done();
    });

    it('test complex or3', function(done){
        var test = {
            $or: [{
                id:{
                    $gt:100
                }
            },{
                $and:[{
                    id:2
                },{
                    num:2
                }]
            }]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, 'id:[ 100 TO * ] OR (id:2 AND num:2)');
        done();
    });

    it('test complex or4', function(done){
        var test = {
            $or: [{
                id:{
                    $gt:100
                },
                num:{
                    $lt:100
                }
            },{
                $and:[{
                    id:2
                },{
                    num:2
                }]
            }]
        };

        var q = luceneQueryString.build(test);
        assert.equal(q, '(id:[ 100 TO * ] AND num:[ * TO 100 ]) OR (id:2 AND num:2)');
        done();
    });
})