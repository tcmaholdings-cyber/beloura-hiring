import multer from 'multer';
import path from 'path';

// Configure multer for Excel file uploads
const storage = multer.memoryStorage(); // Store files in memory for processing

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only Excel files
  const allowedMimeTypes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  ];

  const allowedExtensions = ['.xls', '.xlsx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files (.xls, .xlsx) are allowed.'));
  }
};

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});
