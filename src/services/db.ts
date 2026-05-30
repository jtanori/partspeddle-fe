import { Part, Seller, CartItem, Offer, SearchFilters, UserSession, TourStep } from '../types';

// ==========================================
// MOCK DATA: SELLERS
// ==========================================
export const MOCK_SELLERS: Seller[] = [
  {
    id: 'seller_ras',
    name: 'Rusty Acres Auto Salvage',
    rating: 4.8,
    reviewCount: 342,
    location: 'Clarksville, TN',
    specialty: 'Chevy / GM Truck Parts',
    partCount: 1248,
    feedbackPercentage: 98,
    shipsWithin: '1 business day',
    returnPolicy: '30 Day Returns'
  },
  {
    id: 'seller_bpc',
    name: 'Backroad Parts Co.',
    rating: 4.7,
    reviewCount: 276,
    location: 'Columbia, MO',
    specialty: 'Drivetrain & Transmissions',
    partCount: 892,
    feedbackPercentage: 97,
    shipsWithin: '1 business day',
    returnPolicy: '30 Day Returns'
  },
  {
    id: 'seller_mas',
    name: 'Midwest Auto Salvage',
    rating: 4.8,
    reviewCount: 412,
    location: 'Des Moines, IA',
    specialty: 'Body & Chassis OEM Restoration',
    partCount: 1775,
    feedbackPercentage: 99,
    shipsWithin: '1 business day',
    returnPolicy: '30 Day Returns'
  },
  {
    id: 'seller_yip',
    name: 'Old Iron Parts',
    rating: 4.6,
    reviewCount: 198,
    location: 'Spokane, WA',
    specialty: 'Vintage Fuel & Induction Systems',
    partCount: 654,
    feedbackPercentage: 95,
    shipsWithin: '2 business days',
    returnPolicy: '14 Day Returns'
  },
  {
    id: 'seller_sty',
    name: 'Southern Truck Yard',
    rating: 4.7,
    reviewCount: 305,
    location: 'Birmingham, AL',
    specialty: 'Rear Ends & Heavy Suspension',
    partCount: 1102,
    feedbackPercentage: 96,
    shipsWithin: '1 business day',
    returnPolicy: '30 Day Returns'
  },
  {
    id: 'seller_tpy',
    name: 'Twin Pines Import Yard',
    rating: 4.9,
    reviewCount: 189,
    location: 'Springfield, OR',
    specialty: 'Imports & Disc Brakes',
    partCount: 954,
    feedbackPercentage: 99,
    shipsWithin: '1 business day',
    returnPolicy: '30 Day Returns'
  },
  {
    id: 'seller_nfs',
    name: 'North Flow Salvage',
    rating: 4.8,
    reviewCount: 219,
    location: 'St. Paul, MN',
    specialty: 'Suspension & Performance Shocks',
    partCount: 1420,
    feedbackPercentage: 97,
    shipsWithin: '1 business day',
    returnPolicy: '30 Day Returns'
  }
];

// Helper to get helper icon keywords/links or generated graphics (we will draw inline/SVGs beautifully!)
export const MOCK_PARTS: Part[] = [
  {
    id: '1100428',
    trackingNumber: 'PP-08311972',
    title: '1987 Chevy C10 Alternator',
    subtitle: 'Chevy C10 1981-1987',
    system: 'Electrical System',
    category: 'Charging & Starting',
    partType: 'Alternator',
    oemPartNumber: '1100428',
    interchangePartNumbers: ['1100428', '10479917', '10463657'],
    voltage: '12V',
    amperage: '100A',
    pulleyType: 'V-Belt',
    connectorType: '3-Wire Plug',
    weight: '12.5 lbs',
    location: 'Engine Bay',
    condition: 'Good',
    price: 42.00,
    originalPrice: 65.00,
    mileage: 87450,
    fits: '5.0L, 5.7L Engines',
    description: 'This OEM alternator was carefully removed from a low-mileage 1987 Chevy C10. It has been inspected, tested, and verified to meet OEM specifications. The unit is in good condition with normal wear for its age and mileage. All mounting points are intact and the pulley spins smoothly.',
    notes: 'Tested. Works great. Pulley spins smoothly. Hand inspected by Bill at Yard 4.',
    images: ['alternator_front', 'alternator_back', 'alternator_side', 'alternator_plate'],
    sellerId: 'seller_ras',
    stockNumber: 'RAS-24-0515-042',
    dateRemoved: 'May 15, 2024',
    vinRemovedFrom: '1GCDC14H9HF123456',
    views: 342,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1981-1987', engine: '5.0L V8' },
      { make: 'Chevrolet', model: 'C20', years: '1981-1987', engine: '5.0L V8' },
      { make: 'GMC', model: 'C1500', years: '1981-1987', engine: '5.0L V8' },
      { make: 'Chevrolet', model: 'K10', years: '1981-1987', engine: '5.0L V8' },
      { make: 'GMC', model: 'K1500', years: '1981-1987', engine: '5.0L V8' },
      { make: 'Chevrolet', model: 'Blazer', years: '1981-1987', engine: '5.0L, 5.7L Engines' }
    ]
  },
  {
    id: '1100429',
    trackingNumber: 'PP-08412911',
    title: '1985 Chevy C10 Alternator',
    subtitle: 'Chevy C10 1981-1987',
    system: 'Electrical System',
    category: 'Charging & Starting',
    partType: 'Alternator',
    oemPartNumber: '1100428',
    interchangePartNumbers: ['1100428', '10479900'],
    voltage: '12V',
    amperage: '100A',
    pulleyType: 'V-Belt',
    connectorType: '3-Wire Plug',
    weight: '12.8 lbs',
    location: 'Engine Bay',
    condition: 'OEM Original',
    price: 48.50,
    originalPrice: 70.00,
    mileage: 112300,
    fits: '4.1L, 4.8L, 5.0L Engines',
    description: 'An authentic factory GM high-durability alternator removed from a 1985 Chevrolet C10. Built to last with original copper windings. Perfect for clean vintage OEM rebuilds requiring authentic part stamping.',
    notes: 'Staging tested, outputs a stable 14.1V under load.',
    images: ['alternator_front', 'alternator_side', 'alternator_plate'],
    sellerId: 'seller_bpc',
    stockNumber: 'BPC-85A-349',
    dateRemoved: 'April 20, 2024',
    vinRemovedFrom: '1GCDC14F5FF882345',
    views: 276,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1981-1987', engine: '4.8L I6' },
      { make: 'Chevrolet', model: 'C20', years: '1981-1987', engine: '5.0L V8' }
    ]
  },
  {
    id: '1100430',
    trackingNumber: 'PP-08513903',
    title: '1986 Chevy C10 Alternator',
    subtitle: 'Chevy C10 1981-1987',
    system: 'Electrical System',
    category: 'Charging & Starting',
    partType: 'Alternator',
    oemPartNumber: '1100428',
    interchangePartNumbers: ['1100428', '10479917'],
    voltage: '12V',
    amperage: '120A High Output',
    pulleyType: 'V-Belt',
    connectorType: '3-Wire Plug',
    weight: '12.4 lbs',
    location: 'Engine Bay',
    condition: 'Excellent',
    price: 55.00,
    originalPrice: 85.00,
    mileage: 65200,
    fits: '4.3L, 5.0L, 5.7L Engines',
    description: 'Stellar like-new condition alternator harvested from a clean, garage-kept 1986 C10 Scottsdale. Inspected and polished. Minimal oxidation on casing, pristine electrical contacts.',
    notes: 'Polished housing. Zero noise from front or rear bearings.',
    images: ['alternator_front', 'alternator_back', 'alternator_plate'],
    sellerId: 'seller_mas',
    stockNumber: 'MAS-alternator-982',
    dateRemoved: 'June 1, 2024',
    vinRemovedFrom: '2GCDC14G3GG112948',
    views: 412,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1981-1987', engine: '4.3L V6' },
      { make: 'Chevrolet', model: 'C10', years: '1981-1987', engine: '5.7L V8' }
    ]
  },
  {
    id: '1100431',
    trackingNumber: 'PP-08244192',
    title: '1982 Chevy C10 Alternator',
    subtitle: 'Chevy C10 1981-1987',
    system: 'Electrical System',
    category: 'Charging & Starting',
    partType: 'Alternator',
    oemPartNumber: '1100428',
    interchangePartNumbers: ['1100428'],
    voltage: '12V',
    amperage: '85A',
    pulleyType: 'V-Belt',
    connectorType: '3-Wire Plug',
    weight: '13.0 lbs',
    location: 'Engine Bay',
    condition: 'Used OEM',
    price: 35.00,
    originalPrice: 50.00,
    mileage: 145800,
    fits: '4.1L, 4.8L Engines',
    description: 'Tested and fully working core alternator. Perfect for daily drivers or anyone needing an affordable replacement for a project truck.',
    notes: 'Case has typical patina and road grime, but functions fully.',
    images: ['alternator_back', 'alternator_plate'],
    sellerId: 'seller_yip',
    stockNumber: 'OIP-ALT-82',
    dateRemoved: 'March 14, 2024',
    vinRemovedFrom: '1GCDC14H2FF225191',
    views: 198,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1981-1987', engine: '4.1L I6' }
    ]
  },
  {
    id: '1100432',
    trackingNumber: 'PP-08199244',
    title: '1981 Chevy C10 Alternator',
    subtitle: 'Chevy C10 1981-1987',
    system: 'Electrical System',
    category: 'Charging & Starting',
    partType: 'Alternator',
    oemPartNumber: '1100428',
    interchangePartNumbers: ['1100428'],
    voltage: '12V',
    amperage: '85A',
    pulleyType: 'V-Belt',
    connectorType: '3-Wire',
    weight: '12.5 lbs',
    location: 'Engine Bay',
    condition: 'For Parts',
    price: 20.00,
    originalPrice: 40.00,
    mileage: 'Unknown',
    fits: '4.1L, 4.8L Engines',
    description: 'An original 1981 alternator core. Sold strictly as-is for rebuild parts, salvage copper windings, or internal diode trio components.',
    notes: 'Does not charge. Spinning the pulley has a minor squeak. Needs new bearings & brushes.',
    images: ['alternator_front', 'alternator_plate'],
    sellerId: 'seller_sty',
    stockNumber: 'STY-ALT-81-CORE',
    dateRemoved: 'January 28, 2024',
    vinRemovedFrom: '1GCDC14H0FF103450',
    views: 305,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1981-1987', engine: '4.1L' }
    ]
  },
  {
    id: 'th400-trans',
    trackingNumber: 'PP-88220911',
    title: 'TH400 Automatic Transmission',
    subtitle: 'GM TH400 1968-1990',
    system: 'Powertrain',
    category: 'Transmission System',
    partType: 'Transmission',
    oemPartNumber: '24200423',
    interchangePartNumbers: ['TH400', 'M40', '3-Speed'],
    weight: '135 lbs',
    location: 'Underbody',
    condition: 'OEM Original',
    price: 325.00,
    originalPrice: 450.00,
    mileage: 112300,
    fits: 'Fits GM Chevy C10, C20, GMC Suburban',
    description: 'Highly sought stout 3-speed heavy-duty Turbo Hydra-Matic 400 transmission. Pulled from a clean, running 1983 suburban. Includes torque converter. Fluid looked red and clean upon draining. Shifts through all gears smoothly.',
    notes: 'Includes original bellhousing casing and stock torque converter. Shipping via freight or local pickup.',
    images: ['transmission_front', 'transmission_side'],
    sellerId: 'seller_bpc',
    stockNumber: 'BPC-TH400-083',
    dateRemoved: 'May 22, 2024',
    vinRemovedFrom: '1GDBC24X9DF112942',
    views: 480,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1970-1987', engine: '5.7L V8' },
      { make: 'Chevrolet', model: 'Suburban', years: '1973-1990', engine: '5.7L, 7.4L V8' },
      { make: 'GMC', model: 'C1500', years: '1975-1987', engine: '5.7L V8' }
    ]
  },
  {
    id: 'holley-4160',
    trackingNumber: 'PP-41603522',
    title: 'Holley 4160 Carburetor',
    subtitle: 'List 4160 600 CFM',
    system: 'Powertrain',
    category: 'Engine System',
    partType: 'Carburetor',
    oemPartNumber: '0-1849',
    interchangePartNumbers: ['4160', '80457S'],
    weight: '8.5 lbs',
    location: 'Top Engine intake',
    condition: 'Good',
    price: 175.00,
    originalPrice: 245.00,
    mileage: 'Tested OK',
    fits: 'Universal GM/Ford V8 Intake Manifolds',
    description: 'Classic Holley 4160 4-Barrel Carburetor. Vacuum secondaries, manual choke. Removed from a functional small block Chevy. Hand-cleaned and inspected. Rebuild recommended for peak racing performance, but ran well as pulled.',
    notes: 'Linkages are springy, float bowls are clear of varnished fuel.',
    images: ['carburetor_front', 'carburetor_top'],
    sellerId: 'seller_yip',
    stockNumber: 'OIP-H4160-592',
    dateRemoved: 'February 10, 2024',
    vinRemovedFrom: 'N/A Custom Build',
    views: 186,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1968-1987', engine: '5.7L, 5.0L V8' },
      { make: 'Ford', model: 'F-150', years: '1973-1985', engine: '5.0L, 5.8L V8' }
    ]
  },
  {
    id: 'f150-door',
    trackingNumber: 'PP-79150024',
    title: 'Driver Side Front Door Shell',
    subtitle: 'Ford F-150 1979-1986',
    system: 'Body & Exterior',
    category: 'Doors & Glass',
    partType: 'Door Shell',
    oemPartNumber: 'F0TZ-1520123-A',
    interchangePartNumbers: ['F150DOOR', 'BRONCO-DOOR'],
    weight: '45 lbs',
    location: 'Exterior Body',
    condition: 'Excellent',
    price: 150.00,
    originalPrice: 220.00,
    mileage: 65200,
    fits: '1979-1986 Ford F-150, F-250, Bronco',
    description: 'Pristine, completely rust-free driver side door shell sourced from a dry Arizona 1984 Ford F-150. Factory paint has typical light clear coat fading but the sheet metal is laser straight. No prior bondo or filler.',
    notes: 'Pruned of door trim card, includes manual regulator block.',
    images: ['door_front', 'door_inner'],
    sellerId: 'seller_mas',
    stockNumber: 'MAS-FD79-092',
    dateRemoved: 'January 12, 2024',
    vinRemovedFrom: '1FTEF14G8EE114948',
    views: 412,
    compatibility: [
      { make: 'Ford', model: 'F-150', years: '1979-1986', engine: 'All Engines' },
      { make: 'Ford', model: 'Bronco', years: '1980-1986', engine: 'All Engines' }
    ]
  },
  {
    id: 'ford9-rearend',
    trackingNumber: 'PP-90031976',
    title: 'Ford 9-Inch Heavy Duty Rear End Housing',
    subtitle: '31 Spline 1970-1996',
    system: 'Powertrain',
    category: 'Drivetrain',
    partType: 'Rear Axle Housing',
    oemPartNumber: 'F9-31S-78',
    interchangePartNumbers: ['FORD9', '9INCH'],
    weight: '160 lbs',
    location: 'Rear Drivetrain',
    condition: 'Used OEM',
    price: 275.00,
    originalPrice: 380.00,
    mileage: 145800,
    fits: 'Ford Trucks and Custom Restomods',
    description: 'Legendary Ford 9" robust rear end axle housing. 31-spline axle shafts included. Sourced from a solid 1978 F-150. Spring pads and brake mounting brackets are intact. Perfect core for a bulletproof drag race or offroad axle build.',
    notes: 'Includes axle shafts, housing, third-member studs. Third member differential sold separately.',
    images: ['rearend_front', 'rearend_tag'],
    sellerId: 'seller_sty',
    stockNumber: 'STY-F9-31',
    dateRemoved: 'September 12, 2024',
    vinRemovedFrom: '1FTEF14Y5EE9924823',
    views: 1102,
    compatibility: [
      { make: 'Ford', model: 'F-150', years: '1970-1983', engine: 'All Engines' },
      { make: 'Chevrolet', model: 'C10 (Custom-fit)', years: '1970-1987', engine: 'V8' }
    ]
  },
  {
    id: 'brembo-caliper-red',
    trackingNumber: 'PP-09881122',
    title: 'Brembo Front Red 4-Piston Brake Caliper Set',
    subtitle: 'High Performance Disc Brakes',
    system: 'Brake System',
    category: 'Brake Components',
    partType: 'Brake Caliper',
    oemPartNumber: 'B-REMB-RD-01',
    interchangePartNumbers: ['BREM-RD', 'WRX-CALIPER'],
    weight: '14.2 lbs',
    location: 'Front Brake Hub',
    condition: 'Excellent',
    price: 189.00,
    originalPrice: 280.00,
    mileage: 42300,
    fits: 'Subaru Impreza WRX STI, Mitsubishi Lancer Evo',
    description: 'Pair of premium red Brembo 4-piston front calipers. Sourced from a well-kept 2015 WRX STI. Seals have been checked, pressure tested to ensure zero leaks, and cosmetic finish is outstanding with minimal brake dust stains.',
    notes: 'Includes pins and retaining clips. Pads not included.',
    images: ['caliper_front'],
    sellerId: 'seller_tpy',
    stockNumber: 'TPY-WRX-BREMB-021',
    dateRemoved: 'April 10, 2024',
    vinRemovedFrom: 'JF1VA1K36FU102948',
    views: 520,
    compatibility: [
      { make: 'Subaru', model: 'WRX STI', years: '2011-2018', engine: '2.5L Turbo' },
      { make: 'Mitsubishi', model: 'Lancer Evolution', years: '2008-2015', engine: '2.0L Turbo' }
    ]
  },
  {
    id: 'eibach-springs-sports',
    trackingNumber: 'PP-18324419',
    title: 'Eibach Pro-Kit Lowering Springs Set',
    subtitle: 'Performance Suspension Springs',
    system: 'Suspension & Steering',
    category: 'Front Suspension',
    partType: 'Suspension Springs',
    oemPartNumber: 'E10-35-023-01-22',
    interchangePartNumbers: ['PRO-KIT-MUST', 'EIBACH-MUSTANG'],
    weight: '22.0 lbs',
    location: 'Suspension Corners',
    condition: 'Good',
    price: 210.00,
    originalPrice: 320.00,
    mileage: 23100,
    fits: '2015-2022 Ford Mustang GT S550',
    description: 'Set of four genuine Eibach Pro-Kit progressive performance lowering springs. Drops vehicle front by approx 1.1 inches and rear by 1.0 inches. Optimizes handling dynamics and aesthetics without sacrificing ride quality.',
    notes: 'Slight paint flakes on bottom coils where they touch the spring perch, otherwise perfect tension.',
    images: ['springs_set'],
    sellerId: 'seller_nfs',
    stockNumber: 'NFS-EIB-S550-938',
    dateRemoved: 'March 2, 2024',
    vinRemovedFrom: '1FA6P8CF3G5110294',
    views: 312,
    compatibility: [
      { make: 'Ford', model: 'Mustang GT', years: '2015-2022', engine: '5.0L V8' },
      { make: 'Ford', model: 'Mustang EcoBoost', years: '2015-2022', engine: '2.3L Turbo' }
    ]
  },
  {
    id: 'wilwood-disc-rotors',
    trackingNumber: 'PP-29112948',
    title: 'Wilwood Spec-37 Slotted Brake Rotors',
    subtitle: 'High Contrast Directional Rotors',
    system: 'Brake System',
    category: 'Brake Components',
    partType: 'Brake Rotors',
    oemPartNumber: '160-8402',
    interchangePartNumbers: ['WIL-ROT-37', 'VETTE-ROTORS'],
    weight: '16.5 lbs',
    location: 'Brake Corner System',
    condition: 'Excellent',
    price: 145.00,
    originalPrice: 210.00,
    mileage: 12000,
    fits: 'Chevrolet Corvette C6 Z06, Grand Sport',
    description: 'Left and right pair of Wilwood directional slotted iron brake rotors. Optimized for high heat dissipation and uniform pad swipe. Thickness measured and is well within factory spec limits. Minor surface oxidation purely cosmetic from sitting in the yard dry.',
    notes: 'Ready for plug-and-play installation with Corvette hubs.',
    images: ['rotor_left_right'],
    sellerId: 'seller_tpy',
    stockNumber: 'TPY-CORV-WIL-382',
    dateRemoved: 'April 14, 2024',
    vinRemovedFrom: '1G1YY26E975193910',
    views: 290,
    compatibility: [
      { make: 'Chevrolet', model: 'Corvette Z06', years: '2006-2013', engine: '7.0L V8' },
      { make: 'Chevrolet', model: 'Corvette Grand Sport', years: '2010-2013', engine: '6.2L V8' }
    ]
  },
  {
    id: 'bilstein-b6-strut',
    trackingNumber: 'PP-99221144',
    title: 'Bilstein B6 Performance Front Strut Pair',
    subtitle: 'Monotube Dampers for Heavy Stability',
    system: 'Suspension & Steering',
    category: 'Front Suspension',
    partType: 'Struts',
    oemPartNumber: '24-100529',
    interchangePartNumbers: ['BIL-B6-BMW', 'B6-DAMP-01'],
    weight: '15.0 lbs',
    location: 'Front Axle Shocks',
    condition: 'OEM Original',
    price: 125.00,
    originalPrice: 195.00,
    mileage: 34100,
    fits: 'BMW E90/E92 3-Series (328i, 335i)',
    description: 'Pair of heavy monotube gas-pressure Bilstein B6 dampers. Excellent upgrade over stock components for active tracking or performance driving. Rebound dampening is extremely tight without any signs of fluid leaks around shaft seals.',
    notes: 'Hand tested, rebound feels firm and steady.',
    images: ['struts_blue_yellow'],
    sellerId: 'seller_nfs',
    stockNumber: 'NFS-BIL-335-029',
    dateRemoved: 'May 3, 2024',
    vinRemovedFrom: 'WBAWB7C54AC118593',
    views: 184,
    compatibility: [
      { make: 'BMW', model: '335i', years: '2007-2011', engine: '3.0L Turbo' },
      { make: 'BMW', model: '328i', years: '2006-2011', engine: '3.0L Inline-6' }
    ]
  },
  {
    id: 'custom-steering-wheel',
    trackingNumber: 'PP-00331980',
    title: 'Vintage Mahogany Woodgrain Steering Wheel',
    subtitle: 'Classic 3-Spoke Chrome Riveted Rim',
    system: 'Suspension & Steering',
    category: 'Steering',
    partType: 'Steering Wheel',
    oemPartNumber: 'M-103-W',
    interchangePartNumbers: ['WOOD-WHEEL', 'MOMO-VINT-01'],
    weight: '4.8 lbs',
    location: 'Interior Dashboard Cabin',
    condition: 'Excellent',
    price: 95.00,
    originalPrice: 140.00,
    mileage: 'Yard Recovered',
    fits: 'GM, Ford Classic Passenger Cars & C10 Trucks',
    description: 'Timeless mahogany woodgrain polished steering wheel with beautiful chrome spokes and distinct rim rivets. Sourced from a collector restomod Chevrolet project. Mahogany wood finish is polished to a glass mirror reflection, chrome steel has zero pits or corrosion.',
    notes: 'Includes horn button assembly and standard 9-bolt mounting patterns adapter block.',
    images: ['steering_wheel_classic'],
    sellerId: 'seller_ras',
    stockNumber: 'RAS-WOOD-391',
    dateRemoved: 'June 5, 2024',
    vinRemovedFrom: '1GCDC14H9HF123992',
    views: 654,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1967-1987', engine: 'All Engines' },
      { make: 'Ford', model: 'F-100', years: '1968-1979', engine: 'All Engines' }
    ]
  },
  {
    id: 'edelbrock-manifold',
    trackingNumber: 'PP-18399124',
    title: 'Edelbrock Performer EPS Intake Manifold',
    subtitle: 'Dual-Plane SBC Aluminum Manifold',
    system: 'Powertrain',
    category: 'Engine System',
    partType: 'Intake Manifold',
    oemPartNumber: 'EDEL-2701',
    interchangePartNumbers: ['2701', 'SBC-MANIFOLD'],
    weight: '11.5 lbs',
    location: 'Engine Block Top Intake',
    condition: 'Excellent',
    price: 240.00,
    originalPrice: 310.00,
    mileage: 18200,
    fits: 'Chevy Small Block 262-400ci V8 Engines',
    description: 'Edelbrock aluminum performance dual-plane intake manifold. Engineered specifically for small block Chevy. Increases horsepower/torque through powerband range. No stripped thread holes, gasket surface sits completely flat.',
    notes: 'Polished finish looks highly detailed. Ready to support 4-barrel carbs.',
    images: ['intake_manifold_concept'],
    sellerId: 'seller_yip',
    stockNumber: 'OIP-EDEL-SBC-092',
    dateRemoved: 'February 22, 2024',
    vinRemovedFrom: 'N/A Hot Rod Build',
    views: 419,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1967-1987', engine: '5.0L, 5.7L V8' },
      { make: 'GMC', model: 'C1500', years: '1970-1987', engine: '5.7L V8' }
    ]
  },
  {
    id: 'msd-ignition-box',
    trackingNumber: 'PP-38411029',
    title: 'MSD 6AL Ignition Control Box',
    subtitle: 'Red Multiple Spark Discharge Unit',
    system: 'Electrical System',
    category: 'Electronics',
    partType: 'Ignition Box',
    oemPartNumber: 'MSD-6425',
    interchangePartNumbers: ['6425', 'MSD-6A'],
    weight: '5.2 lbs',
    location: 'Engine Bay Firewall',
    condition: 'Good',
    price: 199.00,
    originalPrice: 289.00,
    mileage: 39500,
    fits: 'Universal 4, 6, 8-Cylinder Engines',
    description: 'Original iconic red MSD 6AL heavy-duty ignition controller box. Delivers multiple sparks up to 3000 RPM. Complete with active rev-limiter dials. Sealed rubber wiring harness is included for instant wiring. Bench-tested and working 100%.',
    notes: 'Standard red finish has light scuffs but runs perfectly.',
    images: ['msd_box_red'],
    sellerId: 'seller_ras',
    stockNumber: 'RAS-6AL-MSD-938',
    dateRemoved: 'January 10, 2024',
    vinRemovedFrom: '1GCDC14H9HF994821',
    views: 442,
    compatibility: [
      { make: 'Chevrolet', model: 'C10', years: '1970-1987', engine: 'V8' },
      { make: 'Ford', model: 'F-150', years: '1973-1989', engine: 'V8' }
    ]
  }
];

// Core Systems with OEM-authentic branding & metadata
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

// ==========================================
// SUPABASE AUTH MOCK CONTROLLER
// ==========================================
export const supabaseMock = {
  getUser: (): UserSession | null => {
    try {
      const saved = localStorage.getItem('parts_peddle_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  signIn: (email: string, password?: string): { error: string | null; session: UserSession | null } => {
    if (!email.includes('@')) {
      return { error: 'Invalid email address', session: null };
    }
    const session: UserSession = {
      email,
      jwt: 'mock-sb-jwt-token-123',
      aud: 'authenticated',
      role: 'authenticated'
    };
    localStorage.setItem('parts_peddle_user', JSON.stringify(session));
    return { error: null, session };
  },

  signUp: (email: string, password?: string): { error: string | null; session: UserSession | null } => {
    if (!email.includes('@')) {
      return { error: 'Please enter a valid email address', session: null };
    }
    const session: UserSession = {
      email,
      jwt: 'mock-sb-jwt-token-created',
      aud: 'authenticated',
      role: 'authenticated'
    };
    localStorage.setItem('parts_peddle_user', JSON.stringify(session));
    return { error: null, session };
  },

  signOut: () => {
    localStorage.removeItem('parts_peddle_user');
  }
};

// ==========================================
// ALGOLIA SEARCH MOCK ENGINE
// ==========================================
export const algoliaMock = {
  search: (filters: SearchFilters): Part[] => {
    let results = [...MOCK_PARTS];

    // Typo tolerant search
    if (filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      results = results.filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.oemPartNumber.toLowerCase().includes(q) ||
          p.trackingNumber.toLowerCase().includes(q) ||
          p.partType.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.system.toLowerCase().includes(q) ||
          p.fits.toLowerCase().includes(q)
        );
      });
    }

    // System Filter
    if (filters.system && filters.system !== 'All Parts' && filters.system !== 'All Systems') {
      results = results.filter(
        (p) => p.system.toLowerCase() === filters.system.toLowerCase()
      );
    }

    // Category Filter
    if (filters.category && filters.category !== 'All Parts' && filters.category !== 'All Categories') {
      results = results.filter(
        (p) => p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Part Types Checkbox Filter
    if (filters.partTypes.length > 0) {
      results = results.filter((p) => filters.partTypes.includes(p.partType));
    }

    // Price Range Filter
    results = results.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Conditions Filter
    if (filters.conditions.length > 0) {
      results = results.filter((p) => filters.conditions.includes(p.condition));
    }

    // Seller selection Filter
    if (filters.sellerType === 'trusted') {
      // Rusty Acres, Midwest and Backroad are defined as trusted sellers
      const trustedIds = ['seller_ras', 'seller_mas', 'seller_bpc'];
      results = results.filter((p) => trustedIds.includes(p.sellerId));
    }

    // Featured filter
    if (filters.featured) {
      results = results.filter((p) => p.featured === true);
    }

    // Vehicle Fitment Make Filter
    if (filters.fitmentMake && filters.fitmentMake !== 'All Makes') {
      results = results.filter((p) => {
        return p.compatibility?.some(
          (c) => c.make.toLowerCase() === (filters.fitmentMake as string).toLowerCase()
        );
      });
    }

    // Vehicle Fitment Model Filter
    if (filters.fitmentModel && filters.fitmentModel !== 'All Models') {
      results = results.filter((p) => {
        return p.compatibility?.some(
          (c) => c.model.toLowerCase() === (filters.fitmentModel as string).toLowerCase()
        );
      });
    }

    // Vehicle Fitment Year Filter
    if (filters.fitmentYear && filters.fitmentYear !== 'All Years') {
      results = results.filter((p) => {
        return p.compatibility?.some((c) => {
          if (!c.years) return false;
          const match = c.years.match(/(\d{4})-(\d{4})/);
          if (match) {
            const start = parseInt(match[1]);
            const end = parseInt(match[2]);
            const target = parseInt(filters.fitmentYear as string);
            return target >= start && target <= end;
          }
          return c.years.includes(filters.fitmentYear as string);
        });
      });
    }

    // Vehicle Fitment Engine Filter
    if (filters.fitmentEngine && filters.fitmentEngine !== 'All Engines') {
      results = results.filter((p) => {
        return p.compatibility?.some(
          (c) => c.engine?.toLowerCase().includes((filters.fitmentEngine as string).toLowerCase())
        );
      });
    }

    return results;
  },

  // Autocomplete Suggestions
  getSuggestions: (query: string): string[] => {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    const suggestionsSet = new Set<string>();

    MOCK_PARTS.forEach((p) => {
      if (p.title.toLowerCase().includes(q)) suggestionsSet.add(p.title);
      if (p.partType.toLowerCase().includes(q)) suggestionsSet.add(p.partType);
      if (p.oemPartNumber.toLowerCase().includes(q)) suggestionsSet.add(`OEM Part ${p.oemPartNumber}`);
    });

    return Array.from(suggestionsSet).slice(0, 5);
  }
};

// ==========================================
// SHOPPING CART CONTROLLER
// ==========================================
export const cartMock = {
  getCart: (): CartItem[] => {
    try {
      const saved = localStorage.getItem('parts_peddle_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  setCart: (items: CartItem[]): void => {
    localStorage.setItem('parts_peddle_cart', JSON.stringify(items));
  },

  addToCart: (part: Part): CartItem[] => {
    const cart = cartMock.getCart();
    const existingIndex = cart.findIndex((item) => item.part.id === part.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ part, quantity: 1 });
    }
    cartMock.setCart(cart);
    return cart;
  },

  removeFromCart: (partId: string): CartItem[] => {
    let cart = cartMock.getCart();
    cart = cart.filter((item) => item.part.id !== partId);
    cartMock.setCart(cart);
    return cart;
  },

  clearCart: (): void => {
    localStorage.removeItem('parts_peddle_cart');
  }
};

// ==========================================
// MAKE OFFER / NEGOTIATIONS MOCK API
// ==========================================
export const offersMock = {
  getOffers: (): Offer[] => {
    try {
      const saved = localStorage.getItem('parts_peddle_offers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  saveOffer: (offer: Offer): void => {
    const offers = offersMock.getOffers();
    offers.push(offer);
    localStorage.setItem('parts_peddle_offers', JSON.stringify(offers));
  },

  makeOffer: async (
    partId: string,
    price: number,
    message: string
  ): Promise<Offer> => {
    const part = MOCK_PARTS.find((p) => p.id === partId);
    const seller = MOCK_SELLERS.find((s) => s.id === part?.sellerId);
    
    const newOffer: Offer = {
      id: 'offer_' + Math.random().toString(36).substring(2, 9),
      partId,
      offeredPrice: price,
      message,
      status: 'Pending',
      timestamp: new Date().toLocaleTimeString()
    };

    offersMock.saveOffer(newOffer);

    // Simulate 1.5s API wait for mechanic seller reply
    return new Promise((resolve) => {
      setTimeout(() => {
        const offers = offersMock.getOffers();
        const found = offers.find((o) => o.id === newOffer.id);
        if (found && part) {
          const ratio = price / part.price;
          
          if (ratio >= 0.9) {
            found.status = 'Accepted';
            found.replyMessage = `Deal! That's a reasonable offer for this ${part.partType}. Sells for higher elsewhere but I've got a busy yard today. Packaged and ready to ship out of ${seller?.location}.`;
          } else if (ratio >= 0.75) {
            found.status = 'Counter-Offer';
            const counter = Math.round(part.price * 0.85);
            found.counterPrice = counter;
            found.replyMessage = `Hey builder, $${price} is a bit low for this clean tested unit. How about we split the difference at $${counter}? Certified OEM Original, spins smoothly. Let me know!`;
          } else {
            found.status = 'Declined';
            found.replyMessage = `Sorry buddy, can't let this go for $${price}. It's hand-inspected OEM stock, carefully catalogued. Already priced competitively for ${seller?.name}. Let me know if you can reach a bit closer to the asking price!`;
          }

          // Update storage
          const idx = offers.findIndex((o) => o.id === newOffer.id);
          offers[idx] = found;
          localStorage.setItem('parts_peddle_offers', JSON.stringify(offers));
          resolve(found);
        } else {
          resolve(newOffer);
        }
      }, 1500);
    });
  }
};

// ==========================================
// GUIDED TOUR DATA
// ==========================================
export const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: "Search & Discover Autoparts",
    description: "Type a part name, OEM number, make, or dynamic VIN code right in our search bar. Autocomplete returns instant matching specs from Algolia.",
    elementId: "tour-search"
  },
  {
    step: 2,
    title: "Browse by Handpicked Categories",
    description: "Mechanics and restorers can filter instantly by heavy engines, transmissions, steering, or suspension blocks to source exact matches.",
    elementId: "tour-categories"
  },
  {
    step: 3,
    title: "Examine Detailed Fitment Maps",
    description: "Every individual part listing showcases its exact vehicle extraction history, mileage, actual photos, and a custom metal authentication tag.",
    elementId: "tour-part-view"
  },
  {
    step: 4,
    title: "Trust & Quality Badges",
    description: "We work strictly with vetted, high-rating salvage yards. See seller specialty tags, star ratings, and certified condition checks.",
    elementId: "tour-trust"
  },
  {
    step: 5,
    title: "Negotiate / Buy Outright",
    description: "Place items directly in your cart, or hit 'Make Offer' to negotiate a project-friendly build budget directly with the yard owner!",
    elementId: "tour-cta"
  }
];
