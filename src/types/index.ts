export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  parentPhone: string;
  parentName?: string;
  address: string;
  courseId: string;
  courseTitle: string;
  batchId: string;
  batchName: string;
  feeTotal: number;
  feePaid: number;
  feeDue: number;
  attendanceRate: number;
  progressRate: number;
  enrolledDate: string;
  status: 'Active' | 'On Leave' | 'Completed';
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  qualification: string;
  department: 'Tech & Coding' | 'IELTS & Languages' | 'Senior Secondary STEM';
  assignedBatchIds: string[];
  assignedBatchNames: string[];
  joiningDate: string;
  monthlySalary: number;
  status: 'Active' | 'On Leave';
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  occupation: string;
  linkedStudentId: string;
  linkedStudentName: string;
  linkedStudentRollNo: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  address: string;
}

export interface AttendanceRecord {
  id: string;
  batchId: string;
  batchName: string;
  date: string;
  markedByTeacherName: string;
  records: Record<string, 'Present' | 'Absent' | 'Late'>; // studentId -> status
  notes?: string;
}

export interface Course {
  id: string;
  title: string;
  track: 'Tech Bootcamp' | 'IELTS & English' | 'School 9th-12th';
  description: string;
  duration: string;
  instructor: string;
  fee: number;
  totalModules: number;
  image: string;
  badge: string;
  syllabusHighlights: string[];
}

export interface Batch {
  id: string;
  courseId: string;
  courseTitle: string;
  name: string;
  timing: string;
  days: string;
  instructor: string;
  totalSeats: number;
  filledSeats: number;
  classroom: string;
  startDate: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  type: 'video' | 'lecture' | 'code' | 'reading';
  completed: boolean;
  contentSummary: string;
  keyTakeaway: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  durationHours: number;
  completed: boolean;
  lessons: Lesson[];
  resources: string[];
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  batchId?: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  studentId?: string;
  studentName?: string;
  submittedDate?: string;
  submissionText?: string;
  submissionLink?: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  score?: number;
  feedback?: string;
  rubric: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Urgent Alert' | 'Exam Schedule' | 'Batch Timing' | 'Holiday Notice' | 'Opportunity';
  createdAt: string;
  targetBatch: string;
  author: string;
  whatsappFormattedText: string;
}

export interface Invoice {
  invoiceNo: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  studentPhone: string;
  courseId: string;
  courseName: string;
  issueDate: string;
  dueDate: string;
  baseAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  paymentMode?: 'UPI (GPay / PhonePe)' | 'Bank Transfer / NEFT' | 'Cash Receipt' | 'Cheque';
  transactionRef?: string;
}

export interface Certificate {
  id: string;
  certificateNo: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  courseName: string;
  track: string;
  issueDate: string;
  gradeScore: string;
  verificationCode: string;
  directorName: string;
  campusCity: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  batchId: string;
  batchName: string;
  teacherName: string;
  uploadDate: string;
  category: 'Lecture Notes' | 'Sample Paper' | 'Code Repository' | 'Formula Sheet';
  fileSize: string;
  downloadUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  model: 'gemini' | 'claude' | 'gpt' | 'grok';
  text: string;
  timestamp: string;
  feeAlert?: boolean;
}
