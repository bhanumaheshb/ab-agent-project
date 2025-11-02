const mongoose = require('mongoose');
const { Schema } = mongoose;

// This defines the structure for a single variation
const variationSchema = new Schema({
  name: { type: String, required: true },
  trials: { type: Number, default: 0 },
  successes: { type: Number, default: 0 }
});

// This defines the main Experiment
const experimentSchema = new Schema({
  name: { type: String, required: true, trim: true },
  status: { type: String, enum: ['running', 'paused', 'ended'], default: 'running' },

  // --- ADD THESE TWO LINES user project  ---
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },

  // An array of variations using the schema above
  variations: [variationSchema]
}, { timestamps: true });

// 'timestamps: true' automatically adds 'createdAt' and 'updatedAt' fields

module.exports = mongoose.model('Experiment', experimentSchema);