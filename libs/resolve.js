var argv = require('optimist').argv;
var Utils = require('./utils');
var request = require('request');
var url = require('url');
var Status = require('./status');

const CONFIGS = require('../configs/config.json');
const RESOLUTION_MAP = {
  FIXED: 'Fixed'
}
function resolve(jiraId, resolution, comment) {
  resolution = resolution || RESOLUTION_MAP.FIXED;
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
            'body': comment
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
  options.headers = Utils.getAllHeaders();
  request(options, Utils.handleResponse(function(body) {
    Status.status(jiraId);
  }));
}

module.exports.resolve = resolve;