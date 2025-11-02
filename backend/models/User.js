const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { type: String, required: true },
  agencyName: { type: String, required: true },

  isAdmin: { type: Boolean, default: false }
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);