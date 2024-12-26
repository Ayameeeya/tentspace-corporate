import { Mail, MapPin, MessagesSquare, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm, ValidationError } from '@formspree/react';

const Contact = () => {
  const { t } = useTranslation();
  const [state, handleSubmit] = useForm("mkgnqgbn");

  const contactInfo = [
    {
      icon: <MapPin className="text-primary" />,
      title: t('contact.location.title'),
      content: t('contact.location.content')
    },
    {
      icon: <Mail className="text-primary" />,
      title: t('contact.email.title'),
      content: t('contact.email.content')
    },
    {
      icon: <MessagesSquare className="text-primary" />,
      title: t('contact.chat.title'),
      content: t('contact.chat.content')
    }
  ];

  const errorClassName = "text-red-500 text-sm mt-1";

  return (
    <section id="contact" className="py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-2xl md:text-5xl font-bold mb-4 gradient-text">
            {t('contact.title')}
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {contactInfo.map((item, index) => (
              <div key={index} className="bg-white p-4 md:p-6 rounded-xl shadow-lg flex items-start space-x-4">
                <div className="p-2 md:p-3 glass-effect rounded-lg">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-1 text-gray-900">{item.title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          {state.succeeded ? (
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {t('contact.form.successTitle')}
                </h3>
                <p className="text-sm md:text-base text-gray-600 text-center max-w-md">
                  {t('contact.form.success')}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg space-y-6">
              <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t('contact.form.name')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <ValidationError
                  prefix="Name"
                  field="name"
                  errors={state.errors}
                  className={errorClassName}
                />
              </div>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('contact.form.email')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                  className={errorClassName}
                />
              </div>
              <div>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder={t('contact.form.message')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                ></textarea>
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                  className={errorClassName}
                />
              </div>
              <button
                type="submit"
                disabled={state.submitting}
                className="w-full px-6 py-3 bg-primary text-sm md:text-base text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.submitting ? t('contact.form.sending') : t('contact.form.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;