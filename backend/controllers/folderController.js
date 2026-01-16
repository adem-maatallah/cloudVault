const { pool } = require('../config/database');

// Get all folders for a user
const getFolders = async (req, res) => {
  try {
    const { userId = 1, parentId } = req.query;
    
    const query = parentId 
      ? 'SELECT * FROM folders WHERE user_id = ? AND parent_folder_id = ? ORDER BY name'
      : 'SELECT * FROM folders WHERE user_id = ? AND parent_folder_id IS NULL ORDER BY name';
    
    const params = parentId ? [userId, parentId] : [userId];
    const [rows] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching folders',
      error: error.message
    });
  }
};

// Get folder by ID with contents
const getFolderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get folder details
    const [folderRows] = await pool.query('SELECT * FROM folders WHERE id = ?', [id]);
    
    if (folderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }
    
    // Get subfolders
    const [subfolders] = await pool.query(
      'SELECT * FROM folders WHERE parent_folder_id = ? ORDER BY name',
      [id]
    );
    
    // Get files in this folder
    const [files] = await pool.query(
      'SELECT * FROM files WHERE folder_id = ? ORDER BY filename',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        folder: folderRows[0],
        subfolders,
        files
      }
    });
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching folder',
      error: error.message
    });
  }
};

// Create new folder
const createFolder = async (req, res) => {
  try {
    const { name, parentFolderId, userId = 1, color = '#4f46e5' } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO folders (name, parent_folder_id, user_id, color) VALUES (?, ?, ?, ?)',
      [name, parentFolderId || null, userId, color]
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, resource_name) VALUES (?, ?, ?, ?, ?)',
      [userId, 'created', 'folder', result.insertId, name]
    );
    
    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: {
        id: result.insertId,
        name,
        parentFolderId,
        userId,
        color
      }
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating folder',
      error: error.message
    });
  }
};

// Update folder
const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    
    const [result] = await pool.query(
      'UPDATE folders SET name = ?, color = ? WHERE id = ?',
      [name, color, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Folder updated successfully'
    });
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating folder',
      error: error.message
    });
  }
};

// Delete folder
const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM folders WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting folder',
      error: error.message
    });
  }
};

module.exports = {
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder
};
