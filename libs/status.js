var argv = require('optimist').argv;
var sys = require('sys');
var Utils = require('./utils');
var request = require('request');
var url = require('url');
var colors = require('colors');
var Branch = require('./branch');

const CONFIGS = require('../configs/config.json');

function status(jiraId) {
  if (jiraId === true) {
    Branch.branch(true);
  } else {
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
}

function printSingleStatus(body) {
  const DASH = '------------------------------------------------------------------------------------------';
  var header = ['KEY','SUMMARY','STATUS','ASSIGNEE'];
  var key = body && body.key || '';
  var summary = (body && body.fields && body.fields.summary || '').slice(0,50);
  var status = body && body.fields && body.fields.status && body.fields.status.name;
  var assignee = body && body.fields && body.fields.assignee && body.fields.assignee.displayName;

  var headerStr = header.join('\t\t\t');
  var statusStr = [key,summary,status,assignee].join('\t\t');

  //print
  Utils.colorPrintWithStatus(status, DASH);
  Utils.colorPrintWithStatus('STATUS',headerStr);
  Utils.colorPrintWithStatus(status, statusStr);
  Utils.colorPrintWithStatus(status, DASH);
}

module.exports.status = status;