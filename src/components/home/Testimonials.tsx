import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Marie & Thomas",
    event: "Mariage",
    quote: "Notre photobooth a été l'un des points forts de notre mariage ! Les invités ont adoré et nous avons maintenant des souvenirs hilarants pour toute la vie.",
    image: "https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    rating: 5,
    date: "2024-10-15"
  },
  {
    name: "Tech Solutions",
    event: "Conférence d'entreprise",
    quote: "Service impeccable et photobooth de grande qualité. Notre événement d'entreprise a été un succès et l'équipe a été très professionnelle.",
    image: "https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    rating: 5,
    date: "2024-09-22"
  },
  {
    name: "Sophie",
    event: "Anniversaire 30 ans",
    quote: "J'ai loué un photobooth pour mon anniversaire et c'était parfait ! Installation rapide, excellent service et des photos de qualité.",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    rating: 4,
    date: "2024-11-01"
  }
];

const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PixBooth',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    reviewCount: testimonials.length.toString()
  },
  review: testimonials.map(testimonial => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: testimonial.name
    },
    datePublished: testimonial.date,
    reviewBody: testimonial.quote,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: testimonial.rating.toString(),
      bestRating: '5'
    }
  }))
};

const Testimonials = () => {
  return (
    <section className="section bg-secondary-light">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ce que <span className="text-primary">Disent</span> Nos Clients
          </motion.h2>
          <motion.div 
            className="w-20 h-1 bg-primary mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.p 
            className="max-w-2xl mx-auto text-gray-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Découvrez les expériences de nos clients qui ont fait confiance à nos services de photobooth.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="card p-6 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="pt-6 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-accent-yellow fill-accent-yellow' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.event}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;