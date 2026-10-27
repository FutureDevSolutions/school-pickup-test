export const SCHOOL_PICKUP_CLASS_CODES = [
  'PG-C',
  'PG-S',
  'PG-T',
  'PG-E',
  'NUR-C',
  'NUR-S',
  'NUR-E',
  'NUR-T',
  'KG-S',
  'KG-T',
  'KG-C',
  'KG-E',
  '1-S',
  '1-T',
  '1-E',
  '1-C',
  '2-S',
  '2-T',
  '2-E',
  '2-C',
  '3-S',
  '3-T',
  '3-E',
  '3-C',
] as const;

export type SchoolPickupClassCode =
  (typeof SCHOOL_PICKUP_CLASS_CODES)[number];
