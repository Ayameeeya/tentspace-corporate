import { Github, Linkedin, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_black_symbol-sj8aep4AiJ8rmg4cI3B2xAxWjIwNPC.png" alt="Logo" width={40} height={40} />
              <span className="ml-1 text-base md:text-xl font-bold text-gray-900">tent␣</span>
            </div>
            <p className="text-gray-600 mb-6 text-xs md:text-sm">
              {t('footer.description')}
            </p>
            <div className="flex space-x-6">
              {socialLinks.map(({ Icon, href }, index) => (
                <a key={index} href={href} className="p-2 text-gray-400 hover:text-primary transition-colors">
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 md:mb-6 text-base md:text-lg text-gray-900">{t('footer.services.title')}</h3>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-600">
              {(t('footer.services.items', { returnObjects: true }) as Array<{ label: string, href: string }>).map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 md:mb-6 text-base md:text-lg text-gray-900">{t('footer.company.title')}</h3>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-600">
              {(t('footer.company.items', { returnObjects: true }) as Array<{ label: string, href: string }>).map((item, index) => (
                <li key={index}>
                  {item.href.startsWith('/') ? (
                    <Link to={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
                  ) : (
                    <a href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
                  )}
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