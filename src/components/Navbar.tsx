import React from 'react';
import {
  Moon,
  Sun,
  Shield,
  GraduationCap,
  BookOpen,
  Heart,
  UserCheck,
} from 'lucide-react';
import { Student, Teacher, Parent } from '../types';

interface NavbarProps {
  currentView: 'admin' | 'teacher' | 'student' | 'parent';
  onViewChange: (view: 'admin' | 'teacher' | 'student' | 'parent') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  students: Student[];
  currentStudent: Student;
  onSelectStudent: (id: string) => void;
  teachers: Teacher[];
  currentTeacher: Teacher;
  onSelectTeacher: (id: string) => void;
  parents: Parent[];
  currentParent: Parent;
  onSelectParent: (id: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  activeTab,
  onTabChange,
  students,
  currentStudent,
  onSelectStudent,
  teachers,
  currentTeacher,
  onSelectTeacher,
  parents,
  currentParent,
  onSelectParent,
  darkMode,
  onToggleDarkMode,
}) => {
  // Navigation tabs per portal
  const adminNav = [
    { id: 'overview', label: 'Overview' },
    { id: 'financials', label: 'Financial Overview' },
    { id: 'seats', label: 'Seat Inventory' },
    { id: 'students', label: 'Students Roster' },
    { id: 'staff', label: 'Teachers & Staff' },
    { id: 'broadcasts', label: 'Broadcasts' },
    { id: 'billing', label: 'GST Invoices' },
    { id: 'customize', label: 'Customizer' },
    { id: 'pricing', label: 'Institute Plans' },
  ];

  const teacherNav = [
    { id: 'attendance', label: 'Daily Roll-Call' },
    { id: 'batches', label: 'Assigned Batches' },
    { id: 'grading', label: 'Grade Submissions' },
    { id: 'materials', label: 'Study Handouts' },
    { id: 'announcements', label: 'Notices' },
  ];

  const studentNav = [
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'ai-tutor', label: 'AI Tutor & Arena' },
    { id: 'fees', label: 'Fees & Invoices' },
    { id: 'certificates', label: 'Verified Certificates' },
  ];

  const parentNav = [
    { id: 'overview', label: 'Child Overview' },
    { id: 'attendance', label: 'Attendance Records' },
    { id: 'academics', label: 'Homework & Marks' },
    { id: 'fees', label: 'Fee Dues & Receipts' },
    { id: 'announcements', label: 'Announcements' },
  ];

  const currentNav =
    currentView === 'admin'
      ? adminNav
      : currentView === 'teacher'
      ? teacherNav
      : currentView === 'student'
      ? studentNav
      : parentNav;

  const roles = [
    { id: 'admin', label: 'Admin', icon: Shield, defaultTab: 'overview' },
    { id: 'teacher', label: 'Teacher', icon: GraduationCap, defaultTab: 'attendance' },
    { id: 'student', label: 'Student', icon: BookOpen, defaultTab: 'curriculum' },
    { id: 'parent', label: 'Parent', icon: Heart, defaultTab: 'overview' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                const activeRoleObj = roles.find((r) => r.id === currentView) || roles[0];
                onTabChange(activeRoleObj.defaultTab);
              }}
              className="text-left group cursor-pointer focus:outline-hidden"
            >
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                SkillBridge <span className="text-blue-600 dark:text-blue-400">Bathinda</span>
              </span>
            </button>
          </div>

          {/* Zone 2: 4-Portal Role Switcher (Admin / Teacher / Student / Parent) */}
          <div className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = currentView === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    onViewChange(r.id);
                    onTabChange(r.defaultTab);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label} Portal</span>
                </button>
              );
            })}
          </div>

          {/* Zone 3: Persona Selector & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Persona Switcher based on current role */}
            {currentView === 'teacher' && teachers.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="hidden sm:inline text-2xs uppercase tracking-wider text-slate-400">Faculty:</span>
                <select
                  value={currentTeacher.id}
                  onChange={(e) => onSelectTeacher(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer text-xs max-w-[130px] sm:max-w-none truncate"
                  aria-label="Select Demo Teacher"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id} className="dark:bg-slate-800">
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentView === 'student' && students.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="hidden sm:inline text-2xs uppercase tracking-wider text-slate-400">Student:</span>
                <select
                  value={currentStudent.id}
                  onChange={(e) => onSelectStudent(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer text-xs max-w-[130px] sm:max-w-none truncate"
                  aria-label="Select Demo Student"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="dark:bg-slate-800">
                      {s.name} ({s.feeDue > 0 ? `₹${s.feeDue.toLocaleString('en-IN')} Due` : 'Paid'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentView === 'parent' && parents.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="hidden sm:inline text-2xs uppercase tracking-wider text-slate-400">Parent:</span>
                <select
                  value={currentParent.id}
                  onChange={(e) => onSelectParent(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer text-xs max-w-[130px] sm:max-w-none truncate"
                  aria-label="Select Demo Parent"
                >
                  {parents.map((p) => (
                    <option key={p.id} value={p.id} className="dark:bg-slate-800">
                      {p.name} (Child: {p.linkedStudentName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentView === 'admin' && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Director Desk (Admin)</span>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Small Screen Role Dropdown */}
            <div className="lg:hidden">
              <select
                value={currentView}
                onChange={(e) => {
                  const role = e.target.value as 'admin' | 'teacher' | 'student' | 'parent';
                  const roleObj = roles.find((r) => r.id === role) || roles[0];
                  onViewChange(role);
                  onTabChange(roleObj.defaultTab);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg focus:outline-hidden cursor-pointer"
                aria-label="Switch Portal"
              >
                <option value="admin" className="text-slate-900 dark:text-white dark:bg-slate-800">Admin Portal</option>
                <option value="teacher" className="text-slate-900 dark:text-white dark:bg-slate-800">Teacher Portal</option>
                <option value="student" className="text-slate-900 dark:text-white dark:bg-slate-800">Student Portal</option>
                <option value="parent" className="text-slate-900 dark:text-white dark:bg-slate-800">Parent Portal</option>
              </select>
            </div>

          </div>

        </div>

        {/* Sub-Navigation Row (Tabs for current portal) */}
        <div className="flex items-center gap-6 py-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800 text-xs font-medium no-scrollbar">
          {currentNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
