// pages/api/volume.ts
// Secure POST endpoint for volume data ingestion from NinjaTrader

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { validateVolumeBar, validateVolumeBarBatch } from '../../utils/validateVolumeBar';

type SuccessResponse = {
  success: true;
  message: string;
  inserted: number;
  data?: any;
};

type ErrorResponse = {
  success: false;
  error: string;
  errors?: string[];
};

type ApiResponse = SuccessResponse | ErrorResponse;

/**
 * Volume Data Ingestion API
 * POST /api/volume
 * 
 * Accepts single volume bar or array of bars
 * Validates data and inserts into Supabase
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    const data = req.body;

    // Check if batch insert (array) or single insert
    const isBatch = Array.isArray(data);
    
    // Validate data
    const validation = isBatch 
      ? validateVolumeBarBatch(data)
      : validateVolumeBar(data);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      });
    }

    // Insert into Supabase
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('volume_data')
      .insert(isBatch ? validation.data : [validation.data!])
      .select();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Database insertion failed',
        errors: [insertError.message]
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: `Successfully inserted ${insertedData?.length || 1} volume bar(s)`,
      inserted: insertedData?.length || 1,
      data: insertedData
    });

  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      errors: [error.message || 'Unknown error occurred']
    });
  }
}
