import * as fs from "fs";
import secret from "../config";
import * as mysql from "mysql2";
import * as jwt from "jsonwebtoken";
import { createHash } from "crypto";
import Logger from "../loaders/logger";
import { Message } from "../utils/enums";
import getFormatDate from "../utils/date";
import { connection } from "../utils/mysql";
import { Request, Response } from "express";
import { createMathExpr } from "svg-captcha";
import { formatDataFields } from "../utils/format";

const utils = require("@pureadmin/utils");

/** 保存验证码 */
let generateVerify: number;

/** 过期时间 单位：毫秒 默认 1分钟过期，方便演示 */
let expiresIn = 60000;

/**
 * @typedef Error
 * @property {string} code.required
 */

/**
 * @typedef Response
 * @property {[integer]} code
 */

// /**
//  * @typedef Login
//  * @property {string} username.required - 用户名 - eg: admin
//  * @property {string} password.required - 密码 - eg: admin123
//  * @property {integer} verify.required - 验证码
//  */

/**
 * @typedef Login
 * @property {string} username.required - 用户名 - eg: admin
 * @property {string} password.required - 密码 - eg: admin123
 */

/**
 * @route POST /login
 * @param {Login.model} point.body.required - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @summary 登录
 * @group 用户登录相关
 * @returns {Response.model} 200
 * @returns {Array.<Login>} Login
 * @headers {integer} 200.X-Rate-Limit
 * @headers {string} 200.X-Expires-After
 * @security JWT
 */

const login = async (req: Request, res: Response) => {
  const { username, password, verify } = req.body;
  if (!verify || String(generateVerify) !== String(verify)) return res.json({
    success: false,
    data: { message: Message[0] }
  });

  const isStudentNo = /^[0-9]{7,10}$/.test(username);

  if (isStudentNo) {
    let sql: string =
      "select * from students where studentNo=" + "'" + username + "'";
    connection.query(sql, async function (err, data: any) {
      if (data.length == 0) {
        await res.json({
          success: false,
          data: { message: Message[1] },
        });
      } else {
        if (
          createHash("md5").update(password).digest("hex") == data[0].password
        ) {
          const accessToken = jwt.sign(
            {
              accountId: data[0].id,
              roles: ["student"],
              studentNo: username,
              name: data[0].name
            },
            secret.jwtSecret,
            { expiresIn }
          );
          await res.json({
            success: true,
            data: {
              message: Message[2],
              username: data[0].name,
              accountId: data[0].id,
              studentNo: username,
              className: data[0].className,
              major: data[0].major,
              roles: ["student"],
              accessToken,
              refreshToken: "eyJhbGciOiJIUzUxMiJ9.studentRefresh",
              expires: new Date(new Date()).getTime() + expiresIn,
            },
          });
        } else {
          await res.json({
            success: false,
            data: { message: Message[3] },
          });
        }
      }
    });
  } else {
    let sql: string =
      "select * from users where username=" + "'" + username + "'";
    connection.query(sql, async function (err, data: any) {
      if (data.length == 0) {
        await res.json({
          success: false,
          data: { message: Message[1] },
        });
      } else {
        if (
          createHash("md5").update(password).digest("hex") == data[0].password
        ) {
          const userRole = data[0].role || "admin";
          const accessToken = jwt.sign(
            {
              accountId: data[0].id,
              roles: [userRole],
              username
            },
            secret.jwtSecret,
            { expiresIn }
          );
          await res.json({
            success: true,
            data: {
              message: Message[2],
              username,
              accountId: data[0].id,
              roles: [userRole],
              accessToken,
              refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
              expires: new Date(new Date()).getTime() + expiresIn,
            },
          });
        } else {
          await res.json({
            success: false,
            data: { message: Message[3] },
          });
        }
      }
    });
  }
};

/**
 * @typedef UpdateList
 * @property {string} username.required - 用户名 - eg: admin
 */

/**
 * @route PUT /updateList/{id}
 * @summary 列表更新
 * @param {UpdateList.model} point.body.required - 用户名
 * @param {UpdateList.model} id.path.required - 用户id
 * @group 用户管理相关
 * @returns {object} 200
 * @returns {Array.<UpdateList>} UpdateList
 * @security JWT
 */

const updateList = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  let modifySql: string = "UPDATE users SET username = ? WHERE id = ?";
  let sql: string = "select * from users where id=" + id;
  connection.query(sql, function (err, data) {
    connection.query(sql, function (err) {
      if (err) {
        Logger.error(err);
      } else {
        let modifyParams: string[] = [username, id];
        // 改
        connection.query(modifySql, modifyParams, async function (err, result) {
          if (err) {
            Logger.error(err);
          } else {
            await res.json({
              success: true,
              data: { message: Message[7] },
            });
          }
        });
      }
    });
  });
};

/**
 * @typedef DeleteList
 * @property {integer} id.required - 当前id
 */

/**
 * @route DELETE /deleteList/{id}
 * @summary 列表删除
 * @param {DeleteList.model} id.path.required - 用户id
 * @group 用户管理相关
 * @returns {object} 200
 * @returns {Array.<DeleteList>} DeleteList
 * @security JWT
 */

const deleteList = async (req: Request, res: Response) => {
  const { id } = req.params;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  let sql: string = "DELETE FROM users where id=" + "'" + id + "'";
  connection.query(sql, async function (err, data) {
    if (err) {
      console.log(err);
    } else {
      await res.json({
        success: true,
        data: { message: Message[8] },
      });
    }
  });
};

/**
 * @typedef SearchPage
 * @property {integer} page.required - 第几页 - eg: 1
 * @property {integer} size.required - 数据量（条）- eg: 5
 */

/**
 * @route POST /searchPage
 * @param {SearchPage.model} point.body.required - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @summary 分页查询
 * @group 用户管理相关
 * @returns {Response.model} 200
 * @returns {Array.<SearchPage>} SearchPage
 * @headers {integer} 200.X-Rate-Limit
 * @headers {string} 200.X-Expires-After
 * @security JWT
 */

const searchPage = async (req: Request, res: Response) => {
  const { page, size } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  let sql: string =
    "select * from users limit " + size + " offset " + size * (page - 1);
  connection.query(sql, async function (err, data) {
    if (err) {
      Logger.error(err);
    } else {
      await res.json({
        success: true,
        data,
      });
    }
  });
};

/**
 * @typedef SearchVague
 * @property {string} username.required - 用户名  - eg: admin
 */

/**
 * @route POST /searchVague
 * @param {SearchVague.model} point.body.required - the new point
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @summary 模糊查询
 * @group 用户管理相关
 * @returns {Response.model} 200
 * @returns {Array.<SearchVague>} SearchVague
 * @headers {integer} 200.X-Rate-Limit
 * @headers {string} 200.X-Expires-After
 * @security JWT
 */

const searchVague = async (req: Request, res: Response) => {
  const { username } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (username === "" || username === null)
    return res.json({
      success: false,
      data: { message: Message[9] },
    });
  let sql: string = "select * from users";
  sql += " WHERE username LIKE " + mysql.escape("%" + username + "%");
  connection.query(sql, function (err, data) {
    connection.query(sql, async function (err) {
      if (err) {
        Logger.error(err);
      } else {
        await res.json({
          success: true,
          data,
        });
      }
    });
  });
};

// express-swagger-generator中没有文件上传文档写法，所以请使用postman调试
const upload = async (req: Request, res: Response) => {
  // 文件存放地址
  const des_file: any = (index: number) =>
    "./public/files/" + req.files[index].originalname;
  let filesLength = req.files.length as number;
  let result = [];

  function asyncUpload() {
    return new Promise((resolve, rejects) => {
      (req.files as Array<any>).forEach((ev, index) => {
        fs.readFile(req.files[index].path, function (err, data) {
          fs.writeFile(des_file(index), data, function (err) {
            if (err) {
              rejects(err);
            } else {
              while (filesLength > 0) {
                result.push({
                  filename: req.files[filesLength - 1].originalname,
                  filepath: utils.getAbsolutePath(des_file(filesLength - 1)),
                });
                filesLength--;
              }
              if (filesLength === 0) resolve(result);
            }
          });
        });
      });
    });
  }

  asyncUpload()
    .then((fileList) => {
      res.json({
        success: true,
        data: {
          message: Message[11],
          fileList,
        },
      });
    })
    .catch(() => {
      res.json({
        success: false,
        data: {
          message: Message[10],
          fileList: [],
        },
      });
    });
};

/**
 * @route GET /captcha
 * @summary 图形验证码
 * @group captcha - 图形验证码
 * @returns {object} 200
 */

const captcha = async (req: Request, res: Response) => {
  const create = createMathExpr({
    mathMin: 1,
    mathMax: 4,
    mathOperator: "+",
  });
  generateVerify = Number(create.text);
  res.type("json");
  res.json({ success: true, data: { text: create.text, svg: create.data } });
};

/**
 * @route GET /getAllUsers
 * @summary 获取所有用户列表
 * @group 用户管理相关
 * @returns {object} 200 - 用户列表
 * @security JWT
 */

const getAllUsers = async (req: Request, res: Response) => {
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  let sql: string = "select id, username, time, role, studentId, className from users";
  connection.query(sql, async function (err, data: any) {
    if (err) {
      Logger.error(err);
    } else {
      const users = data.map((user: any) => ({
        id: user.id,
        username: user.username,
        time: user.time,
        role: user.role || "students",
        studentId: user.studentId || "",
        className: user.className || "",
      }));
      const formattedUsers = formatDataFields(users);
      await res.json({
        success: true,
        data: formattedUsers,
      });
    }
  });
};

/**
 * @typedef AddUser
 * @property {string} username.required - 用户名
 * @property {string} password.required - 密码
 * @property {string} role - 角色 (admin/students)
 * @property {string} studentId - 学号
 * @property {string} className - 班级名称
 */

/**
 * @route POST /addUser
 * @param {AddUser.model} point.body.required - 用户信息
 * @summary 添加用户
 * @group 用户管理相关
 * @returns {object} 200 - 添加结果
 * @security JWT
 */

const addUser = async (req: Request, res: Response) => {
  const { username, password, role, studentId, className } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!username || !password) {
    return res.json({
      success: false,
      data: { message: "用户名和密码不能为空" },
    });
  }
  let checkSql: string = "select * from users where username=" + "'" + username + "'";
  connection.query(checkSql, async (err, data: any) => {
    if (data.length > 0) {
      await res.json({
        success: false,
        data: { message: "用户名已存在" },
      });
    } else {
      let time = await getFormatDate();
      let sql: string = "insert into users (username, password, time, role, studentId, className) values (?, ?, ?, ?, ?, ?)";
      let params = [username, createHash("md5").update(password).digest("hex"), time, role || "students", studentId || null, className || null];
      connection.query(sql, params, async function (err) {
        if (err) {
          Logger.error(err);
          await res.json({
            success: false,
            data: { message: "添加失败" },
          });
        } else {
          await res.json({
            success: true,
            data: { message: "添加成功" },
          });
        }
      });
    }
  });
};

/**
 * @typedef EditUser
 * @property {integer} id.required - 用户ID
 * @property {string} username.required - 用户名
 * @property {string} password - 密码 (可选，不传则不修改)
 * @property {string} role - 角色 (admin/students)
 * @property {string} studentId - 学号
 * @property {string} className - 班级名称
 */

/**
 * @route POST /editUser
 * @param {EditUser.model} point.body.required - 用户信息
 * @summary 编辑用户
 * @group 用户管理相关
 * @returns {object} 200 - 编辑结果
 * @security JWT
 */

const editUser = async (req: Request, res: Response) => {
  const { id, username, password, role, studentId, className } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id || !username) {
    return res.json({
      success: false,
      data: { message: "ID和用户名不能为空" },
    });
  }
  let sql: string = "UPDATE users SET username = ?, role = ?, studentId = ?, className = ? WHERE id = ?";
  let params: any[] = [username, role || "students", studentId || null, className || null, id];
  if (password) {
    sql = "UPDATE users SET username = ?, password = ?, role = ?, studentId = ?, className = ? WHERE id = ?";
    params = [username, createHash("md5").update(password).digest("hex"), role || "students", studentId || null, className || null, id];
  }
  connection.query(sql, params, async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "更新失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "更新成功" },
      });
    }
  });
};

/**
 * @typedef DeleteUser
 * @property {integer} id.required - 用户ID
 */

/**
 * @route POST /deleteUser
 * @param {DeleteUser.model} point.body.required - 用户ID
 * @summary 删除用户
 * @group 用户管理相关
 * @returns {object} 200 - 删除结果
 * @security JWT
 */

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "用户ID不能为空" },
    });
  }
  let sql: string = "DELETE FROM users WHERE id = ?";
  connection.query(sql, [id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "删除失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "删除成功" },
      });
    }
  });
};

/**
 * @typedef RefreshToken
 * @property {string} refreshToken.required - 刷新令牌
 */

/**
 * @route POST /refresh-token
 * @param {RefreshToken.model} point.body.required - 刷新令牌
 * @summary 刷新访问令牌
 * @group 用户登录、注册相关
 * @returns {object} 200 - 新的访问令牌
 */

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.json({
      success: false,
      data: { message: "refreshToken不能为空" },
    });
  }
  const accessToken = jwt.sign(
    { accountId: 1 },
    secret.jwtSecret,
    { expiresIn }
  );
  await res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
      expires: new Date(new Date()).getTime() + expiresIn,
    },
  });
};

/**
 * @route GET /getAllStudents
 * @summary 获取所有学生列表
 * @group 学生管理相关
 * @returns {object} 200 - 学生列表
 */

const getAllStudents = async (req: Request, res: Response) => {
  let sql: string = "select * from students";
  connection.query(sql, async (err, data: any) => {
    if (err) {
      await res.json({
        success: false,
        data: { message: "查询学生数据失败" },
      });
    } else {
      const formattedData = formatDataFields(data);
      await res.json({
        success: true,
        data: formattedData,
      });
    }
  });
};

/**
 * @typedef AddStudent
 * @property {string} studentNo.required - 学号
 * @property {string} name.required - 姓名
 * @property {string} gender - 性别
 * @property {integer} classId - 班级ID
 * @property {string} className - 班级名称
 * @property {string} major - 专业
 * @property {string} phone - 联系电话
 * @property {string} email - 邮箱
 * @property {string} password - 密码
 */

/**
 * @route POST /addStudent
 * @param {AddStudent.model} point.body.required - 学生信息
 * @summary 添加学生
 * @group 学生管理相关
 * @returns {object} 200 - 添加结果
 */

const addStudent = async (req: Request, res: Response) => {
  const { studentNo, name, gender, classId, className, major, phone, email, password } = req.body;
  const hashedPassword = createHash("md5").update(password || "123456").digest("hex");
  let sql: string = `insert into students (studentNo, name, gender, classId, className, major, phone, email, password) values ('${studentNo}', '${name}', '${gender}', '${classId}', '${className}', '${major}', '${phone}', '${email}', '${hashedPassword}')`;
  connection.query(sql, async (err, data: any) => {
    if (err) {
      await res.json({
        success: false,
        data: { message: "添加学生失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "添加学生成功" },
      });
    }
  });
};

/**
 * @typedef EditStudent
 * @property {integer} id.required - 学生ID
 * @property {string} studentNo.required - 学号
 * @property {string} name.required - 姓名
 * @property {string} gender - 性别
 * @property {integer} classId - 班级ID
 * @property {string} className - 班级名称
 * @property {string} major - 专业
 * @property {string} phone - 联系电话
 * @property {string} email - 邮箱
 * @property {string} password - 密码 (可选)
 */

/**
 * @route POST /editStudent
 * @param {EditStudent.model} point.body.required - 学生信息
 * @summary 编辑学生
 * @group 学生管理相关
 * @returns {object} 200 - 编辑结果
 */

const editStudent = async (req: Request, res: Response) => {
  const { id, studentNo, name, gender, classId, className, major, phone, email, password } = req.body;
  let sql: string;
  if (password) {
    const hashedPassword = createHash("md5").update(password).digest("hex");
    sql = `update students set studentNo='${studentNo}', name='${name}', gender='${gender}', classId='${classId}', className='${className}', major='${major}', phone='${phone}', email='${email}', password='${hashedPassword}' where id=${id}`;
  } else {
    sql = `update students set studentNo='${studentNo}', name='${name}', gender='${gender}', classId='${classId}', className='${className}', major='${major}', phone='${phone}', email='${email}' where id=${id}`;
  }
  connection.query(sql, async (err, data: any) => {
    if (err) {
      await res.json({
        success: false,
        data: { message: "编辑学生失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "编辑学生成功" },
      });
    }
  });
};

/**
 * @typedef DeleteStudent
 * @property {integer} id.required - 学生ID
 */

/**
 * @route POST /deleteStudent
 * @param {DeleteStudent.model} point.body.required - 学生ID
 * @summary 删除学生
 * @group 学生管理相关
 * @returns {object} 200 - 删除结果
 */

const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.body;
  let sql: string = `delete from students where id=${id}`;
  connection.query(sql, async (err, data: any) => {
    if (err) {
      await res.json({
        success: false,
        data: { message: "删除学生失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "删除学生成功" },
      });
    }
  });
};

/**
 * @route GET /getAllGrades
 * @summary 获取所有成绩列表
 * @group 成绩管理相关
 * @returns {object} 200 - 成绩列表
 * @security JWT
 */

const getAllGrades = async (req: Request, res: Response) => {
  let payload = null;
  let isStudent = false;
  let studentNo = null;
  
  try {
    const authorizationHeader = req.get("Authorization") as string;
    if (authorizationHeader) {
      const accessToken = authorizationHeader.substr("Bearer ".length);
      payload = jwt.verify(accessToken, secret.jwtSecret) as jwt.JwtPayload;
      isStudent = payload.roles && payload.roles.includes("student");
      studentNo = payload.studentNo;
    }
  } catch (error) {
  }

  let sql: string;
  if (isStudent && studentNo) {
    sql = `
      SELECT sg.*, s.studentNo, s.classId, s.className 
      FROM student_grades sg 
      LEFT JOIN students s ON sg.studentId = s.id
      LEFT JOIN classes c ON s.classId = c.id
      WHERE s.studentNo = '${studentNo}'
      AND c.courses IS NOT NULL 
      AND c.courses != '' 
      AND c.courses != '[]'
      AND (
        JSON_CONTAINS(c.courses, JSON_QUOTE(sg.courseName))
        OR JSON_CONTAINS(c.courses, CAST(sg.courseId AS CHAR))
      )
    `;
  } else {
    sql = `SELECT sg.*, s.studentNo, s.classId, s.className 
      FROM student_grades sg 
      LEFT JOIN students s ON sg.studentId = s.id`;
  }
  
  connection.query(sql, async (err, data: any) => {
    if (err) {
      await res.json({
        success: false,
        data: { message: "查询成绩数据失败" },
      });
    } else {
      const formattedData = formatDataFields(data);
      await res.json({
        success: true,
        data: formattedData,
      });
    }
  });
};

/**
 * @route GET /getAllEvaluations
 * @summary 获取所有评教列表
 * @group 评教管理相关
 * @returns {object} 200 - 评教列表
 * @security JWT
 */

const getAllEvaluations = async (req: Request, res: Response) => {
  let payload = null;
  let isStudent = false;
  let studentNo = null;
  
  try {
    const authorizationHeader = req.get("Authorization") as string;
    if (authorizationHeader) {
      const accessToken = authorizationHeader.substr("Bearer ".length);
      payload = jwt.verify(accessToken, secret.jwtSecret) as jwt.JwtPayload;
      isStudent = payload.roles && payload.roles.includes("student");
      studentNo = payload.studentNo;
    }
  } catch (error) {
  }

  let sql: string;
  if (isStudent && studentNo) {
    sql = `
      SELECT se.*, s.classId, s.className, c.courses
      FROM student_evaluations se
      LEFT JOIN students s ON se.studentNo = s.studentNo
      LEFT JOIN classes c ON s.classId = c.id
      WHERE se.studentNo = '${studentNo}'
      AND c.courses IS NOT NULL 
      AND c.courses != '' 
      AND c.courses != '[]'
      AND (
        JSON_CONTAINS(c.courses, JSON_QUOTE(se.courseName))
        OR JSON_CONTAINS(c.courses, CAST(se.courseId AS CHAR))
      )
    `;
  } else {
    sql = "select * from student_evaluations";
  }
  
  connection.query(sql, async (err, data: any) => {
    if (err) {
      await res.json({
        success: false,
        data: { message: "查询评教数据失败" },
      });
    } else {
      const formattedData = formatDataFields(data);
      await res.json({
        success: true,
        data: formattedData,
      });
    }
  });
};

/**
 * @route GET /getAllCourses
 * @summary 获取所有课程列表
 * @group 课程管理相关
 * @returns {object} 200 - 课程列表
 * @security JWT
 */

const getAllCourses = async (req: Request, res: Response) => {
  let payload = null;
  let isStudent = false;
  let studentNo = null;

  try {
    const authorizationHeader = req.get("Authorization") as string;
    if (authorizationHeader) {
      const accessToken = authorizationHeader.substr("Bearer ".length);
      payload = jwt.verify(accessToken, secret.jwtSecret) as jwt.JwtPayload;
      isStudent = payload.roles && payload.roles.includes("student");
      studentNo = payload.studentNo;
    }
  } catch (error) {
  }

  if (isStudent && studentNo) {
    connection.query(
      `SELECT s.classId, c.courses FROM students s LEFT JOIN classes c ON s.classId = c.id WHERE s.studentNo = '${studentNo}'`,
      async (err, result: any) => {
        if (err) {
          await res.json({
            success: false,
            data: { message: "查询课程数据失败" },
          });
          return;
        }
        let courseIds: number[] = [];
        let courseNames: string[] = [];
        if (result && result.length > 0) {
          const coursesData = result[0].courses;
          if (coursesData) {
            if (Array.isArray(coursesData)) {
              if (coursesData.length > 0 && typeof coursesData[0] === "number") {
                courseIds = coursesData;
              } else if (coursesData.length > 0 && typeof coursesData[0] === "string") {
                courseNames = coursesData;
              }
            } else if (typeof coursesData === "string") {
              const coursesStr = coursesData;
              if (coursesStr !== "" && coursesStr !== "[]") {
                try {
                  if (coursesStr.startsWith("[") && coursesStr.endsWith("]")) {
                    const parsed = JSON.parse(coursesStr);
                    if (parsed.length > 0 && typeof parsed[0] === "number") {
                      courseIds = parsed;
                    } else if (parsed.length > 0 && typeof parsed[0] === "string") {
                      courseNames = parsed;
                    }
                  } else {
                    courseNames = coursesStr.split(",").map(c => c.trim());
                  }
                } catch (e) {
                  if (coursesStr.includes(",")) {
                    courseNames = coursesStr.split(",").map(c => c.trim());
                  }
                }
              }
            }
          }
        }

        if (courseIds.length === 0 && courseNames.length === 0) {
          connection.query("SELECT * FROM courses", async (err2, data: any) => {
            if (err2) {
              await res.json({
                success: false,
                data: { message: "查询课程数据失败" },
              });
              return;
            }
            const formattedData = formatDataFields(data);
            await res.json({
              success: true,
              data: formattedData,
            });
          });
          return;
        }

        let querySql: string;
        if (courseIds.length > 0) {
          querySql = `SELECT * FROM courses WHERE id IN (${courseIds.join(",")})`;
        } else {
          querySql = `SELECT * FROM courses WHERE name IN (${courseNames.map(n => `'${n}'`).join(",")})`;
        }
        connection.query(
          querySql,
          async (err2, data: any) => {
            if (err2) {
              await res.json({
                success: false,
                data: { message: "查询课程数据失败" },
              });
              return;
            }
            const formattedData = formatDataFields(data);
            await res.json({
              success: true,
              data: formattedData,
            });
          }
        );
      }
    );
  } else {
    connection.query("SELECT * FROM courses", async (err, data: any) => {
      if (err) {
        await res.json({
          success: false,
          data: { message: "查询课程数据失败" },
        });
      } else {
        const formattedData = formatDataFields(data);
        await res.json({
          success: true,
          data: formattedData,
        });
      }
    });
  }
};

/**
 * @route GET /getAllClasses
 * @summary 获取所有班级列表
 * @group 班级管理相关
 * @returns {object} 200 - 班级列表
 */

const getAllClasses = async (req: Request, res: Response) => {
  let sql: string = "select * from classes";
  connection.query(sql, async (err, data: any) => {
    if (err) {
      await res.json({
        success: false,
        data: { message: "查询班级数据失败" },
      });
    } else {
      const formattedData = formatDataFields(data);
      await res.json({
        success: true,
        data: formattedData,
      });
    }
  });
};

/**
 * @route GET /getAllClassrooms
 * @summary 获取所有教室列表
 * @group 教室管理相关
 * @returns {object} 200 - 教室列表
 */

const getAllClassrooms = async (req: Request, res: Response) => {
  let sql: string = "select * from classrooms";
  connection.query(sql, async (err, data: any) => {
    if (err) {
      await res.json({
        success: false,
        data: { message: "查询教室数据失败" },
      });
    } else {
      const formattedData = formatDataFields(data);
      await res.json({
        success: true,
        data: formattedData,
      });
    }
  });
};

/**
 * @route GET /getAllBookings
 * @summary 获取所有教室借用记录
 * @group 教室借用相关
 * @returns {object} 200 - 借用记录列表
 */

const getAllBookings = async (req: Request, res: Response) => {
  let sql: string = "select * from classroom_bookings";
  connection.query(sql, async (err, data: any) => {
    if (err) {
      await res.json({
        success: false,
        data: { message: "查询借用记录失败" },
      });
    } else {
      const formattedData = formatDataFields(data);
      await res.json({
        success: true,
        data: formattedData,
      });
    }
  });
};

/**
 * @typedef AddClass
 * @property {string} name.required - 班级名称
 * @property {string} grade.required - 年级
 * @property {string} major.required - 专业
 * @property {Array} courses - 关联课程列表
 */

/**
 * @route POST /addClass
 * @param {AddClass.model} point.body.required - 班级信息
 * @summary 添加班级
 * @group 班级管理相关
 * @returns {object} 200 - 添加结果
 * @security JWT
 */

const addClass = async (req: Request, res: Response) => {
  const { name, grade, major, courses } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!name || !grade || !major) {
    return res.json({
      success: false,
      data: { message: "班级名称、年级和专业不能为空" },
    });
  }
  let checkSql: string = "select * from classes where name=" + "'" + name + "'";
  connection.query(checkSql, async (err, data: any) => {
    if (data.length > 0) {
      await res.json({
        success: false,
        data: { message: "班级名称已存在" },
      });
    } else {
      let time = await getFormatDate();
      let coursesJson = JSON.stringify(courses || []);
      let sql: string = "insert into classes (name, grade, major, courses, createTime) values (?, ?, ?, ?, ?)";
      let params = [name, grade, major, coursesJson, time];
      connection.query(sql, params, async function (err) {
        if (err) {
          Logger.error(err);
          await res.json({
            success: false,
            data: { message: "添加班级失败" },
          });
        } else {
          await res.json({
            success: true,
            data: { message: "添加班级成功" },
          });
        }
      });
    }
  });
};

/**
 * @typedef EditClass
 * @property {integer} id.required - 班级ID
 * @property {string} name.required - 班级名称
 * @property {string} grade.required - 年级
 * @property {string} major.required - 专业
 * @property {Array} courses - 关联课程列表
 */

/**
 * @route POST /editClass
 * @param {EditClass.model} point.body.required - 班级信息
 * @summary 编辑班级
 * @group 班级管理相关
 * @returns {object} 200 - 编辑结果
 * @security JWT
 */

const editClass = async (req: Request, res: Response) => {
  const { id, name, grade, major, courses } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id || !name || !grade || !major) {
    return res.json({
      success: false,
      data: { message: "ID、班级名称、年级和专业不能为空" },
    });
  }
  let coursesJson = JSON.stringify(courses || []);
  let sql: string = "UPDATE classes SET name = ?, grade = ?, major = ?, courses = ? WHERE id = ?";
  let params: any[] = [name, grade, major, coursesJson, id];
  connection.query(sql, params, async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "更新班级失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "更新班级成功" },
      });
    }
  });
};

/**
 * @typedef DeleteClass
 * @property {integer} id.required - 班级ID
 */

/**
 * @route POST /deleteClass
 * @param {DeleteClass.model} point.body.required - 班级ID
 * @summary 删除班级
 * @group 班级管理相关
 * @returns {object} 200 - 删除结果
 * @security JWT
 */

const deleteClass = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "班级ID不能为空" },
    });
  }
  let sql: string = "DELETE FROM classes WHERE id = ?";
  connection.query(sql, [id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "删除班级失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "删除班级成功" },
      });
    }
  });
};

/**
 * @typedef BindCourses
 * @property {integer} classId.required - 班级ID
 * @property {Array} courses.required - 课程列表
 */

/**
 * @route POST /bindCourses
 * @param {BindCourses.model} point.body.required - 绑定信息
 * @summary 绑定课程到班级
 * @group 班级管理相关
 * @returns {object} 200 - 绑定结果
 * @security JWT
 */

const bindCourses = async (req: Request, res: Response) => {
  const { classId, courses } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!classId) {
    return res.json({
      success: false,
      data: { message: "班级ID不能为空" },
    });
  }
  let coursesJson = JSON.stringify(courses || []);
  let sql: string = "UPDATE classes SET courses = ? WHERE id = ?";
  let params: any[] = [coursesJson, classId];
  connection.query(sql, params, async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "绑定课程失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "绑定课程成功" },
      });
    }
  });
};

/**
 * @typedef AddCourse
 * @property {string} name.required - 课程名称
 * @property {string} teacher.required - 授课教师
 * @property {string} classroom - 教室
 * @property {integer} credit - 学分
 * @property {integer} hours - 课时
 * @property {string} description - 课程描述
 */

/**
 * @route POST /addCourse
 * @param {AddCourse.model} point.body.required - 课程信息
 * @summary 添加课程
 * @group 课程管理相关
 * @returns {object} 200 - 添加结果
 * @security JWT
 */

const addCourse = async (req: Request, res: Response) => {
  const { name, teacher, classroom, credit, hours, description } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!name || !teacher) {
    return res.json({
      success: false,
      data: { message: "课程名称和教师不能为空" },
    });
  }
  let checkSql: string = "select * from courses where name=" + "'" + name + "'";
  connection.query(checkSql, async (err, data: any) => {
    if (data.length > 0) {
      await res.json({
        success: false,
        data: { message: "课程名称已存在" },
      });
    } else {
      let time = await getFormatDate();
      let sql: string = "insert into courses (name, teacher, classroom, credit, hours, description, createTime) values (?, ?, ?, ?, ?, ?, ?)";
      let params = [name, teacher, classroom || "", credit || 0, hours || 0, description || "", time];
      connection.query(sql, params, async function (err) {
        if (err) {
          Logger.error(err);
          await res.json({
            success: false,
            data: { message: "添加课程失败" },
          });
        } else {
          await res.json({
            success: true,
            data: { message: "添加课程成功" },
          });
        }
      });
    }
  });
};

/**
 * @typedef EditCourse
 * @property {integer} id.required - 课程ID
 * @property {string} name.required - 课程名称
 * @property {string} teacher.required - 授课教师
 * @property {string} classroom - 教室
 * @property {integer} credit - 学分
 * @property {integer} hours - 课时
 * @property {string} description - 课程描述
 */

/**
 * @route POST /editCourse
 * @param {EditCourse.model} point.body.required - 课程信息
 * @summary 编辑课程
 * @group 课程管理相关
 * @returns {object} 200 - 编辑结果
 * @security JWT
 */

const editCourse = async (req: Request, res: Response) => {
  const { id, name, teacher, classroom, credit, hours, description } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id || !name || !teacher) {
    return res.json({
      success: false,
      data: { message: "ID、课程名称和教师不能为空" },
    });
  }
  let sql: string = "UPDATE courses SET name = ?, teacher = ?, classroom = ?, credit = ?, hours = ?, description = ? WHERE id = ?";
  let params: any[] = [name, teacher, classroom || "", credit || 0, hours || 0, description || "", id];
  connection.query(sql, params, async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "更新课程失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "更新课程成功" },
      });
    }
  });
};

/**
 * @typedef DeleteCourse
 * @property {integer} id.required - 课程ID
 */

/**
 * @route POST /deleteCourse
 * @param {DeleteCourse.model} point.body.required - 课程ID
 * @summary 删除课程
 * @group 课程管理相关
 * @returns {object} 200 - 删除结果
 * @security JWT
 */

const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "课程ID不能为空" },
    });
  }
  let sql: string = "DELETE FROM courses WHERE id = ?";
  connection.query(sql, [id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "删除课程失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "删除课程成功" },
      });
    }
  });
};

/**
 * @typedef AddClassroom
 * @property {string} name.required - 教室名称
 * @property {string} building.required - 楼栋
 * @property {integer} capacity.required - 容量
 * @property {string} type.required - 类型
 * @property {Array} facilities - 设施列表
 * @property {string} status - 状态
 */

/**
 * @route POST /addClassroom
 * @param {AddClassroom.model} point.body.required - 教室信息
 * @summary 添加教室
 * @group 教室管理相关
 * @returns {object} 200 - 添加结果
 * @security JWT
 */

const addClassroom = async (req: Request, res: Response) => {
  const { name, building, capacity, type, facilities, status } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!name || !building || !capacity || !type) {
    return res.json({
      success: false,
      data: { message: "教室名称、楼栋、容量和类型不能为空" },
    });
  }
  let checkSql: string = "select * from classrooms where name=" + "'" + name + "'";
  connection.query(checkSql, async (err, data: any) => {
    if (data.length > 0) {
      await res.json({
        success: false,
        data: { message: "教室名称已存在" },
      });
    } else {
      let time = await getFormatDate();
      let facilitiesJson = JSON.stringify(facilities || []);
      let sql: string = "insert into classrooms (name, building, capacity, type, facilities, status, createTime) values (?, ?, ?, ?, ?, ?, ?)";
      let params = [name, building, capacity, type, facilitiesJson, status || "空闲", time];
      connection.query(sql, params, async function (err) {
        if (err) {
          Logger.error(err);
          await res.json({
            success: false,
            data: { message: "添加教室失败" },
          });
        } else {
          await res.json({
            success: true,
            data: { message: "添加教室成功" },
          });
        }
      });
    }
  });
};

/**
 * @typedef EditClassroom
 * @property {integer} id.required - 教室ID
 * @property {string} name.required - 教室名称
 * @property {string} building.required - 楼栋
 * @property {integer} capacity.required - 容量
 * @property {string} type.required - 类型
 * @property {Array} facilities - 设施列表
 * @property {string} status - 状态
 */

/**
 * @route POST /editClassroom
 * @param {EditClassroom.model} point.body.required - 教室信息
 * @summary 编辑教室
 * @group 教室管理相关
 * @returns {object} 200 - 编辑结果
 * @security JWT
 */

const editClassroom = async (req: Request, res: Response) => {
  const { id, name, building, capacity, type, facilities, status } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id || !name || !building || !capacity || !type) {
    return res.json({
      success: false,
      data: { message: "ID、教室名称、楼栋、容量和类型不能为空" },
    });
  }
  let facilitiesJson = JSON.stringify(facilities || []);
  let sql: string = "UPDATE classrooms SET name = ?, building = ?, capacity = ?, type = ?, facilities = ?, status = ? WHERE id = ?";
  let params: any[] = [name, building, capacity, type, facilitiesJson, status || "空闲", id];
  connection.query(sql, params, async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "更新教室失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "更新教室成功" },
      });
    }
  });
};

/**
 * @typedef DeleteClassroom
 * @property {integer} id.required - 教室ID
 */

/**
 * @route POST /deleteClassroom
 * @param {DeleteClassroom.model} point.body.required - 教室ID
 * @summary 删除教室
 * @group 教室管理相关
 * @returns {object} 200 - 删除结果
 * @security JWT
 */

const deleteClassroom = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "教室ID不能为空" },
    });
  }
  let sql: string = "DELETE FROM classrooms WHERE id = ?";
  connection.query(sql, [id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "删除教室失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "删除教室成功" },
      });
    }
  });
};

/**
 * @typedef AddBooking
 * @property {integer} classroomId.required - 教室ID
 * @property {string} classroomName.required - 教室名称
 * @property {string} building - 楼栋
 * @property {string} applicant.required - 申请人
 * @property {string} purpose.required - 借用目的
 * @property {string} startTime.required - 开始时间
 * @property {string} endTime.required - 结束时间
 */

/**
 * @route POST /addBooking
 * @param {AddBooking.model} point.body.required - 借用信息
 * @summary 提交教室借用申请
 * @group 教室借用相关
 * @returns {object} 200 - 提交结果
 * @security JWT
 */

const addBooking = async (req: Request, res: Response) => {
  const { classroomId, classroomName, building, applicant, purpose, startTime, endTime } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!classroomId || !classroomName || !applicant || !purpose || !startTime || !endTime) {
    return res.json({
      success: false,
      data: { message: "借用信息不完整" },
    });
  }
  const borrowerId = payload.accountId;
  const borrowerRole = payload.roles && payload.roles.length > 0 ? payload.roles[0] : "unknown";
  let time = await getFormatDate();
  let sql: string = "insert into classroom_bookings (classroomId, classroomName, building, borrower, borrowerId, borrowerRole, purpose, startTime, endTime, status, createTime) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  let params = [classroomId, classroomName, building, applicant, borrowerId, borrowerRole, purpose, startTime, endTime, "待审批", time];
  connection.query(sql, params, async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "提交借用申请失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "提交借用申请成功" },
      });
    }
  });
};

/**
 * @typedef ApproveBooking
 * @property {integer} id.required - 借用记录ID
 */

/**
 * @route POST /approveBooking
 * @param {ApproveBooking.model} point.body.required - 借用记录ID
 * @summary 审批通过借用申请
 * @group 教室借用相关
 * @returns {object} 200 - 审批结果
 * @security JWT
 */

const approveBooking = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "借用记录ID不能为空" },
    });
  }
  let sql: string = "UPDATE classroom_bookings SET status = '进行中' WHERE id = ?";
  connection.query(sql, [id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "审批失败" },
      });
    } else {
      let getBookingSql: string = "select * from classroom_bookings where id = " + id;
      connection.query(getBookingSql, async (err, data: any) => {
        if (err) {
          Logger.error(err);
        } else if (data.length > 0) {
          let classroomId = data[0].classroomId;
          let updateClassroomSql: string = "UPDATE classrooms SET status = '使用中' WHERE id = ?";
          connection.query(updateClassroomSql, [classroomId], async (err) => {
            if (err) {
              Logger.error(err);
            }
          });
        }
      });
      await res.json({
        success: true,
        data: { message: "审批成功" },
      });
    }
  });
};

/**
 * @typedef RejectBooking
 * @property {integer} id.required - 借用记录ID
 */

/**
 * @route POST /rejectBooking
 * @param {RejectBooking.model} point.body.required - 借用记录ID
 * @summary 拒绝借用申请
 * @group 教室借用相关
 * @returns {object} 200 - 拒绝结果
 * @security JWT
 */

const rejectBooking = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "借用记录ID不能为空" },
    });
  }
  let sql: string = "UPDATE classroom_bookings SET status = '已拒绝' WHERE id = ?";
  connection.query(sql, [id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "拒绝失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "已拒绝申请" },
      });
    }
  });
};

/**
 * @typedef EndBooking
 * @property {integer} id.required - 借用记录ID
 */

/**
 * @route POST /endBooking
 * @param {EndBooking.model} point.body.required - 借用记录ID
 * @summary 结束借用
 * @group 教室借用相关
 * @returns {object} 200 - 结束结果
 * @security JWT
 */

const endBooking = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "借用记录ID不能为空" },
    });
  }
  let sql: string = "UPDATE classroom_bookings SET status = '已结束' WHERE id = ?";
  connection.query(sql, [id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "结束借用失败" },
      });
    } else {
      let getBookingSql: string = "select * from classroom_bookings where id = " + id;
      connection.query(getBookingSql, async (err, data: any) => {
        if (err) {
          Logger.error(err);
        } else if (data.length > 0) {
          let classroomId = data[0].classroomId;
          let updateClassroomSql: string = "UPDATE classrooms SET status = '空闲' WHERE id = ?";
          connection.query(updateClassroomSql, [classroomId], async (err) => {
            if (err) {
              Logger.error(err);
            }
          });
        }
      });
      await res.json({
        success: true,
        data: { message: "已结束借用" },
      });
    }
  });
};

/**
 * @typedef AddGrade
 * @property {integer} studentId.required - 学生ID
 * @property {string} studentName - 学生姓名
 * @property {integer} courseId.required - 课程ID
 * @property {string} courseName - 课程名称
 * @property {string} teacher - 教师
 * @property {integer} credit - 学分
 * @property {integer} hours - 课时
 * @property {string} classroom - 教室
 * @property {string} semester - 学期
 * @property {number} grade.required - 成绩
 * @property {number} gradePoint - 绩点
 * @property {string} examType - 考试类型
 * @property {string} examTime - 考试时间
 */

/**
 * @route POST /addGrade
 * @param {AddGrade.model} point.body.required - 成绩信息
 * @summary 添加成绩
 * @group 成绩管理相关
 * @returns {object} 200 - 添加结果
 * @security JWT
 */

const addGrade = async (req: Request, res: Response) => {
  const { studentId, studentName, courseId, courseName, teacher, credit, hours, classroom, semester, grade, gradePoint, examType, examTime } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!studentId || !courseId || grade === undefined || grade === null) {
    return res.json({
      success: false,
      data: { message: "学生ID、课程ID和成绩不能为空" },
    });
  }
  let time = await getFormatDate();
  let sql: string = "insert into student_grades (studentId, studentName, courseId, courseName, teacher, credit, hours, classroom, semester, grade, gradePoint, examType, examTime, createTime) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  let params = [studentId, studentName, courseId, courseName, teacher, credit || 3, hours || 48, classroom || "", semester || "2025-2026-1", grade, gradePoint || 0, examType || "期末考试", examTime || time, time];
  connection.query(sql, params, async function (err) {
    if (err) {
      Logger.error(err);
      if (err.code === "ER_DUP_ENTRY") {
        await res.json({
          success: false,
          data: { message: "该学生在该课程的该学期已有成绩记录，请编辑现有记录" },
        });
      } else {
        await res.json({
          success: false,
          data: { message: "添加成绩失败" },
        });
      }
    } else {
      await res.json({
        success: true,
        data: { message: "添加成绩成功" },
      });
    }
  });
};

/**
 * @typedef EditGrade
 * @property {integer} id.required - 成绩ID
 * @property {integer} studentId.required - 学生ID
 * @property {string} studentName - 学生姓名
 * @property {integer} courseId.required - 课程ID
 * @property {string} courseName - 课程名称
 * @property {string} teacher - 教师
 * @property {integer} credit - 学分
 * @property {integer} hours - 课时
 * @property {string} classroom - 教室
 * @property {string} semester - 学期
 * @property {number} grade.required - 成绩
 * @property {number} gradePoint - 绩点
 * @property {string} examType - 考试类型
 * @property {string} examTime - 考试时间
 */

/**
 * @route POST /editGrade
 * @param {EditGrade.model} point.body.required - 成绩信息
 * @summary 编辑成绩
 * @group 成绩管理相关
 * @returns {object} 200 - 编辑结果
 * @security JWT
 */

const editGrade = async (req: Request, res: Response) => {
  const { id, studentId, studentName, courseId, courseName, teacher, credit, hours, classroom, semester, grade, gradePoint, examType, examTime } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id || !studentId || !courseId || !grade) {
    return res.json({
      success: false,
      data: { message: "ID、学生ID、课程ID和成绩不能为空" },
    });
  }
  let sql: string = "UPDATE student_grades SET studentId = ?, studentName = ?, courseId = ?, courseName = ?, teacher = ?, credit = ?, hours = ?, classroom = ?, semester = ?, grade = ?, gradePoint = ?, examType = ?, examTime = ? WHERE id = ?";
  let params: any[] = [studentId, studentName, courseId, courseName, teacher, credit, hours, classroom, semester, grade, gradePoint, examType, examTime, id];
  connection.query(sql, params, async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "更新成绩失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "更新成绩成功" },
      });
    }
  });
};

/**
 * @typedef DeleteGrade
 * @property {integer} id.required - 成绩ID
 */

/**
 * @route POST /deleteGrade
 * @param {DeleteGrade.model} point.body.required - 成绩ID
 * @summary 删除成绩
 * @group 成绩管理相关
 * @returns {object} 200 - 删除结果
 * @security JWT
 */

const deleteGrade = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "成绩ID不能为空" },
    });
  }
  let sql: string = "DELETE FROM student_grades WHERE id = ?";
  connection.query(sql, [id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "删除成绩失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "删除成绩成功" },
      });
    }
  });
};

/**
 * @typedef PublishGrade
 * @property {integer} id.required - 成绩ID
 */

/**
 * @route POST /publishGrade
 * @param {PublishGrade.model} point.body.required - 成绩ID
 * @summary 发布成绩
 * @group 成绩管理相关
 * @returns {object} 200 - 发布结果
 * @security JWT
 */

const publishGrade = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "成绩ID不能为空" },
    });
  }
  let time = await getFormatDate();
  let sql: string = "UPDATE student_grades SET status = '已发布', publishTime = ? WHERE id = ?";
  connection.query(sql, [time, id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "发布成绩失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "发布成绩成功" },
      });
    }
  });
};

/**
 * @typedef AddEvaluation
 * @property {integer} studentId - 学生ID
 * @property {string} studentNo - 学号
 * @property {string} studentName - 学生姓名
 * @property {integer} courseId.required - 课程ID
 * @property {string} courseName - 课程名称
 * @property {string} teacher - 教师
 * @property {string} semester - 学期
 * @property {number} teachingScore.required - 教学评分
 * @property {number} contentScore.required - 内容评分
 * @property {number} interactionScore.required - 互动评分
 * @property {number} attitudeScore.required - 态度评分
 * @property {number} overallScore.required - 总体评分
 * @property {string} comment - 评论
 */

/**
 * @route POST /addEvaluation
 * @param {AddEvaluation.model} point.body.required - 评教信息
 * @summary 添加评教
 * @group 评教管理相关
 * @returns {object} 200 - 添加结果
 * @security JWT
 */

const addEvaluation = async (req: Request, res: Response) => {
  let { studentId, studentNo, studentName, courseId, courseName, teacher, semester, teachingScore, contentScore, interactionScore, attitudeScore, overallScore, comment } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret) as jwt.JwtPayload;
    if (!studentNo && payload.studentNo) {
      studentNo = payload.studentNo;
    }
    if (!studentId && payload.accountId) {
      studentId = payload.accountId;
    }
    if (!studentName && payload.name) {
      studentName = payload.name;
    }
  } catch (error) {
    return res.status(401).end();
  }
  if (!studentId || !courseId || !teachingScore || !contentScore || !interactionScore || !attitudeScore || !overallScore) {
    return res.json({
      success: false,
      data: { message: "学生ID、课程ID和评分不能为空" },
    });
  }
  let time = await getFormatDate();
  let avgScore = (teachingScore + contentScore + interactionScore + attitudeScore + overallScore) / 5;
  
  let checkSql: string = "select * from student_evaluations where courseId = ? and studentId = ?";
  connection.query(checkSql, [courseId, studentId], async (err, existingData: any) => {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "查询评教记录失败" },
      });
      return;
    }
    
    if (existingData && existingData.length > 0) {
      let updateSql: string = "UPDATE student_evaluations SET studentNo = ?, studentName = ?, courseName = ?, teacher = ?, semester = ?, teachingScore = ?, contentScore = ?, interactionScore = ?, attitudeScore = ?, overallScore = ?, avgScore = ?, comment = ?, status = ?, createTime = ?, evaluationTime = ? WHERE courseId = ? AND studentId = ?";
      let updateParams = [studentNo, studentName, courseName, teacher, semester, teachingScore, contentScore, interactionScore, attitudeScore, overallScore, avgScore, comment || "", "已提交", time, time, courseId, studentId];
      connection.query(updateSql, updateParams, async (updateErr) => {
        if (updateErr) {
          Logger.error(updateErr);
          await res.json({
            success: false,
            data: { message: "更新评教失败" },
          });
        } else {
          await res.json({
            success: true,
            data: { message: "更新评教成功" },
          });
        }
      });
    } else {
      let insertSql: string = "insert into student_evaluations (studentId, studentNo, studentName, courseId, courseName, teacher, semester, teachingScore, contentScore, interactionScore, attitudeScore, overallScore, avgScore, comment, status, createTime, evaluationTime) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      let insertParams = [studentId, studentNo, studentName, courseId, courseName, teacher, semester, teachingScore, contentScore, interactionScore, attitudeScore, overallScore, avgScore, comment || "", "已提交", time, time];
      connection.query(insertSql, insertParams, async (insertErr) => {
        if (insertErr) {
          Logger.error(insertErr);
          await res.json({
            success: false,
            data: { message: "添加评教失败" },
          });
        } else {
          await res.json({
            success: true,
            data: { message: "添加评教成功" },
          });
        }
      });
    }
  });
};

/**
 * @typedef EditEvaluation
 * @property {integer} id.required - 评教ID
 * @property {integer} studentId.required - 学生ID
 * @property {string} studentNo - 学号
 * @property {string} studentName - 学生姓名
 * @property {integer} courseId.required - 课程ID
 * @property {string} courseName - 课程名称
 * @property {string} teacher - 教师
 * @property {string} semester - 学期
 * @property {number} teachingScore.required - 教学评分
 * @property {number} contentScore.required - 内容评分
 * @property {number} interactionScore.required - 互动评分
 * @property {number} attitudeScore.required - 态度评分
 * @property {number} overallScore.required - 总体评分
 * @property {string} comment - 评论
 * @property {string} status - 状态
 */

/**
 * @route POST /editEvaluation
 * @param {EditEvaluation.model} point.body.required - 评教信息
 * @summary 编辑评教
 * @group 评教管理相关
 * @returns {object} 200 - 编辑结果
 * @security JWT
 */

const editEvaluation = async (req: Request, res: Response) => {
  const { id, studentId, studentNo, studentName, courseId, courseName, teacher, semester, teachingScore, contentScore, interactionScore, attitudeScore, overallScore, comment, status } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id || !studentId || !courseId || !teachingScore || !contentScore || !interactionScore || !attitudeScore || !overallScore) {
    return res.json({
      success: false,
      data: { message: "ID、学生ID、课程ID和评分不能为空" },
    });
  }
  let sql: string = "UPDATE student_evaluations SET studentId = ?, studentNo = ?, studentName = ?, courseId = ?, courseName = ?, teacher = ?, semester = ?, teachingScore = ?, contentScore = ?, interactionScore = ?, attitudeScore = ?, overallScore = ?, comment = ?, status = ? WHERE id = ?";
  let params: any[] = [studentId, studentNo, studentName, courseId, courseName, teacher, semester, teachingScore, contentScore, interactionScore, attitudeScore, overallScore, comment || "", status, id];
  connection.query(sql, params, async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "更新评教失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "更新评教成功" },
      });
    }
  });
};

/**
 * @typedef DeleteEvaluation
 * @property {integer} id.required - 评教ID
 */

/**
 * @route POST /deleteEvaluation
 * @param {DeleteEvaluation.model} point.body.required - 评教ID
 * @summary 删除评教
 * @group 评教管理相关
 * @returns {object} 200 - 删除结果
 * @security JWT
 */

const deleteEvaluation = async (req: Request, res: Response) => {
  const { id } = req.body;
  let payload = null;
  try {
    const authorizationHeader = req.get("Authorization") as string;
    const accessToken = authorizationHeader.substr("Bearer ".length);
    payload = jwt.verify(accessToken, secret.jwtSecret);
  } catch (error) {
    return res.status(401).end();
  }
  if (!id) {
    return res.json({
      success: false,
      data: { message: "评教ID不能为空" },
    });
  }
  let sql: string = "DELETE FROM student_evaluations WHERE id = ?";
  connection.query(sql, [id], async function (err) {
    if (err) {
      Logger.error(err);
      await res.json({
        success: false,
        data: { message: "删除评教失败" },
      });
    } else {
      await res.json({
        success: true,
        data: { message: "删除评教成功" },
      });
    }
  });
};

export {
  login,
  updateList,
  deleteList,
  searchPage,
  searchVague,
  upload,
  captcha,
  getAllUsers,
  addUser,
  editUser,
  deleteUser,
  refreshToken,
  getAllStudents,
  addStudent,
  editStudent,
  deleteStudent,
  getAllGrades,
  getAllEvaluations,
  getAllCourses,
  getAllClasses,
  getAllClassrooms,
  getAllBookings,
  addClass,
  editClass,
  deleteClass,
  bindCourses,
  addCourse,
  editCourse,
  deleteCourse,
  addClassroom,
  editClassroom,
  deleteClassroom,
  addBooking,
  approveBooking,
  rejectBooking,
  endBooking,
  addGrade,
  editGrade,
  deleteGrade,
  publishGrade,
  addEvaluation,
  editEvaluation,
  deleteEvaluation,
};
