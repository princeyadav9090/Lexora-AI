import { fetchClient } from './apiClient.js';

export const lawyerApi = {
  async getLawyers(specialization, location) {
    const params = new URLSearchParams();
    if (specialization) params.append('specialization', specialization);
    if (location) params.append('location', location);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchClient(`/lawyers${query}`);
    return res.lawyers || res;
  },

  async getLawyerDetail(id) {
    const res = await fetchClient(`/lawyers/${id}`);
    return res.lawyer || res;
  },

  async bookConsultation(lawyerId, date, time, issue) {
    return fetchClient('/consultations', {
      method: 'POST',
      body: JSON.stringify({ lawyerId, date, time, issue })
    });
  },

  async getConsultations() {
    const res = await fetchClient('/consultations');
    return res.consultations || res;
  }
};
