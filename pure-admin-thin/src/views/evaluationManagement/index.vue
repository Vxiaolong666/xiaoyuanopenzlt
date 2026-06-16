<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import { fetchCommonData } from "@/api/composed";
import { PureTableBar } from "@/components/RePureTableBar";
import { ElMessageBox } from "element-plus";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import View from "~icons/ep/view";
import StarFilled from "~icons/ep/star-filled";

defineOptions({
  name: "EvaluationManagement"
});

interface EvaluationItem {
  id: number;
  courseId: number;
  courseName: string;
  teacher: string;
  studentId: number;
  studentName: string;
  teachingScore: number;
  contentScore: number;
  interactionScore: number;
  overallScore: number;
  avgScore: number;
  evaluationContent: string;
  createTime: string;
}

const loading = ref(false);
const activeTab = ref("all");

const searchForm = reactive({
  courseName: "",
  teacher: "",
  studentName: ""
});

const columns: TableColumnList = [
  {
    label: "评教ID",
    prop: "id",
    width: 80
  },
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
    label: "学生姓名",
    prop: "studentName",
    width: 120
  },
  {
    label: "教学水平",
    prop: "teachingScore",
    width: 100,
    slot: "teachingScore"
  },
  {
    label: "课程内容",
    prop: "contentScore",
    width: 100,
    slot: "contentScore"
  },
  {
    label: "课堂互动",
    prop: "interactionScore",
    width: 100,
    slot: "interactionScore"
  },
  {
    label: "总体评价",
    prop: "overallScore",
    width: 100,
    slot: "overallScore"
  },
  {
    label: "平均评分",
    prop: "avgScore",
    width: 120,
    slot: "avgScore"
  },
  {
    label: "评教内容",
    prop: "evaluationContent",
    showOverflowTooltip: true
  },
  {
    label: "评教时间",
    prop: "createTime",
    width: 160
  },
  {
    label: "操作",
    width: 120,
    slot: "operation"
  }
];

const evaluationList = ref<EvaluationItem[]>([]);

const fetchData = () => {
  loading.value = true;
  fetchCommonData.evaluations()
    .then(res => {
      if (res.success) {
        evaluationList.value = (res.data as any[]).map(item => {
          const teachingScore = Number(item.teachingScore) || 0;
          const contentScore = Number(item.contentScore) || 0;
          const interactionScore = Number(item.interactionScore) || 0;
          const overallScore = Number(item.overallScore) || 0;
          const attitudeScore = Number(item.attitudeScore) || 0;

          const avgScore = item.avgScore
            ? Number(item.avgScore)
            : (teachingScore +
                contentScore +
                interactionScore +
                overallScore +
                attitudeScore) /
              5;

          return {
            id: item.id,
            courseId: item.courseId,
            courseName: item.courseName,
            teacher: item.teacher,
            studentId: item.studentId,
            studentName: item.studentName,
            teachingScore,
            contentScore,
            interactionScore,
            overallScore,
            avgScore,
            evaluationContent: item.comment,
            createTime: item.createTime
          };
        });
      }
    })
    .catch(() => {
      message("获取评教数据失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

const filteredEvaluations = computed(() => {
  let result = evaluationList.value;
  if (searchForm.courseName) {
    result = result.filter(item =>
      item.courseName
        .toLowerCase()
        .includes(searchForm.courseName.toLowerCase())
    );
  }
  if (searchForm.teacher) {
    result = result.filter(item =>
      item.teacher.toLowerCase().includes(searchForm.teacher.toLowerCase())
    );
  }
  if (searchForm.studentName) {
    result = result.filter(item =>
      item.studentName
        .toLowerCase()
        .includes(searchForm.studentName.toLowerCase())
    );
  }
  return result;
});

const courseStats = computed(() => {
  const courseMap = new Map<string, EvaluationItem[]>();
  evaluationList.value.forEach(item => {
    if (!courseMap.has(item.courseName)) {
      courseMap.set(item.courseName, []);
    }
    courseMap.get(item.courseName)!.push(item);
  });

  const result: Array<{
    courseName: string;
    teacher: string;
    count: number;
    avgScore: number;
  }> = [];
  courseMap.forEach((evaluations, courseName) => {
    const teacher = evaluations[0].teacher;
    const count = evaluations.length;
    const avgScore =
      evaluations.reduce((sum, item) => sum + item.avgScore, 0) / count;
    result.push({ courseName, teacher, count, avgScore });
  });

  return result.sort((a, b) => b.avgScore - a.avgScore);
});

const viewDetail = (row: EvaluationItem) => {
  ElMessageBox.alert(
    `<div style="line-height: 2;">
      <p><strong>课程名称：</strong>${row.courseName}</p>
      <p><strong>授课教师：</strong>${row.teacher}</p>
      <p><strong>学生姓名：</strong>${row.studentName}</p>
      <p><strong>教学水平评分：</strong>${row.teachingScore}分</p>
      <p><strong>课程内容评分：</strong>${row.contentScore}分</p>
      <p><strong>课堂互动评分：</strong>${row.interactionScore}分</p>
      <p><strong>总体评价评分：</strong>${row.overallScore}分</p>
      <p><strong>平均评分：</strong>${Number(row.avgScore).toFixed(1)}分</p>
      <p><strong>评教内容：</strong>${row.evaluationContent}</p>
      <p><strong>评教时间：</strong>${row.createTime}</p>
    </div>`,
    "评教详情",
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: "关闭"
    }
  );
};

const resetSearch = () => {
  searchForm.courseName = "";
  searchForm.teacher = "";
  searchForm.studentName = "";
};

const onRefresh = () => {
  message("刷新成功", { type: "success" });
};

const getScoreColor = (score: number) => {
  if (score >= 4.5) return "#67C23A";
  if (score >= 4.0) return "#409EFF";
  if (score >= 3.0) return "#E6A23C";
  return "#F56C6C";
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
    <el-tabs v-model="activeTab" type="border-card" class="evaluation-tabs">
      <el-tab-pane name="all">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><Search /></el-icon>
            评教列表
          </span>
        </template>

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
            <el-form-item label="授课教师">
              <el-input
                v-model="searchForm.teacher"
                placeholder="请输入教师姓名"
                style="width: 200px"
                clearable
              />
            </el-form-item>
            <el-form-item label="学生姓名">
              <el-input
                v-model="searchForm.studentName"
                placeholder="请输入学生姓名"
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

        <PureTableBar
          title="评教记录列表"
          :columns="columns"
          @refresh="onRefresh"
        >
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="filteredEvaluations"
              :columns="dynamicColumns"
              :size="size"
              row-key="id"
              show-overflow-tooltip
            >
              <template #teachingScore="{ row }">
                <span
                  class="score-text"
                  :style="{ color: getScoreColor(row.teachingScore) }"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  {{ row.teachingScore }}
                </span>
              </template>
              <template #contentScore="{ row }">
                <span
                  class="score-text"
                  :style="{ color: getScoreColor(row.contentScore) }"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  {{ row.contentScore }}
                </span>
              </template>
              <template #interactionScore="{ row }">
                <span
                  class="score-text"
                  :style="{ color: getScoreColor(row.interactionScore) }"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  {{ row.interactionScore }}
                </span>
              </template>
              <template #overallScore="{ row }">
                <span
                  class="score-text"
                  :style="{ color: getScoreColor(row.overallScore) }"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  {{ row.overallScore }}
                </span>
              </template>
              <template #avgScore="{ row }">
                <el-tag
                  :type="
                    Number(row.avgScore) >= 4.5
                      ? 'success'
                      : Number(row.avgScore) >= 4.0
                        ? 'primary'
                        : Number(row.avgScore) >= 3.0
                          ? 'warning'
                          : 'danger'
                  "
                  size="small"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  {{ Number(row.avgScore).toFixed(1) }}
                </el-tag>
              </template>
              <template #operation="{ row }">
                <el-button
                  link
                  type="primary"
                  :size="size"
                  @click="viewDetail(row)"
                >
                  <el-icon class="mr-1"><View /></el-icon>
                  查看详情
                </el-button>
              </template>
            </pure-table>
          </template>
        </PureTableBar>
      </el-tab-pane>

      <el-tab-pane name="stats">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><StarFilled /></el-icon>
            课程统计
          </span>
        </template>

        <PureTableBar
          title="课程评教统计"
          :columns="[
            { label: '课程名称', prop: 'courseName' },
            { label: '授课教师', prop: 'teacher', width: 120 },
            { label: '评教人数', prop: 'count', width: 120 },
            {
              label: '平均评分',
              prop: 'avgScore',
              width: 150,
              slot: 'avgScore'
            }
          ]"
          @refresh="onRefresh"
        >
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="courseStats"
              :columns="dynamicColumns"
              :size="size"
              row-key="courseName"
              show-overflow-tooltip
            >
              <template #avgScore="{ row }">
                <el-tag
                  :type="
                    Number(row.avgScore) >= 4.5
                      ? 'success'
                      : Number(row.avgScore) >= 4.0
                        ? 'primary'
                        : Number(row.avgScore) >= 3.0
                          ? 'warning'
                          : 'danger'
                  "
                  size="small"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  {{ Number(row.avgScore).toFixed(1) }}
                </el-tag>
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

.evaluation-tabs {
  min-height: calc(100vh - 200px);
}

.tab-label {
  display: flex;
  align-items: center;
}

.score-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

:deep(.el-tabs__content) {
  padding: 20px;
}
</style>
