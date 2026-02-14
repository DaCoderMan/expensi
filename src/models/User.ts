import mongoose, { Schema, models, model } from 'mongoose';

const SubscriptionSchema = new Schema({
  tier: { type: String, enum: ['free', 'premium'], default: 'free' },
  paypalSubscriptionId: String,
  paypalPayerId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelledAt: Date,
}, { _id: false });

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  emailVerified: Date,
  image: String,
  subscription: { type: SubscriptionSchema, default: () => ({ tier: 'free' }) },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);
