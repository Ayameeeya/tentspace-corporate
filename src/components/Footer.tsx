import React from 'react';
import { Code2, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
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
              Building the future through innovative technology solutions.
            </p>
            <div className="flex space-x-6">
              {[Twitter, Github, Linkedin].map((Icon, index) => (
                <a key={index} href="#" className="p-2 text-gray-400 hover:text-primary transition-colors">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-6 text-lg text-gray-900">Services</h3>
            <ul className="space-y-4 text-gray-600">
              {['Custom Development', 'Digital Innovation', 'Tech Consulting', 'Rapid Prototyping'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-6 text-lg text-gray-900">Company</h3>
            <ul className="space-y-4 text-gray-600">
              {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} tent␣. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;