const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  points: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['activity', 'bonus', 'penalty'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Points', pointsSchema); 