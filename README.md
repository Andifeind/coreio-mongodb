# coreio-mongodb
[![npm](https://img.shields.io/npm/v/coreio-mongodb.svg?style=flat-square)](https://npmjs.com/coreio-mongodb)
[![npm license](https://img.shields.io/npm/l/coreio-mongodb.svg?style=flat-square)](https://npmjs.com/coreio-mongodb)
[![npm downloads](https://img.shields.io/npm/dm/coreio-mongodb.svg?style=flat-square)](https://npmjs.com/coreio-mongodb)
[![build status](https://img.shields.io/travis//coreio-mongodb.svg?style=flat-square)](https://travis-ci.org//coreio-mongodb)

MongoDB integration for CoreIO

## Install via [npm](https://npmjs.com)

```sh
$ npm install coreio-mongodb
```

```js
import CoreIO from 'coreio';
import MongoDBService from 'coreio-mongodb';

// set db conf
CoreIO.setConf('mongodb', 'mongodb://localhost:27017/coreio-test');

const TodoModel = CoreIO.createModel('todo', {
  schema: {
    title: { type: 'string', min: 5, max: 100, required: true },
    content: { type: 'string', min: 0, max: 5000 },
    state: { type: 'number', default: 1 }
  },
  service: MongoDBService
});

export default TodoModel;
```

Import the model in your app, store data and save the model into a MongoDB

```js
import TodoModel from '../path/to/model';

const model = new TodoModel();
model.set({
  title: 'Test model',
  content: 'This is a test content'
});

model.save().then((res) => {
  console.log('Item inserted with id', res.id);
});
```
