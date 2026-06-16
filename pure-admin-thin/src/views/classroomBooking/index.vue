<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import {
  approveBooking,
  rejectBooking
} from "@/api/user";
import { fetchCommonData } from "@/api/composed";
import { PureTableBar } from "@/components/RePureTableBar";
import { ElMessageBox } from "element-plus";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import Check from "~icons/ep/check";
import Close from "~icons/ep/close";

defineOptions({
  name: "ClassroomBookingManage"
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

interface BookingRecord {
  id: number;
  classroomId: number;
  classroomName: string;
  building: string;
  applicant: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: string;
  createTime: string;
}

const loading = ref(false);

const searchForm = reactive({
  classroomName: "",
  applicant: "",
  status: ""
});

const classroomList = ref<ClassroomItem[]>([]);
const bookingList = ref<BookingRecord[]>([]);

const statusOptions = [
  { value: "", label: "全部" },
  { value: "待审批", label: "待审批" },
  { value: "进行中", label: "进行中" },
  { value: "已结束", label: "已结束" },
  { value: "已拒绝", label: "已拒绝" }
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
        bookingList.value = (bookingsRes.data as any[]).map(item => ({
          id: item.id,
          classroomId: item.classroomId,
          classroomName: item.classroomName,
          building: item.building,
          applicant: item.borrower,
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

const columns: TableColumnList = [
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
    label: "所在楼栋",
    prop: "building",
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
  },
  {
    label: "操作",
    width: 180,
    slot: "operation"
  }
];

const filteredData = computed(() => {
  let result = bookingList.value;
  if (searchForm.classroomName) {
    result = result.filter(item =>
      item.classroomName
        .toLowerCase()
        .includes(searchForm.classroomName.toLowerCase())
    );
  }
  if (searchForm.applicant) {
    result = result.filter(item =>
      item.applicant.toLowerCase().includes(searchForm.applicant.toLowerCase())
    );
  }
  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status);
  }
  return result;
});

const pendingList = computed(() => {
  return bookingList.value.filter(item => item.status === "待审批");
});

const activeList = computed(() => {
  return bookingList.value.filter(item => item.status === "进行中");
});

const handleApprove = (row: BookingRecord) => {
  ElMessageBox.confirm(
    `确定要通过"${row.applicant}"的借用申请吗？`,
    "审批确认",
    {
      confirmButtonText: "通过",
      cancelButtonText: "取消",
      type: "success"
    }
  ).then(() => {
    approveBooking({ id: row.id }).then(res => {
      if (res.success) {
        message("已通过申请，教室已分配", { type: "success" });
        fetchData();
      } else {
        message((res.data as any).message || "审批失败", { type: "error" });
      }
    });
  });
};

const handleReject = (row: BookingRecord) => {
  ElMessageBox.confirm(
    `确定要拒绝"${row.applicant}"的借用申请吗？`,
    "拒绝确认",
    {
      confirmButtonText: "拒绝",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    rejectBooking({ id: row.id }).then(res => {
      if (res.success) {
        message("已拒绝申请", { type: "success" });
        fetchData();
      } else {
        message((res.data as any).message || "拒绝失败", { type: "error" });
      }
    });
  });
};

const handleEndBooking = (row: BookingRecord) => {
  ElMessageBox.confirm(
    `确定要结束教室"${row.classroomName}"的借用吗？`,
    "结束借用确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    endBooking({ id: row.id }).then(res => {
      if (res.success) {
        message("已结束借用", { type: "success" });
        fetchData();
      } else {
        message((res.data as any).message || "结束借用失败", { type: "error" });
      }
    });
  });
};

const resetSearch = () => {
  searchForm.classroomName = "";
  searchForm.applicant = "";
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
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" class="search-form">
        <el-form-item label="教室名称">
          <el-input
            v-model="searchForm.classroomName"
            placeholder="请输入教室名称"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item label="申请人">
          <el-input
            v-model="searchForm.applicant"
            placeholder="请输入申请人"
            style="width: 200px"
            clearable
          />
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

    <el-row :gutter="20" class="mb-4">
      <el-col :span="8">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-info">
              <div class="stats-label">待审批申请</div>
              <div class="stats-value warning">{{ pendingList.length }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-info">
              <div class="stats-label">进行中借用</div>
              <div class="stats-value success">{{ activeList.length }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-info">
              <div class="stats-label">空闲教室</div>
              <div class="stats-value info">
                {{
                  classroomList.filter(item => item.status === "空闲").length
                }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <PureTableBar title="借用记录管理" :columns="columns" @refresh="onRefresh">
      <template #default="{ size, dynamicColumns }">
        <pure-table
          :loading="loading"
          :data="filteredData"
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
                  : row.status === '进行中'
                    ? 'success'
                    : row.status === '已拒绝'
                      ? 'danger'
                      : 'info'
              "
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
          <template #operation="{ row }">
            <template v-if="row.status === '待审批'">
              <el-button
                link
                type="success"
                :size="size"
                @click="handleApprove(row)"
              >
                <el-icon class="mr-1"><Check /></el-icon>
                通过
              </el-button>
              <el-button
                link
                type="danger"
                :size="size"
                @click="handleReject(row)"
              >
                <el-icon class="mr-1"><Close /></el-icon>
                拒绝
              </el-button>
            </template>
            <template v-else-if="row.status === '进行中'">
              <el-button
                link
                type="danger"
                :size="size"
                @click="handleEndBooking(row)"
              >
                <el-icon class="mr-1"><Close /></el-icon>
                结束借用
              </el-button>
            </template>
            <template v-else>
              <span class="text-gray">无操作</span>
            </template>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
@import "@/style/table-common.scss";

.stats-card {
  text-align: center;
}

.stats-content {
  padding: 10px 0;
}

.stats-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
}

.stats-value.warning {
  color: #e6a23c;
}

.stats-value.success {
  color: #67c23a;
}

.stats-value.info {
  color: #909399;
}

.text-gray {
  font-size: 12px;
  color: #999;
}
</style>
