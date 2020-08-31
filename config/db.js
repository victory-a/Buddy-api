const mongoose = require('mongoose');

// mongoose.set('bufferCommands', false);
module.exports = async function() {
  const db = mongoose.connection;
  try {
    db.on('connected', function() {
      console.log(`DB connected successfully on ${db.host}`.green.underline);
    });
    db.on('disconnected', function() {
      console.log(`Mongoose disconnected`.red.underline);
    });
    db.on('error', function(err) {
      console.log(`Error occured ${err}`.red.underline);
    });

    return await mongoose.connect(process.env.MONGO_URI_CLOUD, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.log(`Error occured ${error}`.red.underline);
  }
};
