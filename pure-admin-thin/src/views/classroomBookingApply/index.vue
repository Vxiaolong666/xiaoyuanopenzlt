<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import { addBooking } from "@/api/user";
import { fetchCommonData } from "@/api/composed";
import { useUserStoreHook } from "@/store/modules/user";
import { PureTableBar } from "@/components/RePureTableBar";
import type { FormInstance } from "element-plus";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import Plus from "~icons/ep/plus";

defineOptions({
  name: "ClassroomBookingApply"
});

interface ClassroomItem {
  id: number;
  name: string;
  building: string;
  capacity: number;
  type: string;
  facilities: string[];
  status: string;
}

interface BookingApply {
  id: number;
  classroomId: number;
  classroomName: string;
  building: string;
  applicant: string;
  borrowerId: number;
  borrowerRole: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: string;
  createTime: string;
}

const loading = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const activeTab = ref("classroomList");

const searchForm = reactive({
  name: "",
  building: "",
  status: ""
});

const applyForm = reactive({
  classroomId: null as number | null,
  classroomName: "",
  classroomBuilding: "",
  applicant: "",
  purpose: "",
  startTime: "",
  endTime: ""
});

const applyRules = {
  classroomId: [{ required: true, message: "请选择教室", trigger: "change" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }],
  purpose: [{ required: true, message: "请输入借用用途", trigger: "blur" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "change" }]
};

const classroomColumns: TableColumnList = [
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
    label: "操作",
    width: 120,
    slot: "operation"
  }
];

const applyColumns: TableColumnList = [
  {
    label: "申请ID",
    prop: "id",
    width: 80
  },
  {
    label: "教室名称",
    prop: "classroomName",
    width: 120
  },
  {
    label: "申请人",
    prop: "applicant",
    width: 100
  },
  {
    label: "借用用途",
    prop: "purpose",
    showOverflowTooltip: true
  },
  {
    label: "开始时间",
    prop: "startTime",
    width: 160
  },
  {
    label: "结束时间",
    prop: "endTime",
    width: 160
  },
  {
    label: "状态",
    prop: "status",
    width: 100,
    slot: "status"
  },
  {
    label: "申请时间",
    prop: "createTime",
    width: 160
  }
];

const classroomList = ref<ClassroomItem[]>([]);
const applyList = ref<BookingApply[]>([]);

const buildingOptions = ["教学楼A", "教学楼B", "实验楼C", "综合楼D", "图书馆E"];
const statusOptions = [
  { value: "", label: "全部" },
  { value: "空闲", label: "空闲" },
  { value: "使用中", label: "使用中" }
];

const fetchData = () => {
  loading.value = true;

  fetchCommonData.classroomsAndBookings()
    .then(([classroomsRes, bookingsRes]) => {
      if (classroomsRes.success) {
        classroomList.value = (classroomsRes.data as any[]).map(item => ({
          id: item.id,
          name: item.name,
          building: item.building,
          capacity: item.capacity,
          type: item.type,
          facilities: JSON.parse(item.facilities || "[]"),
          status: item.status
        }));
      }
      if (bookingsRes.success) {
        applyList.value = (bookingsRes.data as any[]).map(item => ({
          id: item.id,
          classroomId: item.classroomId,
          classroomName: item.classroomName,
          building: item.building,
          applicant: item.borrower,
          borrowerId: item.borrowerId,
          borrowerRole: item.borrowerRole,
          purpose: item.purpose,
          startTime: item.startTime,
          endTime: item.endTime,
          status: item.status,
          createTime: item.createTime
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

const filteredClassrooms = computed(() => {
  let result = classroomList.value;
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

const myApplyList = computed(() => {
  const userStore = useUserStoreHook();
  const accountId = userStore.accountId;
  const roles = userStore.roles;
  if (!accountId || !roles || roles.length === 0) return [];
  const currentRole = roles[0];
  return applyList.value.filter(
    item => item.borrowerId === accountId && item.borrowerRole === currentRole
  );
});

const handleApply = (row: ClassroomItem) => {
  if (row.status === "使用中") {
    message("该教室正在使用中，无法申请借用", { type: "warning" });
    return;
  }
  const userStore = useUserStoreHook();
  applyForm.classroomId = row.id;
  applyForm.classroomName = row.name;
  applyForm.classroomBuilding = row.building;
  applyForm.applicant = userStore.username || "";
  applyForm.purpose = "";
  applyForm.startTime = "";
  applyForm.endTime = "";
  dialogVisible.value = true;
};

const submitApply = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      addBooking({
        classroomId: applyForm.classroomId,
        classroomName: applyForm.classroomName,
        building: applyForm.classroomBuilding,
        applicant: applyForm.applicant,
        purpose: applyForm.purpose,
        startTime: applyForm.startTime,
        endTime: applyForm.endTime
      }).then(res => {
        if (res.success) {
          message("申请已提交，请等待审批", { type: "success" });
          dialogVisible.value = false;
          activeTab.value = "myApply";
          fetchData();
        } else {
          message((res.data as any).message || "提交申请失败", {
            type: "error"
          });
        }
      });
    }
  });
};

const resetSearch = () => {
  searchForm.name = "";
  searchForm.building = "";
  searchForm.status = "";
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
    <el-tabs v-model="activeTab" type="border-card" class="booking-tabs">
      <el-tab-pane name="classroomList">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><Search /></el-icon>
            教室列表
          </span>
        </template>

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

        <PureTableBar
          title="教室列表"
          :columns="classroomColumns"
          @refresh="onRefresh"
        >
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="filteredClassrooms"
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
                  <el-tag
                    v-if="row.facilities.length > 3"
                    size="small"
                    type="info"
                  >
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
                  :disabled="row.status === '使用中'"
                  @click="handleApply(row)"
                >
                  <el-icon class="mr-1"><Plus /></el-icon>
                  申请借用
                </el-button>
              </template>
            </pure-table>
          </template>
        </PureTableBar>
      </el-tab-pane>

      <el-tab-pane name="myApply">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><Plus /></el-icon>
            我的申请
            <el-badge
              v-if="myApplyList.length > 0"
              :value="myApplyList.length"
              :max="99"
              class="tab-badge"
            />
          </span>
        </template>

        <PureTableBar
          title="我的申请"
          :columns="applyColumns"
          @refresh="onRefresh"
        >
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="myApplyList"
              :columns="dynamicColumns"
              :size="size"
              row-key="id"
              show-overflow-tooltip
            >
              <template #status="{ row }">
                <el-tag
                  :type="
                    row.status === '待审批'
                      ? 'warning'
                      : row.status === '已通过'
                        ? 'success'
                        : 'danger'
                  "
                  size="small"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </pure-table>
          </template>
        </PureTableBar>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogVisible" title="申请借用教室" width="500px">
      <el-form
        ref="formRef"
        :model="applyForm"
        :rules="applyRules"
        label-width="80px"
      >
        <el-form-item label="教室名称">
          <el-input v-model="applyForm.classroomName" disabled />
        </el-form-item>
        <el-form-item label="所在楼栋">
          <el-input v-model="applyForm.classroomBuilding" disabled />
        </el-form-item>
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="applyForm.applicant" disabled />
        </el-form-item>
        <el-form-item label="借用用途" prop="purpose">
          <el-input
            v-model="applyForm.purpose"
            type="textarea"
            :rows="2"
            placeholder="请输入借用用途"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="applyForm.startTime"
            type="datetime"
            placeholder="请选择开始时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="applyForm.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApply(formRef)"
          >提交申请</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
@import "@/style/table-common.scss";

.booking-tabs {
  min-height: calc(100vh - 200px);
}

.tab-label {
  display: flex;
  align-items: center;
}

.tab-badge {
  margin-left: 8px;
}

.facility-tags {
  display: flex;
  flex-wrap: wrap;
}

:deep(.el-tabs__content) {
  padding: 20px;
}
</style>
