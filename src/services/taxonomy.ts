export const SYSTEM_CATEGORIES: Record<string, string[]> = {
  'Powertrain': ['Engine System', 'Transmission System', 'Drivetrain'],
  'Suspension & Steering': ['Front Suspension', 'Rear Suspension', 'Steering'],
  'Brake System': ['Brake Components'],
  'Electrical System': ['Charging & Starting', 'Electronics'],
  'Body & Exterior': ['Doors & Glass'],
  'Interior': ['Dashboard & Controls']
};

export const CATEGORIES = [
  { id: 'Powertrain', name: 'Powertrain', count: '3 Parts', image: 'engines' },
  { id: 'Suspension & Steering', name: 'Suspension & Steering', count: '3 Parts', image: 'suspension' },
  { id: 'Brake System', name: 'Brake System', count: '2 Parts', image: 'brakes' },
  { id: 'Electrical System', name: 'Electrical System', count: '6 Parts', image: 'electrical' },
  { id: 'Body & Exterior', name: 'Body & Exterior', count: '1 Part', image: 'steering' },
  { id: 'Interior', name: 'Interior', count: '1 Part', image: 'transmission' }
];

export const SYSTEMS_TAXONOMY: Record<string, { name: string; assemblies: Record<string, string[]> }> = {
  'Powertrain': {
    name: 'Powertrain',
    assemblies: {
      'Engine System': ['Cylinder Head', 'Carburetor', 'Intake Manifold'],
      'Transmission System': ['Transmission'],
      'Drivetrain': ['Rear Axle Housing']
    }
  },
  'Suspension & Steering': {
    name: 'Suspension & Steering',
    assemblies: {
      'Front Suspension': ['Suspension Springs', 'Struts'],
      'Rear Suspension': ['Leaf Spring'],
      'Steering': ['Steering Wheel', 'Power Steering Pump', 'Steering Gear Box']
    }
  },
  'Brake System': {
    name: 'Brake System',
    assemblies: {
      'Brake Components': ['Brake Caliper', 'Brake Rotors', 'Master Cylinder']
    }
  },
  'Electrical System': {
    name: 'Electrical System',
    assemblies: {
      'Charging & Starting': ['Alternator'],
      'Electronics': ['Ignition Box']
    }
  },
  'Body & Exterior': {
    name: 'Body & Exterior',
    assemblies: {
      'Doors & Glass': ['Door Shell']
    }
  },
  'Interior': {
    name: 'Interior',
    assemblies: {
      'Dashboard & Controls': ['Dashboard', 'Gauge Cluster', 'Radio', 'Switches', 'Steering Wheel']
    }
  }
};
