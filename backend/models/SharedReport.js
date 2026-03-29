const mongoose = require('mongoose');

const sharedReportSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'viewed', 'acknowledged'], default: 'pending' },
  sharedAt: { type: Date, default: Date.now },
  viewedAt: { type: Date, default: null },
  acknowledgedAt: { type: Date, default: null }
});

module.exports = mongoose.model('SharedReport', sharedReportSchema);
