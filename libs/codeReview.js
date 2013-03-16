var exec = require('child_process').exec;
var sys = require('sys');

function closeReviewBoard(callback) {
  //TODO change this to use rb rest API
  exec('git-review status', function(err, stdout, stderr){
    if (err) {
      sys.puts('Something went wrong: ', err);
      return callback(err);
    } else {
      //close the review board if there is any
      exec('git-review dcommit -s', function(err, stdout, stderr){
        return callback(err, stdout);
      });
    }
  });
}

module.exports.closeReviewBoard = closeReviewBoard;