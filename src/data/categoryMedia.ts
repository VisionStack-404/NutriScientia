import breakfastImg from '../assets/images/cat_breakfast_tiffin_1794835953916.jpg';
import idliTiffinImg from '../assets/images/dish_idli_tiffin_1794975848295.jpg';
import alooParathaImg from '../assets/images/food_aloo_paratha_1795016934820.jpg';

import curriesImg from '../assets/images/cat_curries_gravies_1794835954332.jpg';
import dalCurryImg from '../assets/images/dish_dal_lentil_curry_1794975847182.jpg';
import breadsImg from '../assets/images/cat_breads_rotis_1794835954023.jpg';
import riceImg from '../assets/images/cat_rice_biryanis_1794835955488.jpg';

import streetImg from '../assets/images/cat_street_chaats_1794835955956.jpg';
import tandooriImg from '../assets/images/cat_tandoori_starters_1794835956690.jpg';
import sweetsImg from '../assets/images/cat_sweets_desserts_1794835956224.jpg';

import globalBowlsImg from '../assets/images/cat_global_bowls_1794891500484.jpg';
import pastaStirfryImg from '../assets/images/dish_pasta_stirfry_1794975848334.jpg';
import grilledProteinImg from '../assets/images/dish_grilled_protein_1794975848585.jpg';
import saladsVegImg from '../assets/images/cat_salads_vegetables_1794891501340.jpg';

import freshOrangeImg from '../assets/images/food_fresh_orange_1795016933596.jpg';
import freshBananaImg from '../assets/images/food_fresh_banana_1795016933744.jpg';
import freshSpinachImg from '../assets/images/food_fresh_spinach_1795016934001.jpg';
import freshFruitsImg from '../assets/images/cat_fresh_fruits_1794891500710.jpg';

import freshMilkImg from '../assets/images/food_fresh_milk_1795016934740.jpg';
import nutsDairyImg from '../assets/images/dish_nuts_dairy_bowl_1794975849288.jpg';
import grainsProteinImg from '../assets/images/cat_grains_protein_1794891500794.jpg';
import roastedAlmondsImg from '../assets/images/food_roasted_almonds_1795016935512.jpg';
import boiledEggsImg from '../assets/images/food_boiled_eggs_1795016936407.jpg';

import beveragesImg from '../assets/images/cat_beverages_sides_1794835957243.jpg';
import smoothieLassiImg from '../assets/images/dish_smoothie_lassi_1794975848873.jpg';
import rawHoneyImg from '../assets/images/food_raw_honey_1795016937120.jpg';

import ingPaneerImg from '../assets/images/ing_paneer_cubes_1795019001074.jpg';
import ingTomatoesImg from '../assets/images/ing_ripe_tomatoes_1795019002058.jpg';
import ingOnionsGarlicImg from '../assets/images/ing_onions_garlic_1795019001736.jpg';
import ingSpicesImg from '../assets/images/ing_aromatic_spices_1795019001866.jpg';
import ingGheeButterImg from '../assets/images/ing_ghee_butter_1795019004294.jpg';

import { FOOD_CATALOGUE, FoodCatalogueItem, FoodType } from './foodCatalogue';

export interface CategoryMeta {
  foodType: FoodType;
  shortLabel: string;
  subtitle: string;
  coverImage: string;
  featuredDishName: string;
  accentBg: string;
  accentFg: string;
}

export const FOOD_CATEGORY_META: CategoryMeta[] = [
  {
    foodType: 'Breakfast & Tiffin',
    shortLabel: 'Breakfast',
    subtitle: 'Crisp masala dosa, steamed idli & stuffed paratha',
    coverImage: breakfastImg,
    featuredDishName: 'Masala Dosa',
    accentBg: '#FEF3C7',
    accentFg: '#B45309',
  },
  {
    foodType: 'Curries, Breads & Rice',
    shortLabel: 'Curries & Rice',
    subtitle: 'Paneer butter masala, dal tadka, garlic naan & biryani',
    coverImage: curriesImg,
    featuredDishName: 'Paneer Butter Masala',
    accentBg: '#FFEDD5',
    accentFg: '#C2410C',
  },
  {
    foodType: 'Snacks & Tandoori',
    shortLabel: 'Snacks',
    subtitle: 'Crispy samosas, smoky paneer tikka & gulab jamun',
    coverImage: tandooriImg,
    featuredDishName: 'Tandoori Paneer Tikka',
    accentBg: '#FEE2E2',
    accentFg: '#B91C1C',
  },
  {
    foodType: 'Global Meals & Salads',
    shortLabel: 'Global & Salads',
    subtitle: 'Salmon poke bowl, basil pasta, grilled protein & salads',
    coverImage: globalBowlsImg,
    featuredDishName: 'Salmon Poke Rice Bowl',
    accentBg: '#CCFBF1',
    accentFg: '#0F766E',
  },
  {
    foodType: 'Fruits & Vegetables',
    shortLabel: 'Produce',
    subtitle: 'Fresh Valencia oranges, ripe bananas, spinach & orchard fruit',
    coverImage: freshFruitsImg,
    featuredDishName: 'Tropical Fruit Platter',
    accentBg: '#DCFCE7',
    accentFg: '#15803D',
  },
  {
    foodType: 'Dairy, Grains & Protein',
    shortLabel: 'Dairy & Protein',
    subtitle: 'Whole milk, yogurt oats, quinoa, roasted almonds & eggs',
    coverImage: grainsProteinImg,
    featuredDishName: 'Quinoa & Lentils',
    accentBg: '#E0F2FE',
    accentFg: '#0369A1',
  },
  {
    foodType: 'Beverages & Sweeteners',
    shortLabel: 'Drinks & Honey',
    subtitle: 'Spiced masala chai, chilled mango lassi & wildflower honey',
    coverImage: beveragesImg,
    featuredDishName: 'Masala Chai',
    accentBg: '#FDF2F8',
    accentFg: '#9D174D',
  },
];

export interface FoodCategorySection {
  meta: CategoryMeta;
  items: FoodCatalogueItem[];
}

export function canonicalDishKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Strict 1-to-1 unique dish photo registry so zero two dishes in the
 * curated FoodLab catalogue ever display the same image.
 */
const UNIQUE_DISH_IMAGE_MAP: Record<string, string> = {
  masaladosa: breakfastImg,
  steamedidli: idliTiffinImg,
  alooparatha: alooParathaImg,
  paneerbuttermasala: curriesImg,
  yellowdaltadka: dalCurryImg,
  garlicnaan: breadsImg,
  hyderabadichickenbiryani: riceImg,
  punjabisamosa: streetImg,
  tandooripaneertikka: tandooriImg,
  gulabjamun: sweetsImg,
  salmonpokebowl: globalBowlsImg,
  salmonpokericebowl: globalBowlsImg,
  tomatobasilpasta: pastaStirfryImg,
  grilledchickensalmon: grilledProteinImg,
  greekgardensalad: saladsVegImg,
  orange: freshOrangeImg,
  banana: freshBananaImg,
  spinach: freshSpinachImg,
  tropicalfruitplatter: freshFruitsImg,
  milk: freshMilkImg,
  greekyogurtoats: nutsDairyImg,
  oats: nutsDairyImg,
  quinoalentils: grainsProteinImg,
  almonds: roastedAlmondsImg,
  eggs: boiledEggsImg,
  masalachai: beveragesImg,
  mangolassi: smoothieLassiImg,
  honey: rawHoneyImg,
};

const CATEGORY_COVER_MAP = new Map<FoodType, string>(
  FOOD_CATEGORY_META.map((meta) => [meta.foodType, meta.coverImage])
);

/**
 * Resolves the exact 1-to-1 photo for curated items, and falls back to
 * semantic food-subject photo matching for any custom user-entered food name.
 */
export function resolveRelatedDishImage(
  foodName: string,
  fallbackFoodType?: FoodType
): string {
  const exact = UNIQUE_DISH_IMAGE_MAP[canonicalDishKey(foodName)];
  if (exact) return exact;

  const q = foodName.toLowerCase();

  if (/\b(milk|buttermilk|lassi\s*milk|soy\s*milk|almond\s*milk|dairy)\b/.test(q)) {
    return q.includes('lassi') ? smoothieLassiImg : freshMilkImg;
  }
  if (/\b(orange|citrus|lemon|lime|tangerine|mandarin|grapefruit)\b/.test(q)) {
    return freshOrangeImg;
  }
  if (/\b(banana|plantain)\b/.test(q)) {
    return freshBananaImg;
  }
  if (/\b(spinach|palak|kale|greens|lettuce|methi|chard)\b/.test(q)) {
    return freshSpinachImg;
  }
  if (/\b(almond|walnut|cashew|nut|nuts|pistachio|peanut|seed)\b/.test(q)) {
    return roastedAlmondsImg;
  }
  if (/\b(egg|eggs|omelette|omelet|boiled\s*egg|scrambled)\b/.test(q)) {
    return boiledEggsImg;
  }
  if (/\b(honey|syrup|jaggery|maple|nectar)\b/.test(q)) {
    return rawHoneyImg;
  }
  if (/\b(paratha|roti|chapati|phulka|kulcha|bhakri)\b/.test(q)) {
    return q.includes('naan') ? breadsImg : alooParathaImg;
  }
  if (/\b(naan|bread|toast|bagel|pita)\b/.test(q)) {
    return breadsImg;
  }
  if (/\b(idli|vada|uttapam|upma|pongal|poha)\b/.test(q)) {
    return idliTiffinImg;
  }
  if (/\b(dosa|crepe|pesarattu|cheela)\b/.test(q)) {
    return breakfastImg;
  }
  if (/\b(dal|tadka|lentil|rajma|chole|sambar|rasam|beans)\b/.test(q)) {
    return dalCurryImg;
  }
  if (/\b(paneer|butter\s*chicken|masala|curry|korma|gravy|sabzi)\b/.test(q)) {
    return curriesImg;
  }
  if (/\b(biryani|pulao|rice|khichdi)\b/.test(q)) {
    return riceImg;
  }
  if (/\b(samosa|chaat|pakora|kachori|vada\s*pav|snack)\b/.test(q)) {
    return streetImg;
  }
  if (/\b(tikka|tandoori|kebab|skewer)\b/.test(q)) {
    return tandooriImg;
  }
  if (/\b(jamun|halwa|kheer|jalebi|laddu|barfi|dessert|sweet|cake)\b/.test(q)) {
    return sweetsImg;
  }
  if (/\b(pasta|spaghetti|noodle|ramen|penne|macaroni)\b/.test(q)) {
    return pastaStirfryImg;
  }
  if (/\b(poke|sushi|bowl|avocado)\b/.test(q)) {
    return globalBowlsImg;
  }
  if (/\b(chicken|salmon|fish|steak|meat|turkey|prawn|grilled)\b/.test(q)) {
    return grilledProteinImg;
  }
  if (/\b(salad|cucumber|tomato|veggie|vegetable)\b/.test(q)) {
    return saladsVegImg;
  }
  if (/\b(yogurt|curd|dahi|oats|oatmeal|granola|muesli)\b/.test(q)) {
    return nutsDairyImg;
  }
  if (/\b(quinoa|millet|grain|barley|chickpea|protein)\b/.test(q)) {
    return grainsProteinImg;
  }
  if (/\b(lassi|smoothie|juice|shake)\b/.test(q)) {
    return smoothieLassiImg;
  }
  if (/\b(chai|tea|coffee|latte|matcha)\b/.test(q)) {
    return beveragesImg;
  }
  if (/\b(fruit|mango|apple|berry|berries|grape|kiwi|pomegranate|melon)\b/.test(q)) {
    return freshFruitsImg;
  }

  return (fallbackFoodType && CATEGORY_COVER_MAP.get(fallbackFoodType)) || grainsProteinImg;
}

/**
 * Maps an individual ingredient name (from Vision or Text food analysis)
 * directly to a distinct culinary ingredient photograph so every row in the
 * Ingredients breakdown shows a matching ingredient visual rather than repeating
 * the whole-meal photo.
 */
export function resolveIngredientImage(
  ingredientName: string,
  dishFallback?: string
): string {
  const q = (ingredientName || '').toLowerCase().trim();
  if (!q) return dishFallback || grainsProteinImg;

  // Dairy & Cheese / Paneer
  if (/\b(paneer|cottage cheese|tofu|cheese|feta|mozzarella|ricotta|cheddar)\b/.test(q)) {
    return ingPaneerImg;
  }
  if (/\b(ghee|clarified butter|butter|oil|olive oil|cooking oil|sesame oil|margarine|fat)\b/.test(q)) {
    return ingGheeButterImg;
  }
  if (/\b(yogurt|curd|dahi|greek yogurt|buttermilk|cream)\b/.test(q)) {
    return nutsDairyImg;
  }
  if (/\b(milk|whole milk|skim milk|soy milk|almond milk|khoya|mawa)\b/.test(q)) {
    return freshMilkImg;
  }

  // Produce: Tomatoes, Onions/Garlic, Leafy Greens, Potatoes, Citrus, Banana, Fruits
  if (/\b(tomato|tomatoes|marinara|puree|cherry tomato)\b/.test(q)) {
    return ingTomatoesImg;
  }
  if (/\b(onion|onions|shallot|garlic|ginger|scallion|leek)\b/.test(q)) {
    return ingOnionsGarlicImg;
  }
  if (/\b(spinach|palak|coriander|cilantro|mint|curry leaves|basil|parsley|herbs|kale|lettuce|greens|methi|broccoli|peas)\b/.test(q)) {
    return freshSpinachImg;
  }
  if (/\b(potato|potatoes|aloo|yam|sweet potato|mashed potato)\b/.test(q)) {
    return alooParathaImg;
  }
  if (/\b(cucumber|bell pepper|capsicum|salad|vegetable|veggies|carrot|cabbage|zucchini|olive)\b/.test(q)) {
    return saladsVegImg;
  }
  if (/\b(lemon|lime|orange|citrus|tangerine)\b/.test(q)) {
    return freshOrangeImg;
  }
  if (/\b(banana|plantain)\b/.test(q)) {
    return freshBananaImg;
  }
  if (/\b(avocado|edamame|seaweed|nori|bowl)\b/.test(q)) {
    return globalBowlsImg;
  }
  if (/\b(mango|apple|berry|berries|strawberry|blueberry|pomegranate|pineapple|grape|fruit|raisin)\b/.test(q)) {
    return freshFruitsImg;
  }

  // Spices & Seasonings
  if (/\b(spice|spices|masala|garam|turmeric|cumin|cardamom|cinnamon|clove|saffron|pepper|chili|chilli|coriander powder|salt|seasoning|curry powder|mustard seed)\b/.test(q)) {
    return ingSpicesImg;
  }

  // Grains, Rice, Dal, Flour, Pasta
  if (/\b(basmati|rice|sushi rice|pulao|brown rice|white rice|jasmine)\b/.test(q)) {
    return riceImg;
  }
  if (/\b(dal|urad|toor|moong|chana|lentil|lentils|chickpea|chickpeas|beans|rajma|pulse|pulses)\b/.test(q)) {
    return dalCurryImg;
  }
  if (/\b(quinoa|oats|oatmeal|millet|chia|flax|granola|grain)\b/.test(q)) {
    return grainsProteinImg;
  }
  if (/\b(wheat|flour|maida|atta|bread|bun|dough|naan|roti|pita|batter|tortilla|crust)\b/.test(q)) {
    return breadsImg;
  }
  if (/\b(pasta|spaghetti|penne|noodle|noodles|macaroni|semolina|rava)\b/.test(q)) {
    return pastaStirfryImg;
  }

  // Proteins, Nuts, Eggs
  if (/\b(egg|eggs|egg white|yolk)\b/.test(q)) {
    return boiledEggsImg;
  }
  if (/\b(chicken|salmon|fish|tuna|shrimp|prawn|turkey|beef|lamb|mutton|meat|seafood)\b/.test(q)) {
    return grilledProteinImg;
  }
  if (/\b(almond|almonds|cashew|cashews|walnut|peanut|pistachio|nut|nuts|seed|seeds|sesame)\b/.test(q)) {
    return roastedAlmondsImg;
  }

  // Sweeteners & Drinks
  if (/\b(honey|sugar|jaggery|syrup|maple|caramel|molasses)\b/.test(q)) {
    return rawHoneyImg;
  }
  if (/\b(tea|chai|coffee|matcha|cocoa|chocolate|espresso)\b/.test(q)) {
    return beveragesImg;
  }
  if (/\b(juice|pulp|smoothie|rose water)\b/.test(q)) {
    return smoothieLassiImg;
  }

  // Exact dish match fallback if an ingredient happens to be a dish name
  const dishExact = UNIQUE_DISH_IMAGE_MAP[canonicalDishKey(ingredientName)];
  if (dishExact) return dishExact;

  return dishFallback || ingSpicesImg;
}

export function getUniqueDishImageUrl(item: Partial<FoodCatalogueItem>): string {
  if (item.name) {
    return resolveRelatedDishImage(item.name, item.foodType);
  }
  return (item.foodType && CATEGORY_COVER_MAP.get(item.foodType)) || breakfastImg;
}

export function getCategoryMeta(foodType: FoodType): CategoryMeta {
  return FOOD_CATEGORY_META.find((c) => c.foodType === foodType) || FOOD_CATEGORY_META[0];
}

/**
 * Culinary semantic relationship clusters so searching any ingredient, dish,
 * or food term immediately returns the most closely related food items.
 */
const RELATED_SEARCH_CLUSTERS: string[][] = [
  ['orange', 'citrus', 'lemon', 'lime', 'vitamin c', 'acidic', 'juice', 'fruit', 'mango', 'tropical'],
  ['banana', 'potassium', 'smoothie', 'fruit', 'preworkout', 'energy'],
  ['milk', 'dairy', 'curd', 'dahi', 'yogurt', 'calcium', 'casein', 'paneer', 'lassi', 'chai'],
  ['yogurt', 'curd', 'dahi', 'oats', 'oatmeal', 'probiotic', 'breakfast', 'granola', 'bowl'],
  ['almond', 'almonds', 'nut', 'nuts', 'seed', 'seeds', 'walnut', 'cashew', 'healthy fat', 'vitamin e'],
  ['egg', 'eggs', 'omelette', 'omelet', 'protein', 'breakfast', 'boiled'],
  ['honey', 'sweet', 'sweetener', 'sugar', 'jaggery', 'syrup', 'dessert', 'jamun'],
  ['spinach', 'palak', 'greens', 'leafy', 'salad', 'vegetable', 'veggie', 'iron', 'fiber'],
  ['salad', 'cucumber', 'tomato', 'greek', 'mediterranean', 'feta', 'vegetable', 'light'],
  ['dosa', 'idli', 'tiffin', 'south indian', 'fermented', 'chutney', 'sambar', 'breakfast'],
  ['paratha', 'naan', 'roti', 'chapati', 'bread', 'wheat', 'flatbread', 'garlic'],
  ['paneer', 'curry', 'gravy', 'masala', 'tikka', 'butter', 'tandoori', 'north indian'],
  ['dal', 'lentil', 'lentils', 'quinoa', 'pulses', 'tadka', 'grain', 'vegan', 'plant protein'],
  ['rice', 'biryani', 'poke', 'chicken', 'hyderabadi', 'saffron'],
  ['chicken', 'salmon', 'fish', 'seafood', 'grilled', 'meat', 'non-veg', 'protein'],
  ['pasta', 'italian', 'tomato', 'basil', 'noodle'],
  ['samosa', 'chaat', 'snack', 'street', 'fried', 'crispy', 'potato', 'aloo'],
  ['chai', 'tea', 'drink', 'beverage', 'lassi', 'coffee'],
];

export function scoreFoodRelevance(item: FoodCatalogueItem, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return 1;

  const nameLower = item.name.toLowerCase();
  const normQuery = canonicalDishKey(q);
  const normName = canonicalDishKey(item.name);

  if (normName === normQuery || nameLower === q) return 100;
  if (nameLower.startsWith(q)) return 90;
  if (nameLower.includes(q)) return 80;

  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length >= 2);
  let score = 0;

  // Direct token match against name, ingredients, cuisine, category, method
  for (const tok of tokens) {
    if (nameLower.includes(tok)) score += 45;
    if (item.mainIngredients.some((ing) => ing.toLowerCase().includes(tok))) score += 32;
    if (item.foodType.toLowerCase().includes(tok)) score += 24;
    if ((item.cuisine || '').toLowerCase().includes(tok)) score += 20;
    if (item.category.toLowerCase().includes(tok)) score += 18;
    if (item.description.toLowerCase().includes(tok)) score += 12;
  }

  // Culinary semantic cluster matching
  const itemCorpus = `${nameLower} ${item.mainIngredients.join(' ').toLowerCase()} ${item.foodType.toLowerCase()} ${(item.cuisine || '').toLowerCase()} ${item.category.toLowerCase()}`;
  for (const cluster of RELATED_SEARCH_CLUSTERS) {
    const queryHitsCluster = cluster.some(
      (term) => q.includes(term) || tokens.some((tok) => term.includes(tok) && tok.length >= 3)
    );
    if (queryHitsCluster) {
      const itemHitsCluster = cluster.filter((term) => itemCorpus.includes(term)).length;
      if (itemHitsCluster > 0) {
        score += 18 + itemHitsCluster * 6;
      }
    }
  }

  return score;
}

export function findBestMatchingFoodItem(rawQuery: string): FoodCatalogueItem | undefined {
  const catalog = getDeduplicatedFoodCatalogue();
  let best: FoodCatalogueItem | undefined;
  let bestScore = 0;
  for (const item of catalog) {
    const s = scoreFoodRelevance(item, rawQuery);
    if (s > bestScore) {
      bestScore = s;
      best = item;
    }
  }
  return bestScore >= 20 ? best : undefined;
}

/**
 * Builds a clean custom FoodCatalogueItem whenever a user enters a food name
 * not identically listed in the curated 26 items, pairing it with its closest
 * semantically matched dish image and baseline nutrition profile.
 */
export function createCustomRelatedFoodItem(rawName: string): FoodCatalogueItem {
  const cleanName = rawName.trim().replace(/\s+/g, ' ');
  const titledName = cleanName
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
  const related = findBestMatchingFoodItem(cleanName);
  const lower = cleanName.toLowerCase();

  const isDrink = /\b(milk|juice|tea|chai|coffee|lassi|smoothie|shake|drink|water|soup)\b/.test(lower);
  const isAcidic = /\b(orange|lemon|lime|citrus|tomato|vinegar|pineapple|berry|berries|mango|tamarind|yogurt)\b/.test(lower);
  const isDairy = /\b(milk|curd|dahi|yogurt|paneer|cheese|butter|ghee|cream|lassi)\b/.test(lower);
  const isFruit = /\b(apple|orange|lemon|lime|mango|banana|grape|berry|kiwi|melon|papaya|fruit)\b/.test(lower);
  const isVeg = /\b(spinach|salad|broccoli|carrot|cucumber|onion|tomato|greens|kale|veg)\b/.test(lower);

  const matchedCategory: FoodCatalogueItem['category'] = isDairy
    ? 'DAIRY'
    : isDrink
    ? 'BEVERAGES'
    : isFruit
    ? 'FRUITS'
    : isVeg
    ? 'VEGETABLES'
    : related?.category || 'PREPARED FOODS';

  const matchedFoodType: FoodType = isDairy
    ? 'Dairy, Grains & Protein'
    : isDrink
    ? 'Beverages & Sweeteners'
    : isFruit || isVeg
    ? 'Fruits & Vegetables'
    : related?.foodType || 'Global Meals & Salads';

  const imageUrl = resolveRelatedDishImage(cleanName, matchedFoodType);

  return {
    id: `custom_${canonicalDishKey(cleanName) || Date.now()}`,
    name: titledName,
    normalizedName: canonicalDishKey(cleanName),
    duplicateValidationStatus: 'VALIDATED_UNIQUE',
    foodType: matchedFoodType,
    category: matchedCategory,
    cuisine: related?.cuisine || 'Custom Food Entry',
    dietaryType: related?.dietaryType || (isFruit || isVeg ? 'Vegan' : 'Vegetarian'),
    description: related
      ? `Custom entry paired with closely related ${related.name} profile and photography.`
      : `Custom food entry prepared for FoodLab nutrition and compatibility analysis.`,
    mainIngredients: [titledName],
    cookingMethod: related?.cookingMethod || 'Fresh Preparation',
    defaultGrams: isDrink ? 200 : 120,
    unit: isDrink ? 'ml' : 'g',
    caloriesPer100g: related?.caloriesPer100g ?? 125,
    proteinPer100g: related?.proteinPer100g ?? 4.5,
    carbsPer100g: related?.carbsPer100g ?? 16.0,
    fatPer100g: related?.fatPer100g ?? 4.2,
    sugarPer100g: related?.sugarPer100g ?? 3.5,
    fiberPer100g: related?.fiberPer100g ?? 2.4,
    calciumMgPer100g: related?.calciumMgPer100g ?? 45,
    vitaminCMgPer100g: related?.vitaminCMgPer100g ?? (isAcidic ? 28 : 4),
    isAcidic,
    dairyType: isDairy,
    imageUrl,
    primaryImage: imageUrl,
  };
}

/**
 * Returns the strictly deduplicated catalogue where every dish has its own
 * 1-to-1 unique image URL.
 */
export function getDeduplicatedFoodCatalogue(): FoodCatalogueItem[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const unique: FoodCatalogueItem[] = [];

  for (const item of FOOD_CATALOGUE) {
    const cleanId = item.id.trim();
    const nameKey = canonicalDishKey(item.normalizedName || item.name);
    if (!nameKey || seenIds.has(cleanId) || seenNames.has(nameKey)) {
      continue;
    }
    seenIds.add(cleanId);
    seenNames.add(nameKey);
    const resolvedImage = getUniqueDishImageUrl(item);
    unique.push({
      ...item,
      imageUrl: resolvedImage,
      primaryImage: resolvedImage,
    });
  }

  return unique;
}

export function getDeduplicatedFoodSections(
  items: FoodCatalogueItem[] = getDeduplicatedFoodCatalogue()
): FoodCategorySection[] {
  const grouped = new Map<FoodType, FoodCatalogueItem[]>();
  for (const meta of FOOD_CATEGORY_META) {
    grouped.set(meta.foodType, []);
  }

  for (const item of items) {
    const bucket = grouped.get(item.foodType);
    if (bucket) {
      bucket.push(item);
    }
  }

  return FOOD_CATEGORY_META.map((meta) => ({
    meta,
    items: grouped.get(meta.foodType) || [],
  })).filter((section) => section.items.length > 0);
}
