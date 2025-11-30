// Auto-generated pipeline models for s2doc TypeScript integration
// Based on kieta-data-objs pipeline.model.ts

export interface Parameter {
  name: string;
  description: string;
  label: string;
  type: string;
  items?: string[];
  current_value: any;
  default_value: any;
  order_key?: number;
}

export interface PipelineModule {
  name: string;
  description?: string;
  label: string;
  parameters: Record<string, Parameter>;
  type?: 'input' | 'output' | 'processing';
}

export class PipelineDefinition {
  // abstract definition of a pipeline
  name: string;
  modules: PipelineModule[];

  constructor(name: string, modules: PipelineModule[]) {
    this.name = name;
    this.modules = modules;
  }

  add_module(mod: PipelineModule) {
    this.modules.push(mod);
  }

  delete_module(index: number) {
    this.modules.splice(index, 1);
  }
}

export interface Pipeline {
  // defined sequence of modules with defined parameters
  name: string;
  modules: PipelineModule[];
}
