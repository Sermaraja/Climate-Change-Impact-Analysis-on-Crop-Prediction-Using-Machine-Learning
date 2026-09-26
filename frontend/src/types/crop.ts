export interface CropVariety {
  id: number;
  variety_name: string;
  duration_days?: number;
  submergence_tolerance_days: number;
  drought_tolerance?: string;
}

export interface CropGrowthStage {
  id: number;
  stage_name: string;
  stage_order: number;
  min_age_days: number;
  max_age_days: number;
  flood_vulnerability_level: string;
  description?: string;
}

export interface MasterCrop {
  id: number;
  name: string;
  scientific_name?: string;
  category?: string;
  description?: string;
  varieties: CropVariety[];
  growth_stages: CropGrowthStage[];
}

export interface FarmCropData {
  id: number;
  farm_id: number;
  crop_id: number;
  crop_name: string;
  scientific_name?: string;
  variety_id?: number;
  variety_name?: string;
  planting_date: string;
  crop_age_days: number;
  estimated_growth_stage: string;
  confirmed_growth_stage?: string;
  growth_stage: string;
  season?: string;
  status: string;
  is_active: boolean;
  created_at: string;
}
