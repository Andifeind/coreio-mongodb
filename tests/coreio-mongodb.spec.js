'use strict';

let serviceTest = require('coreio-service-test');
let CoreIO = require('coreio');
let MongoDBService = require('../lib/coreio-mongodb')(CoreIO);

CoreIO.setConf('mongodb', 'mongodb://localhost:27017/coreio-test');
serviceTest(MongoDBService);
