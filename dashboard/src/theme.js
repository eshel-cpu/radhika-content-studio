/**
 * theme.js — Radhika brand tokens
 */

export const theme = {
  cream: '#FAF7F2',
  creamDark: '#F0EAE0',
  green: '#2D6A4F',
  greenLight: '#40916C',
  greenPale: '#D8F3DC',
  gold: '#C9972C',
  goldPale: '#FDF3DC',
  terra: '#C4724A',
  terraPale: '#FBEEE7',
  dark: '#2C2416',
  mid: '#6B5B45',
  border: '#DDD3C2',
  muted: '#A89880',
}

// Pillar definitions
export const PILLARS = [
  {
    id: 'wisdom',
    label: 'Wisdom Drops',
    emoji: '📖',
    color: theme.green,
    bgColor: theme.greenPale,
    description: 'Gita verses, Hridayananda quotes, philosophical insight',
  },
  {
    id: 'community',
    label: 'Community Life',
    emoji: '🎵',
    color: theme.terra,
    bgColor: theme.terraPale,
    description: 'Kirtans, prasadam, gatherings, real moments',
  },
  {
    id: 'explain',
    label: 'Bhakti Explained',
    emoji: '🌱',
    color: theme.gold,
    bgColor: theme.goldPale,
    description: 'Accessible intro content for newcomers',
  },
  {
    id: 'story',
    label: 'Personal Stories',
    emoji: '💛',
    color: theme.mid,
    bgColor: theme.creamDark,
    description: 'Member testimonials, transformation journeys',
  },
  {
    id: 'event',
    label: 'Events',
    emoji: '📅',
    color: theme.dark,
    bgColor: theme.border,
    description: 'Upcoming gatherings, class schedules',
  },
]

// Format definitions
export const FORMATS = [
  { id: 'reel', label: 'Reel', emoji: '🎬', description: '15–90 sec video' },
  { id: 'carousel', label: 'Carousel', emoji: '📑', description: '3–10 slide swipe' },
  { id: 'quote-tile', label: 'Quote Tile', emoji: '✨', description: 'Single image with text' },
  { id: 'single-image', label: 'Single Image', emoji: '📷', description: 'Photo or graphic' },
]

// Source types for Waterfall
export const SOURCE_TYPES = [
  { id: 'kirtan', label: 'Kirtan', emoji: '🎶' },
  { id: 'class', label: 'Class / Lecture', emoji: '📚' },
  { id: 'satsang', label: 'Satsang', emoji: '🌸' },
  { id: 'event', label: 'Event / Gathering', emoji: '🎉' },
]

// Get pillar by id
export function getPillar(id) {
  return PILLARS.find(p => p.id === id) || PILLARS[0]
}
