<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { message } from "@/utils/message";
import { addUser, editUser, deleteUser } from "@/api/user";
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

// 定义组件名称
defineOptions({
  name: "AdminManagement"
});

// 用户数据接口定义
interface UserItem {
  id: number;
  username: string;
  time: string;
  role: "admin" | "common";
  status?: string;
}

// 响应式状态定义
const loading = ref(false); // 加载状态
const dataList = ref<UserItem[]>([]); // 用户数据列表
const dialogVisible = ref(false); // 对话框显示状态
const dialogTitle = ref("添加管理员"); // 对话框标题
const isEdit = ref(false); // 是否编辑模式
const formRef = ref<FormInstance>(); // 表单引用

// 搜索表单数据
const searchForm = reactive({
  username: ""
});

// 表单数据（用于新增和编辑）
const form = reactive({
  id: null as number | null,
  username: "",
  password: "",
  role: "admin"
});

// 表单验证规则（根据编辑/新增模式动态调整）
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
      ]
}));

// 表格列配置
const columns: TableColumnList = [
  {
    label: "管理员ID",
    prop: "id",
    width: 100
  },
  {
    label: "用户名",
    prop: "username",
    minWidth: 150
  },
  {
    label: "用户属性",
    prop: "role",
    width: 120,
    slot: "role"
  },
  {
    label: "权限范围",
    prop: "permission",
    width: 100,
    slot: "permission"
  },
  {
    label: "账号状态",
    prop: "status",
    width: 120,
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
    fixed: "right",
    slot: "operation"
  }
];

// 分页配置
const { pagination, handleSizeChange, handleCurrentChange } = usePagination();

// 过滤后的数据（只显示管理员角色 + 搜索过滤）
const filteredData = computed(() => {
  let result = dataList.value.filter(item => item.role === "admin");
  if (searchForm.username) {
    result = result.filter(item =>
      item.username.toLowerCase().includes(searchForm.username.toLowerCase())
    );
  }
  return result;
});

// 当前页的分页数据
const paginationData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredData.value.slice(start, end);
});

// 时间格式化函数
const formatTime = (time: string) => {
  if (!time) return "-";
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 获取用户列表数据
const fetchData = () => {
  loading.value = true;
  fetchCommonData.users()
    .then(res => {
      if (res.success) {
        dataList.value = res.data;
        pagination.total = res.data.filter(
          (item: UserItem) => item.role === "admin"
        ).length;
      } else {
        message("获取数据失败", { type: "error" });
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

// 打开新增管理员对话框
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加管理员";
  form.id = null;
  form.username = "";
  form.password = "";
  form.role = "admin";
  dialogVisible.value = true;
};

// 打开编辑管理员对话框
const handleEdit = (row: UserItem) => {
  isEdit.value = true;
  dialogTitle.value = "编辑管理员";
  form.id = row.id;
  form.username = row.username;
  form.password = "";
  form.role = "admin";
  dialogVisible.value = true;
};

// 删除管理员
const handleDelete = (row: UserItem) => {
  if (row.username === "admin") {
    message("不能删除超级管理员账号", { type: "warning" });
    return;
  }
  ElMessageBox.confirm(`确定要删除管理员"${row.username}"吗？`, "删除确认", {
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

// 提交表单（新增或编辑）
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      if (isEdit.value) {
        // 编辑模式
        const data: any = {
          id: form.id,
          username: form.username,
          role: "admin"
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
        // 新增模式
        addUser({
          username: form.username,
          password: form.password,
          role: "admin"
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

// 重置搜索条件
const resetSearch = () => {
  searchForm.username = "";
  pagination.currentPage = 1;
};

// 执行搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  pagination.total = filteredData.value.length;
};

// 刷新数据
const onRefresh = () => {
  fetchData();
};

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
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

    <!-- 表格区域 -->
    <PureTableBar title="管理员管理" :columns="columns" @refresh="onRefresh">
      <!-- 操作按钮插槽 -->
      <template #buttons>
        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          添加管理员
        </el-button>
      </template>

      <!-- 表格内容插槽 -->
      <template #default="{ size, dynamicColumns }">
        <pure-table
          :loading="loading"
          :data="paginationData"
          :columns="dynamicColumns"
          :size="size"
          row-key="id"
          show-overflow-tooltip
        >
          <!-- 角色列插槽 -->
          <template #role="{ row }">
            <el-tag type="primary" size="small">
              系统管理员
            </el-tag>
          </template>
          <!-- 权限范围列插槽 -->
          <template #permission="{ row }">
            <el-tag type="warning" size="small">
              全部
            </el-tag>
          </template>
          <!-- 状态列插槽 -->
          <template #status="{ row }">
            <el-tag
              :type="row.status === 'disabled' ? 'danger' : 'success'"
              size="small"
            >
              {{ row.status === "disabled" ? "禁用" : "正常" }}
            </el-tag>
          </template>
          <!-- 时间列插槽 -->
          <template #time="{ row }">
            {{ formatTime(row.time) }}
          </template>
          <!-- 操作列插槽 -->
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
              type="danger"
              :size="size"
              link
              :disabled="row.username === 'admin'"
              @click="handleDelete(row)"
            >
              <el-icon class="mr-1"><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </pure-table>

        <!-- 分页组件 -->
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
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

.text-xs {
  font-size: 12px;
}
</style>
