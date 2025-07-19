const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'txt']
  },
  content: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  analysis: {
    summary: String,
    suspiciousClauses: [{
      clause: String,
      reason: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      location: String
    }],
    keyTerms: [String],
    recommendations: [String],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    analyzedAt: Date
  },
  isAnalyzed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
documentSchema.index({ uploadedAt: -1 });
documentSchema.index({ isAnalyzed: 1 });
documentSchema.index({ 'analysis.riskScore': -1 });

module.exports = mongoose.model('Document', documentSchema);