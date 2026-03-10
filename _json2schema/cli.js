#!/usr/bin/env node

const fs = require('fs');
const obj2schema = require('./obj2schema.js');

// Option definitions and CLI parsing
const optionDefs = [
  { name: 'numberInteger', type: 'boolean', default: true, desc: 'Treat numbers as integer if possible' },
  { name: 'numberPositive', type: 'boolean', default: true, desc: 'Numbers must be positive' },
  { name: 'numberJsMinMax', type: 'boolean', default: true, desc: 'Use JS min/max for numbers' },
  { name: 'dateTimeNative', type: 'boolean', default: true, desc: 'Use native Date type' },
  { name: 'dateTimeIsoString', type: 'boolean', default: true, desc: 'Use ISO string for Date' },
  { name: 'namingConventions', type: 'boolean', default: false, desc: 'Apply naming conventions' },
  { name: 'allMandatory', type: 'boolean', default: true, desc: 'All properties mandatory' }
];

function parseBoolean(val) {
  if (val === undefined) return true;
  if (val === 'true' || val === '1') return true;
  if (val === 'false' || val === '0') return false;
  return Boolean(val);
}

function parseArgs(args) {
  const options = {};
  for (const def of optionDefs) {
    options[def.name] = def.default;
  }
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, val] = arg.slice(2).split('=');
      const def = optionDefs.find(o => o.name.toLowerCase() === key.toLowerCase());
      if (def) {
        if (def.type === 'boolean') {
          options[def.name] = parseBoolean(val);
        }
      }
    } else if (arg.startsWith('-')) {
      // Shortcuts can be added here if needed
      if (arg === '-r') options.allMandatory = false;
    }
  }
  return options;
}

const args = process.argv.slice(2);
const options = parseArgs(args);

let buff = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buff += chunk;
});
process.stdin.on('end', () => {
  try {
    const object = JSON.parse(buff);
    const schemaObj = obj2schema(object, options);
    const schemaString = JSON.stringify(schemaObj, null, 2);
    console.log(schemaString);
  } catch (err) {
    console.error('Invalid JSON input:', err.message);
    process.exit(1);
  }
});
process.stdin.resume();
