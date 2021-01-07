function LuceneQuery() {
}

LuceneQuery.build = function (query) {
    if(!query){
        return null;
    }

    return generator(query);
};

function isNumber(num) {
  var type = typeof num;

  if (type === 'string' || num instanceof String) {
    // an empty string would be coerced to true with the below logic
    if (!num.trim()) return false;
  } else if (type !== 'number' && !(num instanceof Number)) {
    return false;
  }

  return (num - num + 1) >= 0;
}

function isString(obj) {
    return typeof obj == 'string' || obj instanceof String;
}

function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
}

function isBool(bool) {
    return typeof bool === 'boolean' || 
           (typeof bool === 'object' && 
            bool !== null            &&
           typeof bool.valueOf() === 'boolean');
}

function isDefined(obj) {
    return obj !== null && obj !== undefined;
}

function luceneValueFormat(value) {
    if(value instanceof Date){
        value = toISOString(value);

    }else if(isArray(value)){
        value.forEach(function(x, i){
            if(x instanceof Date){
                value[i] = toISOString(x);
            }
        });
    }

    return value;
}

function toISOString(date) {
   return (date && !isNaN(date.getTime())) ? date.toISOString() : null;
}

function escapeSpecialChars(s){
    if(typeof s == 'string'){
        return s.replace(/([\+\-!\(\)\{\}\[\]\^"~\*\?:\\])/g, function(match) {
            return '\\' + match;
        })
        .replace(/&&/g, '\\&\\&')
        .replace(/\|\|/g, '\\|\\|');
    }else{
        return s;
    }
}

function buildQueryField(s, prefix, not){
    var left = escapeSpecialChars(s);
    if(prefix && not){
        return left;
    }else if(not){
        return '-' + left;
    }else if(prefix){
        return prefix + left;
    }else{
        return left;
    }
}

var OPERATORS = {
    "$and": function (value, item, not) {
        if(!isArray(value)){
            value = [value];
        }
        var array = nestOperation(value, item, not);
        return array.join(' AND ');
    },
    "$or": function (value, item, not) {
        if(!isArray(value)){
            value = [value];
        }
        var array = nestOperation(value, item, not);
        return array.join(' OR ');
    },
    "$not": function (value, item, not) {
        if(!isArray(value)){
            value = [value];
        }
        var array = nestOperation(value, item, true);
        return array.join(' AND ');  
    },
    "$range": function (value, item, not) {
        return buildQueryField(item.left, null, not) + ':[ ' + value[0] +
         ' TO ' + value[1] + ' ]';
    },
    "$null": function (value, item, not) {
        var right;
        if(value){
            right = '["" TO *]';
        }else{
            right = '[* TO *]';
        }

        return buildQueryField(item.left, (value ? '-' : ''), not) + ':' + right;
    },
    "$in": function (value, item, not) {
        if(value.length == 1){
            return buildQueryField(item.left, null, not) + ':' +
             luceneValueFormat(value);
        }else{
            return buildQueryField(item.left, null, not) + ':(' + 
            luceneValueFormat(value).join(' OR ') + ')';    
        }
    }
};

OPERATORS.$range.leaf = true;
OPERATORS.$null.leaf = true;
OPERATORS.$in.leaf = true;

var RANGE_OPERATORS = {
    "$and": function (value) {
        if(value && isArray(value)){
            return value.map(parse);
        }else{
            throw Error('$and should after with array');
        }
    },
    "$or": function (value) {
        if(value && isArray(value)){
            return value.map(parse);
        }else{
            throw Error('$or should after with array');
        }
    }
};

function nestOperation(value, item, not){
    var array = [];
    value.forEach(function (statement) {
        if(isArray(statement)){
            var nestValue = nestOperation(statement, item, not);
            if(nestValue && nestValue.length){
                if(nestValue.length == 1){
                    array.push(nestValue[0]);
                }else{
                    array.push('(' + nestValue.join( ' AND ') + ')');    
                }
            }
        }
        else if(statement.op){
            var opResult = statement.op(statement.right, statement, not);
            if(opResult){
                if(statement.op.leaf){
                    array.push(opResult); 
                }else{
                    array.push('(' + opResult + ')');
                }
            }
        }else{
            if(isDefined(statement.right)){
                array.push(buildQueryField(statement.left, null, not) + ':' +
                 luceneValueFormat(statement.right));
            }
        }
    });

    return array;
}

function generator(query) {
    var queryStatement = parse(query);
    if(!queryStatement){
        return queryStatement;
    }

    var statement;
    if(isArray(queryStatement)){
        statement = OPERATORS.$and(queryStatement);
    }else if(queryStatement.op){
        statement = queryStatement.op(queryStatement.right, queryStatement);
    }else{
        statement = OPERATORS.$and(queryStatement);
    }

    return statement;   
}

function parse(query) {
    if(!query){
        return query;
    }
    if(isString(query) ||
        isNumber(query) ||
        isBool(query) ||
        query instanceof Date){
        return query;
    }

    var queryStatement = [];
    if(isArray(query)){
        return query.map(parse);
    }

    for(var key in query){
        var value = query[key];

        if(OPERATORS[key]){
            if(RANGE_OPERATORS[key]){
                queryStatement.push(appendQuery(key, RANGE_OPERATORS[key](value), 
                    OPERATORS[key]));
            }else{
                queryStatement.push(appendQuery(key, parse(value), 
                    OPERATORS[key]));
            }
        }else{
            if(isDefined(value.$gt) || isDefined(value.$lt)){
                var leftRange = (isDefined(value.$gt) && value.$gt) || '*';
                var rightRange = (isDefined(value.$lt) && value.$lt) || '*';

                queryStatement.push(appendQuery(key, [leftRange, rightRange], 
                    OPERATORS.$range));
            }
            else if(isDefined(value.$null)){
                queryStatement.push(appendQuery(key, value.$null, 
                    OPERATORS.$null));
            }
            else if (isDefined(value.$in)) {
                var values = value.$in;
                var notLeafNode = values.some(function (v) {
                    return typeof(v) == 'object' && !(v instanceof Date)
                });

                if(notLeafNode){
                    queryStatement.push(appendQuery(key, parse(values)));
                }else{
                    queryStatement.push(appendQuery(key, values, OPERATORS.$in));
                }
            }
            else{
                if(isArray(value)){
                    var notLeafNode = value.some(function (v) {
                        return typeof(v) == 'object' && !(v instanceof Date)
                    });

                    if(notLeafNode){
                        queryStatement.push(appendQuery(key, parse(value)));
                    }else{
                        queryStatement.push(appendQuery(key, value, OPERATORS.$in));
                    }
                }
                else{
                    queryStatement.push(appendQuery(key, parse(value)));
                }
            }
        }
    }

    if(queryStatement.length == 1){
        return queryStatement[0];
    }else{
        return queryStatement;    
    }
}

function appendQuery(key, value, op) {
    return {
        left: key, 
        right: value,
        op: op
    };
}

module.exports = LuceneQuery;
