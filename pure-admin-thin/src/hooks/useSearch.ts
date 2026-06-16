import { reactive, ref } from "vue";

export function useSearch<T extends Record<string, any>>(
  initialForm: T,
  fetchFn: () => Promise<void>
) {
  const searchForm = reactive<T>({ ...initialForm } as T);
  const loading = ref(false);

  const onSearch = () => {
    fetchFn();
  };

  const resetSearch = () => {
    Object.keys(initialForm).forEach(key => {
      searchForm[key] = initialForm[key];
    });
    fetchFn();
  };

  const onRefresh = () => {
    resetSearch();
  };

  return {
    searchForm,
    loading,
    onSearch,
    resetSearch,
    onRefresh
  };
}