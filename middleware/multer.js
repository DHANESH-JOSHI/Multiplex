const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Folder where temporary uploads are stored
const uploadPath = path.join(__dirname, "../temp_uploads");

// Create directory if it doesn't exist
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Multer instance
const upload = multer({ storage });

/**
 * Middleware to delete uploaded file after response is sent
 */
function deleteFileAfterResponse(req, res, next) {
  const oldSend = res.send;
  const oldJson = res.json;

  // Hook into res.send
  res.send = function (body) {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(`❌ Failed to delete the file: ${req.file.path}`, err);
        } else {
          console.log(`✅ File deleted: ${req.file.path}`);
        }
      });
    }
    return oldSend.call(this, body);
  };

  // Also hook into res.json if used
  res.json = function (body) {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(`❌ Failed to delete the file: ${req.file.path}`, err);
        } else {
          console.log(`✅ File deleted: ${req.file.path}`);
        }
      });
    }
    return oldJson.call(this, body);
  };

  next();
}

module.exports = {
  upload,                  // use as: upload.single('file')
  deleteFileAfterResponse  // use after upload middleware
};
