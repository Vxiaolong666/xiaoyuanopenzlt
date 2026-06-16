import * as dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  port: parseInt(process.env.PORT, 10),
  databaseURL: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGO,
  options: {
    swaggerDefinition: {
      info: {
        description: "pure-admin官方后端 - API接口文档",
        title: "pure-admin API文档",
        version: require("../../package.json").version,
        "x-logo": {
          url: "",
          backgroundColor: "#FFFFFF",
          altText: "pure-admin API"
        }
      },
      host: `localhost:${parseInt(process.env.PORT, 10)}`,
      basePath: "/",
      produces: ["application/json", "application/xml"],
      schemes: ["http", "https"],
      securityDefinitions: {
        JWT: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "Bearer Authorization - JWT令牌认证",
        },
      },
      tags: [
        { name: "用户登录相关", description: "用户登录、令牌刷新" },
        { name: "用户管理相关", description: "用户的增删改查" },
        { name: "学生管理相关", description: "学生的增删改查" },
        { name: "成绩管理相关", description: "成绩的增删改查及发布" },
        { name: "评教管理相关", description: "评教的增删改查" },
        { name: "课程管理相关", description: "课程的增删改查" },
        { name: "班级管理相关", description: "班级的增删改查及课程绑定" },
        { name: "教室管理相关", description: "教室的增删改查" },
        { name: "教室借用相关", description: "教室借用申请及审批" },
        { name: "captcha - 图形验证码", description: "获取图形验证码" }
      ],
      lang: "cn"
    },
    route: {
      url: "./swagger-ui.html",
      // swagger文件 api
      docs: "/swagger.json",
    },
    // app absolute path
    basedir: __dirname,
    // path to the API handle folder
    files: ["../router/*.ts"],
  },
  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },
  agenda: {
    dbCollection: process.env.AGENDA_DB_COLLECTION,
    pooltime: process.env.AGENDA_POOL_TIME,
    concurrency: parseInt(process.env.AGENDA_CONCURRENCY, 10),
  },
  mysql: {
    host: "127.0.0.1",
    port: 3306,
    charset: "utf8_general_ci",
    user: "cs13",
    password: "cs13",
  },
  mongodb: {},
  sqlite: {},
  api: {
    prefix: "/api",
  },
  emails: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};
