var exec = require('child_process').exec;
var sys = require('sys');

function closeReviewBoard(callback) {
  //TODO change this to use rb rest API
  exec('git-review status', function(err, stdout, stderr){
    if (err) {
      sys.puts('Something went wrong: ', err);
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

module.exports.closeReviewBoard = closeReviewBoard;