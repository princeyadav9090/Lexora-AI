import { fetchClient } from './apiClient.js';

export const lawyerApi = {
  async getLawyers(opts = {}, locationArg, latArg, lngArg) {
    const params = new URLSearchParams();

    if (typeof opts === 'object' && opts !== null) {
      if (opts.specialization) params.append('specialization', opts.specialization);
      if (opts.location) params.append('location', opts.location);
      if (opts.lat) params.append('lat', opts.lat);
      if (opts.lng) params.append('lng', opts.lng);
    } else {
      if (opts) params.append('specialization', opts);
      if (locationArg) params.append('location', locationArg);
      if (latArg) params.append('lat', latArg);
      if (lngArg) params.append('lng', lngArg);
    }

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
