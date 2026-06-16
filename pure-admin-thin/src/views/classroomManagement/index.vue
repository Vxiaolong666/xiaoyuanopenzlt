<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import {
  addClassroom,
  editClassroom,
  deleteClassroom
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

// 定义组件名称
defineOptions({
  name: "ClassroomManagement"
});

// 教室数据接口定义
interface ClassroomItem {
  id: number;
  name: string;
  building: string;
  capacity: number;
  type: string;
  facilities: string[];
  status: string;
  createTime: string;
}

// 响应式状态定义
const loading = ref(false);
const dialogVisible = ref(false); // 新增/编辑对话框显示状态
const dialogTitle = ref("添加教室");
const isEdit = ref(false); // 是否编辑模式
const formRef = ref<FormInstance>();

// 搜索表单数据
const searchForm = reactive({
  name: "",
  building: "",
  status: ""
});

// 表单数据（用于新增和编辑）
const form = reactive({
  id: null as number | null,
  name: "",
  building: "",
  capacity: 50,
  type: "普通教室",
  facilities: [] as string[]
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入教室名称", trigger: "blur" }],
  building: [{ required: true, message: "请输入所在楼栋", trigger: "blur" }],
  capacity: [{ required: true, message: "请输入容纳人数", trigger: "blur" }],
  type: [{ required: true, message: "请选择教室类型", trigger: "change" }]
};

// 表格列配置
const columns: TableColumnList = [
  {
    label: "教室ID",
    prop: "id",
    width: 80
  },
  {
    label: "教室名称",
    prop: "name"
  },
  {
    label: "所在楼栋",
    prop: "building",
    width: 120
  },
  {
    label: "容纳人数",
    prop: "capacity",
    width: 100
  },
  {
    label: "教室类型",
    prop: "type",
    width: 120,
    slot: "type"
  },
  {
    label: "设施设备",
    prop: "facilities",
    slot: "facilities"
  },
  {
    label: "状态",
    prop: "status",
    width: 100,
    slot: "status"
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

// 教室数据列表
const dataList = ref<ClassroomItem[]>([]);

// 选项配置
const typeOptions = ["普通教室", "多媒体教室", "阶梯教室", "实验室", "报告厅"];
const facilityOptions = [
  "投影仪",
  "空调",
  "电脑",
  "音响",
  "实验设备",
  "舞台",
  "白板",
  "黑板"
];
const buildingOptions = ["教学楼A", "教学楼B", "实验楼C", "综合楼D", "图书馆E"];
const statusOptions = [
  { value: "", label: "全部" },
  { value: "空闲", label: "空闲" },
  { value: "使用中", label: "使用中" }
];

// 获取教室数据
const fetchData = () => {
  loading.value = true;
  fetchCommonData.classrooms()
    .then(res => {
      if (res.success) {
        dataList.value = (res.data as any[]).map(item => ({
          id: item.id,
          name: item.name,
          building: item.building,
          capacity: item.capacity,
          type: item.type,
          facilities: JSON.parse(item.facilities || "[]"),
          status: item.status,
          createTime: item.createTime
        }));
      }
    })
    .catch(() => {
      message("获取教室数据失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

// 过滤后的数据（搜索过滤）
const filteredData = computed(() => {
  let result = dataList.value;
  if (searchForm.name) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchForm.name.toLowerCase())
    );
  }
  if (searchForm.building) {
    result = result.filter(item => item.building === searchForm.building);
  }
  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status);
  }
  return result;
});

// 打开新增教室对话框
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加教室";
  form.id = null;
  form.name = "";
  form.building = "";
  form.capacity = 50;
  form.type = "普通教室";
  form.facilities = [];
  dialogVisible.value = true;
};

// 打开编辑教室对话框
const handleEdit = (row: ClassroomItem) => {
  isEdit.value = true;
  dialogTitle.value = "编辑教室";
  form.id = row.id;
  form.name = row.name;
  form.building = row.building;
  form.capacity = row.capacity;
  form.type = row.type;
  form.facilities = [...row.facilities];
  dialogVisible.value = true;
};

// 删除教室
const handleDelete = (row: ClassroomItem) => {
  if (row.status === "使用中") {
    message("该教室正在使用中，不能删除", { type: "warning" });
    return;
  }
  ElMessageBox.confirm(`确定要删除教室"${row.name}"吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteClassroom({ id: row.id }).then(res => {
      if (res.success) {
        message("删除成功", { type: "success" });
        fetchData();
      } else {
        message((res.data as any).message || "删除失败", { type: "error" });
      }
    });
  });
};

// 提交表单（新增或编辑教室）
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      if (isEdit.value) {
        editClassroom({
          id: form.id,
          name: form.name,
          building: form.building,
          capacity: form.capacity,
          type: form.type,
          facilities: form.facilities,
          status: "空闲"
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
        addClassroom({
          name: form.name,
          building: form.building,
          capacity: form.capacity,
          type: form.type,
          facilities: form.facilities,
          status: "空闲"
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
  searchForm.name = "";
  searchForm.building = "";
  searchForm.status = "";
};

// 刷新数据
const onRefresh = () => {
  fetchData();
  message("刷新成功", { type: "success" });
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
      <el-form :inline="true" class="search-form">
        <el-form-item label="教室名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入教室名称"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item label="所在楼栋">
          <el-select
            v-model="searchForm.building"
            placeholder="请选择"
            style="width: 200px"
            clearable
          >
            <el-option
              v-for="item in buildingOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            style="width: 200px"
            clearable
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
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
    <PureTableBar title="教室管理" :columns="columns" @refresh="onRefresh">
      <!-- 操作按钮插槽 -->
      <template #buttons>
        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增教室
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
          <template #type="{ row }">
            <el-tag
              :type="
                row.type === '实验室'
                  ? 'warning'
                  : row.type === '报告厅'
                    ? 'danger'
                    : 'info'
              "
              size="small"
            >
              {{ row.type }}
            </el-tag>
          </template>
          <template #facilities="{ row }">
            <div class="facility-tags">
              <el-tag
                v-for="facility in row.facilities.slice(0, 3)"
                :key="facility"
                size="small"
                class="mr-1 mb-1"
              >
                {{ facility }}
              </el-tag>
              <el-tag v-if="row.facilities.length > 3" size="small" type="info">
                +{{ row.facilities.length - 3 }}
              </el-tag>
            </div>
          </template>
          <template #status="{ row }">
            <el-tag
              :type="row.status === '空闲' ? 'success' : 'warning'"
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

    <!-- 新增/编辑教室对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="教室名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入教室名称" />
        </el-form-item>
        <el-form-item label="所在楼栋" prop="building">
          <el-select
            v-model="form.building"
            placeholder="请选择楼栋"
            style="width: 100%"
          >
            <el-option
              v-for="item in buildingOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="容纳人数" prop="capacity">
              <el-input-number
                v-model="form.capacity"
                :min="10"
                :max="500"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教室类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="请选择类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="设施设备">
          <el-checkbox-group v-model="form.facilities">
            <el-checkbox
              v-for="item in facilityOptions"
              :key="item"
              :label="item"
            >
              {{ item }}
            </el-checkbox>
          </el-checkbox-group>
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

.facility-tags {
  display: flex;
  flex-wrap: wrap;
}
</style>
