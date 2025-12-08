import { Response } from "express";

export const sendError = (
  res: Response,
  errors: string,
  status: number,
  data?: Record<string, unknown>
) => {
  res.status(status).json({
    success: false,
    errors,
    data,
  });
};

export const sendSuccess = (
  res: Response,
  message: string,
  status: number,
  data?: unknown
) => {
  return res.status(status).json({
    success: true,
    message,
    data: data,
  });
};

export const formatDate = (value: any) => {
  if (!value) return value;
  
  return new Date(value).toISOString().split("T")[0];
};
