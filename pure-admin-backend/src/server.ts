import app from "./app";
import config from "./config";
import * as dayjs from "dayjs";
import * as multer from "multer";
import Logger from "./loaders/logger";
const expressSwagger = require("express-swagger-generator")(app);
expressSwagger(config.options);

import {
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
} from "./router/http";


app.post("/login", (req, res) => {
  login(req, res);
});

app.post("/refresh-token", (req, res) => {
  refreshToken(req, res);
});

app.put("/updateList/:id", (req, res) => {
  updateList(req, res);
});

app.delete("/deleteList/:id", (req, res) => {
  deleteList(req, res);
});

app.post("/searchPage", (req, res) => {
  searchPage(req, res);
});

app.post("/searchVague", (req, res) => {
  searchVague(req, res);
});

// 新建存放临时文件的文件夹
const upload_tmp = multer({ dest: "upload_tmp/" });
app.post("/upload", upload_tmp.any(), (req, res) => {
  upload(req, res);
});

app.get("/captcha", (req, res) => {
  captcha(req, res);
});

app.get("/getAllUsers", (req, res) => {
  getAllUsers(req, res);
});

app.post("/addUser", (req, res) => {
  addUser(req, res);
});

app.post("/editUser", (req, res) => {
  editUser(req, res);
});

app.post("/deleteUser", (req, res) => {
  deleteUser(req, res);
});

app.get("/getAllStudents", (req, res) => {
  getAllStudents(req, res);
});

app.post("/addStudent", (req, res) => {
  addStudent(req, res);
});

app.post("/editStudent", (req, res) => {
  editStudent(req, res);
});

app.post("/deleteStudent", (req, res) => {
  deleteStudent(req, res);
});

app.get("/getAllGrades", (req, res) => {
  getAllGrades(req, res);
});

app.get("/getAllEvaluations", (req, res) => {
  getAllEvaluations(req, res);
});

app.get("/getAllCourses", (req, res) => {
  getAllCourses(req, res);
});

app.get("/getAllClasses", (req, res) => {
  getAllClasses(req, res);
});

app.get("/getAllClassrooms", (req, res) => {
  getAllClassrooms(req, res);
});

app.get("/getAllBookings", (req, res) => {
  getAllBookings(req, res);
});

app.post("/addClass", (req, res) => {
  addClass(req, res);
});

app.post("/editClass", (req, res) => {
  editClass(req, res);
});

app.post("/deleteClass", (req, res) => {
  deleteClass(req, res);
});

app.post("/bindCourses", (req, res) => {
  bindCourses(req, res);
});

app.post("/addCourse", (req, res) => {
  addCourse(req, res);
});

app.post("/editCourse", (req, res) => {
  editCourse(req, res);
});

app.post("/deleteCourse", (req, res) => {
  deleteCourse(req, res);
});

app.post("/addClassroom", (req, res) => {
  addClassroom(req, res);
});

app.post("/editClassroom", (req, res) => {
  editClassroom(req, res);
});

app.post("/deleteClassroom", (req, res) => {
  deleteClassroom(req, res);
});

app.post("/addBooking", (req, res) => {
  addBooking(req, res);
});

app.post("/approveBooking", (req, res) => {
  approveBooking(req, res);
});

app.post("/rejectBooking", (req, res) => {
  rejectBooking(req, res);
});

app.post("/endBooking", (req, res) => {
  endBooking(req, res);
});

app.post("/addGrade", (req, res) => {
  addGrade(req, res);
});

app.post("/editGrade", (req, res) => {
  editGrade(req, res);
});

app.post("/deleteGrade", (req, res) => {
  deleteGrade(req, res);
});

app.post("/publishGrade", (req, res) => {
  publishGrade(req, res);
});

app.post("/addEvaluation", (req, res) => {
  addEvaluation(req, res);
});

app.post("/editEvaluation", (req, res) => {
  editEvaluation(req, res);
});

app.post("/deleteEvaluation", (req, res) => {
  deleteEvaluation(req, res);
});

import * as jwt from "jsonwebtoken";

app.get("/get-async-routes", (req, res) => {
  let roles: string[] = [];
  let hasValidToken = false;
  
  try {
    const authorizationHeader = req.get("Authorization") as string;
    if (authorizationHeader) {
      const accessToken = authorizationHeader.substr("Bearer ".length);
      const payload = jwt.verify(accessToken, config.jwtSecret) as jwt.JwtPayload;
      roles = payload.roles || [];
      hasValidToken = true;
    }
  } catch (error) {
  }

  if (!hasValidToken) {
    return res.status(401).json({
      success: false,
      data: { message: "登录已过期，请重新登录" }
    });
  }

  const isAdmin = roles.includes("admin");
  const isStudent = roles.includes("student");

  const classManagementRouter = {
    path: "/classManagement",
    meta: {
      title: "班级管理",
      icon: "ep:reading",
      rank: 7,
      roles: ["admin"]
    },
    children: [
      {
        path: "/classManagement/list",
        name: "ClassManagementList",
        component: "classManagement/index",
        meta: {
          title: "班级列表",
          roles: ["admin"]
        }
      }
    ]
  };

  const courseManagementRouter = {
    path: "/courseManagement",
    meta: {
      title: "课程管理",
      icon: "ep:document",
      rank: 6,
      roles: ["admin"]
    },
    children: [
      {
        path: "/courseManagement/list",
        name: "CourseManagementList",
        component: "courseManagement/index",
        meta: {
          title: "课程列表",
          roles: ["admin"]
        }
      }
    ]
  };

  const classroomManagementRouter = {
    path: "/classroomManagement",
    meta: {
      title: "教室管理",
      icon: "ep:school",
      rank: 5,
      roles: ["admin"]
    },
    children: [
      {
        path: "/classroomManagement/list",
        name: "ClassroomManagementList",
        component: "classroomManagement/index",
        meta: {
          title: "教室列表",
          roles: ["admin"]
        }
      }
    ]
  };

  const classroomBookingRouterAdmin = {
    path: "/classroomBooking",
    meta: {
      title: "教室借用",
      icon: "ep:calendar",
      rank: 4,
      roles: ["admin"]
    },
    children: [
      {
        path: "/classroomBooking/apply",
        name: "ClassroomBookingApply",
        component: "classroomBookingApply/index",
        meta: {
          title: "借用申请",
          roles: ["admin"]
        }
      },
      {
        path: "/classroomBooking/manage",
        name: "ClassroomBookingManage",
        component: "classroomBooking/index",
        meta: {
          title: "借用管理",
          roles: ["admin"]
        }
      }
    ]
  };

  const classroomBookingRouterStudent = {
    path: "/classroomBooking",
    meta: {
      title: "教室借用",
      icon: "ep:calendar",
      rank: 4,
      roles: ["student"]
    },
    children: [
      {
        path: "/classroomBooking/apply",
        name: "ClassroomBookingApplyStudent",
        component: "classroomBookingApply/index",
        meta: {
          title: "借用申请",
          roles: ["student"]
        }
      }
    ]
  };

  const studentEvaluationRouter = {
    path: "/studentEvaluation",
    meta: {
      title: "学生评教",
      icon: "ep:star",
      rank: 6,
      roles: ["admin", "student"]
    },
    children: [
      {
        path: "/studentEvaluation/list",
        name: "StudentEvaluationList",
        component: "studentEvaluation/index",
        meta: {
          title: "学生评教",
          roles: ["admin", "student"]
        }
      }
    ]
  };

  const evaluationManagementRouter = {
    path: "/evaluationManagement",
    meta: {
      title: "评教管理",
      icon: "ep:star-filled",
      rank: 6.5,
      roles: ["admin"]
    },
    children: [
      {
        path: "/evaluationManagement/list",
        name: "EvaluationManagementList",
        component: "evaluationManagement/index",
        meta: {
          title: "评教管理",
          roles: ["admin"]
        }
      }
    ]
  };

  const gradeQueryRouter = {
    path: "/gradeQuery",
    meta: {
      title: "成绩查询",
      icon: "ep:document",
      rank: 7,
      roles: ["admin", "student"]
    },
    children: [
      {
        path: "/gradeQuery/list",
        name: "GradeQueryList",
        component: "gradeQuery/index",
        meta: {
          title: "成绩查询",
          roles: ["admin", "student"]
        }
      }
    ]
  };

  const myCoursesRouter = {
    path: "/myCourses",
    meta: {
      title: "我的课程",
      icon: "ep:reading",
      rank: 5,
      roles: ["student"]
    },
    children: [
      {
        path: "/myCourses/list",
        name: "MyCoursesList",
        component: "myCourses/index",
        meta: {
          title: "我的课程",
          roles: ["student"]
        }
      }
    ]
  };

  const gradeManagementRouter = {
    path: "/gradeManagement",
    meta: {
      title: "成绩管理",
      icon: "ep:document-checked",
      rank: 7.5,
      roles: ["admin"]
    },
    children: [
      {
        path: "/gradeManagement/list",
        name: "GradeManagementList",
        component: "gradeManagement/index",
        meta: {
          title: "成绩管理",
          roles: ["admin"]
        }
      }
    ]
  };

  const adminManagementRouter = {
    path: "/adminManagement",
    meta: {
      title: "管理员管理",
      icon: "ep:user-filled",
      rank: 8.5,
      roles: ["admin"]
    },
    children: [
      {
        path: "/adminManagement/list",
        name: "AdminManagementList",
        component: "adminManagement/index",
        meta: {
          title: "管理员管理",
          roles: ["admin"]
        }
      }
    ]
  };

  const studentManagementRouter = {
    path: "/studentManagement",
    meta: {
      title: "学生管理",
      icon: "ep:avatar",
      rank: 9,
      roles: ["admin"]
    },
    children: [
      {
        path: "/studentManagement/list",
        name: "StudentManagementList",
        component: "studentManagement/index",
        meta: {
          title: "学生管理",
          roles: ["admin"]
        }
      }
    ]
  };

  let routes: any[] = [];
  
  if (isAdmin) {
    routes = [
      classroomBookingRouterAdmin,
      classroomManagementRouter,
      courseManagementRouter,
      classManagementRouter,
      evaluationManagementRouter,
      gradeManagementRouter,
      adminManagementRouter,
      studentManagementRouter
    ];
  } else if (isStudent) {
    routes = [
      myCoursesRouter,
      classroomBookingRouterStudent,
      studentEvaluationRouter,
      gradeQueryRouter
    ];
  }

  res.json({
    success: true,
    data: routes
  });
});

app.ws("/socket", function (ws, req) {
  ws.send(
    `${dayjs(new Date()).format("YYYY年MM月DD日HH时mm分ss秒")}成功连接socket`
  );

  // 监听客户端是否关闭socket
  ws.on("close", function (msg) {
    console.log("客户端已关闭socket", msg);
    ws.close();
  });

  // 监听客户端发送的消息
  ws.on("message", function (msg) {
    // 如果客户端发送close，服务端主动关闭该socket
    if (msg === "close") ws.close();

    ws.send(
      `${dayjs(new Date()).format(
        "YYYY年MM月DD日HH时mm分ss秒"
      )}接收到客户端发送的信息，服务端返回信息：${msg}`
    );
  });
});

app
  .listen(config.port, () => {
    Logger.info(`
    ################################################
    🛡️  Swagger文档地址: http://localhost:${config.port} 🛡️
    ################################################
  `);
  })
  .on("error", (err) => {
    Logger.error(err);
    process.exit(1);
  });

// open(`http://localhost:${config.port}`); // 自动打开默认浏览器
