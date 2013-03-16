#!/usr/bin/env node

var request = require('request');
var argv = require('optimist').argv;

var Branch = require('./libs/branch');
var Status = require('./libs/status');
var Resolve = require('./libs/resolve');

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

// --dcommit MOB-123 command
if (argv && argv.dcommit) {

}

