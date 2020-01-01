const mongoose = require('mongoose')

module.exports = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  console.log(`DB connected successfully on ${conn.connection.host}`.green.underline)
}