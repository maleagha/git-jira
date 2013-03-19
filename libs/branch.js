var argv = require('optimist').argv;
var exec = require('child_process').exec;
var sys = require('sys');
var request = require('request');
var url = require('url');
var colors = require('colors');
var Utils = require('./utils');
var Status = require('./status');

const CONFIGS = require('../configs/config.json');
const MAX_BRANCH_NAME_LENGTH = 40;


function branch(branch) {
  if (branch === 'status' || branch === true) {
    //print out the list of current branches and their corresponding JIRA status
    var regEx = /(MOB-\d+).*/;
    getAllBranchNames(regEx);
  } else {
    //create a branch based on the given jira ID and mark the bug as in progress.
    createBranchByJiraId(branch);
    changeStatusToInProgress(branch);
  }
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
    queryJiraByBranchIds(branchIds);
  });
}

function createBranchByJiraId(jiraId) {
  var options = {
    url:url.format({
      host:CONFIGS.JIRA_HOST,
      protocol:'https',
      pathname:CONFIGS.ISSUE_PATH + jiraId}),
    qs : {fields : 'summary,id,status,assignee,description'},
    json : {}
  };
  //first gets JIRA ticket's information
  request(options,  Utils.handleResponse(function(body) {
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
  }));
}

function changeStatusToInProgress(jiraId) {
  var json = {
    'transition': {
      'id': '4'
    }
  };
  var options = {
    url: url.format({
      host: CONFIGS.JIRA_HOST,
      protocol: 'https',
      pathname: CONFIGS.ISSUE_PATH + jiraId + '/transitions'}),
    method: 'POST',
    json: json
  };
  options.headers = Utils.getAllHeaders();
  request(options,  Utils.handleResponse(function(body) {
    Status.status(jiraId);
  }));
}

function queryJiraByBranchIds(branchIds) {
  var options = {
    url:url.format({
      host:CONFIGS.JIRA_HOST,
      protocol:'https',
      pathname:CONFIGS.SEARCH_PATH}),
    qs : {jql:buildJqlForBranchIds(branchIds),
      fields : 'summary,id,status,assignee,description'},
    json : {}
  };

  request(options,  Utils.handleResponse(function(body) {
    const HEADER = {};
    var issues = (body.issues || []);
    issues.unshift(HEADER);
    issues.forEach(printBranchStatus);

  }));
}

function buildJqlForBranchIds(branchIds) {
  (branchIds || []).forEach(function(id, index){
    branchIds[index] = 'issueKey=' + id;
  });

  return branchIds.join(' OR ');
}

function printBranchStatus(issue) {
  const SPACES = '                                                  ';
  var branchName = issue.key || 'BRANCH\t';
  var issueStatus = issue && issue.fields && issue.fields.status && issue.fields.status.name || 'STATUS';
  var issueSummary = (issue && issue.fields && issue.fields.summary || 'SUMMARY') + SPACES;
  issueSummary = issueSummary.slice(0, MAX_BRANCH_NAME_LENGTH);

  var assignee = issue && issue.fields && issue.fields.assignee && issue.fields.assignee.displayName || 'ASSIGNEE\t';
  var items = [branchName,issueSummary,assignee,issueStatus];
  var statusStr = items.join('\t\t');

  Utils.colorPrintWithStatus(issueStatus, statusStr);
}

module.exports.branch = branch;