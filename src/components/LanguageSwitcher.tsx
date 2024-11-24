import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <button
        onClick={() => changeLanguage('ja')}
        className={`hover:text-primary transition-colors ${
          i18n.language === 'ja' ? 'text-primary font-medium' : 'text-gray-600'
        }`}
      >
        JP
      </button>
      <span className="text-gray-300 text-sm">|</span>
      <button
        onClick={() => changeLanguage('en')}
        className={`hover:text-primary transition-colors ${
          i18n.language === 'en' ? 'text-primary font-medium' : 'text-gray-600'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher; 