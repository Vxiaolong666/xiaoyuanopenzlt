import { reactive } from "vue";

export function usePagination(initialPageSize = 10) {
  const pagination = reactive({
    total: 0,
    pageSize: initialPageSize,
    currentPage: 1,
    background: true
  });

  const handleSizeChange = (val: number) => {
    pagination.pageSize = val;
  };

  const handleCurrentChange = (val: number) => {
    pagination.currentPage = val;
  };

  const resetPagination = () => {
    pagination.currentPage = 1;
    pagination.total = 0;
  };

  return {
    pagination,
    handleSizeChange,
    handleCurrentChange,
    resetPagination
  };
}