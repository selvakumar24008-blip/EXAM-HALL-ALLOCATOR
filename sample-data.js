const { loadSampleData } = require('./state');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const result = loadSampleData();
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};
