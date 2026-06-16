<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import { addClass, editClass, deleteClass, bindCourses } from "@/api/user";
import { fetchCommonData } from "@/api/composed";
import { PureTableBar } from "@/components/RePureTableBar";
import type { FormInstance } from "element-plus";
import { ElMessageBox } from "element-plus";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import Plus from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Link from "~icons/ep/link";

// 定义组件名称
defineOptions({
  name: "ClassManagement"
});

// 班级数据接口定义
interface ClassItem {
  id: number;
  name: string;
  grade: string;
  major: string;
  courses: string[];
  createTime: string;
}

// 学生数据接口定义
interface StudentItem {
  id: number;
  studentNo: string;
  name: string;
  classId: number;
  className: string;
}

// 响应式状态定义
const loading = ref(false); // 加载状态
const dialogVisible = ref(false); // 新增/编辑对话框显示状态
const dialogTitle = ref("添加班级"); // 对话框标题
const isEdit = ref(false); // 是否编辑模式
const formRef = ref<FormInstance>(); // 表单引用
const courseDialogVisible = ref(false); // 绑定课程对话框显示状态
const currentClass = ref<ClassItem | null>(null); // 当前选中的班级

// 搜索表单数据
const searchForm = reactive({
  name: "",
  grade: ""
});

// 表单数据（用于新增和编辑）
const form = reactive({
  id: null as number | null,
  name: "",
  grade: "",
  major: ""
});

// 选中的课程列表
const selectedCourses = ref<string[]>([]);

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入班级名称", trigger: "blur" }],
  grade: [{ required: true, message: "请选择年级", trigger: "change" }],
  major: [{ required: true, message: "请输入专业", trigger: "blur" }]
};

// 所有可选课程列表
const allCourses = ref([]);

// 学生列表（用于统计班级学生人数）
const studentsList = ref<StudentItem[]>([]);

// 班级数据列表
const dataList = ref<ClassItem[]>([]);

// 根据班级ID获取学生人数
const getStudentCount = (classId: number) => {
  return studentsList.value.filter(student => student.classId === classId)
    .length;
};

// 获取班级和课程数据
const fetchData = () => {
  loading.value = true;

  fetchCommonData.classesAndCourses()
    .then(([classesRes, coursesRes]) => {
      if (classesRes.success) {
        dataList.value = (classesRes.data as any[]).map(item => {
          let coursesList: string[] = [];
          if (item.courses) {
            if (Array.isArray(item.courses)) {
              coursesList = item.courses;
            } else if (typeof item.courses === "string") {
              try {
                coursesList = JSON.parse(item.courses);
              } catch (e) {
                if (item.courses.includes(",")) {
                  coursesList = item.courses.split(",").map(c => c.trim());
                } else {
                  coursesList = [item.courses];
                }
              }
            }
          }
          return {
            id: item.id,
            name: item.name,
            grade: item.grade,
            major: item.major,
            courses: coursesList,
            createTime: item.createTime
          };
        });
      }
      if (coursesRes.success) {
        allCourses.value = (coursesRes.data as any[]).map(item => ({
          id: item.id,
          name: item.name,
          teacher: item.teacher
        }));
      }
    })
    .catch(() => {
      message("获取数据失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

// 表格列配置
const columns: TableColumnList = [
  {
    type: "selection",
    width: 50,
    reserveSelection: true
  },
  {
    label: "班级ID",
    prop: "id",
    width: 80
  },
  {
    label: "班级名称",
    prop: "name"
  },
  {
    label: "年级",
    prop: "grade",
    width: 100
  },
  {
    label: "专业",
    prop: "major"
  },
  {
    label: "学生人数",
    prop: "studentCount",
    width: 100,
    slot: "studentCount"
  },
  {
    label: "绑定课程",
    prop: "courses",
    slot: "courses"
  },
  {
    label: "创建时间",
    prop: "createTime",
    width: 180
  },
  {
    label: "操作",
    width: 280,
    slot: "operation"
  }
];

// 年级选项
const gradeOptions = ["2023级", "2024级", "2025级", "2026级"];

// 过滤后的数据（搜索过滤）
const filteredData = computed(() => {
  let result = dataList.value;
  if (searchForm.name) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchForm.name.toLowerCase())
    );
  }
  if (searchForm.grade) {
    result = result.filter(item => item.grade === searchForm.grade);
  }
  return result;
});

// 获取学生列表数据
const fetchStudents = () => {
  fetchCommonData.students().then(res => {
    if (res.success) {
      studentsList.value = (res.data as any[]).map(item => ({
        id: item.id,
        studentNo: item.studentNo,
        name: item.name,
        classId: item.classId,
        className: item.className
      }));
    }
  });
};

// 打开新增班级对话框
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加班级";
  form.id = null;
  form.name = "";
  form.grade = "";
  form.major = "";
  dialogVisible.value = true;
};

// 打开编辑班级对话框
const handleEdit = (row: ClassItem) => {
  isEdit.value = true;
  dialogTitle.value = "编辑班级";
  form.id = row.id;
  form.name = row.name;
  form.grade = row.grade;
  form.major = row.major;
  dialogVisible.value = true;
};

// 打开绑定课程对话框
const handleBindCourses = (row: ClassItem) => {
  currentClass.value = row;
  selectedCourses.value = [...row.courses];
  courseDialogVisible.value = true;
};

// 删除班级
const handleDelete = (row: ClassItem) => {
  const studentCount = getStudentCount(row.id);
  if (studentCount > 0) {
    message("该班级还有学生，不能删除", { type: "warning" });
    return;
  }
  ElMessageBox.confirm(`确定要删除班级"${row.name}"吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteClass({ id: row.id }).then(res => {
      if (res.success) {
        message("删除成功", { type: "success" });
        fetchData();
      } else {
        message((res.data as any).message || "删除失败", { type: "error" });
      }
    });
  });
};

// 提交表单（新增或编辑班级）
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      if (isEdit.value) {
        editClass({
          id: form.id,
          name: form.name,
          grade: form.grade,
          major: form.major,
          courses: []
        }).then(res => {
          if (res.success) {
            message("更新成功", { type: "success" });
            dialogVisible.value = false;
            fetchData();
          } else {
            message((res.data as any).message || "更新失败", { type: "error" });
          }
        });
      } else {
        addClass({
          name: form.name,
          grade: form.grade,
          major: form.major,
          courses: []
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

// 保存课程绑定
const saveCourses = () => {
  if (currentClass.value) {
    bindCourses({
      classId: currentClass.value.id,
      courses: selectedCourses.value
    }).then(res => {
      if (res.success) {
        message("课程绑定成功", { type: "success" });
        courseDialogVisible.value = false;
        fetchData();
      } else {
        message((res.data as any).message || "绑定课程失败", { type: "error" });
      }
    });
  }
};

// 重置搜索条件
const resetSearch = () => {
  searchForm.name = "";
  searchForm.grade = "";
};

// 刷新数据
const onRefresh = () => {
  fetchStudents();
  fetchData();
  message("刷新成功", { type: "success" });
};

// 初始化数据
fetchStudents();
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" class="search-form">
        <el-form-item label="班级名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入班级名称"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item label="年级">
          <el-select
            v-model="searchForm.grade"
            placeholder="请选择"
            style="width: 200px"
            clearable
          >
            <el-option
              v-for="item in gradeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
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

    <!-- 表格区域 -->
    <PureTableBar title="班级管理" :columns="columns" @refresh="onRefresh">
      <!-- 操作按钮插槽 -->
      <template #buttons>
        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增班级
        </el-button>
      </template>

      <!-- 表格内容插槽 -->
      <template #default="{ size, dynamicColumns }">
        <pure-table
          :loading="loading"
          :data="filteredData"
          :columns="dynamicColumns"
          :size="size"
          row-key="id"
          show-overflow-tooltip
        >
          <!-- 学生人数列插槽 -->
          <template #studentCount="{ row }">
            <el-tag type="info" size="small">{{
              getStudentCount(row.id)
            }}</el-tag>
          </template>
          <!-- 绑定课程列插槽 -->
          <template #courses="{ row }">
            <div class="course-tags">
              <el-tag
                v-for="course in row.courses.slice(0, 2)"
                :key="course"
                size="small"
                class="mr-1 mb-1"
              >
                {{ course }}
              </el-tag>
              <el-tag v-if="row.courses.length > 2" size="small" type="info">
                +{{ row.courses.length - 2 }}
              </el-tag>
            </div>
          </template>
          <!-- 操作列插槽 -->
          <template #operation="{ row }">
            <el-button
              link
              type="primary"
              :size="size"
              @click="handleEdit(row)"
            >
              <el-icon class="mr-1"><EditPen /></el-icon>
              修改
            </el-button>
            <el-button
              link
              type="success"
              :size="size"
              @click="handleBindCourses(row)"
            >
              <el-icon class="mr-1"><Link /></el-icon>
              绑定课程
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

    <!-- 新增/编辑班级对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select
            v-model="form.grade"
            placeholder="请选择年级"
            style="width: 100%"
          >
            <el-option
              v-for="item in gradeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="form.major" placeholder="请输入专业" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(formRef)">确定</el-button>
      </template>
    </el-dialog>

    <!-- 绑定课程对话框 -->
    <el-dialog v-model="courseDialogVisible" title="绑定课程" width="600px">
      <div class="course-select">
        <el-checkbox-group v-model="selectedCourses">
          <div
            v-for="course in allCourses"
            :key="course.id"
            class="course-item"
          >
            <el-checkbox :label="course.name">
              <span class="course-name">{{ course.name }}</span>
              <span class="course-teacher">（{{ course.teacher }}）</span>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="courseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCourses">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<!-- 样式 -->
<style lang="scss" scoped>
@import "@/style/table-common.scss";

.course-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.course-select {
  max-height: 400px;
  overflow-y: auto;
}

.course-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.course-item:last-child {
  border-bottom: none;
}

.course-name {
  font-weight: 500;
}
</style>
