<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import { addEvaluation } from "@/api/user";
import { fetchCommonData } from "@/api/composed";
import { useUserStoreHook } from "@/store/modules/user";
import { PureTableBar } from "@/components/RePureTableBar";
import type { FormInstance } from "element-plus";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import StarFilled from "~icons/ep/star-filled";

defineOptions({
  name: "StudentEvaluation"
});

interface CourseItem {
  id: number;
  name: string;
  teacher: string;
  credit: number;
  hours: number;
  classroom: string;
  description: string;
  evaluated: boolean;
  evaluationScore?: number | string;
  evaluationContent?: string;
  evaluationTime?: string;
}

const loading = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const activeTab = ref("pending");

const searchForm = reactive({
  name: "",
  teacher: ""
});

const evaluationForm = reactive({
  courseId: null as number | null,
  courseName: "",
  teacher: "",
  semester: "",
  teachingScore: 5,
  contentScore: 5,
  interactionScore: 5,
  attitudeScore: 5,
  overallScore: 5,
  content: ""
});

const evaluationRules = {
  teachingScore: [{ required: true, message: "请评分", trigger: "change" }],
  contentScore: [{ required: true, message: "请评分", trigger: "change" }],
  interactionScore: [{ required: true, message: "请评分", trigger: "change" }],
  overallScore: [{ required: true, message: "请评分", trigger: "change" }],
  content: [
    { required: true, message: "请输入评教内容", trigger: "blur" },
    { min: 10, message: "评教内容至少10个字符", trigger: "blur" }
  ]
};

const columns: TableColumnList = [
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
    width: 180
  },
  {
    label: "评教状态",
    prop: "evaluated",
    width: 100,
    slot: "evaluated"
  },
  {
    label: "评分",
    prop: "evaluationScore",
    width: 100,
    slot: "score"
  },
  {
    label: "评教时间",
    prop: "evaluationTime",
    width: 160
  },
  {
    label: "操作",
    width: 120,
    slot: "operation"
  }
];

const courseList = ref<CourseItem[]>([]);

const fetchData = () => {
  loading.value = true;

  fetchCommonData.coursesAndEvaluations()
    .then(([coursesRes, evaluationsRes]) => {
      const evaluatedMap = new Map<number, any>();
      if (evaluationsRes.success) {
        (evaluationsRes.data as any[]).forEach(item => {
          evaluatedMap.set(item.courseId, item);
        });
      }

      if (coursesRes.success) {
        courseList.value = (coursesRes.data as any[]).map(item => {
          const evaluation = evaluatedMap.get(item.id);
          const teachingScore = evaluation
            ? Number(evaluation.teachingScore) || 0
            : 0;
          const contentScore = evaluation
            ? Number(evaluation.contentScore) || 0
            : 0;
          const interactionScore = evaluation
            ? Number(evaluation.interactionScore) || 0
            : 0;
          const overallScore = evaluation
            ? Number(evaluation.overallScore) || 0
            : 0;
          const attitudeScore = evaluation
            ? Number(evaluation.attitudeScore) || 0
            : 0;

          const avgScore =
            evaluation && evaluation.avgScore
              ? Number(evaluation.avgScore)
              : (teachingScore +
                  contentScore +
                  interactionScore +
                  overallScore +
                  attitudeScore) /
                5;

          return {
            id: item.id,
            name: item.name,
            teacher: item.teacher,
            credit: item.credit,
            hours: item.hours || item.credit * 16,
            classroom: item.classroom || "教室待定",
            description: item.description || "",
            evaluated: !!evaluation,
            evaluationScore: evaluation ? avgScore.toFixed(1) : undefined,
            evaluationContent: evaluation ? evaluation.comment : undefined,
            evaluationTime: evaluation ? evaluation.createTime : undefined
          };
        });
      }
    })
    .catch(() => {
      message("获取课程数据失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

const pendingCourses = computed(() => {
  let result = courseList.value.filter(item => !item.evaluated);
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

const completedCourses = computed(() => {
  let result = courseList.value.filter(item => item.evaluated);
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

const handleEvaluate = (row: CourseItem) => {
  evaluationForm.courseId = row.id;
  evaluationForm.courseName = row.name;
  evaluationForm.teacher = row.teacher;
  evaluationForm.semester = "";
  evaluationForm.teachingScore = 5;
  evaluationForm.contentScore = 5;
  evaluationForm.interactionScore = 5;
  evaluationForm.attitudeScore = 5;
  evaluationForm.overallScore = 5;
  evaluationForm.content = "";
  dialogVisible.value = true;
};

const submitEvaluation = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      const userStore = useUserStoreHook();
      addEvaluation({
        studentId: userStore.accountId,
        studentNo: userStore.studentNo,
        studentName: userStore.username,
        courseId: evaluationForm.courseId,
        courseName: evaluationForm.courseName,
        teacher: evaluationForm.teacher,
        semester: evaluationForm.semester,
        teachingScore: evaluationForm.teachingScore,
        contentScore: evaluationForm.contentScore,
        interactionScore: evaluationForm.interactionScore,
        attitudeScore: evaluationForm.attitudeScore,
        overallScore: evaluationForm.overallScore,
        comment: evaluationForm.content
      })
        .then(res => {
          if (res.success) {
            const teachingScore = Number(evaluationForm.teachingScore) || 0;
            const contentScore = Number(evaluationForm.contentScore) || 0;
            const interactionScore =
              Number(evaluationForm.interactionScore) || 0;
            const overallScore = Number(evaluationForm.overallScore) || 0;
            const attitudeScore = Number(evaluationForm.attitudeScore) || 0;
            const avgScore =
              (teachingScore +
                contentScore +
                interactionScore +
                overallScore +
                attitudeScore) /
              5;

            const courseIndex = courseList.value.findIndex(
              item => item.id === evaluationForm.courseId
            );

            if (courseIndex !== -1) {
              courseList.value[courseIndex] = {
                ...courseList.value[courseIndex],
                evaluated: true,
                evaluationScore: avgScore.toFixed(1),
                evaluationContent: evaluationForm.content,
                evaluationTime: new Date().toLocaleString()
              };
            }

            message("评教提交成功", { type: "success" });
            dialogVisible.value = false;
            activeTab.value = "completed";
          } else {
            message("评教提交失败", { type: "error" });
          }
        })
        .catch(() => {
          message("评教提交失败", { type: "error" });
        });
    }
  });
};

const resetSearch = () => {
  searchForm.name = "";
  searchForm.teacher = "";
};

const onRefresh = () => {
  message("刷新成功", { type: "success" });
};

const getScoreColor = (score: number | string) => {
  const s = Number(score);
  if (s >= 4.5) return "#67C23A";
  if (s >= 4) return "#409EFF";
  if (s >= 3) return "#E6A23C";
  return "#F56C6C";
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main table-common">
    <el-tabs v-model="activeTab" type="border-card" class="evaluation-tabs">
      <el-tab-pane name="pending">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><Search /></el-icon>
            待评教课程
            <el-badge
              v-if="pendingCourses.length > 0"
              :value="pendingCourses.length"
              :max="99"
              class="tab-badge"
            />
          </span>
        </template>

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

        <PureTableBar
          title="待评教课程列表"
          :columns="columns"
          @refresh="onRefresh"
        >
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="pendingCourses"
              :columns="dynamicColumns"
              :size="size"
              row-key="id"
              show-overflow-tooltip
            >
              <template #evaluated="{ row }">
                <el-tag
                  :type="row.evaluated ? 'success' : 'warning'"
                  size="small"
                >
                  {{ row.evaluated ? "已评教" : "待评教" }}
                </el-tag>
              </template>
              <template #score="{ row }">
                <span
                  v-if="row.evaluationScore"
                  class="score-text"
                  :style="{ color: getScoreColor(row.evaluationScore) }"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  {{ Number(row.evaluationScore).toFixed(1) }}
                </span>
                <span v-else class="text-gray">-</span>
              </template>
              <template #operation="{ row }">
                <el-button
                  link
                  type="primary"
                  :size="size"
                  @click="handleEvaluate(row)"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  评教
                </el-button>
              </template>
            </pure-table>
          </template>
        </PureTableBar>
      </el-tab-pane>

      <el-tab-pane name="completed">
        <template #label>
          <span class="tab-label">
            <el-icon class="mr-1"><StarFilled /></el-icon>
            已评教课程
          </span>
        </template>

        <PureTableBar
          title="已评教课程列表"
          :columns="columns"
          @refresh="onRefresh"
        >
          <template #default="{ size, dynamicColumns }">
            <pure-table
              :loading="loading"
              :data="completedCourses"
              :columns="dynamicColumns"
              :size="size"
              row-key="id"
              show-overflow-tooltip
            >
              <template #evaluated="{ row }">
                <el-tag
                  :type="row.evaluated ? 'success' : 'warning'"
                  size="small"
                >
                  {{ row.evaluated ? "已评教" : "待评教" }}
                </el-tag>
              </template>
              <template #score="{ row }">
                <span
                  v-if="row.evaluationScore"
                  class="score-text"
                  :style="{ color: getScoreColor(row.evaluationScore) }"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  {{ Number(row.evaluationScore).toFixed(1) }}
                </span>
                <span v-else class="text-gray">-</span>
              </template>
              <template #operation="{ row }">
                <el-button
                  link
                  type="primary"
                  :size="size"
                  @click="handleEvaluate(row)"
                >
                  <el-icon class="mr-1"><StarFilled /></el-icon>
                  查看详情
                </el-button>
              </template>
            </pure-table>
          </template>
        </PureTableBar>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogVisible" title="课程评教" width="600px">
      <el-form
        ref="formRef"
        :model="evaluationForm"
        :rules="evaluationRules"
        label-width="100px"
      >
        <el-form-item label="课程名称">
          <el-input v-model="evaluationForm.courseName" disabled />
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input v-model="evaluationForm.teacher" disabled />
        </el-form-item>

        <el-divider content-position="left">评分项（1-5分）</el-divider>

        <el-form-item label="教学水平" prop="teachingScore">
          <el-rate
            v-model="evaluationForm.teachingScore"
            :max="5"
            show-score
            allow-half
          />
        </el-form-item>
        <el-form-item label="课程内容" prop="contentScore">
          <el-rate
            v-model="evaluationForm.contentScore"
            :max="5"
            show-score
            allow-half
          />
        </el-form-item>
        <el-form-item label="课堂互动" prop="interactionScore">
          <el-rate
            v-model="evaluationForm.interactionScore"
            :max="5"
            show-score
            allow-half
          />
        </el-form-item>
        <el-form-item label="总体评价" prop="overallScore">
          <el-rate
            v-model="evaluationForm.overallScore"
            :max="5"
            show-score
            allow-half
          />
        </el-form-item>

        <el-divider />

        <el-form-item label="评教内容" prop="content">
          <el-input
            v-model="evaluationForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入评教内容（至少10个字符）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEvaluation(formRef)"
          >提交评教</el-button
        >
      </template>
    </el-dialog>
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

.tab-badge {
  margin-left: 8px;
}

.score-text {
  display: flex;
  align-items: center;
  font-weight: bold;
}

:deep(.el-tabs__content) {
  padding: 20px;
}

:deep(.el-rate) {
  height: 32px;
  line-height: 32px;
}
</style>
