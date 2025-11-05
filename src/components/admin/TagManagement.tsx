import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Edit2, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GalleryTag {
  id: string;
  name: string;
  color: string;
  imageCount?: number;
}

interface TagManagementProps {
  tags: GalleryTag[];
  onTagsChange: () => void;
}

export const TagManagement: React.FC<TagManagementProps> = ({ tags, onTagsChange }) => {
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagColor, setEditingTagColor] = useState('');

  const startEdit = (tag: GalleryTag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    setEditingTagColor(tag.color);
  };

  const cancelEdit = () => {
    setEditingTagId(null);
    setEditingTagName('');
    setEditingTagColor('');
  };

  const saveEdit = async (tagId: string) => {
    if (!editingTagName.trim()) {
      alert('Le nom du tag ne peut pas être vide');
      return;
    }

    try {
      const { error } = await supabase
        .from('gallery_tags')
        .update({
          name: editingTagName.toLowerCase().trim(),
          color: editingTagColor
        })
        .eq('id', tagId);

      if (error) throw error;

      setEditingTagId(null);
      setEditingTagName('');
      setEditingTagColor('');
      onTagsChange();
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('Erreur lors de la mise à jour du tag');
    }
  };

  const deleteTag = async (tagId: string, tagName: string, imageCount: number = 0) => {
    const message =
      imageCount > 0
        ? `Êtes-vous sûr de vouloir supprimer le tag "${tagName}"? Il est utilisé par ${imageCount} image${
            imageCount > 1 ? 's' : ''
          }.`
        : `Êtes-vous sûr de vouloir supprimer le tag "${tagName}"?`;

    if (!confirm(message)) return;

    try {
      const { error } = await supabase.from('gallery_tags').delete().eq('id', tagId);

      if (error) throw error;
      onTagsChange();
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Erreur lors de la suppression du tag');
    }
  };

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Tag className="mr-2" size={20} />
        Gestion des Tags
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tags.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Tag className="mx-auto mb-2" size={32} />
            <p className="text-sm">Aucun tag disponible</p>
            <p className="text-xs">Créez-en un lors de l'ajout d'une image</p>
          </div>
        ) : (
          tags.map((tag) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-3 group relative overflow-hidden"
              style={{
                borderLeft: `4px solid ${tag.color}`
              }}
            >
              {editingTagId === tag.id ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingTagName}
                      onChange={(e) => setEditingTagName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit(tag.id)}
                      className="input-field text-sm py-1 flex-1"
                      placeholder="Nom du tag"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(tag.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Sauvegarder"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Annuler"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-gray-700">Couleur:</label>
                    <input
                      type="color"
                      value={editingTagColor}
                      onChange={(e) => setEditingTagColor(e.target.value)}
                      className="w-12 h-8 rounded cursor-pointer border border-gray-300"
                    />
                    <div
                      className="flex-1 px-3 py-1 rounded-full text-xs font-medium text-center"
                      style={{
                        backgroundColor: editingTagColor,
                        color: '#ffffff'
                      }}
                    >
                      Aperçu
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{tag.name}</p>
                      {typeof tag.imageCount === 'number' && (
                        <p className="text-xs text-gray-500">
                          {tag.imageCount} image{tag.imageCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Modifier"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteTag(tag.id, tag.name, tag.imageCount)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
