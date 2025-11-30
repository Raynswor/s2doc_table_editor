<template>
  <v-app>
    <v-app-bar color="primary" density="compact">
      <v-toolbar-title>Table Editor Standalone Example</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-github" href="https://github.com/Raynswor/s2doc" target="_blank" />
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-0" style="height: 100vh;">
        <v-row class="ma-0" style="height: 100%;">
          <v-col cols="12" class="pa-2" style="height: 100%;">
            <v-card style="height: 100%;">
              <v-card-title>
                <div class="d-flex align-center justify-space-between w-100">
                  <span>Table Editor Demo</span>
                  <div class="d-flex gap-2 align-center">
                    <v-select
                      v-if="availableTables.length > 0"
                      v-model="selectedTableId"
                      :items="availableTables"
                      item-title="label"
                      item-value="id"
                      label="Select Table"
                      density="compact"
                      style="min-width: 200px;"
                      @update:model-value="loadSelectedTable"
                    />
                    <v-btn color="primary" @click="loadSampleTable">
                      Load Sample Table
                    </v-btn>
                    <v-btn color="secondary" @click="exportTable">
                      Export JSON
                    </v-btn>
                    <v-btn color="info" @click="importTable">
                      Import JSON
                    </v-btn>
                  </div>
                </div>
              </v-card-title>

              <v-card-text style="height: calc(100% - 64px); overflow: auto;">
                <div v-if="tableData && Array.isArray(tableData)" style="height: 100%; min-height: 600px;">
                  <TableEditor
                    :key="JSON.stringify(tableData).substring(0, 50)"
                    :initial-table-matrix="tableData"
                    @save-event="handleSave"
                  />
                </div>
                <div v-else class="d-flex align-center justify-center" style="height: 100%;">
                  <div class="text-center">
                    <v-btn size="large" color="primary" @click="loadSampleTable" class="mb-4">
                      Create New Table
                    </v-btn>
                    <div v-if="tableData && !Array.isArray(tableData)" class="text-error">
                      Error: Invalid table data format (expected array, got {{ typeof tableData }})
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>

    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TableEditor from '../../src/components/TableEditor.vue'
import { Document } from '../../src/s2doc-types/document.model'
import { Element } from '../../src/s2doc-types/element.model'

const tableData = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const loadedDocument = ref<Document | null>(null)
const availableTables = ref<Array<{id: string, label: string}>>([])
const selectedTableId = ref<string | null>(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

function showMessage(message: string, color: string = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

function extractTableMatrix(doc: Document, tableId: string): any[][] | null {
  console.log('Extracting table matrix for:', tableId)
  
  if (!doc.elements || !doc.references) {
    console.warn('Document missing elements or references')
    return null
  }
  
  const tableElement = doc.elements.byId[tableId]
  if (!tableElement) {
    console.warn('Table element not found:', tableId)
    return null
  }
  
  const tableCategory = (tableElement as any).category?.toLowerCase() || ''
  console.log('Table element category:', (tableElement as any).category)
  
  // Check for various table category names
  if (!['table', 'table_region', 'tableregion'].includes(tableCategory)) {
    console.warn('Element is not a table, category:', (tableElement as any).category)
    return null
  }
  
  // First, check if the table element has a pre-built cells matrix
  if ((tableElement as any).data?.cells && Array.isArray((tableElement as any).data.cells)) {
    console.log('Found pre-built cells matrix in table data')
    const cellsMatrix = (tableElement as any).data.cells
    console.log('Matrix dimensions from data.cells:', cellsMatrix.length, 'x', (cellsMatrix[0]?.length || 0))
    
    // The matrix may contain cell IDs (strings) or cell objects
    // We need to resolve IDs to actual cell objects from the document
    const resolvedMatrix: any[][] = []
    
    for (let r = 0; r < cellsMatrix.length; r++) {
      const row: any[] = []
      for (let c = 0; c < cellsMatrix[r].length; c++) {
        const cell = cellsMatrix[r][c]
        
        // If it's a string (cell ID), resolve it to the actual cell object
        if (typeof cell === 'string') {
          const cellObj = doc.elements?.byId[cell]
          if (cellObj) {
            row.push(cellObj)
          } else {
            console.warn(`Cell ${cell} not found in document, keeping as ID reference`)
            row.push(cell)  // Keep the ID, TableEditor will handle it
          }
        } else if (cell && typeof cell === 'object') {
          // It might be a reference object {oid: '...', rowSpan: 2} or a full cell object
          // If it has an oid but no data, it's likely a reference object that needs resolving
          if (cell.oid && !cell.data) {
            const cellObj = doc.elements?.byId[cell.oid]
            if (cellObj) {
              // Merge the element data with the span info from the reference
              // We use Object.assign to combine the element properties with the span info
              const mergedCell = Object.assign({}, cellObj, cell)
              row.push(mergedCell)
            } else {
              console.warn(`Cell ${cell.oid} not found in document, keeping as reference`)
              row.push(cell)
            }
          } else {
            // Already a full cell object
            row.push(cell)
          }
        } else {
          // Null or empty
          row.push(cell)
        }
      }
      resolvedMatrix.push(row)
    }
    
    console.log('Resolved matrix, sample cell:', resolvedMatrix[0]?.[0])
    return resolvedMatrix
  }
  
  console.log('No pre-built matrix found, building from references...')
  
  // Get table cells referenced by this table
  const cellIds = doc.references[tableId] || []
  console.log('Table references:', cellIds.length, 'cells')
  
  // First, let's see what categories the cells actually have
  cellIds.forEach(id => {
    const cell = doc.elements?.byId[id]
    if (cell) {
      console.log(`Cell ${id}: category="${(cell as any).category}"`)
    } else {
      console.log(`Cell ${id}: NOT FOUND in elements`)
    }
  })
  
  const cells = cellIds
    .map(id => doc.elements?.byId[id])
    .filter(cell => {
      if (!cell) return false
      const cellCategory = (cell as any).category?.toLowerCase() || ''
      // Accept various table cell category names
      const isTableCell = cellCategory === 'tablecell' || 
                         cellCategory === 'table_cell' || 
                         cellCategory === 'table-cell' ||
                         cellCategory === 'table_column' ||
                         cellCategory === 'table_row'
      console.log(`Cell category "${(cell as any).category}" -> lowercase: "${cellCategory}" -> isTableCell: ${isTableCell}`)
      return isTableCell
    })
  
  console.log('Filtered cells:', cells.length)
  
  if (cells.length === 0) {
    console.warn('No table cells found for table:', tableId)
    return null
  }
  
  // Debug: Check what data structure the cells have
  console.log('Sample cell data:', {
    oid: (cells[0] as any).oid,
    category: (cells[0] as any).category,
    data: (cells[0] as any).data,
    boundingBox: (cells[0] as any).boundingBox
  })
  
  // Build matrix from cells
  const matrix: any[][] = []
  
  // Check if cells have row/col indices
  const hasIndices = cells.some(cell => 
    (cell as any).data?.row_index !== undefined || 
    (cell as any).data?.col_index !== undefined
  )
  
  console.log('Cells have row/col indices:', hasIndices)
  
  if (hasIndices) {
    // Use row_index and col_index to build matrix
    const rowMap = new Map<number, any[]>()
    
    cells.forEach(cell => {
      const rowIdx = (cell as any).data?.row_index ?? 0
      if (!rowMap.has(rowIdx)) {
        rowMap.set(rowIdx, [])
      }
      rowMap.get(rowIdx)!.push(cell)
    })
    
    console.log('Rows found:', rowMap.size)
    
    // Sort rows and build matrix
    const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b)
    sortedRows.forEach(rowIdx => {
      const rowCells = rowMap.get(rowIdx)!
      rowCells.sort((a, b) => ((a as any).data?.col_index ?? 0) - ((b as any).data?.col_index ?? 0))
      matrix.push(rowCells)
    })
  } else {
    // Try to use bounding boxes to infer structure
    console.log('Using bounding box positions to infer structure')
    const sortedCells = [...cells].sort((a, b) => {
      const aBox = (a as any).boundingBox || (a as any).region
      const bBox = (b as any).boundingBox || (b as any).region
      if (!aBox || !bBox) return 0
      
      // Sort by y position first (rows), then x position (columns)
      const yDiff = (aBox.y1 || aBox.top || 0) - (bBox.y1 || bBox.top || 0)
      if (Math.abs(yDiff) > 5) return yDiff // 5px tolerance for same row
      return (aBox.x1 || aBox.left || 0) - (bBox.x1 || bBox.left || 0)
    })
    
    // Group cells into rows by y-position
    const rowGroups: any[][] = []
    let currentRow: any[] = []
    let currentY = -1
    
    sortedCells.forEach(cell => {
      const box = (cell as any).boundingBox || (cell as any).region
      if (!box) {
        currentRow.push(cell)
        return
      }
      
      const y = box.y1 || box.top || 0
      
      if (currentY === -1 || Math.abs(y - currentY) <= 5) {
        currentRow.push(cell)
        currentY = y
      } else {
        if (currentRow.length > 0) {
          rowGroups.push(currentRow)
        }
        currentRow = [cell]
        currentY = y
      }
    })
    
    if (currentRow.length > 0) {
      rowGroups.push(currentRow)
    }
    
    console.log('Inferred rows from bounding boxes:', rowGroups.length)
    matrix.push(...rowGroups)
  }
  
  console.log('Final matrix dimensions:', matrix.length, 'x', (matrix[0]?.length || 0))
  return matrix.length > 0 ? matrix : null
}

function loadSelectedTable() {
  if (!loadedDocument.value || !selectedTableId.value) return
  
  const matrix = extractTableMatrix(loadedDocument.value, selectedTableId.value)
  if (matrix) {
    tableData.value = matrix
    const table = availableTables.value.find(t => t.id === selectedTableId.value)
    showMessage(`Loaded table: ${table?.label || selectedTableId.value}`, 'success')
  } else {
    showMessage('Failed to extract table matrix', 'error')
  }
}

function loadSampleTable() {
  // Clear document state when loading sample
  loadedDocument.value = null
  availableTables.value = []
  selectedTableId.value = null
  
  // Create a sample 5x5 table
  const sampleMatrix = []
  for (let row = 0; row < 5; row++) {
    const rowData = []
    for (let col = 0; col < 5; col++) {
      const cellId = `cell-${row}-${col}`
      rowData.push({
        oid: cellId,
        category: 'TableCell',
        boundingBox: { x1: col * 100, y1: row * 100, x2: (col + 1) * 100, y2: (row + 1) * 100 },
        data: {
          content: row === 0 ? `Header ${col + 1}` : col === 0 ? `Row ${row}` : `${row},${col}`,
          row_label: col === 0,
          column_label: row === 0
        },
        rowSpan: 1,
        colSpan: 1
      })
    }
    sampleMatrix.push(rowData)
  }
  console.log('Sample table created:', sampleMatrix)
  tableData.value = sampleMatrix
  console.log('tableData.value set to:', tableData.value)
  showMessage('Sample table loaded')
}

function handleSave(data: any) {
  console.log('Table saved event received:', data)
  
  if (!data || !Array.isArray(data)) {
    console.warn('Invalid save data received:', data)
    return
  }
  
  const [tableMatrix, editOpsTracker, cellsArray] = data
  
  // If we have a loaded document and table, save changes back to the document
  if (loadedDocument.value && selectedTableId.value) {
    console.log('Saving table changes back to document:', {
      tableId: selectedTableId.value,
      dimensions: `${tableMatrix.length}x${tableMatrix[0]?.length || 0}`,
      editOps: editOpsTracker
    })
    
    try {
      // Get the table element
      const tableElement = loadedDocument.value.elements?.byId[selectedTableId.value]
      if (tableElement && (tableElement as any).data) {
        
        // 1. Update individual cell elements (content, labels)
        // We iterate through the tableMatrix which contains the full cell objects with latest data
        let updatedCellsCount = 0
        let createdCellsCount = 0
        
        tableMatrix.forEach((row: any[]) => {
          row.forEach((cell: any) => {
            if (cell && typeof cell === 'object' && cell.oid) {
              // Skip placeholder dummy cells (starting with "dummy")
              if (cell.oid.startsWith('dummy')) return

              // Find the original element in the document
              let originalCell = loadedDocument.value?.elements?.byId[cell.oid]
              
              if (!originalCell) {
                // Create new element if it doesn't exist (e.g. added row/col)
                const region = cell.region || cell.boundingBox || { x1: 0, y1: 0, x2: 0, y2: 0 }
                const cellData = {
                  content: cell.data?.content || '',
                  row_label: cell.data?.row_label || false,
                  column_label: cell.data?.column_label || false,
                  ...cell.data
                }
                
                try {
                  // Create new Element using from_dict to handle region conversion
                  const newElement = Element.from_dict({
                    oid: cell.oid,
                    c: 'TableCell',
                    r: ['rr', region.x1 || 0, region.y1 || 0, region.x2 || 0, region.y2 || 0, null],
                    data: cellData,
                    confidence: cell.confidence || 1.0
                  })
                  
                  // Add to document elements
                  loadedDocument.value?.elements?.add(newElement)
                  createdCellsCount++
                } catch (e) {
                  console.error('Failed to create new element for cell:', cell.oid, e)
                }
              } else {
                // Update existing element
                if (!originalCell.data) originalCell.data = {}
                
                let changed = false
                if (cell.data?.content !== undefined && originalCell.data.content !== cell.data.content) {
                  originalCell.data.content = cell.data.content
                  changed = true
                }
                // Update labels
                if (cell.data?.row_label !== undefined && originalCell.data.row_label !== cell.data.row_label) {
                  originalCell.data.row_label = cell.data.row_label
                  changed = true
                }
                if (cell.data?.column_label !== undefined && originalCell.data.column_label !== cell.data.column_label) {
                  originalCell.data.column_label = cell.data.column_label
                  changed = true
                }
                
                if (changed) updatedCellsCount++
              }
            }
          })
        })
        console.log(`Updated ${updatedCellsCount} cells, Created ${createdCellsCount} new cells`)

        // 2. Update the table element's cells matrix structure
        // Use the cellsArray provided by TableEditor which handles spans and dummy cells correctly
        ;(tableElement as any).data.cells = cellsArray
        
        // Also update the tableData so the UI reflects the changes
        tableData.value = tableMatrix
        
        console.log('✓ Table changes saved to document', {
          dimensions: `${cellsArray.length}x${cellsArray[0]?.length || 0}`,
          sampleCell: cellsArray[0]?.[0]
        })
        
        showMessage('Table changes saved', 'success')
      } else {
        console.warn('Could not find table element in document')
        showMessage('Warning: Could not update document', 'warning')
      }
    } catch (error) {
      console.error('Error saving table changes:', error)
      showMessage('Error saving changes', 'error')
    }
  } else {
    // Standalone mode - just update local data
    console.log('Standalone mode: updating local table data')
    tableData.value = tableMatrix
    showMessage('Table saved', 'success')
  }
}

function exportTable() {
  if (!tableData.value) {
    showMessage('No table to export', 'error')
    return
  }

  let dataToExport: any
  let filename: string

  // If we have a loaded document, export the full document
  if (loadedDocument.value && selectedTableId.value) {
    console.log('Exporting full s2doc document')
    console.log('Document before export:', loadedDocument.value)
    
    // Get the table element to verify it has the updated cells
    const tableElement = loadedDocument.value.elements?.byId[selectedTableId.value]
    if (tableElement) {
      console.log('Table element data.cells:', (tableElement as any).data?.cells)
    }
    
    // Use to_obj() method if available (like in webapp), otherwise use the document as-is
    if ((loadedDocument.value as any).to_obj) {
      console.log('Using document.to_obj() for export')
      dataToExport = (loadedDocument.value as any).to_obj()
    } else {
      console.log('Using document directly (no to_obj method)')
      dataToExport = JSON.parse(JSON.stringify(loadedDocument.value))
    }
    
    filename = `document-${loadedDocument.value.oid || 'export'}.json`
    showMessage('Full document exported', 'success')
  } else {
    // Export just the table matrix
    console.log('Exporting table matrix only')
    dataToExport = tableData.value
    filename = 'table-data.json'
    showMessage('Table matrix exported', 'success')
  }

  const dataStr = JSON.stringify(dataToExport, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function importTable() {
  fileInput.value?.click()
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const result = e.target?.result as string
      const parsed = JSON.parse(result)
      
      // Check if it's a s2doc Document format
      if (parsed.oid && parsed.elements && parsed.pages) {
        console.log('Detected s2doc Document format, loading...')
        try {
          const doc = Document.from_dict(parsed)
          loadedDocument.value = doc
          console.log('Document loaded successfully:', doc)
          
          // Find all tables in the document
          const tables: Array<{id: string, label: string}> = []
          if (doc.elements) {
            console.log('Searching for tables in elements:', Object.keys(doc.elements.byId).length, 'elements')
            for (const [id, element] of Object.entries(doc.elements.byId)) {
              const category = (element as any).category?.toLowerCase() || ''
              console.log(`Element ${id}: category="${(element as any).category}"`)
              
              // Check for various table category names (case-insensitive)
              if (category === 'table' || category === 'table_region' || category === 'tableregion') {
                tables.push({
                  id: id,
                  label: (element as any).data?.content || (element as any).data?.label || `Table ${id}`
                })
                console.log(`Found table: ${id}`)
              }
            }
          }
          
          console.log('Total tables found:', tables.length)
          
          if (tables.length === 0) {
            showMessage('No tables found in document', 'warning')
            return
          }
          
          availableTables.value = tables
          
          // If only one table, load it automatically
          if (tables.length === 1) {
            selectedTableId.value = tables[0].id
            const matrix = extractTableMatrix(doc, tables[0].id)
            if (matrix) {
              tableData.value = matrix
              showMessage(`Loaded table: ${tables[0].label}`, 'success')
            } else {
              showMessage('Failed to extract table matrix', 'error')
            }
          } else {
            // Multiple tables - for now, load the first one
            // TODO: Add UI to select which table to load
            selectedTableId.value = tables[0].id
            const matrix = extractTableMatrix(doc, tables[0].id)
            if (matrix) {
              tableData.value = matrix
              showMessage(`Loaded first table: ${tables[0].label}. Document has ${tables.length} tables.`, 'info')
            }
          }
          return
        } catch (error) {
          console.error('Error parsing s2doc document:', error)
          showMessage('Error parsing s2doc document format', 'error')
          return
        }
      }
      
      // Validate that it's an array (table matrix)
      if (!Array.isArray(parsed)) {
        showMessage('Invalid file format: expected table matrix array or s2doc document', 'error')
        return
      }
      
      tableData.value = parsed
      showMessage('Table imported successfully')
    } catch (error) {
      console.error('Error parsing JSON:', error)
      showMessage('Error importing table', 'error')
    }
  }
  reader.readAsText(file)

  // Reset file input
  target.value = ''
}

onMounted(() => {
  // Load sample table on startup
  console.log('App mounted, loading sample table...')
  loadSampleTable()
})
</script>

<style scoped>
.fill-height {
  height: 100%;
}

.gap-2 {
  gap: 8px;
}
</style>
