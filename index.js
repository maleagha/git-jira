#!/usr/bin/env node

var fs = require('fs');
var request = require('request');
var sys = require('sys');
var exec = require('child_process').exec;
var argv = require('optimist').argv;
var read = require('read');

const JIRA_URL = 'https://jira01.corp.linkedin.com:8443/rest/api/2/issue/'
//--branch MOB-123 command
if (argv && argv.branch) {

}

//--status MOB-123 command
if (argv && argv.status) {
  var options = {
    url:JIRA_URL + argv.status,
    method: 'GET',
    json:{}
  };
  getAllHeaders(function(headers) {
    options.headers = headers;
    request(options, function(err, response, body){
      sys.puts('ID:       ' + body.id);
      sys.puts('STATUS:   ' + body.fields.status.name);
      sys.puts('ASSIGNEE: ' + body.fields.assignee.displayName);
    });
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

function getAllHeaders(callback) {
  var headers = {};
  headers['Content-Type'] = 'application/json';
  getAuthorizationHeader(function(authenticationHeader) {
    headers['Authorization'] = authenticationHeader;
    callback(headers);
  });
}

function getHeaderData(authenticationString) {
  return ('Basic ' + new Buffer(authenticationString).toString('base64'));
}

function getAuthorizationHeader(callback) {
  var authenticationString = '';
  var filename = './.git/info/.git-jira';
  if (!fs.existsSync(filename)) {
    getUserNamePassword(function(username, password) {
      var authenticationString = username + ':' + password;
      fs.writeFileSync(filename, authenticationString);
      callback(getHeaderData(authenticationString));
    });
  } else {
    authenticationString = fs.readFileSync(filename);
    callback(getHeaderData(authenticationString));
  }
}

function getUserNamePassword(callback) {
  var username = '';
  var password = '';
  if (process && process.env && process.env['USER']) {
    username = process.env['USER'];
  } else {
    throw "No USER variable set in Environment";
  }
  read({ prompt: 'Password: ', silent: true }, function(err, data) {
    if (err) {
      throw err;
    }
    password = data;
    callback(username, password);
  });
}