import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';

const Terms = () => {
  const { t } = useTranslation();

  const renderContentWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index}>{line}</p>
    ));
  };

  return (
    <main className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Scale className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl md:text-4xl font-bold gradient-text mb-4">
            {t('terms.title')}
          </h1>
        </div>

        <div className="prose prose-sm md:prose-lg max-w-none">
          {(t('terms.sections', { returnObjects: true }) as Array<{ title: string; content: string[] }>).map((section, index: number) => (
            <section key={index} className="mb-8 md:mb-12">
              <h2 className="text-lg md:text-2xl font-semibold mb-3 md:mb-4">
                {section.title}
              </h2>
              <div className="text-gray-600 mb-4 space-y-3 md:space-y-4">
                {section.content.map((paragraph: string, pIndex: number) => (
                  <div key={pIndex} className="text-sm md:text-base">
                    {renderContentWithLineBreaks(paragraph)}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="text-gray-600 mt-8 pt-8 border-t border-gray-200 text-sm md:text-base">
            <p>{t('terms.lastUpdated', { date: t('terms.updateDate') })}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Terms;