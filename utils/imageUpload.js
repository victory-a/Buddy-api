const path = require('path');
const uuid = require('uuid/v1');
const ErrorResponse = require('./errorResponse');

const verifyFileType = (files, next) => {
  if (files instanceof Array) {
    files.forEach(file => {
      if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
      }
    });
  } else if (!files.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
};

const verifyFileSize = (files, maxFileSize, next) => {
  if (files instanceof Array) {
    files.forEach(file => {
      if (file.size > maxFileSize) {
        return next(
          new ErrorResponse(
            `Please upload an image less than ${maxFileSize}`,
            400
          )
        );
      }
    });
  } else if (files.size > maxFileSize) {
    return next(
      new ErrorResponse(`Please upload an image less than ${maxFileSize}`, 400)
    );
  }
};

const renameFile = (files, userId, type) => {
  if (files instanceof Array) {
    files.forEach(file => {
      file.name = `post_${uuid()}${path.parse(file.name).ext}`;
    });
  } else {
    type === 'post'
      ? (files.name = `post_${uuid()}${path.parse(files.name).ext}`)
      : (files.name = `profile_${userId}${path.parse(files.name).ext}`);
  }
};

const saveFile = (files, uploadPath, next) => {
  if (files instanceof Array) {
    files.forEach(file => {
      file.mv(`${uploadPath}/${file.name}`, async err => {
        if (err) {
          console.log(err);
          return next(new ErrorResponse(`Problem with file upload`, 500));
        }
      });
    });
  } else {
    files.mv(`${uploadPath}/${files.name}`, async err => {
      if (err) {
        console.log(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }
    });
  }
};

const imageUpload = (files, userId, type, next) => {
  let maxFileSize;
  let uploadPath;

  // Set fie size limit and upload path depending on what type of image upload is being done
  if (type === 'post') {
    maxFileSize = process.env.MAX_POST_IMAGE_SIZE;
    uploadPath = process.env.POST_IMAGE_UPLOAD_PATH;
  } else if (type === 'profile') {
    maxFileSize = process.env.MAX_PROFILE_IMAGE_SIZE;
    uploadPath = process.env.PROFILE_IMAGE_UPLOAD_PATH;
  }

  verifyFileType(files, next);
  verifyFileSize(files, maxFileSize, next);
  renameFile(files, userId, type);
  saveFile(files, uploadPath, next);
};

module.exports = imageUpload;
