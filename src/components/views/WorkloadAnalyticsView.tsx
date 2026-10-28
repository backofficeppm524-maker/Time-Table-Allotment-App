import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Teacher,
  ClassSection,
  Subject,
  TimetableSlot,
  SchoolConfig,
} from '../../types/timetable';
import { calculateTeacherLoads } from '../../utils/timetableGenerator';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Filter,
  ArrowUpDown,
  Download,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { LanguageMode } from '../Header';

interface WorkloadAnalyticsViewProps {
  config: SchoolConfig;
  teachers: Teacher[];
  classes: ClassSection[];
  subjects: Subject[];
  slots: TimetableSlot[];
  languageMode: LanguageMode;
}

export const WorkloadAnalyticsView: React.FC<WorkloadAnalyticsViewProps> = ({
  teachers,
  classes,
  subjects,
  slots,
  languageMode,
}) => {
  const isTa = languageMode === 'ta';

  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'code' | 'load-desc' | 'load-asc' | 'diff-desc'>('load-desc');
  const [metricMode, setMetricMode] = useState<'both' | 'assigned' | 'utilization'>('both');

  // Compute all teacher loads
  const teacherLoads = useMemo(() => {
    return calculateTeacherLoads(teachers, classes, subjects, slots);
  }, [teachers, classes, subjects, slots]);

  // Extract departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach(t => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Prepare chart dataset
  const chartData = useMemo(() => {
    const raw = teacherLoads.map(load => {
      const teacher = load.teacher;
      const assigned = load.totalPeriods;
      const limit = teacher.maxWeeklyLoad || 28;
      const difference = assigned - limit;
      const utilization = limit > 0 ? Math.round((assigned / limit) * 100) : 0;
      const isOverloaded = assigned > limit;
      const isUnderloaded = assigned < limit * 0.7;

      return {
        id: teacher.id,
        code: teacher.code,
        name: isTa && teacher.nameTamil ? teacher.nameTamil : teacher.name,
        nameFull: teacher.name,
        department: teacher.department,
        assignedPeriods: assigned,
        weeklyLimit: limit,
        difference,
        utilization,
        isOverloaded,
        isUnderloaded,
        allocationsCount: load.allocations.length,
      };
    });

    // Filter department
    const filtered = raw.filter(item => {
      if (selectedDept === 'all') return true;
      return item.department === selectedDept;
    });

    // Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'load-desc') return b.assignedPeriods - a.assignedPeriods;
      if (sortBy === 'load-asc') return a.assignedPeriods - b.assignedPeriods;
      if (sortBy === 'diff-desc') return b.difference - a.difference;
      // 'code' sort: natural numeric sort by T-number
      const numA = parseInt(a.code.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.code.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [teacherLoads, selectedDept, sortBy, isTa]);

  // High-level statistics
  const stats = useMemo(() => {
    const totalTeachers = teachers.length;
    const totalAssigned = teacherLoads.reduce((acc, curr) => acc + curr.totalPeriods, 0);
    const totalCapacity = teachers.reduce((acc, curr) => acc + (curr.maxWeeklyLoad || 28), 0);
    const avgLoad = totalTeachers > 0 ? (totalAssigned / totalTeachers).toFixed(1) : '0';
    const overallUtilization = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;
    const overloadedList = chartData.filter(d => d.isOverloaded);
    const maxLoaded = [...chartData].sort((a, b) => b.assignedPeriods - a.assignedPeriods)[0];

    return {
      totalTeachers,
      totalAssigned,
      totalCapacity,
      avgLoad,
      overallUtilization,
      overloadedCount: overloadedList.length,
      maxLoaded,
    };
  }, [teachers, teacherLoads, chartData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-sm text-blue-400 font-mono">{data.code}</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {data.department}
            </span>
          </div>
          <p className="font-semibold text-slate-100">{data.name}</p>
          <div className="mt-2.5 space-y-1 text-[11px]">
            <div className="flex justify-between items-center text-slate-300">
              <span>{isTa ? 'ஒதுக்கப்பட்ட பாடவேளைகள்:' : 'Assigned Periods:'}</span>
              <span className="font-bold font-mono text-white text-xs">{data.assignedPeriods}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>{isTa ? 'அதிகபட்ச வரம்பு:' : 'Weekly Limit:'}</span>
              <span className="font-mono text-slate-300">{data.weeklyLimit}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>{isTa ? 'பயன்பாட்டு சதவீதம்:' : 'Utilization:'}</span>
              <span
                className={`font-mono font-bold ${
                  data.isOverloaded
                    ? 'text-rose-400'
                    : data.utilization >= 90
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {data.utilization}%
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
              <span>{isTa ? 'வேறுபாடு / மீதம்:' : 'Balance:'}</span>
              <span
                className={`font-mono font-semibold ${
                  data.difference > 0
                    ? 'text-rose-400'
                    : data.difference === 0
                    ? 'text-emerald-400'
                    : 'text-blue-300'
                }`}
              >
                {data.difference > 0 ? `+${data.difference} (Over)` : `${data.difference} (Available)`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* View Header & Metric Highlights */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>
              {isTa ? 'ஆசிரியர் பணிச்சுமை பகுப்பாய்வு (Workload Analytics)' : 'TEACHER WORKLOAD ANALYTICS & CAPACITY AUDIT'}
            </span>
            <span className="text-xs font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Recharts Engine
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTa
              ? 'ஒவ்வொரு ஆசிரியரின் வாராந்திர பாடவேளை ஒதுக்கீட்டை அவர்களின் அதிகபட்ச வரம்புடன் ஒப்பிடும் ஒப்பீட்டு வரைபடம்.'
              : 'Interactive comparative analysis of assigned periods vs. institutional weekly maximum workload limits.'}
          </p>
        </div>

        {/* Controls: Department filter & Sorting */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{isTa ? 'அனைத்துத் துறைகள் (All Depts)' : 'All Departments'}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="load-desc">{isTa ? 'அதிக சுமை முதல்' : 'Highest Load First'}</option>
              <option value="load-asc">{isTa ? 'குறைந்த சுமை முதல்' : 'Lowest Load First'}</option>
              <option value="code">{isTa ? 'ஆசிரியர் எண் (T-1 to T-30)' : 'Teacher Code (T-1 to T-30)'}</option>
              <option value="diff-desc">{isTa ? 'வரம்பு அதிக சுமை' : 'Highest Overload'}</option>
            </select>
          </div>

          {/* Display Mode */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMetricMode('both')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                metricMode === 'both' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'ஒப்பீடு' : 'Compare'}
            </button>
            <button
              onClick={() => setMetricMode('assigned')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                metricMode === 'assigned' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'ஒதுக்கீடு மட்டும்' : 'Assigned Only'}
            </button>
          </div>
        </div>
      </div>

      {/* Metric KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 no-print">
        {/* KPI 1: Total Faculty Load */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isTa ? 'மொத்த ஆசிரியர் ஒதுக்கீடு' : 'Total Assigned Periods'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {stats.totalAssigned}
              </span>
              <span className="text-xs text-slate-500">
                / {stats.totalCapacity} {isTa ? 'வரம்பு' : 'cap'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.totalTeachers} {isTa ? 'ஆசிரியர்கள்' : 'Faculty members evaluated'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* KPI 2: Average Periods per Teacher */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isTa ? 'சராசரி ஆசிரியர் சுமை' : 'Average Faculty Load'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-blue-900 font-mono">
                {stats.avgLoad}
              </span>
              <span className="text-xs text-slate-500">
                {isTa ? 'வேளைகள் / வாரம்' : 'p/week'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isTa ? 'அரசு விதிமுறை: 28 வேளைகள்' : 'Govt standard: ~28 periods'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        {/* KPI 3: School Utilization Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isTa ? 'பணி திறன் பயன்பாடு' : 'Capacity Utilization'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-600 font-mono">
                {stats.overallUtilization}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isTa ? 'செயல்திறன்' : 'Optimized'}
              </span>
            </div>
            <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, stats.overallUtilization)}%` }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* KPI 4: Overload Warning */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isTa ? 'அதிக சுமை ஆசிரியர்கள்' : 'Overloaded Faculty'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-extrabold font-mono ${
                  stats.overloadedCount === 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {stats.overloadedCount}
              </span>
              <span className="text-xs text-slate-500">
                {stats.overloadedCount === 0 ? (isTa ? 'அனைத்தும் வரம்புக்குள்' : 'Within limit') : (isTa ? 'வரம்பு மீறியவர்கள்' : 'Exceeding limit')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.overloadedCount === 0 ? (
                <span className="text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Compliant
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> Needs Re-allotment
                </span>
              )}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
              stats.overloadedCount === 0
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
            }`}
          >
            {stats.overloadedCount === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            )}
          </div>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{isTa ? 'ஆசிரியர் பணிச்சுமை vs வாராந்திர வரம்பு ஒப்பீடு' : 'Assigned Periods vs. Weekly Limit per Teacher'}</span>
              <span className="text-xs font-normal text-slate-500 font-mono">
                ({chartData.length} {isTa ? 'ஆசிரியர்கள்' : 'teachers'})
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTa
                ? 'நீல நிற பார்கள் ஒதுக்கப்பட்ட பாடவேளைகளையும், வெளிர் சாம்பல் நிற பார்கள் அதிகபட்ச வாராந்திர வரம்பையும் குறிக்கின்றன.'
                : 'Blue bars indicate scheduled periods. Slate bars indicate maximum weekly capacity limit.'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-600 rounded-xs"></span>
              <span>{isTa ? 'ஒதுக்கப்பட்டவை' : 'Assigned'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-300 rounded-xs"></span>
              <span>{isTa ? 'அதிகபட்ச வரம்பு' : 'Weekly Limit'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-500 rounded-xs"></span>
              <span>{isTa ? 'வரம்பு மீறியது (>Limit)' : 'Overload (>Limit)'}</span>
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 20, left: -10, bottom: 40 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="code"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis
                domain={[0, 35]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{
                  value: isTa ? 'பாடவேளைகள்' : 'Periods/Wk',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 11,
                  fill: '#64748b',
                  offset: 15,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
              />
              <ReferenceLine
                y={28}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: isTa ? 'அரசு வரம்பு (28)' : 'Norm (28)',
                  position: 'right',
                  fill: '#b45309',
                  fontSize: 10,
                }}
              />

              {metricMode === 'both' && (
                <Bar
                  dataKey="weeklyLimit"
                  name={isTa ? 'அதிகபட்ச வரம்பு (Limit)' : 'Weekly Limit'}
                  fill="#cbd5e1"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={22}
                />
              )}

              <Bar
                dataKey="assignedPeriods"
                name={isTa ? 'ஒதுக்கப்பட்டவை (Assigned)' : 'Assigned Periods'}
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
              >
                {chartData.map((entry, index) => {
                  let barColor = '#2563eb'; // standard blue
                  if (entry.isOverloaded) {
                    barColor = '#f43f5e'; // rose-500 overload
                  } else if (entry.assignedPeriods === entry.weeklyLimit) {
                    barColor = '#059669'; // emerald-600 100% full
                  } else if (entry.isUnderloaded) {
                    barColor = '#60a5fa'; // lighter blue underloaded
                  }
                  return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Teacher Workload Detailed Table Audit */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-[#1e3a8a] text-white py-2.5 px-4 font-bold uppercase tracking-wider text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-300" />
            <span>{isTa ? 'ஆசிரியர்கள் பணிச்சுமை விரிவான பட்டியல்' : 'FACULTY WORKLOAD & UTILIZATION AUDIT TABLE'}</span>
          </div>
          <span className="text-xs font-normal text-blue-200">
            {chartData.length} {isTa ? 'ஆசிரியர்கள்' : 'Teachers'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 divide-x divide-slate-200 border-b border-slate-200">
                <th className="py-2 px-3 text-left font-semibold">{isTa ? 'குறியீடு' : 'Code'}</th>
                <th className="py-2 px-3 text-left font-semibold">{isTa ? 'ஆசிரியர் பெயர்' : 'Teacher Name'}</th>
                <th className="py-2 px-2.5 text-left font-semibold">{isTa ? 'துறை' : 'Department'}</th>
                <th className="py-2 px-2.5 text-center font-semibold">{isTa ? 'ஒதுக்கீடு' : 'Assigned'}</th>
                <th className="py-2 px-2.5 text-center font-semibold">{isTa ? 'வரம்பு' : 'Limit'}</th>
                <th className="py-2 px-2.5 text-center font-semibold">{isTa ? 'மீதம் / அதிகப்படியானவை' : 'Difference'}</th>
                <th className="py-2 px-3 text-left font-semibold min-w-[140px]">{isTa ? 'பயன்பாட்டு விகிதம்' : 'Utilization'}</th>
                <th className="py-2 px-2.5 text-center font-semibold">{isTa ? 'நிலை' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {chartData.map(item => {
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors divide-x divide-slate-100">
                    <td className="py-2 px-3 font-mono font-bold text-blue-900 bg-slate-50/70">
                      {item.code}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {item.name}
                      <span className="text-[10px] text-slate-400 block font-normal">{item.nameFull}</span>
                    </td>
                    <td className="py-2 px-2.5 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {item.department}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-900">
                      {item.assignedPeriods}
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono text-slate-500">
                      {item.weeklyLimit}
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono font-semibold">
                      {item.difference > 0 ? (
                        <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          +{item.difference} Over
                        </span>
                      ) : item.difference === 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          0 Full
                        </span>
                      ) : (
                        <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                          {Math.abs(item.difference)} Free
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              item.isOverloaded
                                ? 'bg-rose-500'
                                : item.utilization >= 90
                                ? 'bg-emerald-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, item.utilization)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-slate-700 w-9 text-right">
                          {item.utilization}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      {item.isOverloaded ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          {isTa ? 'அதிக சுமை' : 'Overload'}
                        </span>
                      ) : item.utilization >= 90 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          {isTa ? 'உகந்தது' : 'Optimal'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {isTa ? 'இடமுண்டு' : 'Available'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
