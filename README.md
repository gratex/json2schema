# json2schema

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js version](https://img.shields.io/badge/Node.js-%3E%3D20+-green.svg)](https://nodejs.org)

Convert JSON into a [JSON Schema](https://json-schema.org/) (draft v4). Generates schema draft v4 from JSON data.

## Installation

```bash
npm install gratex/json2schema
```

Or globally to use as CLI:

```bash
npm install -g gratex/json2schema
```

## CLI Usage

```bash
cat input.json | json2schema [options]
```

Or run directly without installation:

```bash
cat input.json | node cli.js [options]
```

### Options

All options can be passed as CLI arguments using `--option=value` or `--option` (for booleans, sets to true). Boolean options can also be set to false with `--option=false`, or using `--option=1` (true) and `--option=0` (false).

| Option              | Default | Description                              |
|---------------------|---------|------------------------------------------|
| --numberInteger     | true    | Treat numbers as integer if possible     |
| --numberPositive    | true    | Numbers must be positive                 |
| --numberJsMinMax    | true    | Use JS min/max for numbers               |
| --dateTimeNative    | true    | Use native Date type                     |
| --dateTimeIsoString | true    | Use ISO string for Date                  |
| --namingConventions | false   | Apply naming conventions                 |
| --allMandatory      | true    | All properties mandatory                 |
| -r                  |         | Shortcut for --allMandatory=false        |
| -h, --help          |         | Show help message                        |

### Examples

```bash
# Basic usage
echo '{"name": "John", "age": 30}' | json2schema

# Output to file
cat input.json | json2schema > schema.json

# Make properties optional
cat input.json | json2schema -r > schema.json

# Disable integer detection
cat input.json | json2schema --numberInteger=false > schema.json
```

## Module Usage

```js
const obj2schema = require('json2schema');

// Basic usage
const schema = obj2schema({ name: 'John', age: 30 });
console.log(JSON.stringify(schema, null, 2));
// Output:
// {
//   "type": "object",
//   "additionalProperties": false,
//   "properties": {
//     "name": { "type": "string", "required": true },
//     "age": { "type": "integer", "required": true }
//   }
// }

// With options
const schema = obj2schema({ items: [1, 2, 3] }, { allMandatory: false });
console.log(JSON.stringify(schema, null, 2));
// Output:
// {
//   "type": "object",
//   "additionalProperties": false,
//   "properties": {
//     "items": {
//       "type": "array",
//       "additionalItems": false,
//       "items": { "type": "integer" }
//     }
//   }
// }
```

### Options

| Option              | Default | Description                              |
|---------------------|---------|------------------------------------------|
| numberInteger       | true    | Treat numbers as integer if possible     |
| numberPositive      | true    | Numbers must be positive                 |
| numberJsMinMax      | true    | Use JS min/max for numbers               |
| dateTimeNative      | true    | Use native Date type                     |
| dateTimeIsoString   | true    | Use ISO string for Date                  |
| namingConventions   | false   | Apply custom naming conventions          |
| allMandatory        | true    | All properties are required              |
| schemaHeader        | true    | Include JSON Schema header               |

### Custom Naming Conventions

You can provide a custom function to infer types from property names:

```js
const schema = obj2schema({
  userId: 1,
  userName: 'John'
}, {
  namingConventions: (value, key, schema) => {
    if (key.endsWith('Id')) {
      schema.type = 'integer';
    } else if (key.endsWith('Name')) {
      schema.type = 'string';
    }
  }
});
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

```

## License

[MIT](https://opensource.org/licenses/MIT) - Copyright (c)