export interface Formula {
  id: string | number;
  title: string;
  slug: string;
  version: string;
  creator: string;
  author: string;
  description: string;
  visible?: boolean;
  instanceId?: string | number;
}
