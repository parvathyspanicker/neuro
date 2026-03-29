const mongoose = require('mongoose');
const Report = require('../models/Report');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurocare')
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            const report = await Report.findOne().sort({ created_at: -1 });
            if (report) {
                console.log('Latest Report Found:');
                console.log('ID:', report.analysis_id);
                console.log('Date:', report.created_at);
                console.log('Image Path:', report.image_path);
                console.log('Heatmap Image:', report.heatmap_image);
            } else {
                console.log('No reports found.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(console.error);
