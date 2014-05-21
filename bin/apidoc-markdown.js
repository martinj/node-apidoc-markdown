#!/usr/bin/env node
'use strict';
var fs = require('fs'),
    path = require('path'),
    optimist = require('optimist'),
    apidocMarkdown = require('..');

var join = path.join;

var argv = optimist
  .usage('Generate markdown documentation from apidoc data.' + '\n' +
         'Usage: apidoc-markdown -p [path] -o [output file]')
  .demand(['output'])
  .alias({
    'path': 'p',
    'output': 'o',
    'template': 't'
  })
  .describe({
    path: 'Path to generated apidoc output. Where api_data.json & api_project.json resides.',
    output: 'Output file to write.',
    template: 'Path to EJS template file, if not specified the default template will be used.',
    prepend: 'Prepend file after TOC'
  }).argv;

var apidocRoot = argv.path || join(process.cwd(), 'doc');

var dataPath = join(apidocRoot, 'api_data.json'),
    templatePath = argv.template,
    projectPath = join(apidocRoot, 'api_project.json'),
    prependPath = argv.prepend;

var markdown = apidocMarkdown(dataPath, projectPath, templatePath, prependPath);

fs.writeFileSync(argv.output, markdown);
console.log('Wrote apidoc-markdown to: ' + argv.output);
