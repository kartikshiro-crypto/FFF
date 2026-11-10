import React from 'react';
import { Parent, Student, Assignment, Announcement, Invoice, AttendanceRecord } from '../types';
import { INSTITUTE_DETAILS } from '../data/seedData';
import {
  Heart,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileText,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  MapPin,
  Calendar,
} from 'lucide-react';

interface ParentPortalProps {
  currentParent: Parent;
  parents: Parent[];
  onSelectParent: (id: string) => void;
  linkedChild: Student;
  assignments: Assignment[];
  announcements: Announcement[];
  invoices: Invoice[];
  attendance: AttendanceRecord[];
  onOpenInvoiceModal: (invoice: Invoice) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  currentParent,
  parents,
  onSelectParent,
  linkedChild,
  assignments,
  announcements,
  invoices,
  attendance,
  onOpenInvoiceModal,
}) => {
  // Strict Privacy: Only filter records belonging to the linked child
  const childAssignments = assignments.filter(
    (a) => a.studentId === linkedChild.id || a.courseId === linkedChild.courseId
  );

  const childInvoice =
    invoices.find((inv) => inv.studentId === linkedChild.id) || invoices[0];

  const childAttendanceLogs = attendance.filter(
    (att) => att.batchId === linkedChild.batchId && att.records[linkedChild.id]
  );

  const isAttendanceWarning = linkedChild.attendanceRate < 85;

  return (
    <div className="space-y-8">
      
      {/* Parent Welcome & Linked Child Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Parent Portal · Linked Child Confidentiality</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Sat Sri Akaal, {currentParent.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring: <strong className="text-slate-900 dark:text-white">{linkedChild.name}</strong> ({currentParent.relationship}) · Roll No: <span className="font-mono">{linkedChild.rollNo}</span>
          </p>
        </div>

        {/* Switch Demo Parent */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-2xs font-semibold text-slate-400 uppercase">Parent Account:</span>
            <select
              value={currentParent.id}
              onChange={(e) => onSelectParent(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer text-xs"
            >
              {parents.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-slate-800">
                  {p.name} ({p.relationship} of {p.linkedStudentName})
                </option>
              ))}
            </select>
          </div>

          <a
            href={`https://wa.me/${INSTITUTE_DETAILS.whatsappNumber}?text=${encodeURIComponent(
              `Hello SkillBridge Administration, I am ${currentParent.name}, ${currentParent.relationship} of ${linkedChild.name} (Roll: ${linkedChild.rollNo}). I have a query regarding my child's progress.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Contact Institute Office</span>
          </a>
        </div>
      </div>

      {/* Child Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Attendance Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
            Live Attendance Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono ${
                isAttendanceWarning ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {linkedChild.attendanceRate}%
            </span>
            <span className="text-2xs text-slate-400">
              {isAttendanceWarning ? 'Below 85% requirement' : 'Regular Attendance'}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isAttendanceWarning ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${linkedChild.attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Course Program */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
            Enrolled Course
          </span>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
            {linkedChild.courseTitle}
          </div>
          <div className="text-2xs text-slate-500 mt-1 font-mono">
            Cohort: {linkedChild.batchName}
          </div>
        </div>

        {/* Academic Progress */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
            Syllabus Completed
          </span>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {linkedChild.progressRate}%
          </div>
          <div className="text-2xs text-slate-500 mt-1">
            Enrolled: {linkedChild.enrolledDate}
          </div>
        </div>

        {/* Fee Status Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
            Fee Balance
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            ₹{linkedChild.feeDue.toLocaleString('en-IN')}
          </div>
          <div className="text-2xs text-slate-500 mt-1 flex justify-between items-center">
            <span>Paid: ₹{linkedChild.feePaid.toLocaleString('en-IN')}</span>
            <button
              onClick={() => onOpenInvoiceModal(childInvoice)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Tax Receipt →
            </button>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Teacher Feedback & Roll-Call Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Academic Progress & Instructor Feedback */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Teacher Academic Remarks & Homework Marks</span>
            </h3>
            <span className="text-2xs text-slate-400 font-mono">
              Evaluated by Course HOD
            </span>
          </div>

          <div className="space-y-3">
            {childAssignments.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {asg.title}
                  </span>
                  <span
                    className={`text-2xs px-2 py-0.5 rounded-full font-semibold ${
                      asg.status === 'Graded'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    }`}
                  >
                    {asg.status}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-2xs leading-relaxed">
                  {asg.description}
                </p>

                {asg.status === 'Graded' && asg.score !== undefined && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                    <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-200 text-xs mb-1">
                      <span>Teacher Score:</span>
                      <span className="font-mono text-sm">{asg.score} / {asg.maxMarks} Marks</span>
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-300 text-2xs italic">
                      "{asg.feedback}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Roll-Call History */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Daily Roll-Call & Class Attendance Log</span>
            </h3>
            <span className="text-2xs text-slate-400 font-mono">
              Recorded by Faculty
            </span>
          </div>

          <div className="space-y-2.5">
            {childAttendanceLogs.length > 0 ? (
              childAttendanceLogs.map((log) => {
                const status = log.records[linkedChild.id] || 'Present';
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.date}
                      </div>
                      <div className="text-2xs text-slate-500 font-mono">
                        {log.batchName} · Marked by {log.markedByTeacherName}
                      </div>
                      {log.notes && (
                        <div className="text-2xs text-slate-400 italic mt-0.5">
                          Topic: {log.notes}
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-2xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : status === 'Late'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500">
                Regular attendance recorded. Overall rate is {linkedChild.attendanceRate}%.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Tuition Fees & GST Invoicing Desk for Parents */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Official Tuition Fee Ledger & GST Tax Invoices</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified tax receipts for your child's education expenses under Punjab GST Act, 2017.
            </p>
          </div>

          <button
            onClick={() => onOpenInvoiceModal(childInvoice)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Download Official GST Invoice (PDF)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-2xs uppercase text-slate-400 font-semibold">Total Fee Payable</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              ₹{childInvoice.totalAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-2xs text-slate-500 mt-0.5">Inclusive of 18% GST (SAC 999293)</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="text-2xs uppercase text-emerald-700 dark:text-emerald-400 font-semibold">Amount Paid</span>
            <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
              ₹{childInvoice.amountPaid.toLocaleString('en-IN')}
            </div>
            <div className="text-2xs text-emerald-600/80 mt-0.5">Payment confirmed with receipt</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60">
            <span className="text-2xs uppercase text-amber-700 dark:text-amber-400 font-semibold">Balance Due</span>
            <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">
              ₹{childInvoice.balanceDue.toLocaleString('en-IN')}
            </div>
            <div className="text-2xs text-amber-600/80 mt-0.5 font-mono">
              Due Date: {childInvoice.dueDate}
            </div>
          </div>
        </div>
      </div>

      {/* Authorized Announcements Notice Board */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Official Institute Bulletins & Parent Notices</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-semibold">
                    {ann.category}
                  </span>
                  <span className="text-2xs text-slate-400 font-mono">{ann.createdAt}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {ann.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-2xs mt-1.5 leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-2xs text-slate-400 flex justify-between items-center">
                <span>By: {ann.author}</span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(ann.whatsappFormattedText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Send className="w-3 h-3" />
                  <span>Share</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
