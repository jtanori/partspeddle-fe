import { Cog, Compass, Disc, Zap, Car, Armchair } from 'lucide-react';

export const getSystemIcon = (sysName: string) => {
  switch (sysName) {
    case 'Powertrain': return Cog;
    case 'Suspension & Steering': return Compass;
    case 'Brake System': return Disc;
    case 'Electrical System': return Zap;
    case 'Body & Exterior': return Car;
    case 'Interior': return Armchair;
    default: return Cog;
  }
};
