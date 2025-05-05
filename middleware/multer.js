const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../temp_uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Middleware to delete the file after response is sent
upload.single('file'); // Assuming the field name is 'file'

function deleteFileAfterResponse(req, res, next) {
  const oldSend = res.send;
  
  res.send = function (body) {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(`Failed to delete the file ${req.file.path}`);
        } else {
          console.log(`File ${req.file.path} deleted successfully.`);
        }
      });
    }
    oldSend.call(res, body);
  };

  next();
}

module.exports = { upload, deleteFileAfterResponse };
