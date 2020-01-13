const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
    maxlength: [280, 'Text limit is 280 characters'],
    required: [true, 'Body text is required']
  },
  caption: {
    type: String,
    trim: true,
    maxlength: [30, 'Text limit is 280 characters'],
    required: [true, 'Caption is required']
  },
  images: {
    type: Array
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Post', PostSchema);
