<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import { addCourse, editCourse, deleteCourse } from "@/api/user";
import { fetchCommonData } from "@/api/composed";
import { PureTableBar } from "@/components/RePureTableBar";
import { usePagination } from "@/hooks";
import type { Course } from "@/types/common";
import type { FormInstance } from "element-plus";
import { ElMessageBox } from "element-plus";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import Plus from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";

defineOptions({
  name: "CourseManagement"
});

const loading = ref(false);
const dataList = ref<Course[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("添加课程");
const isEdit = ref(false);
const formRef = ref<FormInstance>();

const searchForm = reactive({
  name: "",
  teacher: ""
});

const form = reactive({
  id: null as number | null,
  name: "",
  teacher: "",
  credit: 3,
  hours: 48,
  classroom: "",
  description: ""
});

const rules = {
  name: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  teacher: [{ required: true, message: "请输入授课教师", trigger: "blur" }],
  credit: [{ required: true, message: "请输入学分", trigger: "blur" }],
  hours: [{ required: true, message: "请输入课时", trigger: "blur" }],
  classroom: [{ required: true, message: "请选择教室", trigger: "change" }]
};

const columns: TableColumnList = [
  {
    label: "课程ID",
    prop: "id",
    width: 80
  },
  {
    label: "课程名称",
    prop: "name"
  },
  {
    label: "授课教师",
    prop: "teacher",
    width: 120
  },
  {
    label: "学分",
    prop: "credit",
    width: 80
  },
  {
    label: "课时",
    prop: "hours",
    width: 80
  },
  {
    label: "教室",
    prop: "classroom",
    width: 180,
    slot: "classroom"
  },
  {
    label: "课程描述",
    prop: "description",
    showOverflowTooltip: true
  },
  {
    label: "创建时间",
    prop: "createTime",
    width: 180
  },
  {
    label: "操作",
    width: 180,
    slot: "operation"
  }
];

const classroomOptions = [
  "A101 - 教学楼A",
  "A201 - 教学楼A",
  "B101 - 教学楼B",
  "B202 - 教学楼B",
  "C301 - 实验楼C",
  "D401 - 综合楼D"
];

const filteredData = computed(() => {
  let result = dataList.value;
  if (searchForm.name) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchForm.name.toLowerCase())
    );
  }
  if (searchForm.teacher) {
    result = result.filter(item =>
      item.teacher.toLowerCase().includes(searchForm.teacher.toLowerCase())
    );
  }
  return result;
});

const fetchData = () => {
  loading.value = true;
  fetchCommonData
    .courses()
    .then(res => {
      if (res.success) {
        dataList.value = res.data as Course[];
      }
    })
    .catch(() => {
      message("获取课程数据失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加课程";
  form.id = null;
  form.name = "";
  form.teacher = "";
  form.credit = 3;
  form.hours = 48;
  form.classroom = "";
  form.description = "";
  dialogVisible.value = true;
};

const handleEdit = (row: Course) => {
  isEdit.value = true;
  dialogTitle.value = "编辑课程";
  form.id = row.id;
  form.name = row.name;
  form.teacher = row.teacher;
  form.credit = row.credit;
  form.hours = row.hours;
  form.classroom = row.classroom;
  form.description = row.description;
  dialogVisible.value = true;
};

const handleDelete = (row: Course) => {
  ElMessageBox.confirm(`确定要删除课程"${row.name}"吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteCourse({ id: row.id }).then(res => {
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
        editCourse({
          id: form.id,
          name: form.name,
          teacher: form.teacher,
          credit: form.credit,
          hours: form.hours,
          classroom: form.classroom,
          description: form.description
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
        addCourse({
          name: form.name,
          teacher: form.teacher,
          credit: form.credit,
          hours: form.hours,
          classroom: form.classroom,
          description: form.description
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

const resetSearch = () => {
  searchForm.name = "";
  searchForm.teacher = "";
};

const onRefresh = () => {
  fetchData();
  message("刷新成功", { type: "success" });
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" class="search-form">
        <el-form-item label="课程名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入课程名称"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input
            v-model="searchForm.teacher"
            placeholder="请输入教师姓名"
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

    <PureTableBar title="课程管理" :columns="columns" @refresh="onRefresh">
      <template #buttons>
        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增课程
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
          <template #classroom="{ row }">
            <el-tag type="info" size="small">{{ row.classroom }}</el-tag>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacher">
          <el-input v-model="form.teacher" placeholder="请输入授课教师" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学分" prop="credit">
              <el-input-number
                v-model="form.credit"
                :min="1"
                :max="10"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课时" prop="hours">
              <el-input-number
                v-model="form.hours"
                :min="8"
                :max="200"
                :step="8"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="教室" prop="classroom">
          <el-select
            v-model="form.classroom"
            placeholder="请选择教室"
            style="width: 100%"
          >
            <el-option
              v-for="item in classroomOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入课程描述"
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

<style lang="scss" scoped>
@import "@/style/table-common.scss";
</style>
