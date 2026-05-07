export const theme = {
  colors: {
    bg: '#F7F8FB',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F3F8',
    inverse: '#0F1117',
    text: '#0F1117',
    textSec: '#5B6173',
    textTer: '#9CA3B0',
    textInv: '#FFFFFF',
    primary: '#3B5BFF',
    primaryDark: '#1F2D6E',
    primaryLight: '#E8EDFF',
    accent: '#FF5A36',
    accentLight: '#FFEEE8',
    success: '#10B981',
    successBg: '#D1FAE5',
    warning: '#F59E0B',
    error: '#EF4444',
    border: 'rgba(15,17,23,0.06)',
    overlay: 'rgba(15,17,23,0.5)',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 10, md: 14, lg: 22, xl: 28, full: 9999 },
  shadow: {
    sm: { shadowColor: '#0F1117', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    md: { shadowColor: '#0F1117', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 20, elevation: 6 },
    lg: { shadowColor: '#3B5BFF', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.20, shadowRadius: 28, elevation: 12 },
  },
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
