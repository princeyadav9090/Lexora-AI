import { consultationService } from '../services/consultationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const bookConsultation = asyncHandler(async (req, res) => {
  const consultation = await consultationService.bookConsultation(req.user.id, req.body);
  return res.status(201).json(new ApiResponse(201, { consultation }, 'Consultation booked successfully'));
});

export const getConsultations = asyncHandler(async (req, res) => {
  const consultations = await consultationService.getUserConsultations(req.user.id, req.user.role);
  return res.status(200).json(new ApiResponse(200, { consultations }, 'Consultations fetched'));
});
