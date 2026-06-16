-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- 主机： localhost:3306
-- 生成日期： 2026-06-01 21:05:18
-- 服务器版本： 5.7.38-log
-- PHP 版本： 7.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 数据库： `cs13`
--

-- --------------------------------------------------------

--
-- 表的结构 `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL COMMENT '班级ID',
  `name` varchar(50) NOT NULL COMMENT '班级名称',
  `grade` varchar(20) NOT NULL COMMENT '年级',
  `major` varchar(50) NOT NULL COMMENT '专业',
  `studentCount` int(11) DEFAULT '0' COMMENT '学生人数',
  `courses` json DEFAULT NULL COMMENT '绑定的课程列表',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级信息表';

--
-- 转存表中的数据 `classes`
--

INSERT INTO `classes` (`id`, `name`, `grade`, `major`, `studentCount`, `courses`, `createTime`) VALUES
(1, '计算机2301班', '2023级', '计算机科学与技术', 45, '[\"软件工程\", \"计算机网络\", \"数据库原理\"]', '2026-05-27 17:20:43'),
(2, '计算机2302班', '2023级', '计算机科学与技术', 43, '[\"高等数学\", \"操作系统\", \"数据库原理\"]', '2026-05-27 17:20:43'),
(3, '计算机2303班', '2023级', '计算机科学与技术', 44, '[\"高等数学\", \"软件工程\", \"人工智能\", \"数据库原理\"]', '2026-05-27 17:20:43'),
(4, '软件2301班', '2023级', '软件工程', 42, '[\"数据结构\", \"计算机网络\", \"机器学习\"]', '2026-05-27 17:20:43'),
(8, '计算机科学2021级1班', '2021', '计算机科学与技术', 30, '[\"高等数学\", \"数据结构\", \"计算机网络\", \"操作系统\"]', '2026-05-27 18:49:42'),
(9, '计算机科学2021级2班', '2021', '计算机科学与技术', 28, '[\"高等数学\", \"数据库原理\", \"软件工程\", \"计算机网络\"]', '2026-05-27 18:49:42'),
(10, '软件工程2021级1班', '2021', '软件工程', 32, '[\"数据结构\", \"计算机网络\", \"人工智能\", \"机器学习\"]', '2026-05-27 18:49:42'),
(11, '数据科学2021级1班', '2021', '数据科学与大数据技术', 25, '[\"高等数学\", \"操作系统\", \"数据库原理\"]', '2026-05-27 18:49:42');

-- --------------------------------------------------------

--
-- 表的结构 `classrooms`
--

CREATE TABLE `classrooms` (
  `id` int(11) NOT NULL COMMENT '教室ID',
  `name` varchar(50) NOT NULL COMMENT '教室名称',
  `building` varchar(50) NOT NULL COMMENT '所在楼栋',
  `capacity` int(11) NOT NULL DEFAULT '50' COMMENT '容纳人数',
  `type` varchar(20) NOT NULL DEFAULT '普通教室' COMMENT '教室类型',
  `facilities` text COMMENT '设施设备（JSON格式）',
  `status` varchar(20) NOT NULL DEFAULT '空闲' COMMENT '状态（空闲/使用中）',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教室信息表';

--
-- 转存表中的数据 `classrooms`
--

INSERT INTO `classrooms` (`id`, `name`, `building`, `capacity`, `type`, `facilities`, `status`, `createTime`) VALUES
(1, 'A101', '教学楼A', 61, '多媒体教室', '[\"投影仪\",\"空调\",\"电脑\",\"实验设备\",\"黑板\"]', '空闲', '2026-05-27 18:10:38'),
(2, 'A201', '教学楼A', 80, '多媒体教室', '[\"投影仪\", \"空调\", \"电脑\"]', '空闲', '2026-05-27 18:10:38'),
(3, 'B101', '教学楼B', 50, '普通教室', '[\"投影仪\"]', '空闲', '2026-05-27 18:10:38'),
(4, 'B202', '教学楼B', 100, '阶梯教室', '[\"投影仪\", \"空调\", \"音响\"]', '空闲', '2026-05-27 18:10:38'),
(5, 'C301', '实验楼C', 40, '实验室', '[\"投影仪\", \"实验设备\"]', '空闲', '2026-05-27 18:10:38');

-- --------------------------------------------------------

--
-- 表的结构 `classroom_bookings`
--

CREATE TABLE `classroom_bookings` (
  `id` int(11) NOT NULL COMMENT '借用记录ID',
  `classroomId` int(11) NOT NULL COMMENT '教室ID',
  `classroomName` varchar(50) NOT NULL COMMENT '教室名称',
  `building` varchar(50) NOT NULL COMMENT '所在楼栋',
  `borrower` varchar(50) NOT NULL COMMENT '借用者',
  `purpose` text COMMENT '借用用途',
  `startTime` datetime NOT NULL COMMENT '开始时间',
  `endTime` datetime NOT NULL COMMENT '结束时间',
  `status` varchar(20) NOT NULL DEFAULT '进行中' COMMENT '状态（进行中/已结束）',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `borrowerId` int(11) DEFAULT NULL,
  `borrowerRole` varchar(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教室借用记录表';

--
-- 转存表中的数据 `classroom_bookings`
--

INSERT INTO `classroom_bookings` (`id`, `classroomId`, `classroomName`, `building`, `borrower`, `purpose`, `startTime`, `endTime`, `status`, `createTime`, `borrowerId`, `borrowerRole`) VALUES
(1, 1, 'A101', '教学楼A', '11', '1111', '2026-05-03 00:00:00', '2026-05-27 00:00:00', '已结束', '2026-05-27 21:05:05', NULL, NULL),
(2, 1, 'A101', '教学楼A', '111', '11', '2026-05-03 00:00:00', '2026-05-27 00:00:00', '已拒绝', '2026-05-27 23:32:17', NULL, NULL),
(3, 1, 'A101', '教学楼A', 'admin', '111111111', '2026-05-04 00:00:00', '2026-05-28 00:00:00', '已结束', '2026-05-28 00:36:04', 1, 'admin'),
(4, 1, 'A101', '教学楼A', '李四', '111', '2026-05-03 00:00:00', '2026-05-28 00:00:00', '待审批', '2026-05-28 08:19:23', 2, 'student');

-- --------------------------------------------------------

--
-- 表的结构 `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL COMMENT '课程ID',
  `name` varchar(50) NOT NULL COMMENT '课程名称',
  `teacher` varchar(50) NOT NULL COMMENT '授课教师',
  `credit` int(11) NOT NULL DEFAULT '3' COMMENT '学分',
  `hours` int(11) NOT NULL DEFAULT '48' COMMENT '课时',
  `classroom` varchar(100) DEFAULT NULL COMMENT '教室',
  `description` text COMMENT '课程描述',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程信息表';

--
-- 转存表中的数据 `courses`
--

INSERT INTO `courses` (`id`, `name`, `teacher`, `credit`, `hours`, `classroom`, `description`, `createTime`) VALUES
(1, '高等数学', '张教授', 8, 64, 'D401 - 综合楼D', '高等数学是理工科专业的基础课程', '2026-05-27 19:19:49'),
(2, '数据结构', '李教授', 3, 48, 'A201 - 教学楼A', '数据结构是计算机专业的核心课程', '2026-05-27 19:19:49'),
(3, '计算机网络', '王教授', 3, 48, 'A201 - 教学楼A', '计算机网络是网络工程专业必修课', '2026-05-27 19:19:49'),
(4, '软件工程', '赵教授', 3, 48, 'C301 - 实验楼C', '软件工程是软件工程专业核心课程', '2026-05-27 19:19:49'),
(5, '数据库原理', '刘教授', 2, 48, 'D401 - 综合楼D', '数据库原理是计算机专业基础课程', '2026-05-27 19:19:49'),
(6, '操作系统', '陈教授', 3, 48, 'A201 - 教学楼A', '操作系统是计算机专业核心课程', '2026-05-27 19:19:49'),
(7, 'Java程序设计', '杨教授', 3, 48, 'A201 - 教学楼A', 'Java程序设计是软件工程专业必修课', '2026-05-27 19:19:49'),
(8, 'Python程序设计', '黄教授', 2, 32, 'B202 - 教学楼B', 'Python程序设计是数据科学专业基础课', '2026-05-27 19:19:49');

-- --------------------------------------------------------

--
-- 表的结构 `evaluations`
--

CREATE TABLE `evaluations` (
  `id` int(11) NOT NULL COMMENT '评教ID',
  `studentId` int(11) NOT NULL COMMENT '学生ID',
  `studentNo` varchar(20) NOT NULL COMMENT '学号',
  `studentName` varchar(50) NOT NULL COMMENT '学生姓名',
  `courseId` int(11) NOT NULL COMMENT '课程ID',
  `courseName` varchar(50) NOT NULL COMMENT '课程名称',
  `teacher` varchar(50) NOT NULL COMMENT '授课教师',
  `semester` varchar(20) NOT NULL COMMENT '学期',
  `teachingScore` int(11) NOT NULL COMMENT '教学水平评分（1-5）',
  `contentScore` int(11) NOT NULL COMMENT '课程内容评分（1-5）',
  `interactionScore` int(11) NOT NULL COMMENT '课堂互动评分（1-5）',
  `attitudeScore` int(11) NOT NULL COMMENT '教学态度评分（1-5）',
  `overallScore` decimal(3,2) NOT NULL COMMENT '总体评分',
  `comment` text COMMENT '文字评价',
  `status` varchar(20) NOT NULL DEFAULT '未评教' COMMENT '状态（未评教/已评教）',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `evaluationTime` datetime DEFAULT NULL COMMENT '评教时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评教信息表';

-- --------------------------------------------------------

--
-- 表的结构 `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL COMMENT '学生ID',
  `studentNo` varchar(20) NOT NULL COMMENT '学号',
  `password` varchar(255) NOT NULL DEFAULT 'e10adc3949ba59abbe56e057f20f883e' COMMENT '密码（默认为123456的MD5）',
  `name` varchar(50) NOT NULL COMMENT '学生姓名',
  `gender` varchar(10) NOT NULL COMMENT '性别',
  `classId` int(11) NOT NULL COMMENT '班级ID',
  `className` varchar(50) NOT NULL COMMENT '班级名称',
  `major` varchar(50) DEFAULT NULL COMMENT '专业',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `email` varchar(50) DEFAULT NULL COMMENT '邮箱',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生信息表';

--
-- 转存表中的数据 `students`
--

INSERT INTO `students` (`id`, `studentNo`, `password`, `name`, `gender`, `classId`, `className`, `major`, `phone`, `email`, `createTime`) VALUES
(2, '2021002', 'e10adc3949ba59abbe56e057f20f883e', '李四', '女', 1, '计算机2301班', '计算机科学与技术', '13800138002', 'lisi@example.com', '2026-05-27 18:34:59'),
(3, '2021003', 'e10adc3949ba59abbe56e057f20f883e', '王五', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138003', 'wangwu@example.com', '2026-05-27 18:34:59'),
(4, '2021004', 'e10adc3949ba59abbe56e057f20f883e', '赵六', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138004', 'zhaoliu@example.com', '2026-05-27 18:34:59'),
(35, '2021005', 'e10adc3949ba59abbe56e057f20f883e', '钱七', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138005', 'qianqi@example.com', '2026-05-27 18:51:42'),
(36, '2021006', 'e10adc3949ba59abbe56e057f20f883e', '孙八', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138006', 'sunba@example.com', '2026-05-27 18:51:42'),
(37, '2021007', 'e10adc3949ba59abbe56e057f20f883e', '周九', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138007', 'zhoujiu@example.com', '2026-05-27 18:51:42'),
(38, '2021008', 'e10adc3949ba59abbe56e057f20f883e', '吴十', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138008', 'wushi@example.com', '2026-05-27 18:51:42'),
(39, '2021009', 'e10adc3949ba59abbe56e057f20f883e', '郑十一', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138009', 'zhengshiyi@example.com', '2026-05-27 18:51:42'),
(40, '2021010', 'e10adc3949ba59abbe56e057f20f883e', '王十二', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138010', 'wangshier@example.com', '2026-05-27 18:51:42'),
(41, '2021011', 'e10adc3949ba59abbe56e057f20f883e', '李十三', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138011', 'lishisan@example.com', '2026-05-27 18:51:42'),
(42, '2021012', 'e10adc3949ba59abbe56e057f20f883e', '张十四', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138012', 'zhangshisi@example.com', '2026-05-27 18:51:42'),
(43, '2021013', 'e10adc3949ba59abbe56e057f20f883e', '刘十五', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138013', 'liushiwu@example.com', '2026-05-27 18:51:42'),
(44, '2021014', 'e10adc3949ba59abbe56e057f20f883e', '陈十六', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138014', 'chenshiliu@example.com', '2026-05-27 18:51:42'),
(45, '2021015', 'e10adc3949ba59abbe56e057f20f883e', '杨十七', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138015', 'yangshiqi@example.com', '2026-05-27 18:51:42'),
(46, '2021016', 'e10adc3949ba59abbe56e057f20f883e', '黄十八', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138016', 'huangshiba@example.com', '2026-05-27 18:51:42'),
(47, '2021017', 'e10adc3949ba59abbe56e057f20f883e', '赵十九', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138017', 'zhaoshijiu@example.com', '2026-05-27 18:51:42'),
(48, '2021018', 'e10adc3949ba59abbe56e057f20f883e', '周二十', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138018', 'zhoushier@example.com', '2026-05-27 18:51:42'),
(49, '2021019', 'e10adc3949ba59abbe56e057f20f883e', '吴二十一', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138019', 'wuershiyi@example.com', '2026-05-27 18:51:42'),
(50, '2021020', 'e10adc3949ba59abbe56e057f20f883e', '郑二十二', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138020', 'zhengershier@example.com', '2026-05-27 18:51:42'),
(51, '2021021', 'e10adc3949ba59abbe56e057f20f883e', '王二十三', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138021', 'wangershisan@example.com', '2026-05-27 18:51:42'),
(52, '2021022', 'e10adc3949ba59abbe56e057f20f883e', '李二十四', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138022', 'liershisi@example.com', '2026-05-27 18:51:42'),
(53, '2021023', 'e10adc3949ba59abbe56e057f20f883e', '张二十五', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138023', 'zhangershiwu@example.com', '2026-05-27 18:51:42'),
(54, '2021024', 'e10adc3949ba59abbe56e057f20f883e', '刘二十六', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138024', 'liershiliu@example.com', '2026-05-27 18:51:42'),
(55, '2021025', 'e10adc3949ba59abbe56e057f20f883e', '陈二十七', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138025', 'chenshiqi@example.com', '2026-05-27 18:51:42'),
(56, '2021026', 'e10adc3949ba59abbe56e057f20f883e', '杨二十八', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138026', 'yangshiba@example.com', '2026-05-27 18:51:42'),
(57, '2021027', 'e10adc3949ba59abbe56e057f20f883e', '黄二十九', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138027', 'huangshijiu@example.com', '2026-05-27 18:51:42'),
(58, '2021028', 'e10adc3949ba59abbe56e057f20f883e', '赵三十', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138028', 'zhaoshi@example.com', '2026-05-27 18:51:42'),
(59, '2021029', 'e10adc3949ba59abbe56e057f20f883e', '周三十一', '男', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138029', 'zhoushiyi@example.com', '2026-05-27 18:51:42'),
(60, '2021030', 'e10adc3949ba59abbe56e057f20f883e', '吴三十二', '女', 1, '计算机科学2021级1班', '计算机科学与技术', '13800138030', 'wushier@example.com', '2026-05-27 18:51:42'),
(65, '2021031', 'e10adc3949ba59abbe56e057f20f883e', '郑三十三', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138031', 'zhengshisan@example.com', '2026-05-27 18:51:42'),
(66, '2021032', 'e10adc3949ba59abbe56e057f20f883e', '王三十四', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138032', 'wangshisi@example.com', '2026-05-27 18:51:42'),
(67, '2021033', 'e10adc3949ba59abbe56e057f20f883e', '李三十五', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138033', 'lishiwu@example.com', '2026-05-27 18:51:42'),
(68, '2021034', 'e10adc3949ba59abbe56e057f20f883e', '张三十六', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138034', 'zhangshiliu@example.com', '2026-05-27 18:51:42'),
(69, '2021035', 'e10adc3949ba59abbe56e057f20f883e', '刘三十七', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138035', 'liushiqi@example.com', '2026-05-27 18:51:42'),
(70, '2021036', 'e10adc3949ba59abbe56e057f20f883e', '陈三十八', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138036', 'chenshiba@example.com', '2026-05-27 18:51:42'),
(71, '2021037', 'e10adc3949ba59abbe56e057f20f883e', '杨三十九', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138037', 'yangshijiu@example.com', '2026-05-27 18:51:42'),
(72, '2021038', 'e10adc3949ba59abbe56e057f20f883e', '黄四十', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138038', 'huangshi@example.com', '2026-05-27 18:51:42'),
(73, '2021039', 'e10adc3949ba59abbe56e057f20f883e', '赵四十一', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138039', 'zhaoshiyi@example.com', '2026-05-27 18:51:42'),
(74, '2021040', 'e10adc3949ba59abbe56e057f20f883e', '周四十二', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138040', 'zhoushier@example.com', '2026-05-27 18:51:42'),
(75, '2021041', 'e10adc3949ba59abbe56e057f20f883e', '吴四十三', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138041', 'wushisan@example.com', '2026-05-27 18:51:42'),
(76, '2021042', 'e10adc3949ba59abbe56e057f20f883e', '郑四十四', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138042', 'zhengshisi@example.com', '2026-05-27 18:51:42'),
(77, '2021043', 'e10adc3949ba59abbe56e057f20f883e', '王四十五', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138043', 'wangshiwu@example.com', '2026-05-27 18:51:42'),
(78, '2021044', 'e10adc3949ba59abbe56e057f20f883e', '李四十六', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138044', 'lishiliu@example.com', '2026-05-27 18:51:42'),
(79, '2021045', 'e10adc3949ba59abbe56e057f20f883e', '张四十七', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138045', 'zhangshiqi@example.com', '2026-05-27 18:51:42'),
(80, '2021046', 'e10adc3949ba59abbe56e057f20f883e', '刘四十八', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138046', 'liushiba@example.com', '2026-05-27 18:51:42'),
(81, '2021047', 'e10adc3949ba59abbe56e057f20f883e', '陈四十九', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138047', 'chenshijiu@example.com', '2026-05-27 18:51:42'),
(82, '2021048', 'e10adc3949ba59abbe56e057f20f883e', '杨五十', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138048', 'yangshi@example.com', '2026-05-27 18:51:42'),
(83, '2021049', 'e10adc3949ba59abbe56e057f20f883e', '黄五十一', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138049', 'huangshiyi@example.com', '2026-05-27 18:51:42'),
(84, '2021050', 'e10adc3949ba59abbe56e057f20f883e', '赵五十二', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138050', 'zhaoshier@example.com', '2026-05-27 18:51:42'),
(85, '2021051', 'e10adc3949ba59abbe56e057f20f883e', '周五十三', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138051', 'zhoushisan@example.com', '2026-05-27 18:51:42'),
(86, '2021052', 'e10adc3949ba59abbe56e057f20f883e', '吴五十四', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138052', 'wushisi@example.com', '2026-05-27 18:51:42'),
(87, '2021053', 'e10adc3949ba59abbe56e057f20f883e', '郑五十五', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138053', 'zhengshiwu@example.com', '2026-05-27 18:51:42'),
(88, '2021054', 'e10adc3949ba59abbe56e057f20f883e', '王五十六', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138054', 'wangshiliu@example.com', '2026-05-27 18:51:42'),
(89, '2021055', 'e10adc3949ba59abbe56e057f20f883e', '李五十七', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138055', 'lishiqi@example.com', '2026-05-27 18:51:42'),
(90, '2021056', 'e10adc3949ba59abbe56e057f20f883e', '张五十八', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138056', 'zhangshiba@example.com', '2026-05-27 18:51:42'),
(91, '2021057', 'e10adc3949ba59abbe56e057f20f883e', '刘五十九', '男', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138057', 'liushijiu@example.com', '2026-05-27 18:51:42'),
(92, '2021058', 'e10adc3949ba59abbe56e057f20f883e', '陈六十', '女', 2, '计算机科学2021级2班', '计算机科学与技术', '13800138058', 'chenshi@example.com', '2026-05-27 18:51:42'),
(93, '2021059', 'e10adc3949ba59abbe56e057f20f883e', '杨六十一', '男', 3, '软件工程2021级1班', '软件工程', '13800138059', 'yangshiyi@example.com', '2026-05-27 18:51:42'),
(94, '2021060', 'e10adc3949ba59abbe56e057f20f883e', '黄六十二', '女', 3, '软件工程2021级1班', '软件工程', '13800138060', 'huangshier@example.com', '2026-05-27 18:51:42'),
(95, '2021061', 'e10adc3949ba59abbe56e057f20f883e', '赵六十三', '男', 3, '软件工程2021级1班', '软件工程', '13800138061', 'zhaoshisan@example.com', '2026-05-27 18:51:42'),
(96, '2021062', 'e10adc3949ba59abbe56e057f20f883e', '周六十四', '女', 3, '软件工程2021级1班', '软件工程', '13800138062', 'zhoushisi@example.com', '2026-05-27 18:51:42'),
(97, '2021063', 'e10adc3949ba59abbe56e057f20f883e', '吴六十五', '男', 3, '软件工程2021级1班', '软件工程', '13800138063', 'wushiwu@example.com', '2026-05-27 18:51:42'),
(98, '2021064', 'e10adc3949ba59abbe56e057f20f883e', '郑六十六', '女', 3, '软件工程2021级1班', '软件工程', '13800138064', 'zhengshiliu@example.com', '2026-05-27 18:51:42'),
(99, '2021065', 'e10adc3949ba59abbe56e057f20f883e', '王六十七', '男', 3, '软件工程2021级1班', '软件工程', '13800138065', 'wangshiqi@example.com', '2026-05-27 18:51:42'),
(100, '2021066', 'e10adc3949ba59abbe56e057f20f883e', '李六十八', '女', 3, '软件工程2021级1班', '软件工程', '13800138066', 'lishiba@example.com', '2026-05-27 18:51:42'),
(101, '2021067', 'e10adc3949ba59abbe56e057f20f883e', '张六十九', '男', 3, '软件工程2021级1班', '软件工程', '13800138067', 'zhangshijiu@example.com', '2026-05-27 18:51:42'),
(102, '2021068', 'e10adc3949ba59abbe56e057f20f883e', '刘七十', '女', 3, '软件工程2021级1班', '软件工程', '13800138068', 'liushi@example.com', '2026-05-27 18:51:42'),
(103, '2021069', 'e10adc3949ba59abbe56e057f20f883e', '陈七十一', '男', 3, '软件工程2021级1班', '软件工程', '13800138069', 'chenshiyi@example.com', '2026-05-27 18:51:42'),
(104, '2021070', 'e10adc3949ba59abbe56e057f20f883e', '杨七十二', '女', 3, '软件工程2021级1班', '软件工程', '13800138070', 'yangshier@example.com', '2026-05-27 18:51:42'),
(105, '2021071', 'e10adc3949ba59abbe56e057f20f883e', '黄七十三', '男', 3, '软件工程2021级1班', '软件工程', '13800138071', 'huangshisan@example.com', '2026-05-27 18:51:42'),
(106, '2021072', 'e10adc3949ba59abbe56e057f20f883e', '赵七十四', '女', 3, '软件工程2021级1班', '软件工程', '13800138072', 'zhaoshisi@example.com', '2026-05-27 18:51:42'),
(107, '2021073', 'e10adc3949ba59abbe56e057f20f883e', '周五十五', '男', 3, '软件工程2021级1班', '软件工程', '13800138073', 'zhoushiwu@example.com', '2026-05-27 18:51:42'),
(108, '2021074', 'e10adc3949ba59abbe56e057f20f883e', '吴七十六', '女', 3, '软件工程2021级1班', '软件工程', '13800138074', 'wushiliu@example.com', '2026-05-27 18:51:42'),
(109, '2021075', 'e10adc3949ba59abbe56e057f20f883e', '郑七十七', '男', 3, '软件工程2021级1班', '软件工程', '13800138075', 'zhengshiqi@example.com', '2026-05-27 18:51:42'),
(110, '2021076', 'e10adc3949ba59abbe56e057f20f883e', '王七十八', '女', 3, '软件工程2021级1班', '软件工程', '13800138076', 'wangshiba@example.com', '2026-05-27 18:51:42'),
(111, '2021077', 'e10adc3949ba59abbe56e057f20f883e', '李七十九', '男', 3, '软件工程2021级1班', '软件工程', '13800138077', 'lishijiu@example.com', '2026-05-27 18:51:42'),
(112, '2021078', 'e10adc3949ba59abbe56e057f20f883e', '张八十', '女', 3, '软件工程2021级1班', '软件工程', '13800138078', 'zhangshi@example.com', '2026-05-27 18:51:42'),
(113, '2021079', 'e10adc3949ba59abbe56e057f20f883e', '刘八十一', '男', 3, '软件工程2021级1班', '软件工程', '13800138079', 'liushiyi@example.com', '2026-05-27 18:51:42'),
(114, '2021080', 'e10adc3949ba59abbe56e057f20f883e', '陈八十二', '女', 3, '软件工程2021级1班', '软件工程', '13800138080', 'chenshier@example.com', '2026-05-27 18:51:42'),
(115, '2021081', 'e10adc3949ba59abbe56e057f20f883e', '杨八十三', '男', 3, '软件工程2021级1班', '软件工程', '13800138081', 'yangshisan@example.com', '2026-05-27 18:51:42'),
(116, '2021082', 'e10adc3949ba59abbe56e057f20f883e', '黄八十四', '女', 3, '软件工程2021级1班', '软件工程', '13800138082', 'huangshisi@example.com', '2026-05-27 18:51:42'),
(117, '2021083', 'e10adc3949ba59abbe56e057f20f883e', '赵八十五', '男', 3, '软件工程2021级1班', '软件工程', '13800138083', 'zhaoshiwu@example.com', '2026-05-27 18:51:42'),
(118, '2021084', 'e10adc3949ba59abbe56e057f20f883e', '周六十六', '女', 3, '软件工程2021级1班', '软件工程', '13800138084', 'zhoushiliu@example.com', '2026-05-27 18:51:42'),
(119, '2021085', 'e10adc3949ba59abbe56e057f20f883e', '吴八十七', '男', 3, '软件工程2021级1班', '软件工程', '13800138085', 'wushiqi@example.com', '2026-05-27 18:51:42'),
(120, '2021086', 'e10adc3949ba59abbe56e057f20f883e', '郑八十八', '女', 3, '软件工程2021级1班', '软件工程', '13800138086', 'zhengshiba@example.com', '2026-05-27 18:51:42'),
(121, '2021087', 'e10adc3949ba59abbe56e057f20f883e', '王八十九', '男', 3, '软件工程2021级1班', '软件工程', '13800138087', 'wangshijiu@example.com', '2026-05-27 18:51:42'),
(122, '2021088', 'e10adc3949ba59abbe56e057f20f883e', '李九十', '女', 3, '软件工程2021级1班', '软件工程', '13800138088', 'lishi@example.com', '2026-05-27 18:51:42'),
(123, '2021089', 'e10adc3949ba59abbe56e057f20f883e', '张九十一', '男', 3, '软件工程2021级1班', '软件工程', '13800138089', 'zhangshiyi@example.com', '2026-05-27 18:51:42'),
(124, '2021090', 'e10adc3949ba59abbe56e057f20f883e', '刘九十二', '女', 3, '软件工程2021级1班', '软件工程', '13800138090', 'liushier@example.com', '2026-05-27 18:51:42'),
(125, '2021091', 'e10adc3949ba59abbe56e057f20f883e', '陈九十三', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138091', 'chenshisan@example.com', '2026-05-27 18:51:42'),
(126, '2021092', 'e10adc3949ba59abbe56e057f20f883e', '杨九十四', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138092', 'yangshisi@example.com', '2026-05-27 18:51:42'),
(127, '2021093', 'e10adc3949ba59abbe56e057f20f883e', '黄九十五', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138093', 'huangshiwu@example.com', '2026-05-27 18:51:42'),
(128, '2021094', 'e10adc3949ba59abbe56e057f20f883e', '赵九十六', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138094', 'zhaoshiliu@example.com', '2026-05-27 18:51:42'),
(129, '2021095', 'e10adc3949ba59abbe56e057f20f883e', '周九十七', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138095', 'zhoushiqi@example.com', '2026-05-27 18:51:42'),
(130, '2021096', 'e10adc3949ba59abbe56e057f20f883e', '吴九十八', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138096', 'wushiba@example.com', '2026-05-27 18:51:42'),
(131, '2021097', 'e10adc3949ba59abbe56e057f20f883e', '郑九十九', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138097', 'zhengshijiu@example.com', '2026-05-27 18:51:42'),
(132, '2021098', 'e10adc3949ba59abbe56e057f20f883e', '王一百', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138098', 'wangbai@example.com', '2026-05-27 18:51:42'),
(133, '2021099', 'e10adc3949ba59abbe56e057f20f883e', '李一百零一', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138099', 'libailingyi@example.com', '2026-05-27 18:51:42'),
(134, '2021100', 'e10adc3949ba59abbe56e057f20f883e', '张一百零二', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138100', 'zhangbailing@example.com', '2026-05-27 18:51:42'),
(135, '2021101', 'e10adc3949ba59abbe56e057f20f883e', '刘一百零三', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138101', 'liubailingsan@example.com', '2026-05-27 18:51:42'),
(136, '2021102', 'e10adc3949ba59abbe56e057f20f883e', '陈一百零四', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138102', 'chenbailingsi@example.com', '2026-05-27 18:51:42'),
(137, '2021103', 'e10adc3949ba59abbe56e057f20f883e', '杨一百零五', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138103', 'yangbailingwu@example.com', '2026-05-27 18:51:42'),
(138, '2021104', 'e10adc3949ba59abbe56e057f20f883e', '黄一百零六', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138104', 'huangbailing@example.com', '2026-05-27 18:51:42'),
(139, '2021105', 'e10adc3949ba59abbe56e057f20f883e', '赵一百零七', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138105', 'zhaobailingqi@example.com', '2026-05-27 18:51:42'),
(140, '2021106', 'e10adc3949ba59abbe56e057f20f883e', '周一百零八', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138106', 'zhoubailing@example.com', '2026-05-27 18:51:42'),
(141, '2021107', 'e10adc3949ba59abbe56e057f20f883e', '吴一百零九', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138107', 'wubailingjiu@example.com', '2026-05-27 18:51:42'),
(142, '2021108', 'e10adc3949ba59abbe56e057f20f883e', '郑一百一十', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138108', 'zhengbaiyi@example.com', '2026-05-27 18:51:42'),
(143, '2021109', 'e10adc3949ba59abbe56e057f20f883e', '王一百一十一', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138109', 'wangbaiyi@example.com', '2026-05-27 18:51:42'),
(144, '2021110', 'e10adc3949ba59abbe56e057f20f883e', '李一百一十二', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138110', 'libaiyi@example.com', '2026-05-27 18:51:42'),
(145, '2021111', 'e10adc3949ba59abbe56e057f20f883e', '张一百一十三', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138111', 'zhangbaiyi@example.com', '2026-05-27 18:51:42'),
(146, '2021112', 'e10adc3949ba59abbe56e057f20f883e', '刘一百一十四', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138112', 'liubaiyi@example.com', '2026-05-27 18:51:42'),
(147, '2021113', 'e10adc3949ba59abbe56e057f20f883e', '陈一百一十五', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138113', 'chenbaiyi@example.com', '2026-05-27 18:51:42'),
(148, '2021114', 'e10adc3949ba59abbe56e057f20f883e', '杨一百一十六', '女', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138114', 'yangbaiyi@example.com', '2026-05-27 18:51:42'),
(149, '2021115', 'e10adc3949ba59abbe56e057f20f883e', '黄一百一十七', '男', 4, '数据科学2021级1班', '数据科学与大数据技术', '13800138115', 'huangbaiyi@example.com', '2026-05-27 18:51:42');

-- --------------------------------------------------------

--
-- 表的结构 `student_evaluations`
--

CREATE TABLE `student_evaluations` (
  `id` int(11) NOT NULL COMMENT '评教ID',
  `courseId` int(11) NOT NULL COMMENT '课程ID',
  `courseName` varchar(50) NOT NULL COMMENT '课程名称',
  `teacher` varchar(50) NOT NULL COMMENT '授课教师',
  `semester` varchar(20) DEFAULT NULL COMMENT '学期',
  `studentId` int(11) NOT NULL COMMENT '学生ID',
  `studentNo` varchar(20) DEFAULT NULL COMMENT '学号',
  `studentName` varchar(50) NOT NULL COMMENT '学生姓名',
  `teachingScore` decimal(2,1) NOT NULL COMMENT '教学水平评分（1-5分）',
  `contentScore` decimal(2,1) NOT NULL COMMENT '课程内容评分（1-5分）',
  `interactionScore` decimal(2,1) NOT NULL COMMENT '课堂互动评分（1-5分）',
  `attitudeScore` decimal(2,1) DEFAULT '4.0' COMMENT '态度评分（1-5分）',
  `overallScore` decimal(2,1) NOT NULL COMMENT '总体评价评分（1-5分）',
  `avgScore` decimal(2,1) NOT NULL COMMENT '平均评分',
  `evaluationContent` text COMMENT '评教内容',
  `comment` text COMMENT '评教评论',
  `status` varchar(20) DEFAULT '已提交' COMMENT '状态',
  `evaluationTime` datetime DEFAULT NULL COMMENT '评教时间',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '评教时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生评教表';

--
-- 转存表中的数据 `student_evaluations`
--

INSERT INTO `student_evaluations` (`id`, `courseId`, `courseName`, `teacher`, `semester`, `studentId`, `studentNo`, `studentName`, `teachingScore`, `contentScore`, `interactionScore`, `attitudeScore`, `overallScore`, `avgScore`, `evaluationContent`, `comment`, `status`, `evaluationTime`, `createTime`) VALUES
(1, 3, '计算机网络', '王教授', '', 2, '2021002', '李四', '5.0', '5.0', '5.0', '5.0', '5.0', '5.0', NULL, '33333333333333333333', '已提交', '2026-05-28 08:17:37', '2026-05-28 08:17:37');

-- --------------------------------------------------------

--
-- 表的结构 `student_grades`
--

CREATE TABLE `student_grades` (
  `id` int(11) NOT NULL COMMENT '成绩ID',
  `courseId` int(11) NOT NULL COMMENT '课程ID',
  `courseName` varchar(50) NOT NULL COMMENT '课程名称',
  `teacher` varchar(50) NOT NULL COMMENT '授课教师',
  `studentId` int(11) NOT NULL COMMENT '学生ID',
  `studentNo` varchar(20) DEFAULT NULL COMMENT '学号',
  `studentName` varchar(50) NOT NULL COMMENT '学生姓名',
  `classId` int(11) DEFAULT NULL COMMENT '班级ID',
  `className` varchar(50) DEFAULT NULL COMMENT '班级名称',
  `credit` int(11) NOT NULL COMMENT '学分',
  `hours` int(11) NOT NULL COMMENT '课时',
  `classroom` varchar(100) DEFAULT NULL COMMENT '教室',
  `semester` varchar(20) NOT NULL COMMENT '学期（如2025-2026-1）',
  `grade` int(11) NOT NULL COMMENT '成绩（0-100）',
  `gradePoint` decimal(2,1) NOT NULL COMMENT '绩点（0-5）',
  `examType` varchar(20) NOT NULL COMMENT '考试类型（期末考试/期中考试/项目考核等）',
  `examTime` datetime DEFAULT NULL COMMENT '考试时间',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `status` varchar(20) DEFAULT '未发布' COMMENT '状态（未发布/已发布）',
  `publishTime` datetime DEFAULT NULL COMMENT '发布时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生成绩表';

--
-- 转存表中的数据 `student_grades`
--

INSERT INTO `student_grades` (`id`, `courseId`, `courseName`, `teacher`, `studentId`, `studentNo`, `studentName`, `classId`, `className`, `credit`, `hours`, `classroom`, `semester`, `grade`, `gradePoint`, `examType`, `examTime`, `createTime`, `status`, `publishTime`) VALUES
(1, 1, '高等数学', '张教授', 2, NULL, '李四', NULL, NULL, 8, 48, '', '2025-2026-1', 65, '1.5', '期末考试', '2026-06-02 00:00:00', '2026-05-28 08:29:33', '已发布', '2026-05-28 19:55:46');

-- --------------------------------------------------------

--
-- 表的结构 `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(32) DEFAULT NULL,
  `password` varchar(32) DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `role` varchar(16) DEFAULT 'common',
  `studentId` varchar(20) DEFAULT NULL,
  `className` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `time`, `role`, `studentId`, `className`) VALUES
(1, 'admin', '0192023a7bbd73250516f069df18b500', '2026-05-27 12:42:50', 'admin', NULL, NULL),
(6, '144114414', '74ffaac59b7b99d0b12fba55f6699563', '2026-05-27 21:50:47', 'admin', NULL, NULL);

--
-- 转储表的索引
--

--
-- 表的索引 `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_name` (`name`);

--
-- 表的索引 `classrooms`
--
ALTER TABLE `classrooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_name_building` (`name`,`building`);

--
-- 表的索引 `classroom_bookings`
--
ALTER TABLE `classroom_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_classroom_id` (`classroomId`),
  ADD KEY `idx_status` (`status`);

--
-- 表的索引 `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_name` (`name`);

--
-- 表的索引 `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_id` (`studentId`),
  ADD KEY `idx_course_id` (`courseId`),
  ADD KEY `idx_semester` (`semester`);

--
-- 表的索引 `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_student_no` (`studentNo`),
  ADD KEY `idx_class_id` (`classId`),
  ADD KEY `idx_password` (`password`);

--
-- 表的索引 `student_evaluations`
--
ALTER TABLE `student_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_course_student` (`courseId`,`studentId`),
  ADD KEY `idx_course_id` (`courseId`),
  ADD KEY `idx_student_id` (`studentId`);

--
-- 表的索引 `student_grades`
--
ALTER TABLE `student_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_course_student_semester` (`courseId`,`studentId`,`semester`),
  ADD KEY `idx_course_id` (`courseId`),
  ADD KEY `idx_student_id` (`studentId`),
  ADD KEY `idx_semester` (`semester`);

--
-- 表的索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '班级ID', AUTO_INCREMENT=12;

--
-- 使用表AUTO_INCREMENT `classrooms`
--
ALTER TABLE `classrooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '教室ID', AUTO_INCREMENT=6;

--
-- 使用表AUTO_INCREMENT `classroom_bookings`
--
ALTER TABLE `classroom_bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '借用记录ID', AUTO_INCREMENT=5;

--
-- 使用表AUTO_INCREMENT `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '课程ID', AUTO_INCREMENT=9;

--
-- 使用表AUTO_INCREMENT `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '评教ID';

--
-- 使用表AUTO_INCREMENT `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '学生ID', AUTO_INCREMENT=150;

--
-- 使用表AUTO_INCREMENT `student_evaluations`
--
ALTER TABLE `student_evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '评教ID', AUTO_INCREMENT=2;

--
-- 使用表AUTO_INCREMENT `student_grades`
--
ALTER TABLE `student_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '成绩ID', AUTO_INCREMENT=2;

--
-- 使用表AUTO_INCREMENT `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
