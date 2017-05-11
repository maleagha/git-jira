var exec = require('child_process').exec;
var util = require('util');

function closeReviewBoard(callback) {
  //TODO change this to use rb rest API
  exec('git-review status', function(err, stdout, stderr){
    if (err) {
      util.puts('Something went wrong: ', err);
      return callback(err);
    } else if (stdout.indexOf('pending review by') != -1) {
      return callback('pending');
    }
    else {
      var rbStatus = stdout || '';
      //close the review board if there is any
      exec('git-review dcommit -s', function(err, stdout, stderr){
        rbStatus += '\n\n';
        rbStatus += stdout;

        return callback(err, rbStatus);
      });
    }
  });
}

function reviewBoardStatus(callback) {
  exec('git-review status', function(err, stdout, stderr){
    if (err) {
      util.puts('Something went wrong while getting rb status: ', err);
      return callback(err);
    }
    var rbStatus = stdout || '';
    callback(null, rbStatus);
  });
}

module.exports.closeReviewBoard = closeReviewBoard;
module.exports.reviewBoardStatus = reviewBoardStatus;