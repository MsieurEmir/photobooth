import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Users, Star, Award, CheckCheck, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const AboutPage = () => {
  const values = [
    {
      icon: <Camera className="w-8 h-8 text-primary" />,
      title: "Qualité",
      description: "Nous utilisons uniquement des équipements professionnels pour garantir des photos de haute qualité."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Service Client",
      description: "Notre équipe est dédiée à offrir un service exceptionnel du premier contact jusqu'à la fin de votre événement."
    },
    {
      icon: <Star className="w-8 h-8 text-primary" />,
      title: "Innovation",
      description: "Nous recherchons constamment de nouvelles technologies pour améliorer l'expérience photobooth."
    },
    {
      icon: <CheckCheck className="w-8 h-8 text-primary" />,
      title: "Fiabilité",
      description: "Notre équipement est testé rigoureusement pour garantir un fonctionnement sans faille lors de votre événement."
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Excellence",
      description: "Nous visons l'excellence dans chaque aspect de notre service, de la prise de contact à la livraison des souvenirs."
    },
    {
      icon: <Gift className="w-8 h-8 text-primary" />,
      title: "Créativité",
      description: "Nous apportons une touche créative unique à chaque événement grâce à nos designs personnalisés."
    }
  ];

  return (
    <div>
      <SEO
        title="À Propos de PixBooth - Notre Histoire et Nos Valeurs"
        description="Découvrez l'histoire de PixBooth, spécialiste de la location de photobooths depuis 2015. Plus de 2000 événements réussis et 98% de clients satisfaits."
        keywords="à propos PixBooth, histoire photobooth, équipe PixBooth, valeurs entreprise, photobooth professionnel, spécialiste photobooth"
        url="/about"
        type="website"
      />
      <div className="bg-secondary text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">À Propos de Nous</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Découvrez l'histoire de PixBooth et notre passion pour créer des souvenirs inoubliables.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.pexels.com/photos/7148157/pexels-photo-7148157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Équipe PixBooth - Spécialiste de la location de photobooths pour événements"
                className="rounded-lg shadow-lg w-full h-auto"
                loading="lazy"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Notre Mission</h2>
              <div className="w-20 h-1 bg-primary mb-6"></div>
              <p className="text-gray-600 mb-6">
                Fondée en 2015 par des passionnés de photographie et de technologie, PixBooth est née d'une idée simple : 
                créer des souvenirs authentiques et joyeux lors des événements spéciaux.
              </p>
              <p className="text-gray-600 mb-6">
                Notre mission est de transformer chaque événement en une expérience mémorable, en combinant technologie de pointe 
                et service personnalisé pour capturer des moments de bonheur authentiques.
              </p>
              <div className="flex justify-between items-center text-center border-t border-b border-gray-200 py-6">
                <div>
                  <h3 className="text-4xl font-bold text-primary">2015</h3>
                  <p className="text-gray-600">Année de fondation</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-primary">2000+</h3>
                  <p className="text-gray-600">Événements</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-primary">98%</h3>
                  <p className="text-gray-600">Clients satisfaits</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Nos Valeurs
            </motion.h2>
            <motion.div 
              className="w-20 h-1 bg-primary mx-auto mb-6"
              initial={{ width: 0 }}
              whileInView={{ width: 80 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <motion.p 
              className="max-w-2xl mx-auto text-gray-600"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Ces principes guident chacune de nos actions et nous aident à offrir une expérience exceptionnelle.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="card p-6 hover:border-l-4 hover:border-primary"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container-custom text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Prêt à Créer des Souvenirs Inoubliables?
          </motion.h2>
          <motion.p 
            className="max-w-2xl mx-auto text-lg opacity-90 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Contactez-nous dès aujourd'hui pour discuter de votre prochain événement 
            et découvrir comment nous pouvons le rendre inoubliable.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/contact"
              className="btn-accent text-lg px-8 py-4 shadow-lg"
            >
              Contactez-Nous
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;