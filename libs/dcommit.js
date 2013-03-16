var argv = require('optimist').argv;
var exec = require('child_process').exec;
var sys = require('sys');
var Utils = require('./utils');
var Resolve = require('./resolve');
var CodeReview = require('./codeReview');


function dcommit() {
  CodeReview.closeReviewBoard(function(err, rb){
    if(err) {
      if (err === 'pending') {
        sys.puts('The code review is still pending.','dcommit aborted');
        return;
      }
      sys.puts('Something went wrong while closing the review', err);
    }

    getLastGitCommit(function(err, lastCommitLog){
      if (!err && lastCommitLog) {
        if (rb) {
          //if there is any review board information add it to the comments
          lastCommitLog += '\n\n';
          lastCommitLog += rb;
        }
        //get the branch name
        if(typeof argv.dcommit === 'string') {
          Resolve.resolve(argv.dcommit, undefined, lastCommitLog);
        } else {
          getBranchName(function(branchName){
            Resolve.resolve(branchName, undefined, lastCommitLog);
          })
        }
      }
    });
  });
}

function getLastGitCommit(callback) {
  exec('git log --name-status HEAD~1..HEAD', function(err, stdout, stderr){
    sys.puts(err, stdout);
    return callback(err, stdout);
  });
}

function getBranchName(callback) {
  exec('git rev-parse --abbrev-ref HEAD', function(err, stdout){
    return callback((stdout || '').replace('\n',''));
  });
}


module.exports.dcommit = dcommit;