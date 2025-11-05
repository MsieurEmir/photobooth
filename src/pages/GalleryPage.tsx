import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  tags: Array<{ id: string; name: string; color: string }>;
}

interface GalleryTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [tags, setTags] = useState<GalleryTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGalleryData();
  }, []);

  const loadGalleryData = async () => {
    setLoading(true);
    try {
      const { data: imagesData, error: imagesError } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_public', true)
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
                  name: it.gallery_tags.name,
                  color: it.gallery_tags.color
                })) || []
            };
          })
        );

        setImages(imagesWithTags);

        const tagCounts = new Map<string, { id: string; name: string; color: string; count: number }>();

        imagesWithTags.forEach((image) => {
          image.tags.forEach((tag) => {
            if (tagCounts.has(tag.id)) {
              const existing = tagCounts.get(tag.id)!;
              existing.count++;
            } else {
              tagCounts.set(tag.id, { id: tag.id, name: tag.name, color: tag.color, count: 1 });
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

  const toggleTagExpansion = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const renderTags = (item: GalleryImage, maxTags = 3) => {
    const isExpanded = expandedTags.has(item.id);
    const visibleTags = isExpanded ? item.tags : item.tags.slice(0, maxTags);
    const hiddenCount = item.tags.length - maxTags;

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {visibleTags.map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-0.5 rounded-full text-xs font-medium shadow-sm"
            style={{
              backgroundColor: tag.color,
              color: '#ffffff'
            }}
          >
            {tag.name}
          </span>
        ))}
        {hiddenCount > 0 && !isExpanded && (
          <button
            onClick={(e) => toggleTagExpansion(item.id, e)}
            className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-700 hover:bg-white transition-colors shadow-sm flex items-center gap-0.5"
          >
            +{hiddenCount}
            <ChevronDown size={12} />
          </button>
        )}
        {isExpanded && item.tags.length > maxTags && (
          <button
            onClick={(e) => toggleTagExpansion(item.id, e)}
            className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-700 hover:bg-white transition-colors shadow-sm"
          >
            <ChevronUp size={12} />
          </button>
        )}
      </div>
    );
  };

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
            className={`px-6 py-2 rounded-full transition-all font-medium ${
              filter === 'tous'
                ? 'bg-secondary text-white shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Tous ({images.length})
          </button>
          {tags.map((tag) => {
            const isSelected = filter === tag.name;
            return (
              <button
                key={tag.id}
                onClick={() => setFilter(tag.name)}
                className={`px-6 py-2 rounded-full transition-all font-medium border-2 ${
                  isSelected ? 'shadow-lg transform scale-105' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: isSelected ? tag.color : '#f3f4f6',
                  color: isSelected ? '#ffffff' : '#1f2937',
                  borderColor: isSelected ? tag.color : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = `${tag.color}20`;
                    e.currentTarget.style.borderColor = tag.color;
                    e.currentTarget.style.color = tag.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = '#1f2937';
                  }
                }}
              >
                {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)} ({tag.count})
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              className="relative overflow-hidden rounded-lg cursor-pointer aspect-square group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedImage(item)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={item.image_url}
                alt={item.caption}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pb-2">
                <div className="mb-1.5">
                  {renderTags(item, 3)}
                </div>
                {item.caption && (
                  <p className="text-white text-xs font-medium line-clamp-2">{item.caption}</p>
                )}
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
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.caption}
                className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
              />
              <button
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white transition-colors backdrop-blur-sm"
                onClick={() => setSelectedImage(null)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mt-4">
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {selectedImage.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                      style={{
                        backgroundColor: tag.color,
                        color: '#ffffff'
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
              {selectedImage.caption && (
                <p className="text-white text-base font-medium">{selectedImage.caption}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;
