const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema(
  {
    target: {
      type: String,
      required: true,
      trim: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      required: true,
      enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'],
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    scanDuration: {
      type: String,
      default: null,
    },
    summary: {
      openPortsCount: { type: Number, default: 0 },
      resolvedSubdomainsCount: { type: Number, default: 0 },
      httpsEnabled: { type: Boolean, default: false },
      certValid: { type: Boolean, default: false },
    },
  }
);

module.exports = mongoose.model('ScanHistory', scanHistorySchema);