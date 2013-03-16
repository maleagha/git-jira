var fs = require('fs');
var read = require('read');
var sys = require('sys');

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
    if (err || response.errors) {
      sys.puts('something went wrong:',(err ? err : response.errorMessages[0]));
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

module.exports.getAllHeaders = getAllHeaders;
module.exports.handleResponse = handleResponse;
module.exports.colorPrintWithStatus = colorPrintWithStatus;