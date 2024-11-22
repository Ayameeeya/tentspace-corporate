import React, { useState, useEffect } from 'react';
import { Code2, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect py-2' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900">tent␣</span>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-primary transition-colors">Services</a>
              <a href="#about" className="text-gray-600 hover:text-primary transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Contact</a>
              <a href="#contact" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Get Started
              </a>
            </div>
          </div>
          
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-effect mt-2">
          <div className="px-4 py-4 space-y-3">
            <a href="#services" className="block px-3 py-2 text-gray-600 hover:text-primary rounded-lg transition-colors">Services</a>
            <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-primary rounded-lg transition-colors">About</a>
            <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-primary rounded-lg transition-colors">Contact</a>
            <a href="#contact" className="block px-3 py-2 bg-primary text-white rounded-lg text-center hover:bg-primary/90 transition-colors">
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;