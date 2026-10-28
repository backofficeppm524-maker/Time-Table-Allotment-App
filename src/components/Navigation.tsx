import React from 'react';
import {
  Grid,
  GraduationCap,
  Users,
  TableProperties,
  Briefcase,
  UserCheck,
  Cpu,
  FileCheck
} from 'lucide-react';
import { LanguageMode } from './Header';

export type ViewTab =
  | 'master'
  | 'class'
  | 'teacher'
  | 'allotment'
  | 'workload'
  | 'free-periods'
  | 'generator'
  | 'govt-norms';

interface NavigationProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  clashCount: number;
  languageMode: LanguageMode;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  clashCount,
  languageMode,
}) => {
  const isTa = languageMode === 'ta';

  const tabs = [
    {
      id: 'master' as ViewTab,
      label: isTa ? 'முழு பள்ளி அட்டவணை' : 'All Class Master',
      subtitle: isTa ? 'வகுப்பு 1 - 12 மேட்ரிக்ஸ்' : 'Classes 1 - 12 Matrix',
      icon: Grid,
    },
    {
      id: 'class' as ViewTab,
      label: isTa ? 'வகுப்பு அட்டவணைகள்' : 'Class Wise Timetables',
      subtitle: isTa ? 'வகுப்பு 1 முதல் 12 வரை' : 'Classes 1 to 12 Schedules',
      icon: GraduationCap,
    },
    {
      id: 'teacher' as ViewTab,
      label: isTa ? 'ஆசிரியர் அட்டவணை' : 'Teacher Schedules',
      subtitle: isTa ? 'T-1 முதல் T-30 வரை' : 'T-1 to T-30 Faculty',
      icon: Users,
    },
    {
      id: 'allotment' as ViewTab,
      label: isTa ? 'பாட ஒதுக்கீட்டு மேட்ரிக்ஸ்' : 'Period Allotment Matrix',
      subtitle: isTa ? 'அரசாணை வழிகாட்டி (40 வேளை)' : 'Govt Norms (40 Periods/Wk)',
      icon: TableProperties,
    },
    {
      id: 'workload' as ViewTab,
      label: isTa ? 'பணிச்சுமை & பகுப்பாய்வு' : 'Workload & Analytics',
      subtitle: isTa ? 'வரைபடம் & சுமை அட்டைகள்' : 'Charts & Load Cards',
      icon: Briefcase,
    },
    {
      id: 'free-periods' as ViewTab,
      label: isTa ? 'மாற்று ஆசிரியர் / ஓய்வு' : 'Free Periods & Proxy',
      subtitle: isTa ? 'பதிலீடு ஒதுக்கீடு' : 'Substitution Manager',
      icon: UserCheck,
    },
    {
      id: 'govt-norms' as ViewTab,
      label: isTa ? 'அரசாணை & இணக்கச் சான்று' : 'Govt Norms & Audit',
      subtitle: isTa ? 'வழிகாட்டு சுற்றறிக்கை' : 'Circular & Compliance',
      icon: FileCheck,
    },
    {
      id: 'generator' as ViewTab,
      label: isTa ? 'அட்டவணை உருவாக்கி' : 'Solver & Generator',
      subtitle: isTa ? 'கட்டமைப்பு விதிகள்' : 'Constraint Engine',
      icon: Cpu,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-14 z-20 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-300' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="leading-tight">{tab.label}</div>
                  <div className={`text-[10px] font-normal leading-none mt-0.5 ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                    {tab.subtitle}
                  </div>
                </div>
                {tab.id === 'master' && clashCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {clashCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
