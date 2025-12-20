export class CreatePunchDto {
  employeeId?: string; // optional if using auth
  timestamp: string;   // ISO or parsable date string
  type?: 'IN' | 'OUT' | null; // optional — service infers if missing
  source?: string; // e.g. "BIOMETRIC", "MOBILE"
}
