const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user'],
      default: 'user'
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, 'Please provide a firstName']
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, 'Please provide a lastName']
    },
    email: {
      type: String,
      unique: true,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email'
      ],
      required: [true, 'Please provide an email']
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 3,
      select: false
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot be more than 300 characters']
    },
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    posts: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* Middleware to encrypt password when as before every save event where password 
field is modified */
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Checks provided password against encrypted version in DB
UserSchema.methods.verifyPassword = async function(enteredPassword) {
  const verified = await bcrypt.compare(enteredPassword, this.password);
  return verified;
};

// Assigns an auth token to client which has a specified expiry date
UserSchema.methods.getAuthToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate a token which is sent to client and stored a hashed version in DB
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Cascade delete relationships for a deleted user
UserSchema.statics.deleteInvalidUser = async function(userId) {
  await this.model('Fan').deleteMany({ follower: userId });
  await this.model('Fan').deleteMany({ followed: userId });
  await this.model('Post').deleteMany({ author: userId });
  await this.model('Reply').deleteMany({ author: userId });
  await this.model('Reply').deleteMany({ replier: userId });
  await this.model('Like').deleteMany({ author: userId });
  await this.model('Like').deleteMany({ liker: userId });
};

UserSchema.pre('remove', function() {
  this.constructor.deleteInvalidUser(this._id);
});

UserSchema.virtual('followers', {
  ref: 'Fan',
  localField: '_id',
  foreignField: 'followed',
  justOne: false,
  options: {
    sort: { createdAt: -1 }
  }
});

module.exports = mongoose.model('User', UserSchema);
