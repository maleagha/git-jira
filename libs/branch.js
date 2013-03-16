var argv = require('optimist').argv;
var exec = require('child_process').exec;
var sys = require('sys');
var request = require('request');
var url = require('url');
var colors = require('colors');

const CONFIGS = require('../configs/config.json');
const MAX_BRANCH_NAME_LENGTH = 60;


function branch() {
  if (argv.branch === 'status') {
    //print out the list of current branches and their corresponding JIRA status
    var regEx = /(MOB-\d+).*/;
    getAllBranchNames(regEx);
  } else {
    //create a branch based on the given jira ID
    createBranchByJiraId();
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
    //sys.puts('list of branch ids: ', branchIds);
    queryJiraByBranchIds(branchIds);
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
  var options = {
    url:url.format({
      host:CONFIGS.JIRA_HOST,
      protocol:'https',
      pathname:CONFIGS.SEARCH_PATH}),
    qs : {jql:buildJqlForBranchIds(branchIds),
      fields : 'summary,id,status,assignee,description'},
    json : {}
  };

  request(options, function (err, response, body) {
    if(err) {
      sys.puts('Sorry, something went wrong!',err);
      return;
    }
    const HEADER = {};
    var issues = (body.issues || []);
    issues.unshift(HEADER);
    issues.forEach(printBranchStatus);

  });
}

function buildJqlForBranchIds(branchIds) {
  (branchIds || []).forEach(function(id, index){
    branchIds[index] = 'issueKey=' + id;
  });

  return branchIds.join(' OR ');
}

function printBranchStatus(issue) {
  const SPACES = '                                                            ';
  var branchName = issue.key || 'BRANCH\t';
  var issueStatus = issue && issue.fields && issue.fields.status && issue.fields.status.name || 'STATUS';
  var issueSummary = (issue && issue.fields && issue.fields.summary || 'SUMMARY') + SPACES;
  issueSummary = issueSummary.slice(0, MAX_BRANCH_NAME_LENGTH);

  var assignee = issue && issue.fields && issue.fields.assignee && issue.fields.assignee.displayName || 'ASSIGNEE';
  var items = [branchName,issueSummary,assignee,issueStatus];
  var statusStr = items.join('\t\t');

  switch(issueStatus) {
    case 'Closed':
      sys.puts(statusStr.grey);
      break;
    case 'Open':
      sys.puts(statusStr.red);
      break;
    case 'Resolved':
      sys.puts(statusStr.green);
      break;
    case 'STATUS':
      sys.puts(statusStr.bold.white);
      break;
  }
}

module.exports.branch = branch;