const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  liker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from liking a post multiple times
LikeSchema.index({ post: 1, liker: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);
