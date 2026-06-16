export interface PaginationConfig {
  total: number;
  pageSize: number;
  currentPage: number;
  background: boolean;
}

export interface TableColumnConfig {
  label: string;
  prop: string;
  width?: number;
  minWidth?: number;
  slot?: string;
  showOverflowTooltip?: boolean;
  fixed?: "left" | "right" | boolean;
  sortable?: boolean | string;
  formatter?: (row: any, column: any, cellValue: any) => string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Course {
  id: number;
  name: string;
  teacher: string;
  credit: number;
  hours: number;
  classroom: string;
  semester?: string;
  description?: string;
  createTime?: string;
}

export interface Student {
  id: number;
  studentId?: string;
  studentNo?: string;
  name: string;
  gender: string;
  classId?: number;
  className: string;
  major?: string;
  phone?: string;
  email?: string;
  password?: string;
  createTime?: string;
}

export interface ClassInfo {
  id: number;
  name: string;
  studentCount: number;
  courses?: string;
}

export interface Classroom {
  id: number;
  name: string;
  capacity: number;
  building: string;
  floor: number;
  equipment?: string;
  status: string;
}

export interface Grade {
  id: number;
  studentId: string;
  studentName: string;
  className: string;
  courseId: number;
  courseName: string;
  score: number;
  semester: string;
}

export interface Evaluation {
  id: number;
  courseId: number;
  courseName: string;
  studentId: string;
  studentName: string;
  teachingScore: number;
  contentScore: number;
  interactionScore: number;
  overallScore: number;
  attitudeScore: number;
  comment?: string;
  createdAt: string;
}