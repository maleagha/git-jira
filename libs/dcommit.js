var argv = require('optimist').argv;
var exec = require('child_process').exec;
var sys = require('sys');
var request = require('request');
var url = require('url');
var colors = require('colors');
var Utils = require('./utils');
var Resolve = require('./resolve');

const CONFIGS = require('../configs/config.json');

function dcommit() {

  //TODO change this to use rb rest API
  //make sure git-review is available
  exec('git-review status', function(err, stdout, stderr){
    if (err) {
      sys.puts('Something went wrong: ', err);
      //try to grab the last comment and put it as JIRA comment
      getLastGitCommit(function(err, lastCommitLog){
       if (!err && lastCommitLog) {
         Resolve.resolve(argv.dcommit, undefined, lastCommitLog);
       }
      });

    } else {
      //1. close the review board if they have it
      exec('git-review dcommit -s', function(err, stdout, stderr){


        //2. resolve JIRA ticket with a comment including:
        // a) RB link and id
        // b) commit's comment + log
        getLastGitCommit(function(err, lastCommitLog){
          if (!err && lastCommitLog) {
            Resolve.resolve(argv.dcommit, undefined, lastCommitLog);
          }
        });
      });
    }
  });



}

function getLastGitCommit(callback) {
  exec('git log --name-status HEAD~1..HEAD', function(err, stdout, stderr){
    sys.puts(err, stdout);
    return callback(err, stdout);
  });
}


module.exports.dcommit = dcommit;