function createArtwork(title, accent, subtitle) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#14342b" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" rx="40" fill="url(#bg)" />
      <circle cx="640" cy="130" r="90" fill="rgba(255,255,255,0.16)" />
      <circle cx="170" cy="390" r="120" fill="rgba(255,255,255,0.10)" />
      <text x="70" y="220" fill="#f4efe6" font-size="54" font-family="Verdana, sans-serif" font-weight="700">
        ${title}
      </text>
      <text x="70" y="285" fill="#f4efe6" font-size="28" font-family="Verdana, sans-serif">
        ${subtitle}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const categories = [
  { id: 'food', label: 'Food' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'education', label: 'Education' },
];

export const items = [
  {
    id: 'microgreens-kit',
    slug: 'microgreens-kit',
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
    accent: '#c96c31',
    image: createArtwork('Microgreens Kit', '#c96c31', 'Fresh harvests for small homes'),
  },
  {
    id: 'compost-lab',
    slug: 'compost-lab',
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
    accent: '#708d3d',
    image: createArtwork('Compost Lab', '#708d3d', 'Make waste part of the cycle'),
  },
  {
    id: 'repair-cafe',
    slug: 'repair-cafe',
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
    accent: '#376c86',
    image: createArtwork('Repair Cafe', '#376c86', 'Fix, share, and extend product life'),
  },
  {
    id: 'preserve-pantry',
    slug: 'preserve-pantry',
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
    accent: '#ab5f44',
    image: createArtwork('Preserve Pantry', '#ab5f44', 'Stretch local harvests further'),
  },
  {
    id: 'solar-lantern',
    slug: 'solar-lantern',
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
    accent: '#ae8b2f',
    image: createArtwork('Solar Lanterns', '#ae8b2f', 'Low-energy light for shared spaces'),
  },
  {
    id: 'seed-swap',
    slug: 'seed-swap',
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
    accent: '#5c7f62',
    image: createArtwork('Seed Swap', '#5c7f62', 'Grow local, share abundance'),
  },
];

export function getItemById(id) {
  return items.find((item) => item.id === id);
}
