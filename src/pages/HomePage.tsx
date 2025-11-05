import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import PhotoboothShowcase from '../components/home/PhotoboothShowcase';
import Testimonials from '../components/home/Testimonials';
import Cta from '../components/home/Cta';

const HomePage = () => {
  return (
    <>
      <Hero />
      <Features />
      <PhotoboothShowcase />
      <Testimonials />
      <Cta />
    </>
  );
};

export default HomePage;