// add near other exports in controllers/experimentController.js
const mongoose = require('mongoose'); // ensure mongoose is required at top of file

/**
 * @route   PUT /api/experiments/:id
 * @desc    Update an experiment (name and variations)
 * @access  PROTECTED
 */
exports.updateExperiment = exports.editExperiment = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { name, variations } = req.body;
    const experimentId = req.params.id;

    if (!name && !variations) {
      return res.status(400).json({ message: 'Nothing to update. Provide name and/or variations.' });
    }

    // simple validations
    if (variations && (!Array.isArray(variations) || variations.length < 2)) {
      return res.status(400).json({ message: 'Experiment must have at least 2 variations.' });
    }

    const experiment = await Experiment.findById(experimentId);
    if (!experiment) return res.status(404).json({ message: 'Experiment not found' });

    // authorization: user must own the experiment
    if (String(experiment.user) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this experiment' });
    }

    // Start transaction if supported (helps keep experiment + dailyStat changes consistent)
    await session.startTransaction();

    // Update name if provided
    if (name) experiment.name = name;

    // If variations provided, merge them with existing preserving trials/successes where possible
    if (variations) {
      // Build lookup of existing variations by id and by name
      const existingById = new Map();
      const existingByName = new Map();
      experiment.variations.forEach(v => {
        if (v._id) existingById.set(String(v._id), v);
        existingByName.set(v.name, v);
      });

      const newVariations = [];
      const seenExistingIds = new Set();

      for (const v of variations) {
        // client may pass { _id, name } or { name }
        if (v._id && existingById.has(String(v._id))) {
          const ex = existingById.get(String(v._id));
          ex.name = v.name || ex.name;
          newVariations.push({
            _id: ex._id,
            name: ex.name,
            trials: ex.trials || 0,
            successes: ex.successes || 0
          });
          seenExistingIds.add(String(ex._id));
        } else if (existingByName.has(v.name)) {
          // match by name (case-sensitive). If you want case-insensitive, normalize.
          const ex = existingByName.get(v.name);
          newVariations.push({
            _id: ex._id,
            name: ex.name,
            trials: ex.trials || 0,
            successes: ex.successes || 0
          });
          if (ex._id) seenExistingIds.add(String(ex._id));
        } else {
          // brand new variation
          newVariations.push({
            name: v.name,
            trials: 0,
            successes: 0
          });
        }
      }

      // Identify removed variations: those existing IDs not in seenExistingIds
      const removedVariationIds = experiment.variations
        .filter(v => v._id && !seenExistingIds.has(String(v._id)))
        .map(v => v._id);

      // Replace experiment variations with new array
      experiment.variations = newVariations;

      // Persist and clean up DailyStat entries for removed variations
      if (removedVariationIds.length > 0) {
        await DailyStat.deleteMany({
          experiment: experiment._id,
          variation: { $in: removedVariationIds }
        }).session(session);
      }
    }

    // Save experiment within session
    await experiment.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: 'Experiment updated', experiment });
  } catch (err) {
    try {
      await session.abortTransaction();
      session.endSession();
    } catch (e) {
      // ignore
    }
    console.error('❌ Error updating experiment:', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Error updating experiment', error: err.message });
  }
};
