export const detailsChangeApi = {
  create: () => '/api/details-change',
  pending: () => '/api/details-change/pending',
  approve: (id: string) => `/api/details-change/${id}/approve`,
  reject: (id: string) => `/api/details-change/${id}/reject`,
};
