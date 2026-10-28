import React, { useState } from 'react';
import {
  SchoolConfig,
  ClassSection,
  Teacher,
  Subject,
  ClassSubjectTeacherMapping,
  SubjectPeriodRequirement,
  TimetableSlot,
  TimetableClash,
} from '../../types/timetable';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { LanguageMode } from '../Header';
import { DailyValidationPanel } from './DailyValidationPanel';

interface GeneratorViewProps {
  config: SchoolConfig;
  classes: ClassSection[];
  teachers: Teacher[];
  subjects: Subject[];
  mappings: ClassSubjectTeacherMapping[];
  requirements: SubjectPeriodRequirement[];
  slots: TimetableSlot[];
  clashes: TimetableClash[];
  languageMode: LanguageMode;
  onGenerate: (seedFixed: boolean) => void;
  onClearSlots: () => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  config,
  classes,
  teachers,
  subjects,
  requirements,
  slots,
  clashes,
  languageMode,
  onGenerate,
  onClearSlots,
}) => {
  const [seedFixedSlots, setSeedFixedSlots] = useState<boolean>(true);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [showValidation, setShowValidation] = useState<boolean>(true);

  const isTa = languageMode === 'ta';

  const handleRunSolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      onGenerate(seedFixedSlots);
      setIsSolving(false);
    }, 400);
  };

  const totalPossibleSlots = classes.reduce((sum, c) => sum + (c.periodsPerDay || 8) * 5, 0);
  const filledSlotsCount = slots.length;
  const coveragePercent = totalPossibleSlots > 0 ? Math.round((filledSlotsCount / totalPossibleSlots) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {isTa ? 'அதிநவீன கால அட்டவணை உருவாக்கி & தீர்வு இயந்திரம்' : 'Intelligent Timetable Generator & Solver Engine'}
            </h2>
            <p className="text-xs text-slate-500">
              {isTa
                ? 'அரசாணை 2026-2027 வழிகாட்டு நெறிமுறைகளின்படி வகுப்பு 1 முதல் 12 வரை 100% மோதலற்ற கால அட்டவணையை தானாக உருவாக்குகிறது.'
                : 'Constraint satisfaction algorithm that analyzes class period allotments, faculty mappings, room capacities, and eliminates timetable collisions.'}
            </p>
          </div>
        </div>
      </div>

      {/* Solver Diagnostics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {isTa ? 'மொத்த பாடவேளைகள்' : 'Total Slots Scheduled'}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {filledSlotsCount} <span className="text-xs font-normal text-slate-400">/ {totalPossibleSlots}</span>
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            {coveragePercent}% {isTa ? 'நிறைவுற்றது' : 'Coverage'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {isTa ? 'மோதல் நிலை' : 'Conflict Status'}
          </div>
          <div className="text-2xl font-bold font-mono mt-1">
            {clashes.length === 0 ? (
              <span className="text-emerald-600">0</span>
            ) : (
              <span className="text-rose-600">{clashes.length}</span>
            )}
          </div>
          <div className="text-xs font-medium mt-1">
            {clashes.length === 0 ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {isTa ? '100% மோதலற்றது' : '100% Conflict Free'}
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {isTa ? 'சரிசெய்ய வேண்டியவை' : 'Overlaps to fix'}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {isTa ? 'வகுப்பு பிரிவுகள்' : 'Total Classes'}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {classes.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isTa ? 'வகுப்பு 1 முதல் 12 வரை' : 'Classes 1 to 12'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {isTa ? 'செயலில் உள்ள ஆசிரியர்கள்' : 'Active Faculty'}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {teachers.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            T-1 to T-30 Faculty Pool
          </div>
        </div>
      </div>

      {/* Pre-Generation Daily & Subject Allotment Validation Panel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm">
              {isTa ? 'அட்டவணை உருவாக்கும் முன் சரிபார்ப்பு (Pre-Generation Validation)' : 'Pre-Generation Allotment Deficit Check'}
            </h3>
          </div>
          <button
            onClick={() => setShowValidation(!showValidation)}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900"
          >
            {showValidation ? (isTa ? 'மறைக்க ▲' : 'Collapse ▲') : (isTa ? 'காட்டுக ▼' : 'Expand ▼')}
          </button>
        </div>

        {showValidation && (
          <DailyValidationPanel
            config={config}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            requirements={requirements}
            slots={slots}
            languageMode={languageMode}
          />
        )}
      </div>

      {/* Solver Configuration Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            {isTa ? 'அட்டவணை விதிகள் & நிபந்தனைகள்' : 'Algorithmic Rules & Constraints'}
          </h3>
        </div>

        <div className="space-y-4 text-xs text-slate-700">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isTa ? 'பூஜ்ஜிய ஆசிரியர் மோதல் விதி (கட்டாயக் கட்டுப்பாடு)' : 'Strict Zero Teacher Collision (Hard Constraint)'}</span>
              </div>
              <p className="text-slate-500 mt-0.5">
                {isTa
                  ? 'ஒரே நேரத்தில் எந்த ஆசிரியரும் ஒன்றுக்கும் மேற்பட்ட வகுப்பறையில் கற்பிக்க நியமிக்கப்பட மாட்டார்கள்.'
                  : 'Guarantees that no instructor is scheduled to teach in more than one classroom during the same period and day.'}
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={seedFixedSlots}
              onChange={e => setSeedFixedSlots(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <div className="font-semibold text-slate-900">
                {isTa ? 'வழிகாட்டி நெறிமுறைகளின் ஆரம்ப நிலைகளை நிலைநிறுத்துக' : 'Preserve Benchmark Template Slots (Document Exact Anchor)'}
              </div>
              <p className="text-slate-500 mt-0.5">
                {isTa
                  ? 'அரசாணை ஆவணத்தில் குறிப்பிடப்பட்டுள்ள ஆரம்ப மாதிரி நிலைகளை நிலைநிறுத்துகிறது.'
                  : 'Locks exact anchor periods shown in document (Class 1 Mon-1 Tamil, Mon-2 English, etc.).'}
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={true}
              readOnly={true}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded"
            />
            <div>
              <div className="font-semibold text-slate-900">
                {isTa ? 'தினசரி 1 பிரிவேளை விளையாட்டு & கலைச் செயல்பாடுகள் (G.O. 2026-2027)' : 'Mandatory Daily 1 Period for Sports & Co-Curricular (G.O. 2026-2027)'}
              </div>
              <p className="text-slate-500 mt-0.5">
                {isTa
                  ? 'அனைத்து வகுப்புகளுக்கும் (1 முதல் 12 வரை) தினமும் ஒரு பிரிவேளை உடற்கல்வி, கலை அல்லது இணைச் செயல்பாடுகளுக்கு ஒதுக்கப்படுவதை உறுதிசெய்கிறது.'
                  : 'Guarantees that every class has at least 1 designated period daily for PET, Arts, Crafts, or CCA/ECA.'}
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
          <button
            onClick={onClearSlots}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isTa ? 'அட்டவணையை அழிக்க' : 'Clear Timetable Slots'}</span>
          </button>

          <button
            onClick={handleRunSolve}
            disabled={isSolving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isSolving ? (isTa ? 'கணித்து உருவாக்குகிறது...' : 'Solving Constraints...') : (isTa ? 'மோதலற்ற அட்டவணை உருவாக்குக' : 'Generate Clash-Free Timetable')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
