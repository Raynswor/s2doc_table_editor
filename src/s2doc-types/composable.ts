// Vue 3 Composable for s2doc integration
import { ref, computed, type Ref } from 'vue';
import { Document, Page, Element } from './index';
import { S2DocAPIClient, type S2DocAPIConfig } from './api-client';

export interface UseS2DocOptions {
  apiConfig?: S2DocAPIConfig;
  autoLoad?: boolean;
}

export function useS2Doc(options: UseS2DocOptions = {}) {
  // State
  const documents = ref<Document[]>([]);
  const currentDocument = ref<Document | null>(null);
  const currentPage = ref<Page | null>(null);
  const elements = ref<Element[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // API Client
  const apiClient = new S2DocAPIClient(
    options.apiConfig || {
      baseUrl: '/api',
    }
  );

  // Computed
  const hasDocument = computed(() => currentDocument.value !== null);
  const hasPage = computed(() => currentPage.value !== null);
  const pageCount = computed(() => currentDocument.value?.pages?.allIds.length || 0);

  // Methods
  const setError = (message: string) => {
    error.value = message;
    console.error('S2Doc Error:', message);
  };

  const clearError = () => {
    error.value = null;
  };

  const loadDocument = async (documentId: string) => {
    loading.value = true;
    clearError();

    try {
      const document = await apiClient.getDocument(documentId);
      currentDocument.value = document;

      // Auto-load first page if available
      if (document.pages && document.pages.allIds.length > 0) {
        const firstPage = document.pages.values()[0];
        if (firstPage) {
          await loadPage(documentId, firstPage.oid);
        }
      }
    } catch (err) {
      setError(`Failed to load document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      loading.value = false;
    }
  };

  const loadPage = async (documentId: string, pageId: string) => {
    loading.value = true;
    clearError();

    try {
      const page = await apiClient.getPage(documentId, pageId);
      currentPage.value = page;

      // Load elements for this page
      const pageElements = await apiClient.getElements(documentId, pageId);
      elements.value = pageElements;
    } catch (err) {
      setError(`Failed to load page: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      loading.value = false;
    }
  };

  const loadDocuments = async () => {
    loading.value = true;
    clearError();

    try {
      // This would need to be implemented in the API
      // For now, we'll use search with empty query to get all docs
      const allDocs = await apiClient.searchDocuments('');
      documents.value = allDocs;
    } catch (err) {
      setError(`Failed to load documents: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      loading.value = false;
    }
  };

  const uploadDocument = async (file: File) => {
    loading.value = true;
    clearError();

    try {
      const document = await apiClient.uploadPDF(file);
      documents.value.push(document);
      currentDocument.value = document;
      return document;
    } catch (err) {
      setError(`Failed to upload document: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchDocuments = async (query: string) => {
    loading.value = true;
    clearError();

    try {
      const results = await apiClient.searchDocuments(query);
      documents.value = results;
      return results;
    } catch (err) {
      setError(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getElementById = async (documentId: string, elementId: string) => {
    try {
      return await apiClient.getElementById(documentId, elementId);
    } catch (err) {
      setError(`Failed to get element: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  };  // Navigation helpers
  const nextPage = async () => {
    if (!currentDocument.value || !currentPage.value) return;

    const pages = currentDocument.value.pages;
    if (!pages) return;

    const pageList = pages.values();
    const currentIndex = pageList.findIndex((p: any) => p.oid === currentPage.value!.oid);
    if (currentIndex < pageList.length - 1) {
      const nextPage = pageList[currentIndex + 1];
      if (nextPage) {
        await loadPage(currentDocument.value.oid, nextPage.oid);
      }
    }
  };

  const previousPage = async () => {
    if (!currentDocument.value || !currentPage.value) return;

    const pages = currentDocument.value.pages;
    if (!pages) return;

    const pageList = pages.values();
    const currentIndex = pageList.findIndex((p: any) => p.oid === currentPage.value!.oid);
    if (currentIndex > 0) {
      const prevPage = pageList[currentIndex - 1];
      if (prevPage) {
        await loadPage(currentDocument.value.oid, prevPage.oid);
      }
    }
  };

  const goToPage = async (pageNumber: number) => {
    if (!currentDocument.value?.pages) return;

    const page = currentDocument.value.pages.values()[pageNumber - 1];
    if (page) {
      await loadPage(currentDocument.value.oid, page.oid);
    }
  };

  // Auto-load on mount if specified
  if (options.autoLoad) {
    loadDocuments();
  }

  return {
    // State
    documents: documents as Ref<Document[]>,
    currentDocument: currentDocument as Ref<Document | null>,
    currentPage: currentPage as Ref<Page | null>,
    elements: elements as Ref<Element[]>,
    loading: loading as Ref<boolean>,
    error: error as Ref<string | null>,

    // Computed
    hasDocument,
    hasPage,
    pageCount,

    // Methods
    loadDocument,
    loadPage,
    loadDocuments,
    uploadDocument,
    searchDocuments,
    getElementById,
    nextPage,
    previousPage,
    goToPage,
    clearError,

    // API Client (for advanced usage)
    apiClient
  };
}
