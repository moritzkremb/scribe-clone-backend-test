"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

export interface Document {
  id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  document_type: string;
  status: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (title: string, document_type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          document_type,
          created_by: user.id,
          created_at: now,
          updated_at: now,
          content: '',
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setDocuments(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    createDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments
  };
}