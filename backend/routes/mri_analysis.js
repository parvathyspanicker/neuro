/**
 * MRI Analysis Routes
 * Handles deep learning MRI analysis endpoints
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Optional authentication middleware: allows anonymous access but
// attaches a lightweight user object when Authorization is present.
// Optional authentication middleware: verifies JWT if present
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded; // Contains userId
    } catch (err) {
      console.warn('Invalid token in mri_analysis optionalAuth:', err.message);
      req.user = { userId: 'guest', tokenPresent: false };
    }
  } else {
    req.user = { userId: 'guest', tokenPresent: false };
  }
  next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'mri');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'mri-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.dcm', '.dicom', '.nii', '.nii.gz', '.jpg', '.jpeg', '.png', '.tiff', '.tif'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only DICOM, NIfTI, JPEG, PNG, and TIFF files are allowed.'));
    }
  }
});

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(__dirname, '..', 'uploads', 'mri');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
};

ensureUploadDir();

/**
 * POST /api/mri/analyze
 * Analyze a single MRI image
 */
router.post('/analyze', optionalAuth, upload.single('mri_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No MRI image file provided'
      });
    }

    const { patient_id, notes } = req.body;
    const imagePath = req.file.path;
    const originalName = req.file.originalname;

    console.log(`Starting MRI analysis for: ${originalName}`);

    // Call Python MRI analysis service
    const analysisResult = await runMRIAnalysis(imagePath, patient_id, notes);

    if (analysisResult.success) {
      // Save analysis result to database (you can implement this)
      const analysisRecord = {
        analysis_id: analysisResult.data.analysis_id,
        patient_id: patient_id || req.user?.userId || 'guest',
        user_id: req.user?.userId || 'guest',
        image_path: imagePath,
        original_filename: originalName,
        prediction: analysisResult.data.prediction,
        features: analysisResult.data.features,
        timestamp: new Date(),
        status: 'completed'
      };

      // TODO: Save to database
      // await MRIAnalysis.create(analysisRecord);

      // Debug logging
      console.log('=== MRI ANALYSIS RESULT ===');
      console.log('Predicted class:', analysisResult.data.prediction.predicted_class);
      console.log('Confidence:', analysisResult.data.prediction.confidence);
      console.log('Stage:', analysisResult.data.prediction.stage);
      console.log('Severity:', analysisResult.data.prediction.severity);
      console.log('===========================');

      res.json({
        success: true,
        message: 'MRI analysis completed successfully',
        analysis_id: analysisResult.data.analysis_id,
        prediction: analysisResult.data.prediction,
        features: analysisResult.data.features,
        image_info: analysisResult.data.image_info,
        model_info: analysisResult.data.model_info,
        image_info: analysisResult.data.image_info,
        model_info: analysisResult.data.model_info,
        report: analysisResult.data.report,
        file_path: imagePath,
        filename: req.file.filename
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'MRI analysis failed',
        error: analysisResult.error
      });
    }

  } catch (error) {
    console.error('MRI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during MRI analysis',
      error: error.message
    });
  }
});

/**
 * POST /api/mri/analyze-batch
 * Analyze multiple MRI images
 */
router.post('/analyze-batch', optionalAuth, upload.array('mri_images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No MRI image files provided'
      });
    }

    const { patient_id, notes } = req.body;
    const imagePaths = req.files.map(file => file.path);
    const originalNames = req.files.map(file => file.originalname);

    console.log(`Starting batch MRI analysis for ${imagePaths.length} images`);

    // Call Python MRI analysis service for batch processing
    const analysisResults = await runBatchMRIAnalysis(imagePaths, patient_id, notes);

    if (analysisResults.success) {
      res.json({
        success: true,
        message: `Batch MRI analysis completed for ${imagePaths.length} images`,
        data: {
          total_images: imagePaths.length,
          successful_analyses: analysisResults.data.filter(r => !r.error).length,
          failed_analyses: analysisResults.data.filter(r => r.error).length,
          results: analysisResults.data
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Batch MRI analysis failed',
        error: analysisResults.error
      });
    }

  } catch (error) {
    console.error('Batch MRI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during batch MRI analysis',
      error: error.message
    });
  }
});

/**
 * GET /api/mri/analysis/:analysisId
 * Get analysis result by ID
 */
router.get('/analysis/:analysisId', optionalAuth, async (req, res) => {
  try {
    const { analysisId } = req.params;

    // TODO: Retrieve from database
    // const analysis = await MRIAnalysis.findOne({ 
    //   analysis_id: analysisId, 
    //   user_id: req.user.userId 
    // });

    // For now, return a placeholder
    res.json({
      success: true,
      message: 'Analysis result retrieved',
      data: {
        analysis_id: analysisId,
        status: 'completed',
        message: 'Analysis result retrieval not yet implemented'
      }
    });

  } catch (error) {
    console.error('Error retrieving analysis result:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving analysis result',
      error: error.message
    });
  }
});

/**
 * GET /api/mri/analyses
 * Get all analyses for the current user
 */
router.get('/analyses', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // TODO: Retrieve from database with pagination
    // const analyses = await MRIAnalysis.find({ user_id: req.user.userId })
    //   .sort({ timestamp: -1 })
    //   .limit(limit * 1)
    //   .skip((page - 1) * limit);

    // For now, return a placeholder
    res.json({
      success: true,
      message: 'Analyses retrieved',
      data: {
        analyses: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving analyses:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving analyses',
      error: error.message
    });
  }
});

/**
 * GET /api/mri/model-info
 * Get information about the loaded model
 */
router.get('/model-info', optionalAuth, async (req, res) => {
  try {
    const modelInfo = await getModelInfo();

    res.json({
      success: true,
      message: 'Model information retrieved',
      data: modelInfo
    });

  } catch (error) {
    console.error('Error retrieving model info:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving model information',
      error: error.message
    });
  }
});

/**
 * Helper function to run MRI analysis using Python
 */
async function runMRIAnalysis(imagePath, patientId, notes) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', 'scripts', 'mri_analysis_runner.py');

    const pythonProcess = spawn('python', [
      pythonScript,
      '--image', imagePath,
      '--patient-id', patientId || '',
      '--notes', notes || ''
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (parseError) {
          resolve({
            success: false,
            error: 'Failed to parse analysis result',
            raw_output: output
          });
        }
      } else {
        resolve({
          success: false,
          error: errorOutput || 'Python script execution failed',
          exit_code: code
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`
      });
    });
  });
}

/**
 * Helper function to run batch MRI analysis using Python
 */
async function runBatchMRIAnalysis(imagePaths, patientId, notes) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', 'scripts', 'mri_analysis_runner.py');

    const pythonProcess = spawn('python', [
      pythonScript,
      '--batch',
      '--images', imagePaths.join(','),
      '--patient-id', patientId || '',
      '--notes', notes || ''
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (parseError) {
          resolve({
            success: false,
            error: 'Failed to parse batch analysis result',
            raw_output: output
          });
        }
      } else {
        resolve({
          success: false,
          error: errorOutput || 'Python script execution failed',
          exit_code: code
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`
      });
    });
  });
}

/**
 * Helper function to get model information
 */
async function getModelInfo() {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', 'scripts', 'mri_analysis_runner.py');

    const pythonProcess = spawn('python', [pythonScript, '--model-info']);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (parseError) {
          resolve({
            success: false,
            error: 'Failed to parse model info',
            raw_output: output
          });
        }
      } else {
        resolve({
          success: false,
          error: errorOutput || 'Failed to get model info',
          exit_code: code
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`
      });
    });
  });
}

/**
 * PDF Report Download Endpoint
 * Downloads a professional PDF report of the MRI analysis
 */
router.get('/download-pdf/:analysisId', optionalAuth, async (req, res) => {
  try {
    const { analysisId } = req.params;

    if (!analysisId) {
      return res.status(400).json({
        success: false,
        error: 'Analysis ID is required'
      });
    }

    // Generate PDF report using Python service
    const pdfPath = await generatePDFReport(analysisId, req.user);

    if (!pdfPath) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found or PDF generation failed'
      });
    }

    // Set headers and download
    // express res.download handles Content-Type, Content-Length, and Content-Disposition automatically
    console.log(`[download-pdf] Sending file: ${pdfPath}`);
    res.download(pdfPath, (err) => {
      if (err) {
        console.error('[download-pdf] Error downloading file:', err);
        // If headers already sent, we can't send error response, but Express often handles this
        if (!res.headersSent) {
          res.status(500).send('Error downloading file');
        }
      } else {
        console.log('[download-pdf] File sent successfully.');
        // Optional: Delete file if it was a temp file (it's not, it's a report).
      }
    });

  } catch (error) {
    console.error('Error downloading PDF report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF report'
    });
  }
});

/**
 * Helper function to generate PDF report using Python service
 */
const Report = require('../models/Report');
const User = require('../models/User');

/**
 * Helper function to generate PDF report using Python service
 */
async function generatePDFReport(analysisId, userInfo) {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch report data
      const report = await Report.findOne({ analysis_id: analysisId });
      if (!report) {
        console.error('Report not found for analysis ID:', analysisId);
        return resolve(null);
      }

      // Fetch patient data
      let patientData = {
        name: 'Guest Patient',
        id: userInfo.userId || 'guest',
        age: 'N/A',
        gender: 'N/A'
      };

      if (userInfo.userId && userInfo.userId !== 'guest') {
        const user = await User.findById(userInfo.userId);
        if (user) {
          patientData = {
            name: `${user.firstName} ${user.lastName}`,
            id: user._id.toString(),
            age: user.date_of_birth ? calculateAge(user.date_of_birth) : 'N/A',
            gender: user.gender || 'N/A',
            email: user.email,
            phone: user.phone
          };
        }
      }

      // Prepare comprehensive data for Python script
      const reportData = {
        analysis_id: report.analysis_id,
        timestamp: report.created_at.toISOString(),
        patient_info: patientData,
        prediction: {
          predicted_class: report.predicted_result,
          confidence: report.confidence / 100, // Convert back to 0-1 range if needed
          status: report.status,
          stage: report.stage,
          severity: report.severity,
          disease_info: report.disease_info,
          all_predictions: [], // Can be populated if stored
          recommendations: report.recommendations,
          treatment_options: report.treatment_options,
          patient_instructions: report.patient_instructions,
          brain_regions_affected: report.brain_regions_affected
        },
        features: {}, // Can be populated if stored
        heatmap_image: report.image_path || report.heatmap_image,
        doctor_comments: report.doctor_comments
      };

      const pythonScript = path.join(__dirname, '..', 'scripts', 'generate_pdf_report.py');

      // Pass data as JSON string argument
      // Using a temporary file for data transfer to avoid command line length limits
      const tempDataPath = path.join(__dirname, '..', 'uploads', `temp_report_data_${analysisId}.json`);
      await fs.writeFile(tempDataPath, JSON.stringify(reportData));

      console.log(`[generatePDFReport] Starting Python process: ${pythonScript} with data file: ${tempDataPath}`);
      const pythonProcess = spawn('python', [
        pythonScript,
        '--data-file', tempDataPath
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        const errorMsg = data.toString();
        console.log(`[Python Log]: ${errorMsg}`); // Log python logging as normal log
        errorOutput += errorMsg;
      });

      pythonProcess.on('close', async (code) => {
        // Clean up temp file
        try {
          await fs.unlink(tempDataPath);
        } catch (e) {
          console.warn('Failed to delete temp data file', e);
        }

        if (code === 0) {
          try {
            console.log('[generatePDFReport] Python Output:', output); // DEBUG LOG
            const result = JSON.parse(output);
            if (result.success && result.pdf_path) {
              console.log('[generatePDFReport] Success. PDF Path:', result.pdf_path);
              resolve(result.pdf_path);
            } else {
              console.error('[generatePDFReport] Python script returned logic failure:', result);
              resolve(null);
            }
          } catch (parseError) {
            console.error('[generatePDFReport] Failed to parse PDF generation output:', parseError);
            console.error('[generatePDFReport] Raw Output was:', output);
            resolve(null);
          }
        } else {
          console.error('[generatePDFReport] PDF generation process failed with code', code);
          console.error('[generatePDFReport] Error Output:', errorOutput);
          resolve(null);
        }
      });


      pythonProcess.on('error', (error) => {
        console.error('Failed to start PDF generation process:', error);
        resolve(null);
      });

    } catch (error) {
      console.error('Error in generatePDFReport:', error);
      resolve(null);
    }
  });
}

function calculateAge(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports = router;
