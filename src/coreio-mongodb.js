'use strict';

/**
 * CoreIO mongodb service
 *
 * @module CoreIO Services
 * @submodule MongoDBService
 *
 * @example {js}
 * let MongoService = require('coreio-mongodb');
 * let CoreIO = require('coreio');
 *
 * let model = CoreIO.createModel('mymodel', {
 * 	 service: MongoService;
 * });
 *
 * model.set('value', 'fof-puff');
 * yield model.save(); // stores data in a MongoDB
 *
 * yield model.fetch('foo'); // load model from a MongoDB
 * console.log('Foo:', model.get('value')); // prints fof-puff
 *
 */

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const log = require('logtopus').getLogger('coreio');
const co = require('co');

module.exports = function(CoreIO) {
  class MongoDBService extends CoreIO.Service {
    constructor(conf) {
      super();
      this.conn = null;
      this.colName = conf.name;
    }

    connect() {
      let dbConf = CoreIO.getConf('mongodb');

      if (this.conn) {
        return Promise.resolve(this.conn);
      }

      log.sys('Conenct MongoDBService', dbConf);
      return MongoClient.connect(dbConf).then(db => {
        this.conn = db;
      });
    }

    then(fn) {
      return this.connect().then(fn);
    }

    findOne(query) {
      let col = this.conn.collection(this.colName);
      log.info('Fetch items from MongoDB', query);

      if (typeof query === 'string' || typeof query === 'number') {
        query = {
          _id: ObjectId(query)
        }
      };

      return col.findOne(query).then(res => {
        if (res === null) {
          return null;
        }

        res.id = res._id.toString();
        delete res._id;
        return res;
      });
    }

    find(query) {
      let col = this.conn.collection(this.colName);
      log.info('Find items in MongoDB', query);

      if (typeof query === 'string' || typeof query === 'number') {
        query = {
          _id: ObjectId(query)
        }
      };

      return col.find(query).then(res => {
        if (res === null) {
          return null;
        }

        res.id = res._id.toString();
        delete res._id;
        return res;
      });
    }

    insert(data) {
      return co(function*() {
        const db = yield this.connect();
        let col = db.collection(this.colName);
        if (Array.isArray(data)) {
          log.info('Insert many items into MongoDB', data);
          const res = yield col.insertMany(data);
          log.info('... succesfully inserted!');
          return res.insertedIds.map(item => item.toString());
        }
        else {
          log.sys('Insert an item into MongoDB', data);
          const res = yield col.insertOne(data);
          log.sys('... succesfully inserted!');
          return res.insertedId.toString();
        }
      }.bind(this));
    }

    update(id, data) {
      let col = this.conn.collection(this.colName);
      if (Array.isArray(data)) {
        log.sys('Update many items in a MongoDB', data);
        let updatedItems = [];
        data.forEach((item) => {
          let query = {
            _id: ObjectId(item.id)
          };

          delete item.id;
          updatedItems.push(col.updateOne(query, { $set: item }).then(res => {
            return res.updatedIds.map(item => item.toString())
          }));
        });

        return Promise.all(updatedItems);
      }
      else {
        log.sys('Update an item in a MongoDB', data);
        let query = {
          _id: ObjectId(id)
        };
        delete data.id;
        return col.updateOne(query, { $set: data }).then(res => {
          return res.modifiedCount ? id : null;
        });
      }
    }

    remove(id) {
      let col = this.conn.collection(this.colName);
      return col.deleteOne({
        _id: ObjectId(id)
      }).then(res => {
        return res.deletedCount ? id : null;
      });
    }
  }

  return MongoDBService;
};
