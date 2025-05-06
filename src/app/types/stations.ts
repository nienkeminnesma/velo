export interface Station {
    id: string;
    name: string;
    timestamp: string;
    free_bikes: number;
    empty_slots: number;
    extra?: {
      address?: string;
      status?: string;
    };
  }