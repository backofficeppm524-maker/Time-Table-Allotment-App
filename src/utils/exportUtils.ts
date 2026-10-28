import { TimetableSlot, ClassSection, Teacher, Subject, DayOfWeek } from '../types/timetable';
import { LanguageMode } from '../components/Header';

export function exportMasterTimetableToCSV(
  slots: TimetableSlot[],
  classes: ClassSection[],
  teachers: Teacher[],
  subjects: Subject[],
  days: DayOfWeek[],
  maxPeriods: number = 8,
  languageMode: LanguageMode = 'ta'
): string {
  const isTa = languageMode === 'ta';
  const teacherMap = new Map(teachers.map(t => [t.id, isTa && t.nameTamil ? `${t.code} (${t.nameTamil})` : `${t.code} (${t.name})`]));
  const subMap = new Map(subjects.map(s => [s.id, isTa && s.tamilName ? s.tamilName : s.name]));

  const dayNamesTamil: Record<DayOfWeek, string> = {
    Monday: 'திங்கள்',
    Tuesday: 'செவ்வாய்',
    Wednesday: 'புதன்',
    Thursday: 'வியாழன்',
    Friday: 'வெள்ளி',
    Saturday: 'சனி',
  };

  const headers = [
    isTa ? 'கிழமை (Day)' : 'Day',
    isTa ? 'பாடவேளை (Period)' : 'Period',
    ...classes.flatMap(c => [
      `${isTa && c.nameTamil ? c.nameTamil : c.name} - ${isTa ? 'ஆசிரியர்' : 'Teacher'}`,
      `${isTa && c.nameTamil ? c.nameTamil : c.name} - ${isTa ? 'பாடம்' : 'Subject'}`
    ])
  ];

  const rows: string[][] = [headers];

  for (const day of days) {
    for (let p = 1; p <= maxPeriods; p++) {
      const row: string[] = [isTa ? dayNamesTamil[day] : day, isTa ? `பாடவேளை ${p}` : `Period ${p}`];
      for (const cls of classes) {
        const slot = slots.find(s => s.classId === cls.id && s.day === day && s.period === p);
        row.push(slot ? teacherMap.get(slot.teacherId) || '-' : '-');
        row.push(slot ? subMap.get(slot.subjectId) || '-' : '-');
      }
      rows.push(row);
    }
  }

  // Prepend \uFEFF UTF-8 BOM so Microsoft Excel renders Tamil Unicode characters properly
  return '\uFEFF' + rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerPrint() {
  window.print();
}
