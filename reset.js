const { resetAll, resetAllocations } = require('./state');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const mode = (body && body.mode) || 'all';
    let result;
    if (mode === 'allocations_only') {
      result = resetAllocations();
    } else {
      result = resetAll();
    }

    return res.status(200).json(result);
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};
