# coreio-mongodb
[![Build Status](https://travis-ci.org/Andifeind/coreio-mongodb.svg?branch=master)](https://travis-ci.org/Andifeind/coreio-mongodb)

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
