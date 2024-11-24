import { Users, Target, Rocket, Award } from 'lucide-react';

const values = [
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: 'Innovation First',
    description: 'We push boundaries and embrace cutting-edge technologies to create solutions that define the future.'
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Client Partnership',
    description: 'We believe in building lasting relationships, working closely with our clients to ensure their success.'
  },
  {
    icon: <Award className="h-8 w-8 text-primary" />,
    title: 'Excellence',
    description: 'We maintain the highest standards in everything we do, from code quality to client communication.'
  },
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: 'Rapid Delivery',
    description: 'We embrace agile methodologies to deliver value quickly and iterate based on feedback.'
  }
];

const AboutUs = () => {
  return (
    <div className="pt-32 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Crafting Digital Excellence
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're a team of passionate technologists, designers, and problem solvers dedicated to building exceptional digital experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded in 2020, tent␣ emerged from a vision to bridge the gap between innovative technology and practical business solutions. Our journey began with a small team of dedicated developers and has grown into a full-service digital studio.
              </p>
              <p>
                Today, we work with clients worldwide, from startups to enterprises, helping them navigate the digital landscape and build products that make a difference.
              </p>
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
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="mb-4 p-3 inline-block glass-effect rounded-lg">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;