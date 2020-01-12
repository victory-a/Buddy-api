const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      maxlength: [280, 'Text limit is 280 characters']
    },
    image: {
      type: String,
      default: 'no-photo.jpg'
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
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model('Post', PostSchema);
