export type InsulinType = 'rapid' | 'basal' | 'premix';

export interface InsulinLogEntry {
  id: string;
  timestamp: string; // ISO string
  type: InsulinType;
  units: number;
  brandName?: string; // e.g. Humalog, Novorapid, Lantus, Tresiba, Basaglar
  deliveryMethod?: 'pen' | 'syringe' | 'pump';
  notes?: string;
  isDemo?: boolean;
}
