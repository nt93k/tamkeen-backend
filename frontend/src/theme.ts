export const theme = {
  colors: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceAlt: '#F3F4F6',
    inverse: '#0A0A0A',
    text: '#0A0A0A',
    textSec: '#52525B',
    textTer: '#A1A1AA',
    textInv: '#FFFFFF',
    primary: '#0033CC',
    primaryLight: '#E6ECFF',
    accent: '#FF5A36',
    accentLight: '#FFF0ED',
    success: '#10B981',
    successBg: '#D1FAE5',
    warning: '#F59E0B',
    error: '#EF4444',
    border: 'rgba(0,0,0,0.06)',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 12, lg: 20, full: 9999 },
};

export const DEPARTMENTS: { id: string; name: string; emoji: string }[] = [
  { id: 'cs', name: 'علوم الحاسوب', emoji: '💻' },
  { id: 'ai', name: 'علوم الذكاء الاصطناعي', emoji: '🤖' },
  { id: 'computer_eng', name: 'هندسة الحاسبات', emoji: '🔌' },
  { id: 'accounting', name: 'المحاسبة', emoji: '📊' },
];

export const DEPT_NAME: Record<string, string> = {
  cs: 'علوم الحاسوب',
  ai: 'علوم الذكاء الاصطناعي',
  computer_eng: 'هندسة الحاسبات',
  accounting: 'المحاسبة',
};
