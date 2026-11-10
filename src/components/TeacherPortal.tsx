import React, { useState } from 'react';
import { Teacher, Batch, Student, Assignment, StudyMaterial, Announcement } from '../types';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  FileCheck2,
  Upload,
  PlusCircle,
  Award,
  Send,
  MessageSquare,
  Search,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface TeacherPortalProps {
  currentTeacher: Teacher;
  teachers: Teacher[];
  onSelectTeacher: (id: string) => void;
  batches: Batch[];
  students: Student[];
  assignments: Assignment[];
  studyMaterials: StudyMaterial[];
  onMarkAttendance: (
    batchId: string,
    batchName: string,
    date: string,
    records: Record<string, 'Present' | 'Absent' | 'Late'>,
    teacherName: string,
    notes?: string
  ) => void;
  onGradeAssignment: (assignmentId: string, score: number, feedback: string) => void;
  onCreateAssignment: (asg: any) => void;
  onAddStudyMaterial: (mat: any) => void;
  onAddAnnouncement: (ann: any) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  currentTeacher,
  teachers,
  onSelectTeacher,
  batches,
  students,
  assignments,
  studyMaterials,
  onMarkAttendance,
  onGradeAssignment,
  onCreateAssignment,
  onAddStudyMaterial,
  onAddAnnouncement,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'evaluations' | 'classes' | 'assignments' | 'materials'>('attendance');

  // Filter batches assigned to this teacher
  const assignedBatches = batches.filter(
    (b) => currentTeacher.assignedBatchIds.includes(b.id) || b.instructor.includes(currentTeacher.name.split(' ')[1] || '')
  );

  const selectedBatch = assignedBatches[0] || batches[0];
  const [activeBatchId, setActiveBatchId] = useState<string>(selectedBatch.id);

  const currentBatch = batches.find((b) => b.id === activeBatchId) || selectedBatch;

  // Students in currently selected batch
  const batchStudents = students.filter(
    (s) => s.batchId === currentBatch.id || s.courseId === currentBatch.courseId
  );

  // --- Attendance State ---
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>(() => {
    const initial: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    batchStudents.forEach((s) => {
      initial[s.id] = 'Present';
    });
    return initial;
  });
  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);

  // --- Grading Modal State ---
  const [evaluatingAssignment, setEvaluatingAssignment] = useState<Assignment | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(45);
  const [gradeFeedback, setGradeFeedback] = useState('Excellent practical solution, verified test cases.');

  // --- New Assignment Modal State ---
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgDesc, setNewAsgDesc] = useState('');
  const [newAsgMaxMarks, setNewAsgMaxMarks] = useState(50);
  const [newAsgDueDate, setNewAsgDueDate] = useState('20 Nov 2026');

  // --- New Material Modal State ---
  const [showUploadMaterialModal, setShowUploadMaterialModal] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState<StudyMaterial['category']>('Lecture Notes');

  const handleRecordAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    onMarkAttendance(
      currentBatch.id,
      currentBatch.name,
      attendanceDate,
      attendanceRecords,
      currentTeacher.name,
      attendanceNotes
    );
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 2500);
  };

  const handleQuickMarkAll = (status: 'Present' | 'Absent' | 'Late') => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    batchStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingAssignment) return;
    onGradeAssignment(evaluatingAssignment.id, gradeScore, gradeFeedback);
    setEvaluatingAssignment(null);
  };

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAssignment({
      courseId: currentBatch.courseId,
      courseTitle: currentBatch.courseTitle,
      batchId: currentBatch.id,
      title: newAsgTitle,
      description: newAsgDesc,
      dueDate: newAsgDueDate,
      maxMarks: Number(newAsgMaxMarks),
      rubric: [
        'Core concept accuracy & structure (40%)',
        'Problem solving / code execution (40%)',
        'Code cleanliness & presentation (20%)',
      ],
    });
    setShowCreateAssignmentModal(false);
    setNewAsgTitle('');
    setNewAsgDesc('');
  };

  const handleUploadMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudyMaterial({
      title: matTitle,
      batchId: currentBatch.id,
      batchName: currentBatch.name,
      teacherName: currentTeacher.name,
      category: matCategory,
      fileSize: '3.8 MB',
    });
    setShowUploadMaterialModal(false);
    setMatTitle('');
  };

  // Filter assignments relevant to this teacher's courses
  const teacherAssignments = assignments.filter((a) =>
    assignedBatches.some((b) => b.courseId === a.courseId || b.id === a.batchId)
  );

  return (
    <div className="space-y-8">
      
      {/* Teacher Profile & Fast Actions Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <BookOpen className="w-4 h-4" />
            <span>Faculty & Academic Staff Desk · Bathinda Campus</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Teacher Portal · {currentTeacher.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentTeacher.designation} · {currentTeacher.department} · {currentTeacher.qualification}
          </p>
        </div>

        {/* Switch Instructor & Fast Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-2xs font-semibold text-slate-400 uppercase">Faculty Member:</span>
            <select
              value={currentTeacher.id}
              onChange={(e) => onSelectTeacher(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer text-xs"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id} className="dark:bg-slate-800">
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCreateAssignmentModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Assignment</span>
          </button>
        </div>
      </div>

      {/* Teacher Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'attendance', label: 'Roll-Call Attendance' },
          { id: 'evaluations', label: 'Evaluate Submissions' },
          { id: 'classes', label: 'Assigned Cohorts & Timetable' },
          { id: 'assignments', label: 'Coursework & Tests' },
          { id: 'materials', label: 'Study Materials & Handouts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Interactive Daily Roll-Call Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          
          {/* Batch Selector & Quick Actions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Select Cohort:
                </label>
                <select
                  value={activeBatchId}
                  onChange={(e) => setActiveBatchId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {assignedBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.timing})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Attendance Date:
                </label>
                <input
                  type="text"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xs text-slate-400 font-medium">Quick Roll Call:</span>
              <button
                type="button"
                onClick={() => handleQuickMarkAll('Present')}
                className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md hover:bg-emerald-100"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleQuickMarkAll('Absent')}
                className="px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Toast on Attendance Saved */}
          {attendanceSavedToast && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Roll-call saved successfully! Live student and parent attendance records updated.</span>
            </div>
          )}

          {/* Roll-Call Roster Form */}
          <form onSubmit={handleRecordAttendance} className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                <span>Student Roster ({batchStudents.length} Students Enrolled)</span>
                <span>Mark Attendance Status</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {batchStudents.map((stu) => {
                  const currentStatus = attendanceRecords[stu.id] || 'Present';
                  const isAbsent = currentStatus === 'Absent';

                  return (
                    <div
                      key={stu.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {stu.name}
                          </span>
                          <span className="text-2xs font-mono text-slate-400">
                            {stu.rollNo}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Parent Contact: <span className="font-mono">{stu.parentPhone}</span> · Past Attendance: {stu.attendanceRate}%
                        </div>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAttendanceRecords((prev) => ({ ...prev, [stu.id]: 'Present' }))}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAttendanceRecords((prev) => ({ ...prev, [stu.id]: 'Late' }))}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                            currentStatus === 'Late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAttendanceRecords((prev) => ({ ...prev, [stu.id]: 'Absent' }))}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                            currentStatus === 'Absent'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        {/* WhatsApp Parent Alert Button if Absent */}
                        {isAbsent && (
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `🏛️ SkillBridge Bathinda - Attendance Notice: Dear Parent of ${stu.name} (${stu.rollNo}), your child was marked ABSENT today (${attendanceDate}) from ${currentBatch.name}. Kindly verify with institute administration at +91 98882 45120.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 px-2.5 py-1 text-2xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 transition-colors"
                          >
                            Notify Parent
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance Notes & Submit */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <input
                type="text"
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                placeholder="Topic covered or lab notes (e.g. React 19 Action forms and hooks)..."
                className="flex-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Save Daily Roll-Call & Sync Portals
              </button>
            </div>
          </form>

        </div>
      )}

      {/* Tab 2: Evaluate Student Submissions */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Assignment Evaluation & Grading Desk
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review code snippets, essay paragraphs, and problem sets submitted by enrolled students.
              </p>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Pending Evaluation: {teacherAssignments.filter((a) => a.status === 'Submitted').length} Tasks
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {teacherAssignments.map((asg) => {
              const isSubmitted = asg.status === 'Submitted';
              const isGraded = asg.status === 'Graded';

              return (
                <div
                  key={asg.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-2xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                        {asg.courseTitle} · Due: {asg.dueDate}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {asg.title}
                      </h3>
                    </div>

                    <span
                      className={`text-2xs px-2.5 py-1 rounded-full font-semibold ${
                        isGraded
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : isSubmitted
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {asg.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 my-3 leading-relaxed">
                    {asg.description}
                  </p>

                  {/* Student Submission Content */}
                  {asg.submissionText && (
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <div className="text-2xs font-bold uppercase text-slate-400 mb-1">
                        Student Submission Content (Submitted: {asg.submittedDate}):
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-mono text-2xs leading-relaxed">
                        {asg.submissionText}
                      </p>
                      {asg.submissionLink && (
                        <div className="mt-2">
                          <a
                            href={asg.submissionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-2xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{asg.submissionLink}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Graded Remarks Preview */}
                  {isGraded && asg.score !== undefined && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">
                          Marks Awarded: {asg.score} / {asg.maxMarks}
                        </span>
                        <p className="text-emerald-900 dark:text-emerald-200 text-2xs mt-0.5">
                          "{asg.feedback}"
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEvaluatingAssignment(asg);
                          setGradeScore(asg.score || 45);
                          setGradeFeedback(asg.feedback || '');
                        }}
                        className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline font-semibold"
                      >
                        Edit Grade
                      </button>
                    </div>
                  )}

                  {/* Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        setEvaluatingAssignment(asg);
                        setGradeScore(asg.score || 45);
                        setGradeFeedback(asg.feedback || 'Great implementation of core concepts.');
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{isGraded ? 'Update Evaluation' : 'Evaluate & Award Marks'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Assigned Cohorts & Timetable */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Assigned Batches & Weekly Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedBatches.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
              >
                <span className="text-2xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                  {b.courseTitle}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {b.name}
                </h3>

                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1 text-slate-600 dark:text-slate-400 font-mono">
                  <div>Timing: <span className="text-slate-900 dark:text-white font-medium">{b.timing}</span></div>
                  <div>Days: {b.days}</div>
                  <div>Classroom: {b.classroom}</div>
                  <div>Capacity: {b.filledSeats} / {b.totalSeats} Students Enrolled</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Commenced: {b.startDate}</span>
                  <button
                    onClick={() => {
                      setActiveBatchId(b.id);
                      setActiveTab('attendance');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Open Roll-Call →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Coursework & Tests */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Course Assignments & Test Bank
            </h2>
            <button
              onClick={() => setShowCreateAssignmentModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Assignment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherAssignments.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                      {a.courseTitle}
                    </span>
                    <span className="text-2xs font-mono text-slate-400">Max: {a.maxMarks} Marks</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    {a.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-2xs text-slate-400 flex justify-between items-center">
                  <span>Due: {a.dueDate}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Status: {a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Study Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Study Materials, Notes & Repositories
            </h2>
            <button
              onClick={() => setShowUploadMaterialModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>+ Upload Handout</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyMaterials.map((mat) => (
              <div
                key={mat.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-2xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                    {mat.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {mat.title}
                  </h4>
                  <div className="text-2xs text-slate-500 mt-0.5 font-mono">
                    {mat.batchName} · By {mat.teacherName} · {mat.fileSize}
                  </div>
                </div>

                <button
                  onClick={() => alert(`Simulated download for: ${mat.title}`)}
                  className="px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-medium cursor-pointer"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluate Assignment Modal */}
      {evaluatingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-2xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                  Grade Student Submission · Max: {evaluatingAssignment.maxMarks} Marks
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {evaluatingAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setEvaluatingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Marks Awarded (out of {evaluatingAssignment.maxMarks}):
                </label>
                <input
                  type="number"
                  min="0"
                  max={evaluatingAssignment.maxMarks}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pedagogical Feedback Remarks (Visible to Student & Parent):
                </label>
                <textarea
                  rows={4}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEvaluatingAssignment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Save Grade & Publish Remarks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Assignment for {currentBatch.name}
              </h3>
              <button
                onClick={() => setShowCreateAssignmentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignmentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                  placeholder="e.g. Build JWT Authentication Middleware"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Task Requirements *
                </label>
                <textarea
                  rows={3}
                  value={newAsgDesc}
                  onChange={(e) => setNewAsgDesc(e.target.value)}
                  placeholder="Explain requirements, test criteria, and submission format..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    value={newAsgMaxMarks}
                    onChange={(e) => setNewAsgMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Submission Due Date
                  </label>
                  <input
                    type="text"
                    value={newAsgDueDate}
                    onChange={(e) => setNewAsgDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignmentModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Publish to Student Portals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {showUploadMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Study Handout
            </h3>

            <form onSubmit={handleUploadMaterialSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document / Material Title *
                </label>
                <input
                  type="text"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="e.g. React 19 State Reducer Cheatsheet.pdf"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={matCategory}
                  onChange={(e) => setMatCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="Lecture Notes">Lecture Notes</option>
                  <option value="Sample Paper">Sample Paper</option>
                  <option value="Code Repository">Code Repository</option>
                  <option value="Formula Sheet">Formula Sheet</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadMaterialModal(false)}
                  className="px-3.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Upload & Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
