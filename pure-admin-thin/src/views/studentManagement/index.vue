<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { message } from "@/utils/message";
import {
  addStudent,
  editStudent,
  deleteStudent
} from "@/api/user";
import { fetchCommonData } from "@/api/composed";
import { PureTableBar } from "@/components/RePureTableBar";
import { usePagination } from "@/hooks";
import type { Student } from "@/types/common";
import type { FormInstance } from "element-plus";
import { ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import Plus from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import View from "~icons/ep/view";
import Lock from "~icons/ep/lock";

defineOptions({
  name: "StudentManagement"
});

const loading = ref(false);
const dataList = ref<Student[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("添加学生");
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const showPassword = ref(false);

const searchForm = reactive({
  studentNo: "",
  name: "",
  className: ""
});

const form = reactive({
  id: null as number | null,
  studentNo: "",
  name: "",
  gender: "男",
  classId: null as number | null,
  className: "",
  major: "",
  phone: "",
  email: "",
  password: "123456"
});

const rules = computed(() => ({
  studentNo: [
    { required: true, message: "请输入学号", trigger: "blur" },
    {
      pattern: /^[0-9]{7,10}$/,
      message: "学号格式为7-10位数字",
      trigger: "blur"
    }
  ],
  name: [
    { required: true, message: "请输入学生姓名", trigger: "blur" },
    { min: 2, max: 20, message: "姓名长度在 2 到 20 个字符", trigger: "blur" }
  ],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  className: [{ required: true, message: "请选择班级", trigger: "change" }],
  major: [{ required: true, message: "请输入专业", trigger: "blur" }],
  password: isEdit.value
    ? [{ min: 6, message: "密码长度不能少于 6 位", trigger: "blur" }]
    : [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码长度不能少于 6 位", trigger: "blur" }
      ]
}));

const columns: TableColumnList = [
  {
    label: "学生ID",
    prop: "id",
    width: 80
  },
  {
    label: "学号",
    prop: "studentNo",
    width: 120
  },
  {
    label: "姓名",
    prop: "name",
    width: 100
  },
  {
    label: "性别",
    prop: "gender",
    width: 80
  },
  {
    label: "班级",
    prop: "className",
    minWidth: 150
  },
  {
    label: "专业",
    prop: "major",
    minWidth: 150
  },
  {
    label: "联系电话",
    prop: "phone",
    width: 130
  },
  {
    label: "邮箱",
    prop: "email",
    minWidth: 180
  },
  {
    label: "密码",
    prop: "password",
    width: 100,
    slot: "password"
  },
  {
    label: "创建时间",
    prop: "createTime",
    width: 180,
    slot: "createTime"
  },
  {
    label: "操作",
    width: 240,
    fixed: "right",
    slot: "operation"
  }
];

const classOptions = ref([
  { id: 1, name: "计算机科学2021级1班", major: "计算机科学与技术" },
  { id: 2, name: "计算机科学2021级2班", major: "计算机科学与技术" },
  { id: 3, name: "软件工程2021级1班", major: "软件工程" },
  { id: 4, name: "数据科学2021级1班", major: "数据科学与大数据技术" }
]);

const { pagination, handleSizeChange, handleCurrentChange } = usePagination();

const filteredData = computed(() => {
  let result = dataList.value;
  if (searchForm.studentNo) {
    result = result.filter(item =>
      item.studentNo.includes(searchForm.studentNo)
    );
  }
  if (searchForm.name) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchForm.name.toLowerCase())
    );
  }
  if (searchForm.className) {
    result = result.filter(item => item.className === searchForm.className);
  }
  return result;
});

const paginationData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredData.value.slice(start, end);
});

const formatTime = (time: string) => {
  if (!time) return "-";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

const maskPassword = (password: string) => {
  return "******";
};

const fetchData = () => {
  loading.value = true;

  fetchCommonData.studentsAndClasses()
    .then(([studentsRes, classesRes]) => {
      if (studentsRes.success) {
        dataList.value = studentsRes.data as StudentItem[];
        pagination.total = dataList.value.length;
      } else {
        message((studentsRes.data as any).message || "获取数据失败", {
          type: "error"
        });
      }
      if (classesRes.success) {
        classOptions.value = (classesRes.data as any[]).map(item => ({
          id: item.id,
          name: item.name,
          major: item.major
        }));
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加学生";
  form.id = null;
  form.studentNo = "";
  form.name = "";
  form.gender = "男";
  form.classId = null;
  form.className = "";
  form.major = "";
  form.phone = "";
  form.email = "";
  form.password = "123456";
  dialogVisible.value = true;
};

const handleEdit = (row: StudentItem) => {
  isEdit.value = true;
  dialogTitle.value = "编辑学生";
  form.id = row.id;
  form.studentNo = row.studentNo;
  form.name = row.name;
  form.gender = row.gender;
  form.classId = row.classId;
  form.className = row.className;
  form.major = row.major;
  form.phone = row.phone;
  form.email = row.email;
  form.password = "";
  dialogVisible.value = true;
};

const handleDelete = (row: StudentItem) => {
  ElMessageBox.confirm(`确定要删除学生"${row.name}"吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteStudent({ id: row.id }).then(res => {
      if (res.success) {
        message("删除成功", { type: "success" });
        fetchData();
      } else {
        message((res.data as any).message || "删除失败", { type: "error" });
      }
    });
  });
};

const handleClassChange = (className: string) => {
  const selectedClass = classOptions.value.find(
    item => item.name === className
  );
  if (selectedClass) {
    form.classId = selectedClass.id;
    form.major = selectedClass.major;
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      if (isEdit.value) {
        editStudent({
          id: form.id,
          studentNo: form.studentNo,
          name: form.name,
          gender: form.gender,
          classId: form.classId,
          className: form.className,
          major: form.major,
          phone: form.phone,
          email: form.email,
          password: form.password
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
        addStudent({
          studentNo: form.studentNo,
          name: form.name,
          gender: form.gender,
          classId: form.classId,
          className: form.className,
          major: form.major,
          phone: form.phone,
          email: form.email,
          password: form.password
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
  searchForm.studentNo = "";
  searchForm.name = "";
  searchForm.className = "";
  pagination.currentPage = 1;
};

const handleSearch = () => {
  pagination.currentPage = 1;
  pagination.total = filteredData.value.length;
};

const onRefresh = () => {
  fetchData();
};

const resetPassword = (row: StudentItem) => {
  ElMessageBox.confirm(
    `确定要重置学生"${row.name}"的密码为"123456"吗？`,
    "重置密码确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    editStudent({
      id: row.id,
      studentNo: row.studentNo,
      name: row.name,
      gender: row.gender,
      classId: row.classId,
      className: row.className,
      major: row.major,
      phone: row.phone,
      email: row.email,
      password: "123456"
    }).then(res => {
      if (res.success) {
        message("密码已重置为123456", { type: "success" });
        fetchData();
      } else {
        message((res.data as any).message || "重置密码失败", { type: "error" });
      }
    });
  });
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="学号">
          <el-input
            v-model="searchForm.studentNo"
            placeholder="请输入学号"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入姓名"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="班级">
          <el-select
            v-model="searchForm.className"
            placeholder="请选择班级"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
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

    <PureTableBar title="学生管理" :columns="columns" @refresh="onRefresh">
      <template #buttons>
        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          添加学生
        </el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <pure-table
          :loading="loading"
          :data="paginationData"
          :columns="dynamicColumns"
          :size="size"
          row-key="id"
          show-overflow-tooltip
        >
          <template #password="{ row }">
            <div class="flex items-center">
              <span>{{ maskPassword(row.password) }}</span>
            </div>
          </template>
          <template #createTime="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
          <template #operation="{ row }">
            <el-button
              type="primary"
              :size="size"
              link
              @click="handleEdit(row)"
            >
              <el-icon class="mr-1"><EditPen /></el-icon>
              编辑
            </el-button>
            <el-button
              type="warning"
              :size="size"
              link
              @click="resetPassword(row)"
            >
              <el-icon class="mr-1"><Lock /></el-icon>
              重置密码
            </el-button>
            <el-button
              type="danger"
              :size="size"
              link
              @click="handleDelete(row)"
            >
              <el-icon class="mr-1"><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </pure-table>

        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          class="mt-4"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </PureTableBar>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学号" prop="studentNo">
          <el-input
            v-model="form.studentNo"
            placeholder="请输入学号"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-select
            v-model="form.className"
            placeholder="请选择班级"
            style="width: 100%"
            @change="handleClassChange"
          >
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="form.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
          <span v-if="isEdit" class="text-gray-500 text-xs"
            >留空则不修改密码</span
          >
          <span v-else class="text-gray-500 text-xs">默认密码为123456</span>
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

.text-xs {
  font-size: 12px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}
</style>
