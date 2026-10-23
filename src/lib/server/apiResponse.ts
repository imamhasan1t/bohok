// BOHOK Phase 8 — Standardized JSON API Response Helper
// Formats uniform success and error payloads with proper HTTP status codes

import { NextResponse } from 'next/server';
import { AppError } from './errors/appErrors';

export function successResponse<T>(data: T, status = 200, headers?: HeadersInit): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status, headers }
  );
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          messageBn: err.messageBn,
          details: err.details,
        },
      },
      { status: err.statusCode }
    );
  }

  const message = err instanceof Error ? err.message : 'Unknown internal server error';
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
        messageBn: 'সার্ভারে অভ্যন্তরীণ ত্রুটি দেখা দিয়েছে। কিছুক্ষণ পর পুনরায় চেষ্টা করুন।',
      },
    },
    { status: 500 }
  );
}
