import { Code2, Smartphone, Cloud, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: <Code2 className="h-8 w-8 text-primary" />,
      title: t('services.items.web.title'),
      description: t('services.items.web.description')
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: t('services.items.mobile.title'),
      description: t('services.items.mobile.description')
    },
    {
      icon: <Cloud className="h-8 w-8 text-primary" />,
      title: t('services.items.cloud.title'),
      description: t('services.items.cloud.description')
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: t('services.items.custom.title'),
      description: t('services.items.custom.description')
    }
  ];

  return (
    <section id="services" className="py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text">
            {t('services.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-6 p-3 inline-block glass-effect rounded-lg group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">{service.title}</h3>
              <p className="text-gray-600 text-lg">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;