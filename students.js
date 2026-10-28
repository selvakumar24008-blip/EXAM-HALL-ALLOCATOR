const { getStudents, addStudent, addStudentsBatch } = require('./state');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const students = getStudents();
    return res.status(200).json({
      success: true,
      count: students.length,
      students: students
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

    // Check if batch import from Excel/CSV
    if (body && (Array.isArray(body) || Array.isArray(body.students))) {
      const list = Array.isArray(body) ? body : body.students;
      const result = addStudentsBatch(list);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    }

    const { regNo, name, department } = body || {};
    const result = addStudent(regNo, name, department);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};

