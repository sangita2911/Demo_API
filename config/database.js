const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CONNECT_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Successfully connected to the database.'))
  .catch(err => { 
    console.log('Could not connect to the database, exiting now...', err); 
    process.exit();
  })