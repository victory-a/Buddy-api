const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
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
    photo: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

PostSchema.statics.removeRelatedPosts = async function(postId) {
  await this.model('Reply').deleteMany({ post: postId });
  await this.model('Like').deleteMany({ post: postId });
};

PostSchema.pre('remove', async function(next) {
  // console.log(`${this} post is being deleted`.red);
  this.constructor.removeRelatedPosts(this._id);
  next();
});

PostSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'post',
  count: true
});

PostSchema.virtual('replies', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'post',
  count: true
});

// PostSchema.virtual('likers', {
//   ref: 'Like',
//   localField: '_id',
//   foreignField: 'liker'
// });

PostSchema.virtual('authorDetails', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id'
});

PostSchema.virtual('replies', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'post',
  count: true
});

module.exports = mongoose.model('Post', PostSchema);
