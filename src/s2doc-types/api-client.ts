// TypeScript API client for s2doc Python backend
import { Document, Page, Element } from './index';

export interface S2DocAPIConfig {
  baseUrl: string;
  apiKey?: string;
}

export class S2DocAPIClient {
  private config: S2DocAPIConfig;

  constructor(config: S2DocAPIConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`S2Doc API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Document operations
  async getDocument(documentId: string): Promise<Document> {
    return this.request<Document>(`/documents/${documentId}`);
  }

  async createDocument(documentData: Partial<Document>): Promise<Document> {
    return this.request<Document>('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<Document> {
    return this.request<Document>(`/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Page operations
  async getPage(documentId: string, pageId: string): Promise<Page> {
    return this.request<Page>(`/documents/${documentId}/pages/${pageId}`);
  }

  async getPages(documentId: string): Promise<Page[]> {
    return this.request<Page[]>(`/documents/${documentId}/pages`);
  }

  // Element operations
  async getElements(documentId: string, pageId?: string): Promise<Element[]> {
    const endpoint = pageId
      ? `/documents/${documentId}/pages/${pageId}/elements`
      : `/documents/${documentId}/elements`;
    return this.request<Element[]>(endpoint);
  }

  async getElementById(documentId: string, elementId: string): Promise<Element> {
    return this.request<Element>(`/documents/${documentId}/elements/${elementId}`);
  }

  // Utility methods
  async uploadPDF(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.config.baseUrl}/documents/upload`, {
      method: 'POST',
      body: formData,
      headers: this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchDocuments(query: string): Promise<Document[]> {
    return this.request<Document[]>(`/documents/search?q=${encodeURIComponent(query)}`);
  }

  // Batch operations
  async batchProcessDocuments(documentIds: string[]): Promise<Document[]> {
    return this.request<Document[]>('/documents/batch', {
      method: 'POST',
      body: JSON.stringify({ document_ids: documentIds }),
    });
  }
}

// Factory function for easy instantiation
export function createS2DocClient(config: S2DocAPIConfig): S2DocAPIClient {
  return new S2DocAPIClient(config);
}

// Default client instance (can be configured)
export const defaultS2DocClient = createS2DocClient({
  baseUrl: '/api',
});
