import { assistantService } from '../services/assistantService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await assistantService.getConversations(req.user.id);
  return res.status(200).json(new ApiResponse(200, { conversations }, 'Conversations fetched'));
});

export const createConversation = asyncHandler(async (req, res) => {
  const conversation = await assistantService.createConversation(req.user.id, req.body);
  return res.status(201).json(new ApiResponse(201, { conversation }, 'Conversation created'));
});

export const sendMessage = asyncHandler(async (req, res) => {
  const message = await assistantService.sendMessage(req.user.id, req.params.id, req.body.content);
  return res.status(200).json(new ApiResponse(200, { message }, 'Message processed'));
});

export const explainClause = asyncHandler(async (req, res) => {
  const explanation = await assistantService.explainClause(req.body);
  return res.status(200).json(new ApiResponse(200, { explanation }, 'Clause explanation generated'));
});
