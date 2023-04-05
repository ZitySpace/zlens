export interface Formula {
  id: string | number;
  title: string;
  description: string;
  visible?: boolean;
  instanceId?: string | number;
}
