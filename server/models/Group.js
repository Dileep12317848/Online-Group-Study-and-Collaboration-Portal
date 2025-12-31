const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['computer-science', 'mathematics', 'physics', 'chemistry', 'biology', 'engineering', 'business', 'arts', 'other'],
    default: 'other'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxMembers: {
    type: Number,
    default: 50
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate invite code before saving - FIXED VERSION
groupSchema.pre('save', function() {
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
});

module.exports = mongoose.model('Group', groupSchema);