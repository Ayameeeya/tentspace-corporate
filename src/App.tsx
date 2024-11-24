import './i18n';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const updateTitle = () => {
      document.title = t('meta.title');
    };

    updateTitle();
    i18n.on('languageChanged', updateTitle);

    return () => {
      i18n.off('languageChanged', updateTitle);
    };
  }, [t, i18n]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;