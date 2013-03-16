var argv = require('optimist').argv;
var Utils = require('./utils');
var request = require('request');
var url = require('url');

const CONFIGS = require('../configs/config.json');

function resolveIssue(jiraId, resolution, comment) {
  if (resolution) {
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
  if (comment) {
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
      pathname: CONFIGS.ISSUE_PATH + jiraId + '/transitions'}),
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

function resolve() {
  resolveIssue(argv.resolve, argv.resolution, argv.comment);

}

module.exports.resolve = resolve;
module.exports.resolveIssue = resolveIssue;