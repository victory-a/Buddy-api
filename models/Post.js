const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
    maxlength: [280, 'Text limit is 280 characters'],
    required: [true, 'Body text is required']
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
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PostSchema.statics.removeRelatedPosts = async function(postId) {
  await this.model('Reply').deleteMany({ post: postId });
};

PostSchema.pre('remove', async function(next) {
  console.log(`${this} post is being deleted`.red);
  this.constructor.removeRelatedPosts(this._id);
  next();
});

module.exports = mongoose.model('Post', PostSchema);
