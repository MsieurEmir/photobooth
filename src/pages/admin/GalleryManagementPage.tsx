import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ImageUploadModal } from '../../components/admin/ImageUploadModal';
import { TagManagement } from '../../components/admin/TagManagement';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
  tags?: Array<{ id: string; name: string }>;
}

interface GalleryTag {
  id: string;
  name: string;
  imageCount?: number;
}

const GalleryManagementPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [tags, setTags] = useState<GalleryTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    loadGalleryData();
  }, []);

  const loadGalleryData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadImages(), loadTags()]);
    } catch (error) {
      console.error('Error loading gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
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
              tags: imageTags?.map((it: any) => ({
                id: it.gallery_tags.id,
                name: it.gallery_tags.name
              })) || []
            };
          })
        );

        setImages(imagesWithTags);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const loadTags = async () => {
    try {
      const { data: tagsData, error: tagsError } = await supabase
        .from('gallery_tags')
        .select('*')
        .order('name');

      if (tagsError) throw tagsError;

      if (tagsData) {
        const tagsWithCounts = await Promise.all(
          tagsData.map(async (tag) => {
            const { count } = await supabase
              .from('gallery_image_tags')
              .select('*', { count: 'exact', head: true })
              .eq('tag_id', tag.id);

            return {
              ...tag,
              imageCount: count || 0
            };
          })
        );

        setTags(tagsWithCounts);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    try {
      const filePath = imageUrl.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('gallery-images')
          .remove([`uploads/${filePath}`]);
      }

      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Erreur lors de la suppression de l\'image');
    }
  };

  const createTag = async (tagName: string) => {
    try {
      const { error } = await supabase
        .from('gallery_tags')
        .insert({ name: tagName });

      if (error) throw error;
      await loadTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  };

  const toggleTagFilter = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  const filteredImages = selectedTags.length === 0
    ? images
    : images.filter((image) =>
        selectedTags.every((selectedTagId) =>
          image.tags?.some((tag) => tag.id === selectedTagId)
        )
      );

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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Galerie</h1>
          <p className="text-gray-600">Gérez les images de votre galerie</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Ajouter des images</span>
        </button>
      </div>

      <TagManagement tags={tags} onTagsChange={loadTags} />

      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Filtrer par tags</p>
          {selectedTags.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline flex items-center space-x-1"
            >
              <X size={14} />
              <span>Effacer les filtres</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={clearFilters}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTags.length === 0
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({images.length})
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTagFilter(tag.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTags.includes(tag.id)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.name} ({tag.imageCount})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredImages.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">
              {selectedTags.length > 0
                ? 'Aucune image avec ces tags'
                : 'Aucune image dans la galerie'}
            </p>
            {selectedTags.length === 0 && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="btn-primary mt-4"
              >
                Ajouter des images
              </button>
            )}
          </div>
        ) : (
          filteredImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card overflow-hidden group relative"
            >
              <div className="aspect-square bg-gray-200">
                <img
                  src={image.image_url}
                  alt={image.caption}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">{image.caption}</p>
                <div className="flex flex-wrap gap-1">
                  {image.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteImage(image.id, image.image_url)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          loadGalleryData();
        }}
        availableTags={tags}
        onCreateTag={createTag}
      />
    </div>
  );
};

export default GalleryManagementPage;
