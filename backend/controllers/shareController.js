const { pool } = require('../config/database');

// Get shares for a user (files shared with them)
const getSharedWithMe = async (req, res) => {
  try {
    const { userId = 1 } = req.query;
    
    const [rows] = await pool.query(`
      SELECT 
        fs.*,
        f.filename,
        f.file_size,
        f.file_type,
        f.upload_date,
        u.name as shared_by_name,
        u.email as shared_by_email
      FROM file_shares fs
      JOIN files f ON fs.file_id = f.id
      JOIN users u ON fs.shared_by_user_id = u.id
      WHERE fs.shared_with_user_id = ?
      ORDER BY fs.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching shared files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shared files',
      error: error.message
    });
  }
};

// Get shares by a user (files they shared)
const getSharedByMe = async (req, res) => {
  try {
    const { userId = 1 } = req.query;
    
    const [rows] = await pool.query(`
      SELECT 
        fs.*,
        f.filename,
        f.file_size,
        f.file_type,
        u.name as shared_with_name,
        u.email as shared_with_email
      FROM file_shares fs
      JOIN files f ON fs.file_id = f.id
      JOIN users u ON fs.shared_with_user_id = u.id
      WHERE fs.shared_by_user_id = ?
      ORDER BY fs.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching shared files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shared files',
      error: error.message
    });
  }
};

// Share a file
const shareFile = async (req, res) => {
  try {
    const { fileId, sharedByUserId = 1, sharedWithUserId, permission = 'view' } = req.body;
    
    if (!fileId || !sharedWithUserId) {
      return res.status(400).json({
        success: false,
        message: 'File ID and recipient user ID are required'
      });
    }
    
    // Check if file belongs to the user
    const [fileCheck] = await pool.query(
      'SELECT filename FROM files WHERE id = ? AND user_id = ?',
      [fileId, sharedByUserId]
    );
    
    if (fileCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'File not found or you do not have permission'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO file_shares (file_id, shared_by_user_id, shared_with_user_id, permission) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE permission = ?',
      [fileId, sharedByUserId, sharedWithUserId, permission, permission]
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, resource_name, details) VALUES (?, ?, ?, ?, ?, ?)',
      [sharedByUserId, 'shared', 'file', fileId, fileCheck[0].filename, `Shared with user ${sharedWithUserId}`]
    );
    
    res.status(201).json({
      success: true,
      message: 'File shared successfully'
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing file',
      error: error.message
    });
  }
};

// Unshare a file
const unshareFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM file_shares WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    
    res.json({
      success: true,
      message: 'File unshared successfully'
    });
  } catch (error) {
    console.error('Error unsharing file:', error);
    res.status(500).json({
      success: false,
      message: 'Error unsharing file',
      error: error.message
    });
  }
};

module.exports = {
  getSharedWithMe,
  getSharedByMe,
  shareFile,
  unshareFile
};
