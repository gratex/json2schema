# json2schema CLI

A simple command-line tool to convert JSON input into a JSON Schema using the `obj2schema` module.

## Usage

```sh
cat input.json | node _json2schema/cli.js [options]
```

### Options

All options can be passed as CLI arguments using the `--option=value` or `--option` (for booleans, sets to true) syntax. Boolean options can also be set to false with `--option=false`, or using `--option=1` (true) and `--option=0` (false).

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

#### Examples

```sh
cat input.json | node _json2schema/cli.js --numberInteger=false --allMandatory=0 > schema.json
cat input.json | node _json2schema/cli.js --numberPositive=1 --allMandatory=1 > schema.json
cat input.json | node _json2schema/cli.js -r > schema.json
```

## Extending CLI Options

You can add more CLI options by extending the `optionDefs` array and the parsing logic in [`_json2schema/cli.js`](./cli.js).

## License

MIT
