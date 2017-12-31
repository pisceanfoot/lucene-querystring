# lucenequery [![Build Status](https://travis-ci.org/pisceanfoot/lucene-querystring.svg?branch=master)](https://travis-ci.org/pisceanfoot/lucene-querystring)

Convert a mongo query like object to lucene query string

Install
---------------

```
npm i lucene-querystring
```

Example
---------------

```
var lucene-querystring = require('lucene-querystring');
lucene-querystring.build({
    name: 'leo'
});

> name:leo
```


Baisc Query
-----------------

- fiter with default `and` operator

    ```
    var test = {
      name: 'leo',
      status: 'A'
    };

    var q = luceneQueryString.build(test);
    assert.equal(q, 'name:leo AND status:A');
    ```

- `in` query item in a array

    ```
    var test = {
      id: [1,2,3]
    };

    var q = luceneQueryString.build(test);
    assert.equal(q, 'id:(1 OR 2 OR 3)');
    ```

- 'range' query like from end

    ```
    var test = {
        id: {
            $gt: 100,
            $lt: 1000
        }
    };

    var q = luceneQueryString.build(test);
    assert.equal(q, 'id:[ 100 TO 1000 ]');
    ```

- `or` query

    ```
    var test = {
        $or: [{
            id: 100
        },{
            id: 10
        }]
    };

    var q = luceneQueryString.build(test);
    assert.equal(q, 'id:100 OR id:10');
    ```

- `null` or `not null`

    ```
    var test = {
        name: {
            "$null": false
        },
    };

    var q = luceneQueryString.build(test);
    assert.equal(q, 'name:[* TO *]');
    ```


Complex query
--------------------------
- complex `or` query

    ```
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
    ```

- complex `and` query

    ```
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
    ```

## Others

for other query please checkout and find in the test case.

## Test
`npm test` will run all test case in `test` folder


