var argv = require('optimist').argv;
var sys = require('sys');
var Utils = require('./utils');
var request = require('request');
var url = require('url');

const CONFIGS = require('../configs/config.json');

function status(jiraId) {
  var options = {
    url:url.format({
      host:CONFIGS.JIRA_HOST,
      protocol:'https',
      pathname:CONFIGS.ISSUE_PATH + jiraId}),
    qs:{fields:'summary,id,status,assignee,description'},
    method: 'GET',
    json:{}
  };
  Utils.getAllHeaders(function(headers) {
    options.headers = headers;
    request(options, function(err, response, body){
      printSingleStatus(body);
    });
  });
}

function printSingleStatus(body) {
  sys.puts('---------------------------------------------');
  sys.puts('KEY:       ' + body && body.key || '');
  sys.puts('SUMMARY:  ' + body && body.fields && body.fields.summary || '');
  sys.puts('STATUS:   ' + body && body.fields && body.fields.status && body.fields.status.name);
  sys.puts('ASSIGNEE: ' + body && body.fields && body.fields.assignee && body.fields.assignee.displayName);
  sys.puts('---------------------------------------------');
}

module.exports.status = status;