import multer from 'multer';
import fs from 'fs';

// Configure multer storage and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

// Custom file upload middleware
const imageMiddleware = (req, res, next) => {
  // Use multer upload instance, single file only 1 image 
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Retrieve the uploaded file
    const file = req.file;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype) || file.size > maxSize) {
      // Remove the uploaded file
      fs.unlinkSync(file.path);

      return res.status(400).json({
        errors: [`Invalid file: ${file.originalname}`],
      });
    }

    // Attach the file to the request object
    req.file = file;

    // Proceed to the next middleware or route handler
    next();
  });
};
export default imageMiddleware;