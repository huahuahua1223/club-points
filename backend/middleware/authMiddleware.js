const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

// 身份验证中间件
const protect = async (req, res, next) => {
  try {
    // 获取token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('未登录，请先登录以获取访问权限', 401));
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 查找用户
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('用户不存在', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// 权限控制中间件
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('您没有权限执行此操作', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo }; 