var argv = require('optimist').argv;
var Utils = require('./utils');
var request = require('request');
var url = require('url');
var Status = require('./status');
var sys = require('sys');

const CONFIGS = require('../configs/config.json');

function comment(jiraId, comment) {
  if(typeof jiraId !== 'string') {
    Utils.getBranchName(function(branchName){
      comment(branchName, comment);
    });
    return;
  }
  var json = {
    'body': comment
  };
  var options = {
    url: url.format({
      host: CONFIGS.JIRA_HOST,
      protocol: 'https',
      pathname: CONFIGS.ISSUE_PATH + jiraId + '/comment'}),
    method: 'POST',
    json: json
  };
  Utils.getAllHeaders(function (headers) {
    options.headers = headers;
    request(options, Utils.handleResponse(function(body) {
      sys.puts('Comment added: ', comment);
      Status.status(jiraId);
    }));
  });
}

module.exports.comment = comment;