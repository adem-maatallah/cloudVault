const { pool } = require('../config/database');

// Get recent activity for a user
const getActivity = async (req, res) => {
  try {
    const { userId = 1, limit = 20 } = req.query;
    
    const [rows] = await pool.query(
      'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, parseInt(limit)]
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
      error: error.message
    });
  }
};

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const { userId = 1 } = req.query;
    
    // Get user storage info
    const [userRows] = await pool.query(
      'SELECT storage_used, storage_limit FROM users WHERE id = ?',
      [userId]
    );
    
    // Get file count
    const [fileCount] = await pool.query(
      'SELECT COUNT(*) as count FROM files WHERE user_id = ?',
      [userId]
    );
    
    // Get folder count
    const [folderCount] = await pool.query(
      'SELECT COUNT(*) as count FROM folders WHERE user_id = ?',
      [userId]
    );
    
    // Get shared files count (shared with me)
    const [sharedCount] = await pool.query(
      'SELECT COUNT(*) as count FROM file_shares WHERE shared_with_user_id = ?',
      [userId]
    );
    
    // Get files by type
    const [filesByType] = await pool.query(`
      SELECT 
        CASE 
          WHEN file_type LIKE 'image/%' THEN 'Images'
          WHEN file_type LIKE 'video/%' THEN 'Videos'
          WHEN file_type LIKE 'audio/%' THEN 'Audio'
          WHEN file_type LIKE '%pdf%' THEN 'Documents'
          WHEN file_type LIKE '%word%' OR file_type LIKE '%document%' THEN 'Documents'
          WHEN file_type LIKE '%sheet%' OR file_type LIKE '%excel%' THEN 'Spreadsheets'
          WHEN file_type LIKE '%presentation%' OR file_type LIKE '%powerpoint%' THEN 'Presentations'
          ELSE 'Other'
        END as category,
        COUNT(*) as count,
        SUM(file_size) as total_size
      FROM files
      WHERE user_id = ?
      GROUP BY category
    `, [userId]);
    
    // Get recent files
    const [recentFiles] = await pool.query(
      'SELECT id, filename, file_size, file_type, upload_date FROM files WHERE user_id = ? ORDER BY upload_date DESC LIMIT 5',
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        storage: {
          used: (userRows && userRows[0] && userRows[0].storage_used) ? userRows[0].storage_used : 0,
          limit: (userRows && userRows[0] && userRows[0].storage_limit) ? userRows[0].storage_limit : 10737418240,
          percentage: ((((userRows && userRows[0] && userRows[0].storage_used) ? userRows[0].storage_used : 0) /
                      ((userRows && userRows[0] && userRows[0].storage_limit) ? userRows[0].storage_limit : 10737418240)) * 100).toFixed(2)
                  },
        counts: {
          files: fileCount[0].count,
          folders: folderCount[0].count,
          shared: sharedCount[0].count
        },
        filesByType,
        recentFiles
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  getActivity,
  getStats
};
