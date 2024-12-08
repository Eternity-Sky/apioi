const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  problemId: {
    type: String,
    required: true,
    index: true
  },
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number,
    default: 1000  // 默认1000ms
  },
  memoryLimit: {
    type: Number,
    default: 256  // 默认256MB
  }
}, {
  timestamps: true
});

// 创建复合索引
testCaseSchema.index({ problemId: 1, isPublic: 1 });

const TestCase = mongoose.model('TestCase', testCaseSchema);

module.exports = TestCase; 