var argv = require('optimist').argv;
var Utils = require('./utils');
var request = require('request');
var url = require('url');
var Status = require('./status');

const CONFIGS = require('../configs/config.json');

function resolve(jiraId, resolution, comment) {
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
      if (err || body.errors) {
        sys.puts('something went wrong:',(err ? err : body.errorMessages[0]));
        return;
      }
      Status.status(jiraId);
    });
  });
}

module.exports.resolve = resolve;