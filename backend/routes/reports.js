const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Report = require('../models/Report');

// Middleware for authentication
// Middleware for authentication
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    } catch (err) {
      console.warn('Invalid token in optionalAuth:', err.message);
      // Create a guest user context if token is invalid, or just leave as undefined
      // req.user = null;
    }
  }
  next();
};

// POST /api/reports - Create a new report
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      analysis_id,
      scan_date,
      scan_type,
      status,
      predicted_result,
      confidence,
      disease_info,
      stage,
      severity,
      brain_regions_affected,
      findings,
      treatment_options,
      recommendations,
      next_steps,
      patient_instructions,
      uploaded_file,
      image_path
    } = req.body;

    // Validate required fields
    if (!analysis_id || !scan_date || !predicted_result) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: analysis_id, scan_date, predicted_result'
      });
    }

    // Create report object
    const reportData = {
      analysis_id,
      scan_date: new Date(scan_date),
      scan_type: scan_type || 'Brain MRI',
      status: status || 'Analyzed',
      predicted_result,
      confidence: confidence || 0,
      disease_info: disease_info || {},
      stage: stage || 'Unknown',
      severity: severity || 'Unknown',
      brain_regions_affected: brain_regions_affected || [],
      findings: findings || [],
      treatment_options: treatment_options || [],
      recommendations: recommendations || [],
      next_steps: next_steps || [],
      patient_instructions: patient_instructions || [],
      uploaded_file: uploaded_file || 'Unknown',
      image_path: image_path || null,
      user_id: req.user?.userId || 'guest',
      // Add medical report structure
      doctor_comments: {
        notes: disease_info?.description || 'AI analysis completed successfully.',
        prescription: treatment_options?.length > 0 ? treatment_options.join(', ') : 'Consult with your doctor for treatment options.',
        suggested_tests: recommendations?.length > 0 ? recommendations.slice(0, 3) : ['Follow-up MRI in 6 months']
      },
      lifestyle_suggestions: {
        exercise: '30 minutes of moderate exercise daily',
        diet: 'Maintain a balanced diet rich in omega-3 fatty acids',
        posture: 'Maintain proper posture and take regular breaks'
      },
      next_appointment: null,
      // Use the real uploaded MRI image path as heatmap
      heatmap_image: image_path ? `/uploads/mri/${require('path').basename(image_path)}` : null
    };

    // Create new report
    const newReport = new Report(reportData);
    const savedReport = await newReport.save();

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      report: {
        id: savedReport._id.toString(),
        ...savedReport.toObject()
      }
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Test endpoint to verify reports API is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Reports API is working!',
    timestamp: new Date().toISOString()
  });
});

// GET /api/reports - Get all reports for a user
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || 'guest';

    // Get reports for the user
    const reports = await Report.find({ user_id: userId })
      .sort({ created_at: -1 });

    // Transform reports to match frontend format
    const transformedReports = reports.map(report => ({
      id: report._id.toString(),
      scanDate: report.scan_date.toISOString().split('T')[0],
      scanType: report.scan_type,
      status: report.status,
      predictedResult: report.predicted_result,
      confidence: report.confidence,
      heatmapImage: report.heatmap_image,
      doctorComments: report.doctor_comments,
      nextAppointment: report.next_appointment,
      lifestyleSuggestions: report.lifestyle_suggestions,
      // Add additional fields
      analysisId: report.analysis_id,
      diseaseInfo: report.disease_info,
      stage: report.stage,
      severity: report.severity,
      brainRegionsAffected: report.brain_regions_affected,
      findings: report.findings,
      treatmentOptions: report.treatment_options,
      recommendations: report.recommendations,
      nextSteps: report.next_steps,
      patientInstructions: report.patient_instructions,
      uploadedFile: report.uploaded_file,
      imagePath: report.image_path,
      createdAt: report.created_at
    }));

    res.json({
      success: true,
      reports: transformedReports
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/reports/:id - Get a specific report
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user?.userId || 'guest';

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ success: false, error: 'Invalid report ID' });
    }

    const report = await Report.findOne({
      _id: reportId,
      user_id: userId
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Transform report to match frontend format
    const transformedReport = {
      id: report._id.toString(),
      scanDate: report.scan_date.toISOString().split('T')[0],
      scanType: report.scan_type,
      status: report.status,
      predictedResult: report.predicted_result,
      confidence: report.confidence,
      heatmapImage: report.heatmap_image,
      doctorComments: report.doctor_comments,
      nextAppointment: report.next_appointment,
      lifestyleSuggestions: report.lifestyle_suggestions,
      // Add additional fields
      analysisId: report.analysis_id,
      diseaseInfo: report.disease_info,
      stage: report.stage,
      severity: report.severity,
      brainRegionsAffected: report.brain_regions_affected,
      findings: report.findings,
      treatmentOptions: report.treatment_options,
      recommendations: report.recommendations,
      nextSteps: report.next_steps,
      patientInstructions: report.patient_instructions,
      uploadedFile: report.uploaded_file,
      createdAt: report.created_at
    };

    res.json({
      success: true,
      report: transformedReport
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/reports/:id - Update a report
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user?.userId || 'guest';

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ success: false, error: 'Invalid report ID' });
    }

    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    const result = await Report.updateOne(
      { _id: reportId, user_id: userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    if (result.modifiedCount > 0) {
      res.json({
        success: true,
        message: 'Report updated successfully'
      });
    } else {
      res.json({
        success: true,
        message: 'No changes made to the report'
      });
    }

  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user?.userId || 'guest';

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ success: false, error: 'Invalid report ID' });
    }

    const result = await Report.deleteOne({
      _id: reportId,
      user_id: userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/reports/:id/download - Download report PDF
router.get('/:id/download', optionalAuth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user?.userId || 'guest';

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ success: false, error: 'Invalid report ID' });
    }

    const report = await Report.findOne({ _id: reportId });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Call generatePDFReport via API or duplicated logic
    // We'll duplicate logic here for stability as extracting to service requires more edits
    const { spawn } = require('child_process');
    const path = require('path');
    const fs = require('fs').promises;
    const User = require('../models/User');

    // Fetch patient data
    let patientData = {
      name: 'Guest Patient',
      id: userId,
      age: 'N/A',
      gender: 'N/A'
    };

    if (userId && userId !== 'guest') {
      const user = await User.findById(userId);
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

    // Prepare comprehensive data
    const reportData = {
      analysis_id: report.analysis_id,
      timestamp: report.created_at.toISOString(),
      patient_info: patientData,
      prediction: {
        predicted_class: report.predicted_result,
        confidence: report.confidence / 100,
        status: report.status,
        stage: report.stage,
        severity: report.severity,
        disease_info: report.disease_info,
        all_predictions: [],
        recommendations: report.recommendations,
        treatment_options: report.treatment_options,
        patient_instructions: report.patient_instructions,
        brain_regions_affected: report.brain_regions_affected
      },
      features: {},
      heatmap_image: report.image_path || report.heatmap_image,
      doctor_comments: report.doctor_comments
    };

    const pythonScript = path.join(__dirname, '..', 'scripts', 'generate_pdf_report.py');
    const tempDataPath = path.join(__dirname, '..', 'uploads', `temp_report_data_${report.analysis_id}.json`);
    await fs.writeFile(tempDataPath, JSON.stringify(reportData));

    console.log(`[reports] Generating PDF for report ${reportId}`);

    const pythonProcess = spawn('python', [
      pythonScript,
      '--data-file', tempDataPath
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => { output += data.toString(); });
    pythonProcess.stderr.on('data', (data) => {
      console.log(`[Python]: ${data}`);
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      try { await fs.unlink(tempDataPath); } catch (e) { }

      if (code === 0) {
        try {
          const result = JSON.parse(output);
          if (result.success && result.pdf_path) {
            console.log(`[reports] PDF generated: ${result.pdf_path}`);
            res.download(result.pdf_path, (err) => {
              if (err && !res.headersSent) res.status(500).send('Download failed');
            });
          } else {
            console.error('[reports] PDF Gen Logic Fail:', result);
            if (!res.headersSent) res.status(500).json({ error: 'PDF Logic Fail' });
          }
        } catch (e) {
          console.error('[reports] PDF JSON Parse Fail:', e, output);
          if (!res.headersSent) res.status(500).json({ error: 'PDF Parse Fail' });
        }
      } else {
        console.error('[reports] PDF Process Fail:', code, errorOutput);
        if (!res.headersSent) res.status(500).json({ error: 'PDF Process Fail' });
      }
    });

  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── Document Sharing with Doctors ──
const SharedReport = require('../models/SharedReport');
const { User } = require('../models/User');

// POST /api/reports/:id/share-with-doctor – Patient shares a report with a doctor
router.post('/:id/share-with-doctor', optionalAuth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user?.userId;

    if (!userId || userId === 'guest') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ success: false, error: 'Invalid report ID' });
    }

    const { doctorId, message } = req.body;
    if (!doctorId) {
      return res.status(400).json({ success: false, error: 'doctorId is required' });
    }

    // Verify report belongs to user
    const report = await Report.findOne({ _id: reportId, user_id: userId });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Verify doctor exists and is a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    // Check if already shared
    const existing = await SharedReport.findOne({ reportId, fromUserId: userId, toUserId: doctorId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Report already shared with this doctor' });
    }

    const shared = new SharedReport({
      reportId,
      fromUserId: userId,
      toUserId: doctorId,
      message: message || ''
    });
    await shared.save();

    res.status(201).json({
      success: true,
      message: 'Report shared successfully',
      sharedReport: {
        id: shared._id.toString(),
        reportId: shared.reportId.toString(),
        toDoctor: `Dr. ${doctor.firstName} ${doctor.lastName}`.trim(),
        status: shared.status,
        sharedAt: shared.sharedAt
      }
    });
  } catch (error) {
    console.error('Error sharing report:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/reports/shared/received – Doctor gets reports shared with them
router.get('/shared/received', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId || userId === 'guest') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const sharedReports = await SharedReport.find({ toUserId: userId })
      .sort({ sharedAt: -1 })
      .lean();

    // Populate report and patient data
    const reportIds = sharedReports.map(s => s.reportId);
    const patientIds = sharedReports.map(s => s.fromUserId);

    const [reports, patients] = await Promise.all([
      Report.find({ _id: { $in: reportIds } }).lean(),
      User.find({ _id: { $in: patientIds } }).select('firstName lastName email profilePicture').lean()
    ]);

    const reportMap = new Map(reports.map(r => [r._id.toString(), r]));
    const patientMap = new Map(patients.map(p => [p._id.toString(), p]));

    const result = sharedReports.map(s => {
      const report = reportMap.get(s.reportId.toString());
      const patient = patientMap.get(s.fromUserId.toString());
      return {
        id: s._id.toString(),
        status: s.status,
        message: s.message,
        sharedAt: s.sharedAt,
        viewedAt: s.viewedAt,
        acknowledgedAt: s.acknowledgedAt,
        patient: patient ? {
          id: patient._id.toString(),
          name: `${patient.firstName} ${patient.lastName}`.trim(),
          email: patient.email,
          avatar: patient.profilePicture
        } : null,
        report: report ? {
          id: report._id.toString(),
          scanDate: report.scan_date?.toISOString().split('T')[0],
          scanType: report.scan_type,
          status: report.status,
          predictedResult: report.predicted_result,
          confidence: report.confidence,
          heatmapImage: report.heatmap_image,
          imagePath: report.image_path,
          createdAt: report.created_at
        } : null
      };
    });

    res.json({ success: true, sharedReports: result });
  } catch (error) {
    console.error('Error fetching shared reports:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/reports/shared/:shareId/acknowledge – Doctor acknowledges a shared report
router.put('/shared/:shareId/acknowledge', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId || userId === 'guest') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { shareId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(shareId)) {
      return res.status(400).json({ success: false, error: 'Invalid share ID' });
    }

    const shared = await SharedReport.findOne({ _id: shareId, toUserId: userId });
    if (!shared) {
      return res.status(404).json({ success: false, error: 'Shared report not found' });
    }

    shared.status = 'acknowledged';
    shared.acknowledgedAt = new Date();
    if (!shared.viewedAt) shared.viewedAt = new Date();
    await shared.save();

    res.json({ success: true, message: 'Report acknowledged', status: shared.status });
  } catch (error) {
    console.error('Error acknowledging shared report:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

function calculateAge(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports = router;
