import React from 'react';
import { Certificate } from '../types';
import { INSTITUTE_DETAILS } from '../data/seedData';
import { Printer, X, Award, ShieldCheck, QrCode } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Action Header (hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Verified Certificate of Completion · {certificate.certificateNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Certificate PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Canvas */}
        <div
          className="p-8 md:p-12 bg-white text-slate-900 overflow-y-auto"
          id="certificate-printable"
          style={{ minHeight: '520px' }}
        >
          {/* Certificate Double Border & Decorative Corner Motifs */}
          <div className="border-4 border-double border-slate-900 p-8 md:p-10 rounded-xl relative text-center space-y-6 bg-radial-[at_top_right] from-amber-50/40 via-white to-slate-50/30">
            
            {/* Top Emblem / Institute Brand */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-2xs font-extrabold tracking-widest text-blue-900 uppercase">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>SKILLBRIDGE EDUCATIONAL FOUNDATION · MALWA REGION</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950 uppercase font-serif">
                {INSTITUTE_DETAILS.name}
              </h1>
              <p className="text-xs text-slate-600 font-sans">
                {INSTITUTE_DETAILS.address}, {INSTITUTE_DETAILS.city} (Punjab) · Govt. Reg. No. PB/BTI/EDU/2021-884
              </p>
            </div>

            {/* Certificate Header Banner */}
            <div className="py-2">
              <div className="inline-block border-y-2 border-slate-900 py-1.5 px-8">
                <span className="text-sm md:text-base font-bold tracking-widest uppercase font-serif text-slate-900">
                  Certificate of Academic & Technical Excellence
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 italic font-serif">
                This is to certify that
              </p>
            </div>

            {/* Recipient Student Name */}
            <div className="py-1">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-950 font-serif tracking-tight border-b-2 border-slate-300 pb-2 inline-block min-w-[320px]">
                {certificate.studentName}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">
                Student Enrollment Roll No: <strong className="text-slate-800">{certificate.studentRollNo}</strong>
              </div>
            </div>

            {/* Achievement Paragraph */}
            <p className="text-xs md:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
              has satisfactorily completed the prescribed curriculum and practical laboratory projects for
              <br />
              <strong className="text-base text-slate-950 font-bold block mt-1">
                {certificate.courseName}
              </strong>
              demonstrating comprehensive subject mastery, continuous attendance, and achieving{' '}
              <strong className="text-blue-900">{certificate.gradeScore}</strong>.
            </p>

            {/* Signatures & Seal Strip */}
            <div className="grid grid-cols-3 items-end pt-8 mt-6 border-t border-slate-200 gap-4 text-left">
              
              {/* Date & Campus */}
              <div>
                <div className="text-xs text-slate-500">Date of Award:</div>
                <div className="text-xs font-bold font-mono text-slate-900">{certificate.issueDate}</div>
                <div className="text-2xs text-slate-500 mt-0.5">Campus: {certificate.campusCity}</div>
              </div>

              {/* Official Gold Seal Badge */}
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full border-2 border-amber-600 bg-gradient-to-tr from-amber-100 via-amber-50 to-amber-200 flex flex-col items-center justify-center p-1 shadow-inner">
                  <Award className="w-6 h-6 md:w-8 md:h-8 text-amber-700" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter text-amber-900 mt-0.5">
                    Official Seal
                  </span>
                </div>
                <div className="text-2xs font-mono text-slate-500 mt-1">
                  Cert #{certificate.certificateNo}
                </div>
              </div>

              {/* Authorized Signatory */}
              <div className="text-right">
                <div className="font-serif italic text-blue-900 font-bold text-base border-b border-dashed border-slate-400 pb-1">
                  G.S. Brar
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">
                  {certificate.directorName}
                </div>
                <div className="text-2xs text-slate-500">
                  Director · SkillBridge Bathinda
                </div>
              </div>

            </div>

            {/* Verification Footer with QR representation */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-2xs text-slate-500 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-1.5 font-mono">
                <QrCode className="w-3.5 h-3.5 text-slate-700" />
                <span>Verify Online: skillbridgebathinda.in/verify/{certificate.verificationCode}</span>
              </div>
              <div>
                Security Hash: <strong className="font-mono text-slate-700">{certificate.verificationCode}</strong>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
