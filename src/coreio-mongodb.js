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

let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectId;
let log = require('logtopus').getLogger('coreio');

module.exports = function(CoreIO) {
  class MongoDBService extends CoreIO.Service {
    constructor(conf) {
      super();
      this.conn = null;
      this.colName = conf.name;
    }

    connect() {
      let dbConf = CoreIO.getConf('mongodb');
      log.sys('Conenct MongoDBService', dbConf);
      return MongoClient.connect(dbConf).then(db => {
        this.conn = db;
      });
    }

    then(fn) {
      return this.connect().then(fn);
    }

    fetch(query) {
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

    insert(data) {
      let col = this.conn.collection(this.colName);
      if (Array.isArray(data)) {
        log.info('Insert many items into MongoDB', data);
        return col.insertMany(data).then(res => {
          log.info('... succesfully inserted!');
          return res.insertedIds.map(item => item.toString())
        }).catch(err => {
          log.error('... insert failed!', err);
          return err;
        });
      }
      else {
        log.sys('Insert an item into MongoDB', data);
        return col.insertOne(data).then(res => {
          log.sys('... succesfully inserted!');
          return res.insertedId.toString()
        }).catch(err => {
          log.error('... insert failed!', err);
          return err;
        });
      }
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
