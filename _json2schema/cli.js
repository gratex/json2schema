#!/usr/bin/env node

var obj2schema = require("./obj2schema.js");

var options = { //TODO: parse from cli, inteligent !
	numberInteger: true,
	numberPositive: true,
	numberJsMinMax: true,
	dateTimeNative: true,
	dateTimeIsoString: true,
	namingConventions: false,
	allMandatory: true
};

/*global process:true */
process.argv.forEach(function (val /*, index, array*/) {
	/* basic processing of arguments */
	if (val == "-r") {
		options.allMandatory = false;
	}
});

var stream = process.stdin;
var buff = "";
stream.resume();
stream.on("data", function (chunk) {
	buff += chunk;
});
stream.on("end", function () {
	var object = JSON.parse(buff);
	var schemaObj = obj2schema(object, options);
	var schemaString = JSON.stringify(schemaObj, null, "  ");
	console.log(schemaString);
});
