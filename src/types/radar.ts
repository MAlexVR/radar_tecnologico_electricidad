export interface Technology {
  id: string;
  name: string;
  code: string;
  sector: number;
  ring: number;
  angleOff: number;
  labelDy?: number;
  trl: number;
  desc: string;
  impact: string;
  horizon: string;
  nameLines?: string[];
}

export interface Ring {
  id: string;
  label: string;
  radius: number;
  color: string;
  fillColor: string;
  borderColor: string;
  labelColor: string;
  desc: string;
  trl: string;
}

export interface Sector {
  id: string;
  label: string;
  shortLabel: string;
  labelLines?: string[];
  startAngle: number;
  color: string;
  bgLight: string;
  bgDark: string;
  icon: string;
}

export interface ActiveFilters {
  sectors: Set<number>;
  rings: Set<number>;
}
