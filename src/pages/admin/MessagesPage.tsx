import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, MailOpen, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [searchTerm, statusFilter, messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) throw error;
      loadMessages();
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Erreur lors de la suppression du message');
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      markAsRead(message.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Consultez et répondez aux messages des clients</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({messages.length})
            </button>
            <button
              onClick={() => setStatusFilter('new')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'new'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nouveaux ({messages.filter(m => m.status === 'new').length})
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'read'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lus ({messages.filter(m => m.status === 'read').length})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="mx-auto mb-2" size={48} />
                <p>Aucun message trouvé</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg transition-all group ${
                    selectedMessage?.id === message.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : message.status === 'new'
                      ? 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => openMessage(message)}>
                      <div className="flex items-center space-x-2 mb-1">
                        {message.status === 'new' ? (
                          <Mail className="text-yellow-600" size={16} />
                        ) : (
                          <MailOpen className="text-gray-400" size={16} />
                        )}
                        <p className="font-semibold text-gray-900">{message.name}</p>
                      </div>
                      <p className="text-sm text-gray-600">{message.email}</p>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{message.message}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          {selectedMessage ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Détails du message</h2>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Nom</label>
                  <p className="text-gray-900 mt-1">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                      {selectedMessage.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Téléphone</label>
                  <p className="text-gray-900 mt-1">
                    <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Date</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Message</label>
                  <p className="text-gray-900 mt-2 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Eye className="mx-auto mb-2" size={48} />
                <p>Sélectionnez un message pour voir les détails</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
