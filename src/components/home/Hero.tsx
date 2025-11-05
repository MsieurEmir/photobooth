import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-overlay z-10"></div>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-friends-having-fun-in-a-party-4640-large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Content */}
      <div className="container-custom relative z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl mb-6 font-heading font-extrabold">
            Créez des Souvenirs Inoubliables
          </h1>
          <p className="text-white text-lg md:text-xl mb-8 opacity-90">
            Nos photobooths modernes et élégants animeront parfaitement 
            vos mariages, soirées d'entreprise et événements spéciaux.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/booking"
              className="btn-primary text-lg px-8 py-4 shadow-lg"
            >
              Réserver Maintenant
            </Link>
            <Link
              to="/catalog"
              className="btn-outline border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4"
            >
              Découvrir nos Modèles
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 sm:bottom-8 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <a
          href="#features"
          className="text-white flex flex-col items-center"
          aria-label="Scroll down"
        >
          <span className="text-xs md:text-sm mb-1 md:mb-2">Découvrir</span>
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;