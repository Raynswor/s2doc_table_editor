// Semantic Network Types
export interface SemanticEntity {
  uri: string
  label: string
  type?: string | { uri: string; label: string }
  flags?: Record<string, any>
  literals?: Record<string, { value: any; datatype?: string }>
}

export interface SemanticRelationship {
  label: string
  head: string | SemanticEntity
  tail: string | SemanticEntity
}

export interface SemanticNetwork {
  // entities: Record<string, SemanticEntity>
  entities: SemanticEntity[]
  relationships: SemanticRelationship[]
  available_types: { uri: string; label: string }[]
}