const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// 加载环境变量
dotenv.config();

// 引入数据库连接和路由
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activity');
const pointsRoutes = require('./routes/points');
const pointRuleRoutes = require('./routes/pointRule');
const uploadRoutes = require('./routes/upload');

// 连接数据库
connectDB();

const app = express();

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());



const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // 明确添加 PATCH 和 OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // 处理预检请求（OPTIONS）


app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('Preflight request received:', req.headers);
    res.status(200).end(); // 确保预检请求被正确响应
  } else {
    next();
  }
});

// 日志
app.use(morgan('dev'));

// 静态资源目录
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/points/rules', pointRuleRoutes);
app.use('/api/upload', uploadRoutes);

// 测试接口
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API服务器运行正常',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    uploads: {
      avatarPath: path.join(__dirname, 'public/uploads/avatars'),
      exists: fs.existsSync(path.join(__dirname, 'public/uploads/avatars'))
    }
  });
});

// 错误处理中间件
app.use(errorHandler);

// 捕捉 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `接口不存在: ${req.method} ${req.originalUrl}`,
    timestamp: new Date()
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).json({ success: false, message: err.message });
});

// 最终错误处理（包括文件删除、JWT错误等）
app.use((err, req, res, next) => {
  if (req.file?.path) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) console.error('删除文件失败:', unlinkErr);
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: '数据验证失败',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: '无效的认证令牌'
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: '文件大小不能超过2MB'
    });
  }

  console.error('服务器错误:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 创建必要的目录
const dirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, 'public/uploads'),
  path.join(__dirname, 'public/uploads/avatars'),
  path.join(__dirname, 'public/images'),
  path.join(__dirname, 'public/images/activities')
];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`创建目录: ${dir}`);
  }
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 服务器启动成功！
-----------------------------
端口: ${PORT}
环境: ${process.env.NODE_ENV || 'development'}
测试API: http://localhost:${PORT}/api/test
上传路径: ${path.join(__dirname, 'public/uploads')}
活动图片: ${path.join(__dirname, 'public/images/activities')}
-----------------------------
  `);
});

module.exports = app;
