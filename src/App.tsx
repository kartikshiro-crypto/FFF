/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from './data/store';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/StudentPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherPortal } from './components/TeacherPortal';
import { ParentPortal } from './components/ParentPortal';
import { GstInvoiceModal } from './components/GstInvoiceModal';
import { CertificateModal } from './components/CertificateModal';
import { Invoice, Certificate } from './types';
import { MapPin, RotateCcw, ShieldCheck } from 'lucide-react';

export default function App() {
  const store = useAppStore();

  const [currentView, setCurrentView] = useState<'admin' | 'teacher' | 'student' | 'parent'>('admin');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Dark mode state with document class synchronization
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('sb_theme') === 'dark' ||
        (!('sb_theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sb_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sb_theme', 'light');
    }
  }, [darkMode]);

  // Find linked student for the current parent
  const linkedStudent =
    store.students.find((s) => s.id === store.currentParent.linkedStudentId) ||
    store.students[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Bar Navigation with 4-Portal Role Switcher */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          const defaultTabs: Record<string, string> = {
            admin: 'overview',
            teacher: 'attendance',
            student: 'curriculum',
            parent: 'overview',
          };
          setActiveTab(defaultTabs[view] || 'overview');
        }}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        students={store.students}
        currentStudent={store.currentStudent}
        onSelectStudent={(id) => store.setCurrentStudent(id)}
        teachers={store.teachers}
        currentTeacher={store.currentTeacher}
        onSelectTeacher={(id) => store.setCurrentTeacher(id)}
        parents={store.parents}
        currentParent={store.currentParent}
        onSelectParent={(id) => store.setCurrentParent(id)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* Portal 1: Institute Admin Dashboard */}
        {currentView === 'admin' && (
          <AdminDashboard
            students={store.students}
            teachers={store.teachers}
            batches={store.batches}
            courses={store.courses}
            announcements={store.announcements}
            invoices={store.invoices}
            institute={store.institute}
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t)}
            onAddStudent={(s) => store.addStudent(s)}
            onAddTeacher={(t) => store.addTeacher(t)}
            onAddAnnouncement={(a) => store.addAnnouncement(a)}
            onUpdateBatchCapacity={(bId, seats) => store.updateBatchCapacity(bId, seats)}
            onOpenInvoiceModal={(inv) => setSelectedInvoice(inv)}
            onUpdateInstitute={(details) => store.updateInstituteCustomizer(details)}
          />
        )}

        {/* Portal 2: Teacher / Faculty Desk */}
        {currentView === 'teacher' && (
          <TeacherPortal
            currentTeacher={store.currentTeacher}
            teachers={store.teachers}
            onSelectTeacher={(id) => store.setCurrentTeacher(id)}
            batches={store.batches}
            students={store.students}
            assignments={store.assignments}
            studyMaterials={store.studyMaterials}
            onMarkAttendance={(bId, bName, date, records, teacher, notes) =>
              store.markAttendance(bId, bName, date, records, teacher, notes)
            }
            onGradeAssignment={(asgId, score, feedback) =>
              store.gradeAssignment(asgId, score, feedback)
            }
            onCreateAssignment={(asg) => store.createAssignment(asg)}
            onAddStudyMaterial={(mat) => store.addStudyMaterial(mat)}
            onAddAnnouncement={(ann) => store.addAnnouncement(ann)}
          />
        )}

        {/* Portal 3: Student Learning Portal */}
        {currentView === 'student' && (
          <StudentPortal
            currentStudent={store.currentStudent}
            courses={store.courses}
            modules={store.modules}
            assignments={store.assignments}
            invoices={store.invoices}
            certificates={store.certificates}
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t)}
            onSubmitAssignment={(id, text, link) => store.submitAssignment(id, text, link)}
            onOpenInvoiceModal={(inv) => setSelectedInvoice(inv)}
            onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
          />
        )}

        {/* Portal 4: Parent Monitoring Portal */}
        {currentView === 'parent' && (
          <ParentPortal
            currentParent={store.currentParent}
            parents={store.parents}
            onSelectParent={(id) => store.setCurrentParent(id)}
            linkedChild={linkedStudent}
            assignments={store.assignments}
            announcements={store.announcements}
            invoices={store.invoices}
            attendance={store.attendance}
            onOpenInvoiceModal={(inv) => setSelectedInvoice(inv)}
          />
        )}

      </main>

      {/* Official Indian GST Tax Invoice Modal */}
      {selectedInvoice && (
        <GstInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onRecordPayment={(no, amt, mode, ref) => {
            store.recordPayment(no, amt, mode, ref);
            // Refresh modal invoice
            const updated = store.invoices.find((i) => i.invoiceNo === no);
            if (updated) setSelectedInvoice(updated);
          }}
        />
      )}

      {/* Verified Course Completion Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {/* Clean Legal & Compliance Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  SkillBridge <span className="text-blue-600 dark:text-blue-400">Bathinda</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {store.institute.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{store.institute.address}, {store.institute.city} - {store.institute.pincode}</span>
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-2xs text-slate-400 dark:text-slate-500 font-mono">
                <span>GSTIN: {store.institute.gstin}</span>
                <span>State Code: {store.institute.stateCode}</span>
                <span>SAC Code: {store.institute.sacCode}</span>
                <span>Helpline: {store.institute.phone}</span>
                <span>Director: {store.institute.director}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1 text-2xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Authorized Punjab Educational Service Center</span>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Reset all demo student, faculty, attendance, batch, and fee data to initial seeded state?')) {
                    store.resetToDefault();
                    window.location.reload();
                  }
                }}
                className="inline-flex items-center gap-1 text-2xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Seed Data</span>
              </button>
            </div>

          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-2xs text-slate-400 text-center">
            © 2026 SkillBridge Educational Foundation, Bathinda (Punjab). All rights reserved. Registered under Punjab GST & Educational Society Acts.
          </div>
        </div>
      </footer>

    </div>
  );
}
