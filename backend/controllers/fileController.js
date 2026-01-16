const { pool } = require('../config/database');

// Get all files for a user
const getFiles = async (req, res) => {
  try {
    const { userId = 1, folderId, favorite } = req.query;
    
    let query = 'SELECT * FROM files WHERE user_id = ?';
    const params = [userId];
    
    if (folderId) {
      query += ' AND folder_id = ?';
      params.push(folderId);
    }
    
    if (favorite === 'true') {
      query += ' AND is_favorite = TRUE';
    }
    
    query += ' ORDER BY upload_date DESC';
    
    const [rows] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files',
      error: error.message
    });
  }
};

// Get file by ID
const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(`
      SELECT 
        f.*,
        u.name as owner_name,
        u.email as owner_email,
        fo.name as folder_name
      FROM files f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN folders fo ON f.folder_id = fo.id
      WHERE f.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file',
      error: error.message
    });
  }
};

// Create new file (simulate upload)
const createFile = async (req, res) => {
  try {
    const { 
      filename, 
      fileSize, 
      fileType, 
      folderId, 
      userId = 1, 
      description 
    } = req.body;
    
    if (!filename || !fileSize) {
      return res.status(400).json({
        success: false,
        message: 'Filename and file size are required'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO files (filename, file_size, file_type, folder_id, user_id, description) VALUES (?, ?, ?, ?, ?, ?)',
      [filename, fileSize, fileType || 'application/octet-stream', folderId || null, userId, description || null]
    );
    
    // Update user storage
    await pool.query(
      'UPDATE users SET storage_used = storage_used + ? WHERE id = ?',
      [fileSize, userId]
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, resource_name, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'uploaded', 'file', result.insertId, filename, `Uploaded ${(fileSize / 1024 / 1024).toFixed(2)} MB`]
    );
    
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: result.insertId,
        filename,
        fileSize,
        fileType
      }
    });
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating file',
      error: error.message
    });
  }
};

// Update file
const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { filename, description, folderId, isFavorite } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (filename !== undefined) {
      updateFields.push('filename = ?');
      params.push(filename);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      params.push(description);
    }
    if (folderId !== undefined) {
      updateFields.push('folder_id = ?');
      params.push(folderId);
    }
    if (isFavorite !== undefined) {
      updateFields.push('is_favorite = ?');
      params.push(isFavorite);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    params.push(id);
    
    const [result] = await pool.query(
      `UPDATE files SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    res.json({
      success: true,
      message: 'File updated successfully'
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating file',
      error: error.message
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file info before deleting
    const [fileRows] = await pool.query('SELECT file_size, user_id FROM files WHERE id = ?', [id]);
    
    if (fileRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const { file_size, user_id } = fileRows[0];
    
    // Delete file
    await pool.query('DELETE FROM files WHERE id = ?', [id]);
    
    // Update user storage
    await pool.query(
      'UPDATE users SET storage_used = storage_used - ? WHERE id = ?',
      [file_size, user_id]
    );
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};

// Search files
const searchFiles = async (req, res) => {
  try {
    const { query, userId = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const [rows] = await pool.query(`
      SELECT f.*, fo.name as folder_name
      FROM files f
      LEFT JOIN folders fo ON f.folder_id = fo.id
      WHERE f.user_id = ? AND (f.filename LIKE ? OR f.description LIKE ?)
      ORDER BY f.upload_date DESC
    `, [userId, `%${query}%`, `%${query}%`]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error searching files:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching files',
      error: error.message
    });
  }
};

module.exports = {
  getFiles,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  searchFiles
};
