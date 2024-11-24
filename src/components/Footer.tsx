import { Code2, Github, Linkedin, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const Footer = () => {
  const { t } = useTranslation();

  const socialLinks = [
    { Icon: Twitter, href: '#' },
    { Icon: Github, href: '#' },
    { Icon: Linkedin, href: '#' }
  ];

  return (
    <footer className="border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <Code2 className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">tent␣</span>
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              {t('footer.description')}
            </p>
            <div className="flex space-x-6">
              {socialLinks.map(({ Icon, href }, index) => (
                <a key={index} href={href} className="p-2 text-gray-400 hover:text-primary transition-colors">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-6 text-lg text-gray-900">{t('footer.services.title')}</h3>
            <ul className="space-y-4 text-gray-600">
              {(t('footer.services.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <li key={index}>
                  <a href="#services" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-6 text-lg text-gray-900">{t('footer.company.title')}</h3>
            <ul className="space-y-4 text-gray-600">
              {(t('footer.company.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <li key={index}>
                  <a href="#about" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;