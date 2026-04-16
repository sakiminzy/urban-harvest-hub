function createArtwork(title, accent, subtitle) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#11342c" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" rx="44" fill="url(#bg)" />
      <circle cx="640" cy="130" r="92" fill="rgba(255,255,255,0.14)" />
      <circle cx="162" cy="390" r="124" fill="rgba(255,255,255,0.1)" />
      <text x="70" y="215" fill="#f8f4ea" font-size="54" font-family="Verdana, sans-serif" font-weight="700">
        ${title}
      </text>
      <text x="70" y="280" fill="#f8f4ea" font-size="28" font-family="Verdana, sans-serif">
        ${subtitle}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const categories = [
  {
    id: 'food',
    label: 'Food',
    summary: 'Harvest smarter with kits, classes, and swaps that reduce food waste.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    summary: 'Practical tools and events that make low-impact city living easier.',
  },
  {
    id: 'education',
    label: 'Education',
    summary: 'Community learning sessions that build confidence in sustainable habits.',
  },
];

export const seedItems = [
  {
    id: 'microgreens-kit',
    name: 'Balcony Microgreens Starter Kit',
    kind: 'product',
    category: 'food',
    description:
      'Grow nutrient-rich greens in compact apartments with reusable trays, coco coir, and seasonal seed packs.',
    longDescription:
      'This starter kit helps city residents harvest fresh microgreens in under two weeks. It includes a compact watering guide, refillable seed envelopes, and a QR code linking to zero-waste growing tips.',
    availability: 'In stock',
    price: '$29',
    audience: 'Apartment gardeners',
    schedule: 'Ships within 2 business days',
    location: 'Carlton community pickup point',
    latitude: -37.8006,
    longitude: 144.9652,
    accent: '#c96c31',
    featured: 1,
    image: createArtwork('Microgreens Kit', '#c96c31', 'Fresh harvests for small homes'),
  },
  {
    id: 'compost-lab',
    name: 'Neighbourhood Compost Lab',
    kind: 'workshop',
    category: 'education',
    description:
      'A hands-on workshop covering bokashi bins, worm farms, and odour-free composting for renters.',
    longDescription:
      'Participants test small-space compost systems, compare input materials, and leave with a compost starter checklist. The session is beginner-friendly and designed for households with limited outdoor space.',
    availability: '12 seats left',
    price: '$18',
    audience: 'Beginners and families',
    schedule: 'Saturday, 10:00 AM',
    location: 'Brunswick sustainability lab',
    latitude: -37.7708,
    longitude: 144.9613,
    accent: '#708d3d',
    featured: 0,
    image: createArtwork('Compost Lab', '#708d3d', 'Make waste part of the cycle'),
  },
  {
    id: 'repair-cafe',
    name: 'Circular Living Repair Cafe',
    kind: 'event',
    category: 'lifestyle',
    description:
      'Bring household items, mend them with volunteer fixers, and learn simple repair skills on the spot.',
    longDescription:
      'This drop-in community event keeps everyday goods in use for longer. Visitors can bring clothing, lamps, bikes, and kitchenware while learning practical repair and care habits from local makers.',
    availability: 'Open registration',
    price: 'Free',
    audience: 'All ages',
    schedule: 'Sunday, 1:00 PM to 4:00 PM',
    location: 'Fitzroy makers pavilion',
    latitude: -37.7984,
    longitude: 144.9787,
    accent: '#376c86',
    featured: 1,
    image: createArtwork('Repair Cafe', '#376c86', 'Fix, share, and extend product life'),
  },
  {
    id: 'preserve-pantry',
    name: 'Preserve Pantry Workshop',
    kind: 'workshop',
    category: 'food',
    description:
      'Learn pickling, low-waste storage, and urban pantry planning using local produce and reusable jars.',
    longDescription:
      'The workshop focuses on seasonal abundance and food preservation habits that reduce waste and stretch household budgets. Each attendee prepares two pantry staples and receives an ingredient sourcing guide.',
    availability: '6 seats left',
    price: '$24',
    audience: 'Home cooks',
    schedule: 'Wednesday, 6:30 PM',
    location: 'Southbank kitchen classroom',
    latitude: -37.825,
    longitude: 144.966,
    accent: '#ab5f44',
    featured: 0,
    image: createArtwork('Preserve Pantry', '#ab5f44', 'Stretch local harvests further'),
  },
  {
    id: 'solar-lantern',
    name: 'Solar Lantern Bundle',
    kind: 'product',
    category: 'lifestyle',
    description:
      'Portable solar-powered lanterns for balconies, emergency kits, and low-energy evening lighting.',
    longDescription:
      'This two-lantern bundle charges in daylight and offers multiple light modes for outdoor dining, gardening, or backup use during outages. The casing uses recycled plastic and replaceable batteries.',
    availability: 'Limited stock',
    price: '$42',
    audience: 'Households and community groups',
    schedule: 'Pickup and local delivery available',
    location: 'Docklands eco store',
    latitude: -37.8141,
    longitude: 144.9448,
    accent: '#ae8b2f',
    featured: 0,
    image: createArtwork('Solar Lanterns', '#ae8b2f', 'Low-energy light for shared spaces'),
  },
  {
    id: 'seed-swap',
    name: 'Community Seed Swap',
    kind: 'event',
    category: 'education',
    description:
      'Exchange regionally suited seeds, hear short talks from growers, and map out planting ideas for the season.',
    longDescription:
      'Gardeners of all experience levels can swap saved seeds, collect planting calendars, and join mini talks on biodiversity, pollinator support, and resilient urban growing. New growers receive starter packets.',
    availability: 'Registration open',
    price: '$8',
    audience: 'Garden clubs and new growers',
    schedule: 'Next Friday, 5:30 PM',
    location: 'Northcote garden commons',
    latitude: -37.7692,
    longitude: 144.9987,
    accent: '#5c7f62',
    featured: 1,
    image: createArtwork('Seed Swap', '#5c7f62', 'Grow local, share abundance'),
  },
];
