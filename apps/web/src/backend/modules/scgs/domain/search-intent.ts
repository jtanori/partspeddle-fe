export type SearchIntentType = 'PART_NAME' | 'VIN' | 'OEM_PART_NUMBER' | 'YMM';

export interface VehicleEntity {
  year?: number;
  make?: string;
  model?: string;
}

export interface SearchIntent {
  type: SearchIntentType;
  raw: string;
  entities: {
    vin?: string;
    oemPartNumber?: string;
    vehicle?: VehicleEntity;
    partName?: string;
  };
}
