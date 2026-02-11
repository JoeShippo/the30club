export interface PlantAvatar {
  id: string;
  emoji: string;
  name: string;
}

export const PLANT_AVATARS: PlantAvatar[] = [
  { id: 'sprout',      emoji: '🌱', name: 'Sprout' },
  { id: 'herb',        emoji: '🌿', name: 'Herb' },
  { id: 'leafy',       emoji: '🍃', name: 'Leafy' },
  { id: 'sunflower',   emoji: '🌻', name: 'Sunflower' },
  { id: 'broccoli',    emoji: '🥦', name: 'Broccoli' },
  { id: 'mushroom',    emoji: '🍄', name: 'Mushroom' },
  { id: 'avocado',     emoji: '🥑', name: 'Avocado' },
  { id: 'cactus',      emoji: '🌵', name: 'Cactus' },
  { id: 'four_leaf',   emoji: '🍀', name: 'Lucky Clover' },
  { id: 'cherry',      emoji: '🍒', name: 'Cherry' },
  { id: 'strawberry',  emoji: '🍓', name: 'Strawberry' },
  { id: 'carrot',      emoji: '🥕', name: 'Carrot' },
];