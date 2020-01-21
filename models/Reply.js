const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reply', ReplySchema);
