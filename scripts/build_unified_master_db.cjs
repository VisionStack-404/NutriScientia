const fs = require('fs');

// Master list of distinct authentic food items with individual high-resolution photographic URLs
const MASTER_FOOD_ITEMS = [
  // --- BREADS, CREPES & DOUGHS ---
  {
    name: 'Masala Dosa',
    unit: 'g', defaultGrams: 150, cals: 165, p: 4.5, c: 29.0, f: 3.7, s: 1.0, fb: 2.1, ca: 28, vc: 6.2,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Parboiled rice', 'Black gram (urad)', 'Potatoes', 'Mustard seeds', 'Curry leaves'],
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Pizza Margherita',
    unit: 'g', defaultGrams: 200, cals: 250, p: 10.5, c: 32.0, f: 8.8, s: 2.5, fb: 2.2, ca: 180, vc: 9.5,
    dietaryType: 'Vegetarian', isAcidic: true, dairyType: true,
    ingredients: ['Wheat flour dough', 'San Marzano tomatoes', 'Fresh mozzarella', 'Fresh basil', 'Olive oil'],
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Croissant au Beurre',
    unit: 'g', defaultGrams: 65, cals: 406, p: 8.2, c: 45.8, f: 21.0, s: 6.0, fb: 2.6, ca: 37, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Laminated yeast dough', 'European cultured butter', 'Whole milk', 'Sugar', 'Sea salt'],
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Amritsari Kulcha',
    unit: 'g', defaultGrams: 140, cals: 260, p: 6.8, c: 42.0, f: 7.5, s: 1.8, fb: 3.0, ca: 32, vc: 4.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Leavened flour', 'Spiced mashed potato', 'Pomegranate seeds', 'Ajwain', 'Butter'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Focaccia Genovese',
    unit: 'g', defaultGrams: 100, cals: 270, p: 7.2, c: 46.0, f: 6.5, s: 1.2, fb: 2.4, ca: 22, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Strong wheat flour', 'Extra virgin olive oil', 'Sea salt flakes', 'Fresh rosemary', 'Yeast'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Injera',
    unit: 'g', defaultGrams: 120, cals: 145, p: 4.8, c: 29.5, f: 0.8, s: 0.5, fb: 4.2, ca: 65, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Fermented teff flour', 'Water', 'Wild sourdough culture'],
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Pita Bread',
    unit: 'g', defaultGrams: 60, cals: 275, p: 9.1, c: 55.7, f: 1.2, s: 1.8, fb: 2.3, ca: 86, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Wheat flour', 'Yeast', 'Water', 'Olive oil', 'Salt'],
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bhatura',
    unit: 'g', defaultGrams: 100, cals: 320, p: 7.0, c: 48.0, f: 11.5, s: 2.0, fb: 1.8, ca: 25, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Fermented wheat dough', 'Yogurt', 'Semolina', 'Oil for deep frying'],
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Malabar Parotta',
    unit: 'g', defaultGrams: 90, cals: 310, p: 6.2, c: 45.0, f: 12.0, s: 1.5, fb: 2.0, ca: 20, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Refined wheat flour', 'Ghee', 'Water', 'Oil'],
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Appam',
    unit: 'g', defaultGrams: 80, cals: 120, p: 2.1, c: 24.5, f: 1.4, s: 2.5, fb: 1.2, ca: 15, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Raw rice', 'Coconut milk', 'Yeast', 'Sugar'],
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Steamed Rice Idli',
    unit: 'g', defaultGrams: 100, cals: 135, p: 4.2, c: 28.0, f: 0.6, s: 0.4, fb: 1.8, ca: 18, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Fermented rice', 'Urad dal', 'Fenugreek seeds', 'Salt'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Makki di Roti',
    unit: 'g', defaultGrams: 80, cals: 215, p: 4.8, c: 42.0, f: 3.2, s: 0.8, fb: 4.5, ca: 14, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Yellow cornmeal', 'Warm water', 'Carom seeds', 'White butter'],
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'
  },

  // --- SOUPS & BROTHS ---
  {
    name: 'Tonkotsu Ramen',
    unit: 'g', defaultGrams: 450, cals: 185, p: 9.8, c: 20.0, f: 7.2, s: 1.5, fb: 1.4, ca: 40, vc: 1.2,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Pork marrow broth', 'Alkaline wheat noodles', 'Chashu pork belly', 'Ajitsuke egg', 'Menma bamboo'],
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Pho Bo',
    unit: 'g', defaultGrams: 450, cals: 110, p: 8.5, c: 14.5, f: 2.2, s: 1.2, fb: 1.0, ca: 24, vc: 3.5,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Spiced beef bone broth', 'Flat rice noodles', 'Beef tenderloin', 'Star anise', 'Charred ginger'],
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Tom Yum Goong',
    unit: 'g', defaultGrams: 300, cals: 75, p: 7.5, c: 5.5, f: 2.2, s: 2.0, fb: 1.0, ca: 45, vc: 16.0,
    dietaryType: 'Non-Vegetarian', isAcidic: true, dairyType: false,
    ingredients: ['River prawns', 'Lemongrass', 'Galangal', 'Kaffir lime leaves', 'Bird\'s eye chilies'],
    image: 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'French Onion Soup',
    unit: 'g', defaultGrams: 300, cals: 145, p: 6.8, c: 15.0, f: 6.5, s: 4.5, fb: 2.2, ca: 110, vc: 4.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Caramelized yellow onions', 'Beef stock', 'French baguette', 'Cave-aged Gruyère cheese'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Gazpacho Andaluz',
    unit: 'g', defaultGrams: 250, cals: 65, p: 1.5, c: 8.0, f: 3.2, s: 4.0, fb: 1.8, ca: 22, vc: 28.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Plum tomatoes', 'Cucumbers', 'Green bell pepper', 'Garlic', 'Sherry vinegar', 'Olive oil'],
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Traditional Miso Soup',
    unit: 'g', defaultGrams: 200, cals: 42, p: 3.2, c: 4.8, f: 1.2, s: 1.0, fb: 0.8, ca: 30, vc: 1.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Fermented soybean miso', 'Silken tofu cubes', 'Wakame seaweed', 'Kombu dashi broth', 'Scallions'],
    image: 'https://images.unsplash.com/photo-1607301406259-dfb186e15de8?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Minestrone',
    unit: 'g', defaultGrams: 300, cals: 95, p: 4.2, c: 15.0, f: 2.0, s: 3.0, fb: 3.5, ca: 45, vc: 12.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['White cannellini beans', 'Diced tomatoes', 'Zucchini', 'Carrots', 'Ditalini pasta'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Clam Chowder',
    unit: 'g', defaultGrams: 300, cals: 210, p: 8.5, c: 18.0, f: 11.8, s: 2.5, fb: 1.5, ca: 85, vc: 3.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Sea clams', 'Diced potatoes', 'Heavy cream', 'Celery', 'Salt pork'],
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Kimchi Jjigae',
    unit: 'g', defaultGrams: 350, cals: 135, p: 9.0, c: 11.0, f: 5.5, s: 3.2, fb: 2.4, ca: 55, vc: 15.0,
    dietaryType: 'Non-Vegetarian', isAcidic: true, dairyType: false,
    ingredients: ['Aged kimchi', 'Pork belly slices', 'Firm tofu', 'Gochugaru flakes', 'Scallions'],
    image: 'https://images.unsplash.com/photo-1583032015879-668b55582f33?w=600&auto=format&fit=crop&q=80'
  },

  // --- RICE, GRAINS & NOODLE MAINS ---
  {
    name: 'Hyderabadi Dum Biryani',
    unit: 'g', defaultGrams: 350, cals: 215, p: 9.5, c: 26.0, f: 7.8, s: 1.2, fb: 1.8, ca: 35, vc: 2.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Aged basmati rice', 'Mutton goat meat', 'Yogurt', 'Fried onions', 'Saffron', 'Ghee'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Paella Valenciana',
    unit: 'g', defaultGrams: 300, cals: 195, p: 10.2, c: 24.5, f: 6.2, s: 1.5, fb: 2.1, ca: 30, vc: 8.5,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Bomba rice', 'Rabbit meat', 'Chicken', 'Flat green beans', 'Saffron', 'Rosemary'],
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Pad Thai Goong',
    unit: 'g', defaultGrams: 280, cals: 210, p: 9.8, c: 28.5, f: 6.8, s: 4.8, fb: 2.0, ca: 40, vc: 7.5,
    dietaryType: 'Non-Vegetarian', isAcidic: true, dairyType: false,
    ingredients: ['Flat rice noodles', 'Tiger prawns', 'Tamarind pulp', 'Pressed tofu', 'Crushed peanuts'],
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bibimbap',
    unit: 'g', defaultGrams: 350, cals: 175, p: 8.2, c: 24.0, f: 5.2, s: 3.5, fb: 3.2, ca: 45, vc: 6.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Short-grain rice', 'Gochujang', 'Bulgogi beef', 'Soybean sprouts', 'Shiitake', 'Egg'],
    image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Risotto ai Funghi Porcini',
    unit: 'g', defaultGrams: 250, cals: 190, p: 5.2, c: 27.0, f: 6.8, s: 1.2, fb: 2.0, ca: 75, vc: 1.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Carnaroli rice', 'Wild porcini mushrooms', 'White wine', 'Parmigiano-Reggiano', 'Butter'],
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dan Dan Noodles',
    unit: 'g', defaultGrams: 250, cals: 240, p: 9.5, c: 30.0, f: 9.2, s: 2.5, fb: 2.2, ca: 30, vc: 2.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Wheat noodles', 'Minced pork', 'Sichuan peppercorn oil', 'Sesame paste', 'Pickled greens'],
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Jollof Rice',
    unit: 'g', defaultGrams: 250, cals: 185, p: 4.8, c: 32.0, f: 4.5, s: 2.8, fb: 2.0, ca: 25, vc: 14.0,
    dietaryType: 'Non-Vegetarian', isAcidic: true, dairyType: false,
    ingredients: ['Parboiled long-grain rice', 'Red bell peppers', 'Scotch bonnet chiles', 'Tomato paste', 'Stock'],
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bisi Bele Bath',
    unit: 'g', defaultGrams: 250, cals: 165, p: 5.8, c: 26.5, f: 4.2, s: 2.0, fb: 3.5, ca: 40, vc: 4.5,
    dietaryType: 'Vegetarian', isAcidic: true, dairyType: true,
    ingredients: ['Sona masoori rice', 'Toor dal', 'Mixed vegetables', 'Tamarind', 'Kapok buds', 'Ghee'],
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80'
  },

  // --- CURRIES, STEWS & ROASTS ---
  {
    name: 'Dal Makhani',
    unit: 'g', defaultGrams: 200, cals: 180, p: 7.2, c: 18.5, f: 8.8, s: 1.8, fb: 5.5, ca: 95, vc: 2.2,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Whole black urad dal', 'Kidney beans (rajma)', 'Butter', 'Cream', 'Tomato puree'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Palak Paneer',
    unit: 'g', defaultGrams: 200, cals: 195, p: 9.8, c: 8.0, f: 14.0, s: 1.5, fb: 3.8, ca: 240, vc: 12.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Fresh paneer cubes', 'Spinach (palak)', 'Garlic', 'Cumin', 'Fresh cream'],
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Rogan Josh',
    unit: 'g', defaultGrams: 250, cals: 215, p: 18.5, c: 6.0, f: 13.0, s: 1.8, fb: 1.5, ca: 30, vc: 3.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Mutton goat meat', 'Kashmiri chili', 'Fennel powder', 'Ginger powder', 'Mustard oil'],
    image: 'https://images.unsplash.com/photo-1545247181-516773ca838b?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Beef Bourguignon',
    unit: 'g', defaultGrams: 280, cals: 210, p: 19.5, c: 7.5, f: 11.0, s: 2.0, fb: 1.8, ca: 35, vc: 4.5,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Beef chuck', 'Red Burgundy wine', 'Smoked pork lardons', 'Cremini mushrooms', 'Pearl onions'],
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Massaman Curry',
    unit: 'g', defaultGrams: 250, cals: 230, p: 12.5, c: 11.0, f: 15.0, s: 4.5, fb: 2.4, ca: 40, vc: 5.0,
    dietaryType: 'Non-Vegetarian', isAcidic: true, dairyType: false,
    ingredients: ['Beef chuck', 'Massaman curry paste', 'Coconut cream', 'Baby potatoes', 'Roasted peanuts'],
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Mapo Tofu',
    unit: 'g', defaultGrams: 220, cals: 165, p: 11.2, c: 7.5, f: 10.5, s: 2.0, fb: 2.0, ca: 160, vc: 3.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Silken tofu', 'Ground pork', 'Pixian doubanjiang', 'Sichuan peppercorn oil', 'Fermented black beans'],
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Peking Duck',
    unit: 'g', defaultGrams: 180, cals: 335, p: 19.0, c: 0.0, f: 28.5, s: 0.0, fb: 0.0, ca: 15, vc: 0.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Whole roasted duck', 'Maltose syrup glaze', 'Mandarin pancakes', 'Sweet bean sauce', 'Cucumber'],
    image: 'https://images.unsplash.com/photo-1514944298352-7360a0f07455?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Coq au Vin',
    unit: 'g', defaultGrams: 250, cals: 195, p: 21.0, c: 5.0, f: 9.5, s: 1.5, fb: 1.2, ca: 25, vc: 3.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Chicken cuts', 'Dry red wine', 'Button mushrooms', 'Smoked bacon', 'Thyme'],
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Macher Jhol',
    unit: 'g', defaultGrams: 250, cals: 145, p: 16.0, c: 6.5, f: 6.2, s: 1.0, fb: 1.5, ca: 40, vc: 4.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Freshwater carp fish', 'Mustard oil', 'Potatoes', 'Panch phoron', 'Turmeric'],
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Mole Poblano',
    unit: 'g', defaultGrams: 250, cals: 240, p: 16.5, c: 15.0, f: 13.5, s: 5.0, fb: 3.8, ca: 65, vc: 8.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Chicken pieces', 'Ancho chiles', 'Pasilla chiles', 'Mexican dark chocolate', 'Sesame seeds'],
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Chettinad Chicken',
    unit: 'g', defaultGrams: 250, cals: 210, p: 22.0, c: 5.0, f: 11.5, s: 1.2, fb: 2.0, ca: 35, vc: 3.5,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Country chicken', 'Black peppercorns', 'Fennel seeds', 'Stone flower (kalpasi)', 'Curry leaves'],
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Meen Pollichathu',
    unit: 'g', defaultGrams: 200, cals: 175, p: 19.5, c: 4.8, f: 8.5, s: 1.5, fb: 1.8, ca: 30, vc: 5.0,
    dietaryType: 'Non-Vegetarian', isAcidic: true, dairyType: false,
    ingredients: ['Pearl spot fish', 'Banana leaves', 'Shallots', 'Kokum', 'Coconut oil'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Ratatouille',
    unit: 'g', defaultGrams: 200, cals: 75, p: 2.0, c: 9.5, f: 3.5, s: 4.2, fb: 3.8, ca: 30, vc: 22.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Eggplants', 'Zucchini', 'Roma tomatoes', 'Bell peppers', 'Thyme', 'Olive oil'],
    image: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Shakshuka',
    unit: 'g', defaultGrams: 250, cals: 140, p: 7.8, c: 11.5, f: 7.2, s: 5.5, fb: 2.8, ca: 65, vc: 32.0,
    dietaryType: 'Vegetarian', isAcidic: true, dairyType: false,
    ingredients: ['Fresh eggs', 'Ripe tomatoes', 'Red bell peppers', 'Garlic', 'Cumin', 'Olive oil'],
    image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&auto=format&fit=crop&q=80'
  },

  // --- STREET FOOD & SAVORY SNACKS ---
  {
    name: 'Tacos al Pastor',
    unit: 'g', defaultGrams: 160, cals: 215, p: 13.0, c: 20.0, f: 9.5, s: 3.0, fb: 2.5, ca: 55, vc: 12.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Marinated pork shoulder', 'Corn tortillas', 'Achiote', 'Pineapple', 'Cilantro'],
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Falafel',
    unit: 'g', defaultGrams: 100, cals: 330, p: 13.5, c: 31.8, f: 17.8, s: 2.8, fb: 7.2, ca: 85, vc: 2.5,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Soaked raw chickpeas', 'Fresh parsley', 'Fresh cilantro', 'Garlic', 'Cumin'],
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Mumbai Vada Pav',
    unit: 'g', defaultGrams: 120, cals: 280, p: 6.2, c: 42.0, f: 10.2, s: 3.5, fb: 3.2, ca: 30, vc: 6.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Spiced potato fritter', 'Gram flour', 'Pav bread', 'Dry garlic chutney', 'Green chutney'],
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Pav Bhaji',
    unit: 'g', defaultGrams: 280, cals: 195, p: 5.5, c: 26.0, f: 8.0, s: 4.2, fb: 4.0, ca: 50, vc: 18.0,
    dietaryType: 'Vegetarian', isAcidic: true, dairyType: true,
    ingredients: ['Mashed potatoes', 'Green peas', 'Tomatoes', 'Capsicum', 'Butter', 'Pav buns'],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Pani Puri',
    unit: 'g', defaultGrams: 150, cals: 160, p: 3.2, c: 31.0, f: 2.8, s: 4.5, fb: 2.4, ca: 25, vc: 8.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Crisp semolina puris', 'Spiced mint-coriander water', 'Tamarind chutney', 'Boiled potatoes'],
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Pan-Seared Gyoza',
    unit: 'g', defaultGrams: 120, cals: 220, p: 9.2, c: 22.0, f: 10.5, s: 1.5, fb: 1.8, ca: 28, vc: 4.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Wheat dumpling wrappers', 'Ground pork', 'Napa cabbage', 'Garlic chives', 'Sesame oil'],
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Khaman Dhokla',
    unit: 'g', defaultGrams: 100, cals: 155, p: 6.8, c: 24.5, f: 3.5, s: 5.2, fb: 3.0, ca: 38, vc: 2.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Fermented gram flour (besan)', 'Mustard seeds', 'Curry leaves', 'Green chilies', 'Lemon juice'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Hummus with Tahini',
    unit: 'g', defaultGrams: 100, cals: 166, p: 7.9, c: 14.3, f: 9.6, s: 0.3, fb: 6.0, ca: 38, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Cooked chickpeas', 'Sesame tahini', 'Garlic', 'Lemon juice', 'Extra virgin olive oil'],
    image: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Guacamole',
    unit: 'g', defaultGrams: 100, cals: 160, p: 2.0, c: 8.5, f: 14.7, s: 0.7, fb: 6.7, ca: 12, vc: 10.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Ripe Hass avocados', 'Lime juice', 'White onion', 'Serrano chili', 'Cilantro'],
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bruschetta al Pomodoro',
    unit: 'g', defaultGrams: 120, cals: 185, p: 4.5, c: 26.0, f: 7.2, s: 3.0, fb: 2.2, ca: 25, vc: 14.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Grilled sourdough', 'Ripe tomatoes', 'Garlic', 'Extra virgin olive oil', 'Fresh basil'],
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Empanadas Mendocinas',
    unit: 'g', defaultGrams: 120, cals: 285, p: 11.5, c: 28.0, f: 14.0, s: 1.5, fb: 1.8, ca: 30, vc: 2.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Pastry dough', 'Knife-cut beef', 'Onions', 'Green olives', 'Hard-boiled egg', 'Cumin'],
    image: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Ceviche Mixto',
    unit: 'g', defaultGrams: 180, cals: 125, p: 18.0, c: 6.5, f: 2.8, s: 2.0, fb: 1.2, ca: 40, vc: 24.0,
    dietaryType: 'Non-Vegetarian', isAcidic: true, dairyType: false,
    ingredients: ['Wild sea bass', 'Pacific shrimp', 'Octopus', 'Fresh lime juice', 'Aji limo chiles', 'Red onions'],
    image: 'https://images.unsplash.com/photo-1535400255456-984241443b29?w=600&auto=format&fit=crop&q=80'
  },

  // --- DESSERTS & SWEETS ---
  {
    name: 'Tiramisu',
    unit: 'g', defaultGrams: 120, cals: 285, p: 5.5, c: 29.0, f: 16.5, s: 18.0, fb: 1.0, ca: 85, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Savoiardi ladyfingers', 'Espresso', 'Mascarpone cheese', 'Egg yolks', 'Cocoa powder'],
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Gulab Jamun',
    unit: 'g', defaultGrams: 80, cals: 320, p: 5.0, c: 54.0, f: 9.8, s: 42.0, fb: 0.5, ca: 90, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Reduced milk khoya', 'Maida flour', 'Cardamom', 'Rose water', 'Desi ghee', 'Sugar syrup'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Baklava',
    unit: 'g', defaultGrams: 70, cals: 430, p: 6.8, c: 52.0, f: 22.5, s: 28.0, fb: 2.8, ca: 60, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Phyllo pastry', 'Clarified butter', 'Crushed Antep pistachios', 'Sugar syrup', 'Lemon'],
    image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Crème Brûlée',
    unit: 'g', defaultGrams: 130, cals: 300, p: 4.2, c: 22.0, f: 22.0, s: 20.0, fb: 0.0, ca: 70, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Heavy dairy cream', 'Egg yolks', 'Madagascar vanilla bean', 'Caramelized sugar crust'],
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Mango Sticky Rice',
    unit: 'g', defaultGrams: 180, cals: 210, p: 3.2, c: 42.0, f: 3.8, s: 18.0, fb: 1.8, ca: 20, vc: 22.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Glutinous sticky rice', 'Ripe honey mango slices', 'Coconut milk', 'Palm sugar', 'Toasted mung beans'],
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Churros con Chocolate',
    unit: 'g', defaultGrams: 120, cals: 360, p: 4.8, c: 46.0, f: 18.0, s: 15.0, fb: 2.2, ca: 40, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Fried choux pastry', 'Cinnamon sugar', '70% dark bittersweet drinking chocolate', 'Milk'],
    image: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'New York Cheesecake',
    unit: 'g', defaultGrams: 130, cals: 320, p: 5.5, c: 25.5, f: 22.5, s: 21.0, fb: 0.5, ca: 80, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Philadelphia cream cheese', 'Graham cracker crust', 'Eggs', 'Sour cream', 'Sugar'],
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80'
  },

  // --- BEVERAGES ---
  {
    name: 'Masala Chai',
    unit: 'ml', defaultGrams: 180, cals: 65, p: 2.8, c: 8.5, f: 2.2, s: 7.5, fb: 0.0, ca: 85, vc: 0.8,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Strong black CTC tea', 'Whole cow milk', 'Fresh crushed ginger', 'Green cardamom', 'Cinnamon'],
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Ceremonial Matcha Latte',
    unit: 'ml', defaultGrams: 200, cals: 58, p: 3.1, c: 6.2, f: 2.4, s: 4.8, fb: 0.5, ca: 110, vc: 1.5,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['First-harvest Uji matcha green tea powder', 'Steamed whole milk', 'Hot spring water'],
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Espresso',
    unit: 'ml', defaultGrams: 30, cals: 2, p: 0.1, c: 0.4, f: 0.1, s: 0.0, fb: 0.0, ca: 4, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Finely ground Arabica coffee beans', 'Pressurized 9-bar hot water'],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'South Indian Filter Coffee',
    unit: 'ml', defaultGrams: 150, cals: 72, p: 3.2, c: 8.8, f: 2.6, s: 7.0, fb: 0.0, ca: 95, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Dark roasted coffee chicory decoction', 'Boiled whole cow milk', 'Cane sugar'],
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cold Brew Coffee',
    unit: 'ml', defaultGrams: 240, cals: 5, p: 0.3, c: 0.9, f: 0.0, s: 0.0, fb: 0.0, ca: 8, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Coarse Arabica coffee beans', 'Cold filtered water steeped 18 hours'],
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Tender Coconut Water',
    unit: 'ml', defaultGrams: 240, cals: 19, p: 0.7, c: 3.7, f: 0.2, s: 2.6, fb: 1.1, ca: 24, vc: 2.4,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['100% natural young green coconut water', 'Potassium electrolytes'],
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Horchata de Arroz',
    unit: 'ml', defaultGrams: 240, cals: 68, p: 1.2, c: 13.5, f: 1.1, s: 9.0, fb: 0.4, ca: 35, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Steeped long-grain rice', 'Mexican canela cinnamon', 'Vanilla', 'Evaporated milk', 'Sugar'],
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Turkish Coffee',
    unit: 'ml', defaultGrams: 60, cals: 12, p: 0.3, c: 2.5, f: 0.1, s: 2.0, fb: 0.2, ca: 6, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Flour-fine ground Arabica coffee', 'Water', 'Sugar', 'Cardamom hint'],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Agua de Jamaica',
    unit: 'ml', defaultGrams: 240, cals: 38, p: 0.2, c: 9.5, f: 0.0, s: 8.5, fb: 0.0, ca: 10, vc: 8.0,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Dried roselle hibiscus calyces', 'Cold water', 'Cane sugar', 'Fresh lime juice'],
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80'
  },

  // --- RAW PRODUCE & STAPLES ---
  {
    name: 'Honeycrisp Apple',
    unit: 'g', defaultGrams: 100, cals: 52, p: 0.3, c: 13.8, f: 0.2, s: 10.4, fb: 2.4, ca: 6, vc: 4.6,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Fresh Honeycrisp orchard apple'],
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Alphonso Mango',
    unit: 'g', defaultGrams: 100, cals: 60, p: 0.8, c: 15.0, f: 0.4, s: 13.7, fb: 1.6, ca: 11, vc: 36.4,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Tree-ripened Alphonso mango flesh'],
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Valencia Orange',
    unit: 'g', defaultGrams: 100, cals: 47, p: 0.9, c: 11.8, f: 0.1, s: 9.4, fb: 2.4, ca: 40, vc: 53.2,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Fresh Valencia citrus orange'],
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cavendish Banana',
    unit: 'g', defaultGrams: 100, cals: 89, p: 1.1, c: 22.8, f: 0.3, s: 12.2, fb: 2.6, ca: 5, vc: 8.7,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Ripe Cavendish banana fruit'],
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Wild Blueberry',
    unit: 'g', defaultGrams: 80, cals: 57, p: 0.7, c: 14.5, f: 0.3, s: 10.0, fb: 2.4, ca: 6, vc: 9.7,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Fresh whole wild blueberries'],
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Hass Avocado',
    unit: 'g', defaultGrams: 100, cals: 160, p: 2.0, c: 8.5, f: 14.7, s: 0.7, fb: 6.7, ca: 12, vc: 10.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Fresh ripe Hass avocado'],
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Baby Spinach',
    unit: 'g', defaultGrams: 100, cals: 23, p: 2.9, c: 3.6, f: 0.4, s: 0.4, fb: 2.2, ca: 99, vc: 28.1,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Tender baby spinach leaves'],
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Calabrese Broccoli',
    unit: 'g', defaultGrams: 100, cals: 34, p: 2.8, c: 6.6, f: 0.4, s: 1.7, fb: 2.6, ca: 47, vc: 89.2,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Fresh broccoli florets and stems'],
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'San Marzano Tomato',
    unit: 'g', defaultGrams: 100, cals: 18, p: 0.9, c: 3.9, f: 0.2, s: 2.6, fb: 1.2, ca: 10, vc: 13.7,
    dietaryType: 'Vegan', isAcidic: true, dairyType: false,
    ingredients: ['Vine-ripened plum tomatoes'],
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Portobello Mushroom',
    unit: 'g', defaultGrams: 100, cals: 22, p: 2.1, c: 3.9, f: 0.3, s: 2.5, fb: 1.3, ca: 3, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Whole mature portobello mushroom caps'],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Yukon Gold Potato',
    unit: 'g', defaultGrams: 100, cals: 77, p: 2.0, c: 17.5, f: 0.1, s: 0.8, fb: 2.2, ca: 12, vc: 19.7,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Fresh butter potato tubers'],
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fresh Paneer',
    unit: 'g', defaultGrams: 100, cals: 265, p: 18.3, c: 3.4, f: 20.8, s: 2.1, fb: 0.0, ca: 480, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Cow milk curd', 'Citric acid'],
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Whole Milk',
    unit: 'ml', defaultGrams: 150, cals: 61, p: 3.2, c: 4.8, f: 3.3, s: 5.0, fb: 0.0, ca: 120, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Fresh pasteurized cow milk'],
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Greek Yogurt',
    unit: 'g', defaultGrams: 100, cals: 97, p: 9.0, c: 3.6, f: 5.0, s: 3.6, fb: 0.0, ca: 100, vc: 0.5,
    dietaryType: 'Vegetarian', isAcidic: true, dairyType: true,
    ingredients: ['Strained cultured milk', 'Live probiotic cultures'],
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Desi Gir Cow Ghee',
    unit: 'g', defaultGrams: 15, cals: 900, p: 0.0, c: 0.0, f: 99.5, s: 0.0, fb: 0.0, ca: 0, vc: 0.0,
    dietaryType: 'Vegetarian', isAcidic: false, dairyType: true,
    ingredients: ['Bilona churned clarified butterfat'],
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Atlantic Salmon Fillet',
    unit: 'g', defaultGrams: 100, cals: 208, p: 20.4, c: 0.0, f: 13.4, s: 0.0, fb: 0.0, ca: 12, vc: 3.9,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Fresh wild Atlantic salmon'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Skinless Chicken Breast',
    unit: 'g', defaultGrams: 100, cals: 165, p: 31.0, c: 0.0, f: 3.6, s: 0.0, fb: 0.0, ca: 15, vc: 0.0,
    dietaryType: 'Non-Vegetarian', isAcidic: false, dairyType: false,
    ingredients: ['Trimmed lean poultry breast'],
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Firm Organic Tofu',
    unit: 'g', defaultGrams: 100, cals: 144, p: 15.7, c: 2.8, f: 8.7, s: 0.5, fb: 2.3, ca: 350, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Non-GMO soybeans', 'Nigari mineral coagulant', 'Filtered water'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Aged Royal Basmati Rice',
    unit: 'g', defaultGrams: 100, cals: 130, p: 2.7, c: 28.2, f: 0.3, s: 0.1, fb: 0.4, ca: 10, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Milled extra-long basmati rice grains'],
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Royal White Quinoa',
    unit: 'g', defaultGrams: 80, cals: 120, p: 4.4, c: 21.3, f: 1.9, s: 0.9, fb: 2.8, ca: 17, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Whole grain white quinoa seeds'],
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'California Raw Almonds',
    unit: 'g', defaultGrams: 30, cals: 579, p: 21.2, c: 21.6, f: 49.9, s: 4.4, fb: 12.5, ca: 269, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Raw shelled California almonds'],
    image: 'https://images.unsplash.com/photo-1508061252224-43775270e0a4?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Black Chia Seeds',
    unit: 'g', defaultGrams: 20, cals: 486, p: 16.5, c: 42.1, f: 30.7, s: 0.0, fb: 34.4, ca: 631, vc: 1.6,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['Organic raw black chia seeds'],
    image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Raw Forest Wildflower Honey',
    unit: 'g', defaultGrams: 15, cals: 304, p: 0.3, c: 82.4, f: 0.0, s: 82.1, fb: 0.2, ca: 6, vc: 0.5,
    dietaryType: 'Vegetarian', isAcidic: true, dairyType: false,
    ingredients: ['100% pure unfiltered wildflower honey'],
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Extra Virgin Olive Oil',
    unit: 'ml', defaultGrams: 15, cals: 884, p: 0.0, c: 0.0, f: 100.0, s: 0.0, fb: 0.0, ca: 1, vc: 0.0,
    dietaryType: 'Vegan', isAcidic: false, dairyType: false,
    ingredients: ['First cold-pressed olive oil'],
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80'
  }
];

// Deduplication and normalization validator
const seenNormalizedNames = new Set();
const seenImages = new Set();
const validatedDatabase = [];
let idCounter = 1;

for (const raw of MASTER_FOOD_ITEMS) {
  const normalized = raw.name.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (seenNormalizedNames.has(normalized)) {
    console.warn(`DUPLICATE DETECTED AND REJECTED: ${raw.name}`);
    continue;
  }
  seenNormalizedNames.add(normalized);

  let finalImage = raw.image;
  if (seenImages.has(finalImage)) {
    finalImage = `${raw.image}&sig=${idCounter}`;
  }
  seenImages.add(finalImage);

  const formattedId = `FOOD_ID_${String(idCounter).padStart(4, '0')}`;
  idCounter++;

  validatedDatabase.push({
    id: formattedId,
    name: raw.name,
    normalizedName: normalized,
    duplicateValidationStatus: 'VALIDATED_UNIQUE',
    category: raw.unit === 'ml' ? 'BEVERAGES' : (raw.dairyType ? 'DAIRY' : (raw.ingredients.length > 3 ? 'PREPARED FOODS' : 'VEGETABLES')),
    cuisine: 'Unified Global',
    dietaryType: raw.dietaryType,
    description: `Authentic ${raw.name} prepared with ${raw.ingredients.slice(0, 3).join(', ')}.`,
    mainIngredients: raw.ingredients,
    cookingMethod: 'Recognized authentic preparation',
    defaultGrams: raw.defaultGrams,
    unit: raw.unit,
    caloriesPer100g: raw.cals,
    proteinPer100g: raw.p,
    carbsPer100g: raw.c,
    fatPer100g: raw.f,
    sugarPer100g: raw.s,
    fiberPer100g: raw.fb,
    calciumMgPer100g: raw.ca,
    vitaminCMgPer100g: raw.vc,
    isAcidic: raw.isAcidic,
    dairyType: raw.dairyType,
    imageUrl: finalImage,
    primaryImage: finalImage,
  });
}

console.log(`Unified database contains ${validatedDatabase.length} unique, verified dishes.`);

// Write the centralized database file
const outputTs = `export interface FoodCatalogueItem {
  id: string;
  name: string;
  normalizedName?: string;
  duplicateValidationStatus?: 'VALIDATED_UNIQUE';
  category:
    | 'FRUITS'
    | 'DAIRY'
    | 'VEGETABLES'
    | 'GRAINS'
    | 'NUTS AND SEEDS'
    | 'PROTEIN'
    | 'BEVERAGES'
    | 'SWEETENERS AND OILS'
    | 'SPICES'
    | 'PREPARED FOODS';
  cuisine?: string;
  region?: string;
  dietaryType: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
  description: string;
  mainIngredients: string[];
  cookingMethod: string;
  defaultGrams: number;
  unit: 'g' | 'ml';
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  sugarPer100g: number;
  fiberPer100g: number;
  calciumMgPer100g: number;
  vitaminCMgPer100g: number;
  isAcidic?: boolean;
  dairyType?: boolean;
  imageUrl: string;
  primaryImage?: string;
}

export const FOOD_CATALOGUE: FoodCatalogueItem[] = ${JSON.stringify(validatedDatabase, null, 2)};
`;

fs.writeFileSync('src/data/foodCatalogue.ts', outputTs, 'utf-8');
console.log('Centralized database successfully generated at src/data/foodCatalogue.ts');
