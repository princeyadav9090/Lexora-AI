import { documentService } from '../services/documentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getTemplates = asyncHandler(async (req, res) => {
  const templates = await documentService.getTemplates();
  return res.status(200).json(new ApiResponse(200, { templates }, 'Templates fetched'));
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await documentService.getDashboardStats(req.user.id);
  return res.status(200).json(new ApiResponse(200, { stats }, 'Dashboard stats fetched'));
});

export const generateDocument = asyncHandler(async (req, res) => {
  const result = await documentService.generateDocument(req.user.id, req.body);
  return res.status(201).json(new ApiResponse(201, result, 'Document generated successfully'));
});

export const getDocuments = asyncHandler(async (req, res) => {
  const documents = await documentService.getUserDocuments(req.user.id);
  return res.status(200).json(new ApiResponse(200, { documents }, 'Documents fetched'));
});

export const getDocumentDetail = asyncHandler(async (req, res) => {
  const document = await documentService.getDocumentDetail(req.user.id, req.params.id);
  return res.status(200).json(new ApiResponse(200, { document }, 'Document details fetched'));
});

export const updateDocument = asyncHandler(async (req, res) => {
  const document = await documentService.updateDocument(req.user.id, req.params.id, req.body);
  return res.status(200).json(new ApiResponse(200, { document }, 'Document updated successfully'));
});

export const signDocument = asyncHandler(async (req, res) => {
  const document = await documentService.signDocument(req.user.id, req.params.id);
  return res.status(200).json(new ApiResponse(200, { document }, 'Document signed successfully'));
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const result = await documentService.deleteDocument(req.user.id, req.params.id);
  return res.status(200).json(new ApiResponse(200, result, 'Document deleted successfully'));
});
