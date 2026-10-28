const { exportReportText } = require('./state');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const reportText = exportReportText();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Exam_Seating_Report.txt"');
    return res.status(200).send(reportText);
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};
