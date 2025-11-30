# @s2doc/table-editor

A standalone Vue 3 table editor component with advanced editing capabilities, extracted from the KIETA webapp project. 

The editor is based on the [S2Doc](https://github.com/Raynswor/s2doc) format and serves to edit tables structures in S2Doc documents.
It supports rich table manipulation features including cell merging, splitting, moving and other operations, along with import/export functionality.
These changes are not only visual but also update the underlying S2Doc data structure.
It is therefore suitable for creating/editing table data in the context of document analysis applications.

## Features

- **Table Editing**: Add/remove rows and columns
- **Cell Operations**: Move, merge, and split cells, edit content
- **Import/Export**: Load and save table data in S2Doc format
- ⌨**Keyboard Shortcuts**: Move cells using arrow keys
- **Color Modes**: Multiple visualization modes (functional, confidence, edited, etc.)
- **Cell Images**: Support for cell background images

## Project Structure

```
table-editor-standalone/
├── src/
│   ├── components/
│   │   ├── TableEditor.vue    # Main table editor component
│   │   └── BaseEditor.vue     # Base wrapper component
│   ├── composables/
│   │   ├── useOperationManager.ts
│   │   └── useConfigManagement.ts
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── utils/
│   │   └── tableHelpers.ts   # Utility functions
│   └── index.ts              # Main export file
├── example/                   # Example application
│   ├── src/
│   │   ├── App.vue
│   │   └── main.ts
│   └── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Installation

```bash
npm install @s2doc/table-editor
# or
yarn add @s2doc/table-editor
# or
pnpm add @s2doc/table-editor
```

## Prerequisites

This component requires Vue 3 and Vuetify 3 as peer dependencies:

```bash
npm install vue@^3.5.0 vuetify@^3.10.0
```

## Usage

### Basic Usage

```vue
<template>
  <v-app>
    <TableEditor
      :initial-table-matrix="tableData"
      @save="handleSave"
      @change="handleChange"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TableEditor, TableCell, RectangleRegion } from '@s2doc/table-editor'
import '@s2doc/table-editor/style.css'

const tableData = ref([
  [
    new TableCell(
      'cell-0-0',
      new RectangleRegion(0, 0, 100, 50),
      { content: 'Header 1', column_label: true }
    ),
    // ... more cells
  ]
])

const handleSave = () => {
  console.log('Table saved')
}

const handleChange = (data: any) => {
  console.log('Table changed:', data)
}
</script>
```

### Using with Data Objects

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TableEditor } from '@s2doc/table-editor'

const tableData = ref([
  [
    {
      oid: 'cell-0-0',
      category: 'TableCell',
      boundingBox: { x1: 0, y1: 0, x2: 100, y2: 50 },
      data: { 
        content: 'Header 1', 
        column_label: true 
      },
      rowSpan: 1,
      colSpan: 1
    },
    // ... more cells
  ]
])
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialTableMatrix` | `Array` | `[]` | Initial table matrix with cells |
| `constraintMatrix` | `Array` | `undefined` | Optional constraint matrix |
| `editOpsTracker` | `Object` | `{}` | Tracks edit operations |
| `enableUnassignedCells` | `Boolean` | `false` | Enable unassigned cells support |
| `documentContext` | `Object` | `null` | Document context (for advanced features) |
| `tableElementId` | `String` | `null` | Table element ID |
| `pageImage` | `String` | `''` | Base64 or data URL of page image |
| `disableImageLoad` | `Boolean` | `false` | Disable automatic image loading |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `save` | `void` | Emitted when save button is clicked |
| `saveEvent` | `Object` | Emitted with table data on save |
| `change` | `Object` | Emitted when table data changes |
| `errorEvent` | `String` | Emitted on error |
| `constraintEvent` | `Object` | Emitted on constraint events |
| `tableRecalibrated` | `Object` | Emitted after table recalibration |
| `cellDivided` | `Object` | Emitted after cell division |

## Table Cell Structure

```typescript
interface TableCell {
  oid: string                    // Unique cell ID
  category: string               // Always 'TableCell'
  boundingBox: RectangleRegion   // Cell position/size
  data: {
    content?: string             // Cell text content
    row_label?: boolean          // Is row header
    column_label?: boolean       // Is column header
    color?: string               // Cell color
    [key: string]: any          // Additional properties
  }
  confidence?: number            // Confidence score
  added?: boolean                // Was added by user
  deleted?: boolean              // Was deleted by user
  img?: string                   // Cell image (data URL)
  rowSpan: number                // Row span
  colSpan: number                // Column span
}
```

## Color Modes

The editor supports multiple visualization modes:

- **functional**: Default mode with functional coloring
- **confidence**: Colors based on confidence scores
- **edited**: Highlights edited cells
- **predef**: Uses predefined colors
- **constraint**: Shows constraint violations

Set via configuration:

```typescript
import { useConfigManagement } from '@s2doc/table-editor'

const { updateConfig } = useConfigManagement()
updateConfig({ tableColorMode: 'confidence' })
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Run development (example app)
cd example
npm install
npm run dev

# Build library
cd ..
npm run build

# Type check
npm run type-check
```

### Building for Production

```bash
npm run build
```

This creates:
- `dist/table-editor.es.js` - ES module
- `dist/table-editor.umd.js` - UMD module
- `dist/style.css` - Component styles
- `dist/index.d.ts` - TypeScript declarations

## Running the Example

An example application is included to demonstrate the editor:

```bash
cd example
npm install
npm run dev
```

Then open <http://localhost:5173> in your browser.

## Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Delete` - Delete selected cells
- Arrow keys - Navigate cells
- `Shift + Arrow` - Extend selection

## License

MIT

## Contributing

Contributions are welcome! This is a standalone extraction from the [KIETA webapp project](https://github.com/Raynswor/kieta_webapp).
