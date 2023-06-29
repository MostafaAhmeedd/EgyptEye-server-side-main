const multer = require('multer');

const createUploadMiddleware = (folderName) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Specify the directory where the file will be saved
      cb(null, folderName);
    },
    filename: function (req, file, cb) {
      // Specify the filename of the uploaded file
      cb(null, Date.now() + file.originalname);
    }
  });

  // Return the multer middleware directly
  return multer({ storage: storage });
};

module.exports = createUploadMiddleware;