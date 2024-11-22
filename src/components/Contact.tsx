import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Get in Touch</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to start your next project? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {[
              { icon: <MapPin className="text-primary" />, title: 'Our Location', content: 'Shibuya Scramble Square, Tokyo, Japan' },
              { icon: <Mail className="text-primary" />, title: 'Email Us', content: 'contact@tent.space' },
              { icon: <Phone className="text-primary" />, title: 'Call Us', content: '+81 (0)3-1234-5678' }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg flex items-start space-x-4">
                <div className="p-3 glass-effect rounded-lg">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <textarea
                rows={4}
                placeholder="Your Message"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;