/*global describe:true,it:true */
var assert = require("assert");
var obj2schema = require("../obj2schema.js");


function assertSame(e, d, h) {
	//console.log(e, d);
	return assert.equal(JSON.stringify(e), JSON.stringify(d), h);
}

function namingConventionsSampleImpl(v, k, s /*,opt*/) {
	var typeAlreadyDetected = s.type && s.type !== "undefined" && s.type !== "null";

	if (!typeAlreadyDetected) {
		if (keyEnds("Id")) {
			s.type = "integer";
		} else if (keyEnds("Name")) {
			s.type = "string";
		}
	}
	//			if (endsWith(k, "Short")) {
	//				s.maximum = "128";
	//			}

	function keyEnds(sufix) {
		/*jshint expr:true */
		return k.lastIndexOf(sufix) + sufix.length === k.length;
	}
}

describe("json2schema", function () {
	it("empty", function () {
		var d = {};
		var e = {};
		assertSame(e, d);
	});
	it("numbers", function () {
		var d = {
			n: -1.01,
			i: 5
		};
		var e = {
			type: "object",
			additionalProperties: false,
			properties: {
				n: {
					type: "number"
				},
				i: {
					type: "integer"
				}
			}
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});
	it("strings", function () {
		var d = {
			s: "s"
		};
		var e = {
			type: "object",
			additionalProperties: false,
			properties: {
				s: {
					type: "string"
				}
			}
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});
	it("date-from-native", function () {
		var d = {
			d1: new Date()
		};
		var e = {
			type: "object",
			additionalProperties: false,
			properties: {
				d1: {
					type: "string",
					format: "date-time"
				}
			}
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});

	it("date-from-format", function () {
		var d = "2009-11-16T17:50:31+0200";
		var e = {
			type: "string",
			format: "date-time"
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});
	it("date-from-format-zullu", function () {
		var d = "2026-03-10T09:16:12Z";
		var e = {
			type: "string",
			format: "date-time"
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});
	
	it("nested-objects", function () {
		var d = {
			o: {
				s: "dos"
			}
		};
		var e = {
			type: "object",
			additionalProperties: false,
			properties: {
				o: {
					type: "object",
					additionalProperties: false,
					properties: {
						s: {
							type: "string"
						}
					}
				}
			}
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});
	it("array-of-numbers", function () {
		var d = [
			1,
			-2,
			3.78
		];
		var e = { //TODO: is this ok schema ?
			type: "array",
			additionalItems: false,
			items: {
				type: ["integer", "number"] //based on first item ! //TODO: fix
			}
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});
	it("array-nested-of-objects", function () {
		var d = {
			o: {
				s: "dos"
			},
			a: [
				{
					i: 1,
					s: "string"
				}
			]
		};
		var e = {
			type: "object",
			additionalProperties: false,
			properties: {
				o: {
					type: "object",
					additionalProperties: false,
					properties: {
						s: {
							type: "string"
						}
					}
				},
				a: {
					type: "array",
					additionalItems: false,
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							i: {
								type: "integer"
							},
							s: {
								type: "string"
							}
						}
					}
				}
			}
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});
	it("options-switches", function () {
		var d = 10;
		var e = {
			type: "number"
		};
		assertSame(e, obj2schema(d, {
			numberInteger: false,
			schemaHeader: false
			//turn off integral detection
		}));
	});
	it("options-numberPositive", function () {
		var d = 10;
		var e = {
			type: "integer",
			minimum: 0
		};
		assertSame(e, obj2schema(d, {
			numberPositive: true,
			schemaHeader: false
			//turn off integral detection
		}));
	});

	it("array-with-empty-and-populated-should-not-have-null-type", function () {
		var d = [{ "arr": [] }, { "arr": [1, 2, 3] }];
		var e = {
			type: "array",
			additionalItems: false,
			items: {
				type: "object",
				additionalProperties: false,
				properties: {
					arr: {
						type: "array",
						additionalItems: false,
						items: {
							type: "integer"
						}
					}
				}
			}
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});
	it("array-with-null-and-populated-should-have-null-type", function () {
		var d = [{ "arr": [null] }, { "arr": [1, 2, 3] }];
		var e = {
			type: "array",
			additionalItems: false,
			items: {
				type: "object",
				additionalProperties: false,
				properties: {
					arr: {
						type: "array",
						additionalItems: false,
						items: {
							type: ["null", "integer"]
						}
					}
				}
			}
		};
		assertSame(e, obj2schema(d, {
			allMandatory: false,
			schemaHeader: false
		}));
	});
	it("options-namingConventions", function () {
		var d = {
			abcId: null,
			abcName: null,
			xId: "something" //detected from data, skipped by nameing conventions
		};
		var properties = {

			abcId: {
				type: "integer"
			},
			abcName: {
				type: "string"
			},
			xId: {
				type: "string" //unchanged detected from type not name
			}
		};
		var options = {
			namingConventions: namingConventionsSampleImpl,
			allMandatory: false,
			schemaHeader: false
			//untouch is just part of this SAMPLE impl, not general rule
		};
		assertSame(properties, obj2schema(d, options).properties);

		//--------------------------------------------------------------------------------
	});
});
