import { StylePreset, ContentSample } from '../types';

// Helper SVG generator for standalone style presets
function createSvgDataUrl(width: number, height: number, svgContent: string): string {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${svgContent}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'starry-night',
    name: 'Starry Night',
    artist: 'Vincent van Gogh',
    period: 'Post-Impressionism (1889)',
    description: 'Swirling impasto brushstrokes, deep ultramarine blues, vibrant chrome yellows, and energetic organic whorls.',
    thumbnail: createSvgDataUrl(300, 200, `
      <rect width="300" height="200" fill="#0f172a"/>
      <path d="M 0 140 Q 75 100 150 140 T 300 140 L 300 200 L 0 200 Z" fill="#1e293b"/>
      <circle cx="230" cy="50" r="28" fill="#fef08a" opacity="0.9"/>
      <circle cx="230" cy="50" r="40" stroke="#fde047" stroke-width="3" fill="none" opacity="0.6"/>
      <path d="M 10 60 Q 60 20 120 70 Q 180 120 250 40" stroke="#38bdf8" stroke-width="8" fill="none" stroke-dasharray="12 6"/>
      <path d="M 30 90 Q 90 40 160 100 Q 220 150 280 80" stroke="#818cf8" stroke-width="6" fill="none" stroke-dasharray="10 5"/>
      <path d="M 40 180 C 30 110 50 80 40 40 C 60 70 70 120 80 180 Z" fill="#0284c7"/>
    `),
    samplePrompt: 'Swirling impasto oil painting with vibrant yellow stars, deep blue cosmos, and expressive rhythmic brushstrokes in Van Gogh style',
    contentWeightDefault: 10,
    styleWeightDefault: 1000,
    recommendedLayers: ['Conv1_1', 'Conv2_1', 'Conv3_1', 'Conv4_1'],
  },
  {
    id: 'great-wave',
    name: 'The Great Wave',
    artist: 'Katsushika Hokusai',
    period: 'Japanese Ukiyo-e Woodblock (1831)',
    description: 'Prussian blue waves with crisp claw-like foam crests, elegant flat color blocks, and bold graphic outlines.',
    thumbnail: createSvgDataUrl(300, 200, `
      <rect width="300" height="200" fill="#fef3c7"/>
      <path d="M 0 200 Q 80 80 160 120 C 220 150 260 90 300 60 L 300 200 Z" fill="#1e3a8a"/>
      <path d="M 0 160 Q 70 40 140 100 C 190 140 230 70 280 30" stroke="#38bdf8" stroke-width="12" fill="none"/>
      <path d="M 120 90 Q 135 60 145 75 Q 155 50 165 70" stroke="#ffffff" stroke-width="5" fill="none"/>
      <polygon points="180,180 200,140 220,180" fill="#b91c1c"/>
    `),
    samplePrompt: 'Ukiyo-e Japanese woodblock print with Prussian blue sea waves, crisp white foam crests, and bold graphic silhouettes',
    contentWeightDefault: 20,
    styleWeightDefault: 800,
    recommendedLayers: ['Conv1_1', 'Conv2_1', 'Conv3_1'],
  },
  {
    id: 'water-lilies',
    name: 'Water Lilies',
    artist: 'Claude Monet',
    period: 'Impressionism (1919)',
    description: 'Soft dappled reflections of light, ethereal pastel lilacs, emerald greens, and diffused fluid water textures.',
    thumbnail: createSvgDataUrl(300, 200, `
      <rect width="300" height="200" fill="#065f46"/>
      <ellipse cx="80" cy="120" rx="45" ry="15" fill="#10b981" opacity="0.8"/>
      <ellipse cx="200" cy="150" rx="60" ry="20" fill="#059669" opacity="0.8"/>
      <circle cx="75" cy="115" r="8" fill="#f43f5e"/>
      <circle cx="210" cy="145" r="10" fill="#f472b6"/>
      <path d="M 0 40 Q 150 120 300 20" stroke="#a7f3d0" stroke-width="14" fill="none" opacity="0.4"/>
    `),
    samplePrompt: 'Impressionist oil painting of water lilies on a pond, dappled sunlight, soft pastel pinks, emerald greens, and delicate reflections',
    contentWeightDefault: 30,
    styleWeightDefault: 600,
    recommendedLayers: ['Conv2_1', 'Conv3_1', 'Conv4_1'],
  },
  {
    id: 'composition-vii',
    name: 'Composition VII',
    artist: 'Wassily Kandinsky',
    period: 'Abstract Expressionism (1913)',
    description: 'Dynamic geometric interplay, exploding color fields, rhythmic diagonal axes, and chaotic harmonious shapes.',
    thumbnail: createSvgDataUrl(300, 200, `
      <rect width="300" height="200" fill="#f1f5f9"/>
      <circle cx="100" cy="80" r="45" fill="#ef4444" opacity="0.7"/>
      <polygon points="150,20 280,160 120,180" fill="#3b82f6" opacity="0.6"/>
      <line x1="20" y1="180" x2="260" y2="30" stroke="#0f172a" stroke-width="6"/>
      <circle cx="210" cy="120" r="30" fill="#eab308" opacity="0.8"/>
      <path d="M 40 100 Q 100 160 180 80" stroke="#8b5cf6" stroke-width="8" fill="none"/>
    `),
    samplePrompt: 'Vibrant Kandinsky abstract expressionism with geometric shapes, sharp intersecting lines, bold primary color bursts, and musical rhythm',
    contentWeightDefault: 5,
    styleWeightDefault: 1200,
    recommendedLayers: ['Conv3_1', 'Conv4_1', 'Conv5_1'],
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Synthwave',
    artist: 'Digital AI Art',
    period: 'Futuristic Neo-Tokyo',
    description: 'High-contrast glowing cyan neon, hot magenta grid lines, dark obsidian surfaces, and chromatic aberration effects.',
    thumbnail: createSvgDataUrl(300, 200, `
      <rect width="300" height="200" fill="#09090b"/>
      <line x1="0" y1="100" x2="300" y2="100" stroke="#ec4899" stroke-width="2"/>
      <path d="M 0 100 L 150 200 M 50 100 L 180 200 M 100 100 L 210 200 M 150 100 L 240 200 M 200 100 L 270 200 M 250 100 L 300 200" stroke="#ec4899" stroke-width="1.5" opacity="0.7"/>
      <circle cx="150" cy="80" r="40" fill="#06b6d4"/>
      <rect x="20" y="50" width="40" height="50" fill="#18181b" stroke="#06b6d4" stroke-width="2"/>
      <rect x="240" y="30" width="50" height="70" fill="#18181b" stroke="#a855f7" stroke-width="2"/>
    `),
    samplePrompt: 'Glow-in-the-dark cyberpunk aesthetic with radiant neon cyan and magenta lights, dark obsidian textures, and synthwave laser lines',
    contentWeightDefault: 15,
    styleWeightDefault: 900,
    recommendedLayers: ['Conv1_1', 'Conv2_1', 'Conv4_1'],
  },
  {
    id: 'stained-glass',
    name: 'Gothic Stained Glass',
    artist: 'Medieval Cathedral Masters',
    period: 'Gothic Architecture (1200)',
    description: 'Luminous jewel-toned glass fragments bound by heavy black lead line cames, creating glowing mosaic illumination.',
    thumbnail: createSvgDataUrl(300, 200, `
      <rect width="300" height="200" fill="#172554"/>
      <polygon points="150,20 220,90 150,160 80,90" fill="#dc2626" stroke="#020617" stroke-width="5"/>
      <polygon points="150,20 200,50 150,90 100,50" fill="#3b82f6" stroke="#020617" stroke-width="4"/>
      <polygon points="220,90 280,140 200,180 150,160" fill="#eab308" stroke="#020617" stroke-width="4"/>
      <polygon points="80,90 150,160 100,180 20,140" fill="#16a34a" stroke="#020617" stroke-width="4"/>
    `),
    samplePrompt: 'Gothic cathedral stained glass window artwork with jewel-toned ruby reds, sapphire blues, emerald greens, and thick black lead cames',
    contentWeightDefault: 25,
    styleWeightDefault: 850,
    recommendedLayers: ['Conv1_1', 'Conv3_1', 'Conv4_1'],
  },
  {
    id: 'pencil-charcoal',
    name: 'Charcoal & Graphite Sketch',
    artist: 'Classical Studio Draftsman',
    period: 'Renaissance Sketchbook',
    description: 'Raw cross-hatching, smudged graphite shadows, organic paper grain, and expressive monochrome contrast.',
    thumbnail: createSvgDataUrl(300, 200, `
      <rect width="300" height="200" fill="#f5f5f4"/>
      <path d="M 20 180 L 280 20 M 30 190 L 290 30 M 10 170 L 270 10" stroke="#262626" stroke-width="2" opacity="0.6"/>
      <path d="M 50 20 Q 150 180 250 40" stroke="#171717" stroke-width="6" fill="none"/>
      <circle cx="150" cy="100" r="35" fill="#404040" opacity="0.5"/>
    `),
    samplePrompt: 'Detailed classical charcoal and graphite pencil sketch on textured archival paper, expressive cross-hatching, and rich contrast shading',
    contentWeightDefault: 40,
    styleWeightDefault: 500,
    recommendedLayers: ['Conv1_1', 'Conv2_1'],
  }
];

export const SAMPLE_CONTENT_IMAGES: ContentSample[] = [
  {
    id: 'sculpture',
    title: 'Renaissance Marble Statue',
    category: 'Classical',
    imageUrl: createSvgDataUrl(400, 300, `
      <rect width="400" height="300" fill="#1e293b"/>
      <path d="M 170 50 C 130 50 120 100 120 150 C 120 220 140 260 200 270 C 260 260 280 220 280 150 C 280 100 270 50 230 50 Z" fill="#e2e8f0"/>
      <ellipse cx="170" cy="130" rx="12" ry="8" fill="#94a3b8"/>
      <ellipse cx="230" cy="130" rx="12" ry="8" fill="#94a3b8"/>
      <path d="M 200 135 L 195 180 L 210 185" stroke="#64748b" stroke-width="4" fill="none"/>
      <path d="M 180 210 Q 200 225 220 210" stroke="#64748b" stroke-width="4" fill="none"/>
    `)
  },
  {
    id: 'cyber-robot',
    title: 'Autonomous Companion Drone',
    category: 'Robotics & AI',
    imageUrl: createSvgDataUrl(400, 300, `
      <rect width="400" height="300" fill="#0f172a"/>
      <rect x="120" y="80" width="160" height="120" rx="20" fill="#334155" stroke="#38bdf8" stroke-width="4"/>
      <circle cx="160" cy="130" r="20" fill="#0284c7"/>
      <circle cx="160" cy="130" r="8" fill="#e0f2fe"/>
      <circle cx="240" cy="130" r="20" fill="#0284c7"/>
      <circle cx="240" cy="130" r="8" fill="#e0f2fe"/>
      <path d="M 170 170 Q 200 185 230 170" stroke="#38bdf8" stroke-width="3" fill="none"/>
      <rect x="180" y="200" width="40" height="60" fill="#475569"/>
    `)
  },
  {
    id: 'mountain-lake',
    title: 'Alpine Peak & Mirror Lake',
    category: 'Landscape',
    imageUrl: createSvgDataUrl(400, 300, `
      <rect width="400" height="300" fill="#38bdf8"/>
      <polygon points="50,200 180,60 280,200" fill="#475569"/>
      <polygon points="150,200 270,90 380,200" fill="#64748b"/>
      <polygon points="180,60 160,90 180,100 200,90" fill="#f8fafc"/>
      <rect x="0" y="200" width="400" height="100" fill="#0284c7"/>
      <polygon points="50,200 180,290 280,200" fill="#0369a1" opacity="0.6"/>
    `)
  },
  {
    id: 'architecture',
    title: 'Modern Architecture Facade',
    category: 'Structure',
    imageUrl: createSvgDataUrl(400, 300, `
      <rect width="400" height="300" fill="#e2e8f0"/>
      <rect x="60" y="40" width="280" height="220" fill="#1e293b"/>
      <line x1="60" y1="100" x2="340" y2="100" stroke="#38bdf8" stroke-width="3"/>
      <line x1="60" y1="160" x2="340" y2="160" stroke="#38bdf8" stroke-width="3"/>
      <line x1="60" y1="220" x2="340" y2="220" stroke="#38bdf8" stroke-width="3"/>
      <line x1="150" y1="40" x2="150" y2="260" stroke="#64748b" stroke-width="2"/>
      <line x1="250" y1="40" x2="250" y2="260" stroke="#64748b" stroke-width="2"/>
    `)
  }
];
