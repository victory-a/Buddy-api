const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user'],
      default: 'user'
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide a name']
    },
    email: {
      type: String,
      unique: true,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot be more than 300 characters']
    },
    posts: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

UserSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.verifyPassword = async function(enteredPassword) {
  const verified = await bcrypt.compare(enteredPassword, this.password);
  return verified;
};

UserSchema.methods.getAuthToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('User', UserSchema);
