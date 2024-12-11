import { useTranslation } from 'react-i18next';
import { Users, Target, Rocket, Award, Code2, Zap } from 'lucide-react';

const iconComponents = {
  Target: Target,
  Users: Users,
  Award: Award,
  Rocket: Rocket,
  Code2: Code2,
  Zap: Zap
};

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-32 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              {t('aboutUs.hero.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('aboutUs.hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('aboutUs.story.title')}</h2>
            <div className="space-y-4 text-gray-600">
              {(t('aboutUs.story.content', { returnObjects: true }) as any[]).map((paragraph: any, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
              alt="Our Team"
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('aboutUs.values.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {(t('aboutUs.values.items', { returnObjects: true }) as any[]).map((value: any, index: number) => {
              const IconComponent = iconComponents[value.icon as keyof typeof iconComponents];
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="mb-4 p-3 inline-block glass-effect rounded-lg">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Company Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                {t('aboutUs.title')}
              </h2>
              <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
                <div className="space-y-4">
                  {Object.entries(t('aboutUs.companyInfo', { returnObjects: true })).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <p className="text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative h-[450px] rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3225.1039232979833!2d139.25152187595322!3d36.06656920870997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601ed16336a01925%3A0x275b3773a2773cd7!2z44CSMzU1LTAzMTYg5Z-8546J55yM5q-U5LyB6YOh5bCP5bed55S66KeS5bGx77yT77yS77yT!5e0!3m2!1sja!2sjp!4v1732522051815!5m2!1sja!2sjp"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;