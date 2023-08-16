export interface Formula {
  id: string | number;
  title: string;
  slug: string;
  version: string;
  creator: string;
  author: string;
  description: string;
  config?: {
    ui?: string;
    entrypoint?: any;
  };
  visible?: boolean;
  instanceId?: string | number;
  height?: number;
  ready?: boolean;
  params?: Record<string, unknown>;
  endpoint?: string;
}
