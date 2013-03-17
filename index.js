#!/usr/bin/env node

var request = require('request');
var Optimist = require('optimist');
var argv = Optimist
  .usage('$0: Command line tool to act as a bridge between jira and git')
  .describe('branch', 'Create a feature branch corresponding to the bug id MOB-123 and update the corresponding ' +
    'ticket to mark it as "In Progress"\n\tUsage: git-jira --branch MOB-123 \n\t       git-jira --branch status')
  .describe('status', 'Get the status of the bug Id' +
    '\n\tUsage: git-jira --status MOB-123')
  .describe('resolve', 'Resolve a bug to mark it as fixed. You can provide additional arguments --resolution and' +
    '--comment\n\tUsage: git-jira --resolve MOB-123 --comment "Fixed now" --resolution "Fixed"')
  .describe('dcommit', 'Resolves a bug with the last commit in the feature branch and closes the reviewboard ' +
    'associated.\n\tUsage: git-jira --dcommit MOB-123')
  .describe('comment', 'Adds a comment to the bug specified or the bug based on branch you are in ' +
    '\n\tUsage: git-jira --comment "Test comment" --id MOB-123')
  .argv;
var sys = require('sys');

var Branch = require('./libs/branch');
var Status = require('./libs/status');
var Resolve = require('./libs/resolve');
var Dcommit = require('./libs/dcommit');
var Comment = require('./libs/comment');

if (argv && argv.help) {
  sys.puts(Optimist.help());
}

//--branch MOB-123 command
if (argv && argv.branch) {
  Branch.branch(argv.branch);
}

//--status MOB-123 command
if (argv && argv.status) {
  Status.status(argv.status);
}

// --resolve MOB-123 command

if (argv && argv.resolve) {
  Resolve.resolve(argv.resolve, argv.resolution, argv.comment);
}

if (argv && argv.comment && !argv.resolve) {
  Comment.comment(argv.id, argv.comment);
}

// --dcommit MOB-123 command
if (argv && argv.dcommit) {
  Dcommit.dcommit();
}

