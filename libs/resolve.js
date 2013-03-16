var argv = require('optimist').argv;
var Utils = require('./utils');
var request = require('request');
var url = require('url');

const CONFIGS = require('../configs/config.json');

function resolve() {
  var resolution = "Fixed";
  if (argv.resolution) {
    resolution = argv.resolution;
  }
  json = {
    'fields': {
      'resolution': {
        'name': resolution
      }
    },
    'transition': {
      'id': '5'
    }
  };
  if (argv.comment) {
    json.update = {
      'comment': [
        {
          'add': {
            'body': argv.comment
          }
        }
      ]
    };
  }
  var options = {
    url: url.format({
      host: CONFIGS.JIRA_HOST,
      protocol: 'https',
      pathname: CONFIGS.ISSUE_PATH + argv.resolve + '/transitions'}),
    method: 'POST',
    json: json
  };
  Utils.getAllHeaders(function (headers) {
    options.headers = headers;
    request(options, function (err, response, body) {
      console.log(err);
      console.log(response.statusCode);
      console.log(body);
    });
  });
}

module.exports.resolve = resolve;