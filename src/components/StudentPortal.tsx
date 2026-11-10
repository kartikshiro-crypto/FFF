import React, { useState } from 'react';
import { Student, Course, CourseModule, Assignment, Invoice, Lesson, Certificate } from '../types';
import { AiTutor } from './AiTutor';
import {
  BookOpen,
  FileCheck2,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Send,
  AlertTriangle,
  PlayCircle,
  FileText,
  MapPin,
  Calendar,
  Layers,
  Award,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface StudentPortalProps {
  currentStudent: Student;
  courses: Course[];
  modules: CourseModule[];
  assignments: Assignment[];
  invoices: Invoice[];
  certificates?: Certificate[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSubmitAssignment: (assignmentId: string, text: string, link?: string) => void;
  onOpenInvoiceModal: (invoice: Invoice) => void;
  onOpenCertificateModal?: (certificate: Certificate) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentStudent,
  courses,
  modules,
  assignments,
  invoices,
  certificates = [],
  activeTab,
  onTabChange,
  onSubmitAssignment,
  onOpenInvoiceModal,
  onOpenCertificateModal,
}) => {
  // Find current enrolled course
  const currentCourse =
    courses.find((c) => c.id === currentStudent.courseId) || courses[0];

  // Filter modules for this course
  const courseModules = modules.filter((m) => m.courseId === currentCourse.id);

  // Filter assignments for this course
  const studentAssignments = assignments.filter(
    (a) => a.courseId === currentCourse.id || a.courseTitle === currentStudent.courseTitle
  );

  // Find invoice for this student
  const studentInvoice =
    invoices.find((i) => i.studentId === currentStudent.id) || invoices[0];

  // Resolve certificates for this student
  const studentCertificates = certificates.filter(
    (c) => c.studentId === currentStudent.id || c.studentRollNo === currentStudent.rollNo
  );

  const fallbackCertificate: Certificate = {
    id: `cert-${currentStudent.id}`,
    certificateNo: `SB-PUN-2026-${currentStudent.rollNo.replace(/[^0-9]/g, '') || '8812'}`,
    studentId: currentStudent.id,
    studentName: currentStudent.name,
    studentRollNo: currentStudent.rollNo,
    courseName: currentStudent.courseTitle,
    track: currentStudent.courseTitle.includes('IELTS') ? 'IELTS & Spoken English' : currentStudent.courseTitle.includes('Class') ? 'Senior Secondary STEM' : 'Full-Stack Software Engineering',
    issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    gradeScore: currentStudent.progressRate >= 80 ? 'Grade A+ (Exemplary 94%)' : 'Grade A (Distinction 88%)',
    verificationCode: `VERIFY-SB-${currentStudent.rollNo}`,
    directorName: 'Er. Gurpreet Singh Brar (M.Tech, Ex-NIT)',
    campusCity: 'Bathinda Campus, Punjab',
  };

  const activeCertificates = studentCertificates.length > 0 ? studentCertificates : [fallbackCertificate];

  // Modal states
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'Pending' | 'Submitted' | 'Graded'>('all');

  const filteredAssignments = studentAssignments.filter((a) => {
    if (assignmentFilter === 'all') return true;
    return a.status === assignmentFilter;
  });

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;
    onSubmitAssignment(submittingAssignment.id, submissionText, submissionLink);
    setSubmittingAssignment(null);
    setSubmissionText('');
    setSubmissionLink('');
  };

  return (
    <div className="space-y-8">
      
      {/* Student Welcome & Institute Hub Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative h-48 md:h-56 w-full overflow-hidden">
          <img
            src="/src/assets/images/skillbridge_campus_hero_1794309915327.jpg"
            alt="SkillBridge Bathinda Campus"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />

          {/* Hero Content Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                <MapPin className="w-3.5 h-3.5" />
                <span>Ajit Road Campus · Bathinda, Punjab</span>
                <span>·</span>
                <span>Hybrid Learning Lab</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                Sat Sri Akaal, {currentStudent.name}!
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-0.5">
                Enrolled in: <strong className="text-white">{currentStudent.courseTitle}</strong> · Batch: {currentStudent.batchName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-xs">
                <span className="text-slate-300">Roll No: </span>
                <span className="font-mono font-bold">{currentStudent.rollNo}</span>
              </div>

              {currentStudent.feeDue > 0 ? (
                <button
                  onClick={() => onOpenInvoiceModal(studentInvoice)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Fee Due: ₹{currentStudent.feeDue.toLocaleString('en-IN')}</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fees Settled</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick KPI Strip under Hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 text-xs p-3 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="px-4 py-1.5">
            <span className="text-slate-500 dark:text-slate-400 block text-2xs uppercase tracking-wider">Attendance</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{currentStudent.attendanceRate}%</span>
          </div>
          <div className="px-4 py-1.5">
            <span className="text-slate-500 dark:text-slate-400 block text-2xs uppercase tracking-wider">Course Progress</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">{currentStudent.progressRate}% Completed</span>
          </div>
          <div className="px-4 py-1.5">
            <span className="text-slate-500 dark:text-slate-400 block text-2xs uppercase tracking-wider">Active Modules</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{courseModules.length} Modules</span>
          </div>
          <div className="px-4 py-1.5">
            <span className="text-slate-500 dark:text-slate-400 block text-2xs uppercase tracking-wider">Assignments</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
              {studentAssignments.filter((a) => a.status === 'Pending').length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => onTabChange('curriculum')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'curriculum'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Modules & Lectures</span>
        </button>

        <button
          onClick={() => onTabChange('assignments')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Assignments Tracker</span>
        </button>

        <button
          onClick={() => onTabChange('ai-tutor')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'ai-tutor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>AI Tutor & 4-Model Arena</span>
        </button>

        <button
          onClick={() => onTabChange('fees')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Fees & GST Receipt</span>
        </button>

        <button
          onClick={() => onTabChange('certificates')}
          className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Verified Certificates</span>
        </button>
      </div>

      {/* Tab 1: Curriculum & Modules */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentCourse.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lead Instructor: {currentCourse.instructor} · Duration: {currentCourse.duration}
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Course ID: {currentCourse.id}
            </div>
          </div>

          {/* Module List Cards */}
          <div className="space-y-4">
            {courseModules.map((mod) => (
              <div
                key={mod.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Module {mod.order}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {mod.durationHours} Hours Total
                      </span>
                      {mod.completed && (
                        <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {mod.title}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {mod.lessons.filter((l) => l.completed).length}/{mod.lessons.length} Lessons Finished
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 my-3 leading-relaxed">
                  {mod.description}
                </p>

                {/* Lesson rows */}
                <div className="space-y-2 mt-4">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    Syllabus Lessons & Interactive Labs:
                  </span>
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-slate-800 cursor-pointer border border-slate-200/60 dark:border-slate-700/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {lesson.title}
                          </div>
                          <div className="text-2xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{lesson.durationMinutes} mins</span>
                            <span>·</span>
                            <span className="capitalize">{lesson.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {lesson.completed ? (
                          <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Completed
                          </span>
                        ) : (
                          <span className="text-2xs text-slate-400">In Progress</span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resources */}
                {mod.resources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-2xs font-medium text-slate-400">Class Notes & Handouts:</span>
                    {mod.resources.map((res, i) => (
                      <span
                        key={i}
                        className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60 flex items-center gap-1 font-mono"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{res}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Assignments Tracker */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Coursework & Assignment Tracker
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Submit coding tasks, IELTS essays, and high school problem sheets for instructor evaluation.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              {(['all', 'Pending', 'Submitted', 'Graded'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAssignmentFilter(filter)}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                    assignmentFilter === filter
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {filter === 'all' ? 'All Tasks' : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((asg) => {
              const isPending = asg.status === 'Pending';
              const isGraded = asg.status === 'Graded';

              return (
                <div
                  key={asg.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-2xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {asg.courseTitle}
                      </span>
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-full font-medium ${
                          isGraded
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : isPending
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        }`}
                      >
                        {asg.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {asg.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {asg.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3 font-mono">
                      <span>Due: <strong className="text-slate-800 dark:text-slate-200">{asg.dueDate}</strong></span>
                      <span>Max Score: <strong>{asg.maxMarks} Marks</strong></span>
                    </div>

                    {/* Graded Remarks */}
                    {isGraded && asg.score !== undefined && (
                      <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs">
                        <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> Instructor Evaluation:
                          </span>
                          <span className="font-mono text-sm">{asg.score} / {asg.maxMarks}</span>
                        </div>
                        <p className="text-emerald-900 dark:text-emerald-200 text-2xs leading-relaxed">
                          "{asg.feedback}"
                        </p>
                      </div>
                    )}

                    {/* Rubric criteria */}
                    <div className="mt-3">
                      <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                        Grading Rubric:
                      </span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-2xs text-slate-500 dark:text-slate-400">
                        {asg.rubric.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Submission Action */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {asg.submittedDate ? (
                      <span className="text-2xs text-slate-400 font-mono">
                        Submitted on {asg.submittedDate}
                      </span>
                    ) : (
                      <span className="text-2xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Submission Open
                      </span>
                    )}

                    {isPending ? (
                      <button
                        onClick={() => setSubmittingAssignment(asg)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Submit Homework
                      </button>
                    ) : (
                      <button
                        onClick={() => setSubmittingAssignment(asg)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        View / Edit Submission
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: AI Tutor & Model Arena */}
      {activeTab === 'ai-tutor' && (
        <AiTutor
          currentStudent={currentStudent}
          onOpenInvoiceModal={() => onOpenInvoiceModal(studentInvoice)}
        />
      )}

      {/* Tab 4: Fees & Payment Receipts */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Tuition Fees & Official GST Invoices
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download your tax receipt for tuition fees, view bank transfer details, or generate payment records.
              </p>
            </div>

            <button
              onClick={() => onOpenInvoiceModal(studentInvoice)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>View & Print Official GST Invoice</span>
            </button>
          </div>

          {/* Fee Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Course Fee</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                ₹{currentStudent.feeTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-2xs text-slate-500 mt-1">Inclusive of 18% GST (CGST + SGST)</div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Amount Paid So Far</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{currentStudent.feePaid.toLocaleString('en-IN')}
              </div>
              <div className="text-2xs text-slate-500 mt-1">Confirmed with receipt on record</div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Outstanding Balance</span>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                ₹{currentStudent.feeDue.toLocaleString('en-IN')}
              </div>
              <div className="text-2xs text-slate-500 mt-1">
                {currentStudent.feeDue > 0 ? 'Pending payment' : 'No balance due 🎉'}
              </div>
            </div>
          </div>

          {/* Student Invoices List */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Registered Tax Invoices
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-2 px-3">Invoice No</th>
                    <th className="py-2 px-3">Course</th>
                    <th className="py-2 px-3">Issue Date</th>
                    <th className="py-2 px-3 text-right">Total Fee</th>
                    <th className="py-2 px-3 text-right">Paid</th>
                    <th className="py-2 px-3 text-right">Balance Due</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {studentInvoice.invoiceNo}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-700 dark:text-slate-300">
                      {studentInvoice.courseName}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {studentInvoice.issueDate}
                    </td>
                    <td className="py-3 px-3 text-right">
                      ₹{studentInvoice.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400">
                      ₹{studentInvoice.amountPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                      ₹{studentInvoice.balanceDue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-full font-medium ${
                          studentInvoice.balanceDue === 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {studentInvoice.balanceDue === 0 ? 'Paid' : 'Partial Due'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenInvoiceModal(studentInvoice)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-sans cursor-pointer font-medium"
                      >
                        View & Print
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Verified Certificates */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Institute Verified Academic Credentials</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Course Completion Certificates & Transcripts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tamper-evident verifiable completion documents with official seal, QR code, and director endorsement.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCertificates.map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-2xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      Verified & Active
                    </span>
                  </div>

                  <div>
                    <span className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
                      Cert No: {cert.certificateNo}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {cert.courseName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Track: {cert.track}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-2xs">
                    <div>
                      <span className="text-slate-400 block">Recipient Student:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{cert.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Performance Grade:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{cert.gradeScore}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Issued On:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{cert.issueDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Authorized Campus:</span>
                      <span className="text-slate-700 dark:text-slate-300">{cert.campusCity}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-2xs font-mono text-slate-400">
                    {cert.verificationCode}
                  </span>
                  <button
                    onClick={() => onOpenCertificateModal && onOpenCertificateModal(cert)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View & Print PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600" />
            <span>
              All SkillBridge certificates feature anti-forgery cryptographic checksums and can be instantly verified by employers, universities, and visa authorities by scanning the embedded QR code.
            </span>
          </div>
        </div>
      )}

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                  {selectedLesson.type} · {selectedLesson.durationMinutes} Minutes
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-white">Summary:</p>
              <p>{selectedLesson.contentSummary}</p>
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-medium">
                💡 Key Exam/Industry Takeaway: {selectedLesson.keyTakeaway}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedLesson(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                  Submit Assignment · Due: {submittingAssignment.dueDate}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {submittingAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Written Submission / Solution Notes / Essay Text:
                </label>
                <textarea
                  rows={5}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Paste your code explanation, mathematical steps, or IELTS essay paragraphs here..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Link (GitHub / Google Drive / CodePen - Optional):
                </label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://github.com/your-username/project-repo"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
