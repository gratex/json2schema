/*global module:true */
var deepmerge = require("deepmerge");

module.exports = object2Schema;

function flat(arr) {
    // use Array.flat, keed backward compatible
    return arr.reduce((acc, val) => acc.concat(val), []);
}

// correct types
function correctType(destination, sources, key) {
    if (Object.prototype.toString.call(destination) == '[object Object]') {
        Object.keys(destination).forEach(function(k) {
            const validSources = sources.map((i) => i && i[k] != null ? i[k] : undefined).filter(s => s !== undefined);
            if (validSources.length > 0) {
                destination[k] = correctType(destination[k], validSources, k);
            } else if (k === "type" && destination[k] !== undefined) {
                // If no valid sources for 'type', and destination already has a type, it means it was inferred from an empty object.
                // This type should be removed.
                delete destination[k];
            }
        });
    }

    if (key == "type") {
        var newTypes = flat(sources).filter((s, index, srcs) => {
            return srcs.indexOf(s) == index;
        });
        return newTypes.length == 1 ? newTypes[0] : newTypes;
    }

    return destination;
}
// summary:
//		very first draft of obj2json-schema generator
var DEFAULT_OPTIONS = {
    schemaHeader: true,
    numberInteger: true,
    numberPositive: false, //sets minimum to 0 for positive numbers
    numberJsMinMax: false, //TODO: implement ranges
    allMandatory: true, // default value, to generate all prop as required
    dateTimeNative: true,
    dateTimeIsoString: true,
    namingConventions: false
};

function getType(o) {
    //https://github.com/garycourt/JSV/blob/master/lib/jsv.js
    // TODO: optimize
    return o === undefined ? "undefined" : (o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase());
}

var DATE_TIME_EXPR = /^\d{3,4}-[01]?\d-[0-3]?\d(T[0-2]?\d:[0-5]?\d:[0-5]?\d(\.\d+)?([+-][0-2]?\d:?[0-5]?\d|Z))?$/;

function traverse(v, k, s, opts) { //TODO: rewrite to traverse/visitor
    opts = Object.assign({}, DEFAULT_OPTIONS, opts);
    /*jshint expr:true */
    s || (s = {});
    var t = s.type = getType(v);

    // gen manadatory
    if (opts.allMandatory) {
        s.required = true;
    }

    var props;
    if (t === "array") {
        props = s.additionalItems = false;
        var items = [];
        v.forEach(function(item) {
            // If item is null, we still want to process it to include 'null' type
            // if (item == null) {
            //     return;
            // }
            var c = {};
            items.push(c);
            traverse(item, null, c, opts);
        });

        if (items.length > 1) { // if multiple items, try to merge
            s.items = correctType(deepmerge.all(items), items, null);
            // echo '[{a:"aaa"},{a:20,c:30}]' | js2json | json2schema
            // deepmerged prop a returns string, but it should be resolved as ["string","integer"]
            // fix type issue
        } else {
            s.items = items.length == 1 ? items[0] : {};
        }
    } else if (t === "object") {
        s.additionalProperties = false;
        props = s.properties = {};
        for (var p in v) {
            traverse(v[p], p, props[p] = {}, opts);
        }

        // TODO extract, create helper
        if (Object.keys(v).length == 2 && "value" in v && "currency" in v) {
            s.format = "$currency";
        }
    }
    //TODO: how to make this extendable, beyond options, only example in unit-test, 
    // do not put this into code here !!! (aspect ?, beware recursion)
    else if (t === "number") {
        if (opts.numberInteger && v % 1 === 0) {
            s.type = "integer";
        }
        if (opts.numberPositive && v > 0) {
            s.minimum = 0;
        }
    } else if (t === "date") { //extreme condition from real native object, not JSON.parse-d object
        if (opts.dateTimeNative) {
            s.type = "string";
            s.format = "date-time";
        } else {
            s.type = "object";
        }
    } else if (t === "string") {
        if (opts.dateTimeIsoString && v && v.trim() !== "" && v.length >= 7) { // v.length > 7,shortest supported date is 999-1-1                        
            s.type = "string";
            var m;
            if (m = v.match(DATE_TIME_EXPR)) {
                var hasTimePart = !!m[1]; // time group
                s.format = hasTimePart ? "date-time" : "date";
            }
        }
    } else if (opts.namingConventions) {
        opts.namingConventions(v, k, s, opts);
    }

    return s;
}

function object2Schema(value, options) {
    // add header
    var obj = options.schemaHeader ? {
        "$schema": "http://json-schema.org/draft-03/schema#",
        "id": "http://json-schema.org/draft-03/schema#"
    } : {};

    var schema = traverse(value, null, obj, options);
    if (schema && schema.required) {
        delete schema.required;
    }
    return schema;
}
object2Schema._getType = getType; //just for unit tests, not ment to be used
object2Schema.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
