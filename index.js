#!/usr/bin/env node

var request = require('request');
var sys = require('sys');
var exec = require('child_process').exec;
var argv = require('optimist').argv;

const JIRA_URL = 'https://jira01.corp.linkedin.com:8443/rest/api/2/issue/'
//--branch MOB-123 command
if (argv && argv.branch) {

}

//--status MOB-123 command
if (argv && argv.status) {
    var options = {
      url:JIRA_URL + argv.status,
      json:{}
    };
    request(options, function(err, response, body){
      sys.puts('ID:       ' + body.id);
      sys.puts('STATUS:   ' + body.fields.status.name);
      sys.puts('ASSIGNEE: ' + body.fields.assignee.displayName);
    });
}

// --resolve MOB-123 command
if (argv && argv.resolve) {

}

// --commit MOB-123 command
if (argv && argv.commit) {

}

// --dcommit MOB-123 command
if (argv && argv.dcommit) {

}