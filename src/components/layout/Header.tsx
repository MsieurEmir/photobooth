import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Nos Photobooths', path: '/catalog' },
    { name: 'Galerie', path: '/gallery' },
    { name: 'Réserver', path: '/booking' },
    { name: 'À Propos', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

const solidHeader = isScrolled || location.pathname !== '/' || isOpen;
  return (

<header
  className={`fixed w-full z-[100] transition-all duration-300 ${
    solidHeader
      ? 'bg-secondary shadow-md py-2'
      : 'bg-secondary/95 md:bg-transparent md:bg-gradient-to-b md:from-black/60 md:to-transparent py-4'
  }`}
  style={{ backdropFilter: solidHeader ? 'blur(8px)' : 'blur(4px)', top: 0 }}
>
      <div className="container-custom flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center space-x-2 group"
        >
          <Camera className="h-8 w-8 text-accent-yellow transition-transform group-hover:scale-110" />
          <span className="font-heading font-bold text-xl text-white">
            PixBooth
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-medium transition-all duration-200 text-white hover:text-accent-yellow relative
                ${location.pathname === link.path ? 'text-accent-yellow' : ''}
                after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px]
                after:bg-accent-yellow after:transform after:scale-x-0 after:transition-transform
                after:origin-bottom-right hover:after:scale-x-100 hover:after:origin-bottom-left
                ${location.pathname === link.path ? 'after:scale-x-100' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden z-20"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Menu className="h-6 w-6 text-white" />
          )}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-secondary z-10 md:hidden flex flex-col"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <div className="h-20" />
              <nav className="flex flex-col space-y-6 p-8 text-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-xl font-medium text-white hover:text-accent-yellow transition-colors
                      ${location.pathname === link.path ? 'text-accent-yellow font-semibold' : ''}`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/booking"
                  className="btn-accent mt-4 hover:scale-105 transition-transform"
                >
                  Réserver Maintenant
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;