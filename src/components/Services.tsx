import React from 'react';
import { Code2, Rocket, Users, Zap } from 'lucide-react';

const services = [
  {
    icon: <Code2 className="h-8 w-8 text-primary" />,
    title: 'Custom Development',
    description: 'Building scalable solutions tailored to your unique business needs using cutting-edge technologies.'
  },
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: 'Digital Innovation',
    description: 'Transforming ideas into market-ready products with our expertise in emerging technologies.'
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Tech Consulting',
    description: 'Strategic guidance to help you navigate the digital landscape and make informed technology decisions.'
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Rapid Prototyping',
    description: 'Quick iteration and validation of ideas through efficient prototyping and development processes.'
  }
];

const Services = () => {
  return (
    <section id="services" className="py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions for modern digital challenges
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