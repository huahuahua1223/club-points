const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, restrictTo } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/uploads/avatars';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('请上传图片文件'));
    }
  }
});

// 注册路由
router.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    const { 
      username, 
      password,
      class: className,
      phone,
      college,
      email,
      studentId,
      role // 添加角色字段
    } = req.body;

    // 检查基本必填字段
    if (!username || !password || !phone || !email) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        status: 'error',
        message: '请填写所有必填字段' 
      });
    }

    // 如果是学生角色，检查学生特有字段
    if (role === 'student' && (!className || !college || !studentId)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        status: 'error',
        message: '请填写所有学生信息字段' 
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      $or: [
        { username },
        { email },
        ...(studentId ? [{ studentId }] : []) // 只在有学号时检查学号
      ]
    });

    if (existingUser) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        status: 'error',
        message: '用户名、邮箱或学号已存在' 
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        status: 'error',
        message: '邮箱格式不正确' 
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        status: 'error',
        message: '手机号格式不正确' 
      });
    }

    // 创建用户数据对象
    const userData = {
      username,
      password,
      phone,
      email,
      role: role || 'student', // 默认为学生角色
      status: 'active',
      avatar: req.file ? `/uploads/avatars/${req.file.filename}` : ''
    };

    // 如果是学生角色，添加学生特有字段
    if (role === 'student') {
      userData.class = className;
      userData.college = college;
      userData.studentId = studentId;
      userData.points = 0;
    }

    // 创建新用户
    const user = new User(userData);
    await user.save();

    res.status(201).json({
      status: 'success',
      message: '注册成功，请登录',
      data: {
        user: {
          username: user.username,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    // 如果出错且上传了文件，删除文件
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('注册错误:', error);
    res.status(500).json({ 
      status: 'error',
      message: '注册失败', 
      error: error.message 
    });
  }
});

// 登录路由
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查必填字段
    if (!username || !password) {
      return res.status(400).json({ 
        status: 'error',
        message: '请输入用户名和密码' 
      });
    }

    // 查找用户（支持使用用户名、邮箱或学号登录）
    const user = await User.findOne({
      $or: [
        { username },
        { email: username },
        { studentId: username }
      ]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        status: 'error',
        message: '用户名或密码错误' 
      });
    }

    // 检查用户状态
    if (user.status === 'inactive') {
      return res.status(401).json({ 
        status: 'error',
        message: '账号已被禁用，请联系管理员' 
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 移除密码字段
    user.password = undefined;

    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          class: user.class,
          phone: user.phone,
          college: user.college,
          email: user.email,
          studentId: user.studentId,
          points: user.points,
          avatar: user.avatar,
          lastLoginAt: user.lastLoginAt
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      status: 'error',
      message: '登录失败', 
      error: error.message 
    });
  }
});

// 获取当前用户信息
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('activities.activity');

    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: '用户不存在' 
      });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          class: user.class,
          phone: user.phone,
          college: user.college,
          email: user.email,
          studentId: user.studentId,
          points: user.points,
          avatar: user.avatar,
          activities: user.activities,
          pointsHistory: user.pointsHistory,
          lastLoginAt: user.lastLoginAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: '获取用户信息失败', 
      error: error.message 
    });
  }
});

// 更新个人资料
router.put('/update-profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { class: className, phone, email, college, studentId } = req.body;
    const userId = req.user.id;

    console.log('Update profile request received:', req.body);
    console.log('User ID:', userId);
    console.log('File:', req.file);

    // 验证邮箱格式
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        status: 'error',
        message: '邮箱格式不正确' 
      });
    }

    // 验证手机号格式
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        status: 'error',
        message: '手机号格式不正确' 
      });
    }

    // 获取当前用户信息
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ 
        status: 'error',
        message: '用户不存在' 
      });
    }

    // 检查邮箱是否被其他用户使用
    if (email && email !== currentUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          status: 'error',
          message: '该邮箱已被使用' 
        });
      }
    }

    // 构建更新对象
    const updateData = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    
    // 学生特定字段
    if (currentUser.role === 'student') {
      if (className) updateData.class = className;
      if (college) updateData.college = college;
      // 学号通常不允许修改，但如果需要，可以取消下面的注释
      // if (studentId) updateData.studentId = studentId;
    }
    
    // 处理头像更新
    if (req.file) {
      // 删除旧头像，但只删除不是默认头像的情况
      if (currentUser.avatar && !currentUser.avatar.includes('default-avatar')) {
        const oldAvatarPath = path.join(__dirname, '../public', currentUser.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // 更新用户信息并返回完整的用户数据
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    console.log('Updated user:', updatedUser);

    // 确保返回完整的用户信息
    res.json({
      success: true,
      status: 'success',
      message: '个人信息更新成功',
      data: {
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          class: updatedUser.class,
          college: updatedUser.college,
          studentId: updatedUser.studentId,
          points: updatedUser.points,
          status: updatedUser.status
        }
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('更新个人信息错误:', error);
    res.status(500).json({ 
      success: false,
      status: 'error',
      message: '更新失败', 
      error: error.message 
    });
  }
});

// 管理员获取所有学生信息
router.get('/students', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { search, sort = '-points', page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    let query = { role: 'student' };
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
        { college: new RegExp(search, 'i') },
        { class: new RegExp(search, 'i') }
      ];
    }

    // 计算总数
    const total = await User.countDocuments(query);

    // 执行分页查询
    const students = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      status: 'success',
      data: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        students
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: '获取学生列表失败', 
      error: error.message 
    });
  }
});

// 删除用户
router.delete('/users/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 删除用户头像
    if (user.avatar) {
      const avatarPath = path.join('public', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await user.deleteOne();

    res.json({
      status: 'success',
      message: '用户删除成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '删除用户失败',
      error: error.message
    });
  }
});

// 修改密码
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 获取用户信息（包含密码字段）
    const user = await User.findById(req.user.id).select('+password');

    // 验证当前密码
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: '当前密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: '密码修改成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '密码修改失败',
      error: error.message
    });
  }
});

// 管理员编辑用户信息
router.put('/users/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { username, email, phone, studentId, college, class: className } = req.body;
    const userId = req.params.id;

    // 获取要编辑的用户
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 验证邮箱格式
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: '邮箱格式不正确'
      });
    }

    // 验证手机号格式
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: '手机号格式不正确'
      });
    }

    // 检查邮箱是否被其他用户使用
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({
          status: 'error',
          message: '该邮箱已被使用'
        });
      }
    }

    // 检查学号是否被其他用户使用
    if (studentId && studentId !== user.studentId) {
      const studentIdExists = await User.findOne({ studentId, _id: { $ne: userId } });
      if (studentIdExists) {
        return res.status(400).json({
          status: 'error',
          message: '该学号已被使用'
        });
      }
    }

    // 构建更新对象
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (studentId) updateData.studentId = studentId;
    if (college) updateData.college = college;
    if (className) updateData.class = className;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      status: 'success',
      message: '用户信息更新成功',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '更新失败',
      error: error.message
    });
  }
});

module.exports = router;