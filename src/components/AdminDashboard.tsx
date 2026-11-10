import React, { useState } from 'react';
import { Student, Course, Batch, Announcement, Invoice } from '../types';
import {
  Users,
  Armchair,
  Megaphone,
  CreditCard,
  UserPlus,
  Send,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  PlusCircle,
  Edit2,
  Sparkles,
  Phone,
  Settings,
  GraduationCap,
} from 'lucide-react';
import { Teacher } from '../types';
import { FinancialOverview } from './FinancialOverview';

interface AdminDashboardProps {
  students: Student[];
  teachers: Teacher[];
  batches: Batch[];
  courses: Course[];
  announcements: Announcement[];
  invoices: Invoice[];
  institute: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddStudent: (studentData: any) => void;
  onAddTeacher: (teacherData: any) => void;
  onAddAnnouncement: (announcementData: any) => void;
  onUpdateBatchCapacity: (batchId: string, newTotalSeats: number) => void;
  onOpenInvoiceModal: (invoice: Invoice) => void;
  onUpdateInstitute: (details: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  teachers = [],
  batches,
  courses,
  announcements,
  invoices,
  institute,
  activeTab,
  onTabChange,
  onAddStudent,
  onAddTeacher,
  onAddAnnouncement,
  onUpdateBatchCapacity,
  onOpenInvoiceModal,
  onUpdateInstitute,
}) => {
  // Aggregate KPIs
  const totalStudents = students.length;
  const totalCapacity = batches.reduce((sum, b) => sum + b.totalSeats, 0);
  const totalFilled = batches.reduce((sum, b) => sum + b.filledSeats, 0);
  const totalSeatsLeft = Math.max(0, totalCapacity - totalFilled);
  const occupancyPercentage = Math.round((totalFilled / (totalCapacity || 1)) * 100);

  const totalTuitionRevenue = students.reduce((sum, s) => sum + s.feeTotal, 0);
  const totalFeesCollected = students.reduce((sum, s) => sum + s.feePaid, 0);
  const totalFeesDue = students.reduce((sum, s) => sum + s.feeDue, 0);
  const studentsWithDue = students.filter((s) => s.feeDue > 0).length;

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFeeFilter, setStudentFeeFilter] = useState<'all' | 'due' | 'paid'>('all');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');

  // Platform Subscription Plans (SkillBridge SaaS for Institute Owners)
  const PLAN_TIERS = [
    {
      id: 'basic',
      name: 'Basic',
      tagline: 'Entry level',
      price: 399,
      period: '/month',
      maxStudents: 25,
      isBestValue: false,
      features: [
        'Up to 25 students',
        'Student management',
        'Course and module tracking',
        'Assignment tracking',
        'Announcements',
        'Basic admin dashboard',
      ],
    },
    {
      id: 'standard',
      name: 'Standard',
      tagline: 'Best value',
      price: 799,
      period: '/month',
      maxStudents: 75,
      isBestValue: true,
      features: [
        'Up to 75 students',
        'Everything in Basic',
        'Fee management',
        'Invoice generator',
        'AI chatbot with monthly credits',
        'Performance analytics',
        'Fee reminders',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      tagline: 'Full experience',
      price: 1199,
      period: '/month',
      maxStudents: 150,
      isBestValue: false,
      features: [
        'Up to 150 students',
        'Everything in Standard',
        'Multiple teacher accounts',
        'Advanced analytics',
        'Higher AI credit allocation',
        'Custom branding',
        'Priority support',
      ],
    },
  ];

  const [currentPlanId, setCurrentPlanId] = useState<string>(() => {
    return localStorage.getItem('sb_institute_plan_id') || 'standard';
  });
  const [planChangeToast, setPlanChangeToast] = useState<string | null>(null);
  const [showSubscriptionInvoice, setShowSubscriptionInvoice] = useState(false);

  const activePlan = PLAN_TIERS.find((p) => p.id === currentPlanId) || PLAN_TIERS[1];

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [copiedAnnId, setCopiedAnnId] = useState<string | null>(null);

  // New Teacher Form State
  const [tchName, setTchName] = useState('');
  const [tchEmail, setTchEmail] = useState('');
  const [tchPhone, setTchPhone] = useState('+91 98');
  const [tchDesignation, setTchDesignation] = useState('Senior Faculty Specialist');
  const [tchQual, setTchQual] = useState('M.Tech / M.Sc B.Ed');
  const [tchDept, setTchDept] = useState<'Tech & Coding' | 'IELTS & Languages' | 'Senior Secondary STEM'>('Tech & Coding');
  const [tchSalary, setTchSalary] = useState(65000);
  const [tchBatchId, setTchBatchId] = useState(batches[0]?.id || '');

  // Institute Customizer State
  const [instName, setInstName] = useState(institute?.name || 'SkillBridge Institute of Technology & Academics');
  const [instTagline, setInstTagline] = useState(institute?.tagline || 'Bathinda’s Premier Hybrid Tech & Academic Learning Center');
  const [instAddress, setInstAddress] = useState(institute?.address || 'SCF 24-25, 2nd Floor, Ajit Road Coaching Complex, Near Ghorewala Chowk');
  const [instPhone, setInstPhone] = useState(institute?.phone || '+91 98882 45120');
  const [instUpi, setInstUpi] = useState(institute?.bankDetails?.upiId || 'skillbridge.bathinda@hdfcbank');
  const [instDirector, setInstDirector] = useState(institute?.director || 'Er. Gurpreet Singh Brar (M.Tech, Ex-NIT)');
  const [instSavedToast, setInstSavedToast] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newRollNo, setNewRollNo] = useState(`SB-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+91 98');
  const [newParentPhone, setNewParentPhone] = useState('+91 98');
  const [newAddress, setNewAddress] = useState('Model Town, Bathinda');
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newBatchId, setNewBatchId] = useState(batches[0]?.id || '');
  const [newTotalFee, setNewTotalFee] = useState<number>(35000);
  const [newPaidFee, setNewPaidFee] = useState<number>(20000);

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<Announcement['category']>('Urgent Alert');
  const [annTargetBatch, setAnnTargetBatch] = useState('All Batches');

  const filteredStudents = students.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.courseTitle.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.phone.includes(studentSearch);

    const matchesFee =
      studentFeeFilter === 'all'
        ? true
        : studentFeeFilter === 'due'
        ? s.feeDue > 0
        : s.feeDue === 0;

    const matchesBatch =
      selectedBatchFilter === 'all' ? true : s.batchId === selectedBatchFilter;

    return matchesQuery && matchesFee && matchesBatch;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const courseObj = courses.find((c) => c.id === newCourseId) || courses[0];
    const batchObj = batches.find((b) => b.id === newBatchId) || batches[0];

    const feeTotalNum = Number(newTotalFee) || courseObj.fee;
    const feePaidNum = Math.min(feeTotalNum, Number(newPaidFee) || 0);
    const feeDueNum = Math.max(0, feeTotalNum - feePaidNum);

    onAddStudent({
      name: newName,
      rollNo: newRollNo,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: newPhone,
      parentPhone: newParentPhone,
      address: newAddress,
      courseId: courseObj.id,
      courseTitle: courseObj.title,
      batchId: batchObj.id,
      batchName: batchObj.name,
      feeTotal: feeTotalNum,
      feePaid: feePaidNum,
      feeDue: feeDueNum,
    });

    setShowAddStudentModal(false);
    // Reset Form
    setNewName('');
    setNewRollNo(`SB-2026-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    onAddAnnouncement({
      title: annTitle,
      content: annContent,
      category: annCategory,
      targetBatch: annTargetBatch,
      author: 'Institute Admin Desk',
    });

    setAnnTitle('');
    setAnnContent('');
    setShowAddAnnouncementModal(false);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tchName.trim()) return;

    onAddTeacher({
      name: tchName,
      email: tchEmail || `${tchName.toLowerCase().replace(/\s+/g, '.')}@skillbridge.edu`,
      phone: tchPhone,
      designation: tchDesignation,
      qualification: tchQual,
      department: tchDept,
      assignedBatchIds: tchBatchId ? [tchBatchId] : [batches[0]?.id || ''],
      rating: 4.9,
      activeBatchesCount: 1,
      totalStudents: 25,
      salary: Number(tchSalary) || 60000,
    });

    setTchName('');
    setTchEmail('');
    setShowAddTeacherModal(false);
  };

  const handleCopyWhatsApp = (ann: Announcement) => {
    navigator.clipboard.writeText(ann.whatsappFormattedText);
    setCopiedAnnId(ann.id);
    setTimeout(() => setCopiedAnnId(null), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Admin Header with Institute Location & Fast Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Building className="w-4 h-4" />
            <span>SkillBridge Administrative Headquarters · Ajit Road Coaching Complex, Bathinda</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Institute Management & WhatsApp Replacement Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time batch seat monitoring, direct student admissions, instant broadcast announcements, and GST invoicing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Platform Subscription Badge */}
          <button
            onClick={() => onTabChange('pricing')}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
            title="View Platform Subscription & Pricing"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>
              Plan: <strong>{activePlan.name}</strong> (₹{activePlan.price}/mo)
            </span>
            <span className="text-2xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {totalStudents}/{activePlan.maxStudents} students
            </span>
          </button>

          <button
            onClick={() => setShowAddStudentModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Student Admission</span>
          </button>

          <button
            onClick={() => setShowAddAnnouncementModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Megaphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>+ Broadcast Announcement</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Seat Inventory Metric */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Seats Left</span>
            <Armchair className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalSeatsLeft}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">
              of {totalCapacity} available
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                occupancyPercentage > 85 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-2xs text-slate-500 mt-1.5 font-mono">
            <span>Occupancy: {occupancyPercentage}%</span>
            <span>{totalFilled} Enrolled</span>
          </div>
        </div>

        {/* Total Students Metric */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Active Students</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalStudents}
          </div>
          <div className="text-2xs text-slate-500 mt-3 flex items-center gap-1">
            <span>Across 8 Live Batches in Bathinda</span>
          </div>
        </div>

        {/* Fees Collected Metric */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Tuition Collected</span>
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{totalFeesCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-2xs text-slate-500 mt-3 font-mono">
            Total Ledger: ₹{totalTuitionRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Outstanding Dues Metric */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Outstanding Dues</span>
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            ₹{totalFeesDue.toLocaleString('en-IN')}
          </div>
          <div className="text-2xs text-slate-500 mt-3 flex items-center justify-between">
            <span>{studentsWithDue} students with dues</span>
            <button
              onClick={() => {
                onTabChange('billing');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Collect →
            </button>
          </div>
        </div>

      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Analytics' },
          { id: 'financials', label: 'Financial Overview & Charts' },
          { id: 'seats', label: 'Seat Inventory & Batches' },
          { id: 'students', label: 'Student Admissions Roster' },
          { id: 'staff', label: 'Teachers & Staff' },
          { id: 'broadcasts', label: 'Broadcasts (WhatsApp)' },
          { id: 'billing', label: 'GST Invoices & Fee Ledger' },
          { id: 'customize', label: 'Institute Customizer' },
          { id: 'pricing', label: 'Platform Plans & Pricing' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Quick Batch Health */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Batch Seat Capacities
                </h3>
                <button
                  onClick={() => onTabChange('seats')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Manage All Batches →
                </button>
              </div>

              <div className="space-y-3.5">
                {batches.slice(0, 5).map((b) => {
                  const seatsLeft = b.totalSeats - b.filledSeats;
                  const isAlmostFull = seatsLeft <= 3 && seatsLeft > 0;
                  const isFull = seatsLeft === 0;

                  return (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {b.name}
                        </span>
                        <span
                          className={`font-mono text-2xs px-2 py-0.5 rounded-full font-medium ${
                            isFull
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                              : isAlmostFull
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}
                        >
                          {isFull ? 'Sold Out' : `${seatsLeft} Seats Left`}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isFull ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${(b.filledSeats / b.totalSeats) * 100}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-2xs text-slate-400">
                        <span>{b.timing}</span>
                        <span>{b.filledSeats} / {b.totalSeats} Enrolled</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Broadcasts */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Broadcasts Replacing WhatsApp Groups
                  </h3>
                  <button
                    onClick={() => setShowAddAnnouncementModal(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    + New Notice
                  </button>
                </div>

                <div className="space-y-3">
                  {announcements.slice(0, 3).map((ann) => (
                    <div
                      key={ann.id}
                      className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {ann.title}
                        </span>
                        <span className="text-2xs text-slate-400 shrink-0 font-mono">
                          {ann.createdAt}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-2xs line-clamp-2">
                        {ann.content}
                      </p>
                      <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-2xs">
                        <span className="text-slate-500">Target: {ann.targetBatch}</span>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(ann.whatsappFormattedText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch to WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button
                  onClick={() => onTabChange('broadcasts')}
                  className="w-full py-2 text-xs font-semibold text-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  View All Broadcasts & WhatsApp Templates →
                </button>
              </div>
            </div>

          </div>

          {/* Recharts Financial Overview Component */}
          <FinancialOverview
            students={students}
            invoices={invoices}
            batches={batches}
            courses={courses}
            onTabChange={onTabChange}
            onOpenInvoiceModal={onOpenInvoiceModal}
          />
        </div>
      )}

      {/* Tab: Dedicated Financial Overview & Charts */}
      {activeTab === 'financials' && (
        <FinancialOverview
          students={students}
          invoices={invoices}
          batches={batches}
          courses={courses}
          onTabChange={onTabChange}
          onOpenInvoiceModal={onOpenInvoiceModal}
        />
      )}

      {/* Tab: Seat Inventory & Batches */}
      {activeTab === 'seats' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Batch Seat Inventory & Intake Capacity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor student intake limits per batch, identify fast-filling cohorts, and adjust seating limits.
              </p>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Total Enrolled: {totalFilled} / {totalCapacity} Seats ({totalSeatsLeft} Available)
            </div>
          </div>

          {/* Batches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((b) => {
              const seatsLeft = b.totalSeats - b.filledSeats;
              const fillPct = Math.round((b.filledSeats / b.totalSeats) * 100);
              const isFull = seatsLeft === 0;
              const isWarning = seatsLeft <= 3 && !isFull;

              return (
                <div
                  key={b.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-2xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                        {b.courseTitle}
                      </span>
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-full font-medium ${
                          isFull
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {isFull ? 'Sold Out' : `${seatsLeft} Seats Left`}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {b.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Instructor: {b.instructor}
                    </p>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-600 dark:text-slate-400">Fill Rate ({fillPct}%)</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {b.filledSeats} / {b.totalSeats} Seats
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                      <div>Timing: <span className="font-medium text-slate-900 dark:text-white">{b.timing}</span></div>
                      <div>Days: {b.days}</div>
                      <div>Room: {b.classroom}</div>
                      <div>Commenced: {b.startDate}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setEditingBatch(b)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Adjust Capacity</span>
                    </button>

                    <button
                      onClick={() => {
                        setNewBatchId(b.id);
                        setNewCourseId(b.courseId);
                        setShowAddStudentModal(true);
                      }}
                      disabled={isFull}
                      className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 disabled:opacity-40 rounded-md transition-colors"
                    >
                      {isFull ? 'Batch Full' : '+ Enroll Here'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Student Admissions Roster */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Enrolled Students Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete student records with fee status, parent contacts, roll numbers, and attendance.
              </p>
            </div>

            <button
              onClick={() => setShowAddStudentModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New Student</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by student name, roll number, course, or phone..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={studentFeeFilter}
                onChange={(e) => setStudentFeeFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="all">All Fee Status</option>
                <option value="due">Pending Dues Only ({studentsWithDue})</option>
                <option value="paid">Fully Paid</option>
              </select>

              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="all">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Student & Roll No</th>
                  <th className="py-3 px-4">Course & Batch</th>
                  <th className="py-3 px-4">Contact & Location</th>
                  <th className="py-3 px-4 text-right">Fee Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {filteredStudents.map((s) => {
                  const hasDue = s.feeDue > 0;
                  const matchingInv = invoices.find((inv) => inv.studentId === s.id);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white font-sans">
                          {s.name}
                        </div>
                        <div className="text-2xs text-slate-400">
                          {s.rollNo} · Att: {s.attendanceRate}%
                        </div>
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {s.courseTitle}
                        </div>
                        <div className="text-2xs text-slate-400">
                          {s.batchName}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">
                        <div>{s.phone}</div>
                        <div className="text-2xs text-slate-400">Parent: {s.parentPhone}</div>
                        <div className="text-2xs text-slate-400 truncate max-w-[140px]">{s.address}</div>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                        ₹{s.feeTotal.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                        ₹{s.feePaid.toLocaleString('en-IN')}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          hasDue ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        ₹{s.feeDue.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`text-2xs px-2 py-0.5 rounded-full font-medium ${
                            hasDue
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}
                        >
                          {hasDue ? 'Due' : 'Cleared'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-sans space-x-2">
                        {matchingInv && (
                          <button
                            onClick={() => onOpenInvoiceModal(matchingInv)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                          >
                            GST Invoice
                          </button>
                        )}

                        {hasDue && (
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `Hello ${s.name}, your SkillBridge Bathinda course fee balance of ₹${s.feeDue.toLocaleString('en-IN')} is due. Kindly clear via UPI: skillbridge.bathinda@hdfcbank. Thank you!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                          >
                            WhatsApp
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Teachers & Staff Management */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Teachers & Academic Faculty Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage subject specialists, allocate batch workloads, and monitor faculty payroll.
              </p>
            </div>

            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>+ Add Faculty Member</span>
            </button>
          </div>

          {/* Teachers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((tch) => (
              <div
                key={tch.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-2xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                      {tch.department}
                    </span>
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-medium">
                      {tch.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {tch.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    {tch.designation}
                  </p>
                  <p className="text-2xs text-slate-400 mt-0.5">
                    {tch.qualification}
                  </p>

                  <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                    <div>Contact: <span className="font-mono text-slate-900 dark:text-white">{tch.phone}</span></div>
                    <div>Email: <span className="font-mono">{tch.email}</span></div>
                    <div>Payroll: <span className="font-mono font-bold text-slate-900 dark:text-white">₹{tch.monthlySalary.toLocaleString('en-IN')}/mo</span></div>
                    <div>Joined: {tch.joiningDate}</div>
                  </div>

                  <div className="mt-3">
                    <span className="text-2xs font-semibold uppercase text-slate-400 block mb-1">
                      Assigned Cohorts:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tch.assignedBatchNames.map((bName, i) => (
                        <span
                          key={i}
                          className="text-2xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60"
                        >
                          {bName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-2xs text-slate-400">ID: {tch.id}</span>
                  <a
                    href={`https://wa.me/${tch.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    WhatsApp Faculty
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Broadcasts (WhatsApp Replacement) */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Institute Broadcasts Center (WhatsApp Group Replacement)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Post official academic notices directly to student portals and generate 1-click WhatsApp formatted broadcasts.
              </p>
            </div>

            <button
              onClick={() => setShowAddAnnouncementModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>+ Create Broadcast Notice</span>
            </button>
          </div>

          {/* Broadcasts List */}
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-2xs px-2 py-0.5 rounded-full font-medium ${
                        ann.category === 'Urgent Alert'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                          : ann.category === 'Exam Schedule'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}
                    >
                      {ann.category}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Target: <strong className="text-slate-700 dark:text-slate-300">{ann.targetBatch}</strong>
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Posted: {ann.createdAt} · By: {ann.author}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {ann.content}
                </p>

                {/* WhatsApp Ready Format Preview Box */}
                <div className="mt-4 p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
                  <div className="flex items-center justify-between text-2xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> 1-Click WhatsApp Group Format:
                    </span>
                    <button
                      onClick={() => handleCopyWhatsApp(ann)}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {copiedAnnId === ann.id ? 'Copied to Clipboard!' : 'Copy WhatsApp Text'}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                    {ann.whatsappFormattedText}
                  </pre>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-2xs text-slate-400">
                    Visible live to all students enrolled in target cohorts.
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(ann.whatsappFormattedText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Dispatch to WhatsApp Group</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: GST Invoices & Fee Ledger */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Official GST Tax Invoicing & Dues Collection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                SAC Code 999293 · CGST 9% + SGST 9% · Print tax receipts & trigger automated WhatsApp fee reminders.
              </p>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Pending Dues: <strong className="text-amber-600">₹{totalFeesDue.toLocaleString('en-IN')}</strong> across {studentsWithDue} students
            </div>
          </div>

          {/* Invoices Directory Table */}
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Student & Contact</th>
                  <th className="py-3 px-4">Course Program</th>
                  <th className="py-3 px-4 text-right">Taxable (₹)</th>
                  <th className="py-3 px-4 text-right">CGST (9%)</th>
                  <th className="py-3 px-4 text-right">SGST (9%)</th>
                  <th className="py-3 px-4 text-right">Total Fee</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {invoices.map((inv) => {
                  const hasDue = inv.balanceDue > 0;
                  return (
                    <tr key={inv.invoiceNo} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {inv.invoiceNo}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {inv.studentName}
                        </div>
                        <div className="text-2xs text-slate-400 font-mono">
                          {inv.studentRollNo} · {inv.studentPhone}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">
                        {inv.courseName}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        ₹{inv.baseAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500">
                        ₹{inv.cgstAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500">
                        ₹{inv.sgstAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ₹{inv.totalAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                        ₹{inv.amountPaid.toLocaleString('en-IN')}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          hasDue ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        ₹{inv.balanceDue.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`text-2xs px-2 py-0.5 rounded-full font-medium ${
                            hasDue
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}
                        >
                          {hasDue ? 'Partial' : 'Paid'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-sans space-x-2">
                        <button
                          onClick={() => onOpenInvoiceModal(inv)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
                        >
                          Print Invoice
                        </button>

                        {hasDue && (
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `🏛️ SkillBridge Bathinda - Fee Notice for ${inv.studentName} (Roll: ${inv.studentRollNo}): Pending balance of ₹${inv.balanceDue.toLocaleString('en-IN')} for ${inv.courseName}. Pay via UPI: skillbridge.bathinda@hdfcbank.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md transition-colors"
                          >
                            Send WA
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Institute Customizer */}
      {activeTab === 'customize' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Institute Branding & Portal Customizer</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize your academy name, Bathinda address, director signatory, and fee collection accounts.
              </p>
            </div>

            {instSavedToast && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> Changes Saved Successfully!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Customizer Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateInstitute({
                  name: instName,
                  tagline: instTagline,
                  address: instAddress,
                  phone: instPhone,
                  director: instDirector,
                  bankDetails: {
                    ...institute?.bankDetails,
                    upiId: instUpi,
                  },
                });
                setInstSavedToast(true);
                setTimeout(() => setInstSavedToast(false), 2500);
              }}
              className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institute Registered Name:
                </label>
                <input
                  type="text"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Regional Mission:
                </label>
                <input
                  type="text"
                  value={instTagline}
                  onChange={(e) => setInstTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Location & Address (Bathinda):
                  </label>
                  <input
                    type="text"
                    value={instAddress}
                    onChange={(e) => setInstAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Helpline & WhatsApp Phone:
                  </label>
                  <input
                    type="text"
                    value={instPhone}
                    onChange={(e) => setInstPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Director / Authorized Signatory Name:
                  </label>
                  <input
                    type="text"
                    value={instDirector}
                    onChange={(e) => setInstDirector(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank UPI ID for Direct Fee Reminders:
                  </label>
                  <input
                    type="text"
                    value={instUpi}
                    onChange={(e) => setInstUpi(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Save Institute Branding Changes
                </button>
              </div>
            </form>

            {/* Live Branding Preview */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <span className="text-2xs font-semibold uppercase text-slate-400 block">
                Live Branding Preview:
              </span>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {instName}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {instTagline}
                </div>
                <div className="text-2xs text-slate-500 leading-relaxed">
                  {instAddress}
                </div>
                <div className="text-2xs font-mono text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                  Helpline: {instPhone} · UPI: {instUpi}
                </div>
                <div className="text-2xs text-slate-400">
                  Authorized Signatory: <strong>{instDirector}</strong>
                </div>
              </div>

              <div className="text-2xs text-slate-400 leading-relaxed">
                Note: Updating these details instantly reflects across student GST invoices, completion certificates, and parent WhatsApp reminders.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab: Platform Plans & Pricing (Institute SaaS Subscription) */}
      {activeTab === 'pricing' && (
        <div className="space-y-8">
          
          {/* Header & Plan Status Banner */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span>SkillBridge Institute Platform · Subscription & Licensing</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
                Institute Management Platform Plans
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                Replace unorganized WhatsApp groups, manual receipt books, and offline spreadsheets with a unified platform for student progress and AI-powered fee collections.
              </p>
            </div>

            {/* Current Active Plan Pill */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs shrink-0">
              <span className="text-2xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                Active Institute Plan:
              </span>
              <div className="text-base font-bold font-mono text-blue-950 dark:text-white mt-0.5">
                {activePlan.name} · ₹{activePlan.price} {activePlan.period}
              </div>
              <div className="text-2xs text-blue-700 dark:text-blue-300 mt-1 flex items-center gap-1.5 font-mono">
                <span>Student Capacity: <strong>{totalStudents} / {activePlan.maxStudents}</strong></span>
                <span>·</span>
                <span>{activePlan.maxStudents - totalStudents} Seats Available</span>
              </div>
            </div>
          </div>

          {/* Toast on plan change */}
          {planChangeToast && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{planChangeToast}</span>
              </div>
              <button
                onClick={() => setPlanChangeToast(null)}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 3 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLAN_TIERS.map((tier) => {
              const isCurrent = currentPlanId === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`relative p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-600/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Best Value Badge for Standard Plan */}
                  {tier.isBestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 text-2xs font-bold text-white bg-blue-600 rounded-full shadow-xs uppercase tracking-wider">
                        Best Value
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Tier Name & Subtitle */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {tier.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {tier.tagline}
                        </p>
                      </div>

                      {isCurrent && (
                        <span className="px-2.5 py-0.5 text-2xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 rounded-full border border-blue-200 dark:border-blue-800">
                          Active Plan
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="my-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold font-mono text-slate-950 dark:text-white">
                          ₹{tier.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {tier.period}
                        </span>
                      </div>
                      <p className="text-2xs text-slate-400 mt-1">
                        Billed monthly · Inclusive of Indian GST (SAC 998314)
                      </p>
                    </div>

                    {/* Feature List */}
                    <div className="space-y-3">
                      <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                        Included Features:
                      </span>
                      <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span className={idx === 0 ? 'font-bold text-slate-900 dark:text-white' : ''}>
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Plan Action CTA Button */}
                  <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Current Active Plan</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCurrentPlanId(tier.id);
                          localStorage.setItem('sb_institute_plan_id', tier.id);
                          setPlanChangeToast(
                            `Institute subscription updated to ${tier.name} (₹${tier.price}/month). Student limit is now ${tier.maxStudents} students.`
                          );
                        }}
                        className={`w-full py-2.5 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                          tier.isBestValue
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <span>Select {tier.name} Plan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Capacity Usage Tracker & Software Billing Slip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            
            {/* Student Quota Monitor */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Institute Student Quota Monitor</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your institute is currently on the <strong>{activePlan.name} Plan</strong>, which accommodates up to <strong>{activePlan.maxStudents} enrolled students</strong>.
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400">
                    Utilization ({Math.round((totalStudents / activePlan.maxStudents) * 100)}%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {totalStudents} / {activePlan.maxStudents} Students
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalStudents / activePlan.maxStudents) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-2xs text-slate-400">
                  <span>Capacity remaining: {activePlan.maxStudents - totalStudents} student slots</span>
                  {activePlan.id !== 'premium' && (
                    <button
                      onClick={() => {
                        const nextPlan = activePlan.id === 'basic' ? 'standard' : 'premium';
                        setCurrentPlanId(nextPlan);
                        localStorage.setItem('sb_institute_plan_id', nextPlan);
                        setPlanChangeToast(`Upgraded to ${nextPlan.toUpperCase()} Plan!`);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Upgrade Capacity →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Platform Software Subscription Invoice Generator */}
            <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>SaaS Software Billing Tax Receipt</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Official B2B IT Software as a Service tax invoice for your institute's monthly platform subscription.
                </p>

                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs font-mono space-y-1 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex justify-between">
                    <span>Vendor:</span>
                    <span className="text-slate-900 dark:text-white font-medium">SkillBridge EdTech Solutions</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SAC Code:</span>
                    <span>998314 (SaaS Platform)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Institute:</span>
                    <span className="text-slate-900 dark:text-white">SkillBridge Bathinda</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billed Plan:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{activePlan.name} (₹{activePlan.price}/mo)</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 font-bold text-slate-900 dark:text-white">
                    <span>Total Paid (Monthly):</span>
                    <span>₹{activePlan.price}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between">
                <span className="text-2xs text-slate-400">
                  Tax deductible under Indian Income Tax Act.
                </span>
                <button
                  onClick={() => {
                    const printContent = `
                      SKILLBRIDGE SAAS SOFTWARE TAX INVOICE
                      Invoice No: SB-SAAS-2026-${Math.floor(1000 + Math.random() * 9000)}
                      Date: ${new Date().toLocaleDateString('en-GB')}
                      SAC Code: 998314 (Cloud Application Services)
                      Client: SkillBridge Institute, Ajit Road, Bathinda, Punjab
                      Plan: ${activePlan.name} Plan (Monthly)
                      Max Students Quota: ${activePlan.maxStudents} Students
                      Base Subscription: ₹${Math.round((activePlan.price / 1.18) * 100) / 100}
                      CGST (9%): ₹${Math.round((((activePlan.price - (activePlan.price / 1.18)) / 2)) * 100) / 100}
                      SGST (9%): ₹${Math.round((((activePlan.price - (activePlan.price / 1.18)) / 2)) * 100) / 100}
                      Total Billed: ₹${activePlan.price}
                      Status: PAID
                    `;
                    const w = window.open('', '_blank');
                    if (w) {
                      w.document.write(`<pre style="font-family: monospace; padding: 24px; font-size: 14px; line-height: 1.6;">${printContent}</pre>`);
                      w.document.close();
                      w.print();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Print Platform Invoice</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-2xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                  New Enrollment · SkillBridge Bathinda
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Add Student Admission
                </h3>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Jasleen Kaur"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={newRollNo}
                    onChange={(e) => setNewRollNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Area (Bathinda / Malwa District)
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Street 7, Civil Lines, Bathinda"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Program
                  </label>
                  <select
                    value={newCourseId}
                    onChange={(e) => {
                      const cId = e.target.value;
                      setNewCourseId(cId);
                      const selCourse = courses.find((c) => c.id === cId);
                      if (selCourse) {
                        setNewTotalFee(selCourse.fee);
                        setNewPaidFee(Math.round(selCourse.fee * 0.6));
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (₹{c.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Batch
                  </label>
                  <select
                    value={newBatchId}
                    onChange={(e) => setNewBatchId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.totalSeats - b.filledSeats} seats left)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Course Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newTotalFee}
                    onChange={(e) => setNewTotalFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Deposit Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={newPaidFee}
                    onChange={(e) => setNewPaidFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-2xs text-blue-900 dark:text-blue-300">
                Notice: Submitting will reserve 1 seat in {batches.find((b) => b.id === newBatchId)?.name} and immediately generate an official GST Invoice (SAC 999293).
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Complete Admission & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-2xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                  Broadcast Center · WhatsApp Replacement
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Publish Institute Announcement
                </h3>
              </div>
              <button
                onClick={() => setShowAddAnnouncementModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. 📢 Sunday Mock Test Timetable for Class 10 & 12"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  >
                    <option value="Urgent Alert">Urgent Alert</option>
                    <option value="Exam Schedule">Exam Schedule</option>
                    <option value="Batch Timing">Batch Timing</option>
                    <option value="Holiday Notice">Holiday Notice</option>
                    <option value="Opportunity">Opportunity / Hackathon</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Batch
                  </label>
                  <select
                    value={annTargetBatch}
                    onChange={(e) => setAnnTargetBatch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  >
                    <option value="All Batches">All Batches</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content *
                </label>
                <textarea
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Provide complete instructions, classroom numbers, timing, and preparation guidelines..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAnnouncementModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Post Notice to Student Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Faculty / Teacher Member
                </h3>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name & Honorific *
                </label>
                <input
                  type="text"
                  value={tchName}
                  onChange={(e) => setTchName(e.target.value)}
                  placeholder="e.g. Er. Harpreet Singh / Dr. Simranjit Kaur"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={tchEmail}
                    onChange={(e) => setTchEmail(e.target.value)}
                    placeholder="faculty@skillbridge.edu"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={tchPhone}
                    onChange={(e) => setTchPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department Track
                  </label>
                  <select
                    value={tchDept}
                    onChange={(e) => setTchDept(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  >
                    <option value="Tech & Coding">Tech & Coding</option>
                    <option value="IELTS & Languages">IELTS & Languages</option>
                    <option value="Senior Secondary STEM">Senior Secondary STEM</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={tchDesignation}
                    onChange={(e) => setTchDesignation(e.target.value)}
                    placeholder="Senior Faculty Specialist"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    value={tchQual}
                    onChange={(e) => setTchQual(e.target.value)}
                    placeholder="M.Tech CSE / M.Sc Physics"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Remuneration (₹)
                  </label>
                  <input
                    type="number"
                    value={tchSalary}
                    onChange={(e) => setTchSalary(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Assigned Batch
                </label>
                <select
                  value={tchBatchId}
                  onChange={(e) => setTchBatchId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.timing})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Onboard Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Batch Capacity Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Adjust Capacity for {editingBatch.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current Enrolled: <strong>{editingBatch.filledSeats} students</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Maximum Seat Limit:
              </label>
              <input
                type="number"
                min={editingBatch.filledSeats}
                max={60}
                defaultValue={editingBatch.totalSeats}
                id="capacityInput"
                className="w-full px-3 py-2 font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingBatch(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('capacityInput') as HTMLInputElement;
                  if (input && input.value) {
                    onUpdateBatchCapacity(editingBatch.id, parseInt(input.value));
                  }
                  setEditingBatch(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save Capacity
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
