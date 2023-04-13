import { requestTemplate } from './requestTemplate';

export const getInstalledFormulas = requestTemplate(() => ({
  url: '/api/formulas/installed',
  method: 'GET',
}));
