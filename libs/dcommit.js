var argv = require('optimist').argv;
var exec = require('child_process').exec;
var sys = require('sys');
var Utils = require('./utils');
var Resolve = require('./resolve');
var Comment = require('./comment');
var CodeReview = require('./codeReview');

function dcommit() {
  if (argv.s === true) {
    dcommitAndClose();
  } else {
    dcommitAndUpdate();
  }
}

function dcommitAndUpdate() {
  CodeReview.reviewBoardStatus(function(err, rbStatus){
    getLastGitCommit(function(err, lastCommitLog){
      if (!err && lastCommitLog) {
        if (rbStatus) {
          //if there is any review board information add it to the comments
          lastCommitLog += '\n\n';
          lastCommitLog += 'Review Board Status:\n';
          lastCommitLog += rbStatus;
        }
        //get the branch name
        if(typeof argv.dcommit === 'string') {
          Comment.comment(argv.dcommit, lastCommitLog);
        } else {
          Utils.getBranchName(function(branchName){
            Comment.comment(branchName, lastCommitLog);
          })
        }
      }
    });
  });
}

function dcommitAndClose() {
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
          lastCommitLog += 'Review Board Status:\n';
          lastCommitLog += rb;
        }
        //get the branch name
        if(typeof argv.dcommit === 'string') {
          Resolve.resolve(argv.dcommit, undefined, lastCommitLog);
        } else {
          Utils.getBranchName(function(branchName){
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

module.exports.dcommit = dcommit;