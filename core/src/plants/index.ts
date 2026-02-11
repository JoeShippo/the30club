import { Plant, PlantCategory } from '../types/index.js';

export const CANONICAL_PLANTS: Plant[] = [
  // Vegetables
{ id: 'rocket', name: 'Rocket', aliases: ['Arugula'], category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'asparagus', name: 'Asparagus', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'beetroot', name: 'Beetroot', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'bell-pepper', name: 'Bell Pepper', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'bok-choy', name: 'Bok Choy', category: PlantCategory.VEGETABLE, isCommon: false },
  { id: 'broccoli', name: 'Broccoli', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'brussels-sprouts', name: 'Brussels Sprouts', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'cabbage', name: 'Cabbage', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'carrot', name: 'Carrot', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'cauliflower', name: 'Cauliflower', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'celery', name: 'Celery', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'chilli-pepper', name: 'Chilli Pepper', aliases: ['Chili Pepper'], category: PlantCategory.VEGETABLE, isCommon: true },

  { id: 'corn', name: 'Corn', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'cucumber', name: 'Cucumber', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'aubergine', name: 'Aubergine', aliases: ['Eggplant'], category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'kale', name: 'Kale', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'lettuce', name: 'Lettuce', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'onion', name: 'Onion', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'potato', name: 'Potato', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'pumpkin', name: 'Pumpkin', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'radish', name: 'Radish', category: PlantCategory.VEGETABLE, isCommon: false },
  { id: 'spinach', name: 'Spinach', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'sweet-potato', name: 'Sweet Potato', category: PlantCategory.VEGETABLE, isCommon: true },
  { id: 'tomato', name: 'Tomato', category: PlantCategory.VEGETABLE, isCommon: true },
{ id: 'courgette', name: 'Courgette', aliases: ['Zucchini'], category: PlantCategory.VEGETABLE, isCommon: true },
{ id: 'leek', name: 'Leek', category: PlantCategory.VEGETABLE, isCommon: true },
{ id: 'spring-onion', name: 'Spring Onion', aliases: ['Scallion', 'Green Onion'], category: PlantCategory.VEGETABLE, isCommon: true },
{ id: 'butternut-squash', name: 'Butternut Squash', category: PlantCategory.VEGETABLE, isCommon: true },
{ id: 'chard', name: 'Chard', aliases: ['Swiss Chard'], category: PlantCategory.VEGETABLE, isCommon: false },

  // Fruits
  { id: 'apple', name: 'Apple', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'avocado', name: 'Avocado', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'banana', name: 'Banana', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'blackberry', name: 'Blackberry', category: PlantCategory.FRUIT, isCommon: false },
  { id: 'blueberry', name: 'Blueberry', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'olive', name: 'Olive', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'blackcurrant', name: 'Blackcurrant', category: PlantCategory.FRUIT, isCommon: false },
  { id: 'cherry', name: 'Cherry', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'dates', name: 'Dates', category: PlantCategory.FRUIT, isCommon: true },
{ id: 'raisins', name: 'Raisins', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'coconut', name: 'Coconut', category: PlantCategory.FRUIT, isCommon: false },
  { id: 'cranberry', name: 'Cranberry', category: PlantCategory.FRUIT, isCommon: false },
  { id: 'grape', name: 'Grape', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'grapefruit', name: 'Grapefruit', category: PlantCategory.FRUIT, isCommon: false },
  { id: 'kiwi', name: 'Kiwi', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'lemon', name: 'Lemon', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'lime', name: 'Lime', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'mango', name: 'Mango', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'orange', name: 'Orange', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'papaya', name: 'Papaya', category: PlantCategory.FRUIT, isCommon: false },
  { id: 'peach', name: 'Peach', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'pear', name: 'Pear', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'pineapple', name: 'Pineapple', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'plum', name: 'Plum', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'raspberry', name: 'Raspberry', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'strawberry', name: 'Strawberry', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'watermelon', name: 'Watermelon', category: PlantCategory.FRUIT, isCommon: true },
  { id: 'pomegranate', name: 'Pomegranate', category: PlantCategory.FRUIT, isCommon: true },
{ id: 'fig', name: 'Fig', category: PlantCategory.FRUIT, isCommon: false },
{ id: 'passionfruit', name: 'Passionfruit', aliases: ['Passion Fruit'], category: PlantCategory.FRUIT, isCommon: false },
{ id: 'apricot', name: 'Apricot', category: PlantCategory.FRUIT, isCommon: true },
{ id: 'nectarine', name: 'Nectarine', category: PlantCategory.FRUIT, isCommon: true },


  // Grains
  { id: 'barley', name: 'Barley', category: PlantCategory.GRAIN, isCommon: false },
  { id: 'buckwheat', name: 'Buckwheat', category: PlantCategory.GRAIN, isCommon: false },
  { id: 'millet', name: 'Millet', category: PlantCategory.GRAIN, isCommon: false },
  { id: 'oats', name: 'Oats', category: PlantCategory.GRAIN, isCommon: true },
  { id: 'quinoa', name: 'Quinoa', category: PlantCategory.GRAIN, isCommon: true },
  { id: 'rice-brown', name: 'Brown Rice', category: PlantCategory.GRAIN, isCommon: true },
  { id: 'rice-white', name: 'White Rice', category: PlantCategory.GRAIN, isCommon: true },
  { id: 'rye', name: 'Rye', category: PlantCategory.GRAIN, isCommon: false },
  { id: 'wheat', name: 'Wheat', category: PlantCategory.GRAIN, isCommon: true },
  { id: 'spelt', name: 'Spelt', category: PlantCategory.GRAIN, isCommon: false },
{ id: 'amaranth', name: 'Amaranth', category: PlantCategory.GRAIN, isCommon: false },


  // Legumes
  { id: 'black-beans', name: 'Black Beans', category: PlantCategory.LEGUME, isCommon: true },
  { id: 'chickpeas', name: 'Chickpeas', category: PlantCategory.LEGUME, isCommon: true },
  { id: 'green-beans', name: 'Green Beans', category: PlantCategory.LEGUME, isCommon: true },
  { id: 'kidney-beans', name: 'Kidney Beans', category: PlantCategory.LEGUME, isCommon: true },
  { id: 'lentils', name: 'Lentils', category: PlantCategory.LEGUME, isCommon: true },
  { id: 'peanuts', name: 'Peanuts', category: PlantCategory.LEGUME, isCommon: true },
  { id: 'peas', name: 'Peas', category: PlantCategory.LEGUME, isCommon: true },
  { id: 'soybeans', name: 'Soybeans', category: PlantCategory.LEGUME, isCommon: true },
  { id: 'butter-beans', name: 'Butter Beans', aliases: ['Lima Beans'], category: PlantCategory.LEGUME, isCommon: true },
{ id: 'cannellini-beans', name: 'Cannellini Beans', aliases: ['White Kidney Beans'], category: PlantCategory.LEGUME, isCommon: true },
{ id: 'broad-beans', name: 'Broad Beans', aliases: ['Fava Beans'], category: PlantCategory.LEGUME, isCommon: true },


  // Nuts & Seeds
  { id: 'almonds', name: 'Almonds', category: PlantCategory.NUT_SEED, isCommon: true },
  { id: 'brazil-nuts', name: 'Brazil Nuts', category: PlantCategory.NUT_SEED, isCommon: false },
  { id: 'cashews', name: 'Cashews', category: PlantCategory.NUT_SEED, isCommon: true },
  { id: 'chia-seeds', name: 'Chia Seeds', category: PlantCategory.NUT_SEED, isCommon: true },
  { id: 'flax-seeds', name: 'Flax Seeds', category: PlantCategory.NUT_SEED, isCommon: true },
  { id: 'hazelnuts', name: 'Hazelnuts', category: PlantCategory.NUT_SEED, isCommon: false },
  { id: 'macadamia', name: 'Macadamia', category: PlantCategory.NUT_SEED, isCommon: false },
  { id: 'pecans', name: 'Pecans', category: PlantCategory.NUT_SEED, isCommon: false },
  { id: 'pine-nuts', name: 'Pine Nuts', category: PlantCategory.NUT_SEED, isCommon: false },
  { id: 'pistachios', name: 'Pistachios', category: PlantCategory.NUT_SEED, isCommon: true },
  { id: 'pumpkin-seeds', name: 'Pumpkin Seeds', category: PlantCategory.NUT_SEED, isCommon: true },
  { id: 'sesame-seeds', name: 'Sesame Seeds', category: PlantCategory.NUT_SEED, isCommon: true },
  { id: 'sunflower-seeds', name: 'Sunflower Seeds', category: PlantCategory.NUT_SEED, isCommon: true },
  { id: 'chestnuts', name: 'Chestnuts', category: PlantCategory.NUT_SEED, isCommon: false },
  { id: 'mustard-seeds', name: 'Mustard Seeds', category: PlantCategory.NUT_SEED, isCommon: false },
{ id: 'poppy-seeds', name: 'Poppy Seeds', category: PlantCategory.NUT_SEED, isCommon: false },


  { id: 'walnuts', name: 'Walnuts', category: PlantCategory.NUT_SEED, isCommon: true },

  // Herbs & Spices
  { id: 'basil', name: 'Basil', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'black-pepper', name: 'Black Pepper', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'cayenne', name: 'Cayenne', category: PlantCategory.HERB_SPICE, isCommon: false },
{ id: 'coriander', name: 'Coriander', aliases: ['Cilantro'], category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'cinnamon', name: 'Cinnamon', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'cumin', name: 'Cumin', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'dill', name: 'Dill', category: PlantCategory.HERB_SPICE, isCommon: false },
  { id: 'garlic', name: 'Garlic', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'ginger', name: 'Ginger', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'mint', name: 'Mint', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'oregano', name: 'Oregano', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'paprika', name: 'Paprika', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'parsley', name: 'Parsley', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'rosemary', name: 'Rosemary', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'thyme', name: 'Thyme', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'turmeric', name: 'Turmeric', category: PlantCategory.HERB_SPICE, isCommon: true },
  { id: 'chives', name: 'Chives', category: PlantCategory.HERB_SPICE, isCommon: true },
{ id: 'sage', name: 'Sage', category: PlantCategory.HERB_SPICE, isCommon: true },
{ id: 'bay-leaf', name: 'Bay Leaf', aliases: ['Bay Leaves'], category: PlantCategory.HERB_SPICE, isCommon: false },


  // Mushrooms
  { id: 'button-mushroom', name: 'Button Mushroom', category: PlantCategory.MUSHROOM, isCommon: true },
  { id: 'portobello', name: 'Portobello', category: PlantCategory.MUSHROOM, isCommon: true },
  { id: 'shiitake', name: 'Shiitake', category: PlantCategory.MUSHROOM, isCommon: true },
  { id: 'oyster-mushroom', name: 'Oyster Mushroom', category: PlantCategory.MUSHROOM, isCommon: false },
  { id: 'porcini', name: 'Porcini', category: PlantCategory.MUSHROOM, isCommon: false },
  { id: 'white-mushroom', name: 'White Mushroom', aliases: ['White Button Mushroom'], category: PlantCategory.MUSHROOM, isCommon: true },
  { id: 'chestnut-mushroom', name: 'Chestnut Mushroom', aliases: ['Brown Mushroom'], category: PlantCategory.MUSHROOM,  isCommon: true },

  // Seaweed
  { id: 'nori', name: 'Nori', category: PlantCategory.SEAWEED, isCommon: false },
  { id: 'wakame', name: 'Wakame', category: PlantCategory.SEAWEED, isCommon: false },
  { id: 'kombu', name: 'Kombu', category: PlantCategory.SEAWEED, isCommon: false },
  { id: 'spirulina', name: 'Spirulina', category: PlantCategory.SEAWEED, isCommon: false },
  { id: 'coffee', name: 'Coffee', category: PlantCategory.PLANT_PRODUCT, isCommon: true },
  { id: 'tea', name: 'Tea', category: PlantCategory.PLANT_PRODUCT, isCommon: true },
  { id: 'extra-virgin-olive-oil', name: 'Extra Virgin Olive Oil', aliases: ['EVOO'], category: PlantCategory.PLANT_PRODUCT, isCommon: true },
  { id: 'dark-chocolate-70', name: 'Dark Chocolate (70%+ Cocoa)', category: PlantCategory.PLANT_PRODUCT, isCommon: true },
];

export function getPlantById(id: string): Plant | undefined {
  return CANONICAL_PLANTS.find((p) => p.id === id);
}

export function searchPlants(query: string): Plant[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return CANONICAL_PLANTS;

  return CANONICAL_PLANTS.filter((plant) =>
    plant.name.toLowerCase().includes(lowerQuery)
  );
}

export function getPlantsByCategory(category: PlantCategory): Plant[] {
  return CANONICAL_PLANTS.filter((plant) => plant.category === category);
}

export function getCommonPlants(): Plant[] {
  return CANONICAL_PLANTS.filter((plant) => plant.isCommon);
}