import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnimatedGradient from './AnimatedGradient';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex items-center">
      {/* Animated Gradient background */}
      <AnimatedGradient
        colors={[
          'rgba(26, 77, 193, 0.2)',
          'rgba(26, 77, 193, 0.1)',
        ]}
        speed={1}
        blur="medium"
      />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h1 className="text-4xl md:text-7xl font-bold leading-tight mb-6 gradient-text">
          {t('hero.title')}
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#contact"
            className="group px-6 py-3 bg-primary text-white rounded-lg text-base md:text-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center">
            {t('nav.getStarted')}
            <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#services"
            className="px-6 py-3 glass-effect rounded-lg text-base md:text-lg font-medium hover:bg-gray-900/10 transition-colors">
            {t('hero.cta')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Hero;