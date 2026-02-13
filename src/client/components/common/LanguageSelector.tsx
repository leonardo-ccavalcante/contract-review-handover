import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    localStorage.setItem('preferred_language', langCode);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-bolt-green',
            {
              'bg-bolt-green text-white hover:bg-bolt-green/90':
                i18n.language === lang.code,
              'text-gray-700 dark:text-gray-300': i18n.language !== lang.code,
            }
          )}
          aria-label={`Switch to ${lang.name}`}
        >
          <span className="text-xl" role="img" aria-label={lang.name}>
            {lang.flag}
          </span>
          <span className="text-sm font-medium">{lang.name}</span>
        </button>
      ))}
    </div>
  );
}
