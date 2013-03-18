var fs = require('fs');
var read = require('read');
var sys = require('sys');
var exec = require('child_process').exec;

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

function handleResponse(successCallback) {
  return function(err, response, body) {
    var error;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      if (err) {
        error = err;
      } else if (response.errors) {
        error = JSON.stringify(response.errors);
      } else if (body && body.errorMessages && body.errorMessages.length > 0) {
        error = JSON.stringify(body.errorMessages);
      } else {
        error = JSON.stringify(body);
      }
    }
    if (error) {
      sys.puts('something went wrong:', error);
    } else {
      successCallback(body);
    }
  }
}

function colorPrintWithStatus(issueStatus, statusStr) {
  switch (issueStatus) {
    case 'Closed':
      sys.puts(statusStr.grey);
      break;
    case 'Open':
      sys.puts(statusStr.red);
      break;
    case 'Resolved':
      sys.puts(statusStr.green);
      break;
    case 'In Progress':
      sys.puts(statusStr.magenta);
      break;
    case 'Reopened':
      sys.puts(statusStr.yellow);
      break;
    case 'STATUS':
      sys.puts(statusStr.bold.white);
      break;
  }
}

function getBranchName(callback) {
  exec('git rev-parse --abbrev-ref HEAD', function(err, stdout){
    return callback((stdout || '').replace('\n',''));
  });
}

module.exports.getAllHeaders = getAllHeaders;
module.exports.handleResponse = handleResponse;
module.exports.colorPrintWithStatus = colorPrintWithStatus;
module.exports.getBranchName = getBranchName;