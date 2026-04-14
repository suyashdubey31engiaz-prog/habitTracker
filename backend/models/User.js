const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar:   { type: String, default: '' },
  timezone: { type: String, default: 'Asia/Kolkata' },

  // ── Extended profile ────────────────────────────────────────────────────────
  age:             { type: Number, default: null },
  gender:          { type: String, enum: ['male','female','other','prefer_not'], default: 'prefer_not' },
  dateOfBirth:     { type: Date, default: null },
  diet:            { type: String, enum: ['veg','non_veg','vegan','jain','keto','other'], default: 'non_veg' },
  occupation:      { type: String, enum: ['student','working','freelancer','homemaker','other'], default: 'student' },
  occupationDetail:{ type: String, default: '' },   // school name, company, etc.
  fitnessLevel:    { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  healthGoals:     { type: [String], default: [] }, // ['lose_weight','build_muscle','better_sleep',...]
  allergies:       { type: [String], default: [] },
  waterGoal:       { type: Number, default: 8 },    // glasses per day
  sleepGoal:       { type: Number, default: 8 },    // hours
  weightKg:        { type: Number, default: null },
  heightCm:        { type: Number, default: null },
  city:            { type: String, default: '' },
  bio:             { type: String, default: '' },
  profileComplete: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(p) {
  return bcrypt.compare(p, this.password);
};

// Helper: return safe public fields
userSchema.methods.toPublic = function() {
  return {
    id: this._id, name: this.name, email: this.email, avatar: this.avatar,
    age: this.age, gender: this.gender, diet: this.diet,
    occupation: this.occupation, occupationDetail: this.occupationDetail,
    fitnessLevel: this.fitnessLevel, healthGoals: this.healthGoals,
    allergies: this.allergies, waterGoal: this.waterGoal, sleepGoal: this.sleepGoal,
    weightKg: this.weightKg, heightCm: this.heightCm, city: this.city,
    bio: this.bio, profileComplete: this.profileComplete,
  };
};

module.exports = mongoose.model('User', userSchema);