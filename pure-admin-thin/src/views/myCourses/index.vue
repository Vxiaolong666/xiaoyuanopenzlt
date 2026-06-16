<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { message } from "@/utils/message";
import { fetchCommonData } from "@/api/composed";
import { useUserStoreHook } from "@/store/modules/user";
import { PureTableBar } from "@/components/RePureTableBar";
import { usePagination } from "@/hooks/usePagination";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";

defineOptions({
  name: "MyCourses"
});

interface CourseItem {
  id: number;
  name: string;
  teacher: string;
  credit: number;
  hours: number;
  classroom: string;
  semester: string;
  description: string;
}

const loading = ref(false);
const searchForm = ref({
  name: "",
  teacher: ""
});

const courseList = ref<CourseItem[]>([]);
const userStore = useUserStoreHook();

const { pagination, handleSizeChange, handleCurrentChange } = usePagination();

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
    width: 180
  },
  {
    label: "学期",
    prop: "semester",
    width: 150
  }
];

const filteredCourses = computed(() => {
  let filtered = courseList.value;

  if (searchForm.value.name) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchForm.value.name.toLowerCase())
    );
  }

  if (searchForm.value.teacher) {
    filtered = filtered.filter(item =>
      item.teacher.toLowerCase().includes(searchForm.value.teacher.toLowerCase())
    );
  }

  return filtered;
});

const paginationData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredCourses.value.slice(start, end);
});

const fetchData = async () => {
  loading.value = true;

  try {
    const [coursesRes, classesRes] = await fetchCommonData.coursesAndClasses();

    if (coursesRes.success && classesRes.success) {
      const studentClass = classesRes.data.find(
        (cls: any) => cls.name === userStore.className
      );

      if (studentClass) {
        let coursesList: string[] = [];

        if (studentClass.courses) {
          try {
            coursesList = JSON.parse(studentClass.courses);
          } catch (e) {
            if (typeof studentClass.courses === "string") {
              if (studentClass.courses.includes(",")) {
                coursesList = studentClass.courses
                  .split(",")
                  .map((c: string) => c.trim());
              } else if (studentClass.courses) {
                coursesList = [studentClass.courses];
              }
            } else if (Array.isArray(studentClass.courses)) {
              coursesList = studentClass.courses;
            }
          }
        }

        courseList.value = (coursesRes.data as any[])
          .filter(course => coursesList.includes(course.name))
          .map(course => {
            return {
              id: course.id,
              name: course.name,
              teacher: course.teacher,
              credit: course.credit,
              hours: course.hours,
              classroom: course.classroom,
              semester: course.semester || "2024-2025第一学期",
              description: course.description
            };
          });

        pagination.total = courseList.value.length;

        if (courseList.value.length === 0) {
          message("您的班级暂无课程安排", { type: "info" });
        }
      } else {
        courseList.value = [];
        pagination.total = 0;
        message("您尚未分配班级", { type: "info" });
      }
    }
  } catch (error) {
    message("获取课程数据失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  pagination.currentPage = 1;
  pagination.total = filteredCourses.value.length;
};

const resetSearch = () => {
  searchForm.value.name = "";
  searchForm.value.teacher = "";
  pagination.currentPage = 1;
  pagination.total = courseList.value.length;
};

const onRefresh = () => {
  resetSearch();
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
          <el-button type="primary" @click="onSearch">
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

    <PureTableBar title="我的课程列表" :columns="columns" @refresh="onRefresh">
      <template #default="{ size, dynamicColumns }">
        <pure-table
          :loading="loading"
          :data="paginationData"
          :columns="dynamicColumns"
          :size="size"
          row-key="id"
          show-overflow-tooltip
        />

        <el-pagination
          class="pagination"
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          :background="pagination.background"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
@import "@/style/table-common.scss";

.main {
  padding: 20px;
}
</style>