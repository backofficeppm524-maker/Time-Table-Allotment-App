import React from 'react';
import { Calendar, Download, Printer, Settings, Sparkles, AlertCircle, CheckCircle2, Languages } from 'lucide-react';
import { SchoolConfig, TimetableClash } from '../types/timetable';

export type LanguageMode = 'ta' | 'en' | 'bilingual';

interface HeaderProps {
  config: SchoolConfig;
  clashes: TimetableClash[];
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  onOpenSettings: () => void;
  onOpenGenerator: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  clashes,
  languageMode,
  onLanguageChange,
  onOpenSettings,
  onOpenGenerator,
  onPrint,
  onExportCSV,
  onResetData,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner with School Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & School Name */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src="/src/assets/images/school_logo_1792431737322.jpg"
              alt="School Emblem Logo"
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-lg object-contain bg-white p-0.5 border border-slate-700 shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase font-sans">
                {languageMode === 'ta'
                  ? config.schoolNameTamil || config.schoolName
                  : languageMode === 'bilingual'
                  ? `${config.schoolName} (${config.schoolNameTamil || ''})`
                  : config.schoolName}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {config.academicYear}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {languageMode === 'ta'
                ? config.subTitleTamil || config.subTitle
                : config.subTitle}
            </p>
          </div>
        </div>

        {/* Status & Primary Actions */}
        <div className="flex items-center flex-wrap gap-2 no-print">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                languageMode === 'ta'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                languageMode === 'en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('bilingual')}
              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                languageMode === 'bilingual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              இருமொழி
            </button>
          </div>

          {/* Clash Indicator */}
          {clashes.length === 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>0 {languageMode === 'ta' ? 'மோதல்கள்' : 'Clashes'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-md animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{clashes.length} {languageMode === 'ta' ? 'மோதல்கள்' : 'Conflicts'}</span>
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={onOpenGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition-all"
            title="Auto-solve & optimize timetables"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{languageMode === 'ta' ? 'தானியங்கி அட்டவணை' : 'Smart Solver'}</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Print current sheet"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{languageMode === 'ta' ? 'அச்சிடுக' : 'Print View'}</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Export master timetable to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-700/80 hover:bg-blue-600 text-white border border-blue-600/50 shadow-xs transition-colors"
            title="Add, Edit, or Delete Teachers, Classes, Subjects & Settings"
          >
            <Settings className="w-3.5 h-3.5 text-blue-200" />
            <span>{languageMode === 'ta' ? 'தரவு & அமைப்புகள்' : 'Manage Data'}</span>
          </button>

          <button
            onClick={onResetData}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors"
            title="Reset to 2026-2027 Government timetable template"
          >
            {languageMode === 'ta' ? 'மீட்டமைக்க' : 'Reset'}
          </button>
        </div>
      </div>
    </header>
  );
};
