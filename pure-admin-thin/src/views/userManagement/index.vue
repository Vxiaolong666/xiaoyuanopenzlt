<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import { getAllUsers, addUser, editUser, deleteUser } from "@/api/user";
import { fetchCommonData } from "@/api/composed";
import { PureTableBar } from "@/components/RePureTableBar";
import { usePagination } from "@/hooks";
import type { FormInstance } from "element-plus";
import { ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import Plus from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";

defineOptions({
  name: "UserManagement"
});

interface UserItem {
  id: number;
  username: string;
  time: string;
  role: "admin" | "common" | "students";
  studentId?: string;
  className?: string;
}

const loading = ref(false);
const dataList = ref<UserItem[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref("添加用户");
const isEdit = ref(false);
const formRef = ref<FormInstance>();

const searchForm = reactive({
  username: "",
  role: ""
});

const form = reactive({
  id: null as number | null,
  username: "",
  password: "",
  role: "students" as string,
  studentId: "",
  className: ""
});

const rules = computed(() => ({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 16, message: "用户名长度在 3 到 16 个字符", trigger: "blur" }
  ],
  password: isEdit.value
    ? [{ min: 6, message: "密码长度不能少于 6 位", trigger: "blur" }]
    : [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码长度不能少于 6 位", trigger: "blur" }
      ],
  studentId: [
    {
      required: form.role === "students",
      message: "请输入学号",
      trigger: "blur"
    }
  ],
  className: [
    {
      required: form.role === "students",
      message: "请选择班级",
      trigger: "change"
    }
  ]
}));

const columns: TableColumnList = [
  {
    label: "用户ID",
    prop: "id",
    width: 80
  },
  {
    label: "用户名",
    prop: "username"
  },
  {
    label: "学号",
    prop: "studentId",
    width: 120,
    slot: "studentId"
  },
  {
    label: "班级",
    prop: "className",
    width: 120,
    slot: "className"
  },
  {
    label: "角色",
    prop: "role",
    width: 100,
    slot: "role"
  },
  {
    label: "账号状态",
    prop: "status",
    width: 100,
    slot: "status"
  },
  {
    label: "注册时间",
    prop: "time",
    width: 180,
    slot: "time"
  },
  {
    label: "操作",
    width: 180,
    slot: "operation"
  }
];

const roleOptions = [
  { value: "", label: "全部" },
  { value: "admin", label: "管理员" },
  { value: "students", label: "学生" }
];

const classOptions = [
  "计算机2301班",
  "计算机2302班",
  "计算机2303班",
  "软件2301班",
  "软件2302班",
  "网络2301班",
  "网络2302班"
];

const { pagination, handleSizeChange, handleCurrentChange } = usePagination();

const filteredData = computed(() => {
  let result = dataList.value;
  if (searchForm.username) {
    result = result.filter(item =>
      item.username.toLowerCase().includes(searchForm.username.toLowerCase())
    );
  }
  if (searchForm.role) {
    result = result.filter(item => item.role === searchForm.role);
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

const fetchData = () => {
  loading.value = true;
  getAllUsers()
    .then(res => {
      if (res.success) {
        dataList.value = res.data as UserItem[];
        pagination.total = (res.data as UserItem[]).length;
      } else {
        message("获取数据失败", { type: "error" });
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加用户";
  form.id = null;
  form.username = "";
  form.password = "";
  form.role = "students";
  form.studentId = "";
  form.className = "";
  dialogVisible.value = true;
};

const handleEdit = (row: UserItem) => {
  isEdit.value = true;
  dialogTitle.value = "编辑用户";
  form.id = row.id;
  form.username = row.username;
  form.password = "";
  form.role = row.role || "students";
  form.studentId = row.studentId || "";
  form.className = row.className || "";
  dialogVisible.value = true;
};

const handleDelete = (row: UserItem) => {
  if (row.username === "admin") {
    message("不能删除管理员账号", { type: "warning" });
    return;
  }
  ElMessageBox.confirm(`确定要删除用户"${row.username}"吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteUser({ id: row.id }).then(res => {
      if (res.success) {
        message("删除成功", { type: "success" });
        fetchData();
      } else {
        message("删除失败", { type: "error" });
      }
    });
  });
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      if (isEdit.value) {
        const data: any = {
          id: form.id,
          username: form.username,
          role: form.role,
          studentId: form.role === "students" ? form.studentId : null,
          className: form.role === "students" ? form.className : null
        };
        if (form.password) {
          data.password = form.password;
        }
        editUser(data).then(res => {
          if (res.success) {
            message("更新成功", { type: "success" });
            dialogVisible.value = false;
            fetchData();
          } else {
            message("更新失败", { type: "error" });
          }
        });
      } else {
        addUser({
          username: form.username,
          password: form.password,
          role: form.role,
          studentId: form.role === "students" ? form.studentId : null,
          className: form.role === "students" ? form.className : null
        }).then(res => {
          if (res.success) {
            message("添加成功", { type: "success" });
            dialogVisible.value = false;
            fetchData();
          } else {
            message("添加失败", { type: "error" });
          }
        });
      }
    }
  });
};

const resetSearch = () => {
  searchForm.username = "";
  searchForm.role = "";
  pagination.currentPage = 1;
};

const handleSearch = () => {
  pagination.currentPage = 1;
  pagination.total = filteredData.value.length;
};

const onRefresh = () => {
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            style="width: 200px"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role"
            placeholder="请选择"
            style="width: 200px"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
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

    <PureTableBar title="用户管理" :columns="columns" @refresh="onRefresh">
      <template #buttons>
        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增用户
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
          <template #studentId="{ row }">
            <span>{{ row.role === "admin" ? "-" : row.studentId || "-" }}</span>
          </template>
          <template #className="{ row }">
            <span>{{ row.role === "admin" ? "-" : row.className || "-" }}</span>
          </template>
          <template #role="{ row }">
            <el-tag
              :type="row.role === 'admin' ? 'danger' : 'info'"
              size="small"
            >
              {{ row.role === "admin" ? "管理员" : "学生" }}
            </el-tag>
          </template>
          <template #status>
            <el-tag type="success" size="small">正常</el-tag>
          </template>
          <template #time="{ row }">
            <span>{{ formatTime(row.time) }}</span>
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
              :disabled="row.username === 'admin'"
              @click="handleDelete(row)"
            >
              <el-icon class="mr-1"><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </pure-table>
        <div class="flex justify-center mt-4">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredData.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </template>
    </PureTableBar>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item :label="isEdit ? '新密码' : '密码'" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'"
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select
            v-model="form.role"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="学生" value="students" />
          </el-select>
        </el-form-item>
        <template v-if="form.role === 'students'">
          <el-form-item label="学号" prop="studentId">
            <el-input v-model="form.studentId" placeholder="请输入学号" />
          </el-form-item>
          <el-form-item label="班级" prop="className">
            <el-select
              v-model="form.className"
              placeholder="请选择班级"
              style="width: 100%"
            >
              <el-option
                v-for="item in classOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </template>
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

:deep(.el-button--link.el-button--danger.is-disabled) {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
