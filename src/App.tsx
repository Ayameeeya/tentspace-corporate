import './i18n';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ChatWidget from './components/ChatWidget/ChatWidget';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return null;
}

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
    <Router>
      <ScrollToHash />
      <div className="min-h-screen bg-white text-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<Terms />} />
          <Route path="*" element={<Home />} />
        </Routes>
        {/* <ChatWidget /> */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;