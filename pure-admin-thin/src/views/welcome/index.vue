<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStoreHook } from "@/store/modules/user";
import {
  getAllStudents,
  getAllCourses,
  getAllClasses,
  getAllClassrooms
} from "@/api/user";
import User from "~icons/ep/user";
import Reading from "~icons/ep/reading";
import Calendar from "~icons/ep/calendar";
import Document from "~icons/ep/document";
import StarFilled from "~icons/ep/star-filled";
import Trophy from "~icons/ep/trophy";
import School from "~icons/ep/school";
import Key from "~icons/ep/key";
import Search from "~icons/ep/search";

defineOptions({
  name: "Welcome"
});

const router = useRouter();
const userStore = useUserStoreHook();
const isAdmin = computed(() => userStore.roles.includes("admin"));

const statsData = ref<
  Array<{
    title: string;
    value: number | string;
    icon: any;
    color: string;
    bgColor: string;
    visible: boolean;
  }>
>([
  {
    title: "学生总数",
    value: 0,
    icon: User,
    color: "#409EFF",
    bgColor: "#ecf5ff",
    visible: true
  },
  {
    title: "班级总数",
    value: 0,
    icon: Reading,
    color: "#67C23A",
    bgColor: "#f0f9eb",
    visible: true
  },
  {
    title: "课程总数",
    value: 0,
    icon: Document,
    color: "#E6A23C",
    bgColor: "#fdf6ec",
    visible: true
  },
  {
    title: "教室总数",
    value: 0,
    icon: Calendar,
    color: "#F56C6C",
    bgColor: "#fef0f0",
    visible: true
  }
]);

const adminQuickLinks = ref([
  {
    title: "班级管理",
    description: "管理班级信息、分配课程",
    icon: Reading,
    color: "#67C23A",
    path: "/classManagement/list"
  },
  {
    title: "课程管理",
    description: "管理课程信息、安排教师",
    icon: Document,
    color: "#E6A23C",
    path: "/courseManagement/list"
  },
  {
    title: "教室管理",
    description: "管理教室资源、设施设备",
    icon: School,
    color: "#F56C6C",
    path: "/classroomManagement/list"
  },
  {
    title: "教室借用",
    description: "审批借用申请、管理借用记录",
    icon: Calendar,
    color: "#409EFF",
    path: "/classroomBooking/apply"
  },
  {
    title: "评教管理",
    description: "查看评教记录、统计分析",
    icon: StarFilled,
    color: "#9C27B0",
    path: "/evaluationManagement/list"
  },
  {
    title: "成绩管理",
    description: "录入成绩、统计分析",
    icon: Trophy,
    color: "#FF9800",
    path: "/gradeManagement/list"
  },
  {
    title: "管理员管理",
    description: "管理管理员账号、权限设置",
    icon: Key,
    color: "#607D8B",
    path: "/adminManagement/list"
  },
  {
    title: "学生管理",
    description: "管理学生信息、账号管理",
    icon: User,
    color: "#00BCD4",
    path: "/studentManagement/list"
  }
]);

const studentQuickLinks = ref([
  {
    title: "我的课程",
    description: "查看我的课程信息、课程状态",
    icon: Reading,
    color: "#67C23A",
    path: "/myCourses/list"
  },
  {
    title: "教室借用",
    description: "申请教室借用、查看借用记录",
    icon: Calendar,
    color: "#409EFF",
    path: "/classroomBooking/apply"
  },
  {
    title: "学生评教",
    description: "对课程进行评教、查看评教记录",
    icon: StarFilled,
    color: "#9C27B0",
    path: "/studentEvaluation/list"
  },
  {
    title: "成绩查询",
    description: "查看个人成绩、统计分析",
    icon: Search,
    color: "#FF9800",
    path: "/gradeQuery/list"
  }
]);

const quickLinks = computed(() => {
  return isAdmin.value ? adminQuickLinks.value : studentQuickLinks.value;
});

const fetchData = () => {
  if (isAdmin.value) {
    Promise.all([
      getAllStudents(),
      getAllCourses(),
      getAllClasses(),
      getAllClassrooms()
    ])
      .then(([studentsRes, coursesRes, classesRes, classroomsRes]) => {
        if (studentsRes.success) {
          statsData.value[0].value = (studentsRes.data as any[]).length;
        }
        if (coursesRes.success) {
          statsData.value[2].value = (coursesRes.data as any[]).length;
        }
        if (classesRes.success) {
          statsData.value[1].value = (classesRes.data as any[]).length;
        }
        if (classroomsRes.success) {
          statsData.value[3].value = (classroomsRes.data as any[]).length;
        }
      })
      .catch(() => {});
  } else {
    statsData.value = [
      {
        title: "我的班级",
        value: userStore.className || "未分配",
        icon: Reading,
        color: "#67C23A",
        bgColor: "#f0f9eb",
        visible: true
      },
      {
        title: "我的专业",
        value: userStore.major || "未分配",
        icon: Document,
        color: "#E6A23C",
        bgColor: "#fdf6ec",
        visible: true
      }
    ];
  }
};

const handleQuickLink = (path: string) => {
  router.push(path);
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h2 class="page-title">
        {{ isAdmin ? "校园管理系统仪表盘" : "学生个人中心" }}
      </h2>
      <p class="page-subtitle">
        {{
          isAdmin
            ? "欢迎使用校园管理系统，以下是系统数据概览"
            : `欢迎回来，${userStore.username}`
        }}
      </p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col
        v-for="item in statsData"
        :key="item.title"
        :xs="24"
        :sm="12"
        :md="isAdmin ? 6 : 12"
      >
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" :style="{ backgroundColor: item.bgColor }">
              <el-icon :size="28" :style="{ color: item.color }">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ item.value }}</div>
              <div class="stats-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="quick-links-section">
      <div class="section-header">
        <h3 class="section-title">功能快速入口</h3>
        <p class="section-subtitle">点击卡片快速访问相关功能</p>
      </div>

      <el-row :gutter="20">
        <el-col
          v-for="link in quickLinks"
          :key="link.title"
          :xs="24"
          :sm="12"
          :md="isAdmin ? 6 : 8"
        >
          <el-card
            shadow="hover"
            class="quick-link-card"
            @click="handleQuickLink(link.path)"
          >
            <div class="quick-link-content">
              <div
                class="quick-link-icon"
                :style="{ backgroundColor: link.color + '20' }"
              >
                <el-icon :size="32" :style="{ color: link.color }">
                  <component :is="link.icon" />
                </el-icon>
              </div>
              <div class="quick-link-info">
                <div class="quick-link-title">{{ link.title }}</div>
                <div class="quick-link-description">{{ link.description }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: calc(100vh - 100px);
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.stats-row {
  margin-bottom: 30px;
}

.stats-card {
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-right: 16px;
  border-radius: 8px;
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  color: #303133;
}

.stats-title {
  margin-top: 4px;
  font-size: 14px;
  color: #909399;
}

.quick-links-section {
  margin-top: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.section-subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.quick-link-card {
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
}

.quick-link-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  transform: translateY(-4px);
}

.quick-link-content {
  display: flex;
  align-items: center;
  padding: 20px 10px;
}

.quick-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-right: 16px;
  border-radius: 12px;
}

.quick-link-info {
  flex: 1;
}

.quick-link-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.quick-link-description {
  font-size: 13px;
  line-height: 1.4;
  color: #909399;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>
