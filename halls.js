const { getHalls, addHall } = require('./state');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const halls = getHalls();
    const totalCapacity = halls.reduce((sum, h) => sum + (Number(h.capacity) || 0), 0);
    const totalOccupied = halls.reduce((sum, h) => sum + (Number(h.occupiedSeats) || 0), 0);
    const totalAvailable = Math.max(0, totalCapacity - totalOccupied);

    return res.status(200).json({
      success: true,
      count: halls.length,
      totalCapacity,
      totalOccupied,
      totalAvailable,
      halls: halls
    });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid JSON body' });
      }
    }

    const { hallNo, capacity } = body || {};
    const result = addHall(hallNo, capacity);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};
