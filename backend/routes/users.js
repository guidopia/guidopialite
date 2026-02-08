const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const { awaitConnection } = require('../config/database');

// GET /api/users/students - Get all students for admin dashboard
router.get('/students', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await awaitConnection();
    
    const { page = 1, limit = 50, search = '', class: studentClass = '' } = req.query;
    
    // Build search query
    let searchQuery = { role: 'user' }; // Only get students, not admins
    
    if (search) {
      searchQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (studentClass) {
      searchQuery.class = studentClass;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get students with pagination
    const students = await User.find(searchQuery)
      .select('-password -emailVerificationToken -passwordResetToken -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalStudents = await User.countDocuments(searchQuery);
    
    // Format the response
    const formattedStudents = students.map(student => ({
      id: student._id,
      fullName: student.fullName,
      class: student.class,
      phone: student.phone,
      email: student.email,
      joinedDate: student.createdAt,
      isActive: student.isActive
    }));
    
    res.status(200).json({
      success: true,
      data: {
        students: formattedStudents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalStudents / parseInt(limit)),
          totalStudents,
          hasNext: skip + students.length < totalStudents,
          hasPrev: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/users/stats - Get student statistics for admin dashboard
router.get('/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await awaitConnection();

    // Get total students count
    const totalStudents = await User.countDocuments({ role: 'user' });
    
    // Get students by class
    const studentsByClass = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get active students (logged in within last 30 days)
    const activeStudents = await User.countDocuments({
      role: 'user',
      lastLogin: { $gte: thirtyDaysAgo }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        studentsByClass,
        recentRegistrations,
        activeStudents
      }
    });
    
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/users/classes - Get available classes for filter dropdown
router.get('/classes', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await awaitConnection();

    const classes = await User.distinct('class', { role: 'user' });
    
    res.status(200).json({
      success: true,
      data: classes.sort()
    });
    
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/users/report.pdf - Download students PDF based on filters
router.get('/report.pdf', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { search = '', class: studentClass = '' } = req.query;

    await awaitConnection();

    let searchQuery = { role: 'user' };
    if (search) {
      searchQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (studentClass) {
      searchQuery.class = studentClass;
    }

    const students = await User.find(searchQuery).sort({ createdAt: -1 });
    const totalStudents = await User.countDocuments(searchQuery);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="students-report.pdf"');

    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    doc.pipe(res);

    // Header
    doc.fontSize(18).fillColor('#065f46').text('GUIDOPIA — Admin Student Report', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#374151').text(`Generated: ${new Date().toLocaleString()}`);
    doc.fontSize(10).fillColor('#374151').text(`Total Students: ${totalStudents}`);
    if (studentClass) doc.text(`Class Filter: ${studentClass}`);
    if (search) doc.text(`Search: ${search}`);
    doc.moveDown(0.6);

    // Table header
    const headerY = doc.y;
    const colX = [36, 66, 216, 276, 366, 486];
    const drawCell = (x, y, w, text, bold=false) => {
      doc.rect(x, y, w, 18).strokeColor('#e5e7eb').stroke();
      doc.fontSize(9).fillColor('#111827').font(bold ? 'Helvetica-Bold' : 'Helvetica').text(text, x + 4, y + 4, { width: w - 8, ellipsis: true });
    };

    drawCell(colX[0], headerY, 30, '#', true);
    drawCell(colX[1], headerY, 150, 'Student', true);
    drawCell(colX[2], headerY, 60, 'Class', true);
    drawCell(colX[3], headerY, 90, 'Contact', true);
    drawCell(colX[4], headerY, 120, 'Email', true);
    drawCell(colX[5], headerY, 90, 'Joined', true);

    let y = headerY + 18;
    const rowHeight = 18;

    students.forEach((s, idx) => {
      if (y > doc.page.height - 54) {
        doc.addPage();
        y = 36;
      }
      drawCell(colX[0], y, 30, String(idx + 1));
      drawCell(colX[1], y, 150, s.fullName || '');
      drawCell(colX[2], y, 60, s.class || '');
      drawCell(colX[3], y, 90, s.phone || '');
      drawCell(colX[4], y, 120, s.email || '');
      drawCell(colX[5], y, 90, new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
      y += rowHeight;
    });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: 'Error generating PDF' });
  }
});

module.exports = router;
