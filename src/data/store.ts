import { useState, useEffect } from 'react';
import {
  Student,
  Teacher,
  Parent,
  Course,
  Batch,
  CourseModule,
  Assignment,
  Announcement,
  Invoice,
  Certificate,
  AttendanceRecord,
  StudyMaterial,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_PARENTS,
  INITIAL_COURSES,
  INITIAL_BATCHES,
  INITIAL_MODULES,
  INITIAL_ASSIGNMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_INVOICES,
  INITIAL_CERTIFICATES,
  INITIAL_ATTENDANCE,
  INITIAL_STUDY_MATERIALS,
  INSTITUTE_DETAILS,
} from './seedData';

const STORAGE_KEYS = {
  STUDENTS: 'sb_students_v2',
  TEACHERS: 'sb_teachers_v2',
  PARENTS: 'sb_parents_v2',
  BATCHES: 'sb_batches_v2',
  ASSIGNMENTS: 'sb_assignments_v2',
  ANNOUNCEMENTS: 'sb_announcements_v2',
  INVOICES: 'sb_invoices_v2',
  CERTIFICATES: 'sb_certificates_v2',
  ATTENDANCE: 'sb_attendance_v2',
  STUDY_MATERIALS: 'sb_materials_v2',
  CURRENT_STUDENT_ID: 'sb_current_student_id_v2',
  CURRENT_TEACHER_ID: 'sb_current_teacher_id_v2',
  CURRENT_PARENT_ID: 'sb_current_parent_id_v2',
  INSTITUTE_CUSTOM: 'sb_institute_custom_v2',
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Global state container with subscriber pattern for seamless updates across tabs & roles
class AppStateManager {
  private listeners: Set<() => void> = new Set();

  students: Student[] = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  teachers: Teacher[] = getStored(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  parents: Parent[] = getStored(STORAGE_KEYS.PARENTS, INITIAL_PARENTS);
  batches: Batch[] = getStored(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  assignments: Assignment[] = getStored(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  announcements: Announcement[] = getStored(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  invoices: Invoice[] = getStored(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  certificates: Certificate[] = getStored(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
  attendance: AttendanceRecord[] = getStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  studyMaterials: StudyMaterial[] = getStored(STORAGE_KEYS.STUDY_MATERIALS, INITIAL_STUDY_MATERIALS);
  institute: typeof INSTITUTE_DETAILS = getStored(STORAGE_KEYS.INSTITUTE_CUSTOM, INSTITUTE_DETAILS);

  courses: Course[] = INITIAL_COURSES;
  modules: CourseModule[] = INITIAL_MODULES;

  currentStudentId: string = getStored(STORAGE_KEYS.CURRENT_STUDENT_ID, 'stu-harpreet-singh');
  currentTeacherId: string = getStored(STORAGE_KEYS.CURRENT_TEACHER_ID, 'tch-sukhman-gill');
  currentParentId: string = getStored(STORAGE_KEYS.CURRENT_PARENT_ID, 'par-balwinder-singh');

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  setCurrentStudent(id: string) {
    this.currentStudentId = id;
    setStored(STORAGE_KEYS.CURRENT_STUDENT_ID, id);
    this.notify();
  }

  setCurrentTeacher(id: string) {
    this.currentTeacherId = id;
    setStored(STORAGE_KEYS.CURRENT_TEACHER_ID, id);
    this.notify();
  }

  setCurrentParent(id: string) {
    this.currentParentId = id;
    setStored(STORAGE_KEYS.CURRENT_PARENT_ID, id);
    this.notify();
  }

  // --- Student & Admissions ---
  addStudent(newStudent: Omit<Student, 'id' | 'enrolledDate' | 'status' | 'attendanceRate' | 'progressRate'>) {
    const id = `stu-${Date.now()}`;
    const student: Student = {
      ...newStudent,
      id,
      enrolledDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      attendanceRate: 100,
      progressRate: 0,
    };

    this.students = [student, ...this.students];
    setStored(STORAGE_KEYS.STUDENTS, this.students);

    // Update batch seats count
    this.batches = this.batches.map((b) => {
      if (b.id === student.batchId) {
        return { ...b, filledSeats: Math.min(b.totalSeats, b.filledSeats + 1) };
      }
      return b;
    });
    setStored(STORAGE_KEYS.BATCHES, this.batches);

    // Create automatic GST invoice
    const baseAmt = Math.round((student.feeTotal / 1.18) * 100) / 100;
    const cgstAmt = Math.round(((student.feeTotal - baseAmt) / 2) * 100) / 100;
    const sgstAmt = cgstAmt;

    const newInvoice: Invoice = {
      invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentId: student.id,
      studentName: student.name,
      studentRollNo: student.rollNo,
      studentPhone: student.phone,
      courseId: student.courseId,
      courseName: student.courseTitle,
      issueDate: student.enrolledDate,
      dueDate: new Date(Date.now() + 15 * 86400000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      baseAmount: baseAmt,
      cgstAmount: cgstAmt,
      sgstAmount: sgstAmt,
      totalAmount: student.feeTotal,
      amountPaid: student.feePaid,
      balanceDue: student.feeDue,
      status: student.feeDue === 0 ? 'Paid' : student.feePaid > 0 ? 'Partial' : 'Unpaid',
      paymentMode: student.feePaid > 0 ? 'UPI (GPay / PhonePe)' : undefined,
    };

    this.invoices = [newInvoice, ...this.invoices];
    setStored(STORAGE_KEYS.INVOICES, this.invoices);

    this.notify();
    return student;
  }

  // --- Teacher & Staff ---
  addTeacher(newTeacher: Omit<Teacher, 'id' | 'status'>) {
    const id = `tch-${Date.now()}`;
    const teacher: Teacher = {
      ...newTeacher,
      id,
      status: 'Active',
    };

    this.teachers = [teacher, ...this.teachers];
    setStored(STORAGE_KEYS.TEACHERS, this.teachers);
    this.notify();
    return teacher;
  }

  // --- Attendance Management ---
  markAttendance(
    batchId: string,
    batchName: string,
    date: string,
    records: Record<string, 'Present' | 'Absent' | 'Late'>,
    markedByTeacherName: string,
    notes?: string
  ) {
    const id = `att-${Date.now()}`;
    const newRecord: AttendanceRecord = {
      id,
      batchId,
      batchName,
      date,
      markedByTeacherName,
      records,
      notes,
    };

    // Filter out existing record for same batch and date if updating
    this.attendance = [newRecord, ...this.attendance.filter((a) => !(a.batchId === batchId && a.date === date))];
    setStored(STORAGE_KEYS.ATTENDANCE, this.attendance);

    // Update students' live attendance percentage
    this.students = this.students.map((stu) => {
      if (stu.batchId === batchId && records[stu.id]) {
        // Calculate dynamic attendance
        const studentPastLogs = this.attendance.filter((att) => att.batchId === batchId && att.records[stu.id]);
        const totalClasses = studentPastLogs.length;
        const presentCount = studentPastLogs.filter((att) => att.records[stu.id] === 'Present' || att.records[stu.id] === 'Late').length;
        const newRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : stu.attendanceRate;

        return {
          ...stu,
          attendanceRate: newRate,
        };
      }
      return stu;
    });
    setStored(STORAGE_KEYS.STUDENTS, this.students);

    this.notify();
    return newRecord;
  }

  // --- Assignment Evaluation by Teacher ---
  gradeAssignment(assignmentId: string, score: number, feedback: string) {
    this.assignments = this.assignments.map((a) => {
      if (a.id === assignmentId) {
        return {
          ...a,
          status: 'Graded' as const,
          score,
          feedback,
        };
      }
      return a;
    });
    setStored(STORAGE_KEYS.ASSIGNMENTS, this.assignments);
    this.notify();
  }

  createAssignment(newAsg: Omit<Assignment, 'id' | 'status'>) {
    const id = `asg-${Date.now()}`;
    const assignment: Assignment = {
      ...newAsg,
      id,
      status: 'Pending',
    };
    this.assignments = [assignment, ...this.assignments];
    setStored(STORAGE_KEYS.ASSIGNMENTS, this.assignments);
    this.notify();
    return assignment;
  }

  submitAssignment(assignmentId: string, submissionText: string, submissionLink?: string) {
    const submittedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    this.assignments = this.assignments.map((a) => {
      if (a.id === assignmentId) {
        return {
          ...a,
          status: 'Submitted' as const,
          submittedDate,
          submissionText,
          submissionLink,
          feedback: 'Submitted successfully to SkillBridge portal. Evaluator assigned.',
        };
      }
      return a;
    });
    setStored(STORAGE_KEYS.ASSIGNMENTS, this.assignments);
    this.notify();
  }

  // --- Study Materials ---
  addStudyMaterial(material: Omit<StudyMaterial, 'id' | 'uploadDate'>) {
    const id = `mat-${Date.now()}`;
    const uploadDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newMat: StudyMaterial = {
      ...material,
      id,
      uploadDate,
    };
    this.studyMaterials = [newMat, ...this.studyMaterials];
    setStored(STORAGE_KEYS.STUDY_MATERIALS, this.studyMaterials);
    this.notify();
    return newMat;
  }

  // --- Certificates ---
  issueCertificate(
    studentId: string,
    studentName: string,
    studentRollNo: string,
    courseName: string,
    track: string,
    gradeScore: string
  ) {
    const id = `cert-${Date.now()}`;
    const cert: Certificate = {
      id,
      certificateNo: `SB-CERT-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentId,
      studentName,
      studentRollNo,
      courseName,
      track,
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      gradeScore,
      verificationCode: `VERIFY-BTI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      directorName: this.institute.director,
      campusCity: 'Bathinda, Punjab',
    };

    this.certificates = [cert, ...this.certificates];
    setStored(STORAGE_KEYS.CERTIFICATES, this.certificates);
    this.notify();
    return cert;
  }

  // --- Invoicing & Payments ---
  recordPayment(
    invoiceNo: string,
    additionalAmount: number,
    paymentMode: 'UPI (GPay / PhonePe)' | 'Bank Transfer / NEFT' | 'Cash Receipt' | 'Cheque',
    transactionRef: string
  ) {
    let studentIdToUpdate = '';

    this.invoices = this.invoices.map((inv) => {
      if (inv.invoiceNo === invoiceNo) {
        studentIdToUpdate = inv.studentId;
        const newPaid = Math.min(inv.totalAmount, inv.amountPaid + additionalAmount);
        const newDue = Math.max(0, inv.totalAmount - newPaid);
        return {
          ...inv,
          amountPaid: newPaid,
          balanceDue: newDue,
          status: newDue === 0 ? 'Paid' : 'Partial',
          paymentMode,
          transactionRef,
        };
      }
      return inv;
    });
    setStored(STORAGE_KEYS.INVOICES, this.invoices);

    if (studentIdToUpdate) {
      this.students = this.students.map((s) => {
        if (s.id === studentIdToUpdate) {
          const newPaid = Math.min(s.feeTotal, s.feePaid + additionalAmount);
          const newDue = Math.max(0, s.feeTotal - newPaid);
          return {
            ...s,
            feePaid: newPaid,
            feeDue: newDue,
          };
        }
        return s;
      });
      setStored(STORAGE_KEYS.STUDENTS, this.students);
    }

    this.notify();
  }

  updateBatchCapacity(batchId: string, newTotalSeats: number) {
    this.batches = this.batches.map((b) => {
      if (b.id === batchId) {
        return { ...b, totalSeats: Math.max(b.filledSeats, newTotalSeats) };
      }
      return b;
    });
    setStored(STORAGE_KEYS.BATCHES, this.batches);
    this.notify();
  }

  addAnnouncement(newAnn: Omit<Announcement, 'id' | 'createdAt' | 'whatsappFormattedText'>) {
    const id = `ann-${Date.now()}`;
    const createdAt = 'Just now';
    const whatsappFormattedText = `📢 *SKILLBRIDGE BATHINDA NOTICE*\n${newAnn.title}\n\n${newAnn.content}\n\nTarget: ${newAnn.targetBatch}\nCampus: Ajit Road, Bathinda (+91 98882 45120)\nView on Portal: https://skillbridgebathinda.in`;

    const announcement: Announcement = {
      ...newAnn,
      id,
      createdAt,
      whatsappFormattedText,
    };

    this.announcements = [announcement, ...this.announcements];
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, this.announcements);
    this.notify();
    return announcement;
  }

  updateInstituteCustomizer(details: Partial<typeof INSTITUTE_DETAILS>) {
    this.institute = {
      ...this.institute,
      ...details,
    };
    setStored(STORAGE_KEYS.INSTITUTE_CUSTOM, this.institute);
    this.notify();
  }

  resetToDefault() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.students = INITIAL_STUDENTS;
    this.teachers = INITIAL_TEACHERS;
    this.parents = INITIAL_PARENTS;
    this.batches = INITIAL_BATCHES;
    this.assignments = INITIAL_ASSIGNMENTS;
    this.announcements = INITIAL_ANNOUNCEMENTS;
    this.invoices = INITIAL_INVOICES;
    this.certificates = INITIAL_CERTIFICATES;
    this.attendance = INITIAL_ATTENDANCE;
    this.studyMaterials = INITIAL_STUDY_MATERIALS;
    this.institute = INSTITUTE_DETAILS;
    this.currentStudentId = 'stu-harpreet-singh';
    this.currentTeacherId = 'tch-sukhman-gill';
    this.currentParentId = 'par-balwinder-singh';
    this.notify();
  }
}

export const appState = new AppStateManager();

export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return appState.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  const currentStudent =
    appState.students.find((s) => s.id === appState.currentStudentId) || appState.students[0];

  const currentTeacher =
    appState.teachers.find((t) => t.id === appState.currentTeacherId) || appState.teachers[0];

  const currentParent =
    appState.parents.find((p) => p.id === appState.currentParentId) || appState.parents[0];

  // Linked child student for the current parent
  const linkedChild =
    appState.students.find((s) => s.id === currentParent.linkedStudentId) || currentStudent;

  return {
    students: appState.students,
    teachers: appState.teachers,
    parents: appState.parents,
    batches: appState.batches,
    assignments: appState.assignments,
    announcements: appState.announcements,
    invoices: appState.invoices,
    certificates: appState.certificates,
    attendance: appState.attendance,
    studyMaterials: appState.studyMaterials,
    courses: appState.courses,
    modules: appState.modules,
    institute: appState.institute,

    currentStudent,
    currentTeacher,
    currentParent,
    linkedChild,

    setCurrentStudent: (id: string) => appState.setCurrentStudent(id),
    setCurrentTeacher: (id: string) => appState.setCurrentTeacher(id),
    setCurrentParent: (id: string) => appState.setCurrentParent(id),

    addStudent: (s: any) => appState.addStudent(s),
    addTeacher: (t: any) => appState.addTeacher(t),
    markAttendance: (bId: string, bName: string, dt: string, recs: any, tName: string, n?: string) =>
      appState.markAttendance(bId, bName, dt, recs, tName, n),
    gradeAssignment: (id: string, score: number, fb: string) => appState.gradeAssignment(id, score, fb),
    createAssignment: (a: any) => appState.createAssignment(a),
    submitAssignment: (id: string, text: string, link?: string) => appState.submitAssignment(id, text, link),
    addStudyMaterial: (m: any) => appState.addStudyMaterial(m),
    issueCertificate: (sId: string, sName: string, sRoll: string, cName: string, trk: string, gr: string) =>
      appState.issueCertificate(sId, sName, sRoll, cName, trk, gr),
    recordPayment: (no: string, amt: number, mode: any, ref: string) =>
      appState.recordPayment(no, amt, mode, ref),
    updateBatchCapacity: (batchId: string, seats: number) => appState.updateBatchCapacity(batchId, seats),
    addAnnouncement: (a: any) => appState.addAnnouncement(a),
    updateInstituteCustomizer: (details: any) => appState.updateInstituteCustomizer(details),
    resetToDefault: () => appState.resetToDefault(),
  };
}
