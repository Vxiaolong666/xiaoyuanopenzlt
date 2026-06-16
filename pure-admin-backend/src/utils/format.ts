export function formatDateTime(date: Date | string | null): string {
  if (!date) return "";
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatDateOnly(date: Date | string | null): string {
  if (!date) return "";
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

export function formatDataFields(data: any[], timeFields: string[] = []): any[] {
  const defaultTimeFields = [
    "createTime", "updateTime", "examTime", "publishTime", 
    "startTime", "endTime", "borrowTime", "returnTime",
    "evaluationTime", "submitTime"
  ];
  
  const allTimeFields = [...defaultTimeFields, ...timeFields];
  
  return data.map(item => {
    const formattedItem = { ...item };
    allTimeFields.forEach(field => {
      if (formattedItem[field]) {
        formattedItem[field] = formatDateTime(formattedItem[field]);
      }
    });
    return formattedItem;
  });
}