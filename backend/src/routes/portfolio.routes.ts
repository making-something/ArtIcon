import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router: Router = Router();

// Configure multer for portfolio file uploads
const portfolioUploadsDir = path.join(process.cwd(), 'uploads', 'portfolios');
if (!fs.existsSync(portfolioUploadsDir)) {
  fs.mkdirSync(portfolioUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, portfolioUploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const portfolioUpload = multer({
  storage,
  limits: {
    fileSize: Infinity, // No limit
  },
  fileFilter: (_req, file, cb) => {
    // Allow PDFs and common document/image formats
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, Word documents, and ZIP files are allowed.'));
    }
  },
});

/**
 * Upload portfolio file
 * @route POST /api/portfolio/upload
 */
router.post('/upload', portfolioUpload.single('portfolio'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const filePath = `/uploads/portfolios/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Portfolio file uploaded successfully',
      data: {
        filePath,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Error uploading portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload portfolio file',
    });
  }
});

/**
 * Download/view portfolio file
 * @route GET /api/portfolio/file/:filename
 */
router.get('/file/:filename', (req: Request, res: Response): void => {
  try {
    const { filename } = req.params;
    const filePath = path.join(portfolioUploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found',
      });
      return;
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error retrieving portfolio file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve portfolio file',
    });
  }
});

export default router;
