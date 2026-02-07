import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';

/**
 * useProducts Hook
 * Fetches and manages product data with search, filtering, and pagination
 */
export function useProducts(options = {}) {
  const {
    autoLoad = false,
    query = '',
    filters = {},
    limit = 20,
    offset = 0,
  } = options;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const loadProducts = useCallback(async (searchQuery = query, searchOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.searchProducts(searchQuery, {
        limit,
        offset: page * limit,
        filters,
        ...searchOptions,
      });

      setProducts(result.products || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, filters, limit, page]);

  useEffect(() => {
    if (autoLoad) {
      loadProducts();
    }
  }, [autoLoad, loadProducts]);

  const nextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(p => Math.max(0, p - 1));
  }, []);

  const goToPage = useCallback((newPage) => {
    setPage(Math.max(0, newPage));
  }, []);

  const refresh = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    loadProducts,
    refresh,
    nextPage,
    prevPage,
    goToPage,
  };
}

/**
 * useProduct Hook
 * Fetches a single product by ID or supplier_pid
 */
export function useProduct(identifier, autoLoad = true) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProduct = useCallback(async (id = identifier) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.getProduct(id);
      setProduct(result);
    } catch (err) {
      setError(err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    if (autoLoad && identifier) {
      loadProduct();
    }
  }, [autoLoad, identifier, loadProduct]);

  return {
    product,
    loading,
    error,
    loadProduct,
    refresh: () => loadProduct(identifier),
  };
}

/**
 * useProductSearch Hook
 * Advanced search with debouncing and semantic search support
 */
export function useProductSearch(initialQuery = '', debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Execute search
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = useSemanticSearch
          ? await api.searchSimilar(debouncedQuery, { limit: 20 })
          : await api.searchProducts(debouncedQuery, { limit: 20 });

        setResults(result.products || result.results || []);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, useSemanticSearch]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    useSemanticSearch,
    setUseSemanticSearch,
    clear,
  };
}

/**
 * useRelatedProducts Hook
 * Fetches related products (graph relationships)
 */
export function useRelatedProducts(productId, relationshipType = null) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRelated = useCallback(async (id = productId, type = relationshipType) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.getRelated(id, type);
      setRelated(result.related || result.products || []);
    } catch (err) {
      setError(err);
      setRelated([]);
    } finally {
      setLoading(false);
    }
  }, [productId, relationshipType]);

  useEffect(() => {
    if (productId) {
      loadRelated();
    }
  }, [productId, loadRelated]);

  return {
    related,
    loading,
    error,
    loadRelated,
    refresh: () => loadRelated(productId, relationshipType),
  };
}
