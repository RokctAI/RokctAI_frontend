import en from './en.json';

const translations: Record<string, any> = {
  en,
};

export function t(key: string, params?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = translations.en;

  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key; // Fallback to key
    }
  }

  if (typeof value === 'string' && params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{{${k}}}`, v);
    });
  }

  return value || key;
}

export default t;
