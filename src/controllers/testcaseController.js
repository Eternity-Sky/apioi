// 使用内存存储
const testcases = [];

exports.createTestcase = async (req, res) => {
  try {
    const testcase = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    };
    testcases.push(testcase);
    res.status(201).json(testcase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTestcases = async (req, res) => {
  try {
    res.json(testcases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 