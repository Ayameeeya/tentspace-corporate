import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
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
                    <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl font-bold gradient-text mb-4">
                        {t('privacy.title')}
                    </h1>
                </div>

                <div className="prose prose-lg max-w-none">
                    {(t('privacy.sections', { returnObjects: true }) as Array<{ title: string; content: string[] }>).map((section, index: number) => (
                        <section key={index} className="mb-12">
                            <h2 className="text-2xl font-semibold mb-4">
                                {section.title}
                            </h2>
                            <div className="text-gray-600 mb-4 space-y-4">
                                {section.content.map((paragraph: string, pIndex: number) => (
                                    <div key={pIndex}>
                                        {renderContentWithLineBreaks(paragraph)}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

                    <div className="text-gray-600 mt-8 pt-8 border-t border-gray-200">
                        <p>{t('privacy.lastUpdated', { date: t('privacy.updateDate') })}</p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPolicy;