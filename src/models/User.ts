import mongoose, { Schema, models, model } from 'mongoose';

const SubscriptionSchema = new Schema({
  tier: { type: String, enum: ['free', 'premium'], default: 'free' },
  paypalSubscriptionId: String,
  paypalPayerId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelledAt: Date,
  /** End of 3-day free trial; user is treated as premium until this date */
  trialEndsAt: Date,
}, { _id: false });

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  emailVerified: Date,
  image: String,
  // For email+password auth
  passwordHash: { type: String },
  subscription: { type: SubscriptionSchema, default: () => ({ tier: 'free' }) },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);
