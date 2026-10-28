const { getStudents, getHalls } = require('./state');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const students = getStudents();
    const halls = getHalls();

    const allocatedStudents = students.filter(s => s.isAllocated);

    const studentWiseReport = allocatedStudents.map(s => ({
      regNo: s.regNo,
      name: s.name,
      department: s.department,
      hallNo: s.allocatedHall,
      seatNumber: s.seatNumber
    }));

    const hallWiseReport = halls.map(h => ({
      hallNo: h.hallNo,
      capacity: h.capacity,
      occupiedSeats: h.occupiedSeats,
      availableSeats: h.availableSeats,
      allocatedStudents: h.allocatedStudents || []
    }));

    return res.status(200).json({
      success: true,
      hasAllocations: allocatedStudents.length > 0,
      totalAllocated: allocatedStudents.length,
      studentWiseReport,
      hallWiseReport
    });
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};
