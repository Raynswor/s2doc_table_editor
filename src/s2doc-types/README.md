# S2Doc TypeScript Types

Auto-generated TypeScript definitions and utilities for the s2doc Python library.

## Overview

This package provides:
- 🔧 **Auto-generated TypeScript interfaces** from s2doc Python classes
- 🌐 **HTTP API client** for backend communication
- ⚡ **Vue 3 composable** for reactive state management
- 📝 **Full type safety** with IntelliSense support

## Quick Start

### Basic Usage

```typescript
import { Document, Page, Element, createS2DocClient } from '@/s2doc-types';

// Create API client
const client = createS2DocClient({
  baseUrl: 'http://localhost:8000/api/s2doc'
});

// Load document
const document: Document = await client.getDocument('doc-id');
console.log(document.oid, document.pages);
```

### Vue 3 Integration

```vue
<template>
  <div>
    <div v-if="loading">Loading document...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else-if="hasDocument">
      <h1>Document: {{ currentDocument?.oid }}</h1>
      <nav>
        <button @click="previousPage" :disabled="!canGoPrevious">Previous</button>
        <span>Page {{ currentPageNumber }} of {{ pageCount }}</span>
        <button @click="nextPage" :disabled="!canGoNext">Next</button>
      </nav>
      <div v-if="hasPage">
        <h2>Page: {{ currentPage?.oid }}</h2>
        <div v-for="element in elements" :key="element.oid">
          <!-- Render elements -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useS2Doc } from '@/s2doc-types';

const {
  currentDocument,
  currentPage,
  elements,
  loading,
  error,
  hasDocument,
  hasPage,
  pageCount,
  loadDocument,
  nextPage,
  previousPage
} = useS2Doc();

// Load document on mount
const documentId = 'your-document-id';
await loadDocument(documentId);

// Computed properties for navigation
const currentPageNumber = computed(() => {
  if (!currentDocument.value?.pages || !currentPage.value) return 0;
  return currentDocument.value.pages.findIndex(p => p.oid === currentPage.value!.oid) + 1;
});

const canGoPrevious = computed(() => currentPageNumber.value > 1);
const canGoNext = computed(() => currentPageNumber.value < pageCount.value);
</script>
```

## API Reference

### Types

All s2doc Python classes are available as TypeScript interfaces and classes:

- `Document` / `IDocument` - Document structure
- `Page` / `IPage` - Page within a document
- `Element` / `IElement` - Text or visual element
- `Table` / `ITable` - Table structure
- `Font` / `IFont` - Font information
- Region types: `RectangleRegion`, `SpanRegion`, `LineRegion`, `PolygonRegion`
- `Space` / `ISpace` - Spatial information
- `Revision` / `IRevision` - Document revision data

### API Client

#### Constructor
```typescript
const client = new S2DocAPIClient({
  baseUrl: 'http://localhost:8000/api/s2doc',
  apiKey?: 'optional-api-key'
});
```

#### Methods

##### Document Operations
```typescript
// Get document by ID
await client.getDocument(documentId: string): Promise<Document>

// Create new document
await client.createDocument(data: Partial<Document>): Promise<Document>

// Update document
await client.updateDocument(id: string, updates: Partial<Document>): Promise<Document>

// Delete document
await client.deleteDocument(id: string): Promise<void>

// Upload PDF file
await client.uploadPDF(file: File): Promise<Document>

// Search documents
await client.searchDocuments(query: string): Promise<Document[]>
```

##### Page Operations
```typescript
// Get specific page
await client.getPage(documentId: string, pageId: string): Promise<Page>

// Get all pages in document
await client.getPages(documentId: string): Promise<Page[]>
```

##### Element Operations
```typescript
// Get elements (optionally filtered by page)
await client.getElements(documentId: string, pageId?: string): Promise<Element[]>

// Get specific element
await client.getElementById(documentId: string, elementId: string): Promise<Element>
```

### Vue Composable

#### Usage
```typescript
const {
  // State
  documents,           // Ref<Document[]>
  currentDocument,     // Ref<Document | null>
  currentPage,        // Ref<Page | null>
  elements,           // Ref<Element[]>
  loading,            // Ref<boolean>
  error,              // Ref<string | null>

  // Computed
  hasDocument,        // ComputedRef<boolean>
  hasPage,           // ComputedRef<boolean>
  pageCount,         // ComputedRef<number>

  // Methods
  loadDocument,      // (id: string) => Promise<void>
  loadPage,          // (docId: string, pageId: string) => Promise<void>
  loadDocuments,     // () => Promise<void>
  uploadDocument,    // (file: File) => Promise<Document>
  searchDocuments,   // (query: string) => Promise<Document[]>
  getElementById,    // (docId: string, elemId: string) => Promise<Element | null>
  nextPage,          // () => Promise<void>
  previousPage,      // () => Promise<void>
  goToPage,          // (pageNumber: number) => Promise<void>
  clearError,        // () => void

  // Advanced
  apiClient          // S2DocAPIClient
} = useS2Doc(options?: UseS2DocOptions);
```

#### Options
```typescript
interface UseS2DocOptions {
  apiConfig?: S2DocAPIConfig;  // API client configuration
  autoLoad?: boolean;          // Auto-load documents on mount
}
```

## Configuration

### Environment Variables

```env
# API base URL
VITE_S2DOC_API_URL=http://localhost:8000/api/s2doc

# Optional API key
VITE_S2DOC_API_KEY=your-api-key
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes the s2doc-types directory:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/s2doc-types/*": ["src/s2doc-types/*"]
    }
  }
}
```

## Regenerating Types

When s2doc Python classes are updated, regenerate TypeScript types:

```bash
# From frontend directory
npm run generate-s2doc-types

# Or manually from dissertation_code directory
uv run python scripts/generate_ts_types.py
```

## Migration from kieta-data-objs

See [MIGRATION.md](./MIGRATION.md) for detailed migration guide.

## Development

### File Structure
```
s2doc-types/
├── index.ts              # Main exports
├── api-client.ts         # HTTP API client
├── composable.ts         # Vue 3 composable
├── *.model.ts           # Auto-generated type definitions
├── MIGRATION.md         # Migration guide
└── README.md           # This file
```

### Customization

The API client and composable can be extended for project-specific needs:

```typescript
import { S2DocAPIClient } from '@/s2doc-types';

class CustomS2DocClient extends S2DocAPIClient {
  async customMethod() {
    // Your custom logic
    return this.request('/custom-endpoint');
  }
}
```

## Troubleshooting

### Common Issues

1. **Type errors after Python updates**: Regenerate types with `npm run generate-s2doc-types`

2. **API connection errors**: Check `VITE_S2DOC_API_URL` environment variable

3. **Import errors**: Ensure TypeScript path mapping is configured correctly

4. **Missing types**: Verify the Python class is included in the generation script

### Debug Mode

Enable debug logging:

```typescript
const client = createS2DocClient({
  baseUrl: 'http://localhost:8000/api/s2doc'
});

// API calls will log errors to console
```

## Contributing

This package is auto-generated. To make changes:

1. Update Python s2doc classes in `dissertation_code/s2doc/`
2. Modify generation script: `dissertation_code/scripts/generate_ts_types.py`
3. Regenerate types: `npm run generate-s2doc-types`
4. Update API client or composable manually as needed
