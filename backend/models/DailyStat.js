const mongoose = require('mongoose');
const { Schema } = mongoose;

const dailyStatSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  experiment: { type: Schema.Types.ObjectId, ref: 'Experiment', required: true },
  variation: { type: Schema.Types.ObjectId, required: true },
  variationName: { type: String, required: true },
  date: { type: Date, required: true },
  trials: { type: Number, default: 0 },
  successes: { type: Number, default: 0 }
});

dailyStatSchema.index({ experiment: 1, variation: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyStat', dailyStatSchema);