const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

// 验证用户是否已登录
exports.protect = async (req, res, next) => {
  try {
    // 1) 获取 token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('请先登录', 401));
    }

    // 2) 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) 检查用户是否存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('用户不存在', 401));
    }

    // 4) 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('无效的认证令牌', 401));
  }
};

// 验证用户角色
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('没有权限执行此操作', 403));
    }
    next();
  };
};