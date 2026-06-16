<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import {
  addClass,
  editClass,
  deleteClass,
  bindCourses
} from "@/api/user";
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

defineOptions({
  name: "ClassManagement"
});

interface ClassItem {
  id: number;
  name: string;
  grade: string;
  major: string;
  courses: string[];
  createTime: string;
}

interface StudentItem {
  id: number;
  studentNo: string;
  name: string;
  classId: number;
  className: string;
}

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("添加班级");
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const courseDialogVisible = ref(false);
const currentClass = ref<ClassItem | null>(null);

const searchForm = reactive({
  name: "",
  grade: ""
});

const form = reactive({
  id: null as number | null,
  name: "",
  grade: "",
  major: ""
});

const selectedCourses = ref<string[]>([]);

const rules = {
  name: [{ required: true, message: "请输入班级名称", trigger: "blur" }],
  grade: [{ required: true, message: "请选择年级", trigger: "change" }],
  major: [{ required: true, message: "请输入专业", trigger: "blur" }]
};

const allCourses = ref([]);

const studentsList = ref<StudentItem[]>([]);

const dataList = ref<ClassItem[]>([]);

const getStudentCount = (classId: number) => {
  return studentsList.value.filter(student => student.classId === classId)
    .length;
};

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

const gradeOptions = ["2023级", "2024级", "2025级", "2026级"];

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

const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加班级";
  form.id = null;
  form.name = "";
  form.grade = "";
  form.major = "";
  dialogVisible.value = true;
};

const handleEdit = (row: ClassItem) => {
  isEdit.value = true;
  dialogTitle.value = "编辑班级";
  form.id = row.id;
  form.name = row.name;
  form.grade = row.grade;
  form.major = row.major;
  dialogVisible.value = true;
};

const handleBindCourses = (row: ClassItem) => {
  currentClass.value = row;
  selectedCourses.value = [...row.courses];
  courseDialogVisible.value = true;
};

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

const resetSearch = () => {
  searchForm.name = "";
  searchForm.grade = "";
};

const onRefresh = () => {
  fetchStudents();
  fetchData();
  message("刷新成功", { type: "success" });
};

fetchStudents();
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
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

    <PureTableBar title="班级管理" :columns="columns" @refresh="onRefresh">
      <template #buttons>
        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增班级
        </el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <pure-table
          :loading="loading"
          :data="filteredData"
          :columns="dynamicColumns"
          :size="size"
          row-key="id"
          show-overflow-tooltip
        >
          <template #studentCount="{ row }">
            <el-tag type="info" size="small">{{
              getStudentCount(row.id)
            }}</el-tag>
          </template>
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
