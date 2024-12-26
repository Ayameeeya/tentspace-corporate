import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  const highlights = t('about.highlights', { returnObjects: true });

  return (
    <section id="about" className="py-32 relative">
      <div className="absolute inset-0">
        <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-5xl font-bold mb-6 gradient-text">
              {t('about.title')}
            </h2>
            <p className="text-base md:text-xl text-gray-600 mb-12 whitespace-pre-wrap">
              {t('about.description')}
            </p>

            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {Array.isArray(highlights) && highlights.map((item: any, index: any) => (
                <div key={index} className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                  <div className="text-2xl md:text-3xl font-bold mb-2 text-primary">{item.number}</div>
                  <div className="text-sm md:text-base text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-12 lg:mt-0">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80"
                alt="Our Team"
                className="w-full h-[600px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;