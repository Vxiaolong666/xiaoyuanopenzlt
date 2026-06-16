<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import { addGrade, editGrade, deleteGrade, publishGrade } from "@/api/user";
import { fetchCommonData } from "@/api/composed";
import { PureTableBar } from "@/components/RePureTableBar";
import type { FormInstance } from "element-plus";
import { ElMessageBox } from "element-plus";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import Plus from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Upload from "~icons/ep/upload";
import User from "~icons/ep/user";

// 定义组件名称
defineOptions({
  name: "GradeManagement"
});

// 学生数据接口定义
interface StudentItem {
  id: number;
  studentNo: string;
  name: string;
  gender: string;
  classId: number;
  className: string;
  major: string;
}

// 成绩数据接口定义
interface GradeItem {
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
  hours: number;
  classroom: string;
  semester: string;
  grade: number;
  gradePoint: number;
  examType: string;
  examTime: string;
  status: string;
  createTime?: string;
}

// 班级信息接口定义
interface ClassInfo {
  id: number;
  name: string;
  studentCount: number;
  major: string;
}

// 响应式状态定义
const loading = ref(false);
const dialogVisible = ref(false); // 新增/编辑对话框显示状态
const dialogTitle = ref("添加成绩");
const isEdit = ref(false); // 是否编辑模式
const formRef = ref<FormInstance>();
const activeTab = ref("byClass"); // 当前激活的标签页

// 筛选条件
const selectedClass = ref("");
const selectedCourse = ref("");
const selectedSemester = ref("");

// 搜索表单数据
const searchForm = reactive({
  studentName: "",
  studentNo: ""
});

// 表单数据（用于新增和编辑成绩）
const form = reactive({
  id: null as number | null,
  studentId: null as number | null,
  studentNo: "",
  studentName: "",
  classId: null as number | null,
  className: "",
  courseId: null as number | null,
  courseName: "",
  teacher: "",
  credit: 3,
  hours: 48,
  classroom: "",
  semester: "",
  grade: 0,
  gradePoint: 0,
  examType: "期末考试",
  examTime: "",
  status: "未发布"
});

// 表单验证规则
const rules = {
  studentName: [{ required: true, message: "请选择学生", trigger: "change" }],
  courseName: [{ required: true, message: "请选择课程", trigger: "change" }],
  semester: [{ required: true, message: "请选择学期", trigger: "change" }],
  grade: [
    { required: true, message: "请输入成绩", trigger: "blur" },
    {
      type: "number" as const,
      min: 0,
      max: 100,
      message: "成绩必须在0-100之间",
      trigger: "blur"
    }
  ],
  examType: [{ required: true, message: "请选择考试类型", trigger: "change" }]
};

// 数据列表
const classList = ref<ClassInfo[]>([]); // 班级列表
const studentList = ref<StudentItem[]>([]); // 学生列表
const gradeList = ref<GradeItem[]>([]); // 成绩列表

// 选项配置
const semesterOptions = [
  "2025-2026-1",
  "2025-2026-2",
  "2024-2025-1",
  "2024-2025-2"
];
const examTypeOptions = [
  "期末考试",
  "期中考试",
  "项目考核",
  "平时作业",
  "实验报告"
];
const courseOptions = ref<string[]>([]);
const courseList = ref<any[]>([]);

// 当前班级的学生列表
const classStudents = computed(() => {
  if (!selectedClass.value) return [];
  return studentList.value.filter(
    item => item.className === selectedClass.value
  );
});

// 当前筛选条件下的成绩列表
const classGrades = computed(() => {
  let result = gradeList.value;

  if (selectedClass.value) {
    result = result.filter(item => item.className === selectedClass.value);
  }

  if (selectedCourse.value) {
    result = result.filter(item => item.courseName === selectedCourse.value);
  }

  if (selectedSemester.value) {
    result = result.filter(item => item.semester === selectedSemester.value);
  }

  if (searchForm.studentName) {
    result = result.filter(item =>
      item.studentName
        .toLowerCase()
        .includes(searchForm.studentName.toLowerCase())
    );
  }

  if (searchForm.studentNo) {
    result = result.filter(item =>
      item.studentNo.toLowerCase().includes(searchForm.studentNo.toLowerCase())
    );
  }

  return result;
});

// 获取成绩、学生、班级、课程数据
const fetchData = () => {
  loading.value = true;

  fetchCommonData
    .gradesData()
    .then(([gradesRes, studentsRes, classesRes, coursesRes]) => {
      if (gradesRes.success) {
        gradeList.value = (gradesRes.data as any[]).map(item => ({
          id: item.id,
          studentId: item.studentId,
          studentNo: item.studentNo || "",
          studentName: item.studentName,
          classId: item.classId,
          className: item.className || "",
          courseId: item.courseId,
          courseName: item.courseName,
          teacher: item.teacher,
          credit: item.credit,
          hours: item.hours || 48,
          classroom: item.classroom || "",
          semester: item.semester,
          grade: item.grade,
          gradePoint: item.gradePoint,
          examType: item.examType,
          examTime: item.examTime,
          status: item.status || "未发布",
          createTime: item.createTime
        }));
      }
      if (studentsRes.success) {
        studentList.value = (studentsRes.data as any[]).map(item => ({
          id: item.id,
          studentNo: item.studentNo,
          name: item.name,
          gender: item.gender,
          classId: item.classId,
          className: item.className,
          major: item.major
        }));
      }
      if (classesRes.success) {
        classList.value = (classesRes.data as any[]).map(item => ({
          id: item.id,
          name: item.name,
          studentCount: item.studentCount || 0,
          major: item.major
        }));
      }
      if (coursesRes.success) {
        courseList.value = coursesRes.data as any[];
        courseOptions.value = (coursesRes.data as any[]).map(item => item.name);
      }
    })
    .catch(() => {
      message("获取数据失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

// 班级成绩统计数据
const classGradeStats = computed(() => {
  if (!selectedClass.value || !selectedCourse.value || !selectedSemester.value)
    return null;

  const grades = classGrades.value;
  if (grades.length === 0) return null;

  const avgGrade =
    grades.reduce((sum, item) => sum + Number(item.grade), 0) / grades.length;
  const avgGradePoint =
    grades.reduce((sum, item) => sum + Number(item.gradePoint), 0) /
    grades.length;
  const maxGrade = Math.max(...grades.map(item => Number(item.grade)));
  const minGrade = Math.min(...grades.map(item => Number(item.grade)));
  const passCount = grades.filter(item => Number(item.grade) >= 60).length;
  const passRate = ((passCount / grades.length) * 100).toFixed(1);

  return {
    avgGrade: avgGrade.toFixed(1),
    avgGradePoint: avgGradePoint.toFixed(2),
    maxGrade,
    minGrade,
    passRate,
    total: grades.length
  };
});

// 根据成绩计算绩点
const calculateGradePoint = (grade: number | string) => {
  const g = Number(grade);
  if (g >= 90) return 4.0 + (g - 90) / 10;
  if (g >= 80) return 3.0 + (g - 80) / 10;
  if (g >= 70) return 2.0 + (g - 70) / 10;
  if (g >= 60) return 1.0 + (g - 60) / 10;
  return 0;
};

// 打开新增成绩对话框
const handleAdd = () => {
  dialogTitle.value = "添加成绩";
  isEdit.value = false;
  form.id = null;
  form.studentId = null;
  form.studentNo = "";
  form.studentName = "";
  form.classId = null;
  form.className = selectedClass.value || "";
  form.courseId = null;
  form.courseName = "";
  form.teacher = "";
  form.credit = 3;
  form.hours = 48;
  form.classroom = "";
  form.semester = selectedSemester.value || "";
  form.grade = 0;
  form.gradePoint = 0;
  form.examType = "期末考试";
  form.examTime = "";
  form.status = "未发布";
  dialogVisible.value = true;
};

// 打开编辑成绩对话框
const handleEdit = (row: GradeItem) => {
  dialogTitle.value = "编辑成绩";
  isEdit.value = true;
  form.id = row.id;
  form.studentId = row.studentId;
  form.studentNo = row.studentNo;
  form.studentName = row.studentName;
  form.classId = row.classId;
  form.className = row.className;
  form.courseId = row.courseId;
  form.courseName = row.courseName;
  form.teacher = row.teacher;
  form.credit = row.credit;
  form.hours = row.hours || 48;
  form.classroom = row.classroom || "";
  form.semester = row.semester;
  form.grade = row.grade;
  form.gradePoint = row.gradePoint;
  form.examType = row.examType;
  form.examTime = row.examTime;
  form.status = row.status;
  dialogVisible.value = true;
};

// 删除成绩记录
const handleDelete = (row: GradeItem) => {
  ElMessageBox.confirm(
    `确认删除学生"${row.studentName}"的"${row.courseName}"成绩记录吗？`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    deleteGrade({ id: row.id }).then(res => {
      if (res.success) {
        message("删除成功", { type: "success" });
        fetchData();
      } else {
        message((res.data as any).message || "删除失败", { type: "error" });
      }
    });
  });
};

// 发布成绩
const handlePublish = (row: GradeItem) => {
  ElMessageBox.confirm(
    `确认发布学生"${row.studentName}"的"${row.courseName}"成绩吗？`,
    "发布确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info"
    }
  ).then(() => {
    publishGrade({ id: row.id }).then(res => {
      if (res.success) {
        message("成绩已发布", { type: "success" });
        fetchData();
      } else {
        message((res.data as any).message || "发布失败", { type: "error" });
      }
    });
  });
};

// 批量发布成绩
const handleBatchPublish = () => {
  const unpublished = classGrades.value.filter(
    item => item.status === "未发布"
  );
  if (unpublished.length === 0) {
    message("没有待发布的成绩", { type: "warning" });
    return;
  }

  ElMessageBox.confirm(
    `确认批量发布${unpublished.length}条成绩吗？`,
    "批量发布确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info"
    }
  ).then(() => {
    gradeList.value.forEach(item => {
      if (
        classGrades.value.some(g => g.id === item.id && g.status === "未发布")
      ) {
        item.status = "已发布";
      }
    });
    message(`已批量发布${unpublished.length}条成绩`, { type: "success" });
  });
};

// 选择学生时自动填充信息
const handleStudentSelect = (studentId: number) => {
  const student = studentList.value.find(item => item.id === studentId);
  if (student) {
    form.studentId = student.id;
    form.studentNo = student.studentNo;
    form.studentName = student.name;
    form.classId = student.classId;
    form.className = student.className;
  }
};

// 选择课程时自动填充信息
const handleCourseSelect = (courseId: number) => {
  const course = courseList.value.find(item => item.id === courseId);
  if (course) {
    form.courseId = course.id;
    form.courseName = course.name;
    form.teacher = course.teacher || "";
    form.credit = course.credit || 3;
    form.hours = course.hours || 48;
    form.classroom = course.classroom || "";
  }
};

// 提交表单（新增或编辑成绩）
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      form.gradePoint = calculateGradePoint(form.grade);

      if (isEdit.value) {
        editGrade({
          id: form.id,
          studentId: form.studentId,
          studentNo: form.studentNo,
          studentName: form.studentName,
          classId: form.classId,
          className: form.className,
          courseId: form.courseId,
          courseName: form.courseName,
          teacher: form.teacher,
          credit: form.credit,
          hours: form.hours,
          classroom: form.classroom,
          semester: form.semester,
          grade: form.grade,
          gradePoint: form.gradePoint,
          examType: form.examType,
          examTime: form.examTime,
          status: form.status
        }).then(res => {
          if (res.success) {
            message("编辑成功", { type: "success" });
            dialogVisible.value = false;
            fetchData();
          } else {
            message((res.data as any).message || "编辑失败", { type: "error" });
          }
        });
      } else {
        const existingGrade = gradeList.value.find(
          item =>
            item.studentId === form.studentId &&
            item.courseId === form.courseId &&
            item.semester === form.semester
        );
        if (existingGrade) {
          message("该学生在该课程的该学期已有成绩记录，请编辑现有记录", {
            type: "warning"
          });
          return;
        }
        addGrade({
          studentId: form.studentId,
          studentNo: form.studentNo,
          studentName: form.studentName,
          classId: form.classId,
          className: form.className,
          courseId: form.courseId,
          courseName: form.courseName,
          teacher: form.teacher,
          credit: form.credit,
          hours: form.hours,
          classroom: form.classroom,
          semester: form.semester,
          grade: form.grade,
          gradePoint: form.gradePoint,
          examType: form.examType,
          examTime: form.examTime
        }).then(res => {
          if (res.success) {
            message("添加成功", { type: "success" });
            dialogVisible.value = false;
            fetchData();
          } else {
            message((res.data as any).message || "添加失败", { type: "error" });
          }
        });
      }
    }
  });
};

// 重置搜索条件
const resetSearch = () => {
  searchForm.studentName = "";
  searchForm.studentNo = "";
};

// 刷新数据
const onRefresh = () => {
  message("刷新成功", { type: "success" });
};

// 根据成绩获取颜色
const getGradeColor = (grade: number) => {
  if (grade >= 90) return "#67C23A";
  if (grade >= 80) return "#409EFF";
  if (grade >= 70) return "#E6A23C";
  if (grade >= 60) return "#F56C6C";
  return "#909399";
};

const getGradePointColor = (gradePoint: number | string) => {
  const gp = Number(gradePoint);
  if (gp >= 4.0) return "#67C23A";
  if (gp >= 3.0) return "#409EFF";
  if (gp >= 2.0) return "#E6A23C";
  if (gp >= 1.0) return "#F56C6C";
  return "#909399";
};

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
    <!-- 标签页容器 -->
    <el-tabs v-model="activeTab" type="border-card" class="grade-tabs">
      <!-- 按班级查看标签页 -->
      <el-tab-pane name="byClass">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><User /></el-icon>
            按班级查看
          </span>
        </template>

        <!-- 筛选条件区域 -->
        <el-card shadow="never" class="mb-4">
              <el-select
                v-model="selectedClass"
                placeholder="请选择班级"
                style="width: 250px"
                clearable
              >
                <el-option
                  v-for="item in classList"
                  :key="item.id"
                  :label="`${item.name} (${item.studentCount}人)`"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="选择课程">
              <el-select
                v-model="selectedCourse"
                placeholder="请选择课程"
                style="width: 200px"
                clearable
              >
                <el-option
                  v-for="item in courseOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="选择学期">
              <el-select
                v-model="selectedSemester"
                placeholder="请选择学期"
                style="width: 200px"
                clearable
              >
                <el-option
                  v-for="item in semesterOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">
                <el-icon class="mr-1"><Search /></el-icon>
                查询
              </el-button>
              <el-button
                @click="
                  selectedClass = '';
                  selectedCourse = '';
                  selectedSemester = '';
                "
              >
                <el-icon class="mr-1"><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 成绩统计卡片 -->
        <el-row v-if="classGradeStats" :gutter="20" class="mb-4">
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-content">
                <div class="stats-info">
                  <div class="stats-label">平均成绩</div>
                  <div class="stats-value success">
                    {{ classGradeStats.avgGrade }}
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-content">
                <div class="stats-info">
                  <div class="stats-label">平均绩点</div>
                  <div class="stats-value primary">
                    {{ classGradeStats.avgGradePoint }}
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-content">
                <div class="stats-info">
                  <div class="stats-label">最高/最低分</div>
                  <div class="stats-value warning">
                    {{ classGradeStats.maxGrade }}/{{
                      classGradeStats.minGrade
                    }}
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-content">
                <div class="stats-info">
                  <div class="stats-label">通过率</div>
                  <div class="stats-value info">
                    {{ classGradeStats.passRate }}%
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 成绩列表表格 -->
        <PureTableBar
          :title="selectedClass ? `${selectedClass} - 成绩列表` : '成绩列表'"
          :columns="[
            { label: '学号', prop: 'studentNo', width: 120 },
            { label: '学生姓名', prop: 'studentName', width: 120 },
            { label: '班级', prop: 'className', width: 180 },
            { label: '课程名称', prop: 'courseName' },
            { label: '授课教师', prop: 'teacher', width: 120 },
            { label: '学分', prop: 'credit', width: 80 },
            { label: '学期', prop: 'semester', width: 120 },
            { label: '成绩', prop: 'grade', width: 100, slot: 'grade' },
            {
              label: '绩点',
              prop: 'gradePoint',
              width: 100,
              slot: 'gradePoint'
            },
            { label: '考试类型', prop: 'examType', width: 100 },
            { label: '考试时间', prop: 'examTime', width: 160 },
            { label: '发布状态', prop: 'status', width: 100, slot: 'status' },
            { label: '操作', width: 280, slot: 'operation' }
          ]"
          @refresh="onRefresh"
        >
          <template #buttons>
            <el-button type="primary" @click="handleAdd">
              <el-icon class="mr-1"><Plus /></el-icon>
              添加成绩
            </el-button>
            <el-button
              v-if="classGrades.length > 0"
              type="success"
              @click="handleBatchPublish"
            >
              <el-icon class="mr-1"><Upload /></el-icon>
              批量发布
            </el-button>
          </template>
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="classGrades"
              :columns="dynamicColumns"
              :size="size"
              row-key="id"
              show-overflow-tooltip
            >
              <template #grade="{ row }">
                <span
                  class="grade-text"
                  :style="{ color: getGradeColor(row.grade) }"
                >
                  {{ row.grade }}
                </span>
              </template>
              <template #gradePoint="{ row }">
                <span
                  class="grade-text"
                  :style="{ color: getGradePointColor(row.gradePoint) }"
                >
                  {{ Number(row.gradePoint).toFixed(1) }}
                </span>
              </template>
              <template #status="{ row }">
                <el-tag
                  :type="row.status === '已发布' ? 'success' : 'warning'"
                  size="small"
                >
                  {{ row.status }}
                </el-tag>
              </template>
              <template #operation="{ row }">
                <el-button
                  link
                  type="primary"
                  :size="size"
                  @click="handleEdit(row)"
                >
                  <el-icon class="mr-1"><EditPen /></el-icon>
                  编辑
                </el-button>
                <el-button
                  v-if="row.status === '未发布'"
                  link
                  type="success"
                  :size="size"
                  @click="handlePublish(row)"
                >
                  <el-icon class="mr-1"><Upload /></el-icon>
                  发布
                </el-button>
                <el-button
                  link
                  type="danger"
                  :size="size"
                  @click="handleDelete(row)"
                >
                  <el-icon class="mr-1"><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </pure-table>
          </template>
        </PureTableBar>
      </el-tab-pane>

      <!-- 全部成绩标签页 -->
      <el-tab-pane name="allGrades">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><Search /></el-icon>
            全部成绩
          </span>
        </template>

        <el-card shadow="never" class="mb-4">
          <el-form :inline="true" class="search-form">
            <el-form-item label="学生姓名">
              <el-input
                v-model="searchForm.studentName"
                placeholder="请输入学生姓名"
                style="width: 200px"
                clearable
              />
            </el-form-item>
            <el-form-item label="学号">
              <el-input
                v-model="searchForm.studentNo"
                placeholder="请输入学号"
                style="width: 200px"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">
                <el-icon class="mr-1"><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch">
                <el-icon class="mr-1"><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <PureTableBar
          title="全部成绩列表"
          :columns="[
            { label: '学号', prop: 'studentNo', width: 120 },
            { label: '学生姓名', prop: 'studentName', width: 120 },
            { label: '班级', prop: 'className', width: 180 },
            { label: '课程名称', prop: 'courseName' },
            { label: '授课教师', prop: 'teacher', width: 120 },
            { label: '学分', prop: 'credit', width: 80 },
            { label: '学期', prop: 'semester', width: 120 },
            { label: '成绩', prop: 'grade', width: 100, slot: 'grade' },
            {
              label: '绩点',
              prop: 'gradePoint',
              width: 100,
              slot: 'gradePoint'
            },
            { label: '考试类型', prop: 'examType', width: 100 },
            { label: '考试时间', prop: 'examTime', width: 160 },
            { label: '发布状态', prop: 'status', width: 100, slot: 'status' },
            { label: '操作', width: 280, slot: 'operation' }
          ]"
          @refresh="onRefresh"
        >
          <template #buttons>
            <el-button type="primary" @click="handleAdd">
              <el-icon class="mr-1"><Plus /></el-icon>
              添加成绩
            </el-button>
          </template>
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="classGrades"
              :columns="dynamicColumns"
              :size="size"
              row-key="id"
              show-overflow-tooltip
            >
              <template #grade="{ row }">
                <span
                  class="grade-text"
                  :style="{ color: getGradeColor(row.grade) }"
                >
                  {{ row.grade }}
                </span>
              </template>
              <template #gradePoint="{ row }">
                <span
                  class="grade-text"
                  :style="{ color: getGradePointColor(row.gradePoint) }"
                >
                  {{ Number(row.gradePoint).toFixed(1) }}
                </span>
              </template>
              <template #status="{ row }">
                <el-tag
                  :type="row.status === '已发布' ? 'success' : 'warning'"
                  size="small"
                >
                  {{ row.status }}
                </el-tag>
              </template>
              <template #operation="{ row }">
                <el-button
                  link
                  type="primary"
                  :size="size"
                  @click="handleEdit(row)"
                >
                  <el-icon class="mr-1"><EditPen /></el-icon>
                  编辑
                </el-button>
                <el-button
                  v-if="row.status === '未发布'"
                  link
                  type="success"
                  :size="size"
                  @click="handlePublish(row)"
                >
                  <el-icon class="mr-1"><Upload /></el-icon>
                  发布
                </el-button>
                <el-button
                  link
                  type="danger"
                  :size="size"
                  @click="handleDelete(row)"
                >
                  <el-icon class="mr-1"><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </pure-table>
          </template>
        </PureTableBar>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑成绩对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学生" prop="studentName">
          <el-select
            v-model="form.studentId"
            placeholder="请选择学生"
            style="width: 100%"
            filterable
            @change="handleStudentSelect"
          >
            <el-option
              v-for="item in selectedClass ? classStudents : studentList"
              :key="item.id"
              :label="`${item.studentNo} - ${item.name} (${item.className})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="form.className" disabled />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程" prop="courseName">
              <el-select
                v-model="form.courseId"
                placeholder="请选择课程"
                style="width: 100%"
                @change="handleCourseSelect"
              >
                <el-option
                  v-for="item in courseList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学期" prop="semester">
              <el-select
                v-model="form.semester"
                placeholder="请选择学期"
                style="width: 100%"
              >
                <el-option
                  v-for="item in semesterOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="考试类型" prop="examType">
              <el-select
                v-model="form.examType"
                placeholder="请选择考试类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in examTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成绩" prop="grade">
              <el-input-number
                v-model="form.grade"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="考试时间" prop="examTime">
          <el-date-picker
            v-model="form.examTime"
            type="date"
            placeholder="请选择考试时间"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(formRef)">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<!-- 样式 -->
<style lang="scss" scoped>
@import "@/style/table-common.scss";

.grade-tabs {
  min-height: calc(100vh - 200px);
}

.tab-label {
  display: flex;
  align-items: center;
}

.stats-card {
  height: 80px;
}

.stats-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.stats-info {
  text-align: center;
}

.stats-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
}

.stats-value.primary {
  color: #409eff;
}

.stats-value.success {
  color: #67c23a;
}

.stats-value.warning {
  color: #e6a23c;
}

.stats-value.info {
  color: #909399;
}

.grade-text {
  font-size: 16px;
  font-weight: bold;
}

:deep(.el-tabs__content) {
  padding: 20px;
}
</style>
