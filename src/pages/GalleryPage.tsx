import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  tags: Array<{ id: string; name: string }>;
}

interface GalleryTag {
  id: string;
  name: string;
  count: number;
}

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [tags, setTags] = useState<GalleryTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadGalleryData();
  }, []);

  const loadGalleryData = async () => {
    setLoading(true);
    try {
      const { data: imagesData, error: imagesError } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (imagesError) throw imagesError;

      if (imagesData) {
        const imagesWithTags = await Promise.all(
          imagesData.map(async (image) => {
            const { data: imageTags } = await supabase
              .from('gallery_image_tags')
              .select(
                `
                tag_id,
                gallery_tags (
                  id,
                  name
                )
              `
              )
              .eq('image_id', image.id);

            return {
              ...image,
              tags:
                imageTags?.map((it: any) => ({
                  id: it.gallery_tags.id,
                  name: it.gallery_tags.name
                })) || []
            };
          })
        );

        setImages(imagesWithTags);

        const tagCounts = new Map<string, { id: string; name: string; count: number }>();

        imagesWithTags.forEach((image) => {
          image.tags.forEach((tag) => {
            if (tagCounts.has(tag.id)) {
              const existing = tagCounts.get(tag.id)!;
              existing.count++;
            } else {
              tagCounts.set(tag.id, { id: tag.id, name: tag.name, count: 1 });
            }
          });
        });

        setTags(Array.from(tagCounts.values()).sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    filter === 'tous'
      ? images
      : images.filter((image) => image.tags.some((tag) => tag.name === filter));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la galerie...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-secondary text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Galerie Photos</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Découvrez les moments magiques capturés par nos photobooths lors de différents événements.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setFilter('tous')}
            className={`px-6 py-2 rounded-full transition-all ${
              filter === 'tous'
                ? 'bg-secondary text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Tous ({images.length})
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setFilter(tag.name)}
              className={`px-6 py-2 rounded-full transition-all ${
                filter === tag.name
                  ? 'bg-secondary text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)} ({tag.count})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              className="relative overflow-hidden rounded-lg cursor-pointer aspect-square"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedImage(item.image_url)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={item.image_url}
                alt={item.caption}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                <div>
                  <p className="text-white text-sm font-medium mb-1">{item.caption}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Aucune image trouvée pour cette catégorie.</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-5xl max-h-[90vh]"
          >
            <img
              src={selectedImage}
              alt="Zoom"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;
