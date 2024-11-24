import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-effect py-2' : 'bg-transparent py-4'
      }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center"
          >
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_gradation__symbol-3BWbJdNPb1TreoCQYugpmwHZs5CsrW.png" alt="Logo" width={40} height={40} />
            <span className="ml-1 text-xl font-bold text-gray-900">tent␣</span>
          </Link>

          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link to="/#services" className="text-gray-600 hover:text-primary transition-colors">{t('nav.services')}</Link>
              <Link to="/#about" className="text-gray-600 hover:text-primary transition-colors">{t('nav.about')}</Link>
              <Link to="/#contact" className="text-gray-600 hover:text-primary transition-colors">{t('nav.contact')}</Link>
              <Link to="/#contact" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                {t('nav.getStarted')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-effect mt-2">
          <div className="px-4 py-4 space-y-3">
            <Link to="/#services" className="block px-3 py-2 text-gray-600 hover:text-primary rounded-lg transition-colors">{t('nav.services')}</Link>
            <Link to="/#about" className="block px-3 py-2 text-gray-600 hover:text-primary rounded-lg transition-colors">{t('nav.about')}</Link>
            <Link to="/#contact" className="block px-3 py-2 text-gray-600 hover:text-primary rounded-lg transition-colors">{t('nav.contact')}</Link>
            <Link to="/#contact" className="block px-3 py-2 bg-primary text-white rounded-lg text-center hover:bg-primary/90 transition-colors">
              {t('nav.getStarted')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;