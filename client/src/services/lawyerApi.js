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
    sessionStorage.removeItem('lexora_consultations'); // Invalidate cache
    return fetchClient('/consultations', {
      method: 'POST',
      body: JSON.stringify({ lawyerId, date, time, issue })
    });
  },

  async getConsultations() {
    const cached = sessionStorage.getItem('lexora_consultations');
    if (cached) return JSON.parse(cached);

    const res = await fetchClient('/consultations');
    const consultations = res.consultations || res;
    sessionStorage.setItem('lexora_consultations', JSON.stringify(consultations));
    return consultations;
  }
};
