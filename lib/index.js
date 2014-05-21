'use strict';
/*!
 * Dependencies
 * --------------------------------------------------------------------------*/

var fs = require('fs'),
    path = require('path'),
    semver = require('semver'),
    ejs = require('ejs'),
    _ = require('lodash');

var parseJSON = JSON.parse.bind(JSON);
var compileEjs = ejs.compile.bind(ejs);

exports = module.exports = apidocMarkdown;

var DEFAULT_TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'default.md');

/**
 * Reads the apidoc data files and returns a string representation of it passed
 * through a markdown ejs template.
 *
 * @api public
 * @param {String} dataPath The path to `api_data.json`
 * @param {String} projectPath The path to `api_project.json`
 * @param {String} [templatePath=templates/default.md] The path to the `ejs`
 * template to use
 * @param {String} [prependPath] The path to the `prepend` file - supposedly
 * used by the template to add text before the generated documentation
 * @return {String} markdown The resulting markdown string
 */

function apidocMarkdown(dataPath, projectPath, templatePath, prependPath) {
  // Read the template
  var template = readParse(compileEjs, templatePath || DEFAULT_TEMPLATE_PATH);
  // Read api_data.json
  var data = readParse(parseJSON, dataPath);
  // Read api_project.json
  var project = readParse(parseJSON, projectPath);
  // Read the prepend file (if provided)
  var prepend = prependPath && readParse(prependPath);

  var latestData = getLatestData(data);
  var fileNames = _.uniq(_.pluck(latestData, 'filename'));
  var sections = _.groupBy(_.filter(latestData, function(entry) {
    return !!entry.title;
  }), 'filename');

  var markdown = template({
    data: data, // `data` isn't necessary since `sections` are easier to handle
    project: project,
    prepend: prepend,

    files: fileNames,
    sections: sections,
    helpers: helpers,
    _: _
  });

  return markdown;
}

/**
 * Reads a file with utf8 encoding from the file system synchronously and tries
 * parsing it with a `parse` function if provided. Both reading and parsing are
 * wrapped in a try catch block, displaying a pretty error message and exit on
 * errors.
 *
 * @api private
 * @param {Function} [parse] A parsing function
 * @param {String} path A path to a file
 * @return {Mixed} The result of reading and parsing the file.
 */

var readParse = exports._readParse = function readParse(parse, path) {
  if(!path) {
    path = parse;
    parse = undefined;
  }

  var file,
      parsed;

  // Read the file
  try {
    file = fs.readFileSync(path, {
      encoding: 'utf8'
    });
  } catch(err) {
    console.error('Error reading file "' + path + '".');
    (process.env.NODE_ENV === 'development') && console.error(err);
    process.exit(1);
  }

  // Stop if no parsing function was provided
  if(!parse) {
    return file;
  }

  // Parse the file with the parsing function
  try {
    parsed = parse(file);
  } catch(err) {
    console.error('Error parsing file "' + path + '".');
    (process.env.NODE_ENV === 'development') && console.error(err);
    process.exit(1);
  }

  return parsed;
};

/**
 * Gets the latest version of a api data object representation.
 * i.e. Filters out old versions from the output of apidoc.
 *
 * @api private
 * @param {Object} data An object representation of `api_data.json`
 * @return {Object} version A filtered object with only the latest version nodes
 */

var getLatestData = exports._getLatestData = function getLatestData(data) {
  var versions = _.groupBy(data, 'version'),
      versionNumbers = _.keys(versions),
      version = latestVersion(versionNumbers);

  return versions[version];
};

/**
 * Takes an array of semantic version numbers and returns the greatest.
 *
 * @api private
 * @param {Array.<String>} versionNumbers
 * @return {String} latest
 */

var latestVersion = exports._latestVersion = function latestVersion(versionNumbers) {
  return _.reduce(versionNumbers, function(chosen, versionNumber) {
    return semver.gt(versionNumber, chosen) ? versionNumber : chosen;
  }, _.first(versionNumbers));
};

/**
 * EJS helpers to be passed into the template.
 * @type {Object}
 */

var helpers = exports._helpers = {
  /**
   * Generates a markdown link to a section, given a section `name`.
   * I'm actually not sure this regexp will work for all links.
   *
   * @param {String} name A section name
   * @return {String} link The generated link
   */

  markdownLink: function markdownLink(name) {
    return '[' + name + ']' +
           '(#' + (name || '').toLowerCase().replace(/[^\w]/g, '-') + ')';
  },

  /**
   * Helper to get an API parameters description.
   *
   * @param {Object} param An API parameter
   * @param {Boolean} [param.optional] Whether the parameter is optional
   * @param {String} [param.description] The parameter's description
   * @return {String} desc The pretty description
   */

  paramDescription: function paramDescription(param) {
    return param.optional ? '**optional** ' + (param.description || ''):
                            (param.description || '');
  }
};
