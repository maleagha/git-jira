#!/usr/bin/env node

var fs = require('fs');
var request = require('request');
var sys = require('sys');
var exec = require('child_process').exec;
var argv = require('optimist').argv;
var read = require('read');
var url = require('url');

const CONFIGS = require('./configs/config.json');
const MAX_BRANCH_NAME_LENGTH = 50;

//--branch MOB-123 command
if (argv && argv.branch) {
  if (argv.branch === 'status') {
    //print out the list of current branches and their corresponding JIRA status
    var regEx = /(MOB-\d+).*/;
    var branchIds = getAllBranchNames(regEx);
    queryJiraByBranchIds(branchIds);
  } else {
    //create a branch based on the given jira ID
    createBranchByJiraId();
  }
}

//--status MOB-123 command
if (argv && argv.status) {
  var options = {
    url:url.format({
      host:CONFIGS.JIRA_HOST,
      protocol:'https',
      pathname:CONFIGS.ISSUE_PATH + argv.status}),
    qs:{fields:'summary,id,status,assignee,description'},
    json:{}
  };
  getAllHeaders(function(headers) {
    options.headers = headers;
    request(options, function(err, response, body){
      sys.puts('---------------------------------------------');
      sys.puts('KEY:       ' + body && body.key || '');
      sys.puts('SUMMARY:  ' + body && body.fields && body.fields.summary || '');
      sys.puts('STATUS:   ' + body && body.fields && body.fields.status && body.fields.status.name);
      sys.puts('ASSIGNEE: ' + body && body.fields && body.fields.assignee && body.fields.assignee.displayName);
      sys.puts('---------------------------------------------');
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

function getAllBranchNames(regEx) {
  exec('git branch', function (err, stdout, stderr) {
    var branches = (stdout || []).split('\n');
    var branchIds = [];
    (branches || []).forEach(function (branchName) {
      var id = branchName.match(regEx) && branchName.match(regEx)[1];
      if (id) {
        branchIds.push(id);
      }
    });
    sys.puts('list of branch ids: ', branchIds);
    return branchIds;
  });
}

function createBranchByJiraId() {
  var options = {
    url:url.format({
      host:CONFIGS.JIRA_HOST,
      protocol:'https',
      pathname:CONFIGS.ISSUE_PATH + argv.branch}),
    qs : {fields : 'summary,id,status,assignee,description'},
    json : {}
  };
  //first gets JIRA ticket's information
  request(options, function (err, response, body) {
    if (err) {
      sys.puts('something went wrong:' + err);
    }
    var jiraKey = (body && body.key || '');
    var jiraSummary = body && body.fields && body.fields.summary || '';
    jiraSummary = jiraSummary.replace(/\s/g, '_');

    if (jiraSummary && jiraSummary.length > MAX_BRANCH_NAME_LENGTH) {
      jiraSummary = jiraSummary.slice(0, MAX_BRANCH_NAME_LENGTH - 5) + '_more';
    }

    var branchName = (argv.c) ? jiraKey + jiraSummary : jiraKey;
    var gitCheckoutBranchCmd = 'git checkout -b ' + branchName

    //second create a feature branch
    exec(gitCheckoutBranchCmd, function (err, stdout, stderr) {
      if (err) {
        sys.puts('something went wrong:' + err);
        sys.puts(stdout);
        sys.puts(stderr);
      } else {
        sys.puts('branch was successfully created!');
      }
    });
  });
}

function queryJiraByBranchIds(branchIds) {

}