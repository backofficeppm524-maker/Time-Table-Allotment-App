import React, { useState } from 'react';
import {
  SchoolConfig,
  DayOfWeek,
  Teacher,
  ClassSection,
  Subject,
  AcademicStage,
  AcademicStream,
} from '../../types/timetable';
import {
  X,
  Save,
  Download,
  Upload,
  Check,
  Plus,
  Trash2,
  Edit2,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  Database,
  Search,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { LanguageMode } from '../Header';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  teachers: Teacher[];
  classes: ClassSection[];
  subjects: Subject[];
  languageMode: LanguageMode;
  onSaveConfig: (newConfig: SchoolConfig) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onAddClass: (cls: ClassSection) => void;
  onUpdateClass: (cls: ClassSection) => void;
  onDeleteClass: (classId: string) => void;
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onExportAllJSON: () => void;
  onImportJSON: (jsonString: string) => void;
}

type SettingsTab = 'teachers' | 'classes' | 'subjects' | 'school' | 'backup';

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  teachers,
  classes,
  subjects,
  languageMode,
  onSaveConfig,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onExportAllJSON,
  onImportJSON,
}) => {
  if (!isOpen) return null;

  const isTa = languageMode === 'ta';

  const [activeTab, setActiveTab] = useState<SettingsTab>('teachers');

  // Search queries for lists
  const [teacherSearch, setTeacherSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');

  // School config state
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [schoolNameTamil, setSchoolNameTamil] = useState(config.schoolNameTamil || '');
  const [subTitle, setSubTitle] = useState(config.subTitle);
  const [subTitleTamil, setSubTitleTamil] = useState(config.subTitleTamil || '');
  const [academicYear, setAcademicYear] = useState(config.academicYear);
  const [includeSaturday, setIncludeSaturday] = useState(config.days.includes('Saturday'));
  const [periods, setPeriods] = useState(config.periodTimings);

  // Forms for Add/Edit
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [teacherForm, setTeacherForm] = useState<Omit<Teacher, 'id'>>({
    code: `T-${teachers.length + 1}`,
    name: '',
    nameTamil: '',
    department: 'General',
    maxWeeklyLoad: 28,
    subjectsHandled: [],
    preferredSubjects: [],
  });

  const [editingClass, setEditingClass] = useState<ClassSection | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [classForm, setClassForm] = useState<Omit<ClassSection, 'id'>>({
    grade: 6,
    name: 'Class 6 - Section A',
    nameTamil: 'வகுப்பு 6 - அ',
    section: 'A',
    stage: 'middle',
    stream: 'general',
    periodsPerDay: 8,
    roomNumber: 'Room 101',
  });

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState<Omit<Subject, 'id'>>({
    code: 'sub-new',
    name: '',
    tamilName: '',
    color: '#3b82f6',
    isCore: true,
    isLab: false,
    isECA: false,
  });

  // Delete confirmations
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteType, setConfirmDeleteType] = useState<'teacher' | 'class' | 'subject' | null>(null);

  // Save config
  const handleSaveConfig = () => {
    const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (includeSaturday) days.push('Saturday');

    onSaveConfig({
      ...config,
      schoolName,
      schoolNameTamil,
      subTitle,
      subTitleTamil,
      academicYear,
      days,
      periodTimings: periods,
    });
  };

  // Period timings
  const handlePeriodTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const next = [...periods];
    next[index] = { ...next[index], [field]: value };
    setPeriods(next);
  };

  // Teacher handlers
  const handleSaveTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim()) return;

    if (editingTeacher) {
      onUpdateTeacher({
        ...editingTeacher,
        ...teacherForm,
        preferredSubjects: teacherForm.subjectsHandled || teacherForm.preferredSubjects || [],
      });
      setEditingTeacher(null);
    } else {
      const newId = `t-${Date.now()}`;
      onAddTeacher({
        id: newId,
        ...teacherForm,
        preferredSubjects: teacherForm.subjectsHandled || teacherForm.preferredSubjects || [],
      });
      setIsAddingTeacher(false);
    }

    // Reset
    setTeacherForm({
      code: `T-${teachers.length + 2}`,
      name: '',
      nameTamil: '',
      department: 'General',
      maxWeeklyLoad: 28,
      subjectsHandled: [],
      preferredSubjects: [],
    });
  };

  // Class handlers
  const handleSaveClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;

    if (editingClass) {
      onUpdateClass({
        ...editingClass,
        ...classForm,
      });
      setEditingClass(null);
    } else {
      const newId = `cls-${Date.now()}`;
      onAddClass({
        id: newId,
        ...classForm,
      });
      setIsAddingClass(false);
    }
  };

  // Subject handlers
  const handleSaveSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;

    if (editingSubject) {
      onUpdateSubject({
        ...editingSubject,
        ...subjectForm,
      });
      setEditingSubject(null);
    } else {
      const newId = `sub-${Date.now()}`;
      onAddSubject({
        id: newId,
        ...subjectForm,
      });
      setIsAddingSubject(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        if (content) {
          onImportJSON(content);
          onClose();
        }
      };
      reader.readAsText(file);
    }
  };

  // Filtered lists
  const filteredTeachers = teachers.filter(t => {
    const q = teacherSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      (t.nameTamil && t.nameTamil.toLowerCase().includes(q))
    );
  });

  const filteredClasses = classes.filter(c => {
    const q = classSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.roomNumber.toLowerCase().includes(q) ||
      c.stage.toLowerCase().includes(q) ||
      (c.nameTamil && c.nameTamil.toLowerCase().includes(q))
    );
  });

  const filteredSubjects = subjects.filter(s => {
    const q = subjectSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.tamilName && s.tamilName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-800 flex items-center justify-center font-bold">
              <Database className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide uppercase font-sans">
                {isTa ? 'முதன்மை தரவு & பள்ளி அமைப்புகள் மேலாண்மை' : 'Master Data Management & School Settings'}
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                {isTa
                  ? 'ஆசிரியர்கள், வகுப்புகள் மற்றும் பாடங்களை சேர்க்க, திருத்த மற்றும் நீக்கலாம்.'
                  : 'Add, edit, or delete teachers, classes, subjects, bell schedule and school profile.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'teachers'
                ? 'border-blue-900 text-blue-900 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>{isTa ? `ஆசிரியர்கள் (${teachers.length})` : `Teachers (${teachers.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'classes'
                ? 'border-blue-900 text-blue-900 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>{isTa ? `வகுப்புகள் (${classes.length})` : `Classes (${classes.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'border-blue-900 text-blue-900 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>{isTa ? `பாடங்கள் (${subjects.length})` : `Subjects (${subjects.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('school')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'school'
                ? 'border-blue-900 text-blue-900 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>{isTa ? 'பள்ளி & மணிநேரம்' : 'School & Timings'}</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-blue-900 text-blue-900 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{isTa ? 'காப்புப் பிரதி' : 'Backup & JSON'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {/* TAB 1: TEACHERS MANAGEMENT */}
          {activeTab === 'teachers' && (
            <div className="space-y-4">
              {/* Top toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={isTa ? 'ஆசிரியர் தேடுக...' : 'Search teacher name or code...'}
                    value={teacherSearch}
                    onChange={e => setTeacherSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingTeacher(null);
                    setTeacherForm({
                      code: `T-${teachers.length + 1}`,
                      name: '',
                      nameTamil: '',
                      department: 'General',
                      maxWeeklyLoad: 28,
                      subjectsHandled: [],
                      preferredSubjects: [],
                    });
                    setIsAddingTeacher(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isTa ? 'புதிய ஆசிரியர் சேர்க்க' : '+ Add New Teacher'}</span>
                </button>
              </div>

              {/* Add / Edit Form Modal Inline */}
              {(isAddingTeacher || editingTeacher) && (
                <form
                  onSubmit={handleSaveTeacherSubmit}
                  className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                    <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wide">
                      {editingTeacher
                        ? isTa
                          ? `ஆசிரியர் திருத்துக (${editingTeacher.code})`
                          : `Edit Teacher: ${editingTeacher.code}`
                        : isTa
                        ? 'புதிய ஆசிரியர் பதிவு'
                        : 'Register New Teacher'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTeacher(false);
                        setEditingTeacher(null);
                      }}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        {isTa ? 'ஆசிரியர் குறியீடு (Code)' : 'Teacher Code'}
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherForm.code}
                        onChange={e => setTeacherForm({ ...teacherForm, code: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-xs"
                        placeholder="T-31"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        {isTa ? 'பெயர் (English)' : 'Full Name (English)'}
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherForm.name}
                        onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        placeholder="R. Vijayakumar"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        {isTa ? 'பெயர் (தமிழ்)' : 'Name (Tamil)'}
                      </label>
                      <input
                        type="text"
                        value={teacherForm.nameTamil || ''}
                        onChange={e => setTeacherForm({ ...teacherForm, nameTamil: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        placeholder="இரா. விஜயகுமார்"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        {isTa ? 'துறை (Department)' : 'Department'}
                      </label>
                      <select
                        value={teacherForm.department}
                        onChange={e => setTeacherForm({ ...teacherForm, department: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        <option value="Tamil">Tamil / தமிழ்</option>
                        <option value="English">English / ஆங்கிலம்</option>
                        <option value="Mathematics">Mathematics / கணிதம்</option>
                        <option value="Science">Science / அறிவியல்</option>
                        <option value="Social Science">Social Science / சமூக அறிவியல்</option>
                        <option value="Physics">Physics / இயற்பியல்</option>
                        <option value="Chemistry">Chemistry / வேதியியல்</option>
                        <option value="Biology">Biology / உயிரியல்</option>
                        <option value="Computer Science">Computer Science / கணினி</option>
                        <option value="Physical Education">Physical Education / விளையாட்டு (PET)</option>
                        <option value="Vocational">Vocational / தொழிற்கல்வி</option>
                        <option value="General">General / பொது</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        {isTa ? 'அதிகபட்ச வாராந்திர சுமை' : 'Weekly Max Load'}
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={40}
                        value={teacherForm.maxWeeklyLoad}
                        onChange={e =>
                          setTeacherForm({ ...teacherForm, maxWeeklyLoad: parseInt(e.target.value) || 28 })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Multi-Subject Selection for Teacher */}
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-slate-800 text-xs">
                        {isTa ? 'கற்பிக்கும் பாடங்கள் (ஒரு ஆசிரியர் பல பாடங்கள் எடுக்கலாம்)' : 'Subjects Handled (One teacher can take multiple subjects)'}
                      </label>
                      <span className="text-[10px] text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-full font-medium">
                        {isTa ? 'எ.கா: CS (11A, 12A), ES (11E, 12E)' : 'e.g. CS (11A, 12A), ES (11E, 12E)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 bg-white p-2.5 rounded-lg border border-slate-300 max-h-40 overflow-y-auto">
                      {subjects.map(s => {
                        const current = teacherForm.subjectsHandled || teacherForm.preferredSubjects || [];
                        const isSelected = current.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? current.filter(id => id !== s.id)
                                : [...current, s.id];
                              setTeacherForm({
                                ...teacherForm,
                                subjectsHandled: updated,
                                preferredSubjects: updated,
                              });
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-left text-[11px] transition-colors border ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/90 text-blue-900 font-bold'
                                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-xs shrink-0"
                              style={{ backgroundColor: s.color }}
                            />
                            <span className="truncate flex-1">
                              {s.code}: {isTa && s.tamilName ? s.tamilName : s.name}
                            </span>
                            {isSelected && <Check className="w-3 h-3 text-blue-700 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTeacher(false);
                        setEditingTeacher(null);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      {isTa ? 'ரத்து' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingTeacher ? (isTa ? 'புதுப்பிக்க' : 'Update Teacher') : (isTa ? 'சேமிக்க' : 'Save Teacher')}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Teachers Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 divide-x divide-slate-200">
                      <th className="py-2 px-3 text-left font-semibold w-16">Code</th>
                      <th className="py-2 px-3 text-left font-semibold">Teacher Name</th>
                      <th className="py-2 px-3 text-left font-semibold w-28">Department</th>
                      <th className="py-2 px-3 text-left font-semibold">{isTa ? 'கற்பிக்கும் பாடங்கள்' : 'Subjects Handled'}</th>
                      <th className="py-2 px-2.5 text-center font-semibold w-24">Max Load</th>
                      <th className="py-2 px-3 text-center font-semibold w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTeachers.map(teacher => {
                      const handledIds = teacher.subjectsHandled && teacher.subjectsHandled.length > 0
                        ? teacher.subjectsHandled
                        : teacher.preferredSubjects || [];

                      return (
                        <tr key={teacher.id} className="hover:bg-slate-50 transition-colors divide-x divide-slate-100">
                          <td className="py-2 px-3 font-mono font-bold text-blue-900 bg-slate-50/60">
                            {teacher.code}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-900">{teacher.name}</span>
                            {teacher.nameTamil && (
                              <span className="text-[11px] text-slate-500 block">{teacher.nameTamil}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                              {teacher.department}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[280px]">
                              {handledIds.length > 0 ? (
                                handledIds.map(sid => {
                                  const sub = subjects.find(s => s.id === sid);
                                  if (!sub) return null;
                                  return (
                                    <span
                                      key={sid}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shadow-2xs"
                                      style={{ backgroundColor: sub.color }}
                                      title={sub.name}
                                    >
                                      {sub.code}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">
                                  {teacher.department}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2.5 text-center font-mono font-semibold text-slate-700">
                            {teacher.maxWeeklyLoad} p/wk
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingTeacher(teacher);
                                  setTeacherForm({
                                    code: teacher.code,
                                    name: teacher.name,
                                    nameTamil: teacher.nameTamil || '',
                                    department: teacher.department,
                                    maxWeeklyLoad: teacher.maxWeeklyLoad,
                                    subjectsHandled: teacher.subjectsHandled || teacher.preferredSubjects || [],
                                    preferredSubjects: teacher.subjectsHandled || teacher.preferredSubjects || [],
                                  });
                                  setIsAddingTeacher(false);
                                }}
                                className="p-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                title="Edit teacher"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmDeleteId(teacher.id);
                                  setConfirmDeleteType('teacher');
                                }}
                                className="p-1 rounded-md text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                title="Delete teacher"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CLASSES MANAGEMENT */}
          {activeTab === 'classes' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={isTa ? 'வகுப்பு தேடுக...' : 'Search class name or room...'}
                    value={classSearch}
                    onChange={e => setClassSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingClass(null);
                    setClassForm({
                      grade: 6,
                      name: `Class 6 - Section B`,
                      nameTamil: `வகுப்பு 6 - ஆ பிரிவு`,
                      section: 'B',
                      stage: 'middle',
                      stream: 'general',
                      periodsPerDay: 8,
                      roomNumber: `Room 10${classes.length + 1}`,
                    });
                    setIsAddingClass(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isTa ? 'புதிய வகுப்பு பிரிவு சேர்க்க' : '+ Add New Class Section'}</span>
                </button>
              </div>

              {/* Add / Edit Class Form */}
              {(isAddingClass || editingClass) && (
                <form
                  onSubmit={handleSaveClassSubmit}
                  className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                    <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wide">
                      {editingClass
                        ? isTa
                          ? `வகுப்பு திருத்துக (${editingClass.name})`
                          : `Edit Class: ${editingClass.name}`
                        : isTa
                        ? 'புதிய வகுப்பு பதிவு'
                        : 'Register New Class Section'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingClass(false);
                        setEditingClass(null);
                      }}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Grade (1-12)</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        required
                        value={classForm.grade}
                        onChange={e => setClassForm({ ...classForm, grade: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Section (A, B, C)</label>
                      <input
                        type="text"
                        required
                        value={classForm.section}
                        onChange={e => setClassForm({ ...classForm, section: e.target.value.toUpperCase() })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-xs"
                        placeholder="A"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Display Name</label>
                      <input
                        type="text"
                        required
                        value={classForm.name}
                        onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        placeholder="Class 6 - Section A"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Tamil Name</label>
                      <input
                        type="text"
                        value={classForm.nameTamil || ''}
                        onChange={e => setClassForm({ ...classForm, nameTamil: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        placeholder="வகுப்பு 6 - அ"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Academic Stage</label>
                      <select
                        value={classForm.stage}
                        onChange={e => setClassForm({ ...classForm, stage: e.target.value as AcademicStage })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        <option value="primary">Primary (1-5)</option>
                        <option value="middle">Middle (6-8)</option>
                        <option value="high">High School (9-10)</option>
                        <option value="higher-secondary">Higher Secondary (11-12)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Stream</label>
                      <select
                        value={classForm.stream || 'general'}
                        onChange={e => setClassForm({ ...classForm, stream: e.target.value as AcademicStream })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        <option value="general">General</option>
                        <option value="science">Science</option>
                        <option value="arts">Arts / Commerce</option>
                        <option value="vocational">Vocational</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Room Number</label>
                      <input
                        type="text"
                        value={classForm.roomNumber}
                        onChange={e => setClassForm({ ...classForm, roomNumber: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        placeholder="Room 101"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-indigo-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingClass(false);
                        setEditingClass(null);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      {isTa ? 'ரத்து' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingClass ? (isTa ? 'புதுப்பிக்க' : 'Update Class') : (isTa ? 'சேமிக்க' : 'Save Class')}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Classes Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 divide-x divide-slate-200">
                      <th className="py-2 px-3 text-left font-semibold w-16">Grade</th>
                      <th className="py-2 px-3 text-left font-semibold">Class & Section</th>
                      <th className="py-2 px-2.5 text-left font-semibold">Stage & Stream</th>
                      <th className="py-2 px-2.5 text-center font-semibold w-24">Room</th>
                      <th className="py-2 px-3 text-center font-semibold w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredClasses.map(cls => (
                      <tr key={cls.id} className="hover:bg-slate-50 transition-colors divide-x divide-slate-100">
                        <td className="py-2 px-3 font-mono font-bold text-center text-blue-900 bg-slate-50/60">
                          {cls.grade}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-900">{cls.name}</span>
                          {cls.nameTamil && (
                            <span className="text-[11px] text-slate-500 block">{cls.nameTamil}</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] capitalize">
                            {cls.stage} {cls.stream ? `· ${cls.stream}` : ''}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono text-slate-600">
                          {cls.roomNumber}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingClass(cls);
                                setClassForm({
                                  grade: cls.grade,
                                  name: cls.name,
                                  nameTamil: cls.nameTamil || '',
                                  section: cls.section,
                                  stage: cls.stage,
                                  stream: cls.stream || 'general',
                                  periodsPerDay: cls.periodsPerDay,
                                  roomNumber: cls.roomNumber,
                                });
                                setIsAddingClass(false);
                              }}
                              className="p-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Edit class"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteId(cls.id);
                                setConfirmDeleteType('class');
                              }}
                              className="p-1 rounded-md text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete class"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SUBJECTS MANAGEMENT */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={isTa ? 'பாடம் தேடுக...' : 'Search subject name or code...'}
                    value={subjectSearch}
                    onChange={e => setSubjectSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingSubject(null);
                    setSubjectForm({
                      code: `sub-${subjects.length + 1}`,
                      name: '',
                      tamilName: '',
                      color: '#2563eb',
                      isCore: true,
                      isLab: false,
                      isECA: false,
                    });
                    setIsAddingSubject(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isTa ? 'புதிய பாடம் சேர்க்க' : '+ Add New Subject'}</span>
                </button>
              </div>

              {/* Add / Edit Subject Form */}
              {(isAddingSubject || editingSubject) && (
                <form
                  onSubmit={handleSaveSubjectSubmit}
                  className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wide">
                      {editingSubject
                        ? isTa
                          ? `பாடம் திருத்துக (${editingSubject.name})`
                          : `Edit Subject: ${editingSubject.name}`
                        : isTa
                        ? 'புதிய பாடம் பதிவு'
                        : 'Register New Subject'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSubject(false);
                        setEditingSubject(null);
                      }}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Subject Code</label>
                      <input
                        type="text"
                        required
                        value={subjectForm.code}
                        onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs"
                        placeholder="sub-ai"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Name (English)</label>
                      <input
                        type="text"
                        required
                        value={subjectForm.name}
                        onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        placeholder="Artificial Intelligence"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Name (Tamil)</label>
                      <input
                        type="text"
                        value={subjectForm.tamilName || ''}
                        onChange={e => setSubjectForm({ ...subjectForm, tamilName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                        placeholder="செயற்கை நுண்ணறிவு"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Tag Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={subjectForm.color}
                          onChange={e => setSubjectForm({ ...subjectForm, color: e.target.value })}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <span className="font-mono text-xs">{subjectForm.color}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={subjectForm.isCore}
                          onChange={e => setSubjectForm({ ...subjectForm, isCore: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                        <span className="text-slate-700 font-medium">Core Academic Subject</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={subjectForm.isECA}
                          onChange={e => setSubjectForm({ ...subjectForm, isECA: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        <span className="text-slate-700 font-medium">Co-curricular / Sports / Arts</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-emerald-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSubject(false);
                        setEditingSubject(null);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      {isTa ? 'ரத்து' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingSubject ? (isTa ? 'புதுப்பிக்க' : 'Update Subject') : (isTa ? 'சேமிக்க' : 'Save Subject')}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Subjects Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 divide-x divide-slate-200">
                      <th className="py-2 px-3 text-left font-semibold w-24">Code</th>
                      <th className="py-2 px-3 text-left font-semibold">Subject Name</th>
                      <th className="py-2 px-2.5 text-left font-semibold">Category</th>
                      <th className="py-2 px-2.5 text-center font-semibold w-20">Tag</th>
                      <th className="py-2 px-3 text-center font-semibold w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredSubjects.map(subject => (
                      <tr key={subject.id} className="hover:bg-slate-50 transition-colors divide-x divide-slate-100">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 bg-slate-50/60">
                          {subject.code}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-900">{subject.name}</span>
                          {subject.tamilName && (
                            <span className="text-[11px] text-slate-500 block">{subject.tamilName}</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                            {subject.isCore ? 'Core Subject' : subject.isECA ? 'Arts / PET / ECA' : 'Elective'}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <span
                            className="inline-block w-4 h-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: subject.color }}
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingSubject(subject);
                                setSubjectForm({
                                  code: subject.code,
                                  name: subject.name,
                                  tamilName: subject.tamilName || '',
                                  color: subject.color,
                                  isCore: subject.isCore,
                                  isLab: subject.isLab,
                                  isECA: subject.isECA,
                                });
                                setIsAddingSubject(false);
                              }}
                              className="p-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Edit subject"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteId(subject.id);
                                setConfirmDeleteType('subject');
                              }}
                              className="p-1 rounded-md text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SCHOOL & TIMINGS */}
          {activeTab === 'school' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                  Institutional Profile & Academic Year
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">
                      School / Institution Name (English)
                    </label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={e => setSchoolName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">
                      பள்ளி பெயர் (Tamil)
                    </label>
                    <input
                      type="text"
                      value={schoolNameTamil}
                      onChange={e => setSchoolNameTamil(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={e => setAcademicYear(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800">
                      System Subtitle
                    </label>
                    <input
                      type="text"
                      value={subTitle}
                      onChange={e => setSubTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Working Days */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                  Instructional Schedule & Working Days
                </h4>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    checked={includeSaturday}
                    onChange={e => setIncludeSaturday(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-medium text-slate-800">
                    Include Saturday as an active instructional day (6-day academic week, 48 total periods)
                  </span>
                </label>
              </div>

              {/* Bell Schedule & Periods */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                  Bell Schedule & Daily Period Durations (Government Order 40 Periods/Wk)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {periods.map((t, idx) => (
                    <div
                      key={t.period}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <span className="font-mono font-bold text-blue-900 w-14">
                        P-{t.period}
                      </span>
                      <input
                        type="text"
                        value={t.startTime}
                        onChange={e => handlePeriodTimeChange(idx, 'startTime', e.target.value)}
                        className="w-16 text-center text-xs p-1 border rounded bg-white font-mono"
                        placeholder="09:30"
                      />
                      <span>to</span>
                      <input
                        type="text"
                        value={t.endTime}
                        onChange={e => handlePeriodTimeChange(idx, 'endTime', e.target.value)}
                        className="w-16 text-center text-xs p-1 border rounded bg-white font-mono"
                        placeholder="10:15"
                      />
                      {t.isBreakAfter && (
                        <span
                          className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium truncate max-w-[90px]"
                          title={t.breakLabel}
                        >
                          {t.breakLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSaveConfig();
                    alert(isTa ? 'பள்ளி விவரங்கள் புதுப்பிக்கப்பட்டன!' : 'School details updated successfully!');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isTa ? 'விவரங்களைச் சேமிக்க' : 'Save School Details'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                  Full System Backup (.json)
                </h4>
                <p className="text-xs text-slate-600">
                  Save your complete school configuration, faculty roster, class sections, subjects, mappings, and timetable slots to an external JSON file.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onExportAllJSON}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Complete System Backup (.json)</span>
                  </button>

                  <label className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Restore From File (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Alert Modal */}
        {confirmDeleteId && confirmDeleteType && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-4 shadow-xl border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Deletion</span>
              </div>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete this {confirmDeleteType}? All timetable slots and assignments linked to it will be unassigned.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setConfirmDeleteId(null);
                    setConfirmDeleteType(null);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmDeleteType === 'teacher') onDeleteTeacher(confirmDeleteId);
                    if (confirmDeleteType === 'class') onDeleteClass(confirmDeleteId);
                    if (confirmDeleteType === 'subject') onDeleteSubject(confirmDeleteId);
                    setConfirmDeleteId(null);
                    setConfirmDeleteType(null);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            {teachers.length} Teachers · {classes.length} Classes · {subjects.length} Subjects
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isTa ? 'முடிந்தது' : 'Done & Close'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
