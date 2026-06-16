import { 
  getAllStudents, 
  getAllCourses, 
  getAllClasses, 
  getAllUsers,
  getAllEvaluations,
  getAllGrades,
  getAllClassrooms,
  getAllBookings
} from "@/api/user";

export const fetchCommonData = {
  students: () => getAllStudents(),
  courses: () => getAllCourses(),
  classes: () => getAllClasses(),
  users: () => getAllUsers(),
  evaluations: () => getAllEvaluations(),
  grades: () => getAllGrades(),
  classrooms: () => getAllClassrooms(),
  bookings: () => getAllBookings(),

  all: () =>
    Promise.all([getAllStudents(), getAllCourses(), getAllClasses()]),

  studentsAndCourses: () =>
    Promise.all([getAllStudents(), getAllCourses()]),

  coursesAndClasses: () =>
    Promise.all([getAllCourses(), getAllClasses()]),

  classesAndCourses: () =>
    Promise.all([getAllClasses(), getAllCourses()]),

  studentsAndClasses: () =>
    Promise.all([getAllStudents(), getAllClasses()]),

  gradesData: () =>
    Promise.all([getAllGrades(), getAllStudents(), getAllClasses(), getAllCourses()]),

  coursesAndEvaluations: () =>
    Promise.all([getAllCourses(), getAllEvaluations()]),

  classroomsAndBookings: () =>
    Promise.all([getAllClassrooms(), getAllBookings()])
};