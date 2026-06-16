import { http } from "@/utils/http";

export type UserResult = {
  success: boolean;
  data: {
    message: string;
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/login", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

export type CaptchaResult = {
  success: boolean;
  data: {
    text: string;
    svg: string;
  };
};

/** 获取图形验证码 */
export const getCaptcha = () => {
  return http.request<CaptchaResult>("get", "/captcha");
};

export type UserManagementResult = {
  success: boolean;
  data: Array<{
    id: number;
    username: string;
    time: string;
    role: "admin" | "common";
  }>;
};

/** 获取所有用户 */
export const getAllUsers = () => {
  return http.request<UserManagementResult>("get", "/getAllUsers");
};

/** 添加用户 */
export const addUser = (data?: object) => {
  return http.request<UserManagementResult>("post", "/addUser", { data });
};

/** 编辑用户 */
export const editUser = (data?: object) => {
  return http.request<UserManagementResult>("post", "/editUser", { data });
};

/** 删除用户 */
export const deleteUser = (data?: object) => {
  return http.request<UserManagementResult>("post", "/deleteUser", { data });
};

export type StudentManagementResult = {
  success: boolean;
  data:
    | Array<{
        id: number;
        studentNo: string;
        name: string;
        gender: string;
        classId: number;
        className: string;
        major: string;
        phone: string;
        email: string;
        password: string;
        createTime: string;
      }>
    | { message: string };
};

/** 获取所有学生 */
export const getAllStudents = () => {
  return http.request<StudentManagementResult>("get", "/getAllStudents");
};

/** 添加学生 */
export const addStudent = (data?: object) => {
  return http.request<StudentManagementResult>("post", "/addStudent", { data });
};

/** 编辑学生 */
export const editStudent = (data?: object) => {
  return http.request<StudentManagementResult>("post", "/editStudent", {
    data
  });
};

/** 删除学生 */
export const deleteStudent = (data?: object) => {
  return http.request<StudentManagementResult>("post", "/deleteStudent", {
    data
  });
};

export type GradeManagementResult = {
  success: boolean;
  data:
    | Array<{
        id: number;
        studentId: number;
        studentNo: string;
        studentName: string;
        classId: number;
        className: string;
        courseId: number;
        courseName: string;
        teacher: string;
        credit: number;
        semester: string;
        grade: number;
        gradePoint: number;
        examType: string;
        examTime: string;
        status: string;
        createTime: string;
        publishTime: string;
      }>
    | { message: string };
};

/** 获取所有成绩 */
export const getAllGrades = () => {
  return http.request<GradeManagementResult>("get", "/getAllGrades");
};

export type EvaluationManagementResult = {
  success: boolean;
  data:
    | Array<{
        id: number;
        studentId: number;
        studentNo: string;
        studentName: string;
        courseId: number;
        courseName: string;
        teacher: string;
        semester: string;
        teachingScore: number;
        contentScore: number;
        interactionScore: number;
        attitudeScore: number;
        overallScore: number;
        comment: string;
        status: string;
        createTime: string;
        evaluationTime: string;
      }>
    | { message: string };
};

/** 获取所有评教 */
export const getAllEvaluations = () => {
  return http.request<EvaluationManagementResult>("get", "/getAllEvaluations");
};

export type CourseManagementResult = {
  success: boolean;
  data:
    | Array<{
        id: number;
        name: string;
        teacher: string;
        credit: number;
        hours: number;
        classroom: string;
        description: string;
        createTime: string;
      }>
    | { message: string };
};

/** 获取所有课程 */
export const getAllCourses = () => {
  return http.request<CourseManagementResult>("get", "/getAllCourses");
};

/** 添加课程 */
export const addCourse = (data?: object) => {
  return http.request<CourseManagementResult>("post", "/addCourse", { data });
};

/** 编辑课程 */
export const editCourse = (data?: object) => {
  return http.request<CourseManagementResult>("post", "/editCourse", { data });
};

/** 删除课程 */
export const deleteCourse = (data?: object) => {
  return http.request<CourseManagementResult>("post", "/deleteCourse", {
    data
  });
};

export type ClassManagementResult = {
  success: boolean;
  data:
    | Array<{
        id: number;
        name: string;
        grade: string;
        major: string;
        studentCount: number;
        createTime: string;
      }>
    | { message: string };
};

/** 获取所有班级 */
export const getAllClasses = () => {
  return http.request<ClassManagementResult>("get", "/getAllClasses");
};

/** 添加班级 */
export const addClass = (data?: object) => {
  return http.request<ClassManagementResult>("post", "/addClass", { data });
};

/** 编辑班级 */
export const editClass = (data?: object) => {
  return http.request<ClassManagementResult>("post", "/editClass", { data });
};

/** 删除班级 */
export const deleteClass = (data?: object) => {
  return http.request<ClassManagementResult>("post", "/deleteClass", { data });
};

/** 绑定课程 */
export const bindCourses = (data?: object) => {
  return http.request<ClassManagementResult>("post", "/bindCourses", { data });
};

export type ClassroomManagementResult = {
  success: boolean;
  data:
    | Array<{
        id: number;
        name: string;
        building: string;
        capacity: number;
        type: string;
        facilities: string;
        status: string;
        createTime: string;
      }>
    | { message: string };
};

/** 获取所有教室 */
export const getAllClassrooms = () => {
  return http.request<ClassroomManagementResult>("get", "/getAllClassrooms");
};

/** 添加教室 */
export const addClassroom = (data?: object) => {
  return http.request<ClassroomManagementResult>("post", "/addClassroom", {
    data
  });
};

/** 编辑教室 */
export const editClassroom = (data?: object) => {
  return http.request<ClassroomManagementResult>("post", "/editClassroom", {
    data
  });
};

/** 删除教室 */
export const deleteClassroom = (data?: object) => {
  return http.request<ClassroomManagementResult>("post", "/deleteClassroom", {
    data
  });
};

export type BookingManagementResult = {
  success: boolean;
  data:
    | Array<{
        id: number;
        classroomId: number;
        classroomName: string;
        building: string;
        applicant: string;
        purpose: string;
        startTime: string;
        endTime: string;
        status: string;
        createTime: string;
      }>
    | { message: string };
};

/** 获取所有借用记录 */
export const getAllBookings = () => {
  return http.request<BookingManagementResult>("get", "/getAllBookings");
};

/** 添加借用申请 */
export const addBooking = (data?: object) => {
  return http.request<BookingManagementResult>("post", "/addBooking", { data });
};

/** 审批借用申请 */
export const approveBooking = (data?: object) => {
  return http.request<BookingManagementResult>("post", "/approveBooking", {
    data
  });
};

/** 拒绝借用申请 */
export const rejectBooking = (data?: object) => {
  return http.request<BookingManagementResult>("post", "/rejectBooking", {
    data
  });
};

/** 结束借用 */
export const endBooking = (data?: object) => {
  return http.request<BookingManagementResult>("post", "/endBooking", { data });
};

/** 添加成绩 */
export const addGrade = (data?: object) => {
  return http.request<GradeManagementResult>("post", "/addGrade", { data });
};

/** 编辑成绩 */
export const editGrade = (data?: object) => {
  return http.request<GradeManagementResult>("post", "/editGrade", { data });
};

/** 删除成绩 */
export const deleteGrade = (data?: object) => {
  return http.request<GradeManagementResult>("post", "/deleteGrade", { data });
};

/** 发布成绩 */
export const publishGrade = (data?: object) => {
  return http.request<GradeManagementResult>("post", "/publishGrade", { data });
};

/** 添加评教 */
export const addEvaluation = (data?: object) => {
  return http.request<EvaluationManagementResult>("post", "/addEvaluation", {
    data
  });
};

/** 编辑评教 */
export const editEvaluation = (data?: object) => {
  return http.request<EvaluationManagementResult>("post", "/editEvaluation", {
    data
  });
};

/** 删除评教 */
export const deleteEvaluation = (data?: object) => {
  return http.request<EvaluationManagementResult>("post", "/deleteEvaluation", {
    data
  });
};
