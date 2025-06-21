const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const path = require('path');
const fs = require('fs');
const { simplifyText, identifyRiskyClauses, generateSummary } = require('./textSimplifier');
const { PDFDocument } = require('pdf-lib');
const tesseract = require('node-tesseract-ocr');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Configure OCR options
const ocrConfig = {
  lang: 'eng',
  oem: 1,
  psm: 3,
};

// Enhanced PDF upload and processing endpoint
app.post('/api/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfFile = fs.readFileSync(req.file.path);
    let extractedText = '';
    let isPDFBinary = false;
    
    // First try standard PDF text extraction
    try {
      const pdfData = await pdfParse(pdfFile);
      extractedText = pdfData.text;
    } catch (error) {
      console.error('Standard PDF extraction failed:', error);
      isPDFBinary = true;
    }
    
    // If standard extraction failed or returned binary data, try OCR
    if (!extractedText || extractedText.startsWith('%PDF') || extractedText.length < 100) {
      isPDFBinary = true;
      
      // For now, we'll just return an error since OCR might not be set up
      return res.status(400).json({ 
        error: 'Could not extract readable text from this PDF. The file may be scanned, encrypted, or corrupted.',
        isPDFBinary: true
      });
      
      // OCR implementation would go here if properly set up
    }
    
    // Process the extracted text
    const simplifiedText = simplifyText(extractedText);
    const riskyClauses = identifyRiskyClauses(extractedText);
    const summary = generateSummary(extractedText);
    
    // Return all processed data
    res.json({
      success: true,
      fileName: req.file.originalname,
      originalText: extractedText,
      simplifiedText: simplifiedText,
      riskyClauses: riskyClauses,
      summary: summary
    });
    
    // Clean up - delete the uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    // Ensure we always return a valid JSON response
    res.status(500).json({ 
      error: 'Failed to process PDF file', 
      message: error.message || 'Unknown error'
    });
  }
});

// Helper function to convert PDF page to image (implementation depends on your environment)
async function convertPDFPageToImage(pdfBuffer, pageNum, outputPath) {
  // This is a placeholder - you would implement this using a library like pdf2pic, pdf-poppler, etc.
  // Example implementation would go here
  console.log(`Converting page ${pageNum} to image at ${outputPath}`);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});






