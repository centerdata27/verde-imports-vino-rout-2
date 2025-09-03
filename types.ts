
export type VisitStatus = 'not-visited' | 'successful' | 'potential' | 'no-good';

export interface Business {
  name: string;
  address: string;
  phone?: string;
  prospectReason: string;
  latitude: number;
  longitude: number;
  distance?: number;
  status: VisitStatus;
  previouslyVisited: boolean;
  notes?: string;
}

export interface VisitedBusiness {
  name: string;
  address: string;
  phone?: string;
  visitedDate: string;
  status: VisitStatus;
  notes?: string;
}