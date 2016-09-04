'use strict';

/**
 * CoreIO
 * @param  {[type]} 'mongodb' [description]
 * @return {[type]}           [description]
 */
let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectId;

module.exports = function(CoreIO) {
  class MongoDBService {
    constructor(conf) {
      this.conn = null;
      this.colName = conf.name;
    }

    connect() {
      return MongoClient.connect(CoreIO.getConf('mongodb')).then(db => {
        this.conn = db;
      });
    }

    then(fn) {
      return this.connect().then(fn);
    }

    fetch(id) {
      let col = this.conn.collection(this.colName);
      return col.findOne({
        _id: ObjectId(id)
      }).then(res => {
        res.id = res._id.toString();
        delete res._id;
        return res;
      });
    }

    insert(data) {
      let col = this.conn.collection(this.colName);
      if (Array.isArray(data)) {
        return col.insertMany(data).then(res => {
          return res.insertedIds.map(item => item.toString())
        });
      }
      else {
        return col.insertOne(data).then(res => {
          return res.insertedId.toString()
        });
      }
    }

    update(id, data) {
      let col = this.conn.collection(this.colName);
      if (Array.isArray(data)) {
        let updatedItems = [];
        data.forEach((item) => {
          let query = {
            _id: ObjectId(item.id)
          };

          delete item.id;
          updatedItems.push(col.updateOne(query, item).then(res => {
            return res.updatedIds.map(item => item.toString())
          }).then(res => {
            console.log('U', res);
          }));
        });

        return Promise.all(updatedItems);
      }
      else {
        let query = {
          _id: ObjectId(id)
        };
        delete data.id;
        return col.updateOne(query, data).then(res => {
          console.log('U', res);
          return res.updatedId.toString()
        });
      }
    }

    remove() {

    }
  }

  return MongoDBService;
};
