const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  // author the user who's post is being replied
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  replier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
