'use strict';

const serviceTest = require('coreio-service-test');
const CoreIO = require('coreio');
const MongoDBService = require('../lib/coreio-mongodb')(CoreIO);

CoreIO.setConf('mongodb', 'mongodb://localhost:27017/coreio-test');
serviceTest(MongoDBService);
