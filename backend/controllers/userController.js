const { pool } = require('../config/database');

// Get all users
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

//Get user profile with statistics
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [userRows] = await pool.query(
      'SELECT id, name, email, avatar_url, storage_used, storage_limit, last_login, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get file count
    const [fileCount] = await pool.query(
      'SELECT COUNT(*) as count FROM files WHERE user_id = ?',
      [id]
    );
    
    // Get folder count
    const [folderCount] = await pool.query(
      'SELECT COUNT(*) as count FROM folders WHERE user_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...userRows[0],
        fileCount: fileCount[0].count,
        folderCount: folderCount[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile
};
