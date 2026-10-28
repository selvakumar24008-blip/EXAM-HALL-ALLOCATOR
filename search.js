const { searchStudent } = require('./state');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Read regNo from query or url
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const regNo = url.searchParams.get('regNo') || (req.query && req.query.regNo);

    const result = searchStudent(regNo);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};
