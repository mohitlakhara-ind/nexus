const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  aiInterventionCount: { type: Number, default: 0 }, // Track max 3 visits per user
  autoSave: { type: Boolean, default: true }, // Phase 13 auto-save preference
  xp: { type: Number, default: 0 }, // Phase 15 gamification
  level: { type: Number, default: 1 } // Phase 15 gamification
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
