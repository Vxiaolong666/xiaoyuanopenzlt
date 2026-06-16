<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import { fetchCommonData } from "@/api/composed";
import { PureTableBar } from "@/components/RePureTableBar";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import TrendCharts from "~icons/ep/trend-charts";

defineOptions({
  name: "GradeQuery"
});

interface GradeItem {
  id: number;
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
}

const loading = ref(false);
const activeTab = ref("allGrades");

const searchForm = reactive({
  courseName: "",
  semester: ""
});

const columns: TableColumnList = [
  {
    label: "课程名称",
    prop: "courseName"
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
    width: 180
  },
  {
    label: "学期",
    prop: "semester",
    width: 120
  },
  {
    label: "成绩",
    prop: "grade",
    width: 100,
    slot: "grade"
  },
  {
    label: "绩点",
    prop: "gradePoint",
    width: 100,
    slot: "gradePoint"
  },
  {
    label: "考试类型",
    prop: "examType",
    width: 100
  },
  {
    label: "考试时间",
    prop: "examTime",
    width: 160
  }
];

const gradeList = ref<GradeItem[]>([]);

const semesterOptions = [
  "2025-2026-1",
  "2025-2026-2",
  "2024-2025-1",
  "2024-2025-2"
];

const fetchData = () => {
  loading.value = true;

  fetchCommonData
    .grades()
    .then(res => {
      if (res.success) {
        gradeList.value = (res.data as any[]).map(item => ({
          id: item.id,
          courseName: item.courseName,
          teacher: item.teacher,
          credit: item.credit,
          hours: item.credit * 16,
          classroom: "教室待定",
          semester: item.semester,
          grade: item.grade,
          gradePoint: item.gradePoint,
          examType: item.examType,
          examTime: item.examTime
        }));
      }
    })
    .catch(() => {
      message("获取成绩数据失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

const filteredGrades = computed(() => {
  let result = gradeList.value;
  if (searchForm.courseName) {
    result = result.filter(item =>
      item.courseName
        .toLowerCase()
        .includes(searchForm.courseName.toLowerCase())
    );
  }
  if (searchForm.semester) {
    result = result.filter(item => item.semester === searchForm.semester);
  }
  return result;
});

const semesterGrades = computed(() => {
  const semesterMap = new Map<string, GradeItem[]>();
  gradeList.value.forEach(item => {
    if (!semesterMap.has(item.semester)) {
      semesterMap.set(item.semester, []);
    }
    semesterMap.get(item.semester)!.push(item);
  });

  const result: Array<{
    semester: string;
    totalCredits: number;
    avgGrade: number;
    avgGradePoint: number;
  }> = [];
  semesterMap.forEach((grades, semester) => {
    const totalCredits = grades.reduce((sum, item) => sum + item.credit, 0);
    const avgGrade =
      grades.length > 0
        ? grades.reduce((sum, item) => sum + item.grade, 0) / grades.length
        : 0;
    const avgGradePoint =
      totalCredits > 0
        ? grades.reduce((sum, item) => sum + item.gradePoint * item.credit, 0) /
          totalCredits
        : 0;
    result.push({ semester, totalCredits, avgGrade, avgGradePoint });
  });

  return result.sort((a, b) => b.semester.localeCompare(a.semester));
});

const totalCredits = computed(() => {
  return gradeList.value.reduce((sum, item) => sum + item.credit, 0);
});

const avgGrade = computed(() => {
  if (gradeList.value.length === 0) return 0;
  return (
    gradeList.value.reduce((sum, item) => sum + item.grade, 0) /
    gradeList.value.length
  );
});

const avgGradePoint = computed(() => {
  const totalCredit = gradeList.value.reduce(
    (sum, item) => sum + item.credit,
    0
  );
  if (totalCredit === 0) return 0;
  return (
    gradeList.value.reduce(
      (sum, item) => sum + item.gradePoint * item.credit,
      0
    ) / totalCredit
  );
});

const resetSearch = () => {
  searchForm.courseName = "";
  searchForm.semester = "";
};

const onRefresh = () => {
  message("刷新成功", { type: "success" });
};

const getGradeColor = (grade: number | string) => {
  const g = Number(grade);
  if (g >= 90) return "#67C23A";
  if (g >= 80) return "#409EFF";
  if (g >= 70) return "#E6A23C";
  if (g >= 60) return "#F56C6C";
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

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
    <el-tabs v-model="activeTab" type="border-card" class="grade-tabs">
      <el-tab-pane name="allGrades">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><Search /></el-icon>
            成绩查询
          </span>
        </template>

        <el-row :gutter="20" class="mb-4">
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-content">
                <div class="stats-info">
                  <div class="stats-label">总学分</div>
                  <div class="stats-value primary">
                    {{ gradeList.length > 0 ? totalCredits : "--" }}
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-content">
                <div class="stats-info">
                  <div class="stats-label">平均成绩</div>
                  <div class="stats-value success">
                    {{
                      gradeList.length > 0 ? Number(avgGrade).toFixed(1) : "--"
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
                  <div class="stats-label">平均绩点</div>
                  <div class="stats-value warning">
                    {{
                      gradeList.length > 0
                        ? Number(avgGradePoint).toFixed(2)
                        : "--"
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
                  <div class="stats-label">课程总数</div>
                  <div class="stats-value info">{{ gradeList.length }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="mb-4">
          <el-form :inline="true" class="search-form">
            <el-form-item label="课程名称">
              <el-input
                v-model="searchForm.courseName"
                placeholder="请输入课程名称"
                style="width: 200px"
                clearable
              />
            </el-form-item>
            <el-form-item label="学期">
              <el-select
                v-model="searchForm.semester"
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
                搜索
              </el-button>
              <el-button @click="resetSearch">
                <el-icon class="mr-1"><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <PureTableBar title="成绩列表" :columns="columns" @refresh="onRefresh">
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="filteredGrades"
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
            </pure-table>
          </template>
        </PureTableBar>
      </el-tab-pane>

      <el-tab-pane name="semesterStats">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><TrendCharts /></el-icon>
            学期统计
          </span>
        </template>

        <PureTableBar
          title="学期成绩统计"
          :columns="[
            { label: '学期', prop: 'semester', width: 150 },
            { label: '总学分', prop: 'totalCredits', width: 120 },
            {
              label: '平均成绩',
              prop: 'avgGrade',
              width: 120,
              slot: 'avgGrade'
            },
            {
              label: '平均绩点',
              prop: 'avgGradePoint',
              width: 120,
              slot: 'avgGradePoint'
            }
          ]"
          @refresh="onRefresh"
        >
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="semesterGrades"
              :columns="dynamicColumns"
              :size="size"
              row-key="semester"
              show-overflow-tooltip
            >
              <template #avgGrade="{ row }">
                <span
                  class="grade-text"
                  :style="{ color: getGradeColor(row.avgGrade) }"
                >
                  {{ Number(row.avgGrade).toFixed(1) }}
                </span>
              </template>
              <template #avgGradePoint="{ row }">
                <span
                  class="grade-text"
                  :style="{ color: getGradePointColor(row.avgGradePoint) }"
                >
                  {{ Number(row.avgGradePoint).toFixed(2) }}
                </span>
              </template>
            </pure-table>
          </template>
        </PureTableBar>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

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
