// 使用内存存储
const submissions = [];

exports.createSubmission = async (req, res) => {
  try {
    const submission = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    };
    submissions.push(submission);
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 