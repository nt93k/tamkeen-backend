import { Alert, Platform } from 'react-native';

export function confirmAction(title: string, message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'تأكيد', style: 'destructive', onPress: onYes },
  ]);
}

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}${message?'\n\n'+message:''}`);
    return;
  }
  Alert.alert(title, message);
}
