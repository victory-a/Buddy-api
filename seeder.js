const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const { User, Post, Reply, Like } = require('./models');

mongoose.connect(process.env.MONGO_URI_CLOUD, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

const posts = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/posts.json`, 'utf-8')
);

const replies = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/replies.json`, 'utf-8')
);

const loadData = async () => {
  try {
    await User.create(users);
    await Post.create(posts);
    await Reply.create(replies);

    console.log('Data Loaded ...'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Post.deleteMany();
    await Reply.deleteMany();
    await Like.deleteMany();

    console.log('Data Destroyed ...'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '-i') {
  loadData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
