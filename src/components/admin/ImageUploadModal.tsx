import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Trash2, Tag, Plus, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableTags: Array<{ id: string; name: string }>;
  onCreateTag: (tagName: string) => Promise<void>;
}

interface ImageFile {
  file: File;
  preview: string;
  caption: string;
  selectedTags: string[];
  isPublic: boolean;
  uploading: boolean;
  progress: number;
  error: string | null;
  uploaded: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableTags,
  onCreateTag
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Format non supporté. Utilisez JPG, PNG ou WEBP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: Fichier trop volumineux (max 5 MB).`;
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newImages: ImageFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
        return;
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        caption: '',
        selectedTags: [],
        isPublic: true,
        uploading: false,
        progress: 0,
        error: null,
        uploaded: false
      });
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index].caption = caption;
      return newImages;
    });
  };

  const toggleImageVisibility = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index].isPublic = !newImages[index].isPublic;
      return newImages;
    });
  };

  const toggleTag = (imageIndex: number, tagId: string) => {
    setImages((prev) => {
      const newImages = [...prev];
      const tags = newImages[imageIndex].selectedTags;
      if (tags.includes(tagId)) {
        newImages[imageIndex].selectedTags = tags.filter((t) => t !== tagId);
      } else {
        newImages[imageIndex].selectedTags = [...tags, tagId];
      }
      return newImages;
    });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      await onCreateTag(newTagName.toLowerCase().trim());
      setNewTagName('');
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Erreur lors de la création du tag');
    } finally {
      setIsCreatingTag(false);
    }
  };

  const uploadImage = async (imageFile: ImageFile, index: number): Promise<boolean> => {
    try {
      const fileExt = imageFile.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      setImages((prev) => {
        const newImages = [...prev];
        newImages[index].uploading = true;
        newImages[index].progress = 0;
        return newImages;
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, imageFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setImages((prev) => {
        const newImages = [...prev];
        newImages[index].progress = 50;
        return newImages;
      });

      const { data: urlData } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      const { data: galleryData, error: galleryError } = await supabase
        .from('gallery')
        .insert({
          image_url: urlData.publicUrl,
          caption: imageFile.caption || 'Photo',
          is_public: imageFile.isPublic
        })
        .select()
        .single();

      if (galleryError) throw galleryError;

      setImages((prev) => {
        const newImages = [...prev];
        newImages[index].progress = 75;
        return newImages;
      });

      if (imageFile.selectedTags.length > 0) {
        const tagInserts = imageFile.selectedTags.map((tagId) => ({
          image_id: galleryData.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('gallery_image_tags')
          .insert(tagInserts);

        if (tagError) throw tagError;
      }

      setImages((prev) => {
        const newImages = [...prev];
        newImages[index].progress = 100;
        newImages[index].uploaded = true;
        newImages[index].uploading = false;
        return newImages;
      });

      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      setImages((prev) => {
        const newImages = [...prev];
        newImages[index].error = 'Erreur lors de l\'upload';
        newImages[index].uploading = false;
        return newImages;
      });
      return false;
    }
  };

  const handleUploadAll = async () => {
    const imagesToUpload = images.filter((img) => !img.uploaded && !img.uploading);

    if (imagesToUpload.length === 0) {
      alert('Aucune image à uploader');
      return;
    }

    const uploadPromises = images.map((img, index) => {
      if (!img.uploaded && !img.uploading) {
        return uploadImage(img, index);
      }
      return Promise.resolve(true);
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter((r) => r).length;

    if (successCount > 0) {
      onSuccess();
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setNewTagName('');
    onClose();
  };

  if (!isOpen) return null;

  const allUploaded = images.length > 0 && images.every((img) => img.uploaded);
  const anyUploading = images.some((img) => img.uploading);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Ajouter des images</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={anyUploading}
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {images.length === 0 ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
              >
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Glissez-déposez vos images ici
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ou cliquez pour sélectionner (max 5 MB par image)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Sélectionner des images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {images.length} image{images.length > 1 ? 's' : ''} sélectionnée{images.length > 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary hover:underline"
                    disabled={anyUploading}
                  >
                    + Ajouter plus d'images
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                </div>

                <div className="card p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Tag size={16} className="mr-2" />
                    Tags disponibles
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {availableTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                      placeholder="Nouveau tag..."
                      className="input-field flex-1 text-sm"
                      disabled={isCreatingTag || anyUploading}
                    />
                    <button
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim() || isCreatingTag || anyUploading}
                      className="btn-primary text-sm flex items-center space-x-1"
                    >
                      <Plus size={16} />
                      <span>Créer</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`card p-4 ${
                        image.uploaded
                          ? 'bg-green-50 border-green-300'
                          : image.error
                          ? 'bg-red-50 border-red-300'
                          : ''
                      }`}
                    >
                      <div className="flex space-x-4">
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <img
                            src={image.preview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {image.uploaded && (
                            <div className="absolute inset-0 bg-green-500/80 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-12 h-12 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={image.caption}
                                onChange={(e) => updateImageCaption(index, e.target.value)}
                                placeholder="Légende de l'image..."
                                className="input-field w-full"
                                disabled={image.uploading || image.uploaded}
                              />
                            </div>
                            {!image.uploaded && !image.uploading && (
                              <button
                                onClick={() => removeImage(index)}
                                className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleImageVisibility(index)}
                              disabled={image.uploading || image.uploaded}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                                image.isPublic
                                  ? 'bg-green-50 border border-green-300 text-green-700 hover:bg-green-100'
                                  : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
                              } ${(image.uploading || image.uploaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {image.isPublic ? (
                                <>
                                  <Eye size={16} />
                                  <span className="text-sm font-medium">Public</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff size={16} />
                                  <span className="text-sm font-medium">Privé</span>
                                </>
                              )}
                            </button>
                            <p className="text-xs text-gray-500">
                              {image.isPublic
                                ? 'Visible sur la galerie publique'
                                : 'Visible uniquement dans l\'admin'}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => toggleTag(index, tag.id)}
                                disabled={image.uploading || image.uploaded}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  image.selectedTags.includes(tag.id)
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>

                          {image.uploading && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Upload en cours...</span>
                                <span className="text-gray-700 font-medium">{image.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${image.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {image.error && (
                            <p className="text-sm text-red-600">{image.error}</p>
                          )}

                          {image.uploaded && (
                            <p className="text-sm text-green-600 font-medium">
                              ✓ Image uploadée avec succès
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="border-t p-6 flex items-center justify-between">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={anyUploading}
              >
                {allUploaded ? 'Fermer' : 'Annuler'}
              </button>
              {!allUploaded && (
                <button
                  onClick={handleUploadAll}
                  disabled={anyUploading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Upload size={18} />
                  <span>
                    {anyUploading
                      ? 'Upload en cours...'
                      : `Uploader ${images.filter((img) => !img.uploaded).length} image${
                          images.filter((img) => !img.uploaded).length > 1 ? 's' : ''
                        }`}
                  </span>
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
