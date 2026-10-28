import React, { useState } from 'react';
import {
  ClassSubjectTeacherMapping,
  ClassSection,
  Teacher,
  Subject,
  TimetableSlot,
  SchoolConfig,
  AcademicStage,
} from '../../types/timetable';
import { calculateTeacherLoads } from '../../utils/timetableGenerator';
import { initialClassCombineRules, practicalSubjectsConfig } from '../../data/initialData';
import { Briefcase, UserCheck, Layers, BarChart3, Users2, Sparkles, CheckCircle2, Bookmark, Check, FlaskConical, Award, BookOpen } from 'lucide-react';
import { LanguageMode } from '../Header';
import { WorkloadAnalyticsView } from './WorkloadAnalyticsView';

interface TeacherAllotmentViewProps {
  config: SchoolConfig;
  classes: ClassSection[];
  teachers: Teacher[];
  subjects: Subject[];
  slots: TimetableSlot[];
  mappings: ClassSubjectTeacherMapping[];
  languageMode: LanguageMode;
  onUpdateMapping: (classId: string, subjectId: string, teacherId: string) => void;
}

export const TeacherAllotmentView: React.FC<TeacherAllotmentViewProps> = ({
  config,
  classes,
  teachers,
  subjects,
  slots,
  mappings,
  languageMode,
  onUpdateMapping,
}) => {
  const [activeSection, setActiveSection] = useState<'combine-rules' | 'analytics' | 'workload' | 'mapping' | 'both'>('combine-rules');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const isTa = languageMode === 'ta';

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));

  // Calculate teacher workloads matching official norms
  const teacherLoads = calculateTeacherLoads(teachers, classes, subjects, slots);

  const filteredClasses = classes.filter(cls => {
    if (selectedStage === 'all') return true;
    return cls.stage === (selectedStage as AcademicStage);
  });

  // Group initialClassCombineRules by Teacher
  const combineRulesByTeacher = [
    {
      teacherId: 't-subbulakshmi',
      teacherName: 'Subbulakshmi',
      department: 'Tamil (PG)',
      subject: 'Tamil',
      isCombine: true,
      allocations: [
        { label: '11A,B,C', periods: 5, type: 'Combine' },
        { label: '12A,B,C', periods: 5, type: 'Combine' },
        { label: '11D', periods: 5, type: 'Individual' },
        { label: '12D', periods: 5, type: 'Individual' },
        { label: '11E', periods: 4, type: 'Individual' },
        { label: '12E', periods: 5, type: 'Individual' },
      ],
      total: 29,
    },
    {
      teacherId: 't-pradeepa',
      teacherName: 'Pradeepa',
      department: 'English (PG)',
      subject: 'English',
      isCombine: true,
      allocations: [
        { label: '11A,B,C', periods: 5, type: 'Combine' },
        { label: '12A,B,C', periods: 5, type: 'Combine' },
        { label: '11D', periods: 5, type: 'Individual' },
        { label: '12D', periods: 5, type: 'Individual' },
        { label: '11E', periods: 4, type: 'Individual' },
        { label: '12E', periods: 5, type: 'Individual' },
      ],
      total: 29,
    },
    {
      teacherId: 't-gowri',
      teacherName: 'Gowri',
      department: 'Physics (PG)',
      subject: 'Physics',
      isCombine: true,
      allocations: [
        { label: '11ABC', periods: 7, type: 'Combine' },
        { label: '12ABC', periods: 7, type: 'Combine' },
        { label: '11D', periods: 7, type: 'Individual' },
        { label: '12D', periods: 7, type: 'Individual' },
      ],
      total: 28,
    },
    {
      teacherId: 't-nithya',
      teacherName: 'Nithya',
      department: 'Chemistry (PG)',
      subject: 'Chemistry',
      isCombine: true,
      allocations: [
        { label: '11ABC', periods: 7, type: 'Combine' },
        { label: '12ABC', periods: 7, type: 'Combine' },
        { label: '11D', periods: 7, type: 'Individual' },
        { label: '12D', periods: 7, type: 'Individual' },
      ],
      total: 28,
    },
    {
      teacherId: 't-lathamani',
      teacherName: 'Lathamani',
      department: 'Mathematics (PG)',
      subject: 'Maths',
      isCombine: true,
      allocations: [
        { label: '11AB', periods: 7, type: 'Combine' },
        { label: '12AB', periods: 7, type: 'Combine' },
        { label: '11D', periods: 7, type: 'Individual' },
        { label: '12D', periods: 7, type: 'Individual' },
      ],
      total: 28,
    },
    {
      teacherId: 't-ramesh-bot',
      teacherName: 'Ramesh',
      department: 'Botany (PG)',
      subject: 'Bio-Botany, Botany',
      isCombine: true,
      allocations: [
        { label: '11BE (Bio-Botany)', periods: 4, type: 'Combine' },
        { label: '11C (Botany)', periods: 7, type: 'Individual' },
        { label: '11D (Bio-Botany)', periods: 4, type: 'Individual' },
        { label: '12BE (Bio-Botany)', periods: 4, type: 'Combine' },
        { label: '12C (Botany)', periods: 7, type: 'Individual' },
        { label: '12D (Bio-Botany)', periods: 4, type: 'Individual' },
      ],
      total: 30,
    },
    {
      teacherId: 't-sundar-zoo',
      teacherName: 'Sundar',
      department: 'Zoology (PG)',
      subject: 'Bio-Zoology, Zoology',
      isCombine: true,
      allocations: [
        { label: '11BE (Bio-Zoology)', periods: 4, type: 'Combine' },
        { label: '11C (Zoology)', periods: 7, type: 'Individual' },
        { label: '11D (Bio-Zoology)', periods: 4, type: 'Individual' },
        { label: '12BE (Bio-Zoology)', periods: 4, type: 'Combine' },
        { label: '12C (Zoology)', periods: 7, type: 'Individual' },
        { label: '12D (Bio-Zoology)', periods: 4, type: 'Individual' },
      ],
      total: 30,
    },
  ];

  const individualRulesByTeacher = [
    {
      teacherId: 't-31',
      teacherName: 'Siva',
      department: 'Computer Science (PG)',
      subject: 'Computer Science, Emp Skills',
      isCombine: false,
      allocations: [
        { label: '11A (Computer Science)', periods: 7, type: 'Individual' },
        { label: '11E (Emp Skills)', periods: 7, type: 'Individual' },
        { label: '12A (Computer Science)', periods: 7, type: 'Individual' },
        { label: '12E (Emp Skills)', periods: 7, type: 'Individual' },
      ],
      total: 28,
    },
    {
      teacherId: 't-maritheivam',
      teacherName: 'Maritheivam',
      department: 'Vocational Agri (PG)',
      subject: 'Agri-T, Agri-P',
      isCombine: false,
      allocations: [
        { label: '11E (Agri-T & Agri-P)', periods: 14, type: 'Individual' },
        { label: '12E (Agri-T & Agri-P)', periods: 14, type: 'Individual' },
      ],
      total: 28,
    },
  ];

  return (
    <div className="space-y-8">
      {/* View Header & Section Nav */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {isTa ? 'ஆசிரியர் பாடம் ஒதுக்கீடு மற்றும் வாராந்திர பணிச்சுமை' : 'TEACHER ALLOTMENT & WORKLOAD MANAGEMENT'}
            </span>
            <span className="text-xs font-normal text-slate-500">
              · {isTa ? 'வகுப்பு 1 முதல் 12 வரை' : 'Classes 1 to 12'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTa
              ? 'இணைக்கப்பட்ட வகுப்புகள் (Class Combine) மற்றும் தனி வகுப்புகள் (Class Individual) கால அட்டவணை ஒதுக்கீடு.'
              : 'Class Combine (joint sections) and Class Individual period allotments with weekly load tracking.'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Navigation Section Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSection('combine-rules')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeSection === 'combine-rules'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>{isTa ? 'வகுப்பு இணைப்பு (Combine & Indiv)' : 'Class Combine Rules'}</span>
            </button>

            <button
              onClick={() => setActiveSection('analytics')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSection === 'analytics'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isTa ? 'பணிச்சுமை வரைபடம்' : 'Workload'}</span>
            </button>

            <button
              onClick={() => setActiveSection('workload')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSection === 'workload'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isTa ? 'சுமை அட்டைகள்' : 'Load Cards'}</span>
            </button>

            <button
              onClick={() => setActiveSection('mapping')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSection === 'mapping'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isTa ? 'ஆசிரியர் மேப்பிங்' : 'Mapping'}</span>
            </button>

            <button
              onClick={() => setActiveSection('both')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSection === 'both'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'அனைத்தும்' : 'All'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: USER'S EXACT CLASS COMBINE & CLASS INDIVIDUAL ALLOCATION RULES */}
      {(activeSection === 'both' || activeSection === 'combine-rules') && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-xs font-bold font-mono uppercase tracking-wider">
                  Official Allotment Norms
                </span>
                <h3 className="text-base font-extrabold tracking-tight">
                  {isTa ? 'மேல்நிலை வகுப்பு இணைப்பு மற்றும் தனி நபர் பாடவேளை ஒதுக்கீடு' : 'HIGHER SECONDARY CLASS COMBINE & INDIVIDUAL PERIOD ALLOTMENT'}
                </h3>
              </div>
              <p className="text-xs text-blue-100/80 mt-1">
                {isTa
                  ? '11 மற்றும் 12 ஆம் வகுப்புக்கான இணைந்த பிரிவுகள் (Class Combine) மற்றும் தனித்த பிரிவுகள் (Class Individual) ஆசிரியர் சுமை விவரம்.'
                  : 'Weekly period distribution for Class Combine (A,B,C sections shared concurrently) and Class Individual allocations.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white border border-white/20">
                9 Faculty · 258 Total Periods
              </span>
            </div>
          </div>

          {/* Group 1: CLASS COMBINE (Joint Sessions) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users2 className="w-4 h-4 text-indigo-700" />
                <span>{isTa ? 'வகுப்பு இணைப்பு (Class Combine - 7 ஆசிரியர்கள்):' : 'CLASS COMBINE (JOINT SECTIONS) ALLOCATIONS:'}</span>
              </h4>
              <span className="text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Synchronized Joint Lectures (Same Period across Member Sections)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combineRulesByTeacher.map((group, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-indigo-100 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Teacher Header */}
                    <div className="bg-indigo-900 text-white py-2 px-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm tracking-tight">{group.teacherName}</div>
                        <div className="text-[10px] text-indigo-200 font-mono">{group.department}</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-emerald-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                          {group.total} Periods
                        </span>
                        <div className="text-[9px] text-indigo-200 mt-0.5">{group.subject}</div>
                      </div>
                    </div>

                    {/* Breakdown table */}
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-indigo-50/70 text-indigo-950 font-bold border-b border-indigo-100 text-[11px]">
                          <th className="py-1 px-3 text-left">Class / Section</th>
                          <th className="py-1 px-2 text-center w-20">Type</th>
                          <th className="py-1 px-3 text-right">Periods</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {group.allocations.map((alloc, aIdx) => (
                          <tr key={aIdx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-semibold text-slate-800">
                              {alloc.label}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold ${
                                  alloc.type === 'Combine'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {alloc.type}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                              {alloc.periods}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card Footer Total */}
                  <div className="bg-slate-50 py-1.5 px-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 font-sans">{isTa ? 'மொத்த பாடவேளைகள்:' : 'Weekly Total:'}</span>
                    <span className="font-mono text-indigo-900 text-sm font-extrabold">{group.total} / Wk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group 2: CLASS INDIVIDUAL (Single Section Specialized) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>{isTa ? 'தனி வகுப்பு ஒதுக்கீடு (Class Individual - 2 ஆசிரியர்கள்):' : 'CLASS INDIVIDUAL (SPECIALIZED LAB & VOCATIONAL) ALLOCATIONS:'}</span>
              </h4>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Single Section Direct Allocation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {individualRulesByTeacher.map((group, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-emerald-200 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Teacher Header */}
                    <div className="bg-emerald-900 text-white py-2 px-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm tracking-tight">{group.teacherName}</div>
                        <div className="text-[10px] text-emerald-200 font-mono">{group.department}</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-emerald-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                          {group.total} Periods
                        </span>
                        <div className="text-[9px] text-emerald-200 mt-0.5">{group.subject}</div>
                      </div>
                    </div>

                    {/* Breakdown table */}
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-emerald-50/70 text-emerald-950 font-bold border-b border-emerald-100 text-[11px]">
                          <th className="py-1 px-3 text-left">Class / Subject</th>
                          <th className="py-1 px-2 text-center w-20">Type</th>
                          <th className="py-1 px-3 text-right">Periods</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {group.allocations.map((alloc, aIdx) => (
                          <tr key={aIdx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-semibold text-slate-800">
                              {alloc.label}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold bg-emerald-100 text-emerald-800">
                                {alloc.type}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                              {alloc.periods}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card Footer Total */}
                  <div className="bg-slate-50 py-1.5 px-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 font-sans">{isTa ? 'மொத்த பாடவேளைகள்:' : 'Weekly Total:'}</span>
                    <span className="font-mono text-emerald-900 text-sm font-extrabold">{group.total} / Wk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OFFICIAL PRACTICAL SUBJECTS REFERENCE PANEL */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950 text-white py-2.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-300" />
                <span>
                  {isTa ? 'அதிகாரப்பூர்வ செய்முறைப் பாடங்கள் பட்டியல் (Practical Subjects Classification)' : 'OFFICIAL PRACTICAL SUBJECTS CLASSIFICATION'}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-100 font-mono">
                {isTa ? 'அறிவியல் & தொழிற்கல்வி' : 'Science & Vocational Groups'}
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Science Group Practicals */}
              <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-sky-700" />
                    <span>{isTa ? '1. அறிவியல் பிரிவு செய்முறைப் பாடங்கள் (Science Group):' : '1. SCIENCE GROUP PRACTICALS (7 SUBJECTS):'}</span>
                  </h5>
                  <span className="text-[10px] font-bold bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-mono">
                    2 Periods / Sub
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isTa
                    ? 'ஒவ்வொரு அறிவியல் முதன்மை பாடத்திலும் (7 வேளைகளில்) 5 கோட்பாடு + 2 செய்முறை வேளைகள் (4 பாடங்கள் x 2 = 8 செய்முறை வேளைகள்).'
                    : 'Each 7-period science major comprises 5 Theory + 2 Practical lab periods (4 subjects x 2 = 8 practical periods total).'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {practicalSubjectsConfig.scienceGroup.map((sub, sIdx) => (
                    <div key={sIdx} className="bg-white px-2.5 py-1.5 rounded border border-sky-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">
                        {isTa ? sub.tamilName : sub.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                        {sub.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocational Group Practicals */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isTa ? '2. தொழிற்கல்வி பிரிவு செய்முறைப் பாடங்கள் (Vocational Group):' : '2. VOCATIONAL GROUP PRACTICALS (2 SUBJECTS):'}</span>
                  </h5>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono">
                    7 Periods / Sub
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isTa
                    ? 'தொழிற்கல்வி பிரிவுக்கு (11E, 12E) வேளாண்மை செய்முறை (Agri-P) மற்றும் வேலைவாய்ப்புத் திறன் செய்முறை 7 வேளைகள் ஒதுக்கீடு.'
                    : 'Vocational group (11E, 12E) practical requirements: Agri-Practical (Agri-P) & Employability Skills (Emp Skills).'}
                </p>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  {practicalSubjectsConfig.vocationalGroup.map((sub, sIdx) => (
                    <div key={sIdx} className="bg-white px-2.5 py-2 rounded border border-amber-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">
                          {isTa ? sub.tamilName : sub.name}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {sub.code} · {sub.periods} {isTa ? 'பாடவேளைகள்' : 'Periods/Week'}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        Practical
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* OFFICIAL TAMIL NADU GOVERNMENT 40-PERIOD WEEKLY STRUCTURE (IMAGE REPLICA) */}
          <div className="bg-white rounded-xl border-2 border-blue-900 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white font-serif">
                    வகுப்பு 11 முதல் 12 வரை · பாடவேளை ஒதுக்கீட்டு அரசாணை அட்டவணை
                  </h4>
                  <p className="text-[11px] text-blue-200">
                    Classes 11 to 12 Official Weekly Period Allotment (Science, Arts & Vocational Streams)
                  </p>
                </div>
              </div>
              <span className="text-xs bg-amber-400 text-blue-950 px-2.5 py-1 rounded font-bold font-mono">
                Total = 40 Periods / Wk
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-blue-900 text-white divide-x divide-blue-700">
                    <th className="py-2 px-3 text-center w-12 font-bold font-mono">வ. எண்</th>
                    <th className="py-2 px-4 text-left font-bold uppercase tracking-wider">பாடம் (Subject)</th>
                    <th className="py-2 px-3 text-center font-bold bg-blue-800 w-36">அறிவியல் பிரிவு (Science)</th>
                    <th className="py-2 px-3 text-center font-bold bg-blue-800 w-36">கலைப் பிரிவு (Arts)</th>
                    <th className="py-2 px-3 text-center font-bold bg-blue-800 w-36">தொழிற்கல்வி (Vocational)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  <tr className="divide-x divide-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">1</td>
                    <td className="py-2 px-4 font-semibold text-slate-900">மொழிப் பாடம் (Language / Tamil)</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/30">4</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/30">4</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/30">4</td>
                  </tr>
                  <tr className="divide-x divide-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">2</td>
                    <td className="py-2 px-4 font-semibold text-slate-900">ஆங்கிலம் (English)</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/30">4</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/30">4</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/30">4</td>
                  </tr>
                  <tr className="divide-x divide-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">3</td>
                    <td className="py-2 px-4 font-semibold text-slate-900">முதன்மைப் பாடங்கள் (Core Subjects)</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-indigo-900 bg-indigo-50/40">20 (5x4)</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-indigo-900 bg-indigo-50/40">28 (7x4)</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-indigo-900 bg-indigo-50/40">14 (7x2)</td>
                  </tr>
                  <tr className="divide-x divide-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">4</td>
                    <td className="py-2 px-4 text-slate-800">தொழிற்கல்வி பாடம் (Vocational Subject Theory)</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-400">–</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-400">–</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-amber-900 bg-amber-50/50">7</td>
                  </tr>
                  <tr className="divide-x divide-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">5</td>
                    <td className="py-2 px-4 font-medium text-emerald-950 bg-emerald-50/30">
                      செய்முறை வகுப்பு (Practical Lab Classes)
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-extrabold text-emerald-900 bg-emerald-50/60">8 (4x2)</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-400">–</td>
                    <td className="py-2 px-3 text-center font-mono font-extrabold text-emerald-900 bg-emerald-50/60">7</td>
                  </tr>
                  <tr className="divide-x divide-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">6</td>
                    <td className="py-2 px-4 text-slate-800">உடற்கல்வி (Physical Education - PET)</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-orange-900 bg-orange-50/30">2</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-orange-900 bg-orange-50/30">2</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-orange-900 bg-orange-50/30">2</td>
                  </tr>
                  <tr className="divide-x divide-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">7</td>
                    <td className="py-2 px-4 text-slate-800">
                      பள்ளி இணைச் செயல்பாடுகள் (CCA) / கூடுதல் இணைச் செயல்பாடுகள் (ECA) / உடற்கல்வி
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-purple-900 bg-purple-50/30">2</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-purple-900 bg-purple-50/30">2</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-purple-900 bg-purple-50/30">2</td>
                  </tr>
                  <tr className="bg-blue-950 text-white font-extrabold divide-x divide-blue-800">
                    <td colSpan={2} className="py-2 px-4 text-right uppercase tracking-wider text-amber-300">
                      மொத்தம் (Total Periods)
                    </td>
                    <td className="py-2 px-3 text-center font-mono bg-emerald-700 text-white text-sm">40</td>
                    <td className="py-2 px-3 text-center font-mono bg-emerald-700 text-white text-sm">40</td>
                    <td className="py-2 px-3 text-center font-mono bg-emerald-700 text-white text-sm">40</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: WORKLOAD ANALYTICS (RECHARTS BAR CHART & CAPACITY AUDIT) */}
      {(activeSection === 'both' || activeSection === 'analytics') && (
        <WorkloadAnalyticsView
          config={config}
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          slots={slots}
          languageMode={languageMode}
        />
      )}

      {/* SECTION 1: CLASS WISE SUBJECT TEACHERS' ALLOTMENT */}
      {(activeSection === 'both' || activeSection === 'mapping') && (
        <div className="space-y-4">
          <div className="bg-[#1e3a8a] text-white py-2.5 px-4 rounded-t-xl font-bold uppercase tracking-wider text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-300" />
              <span>{isTa ? 'வகுப்பு வாரியான பாடம் - ஆசிரியர் ஒதுக்கீடு' : "CLASS WISE SUBJECT TEACHERS' ALLOTMENT"}</span>
            </div>
            <span className="text-xs font-normal text-blue-200">
              {isTa ? 'வகுப்புகள் 1 முதல் 12 வரை' : 'Classes 1 to 12'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(cls => {
              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden break-inside-avoid"
                >
                  <div className="bg-[#1e40af] text-white py-2 px-3 font-bold text-xs uppercase tracking-wider flex justify-between items-center">
                    <span>{isTa ? cls.nameTamil || cls.name : cls.name}</span>
                    <span className="text-[11px] font-normal text-blue-200">
                      {cls.roomNumber}
                    </span>
                  </div>

                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#2563eb] text-white divide-x divide-blue-400">
                        <th className="py-1.5 px-2.5 text-left font-bold uppercase tracking-wider w-2/5">
                          {isTa ? 'பாடம்' : 'Subject'}
                        </th>
                        <th className="py-1.5 px-2.5 text-left font-bold uppercase tracking-wider w-3/5">
                          {isTa ? 'ஆசிரியர் பெயர்' : "Teacher's Name"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans">
                      {subjects.map(sub => {
                        const mapping = mappings.find(
                          m => m.classId === cls.id && m.subjectId === sub.id
                        );
                        const assignedTeacherId = mapping?.teacherId || '';
                        const subjectDisplayName = isTa && sub.tamilName ? sub.tamilName : sub.name;

                        return (
                          <tr
                            key={sub.id}
                            className="divide-x divide-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-2 px-2.5 font-semibold text-slate-800 bg-slate-50/50">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-xs shrink-0"
                                  style={{ backgroundColor: sub.color }}
                                />
                                <span className="truncate">{subjectDisplayName}</span>
                              </div>
                            </td>
                            <td className="py-1 px-2">
                              <select
                                value={assignedTeacherId}
                                onChange={e =>
                                  onUpdateMapping(cls.id, sub.id, e.target.value)
                                }
                                className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                              >
                                <option value="">-- {isTa ? 'ஆசிரியர் தேர்வு' : 'Select Teacher'} --</option>
                                {teachers.map(t => {
                                  const handledIds = t.subjectsHandled || t.preferredSubjects || [];
                                  const handledCodes = handledIds
                                    .map(sid => subjects.find(s => s.id === sid)?.code)
                                    .filter(Boolean)
                                    .join(', ');
                                  const subjectsLabel = handledCodes ? ` [${handledCodes}]` : ` (${t.department})`;
                                  return (
                                    <option key={t.id} value={t.id}>
                                      {t.code} - {isTa && t.nameTamil ? t.nameTamil : t.name}{subjectsLabel}
                                    </option>
                                  );
                                })}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: TEACHER WISE PERIOD ALLOTMENT AND TEACHER'S PERIOD LOAD */}
      {(activeSection === 'both' || activeSection === 'workload') && (
        <div className="space-y-4 pt-4">
          <div className="bg-[#1e3a8a] text-white py-2.5 px-4 rounded-t-xl font-bold uppercase tracking-wider text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-300" />
              <span>{isTa ? `ஆசிரியர் வாராந்திர பணிச்சுமை அட்டைகள் (T-1 முதல் T-${teachers.length})` : "TEACHER WISE PERIOD ALLOTMENT AND TEACHER'S PERIOD LOAD"}</span>
            </div>
            <span className="text-xs font-normal text-blue-200">
              {isTa ? `${teachers.length} ஆசிரியர்கள்` : `${teachers.length} Faculty Members`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {teacherLoads.map(summary => {
              const teacher = summary.teacher;
              const isOver = summary.totalPeriods > teacher.maxWeeklyLoad;
              const teacherDisplayName = isTa && teacher.nameTamil ? teacher.nameTamil : teacher.name;

              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden flex flex-col justify-between break-inside-avoid"
                >
                  <div>
                    <div className="bg-[#1e3a8a] text-white py-1 px-2 text-center text-[10px] font-bold uppercase tracking-wider border-b border-blue-900">
                      {isTa ? 'வாராந்திர பாடவேளை சுமை' : 'WEEKLY PERIOD LOAD'}
                    </div>

                    <div className="bg-[#1e40af] text-white py-1.5 px-2 flex items-center justify-between border-b border-blue-800">
                      <div className="font-bold font-mono text-xs truncate max-w-[110px]" title={teacher.name}>
                        {teacher.code}
                      </div>
                      <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        isOver ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {summary.totalPeriods} / {teacher.maxWeeklyLoad}
                      </div>
                    </div>

                    <div className="bg-slate-50 px-2 py-1 text-[10px] text-slate-500 border-b border-slate-200 truncate" title={teacherDisplayName}>
                      {teacherDisplayName}
                    </div>

                    {/* Table of assignments */}
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#2563eb] text-white divide-x divide-blue-400">
                          <th className="py-1 px-2 text-left font-medium">{isTa ? 'வகுப்பு & பாடம்' : 'Class & Sub'}</th>
                          <th className="py-1 px-1.5 text-center font-medium w-12">{isTa ? 'வேளை' : 'Periods'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {summary.allocations.length > 0 ? (
                          summary.allocations.map(item => (
                            <tr key={`${item.classId}-${item.subjectId}`} className="divide-x divide-slate-100 hover:bg-slate-50">
                              <td className="py-1 px-2 font-medium text-slate-800 truncate max-w-[100px]" title={`${item.className} - ${item.subjectName}`}>
                                {item.className.replace('Class ', 'C')}: {item.subjectName}
                              </td>
                              <td className="py-1 px-1.5 text-center font-mono text-slate-700">
                                {item.periodCount}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="py-2 px-2 text-center text-slate-400 italic text-[10px]">
                              {isTa ? 'வகுப்புகள் ஒதுக்கப்படவில்லை' : 'No classes allocated'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Total Footer */}
                  <div className="border-t border-slate-300">
                    <div className="bg-[#1e40af] text-white py-1 px-2 flex items-center justify-between text-xs font-bold font-mono">
                      <span>{isTa ? 'மொத்தம்' : 'Total'}</span>
                      <span className="bg-[#15803d] px-2 py-0.2 rounded text-white font-bold">
                        {summary.totalPeriods}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
