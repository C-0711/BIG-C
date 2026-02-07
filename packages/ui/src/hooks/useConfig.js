import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7074';

export function useIntelligenceConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch full config
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/config`);
      if (!res.ok) throw new Error('Failed to fetch config');
      const data = await res.json();
      setConfig(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a section
  const updateSection = useCallback(async (section, data) => {
    try {
      const res = await fetch(`${API_URL}/api/config/${section}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchConfig();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }, [fetchConfig]);

  // Add item to a section
  const addItem = useCallback(async (section, item) => {
    try {
      const res = await fetch(`${API_URL}/api/config/${section}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error('Failed to add');
      await fetchConfig();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }, [fetchConfig]);

  // Update item
  const updateItem = useCallback(async (section, id, data) => {
    try {
      const res = await fetch(`${API_URL}/api/config/${section}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchConfig();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }, [fetchConfig]);

  // Delete item
  const deleteItem = useCallback(async (section, id) => {
    try {
      const res = await fetch(`${API_URL}/api/config/${section}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchConfig();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }, [fetchConfig]);

  // Toggle enabled
  const toggleEnabled = useCallback(async (section, id, enabled) => {
    return updateItem(section, id, { enabled });
  }, [updateItem]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateSection,
    addItem,
    updateItem,
    deleteItem,
    toggleEnabled,
  };
}

export default useIntelligenceConfig;
