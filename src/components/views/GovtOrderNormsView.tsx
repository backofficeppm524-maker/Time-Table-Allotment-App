import React from 'react';
import {
  ClassSection,
  SubjectPeriodRequirement,
  TimetableSlot,
  Subject,
} from '../../types/timetable';
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  FileText,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';
import { practicalSubjectsConfig } from '../../data/initialData';
import { LanguageMode } from '../Header';

interface GovtOrderNormsViewProps {
  classes: ClassSection[];
  subjects: Subject[];
  requirements: SubjectPeriodRequirement[];
  slots: TimetableSlot[];
  languageMode: LanguageMode;
  onApplyOfficialNorms: () => void;
}

export const GovtOrderNormsView: React.FC<GovtOrderNormsViewProps> = ({
  classes,
  subjects,
  requirements,
  slots,
  languageMode,
  onApplyOfficialNorms,
}) => {
  const isTa = languageMode === 'ta';

  // Audit compliance for each class against the official PDF
  const complianceResults = classes.map(cls => {
    const classReqs = requirements.filter(r => r.classId === cls.id);
    const totalWeeklyPeriods = classReqs.reduce((sum, r) => sum + r.assignedPerWeek, 0);

    const issues: string[] = [];

    // Check 40 periods
    if (totalWeeklyPeriods !== 40) {
      issues.push(
        isTa
          ? `வாரத்திற்கு 40 பாடவேளைகள் இருக்க வேண்டும் (தற்போது: ${totalWeeklyPeriods})`
          : `Total weekly periods must be exactly 40 (Current: ${totalWeeklyPeriods})`
      );
    }

    // Check Daily 1 period for Sports/Arts/ECA
    const ecaSubIds = subjects.filter(s => s.isECA).map(s => s.id);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

    let ecaDaysWithAtLeastOne = 0;
    days.forEach(d => {
      const ecaCountOnDay = classReqs
        .filter(r => ecaSubIds.includes(r.subjectId))
        .reduce((sum, r) => sum + (r.dailyDistribution[d] || 0), 0);
      if (ecaCountOnDay >= 1) ecaDaysWithAtLeastOne++;
    });

    if (ecaDaysWithAtLeastOne < 5) {
      issues.push(
        isTa
          ? `விளையாட்டு/கலை இணைச் செயல்பாடுகள் தினமும் 1 வேளை ஒதுக்கப்பட வேண்டும் (${ecaDaysWithAtLeastOne}/5 நாட்கள்)`
          : `Mandatory Sports/Arts/ECA period required every day (${ecaDaysWithAtLeastOne}/5 days covered)`
      );
    }

    // Check TN SPARK for Classes 6-9
    if (cls.grade >= 6 && cls.grade <= 9) {
      const sparkReq = classReqs.find(r => r.subjectId === 'sub-spark');
      if (!sparkReq || sparkReq.assignedPerWeek < 2) {
        issues.push(
          isTa
            ? 'TN SPARK (AI & Robotics) 2 பாடவேளைகள் ஒதுக்கப்பட வேண்டும்'
            : 'TN SPARK (AI & Robotics) requires 2 periods/week'
        );
      }
    }

    // Check Language Lab for Classes 6-8
    if (cls.grade >= 6 && cls.grade <= 8) {
      const llabReq = classReqs.find(r => r.subjectId === 'sub-lang-lab');
      if (!llabReq || llabReq.assignedPerWeek < 1) {
        issues.push(
          isTa
            ? 'மொழி ஆய்வகம் (Language Lab) 1 பாடவேளை ஒதுக்கப்பட வேண்டும்'
            : 'Language Lab requires 1 period/week'
        );
      }
    }

    // Check Practicals for Higher Secondary Science
    if (cls.stage === 'higher-secondary' && cls.stream === 'science') {
      const pracReq = classReqs.find(r => r.subjectId === 'sub-practical');
      if (!pracReq || pracReq.assignedPerWeek < 8) {
        issues.push(
          isTa
            ? 'செய்முறை வகுப்பு (Practicals) 8 பாடவேளைகள் (4 x 2) ஒதுக்கப்பட வேண்டும்'
            : 'Science stream requires 8 practical lab periods (4 x 2)'
        );
      }
    }

    return {
      cls,
      isCompliant: issues.length === 0,
      issues,
      totalPeriods: totalWeeklyPeriods,
      ecaCoverage: `${ecaDaysWithAtLeastOne}/5`,
    };
  });

  const compliantCount = complianceResults.filter(c => c.isCompliant).length;
  const isAllCompliant = compliantCount === classes.length;

  return (
    <div className="space-y-8">
      {/* Official Government Order Header (Page 1) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 relative overflow-hidden break-inside-avoid">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          {/* Tamil Nadu State Seal Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-500 shadow-inner mx-auto text-amber-900 font-bold">
            <Award className="w-8 h-8 text-amber-700" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
              தமிழ்நாடு அரசு · பள்ளிக் கல்வித் துறை
            </h1>
            <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
              Government of Tamil Nadu · School Education Department
            </h2>
          </div>

          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950">
            <p className="font-bold text-sm text-amber-900">
              விளையாட்டு, கலை மற்றும் கல்வி இணைச் செயல்பாடுகளுக்காக தினமும் ஒரு பிரிவேளை ஒதுக்கீடு செய்து வெளியிடப்படும் திருத்திய கால அட்டவணை 2026-2027
            </p>
            <p className="text-slate-600 font-medium">
              Revised Academic Time Table 2026-2027 (Allotting Daily One Period for Sports, Arts & Co-Curricular Activities)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-semibold font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              <span>09:30 AM - 04:10 PM</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-semibold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>8 Periods/Day · 40 Periods/Week</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-semibold font-mono">
              <BookOpen className="w-3.5 h-3.5 text-purple-700" />
              <span>Classes 1 to 12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Audit Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isTa ? 'அரசாணை வழிகாட்டி இணக்கத் தணிக்கை' : 'Government Order Compliance Audit'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isTa
                ? `14 வகுப்பு பிரிவுகளில் ${compliantCount} பிரிவுகள் அரசாணைக்கு 100% இணக்கமாக உள்ளன.`
                : `${compliantCount} of ${classes.length} class sections are 100% compliant with the official 2026-2027 norms.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAllCompliant ? (
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isTa ? 'அனைத்து வகுப்புகளும் இணக்கம் பெற்றவை' : 'Fully Compliant with G.O.'}</span>
              </span>
            ) : (
              <button
                onClick={onApplyOfficialNorms}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isTa ? 'அரசாணை விதிகளை உடனடியாகப் பொருத்துக' : 'Auto-Fix & Apply Official G.O. Norms'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Audit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {complianceResults.map(res => (
            <div
              key={res.cls.id}
              className={`p-3.5 rounded-xl border text-xs transition-all ${
                res.isCompliant
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900">
                  {isTa && res.cls.nameTamil ? res.cls.nameTamil : res.cls.name}
                </span>
                {res.isCompliant ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isTa ? 'இணக்கமானது' : 'Compliant'}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{isTa ? 'மாற்றம் தேவை' : 'Needs Action'}</span>
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>{isTa ? 'வாராந்திர வேளைகள்:' : 'Weekly Quota:'}</span>
                  <span className="font-mono font-bold text-slate-900">{res.totalPeriods} / 40</span>
                </div>
                <div className="flex justify-between">
                  <span>{isTa ? 'விளையாட்டு/கலை தினசரி ஒதுக்கீடு:' : 'Daily Sports/ECA Spread:'}</span>
                  <span className="font-mono font-bold text-slate-900">{res.ecaCoverage} {isTa ? 'நாட்கள்' : 'Days'}</span>
                </div>
              </div>

              {res.issues.length > 0 && (
                <ul className="mt-2 pt-2 border-t border-rose-200 list-disc pl-4 text-[11px] text-rose-700 space-y-0.5">
                  {res.issues.map((iss, i) => (
                    <li key={i}>{iss}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Official PDF Specification Tables (Pages 2, 3, 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Classes 6 to 10 (Page 2) */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-[#1e3a8a] text-white py-2.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>{isTa ? 'வகுப்பு 6 முதல் 10 வரை பாடவேளை அட்டவணை' : 'CLASSES 6 TO 10 PERIOD ALLOTMENT (PAGE 2)'}</span>
            <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded text-blue-200">G.O. Page 2</span>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#2563eb] text-white divide-x divide-blue-400">
                <th className="py-1.5 px-2 text-center w-10">வ.எண்</th>
                <th className="py-1.5 px-3 text-left">பாடம் (Subject)</th>
                <th className="py-1.5 px-2 text-center w-16">6 - 8</th>
                <th className="py-1.5 px-2 text-center w-16">9</th>
                <th className="py-1.5 px-2 text-center w-16">10</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">1</td><td className="py-1 px-3 font-semibold text-slate-900">தமிழ் (Tamil)</td><td className="py-1 px-2 text-center font-mono">6</td><td className="py-1 px-2 text-center font-mono">6</td><td className="py-1 px-2 text-center font-mono">6</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">2</td><td className="py-1 px-3 font-semibold text-slate-900">ஆங்கிலம் (English)</td><td className="py-1 px-2 text-center font-mono">5</td><td className="py-1 px-2 text-center font-mono">6</td><td className="py-1 px-2 text-center font-mono">6</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">3</td><td className="py-1 px-3 font-semibold text-slate-900">கணிதம் (Mathematics)</td><td className="py-1 px-2 text-center font-mono">7</td><td className="py-1 px-2 text-center font-mono">7</td><td className="py-1 px-2 text-center font-mono">7</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">4</td><td className="py-1 px-3 font-semibold text-slate-900">அறிவியல் (Science)</td><td className="py-1 px-2 text-center font-mono">7</td><td className="py-1 px-2 text-center font-mono">7</td><td className="py-1 px-2 text-center font-mono">7</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">5</td><td className="py-1 px-3 font-semibold text-slate-900">சமூக அறிவியல் (Social Science)</td><td className="py-1 px-2 text-center font-mono">6</td><td className="py-1 px-2 text-center font-mono">6</td><td className="py-1 px-2 text-center font-mono">6</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">6</td><td className="py-1 px-3 text-slate-800">மொழி ஆய்வகம் (Language Lab)</td><td className="py-1 px-2 text-center font-mono font-bold text-blue-800">1</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">7</td><td className="py-1 px-3 text-slate-800">நூலகம்/ விழுமியக் கல்வி (Library/Val Ed)</td><td className="py-1 px-2 text-center font-mono">1</td><td className="py-1 px-2 text-center font-mono">1</td><td className="py-1 px-2 text-center font-mono">1</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">8</td><td className="py-1 px-3 font-medium text-amber-800 bg-amber-50/50">உடற்கல்வி (Physical Education)</td><td className="py-1 px-2 text-center font-mono font-bold text-amber-900">3</td><td className="py-1 px-2 text-center font-mono font-bold text-amber-900">3</td><td className="py-1 px-2 text-center font-mono font-bold text-amber-900">3</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">9</td><td className="py-1 px-3 text-slate-800">பள்ளி இணைச் செயல்பாடுகள் (CCA/ECA)</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td><td className="py-1 px-2 text-center font-mono">2</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">10</td><td className="py-1 px-3 text-slate-800">இணைச் செயல்பாடு / உடற்கல்வி (CCA/PET)</td><td className="py-1 px-2 text-center font-mono">2</td><td className="py-1 px-2 text-center font-mono">2</td><td className="py-1 px-2 text-center font-mono">2</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">11</td><td className="py-1 px-3 font-medium text-indigo-900 bg-indigo-50/40">செயற்கை நுண்ணறிவு & எந்திரனியல் (TN SPARK)</td><td className="py-1 px-2 text-center font-mono font-bold text-indigo-900">2</td><td className="py-1 px-2 text-center font-mono font-bold text-indigo-900">2</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td></tr>
              <tr className="bg-[#1e40af] text-white font-bold divide-x divide-blue-500"><td colSpan={2} className="py-1.5 px-3 uppercase text-right">மொத்தம் (Total)</td><td className="py-1.5 px-2 text-center font-mono bg-[#15803d]">40</td><td className="py-1.5 px-2 text-center font-mono bg-[#15803d]">40</td><td className="py-1.5 px-2 text-center font-mono bg-[#15803d]">40</td></tr>
            </tbody>
          </table>
        </div>

        {/* Table 2: Classes 11 & 12 (Page 2) */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-[#1e3a8a] text-white py-2.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>{isTa ? 'வகுப்பு 11 முதல் 12 வரை பாடவேளை அட்டவணை' : 'CLASSES 11 TO 12 PERIOD ALLOTMENT (PAGE 2)'}</span>
            <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded text-blue-200">G.O. Page 2</span>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#2563eb] text-white divide-x divide-blue-400">
                <th className="py-1.5 px-2 text-center w-10">வ.எண்</th>
                <th className="py-1.5 px-3 text-left">பாடம் (Subject)</th>
                <th className="py-1.5 px-2 text-center w-20">அறிவியல் (Science)</th>
                <th className="py-1.5 px-2 text-center w-20">கலை (Arts)</th>
                <th className="py-1.5 px-2 text-center w-20">தொழிற்கல்வி (Vocational)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">1</td><td className="py-1 px-3 font-semibold text-slate-900">மொழிப் பாடம் (Language - Tamil)</td><td className="py-1 px-2 text-center font-mono">4</td><td className="py-1 px-2 text-center font-mono">4</td><td className="py-1 px-2 text-center font-mono">4</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">2</td><td className="py-1 px-3 font-semibold text-slate-900">ஆங்கிலம் (English)</td><td className="py-1 px-2 text-center font-mono">4</td><td className="py-1 px-2 text-center font-mono">4</td><td className="py-1 px-2 text-center font-mono">4</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">3</td><td className="py-1 px-3 font-semibold text-slate-900">முதன்மைப் பாடங்கள் (Core Majors)</td><td className="py-1 px-2 text-center font-mono">20 (5x4)</td><td className="py-1 px-2 text-center font-mono">28 (7x4)</td><td className="py-1 px-2 text-center font-mono">14 (7x2)</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">4</td><td className="py-1 px-3 text-slate-800">தொழிற்கல்வி பாடம் (Vocational)</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td><td className="py-1 px-2 text-center font-mono">7</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">5</td><td className="py-1 px-3 font-medium text-cyan-900 bg-cyan-50/40">செய்முறை வகுப்பு (Practicals)</td><td className="py-1 px-2 text-center font-mono font-bold text-cyan-900">8 (4x2)</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td><td className="py-1 px-2 text-center font-mono">7</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">6</td><td className="py-1 px-3 text-amber-800 font-medium bg-amber-50/50">உடற்கல்வி (Physical Education)</td><td className="py-1 px-2 text-center font-mono font-bold text-amber-900">2</td><td className="py-1 px-2 text-center font-mono font-bold text-amber-900">2</td><td className="py-1 px-2 text-center font-mono font-bold text-amber-900">2</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">7</td><td className="py-1 px-3 text-slate-800">பள்ளி இணைச் செயல்பாடுகள் ( CCA ) / கூடுதல் இணைச் செயல்பாடுகள் ( ECA ) / உடற்கல்வி</td><td className="py-1 px-2 text-center font-mono">2</td><td className="py-1 px-2 text-center font-mono">2</td><td className="py-1 px-2 text-center font-mono">2</td></tr>
              <tr className="bg-[#1e40af] text-white font-bold divide-x divide-blue-500"><td colSpan={2} className="py-1.5 px-3 uppercase text-right">மொத்தம் (Total)</td><td className="py-1.5 px-2 text-center font-mono bg-[#15803d]">40</td><td className="py-1.5 px-2 text-center font-mono bg-[#15803d]">40</td><td className="py-1.5 px-2 text-center font-mono bg-[#15803d]">40</td></tr>
            </tbody>
          </table>

          {/* Practical Subjects Classification Footer */}
          <div className="p-3 bg-emerald-50/60 border-t border-emerald-100 text-[11px] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isTa ? 'அதிகாரப்பூர்வ செய்முறைப் பாடங்கள் (Practical Subjects):' : 'Official Practical Subjects Reference:'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="font-bold text-sky-900 block mb-0.5">
                  {isTa ? '• அறிவியல் பிரிவு செய்முறை (Science Group - 7):' : '• Science Group Practicals (7 subjects):'}
                </span>
                <span className="text-[10px] text-slate-600">
                  Physics, Chemistry, Computer Science, Bio-Botany, Bio-Zoology, Botany, Zoology (2 periods each)
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="font-bold text-amber-900 block mb-0.5">
                  {isTa ? '• தொழிற்கல்வி பிரிவு செய்முறை (Vocational Group - 2):' : '• Vocational Group Practicals (2 subjects):'}
                </span>
                <span className="text-[10px] text-slate-600">
                  Agri-P (வேளாண்மை செய்முறை), Emp Skills (வேலைவாய்ப்புத் திறன் செய்முறை) (7 periods each)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table 3: Bell Timings (Page 3) */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-[#1e3a8a] text-white py-2.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>{isTa ? 'வகுப்பு 6 முதல் 12 வரை நேர ஒதுக்கீடு விவரங்கள்' : 'CLASSES 6 TO 12 BELL TIMINGS (PAGE 3)'}</span>
            <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded text-blue-200">G.O. Page 3</span>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#2563eb] text-white divide-x divide-blue-400">
                <th className="py-1.5 px-2 text-center w-12">வ.எண்</th>
                <th className="py-1.5 px-4 text-left">பாடவேளை (Period)</th>
                <th className="py-1.5 px-4 text-center">நேர ஒதுக்கீடு (Time Allotment)</th>
                <th className="py-1.5 px-3 text-center w-24">கால அளவு</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">1</td><td className="py-1 px-4 font-bold text-blue-900">I</td><td className="py-1 px-4 text-center font-mono font-semibold">09.30 - 10.15</td><td className="py-1 px-3 text-center text-slate-500">45 நிமிடம்</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">2</td><td className="py-1 px-4 font-bold text-blue-900">II</td><td className="py-1 px-4 text-center font-mono font-semibold">10.15 - 11.00</td><td className="py-1 px-3 text-center text-slate-500">45 நிமிடம்</td></tr>
              <tr className="bg-amber-50/70 text-amber-900 font-semibold"><td className="py-1 px-2 text-center font-mono">3</td><td className="py-1 px-4">இடைவேளை (Morning Interval)</td><td className="py-1 px-4 text-center font-mono">11.00 - 11.10</td><td className="py-1 px-3 text-center">10 நிமிடம்</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">4</td><td className="py-1 px-4 font-bold text-blue-900">III</td><td className="py-1 px-4 text-center font-mono font-semibold">11.10 - 11.55</td><td className="py-1 px-3 text-center text-slate-500">45 நிமிடம்</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">5</td><td className="py-1 px-4 font-bold text-blue-900">IV</td><td className="py-1 px-4 text-center font-mono font-semibold">11.55 - 12.40</td><td className="py-1 px-3 text-center text-slate-500">45 நிமிடம்</td></tr>
              <tr className="bg-amber-100/70 text-amber-950 font-bold"><td className="py-1 px-2 text-center font-mono">6</td><td className="py-1 px-4">உணவு இடைவேளை (Lunch Break)</td><td className="py-1 px-4 text-center font-mono">12.40 - 01.20</td><td className="py-1 px-3 text-center">40 நிமிடம்</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">7</td><td className="py-1 px-4 font-bold text-blue-900">V</td><td className="py-1 px-4 text-center font-mono font-semibold">01.20 - 02.00</td><td className="py-1 px-3 text-center text-slate-500">40 நிமிடம்</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">8</td><td className="py-1 px-4 font-bold text-blue-900">VI</td><td className="py-1 px-4 text-center font-mono font-semibold">02.00 - 02.40</td><td className="py-1 px-3 text-center text-slate-500">40 நிமிடம்</td></tr>
              <tr className="bg-amber-50/70 text-amber-900 font-semibold"><td className="py-1 px-2 text-center font-mono">9</td><td className="py-1 px-4">இடைவேளை (Afternoon Interval)</td><td className="py-1 px-4 text-center font-mono">02.40 - 02.50</td><td className="py-1 px-3 text-center">10 நிமிடம்</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">10</td><td className="py-1 px-4 font-bold text-blue-900">VII</td><td className="py-1 px-4 text-center font-mono font-semibold">02.50 - 03.30</td><td className="py-1 px-3 text-center text-slate-500">40 நிமிடம்</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">11</td><td className="py-1 px-4 font-bold text-blue-900">VIII</td><td className="py-1 px-4 text-center font-mono font-semibold">03.30 - 04.10</td><td className="py-1 px-3 text-center text-slate-500">40 நிமிடம்</td></tr>
            </tbody>
          </table>
        </div>

        {/* Table 4: Primary 1 to 5 (Page 4) */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-[#1e3a8a] text-white py-2.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>{isTa ? 'வகுப்பு 1 முதல் 5 வரை நேர & பாட ஒதுக்கீடு' : 'CLASSES 1 TO 5 PRIMARY ALLOTMENT (PAGE 4)'}</span>
            <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded text-blue-200">G.O. Page 4</span>
          </div>

          <div className="p-3 bg-slate-50 border-b text-[11px] space-y-1">
            <p className="font-semibold text-slate-900">
              {isTa ? 'தொடக்கப் பள்ளி நேர அமைப்பு (4 முக்கிய நேரத் தொகுதிகள்):' : 'Primary School Daily Timing Blocks:'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>• 09.30 - 11.00: பாடவேளை I (90 நிமி)</div>
              <div>• 11.10 - 12.40: பாடவேளை II (90 நிமி)</div>
              <div>• 01.20 - 01.45: நூலகம் / விழுமியம் (25 நிமி)</div>
              <div>• 01.45 - 03.15: பாடவேளை III (90 நிமி)</div>
              <div>• 03.25 - 04.10: பாடவேளை IV (45 நிமி)</div>
              <div>• இடைவேளை: 11.00-11.10 & 03.15-03.25</div>
            </div>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#2563eb] text-white divide-x divide-blue-400">
                <th className="py-1.5 px-2 text-center w-10">வ.எண்</th>
                <th className="py-1.5 px-3 text-left">பாடம் (Subject)</th>
                <th className="py-1.5 px-2 text-center w-20">வகுப்பு 1-2</th>
                <th className="py-1.5 px-2 text-center w-20">வகுப்பு 3-5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">1</td><td className="py-1 px-3 font-semibold text-slate-900">தமிழ் (Tamil)</td><td className="py-1 px-2 text-center font-mono">5 (90 நிமி)</td><td className="py-1 px-2 text-center font-mono">4 (90 நிமி)</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">2</td><td className="py-1 px-3 font-semibold text-slate-900">ஆங்கிலம் (English)</td><td className="py-1 px-2 text-center font-mono">4 (90 நிமி)</td><td className="py-1 px-2 text-center font-mono">4 (90 நிமி)</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">3</td><td className="py-1 px-3 font-semibold text-slate-900">கணிதம் (Mathematics)</td><td className="py-1 px-2 text-center font-mono">4 (90 நிமி)</td><td className="py-1 px-2 text-center font-mono">3(90நி) + 1(45நி)</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">4</td><td className="py-1 px-3 font-semibold text-slate-900">அறிவியல் (Science)</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td><td className="py-1 px-2 text-center font-mono">2 (90 நிமி)</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">5</td><td className="py-1 px-3 font-semibold text-slate-900">சமூக அறிவியல் (Social Science)</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td><td className="py-1 px-2 text-center font-mono">2 (90 நிமி)</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">6</td><td className="py-1 px-3 text-slate-800">சுற்றுச்சூழல் கல்வி (EVS)</td><td className="py-1 px-2 text-center font-mono">2 (90 நிமி)</td><td className="py-1 px-2 text-center font-mono text-slate-400">-</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">7</td><td className="py-1 px-3 text-amber-800 font-medium bg-amber-50/50">உடற்கல்வி (Physical Education)</td><td className="py-1 px-2 text-center font-mono font-bold text-amber-900">3 (45 நிமி)</td><td className="py-1 px-2 text-center font-mono font-bold text-amber-900">3 (45 நிமி)</td></tr>
              <tr className="divide-x divide-slate-100 hover:bg-slate-50"><td className="py-1 px-2 text-center font-mono">8</td><td className="py-1 px-3 text-pink-800">இசை / கலை (ம) கைவினை / SEL</td><td className="py-1 px-2 text-center font-mono">2 (45 நிமி)</td><td className="py-1 px-2 text-center font-mono">1 (45 நிமி)</td></tr>
              <tr className="bg-[#1e40af] text-white font-bold divide-x divide-blue-500"><td colSpan={2} className="py-1.5 px-3 uppercase text-right">மொத்தம் (Total Periods Eq)</td><td className="py-1.5 px-2 text-center font-mono bg-[#15803d]">40</td><td className="py-1.5 px-2 text-center font-mono bg-[#15803d]">40</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
