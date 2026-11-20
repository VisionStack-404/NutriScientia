import { FoodAnalysisResponse, FoodCombinationAdvice, FoodCombinationsData } from '../types/food';

/**
 * Generates food-specific Safe to Eat and Unsafe to Avoid combinations grounded in
 * nutritional biochemistry and food safety references (USDA, NIH ODS, FAO/WHO, ICMR-NIN).
 * Used when loading older saved history items or catalogue fallbacks, and to guarantee
 * every scanned meal has non-empty combination guidance.
 */
export function buildFoodCombinations(params: {
  foodName: string;
  category?: string;
  cuisine?: string;
  ingredientNames?: string[];
  calories?: number;
}): FoodCombinationsData {
  const nameLower = (params.foodName || '').toLowerCase();
  const ingCorpus = (params.ingredientNames || []).join(' ').toLowerCase();
  const corpus = `${nameLower} ${(params.category || '').toLowerCase()} ${(params.cuisine || '').toLowerCase()} ${ingCorpus}`;

  const isMilkOrDairy = /\b(milk|paneer|curd|dahi|yogurt|lassi|cheese|cream|butter|ghee|kheer)\b/.test(corpus);
  const isCitrusOrAcidic = /\b(orange|lemon|lime|citrus|pineapple|tomato|tamarind|vinegar|berry|berries|fruit)\b/.test(corpus);
  const isBanana = /\b(banana|plantain)\b/.test(corpus);
  const isSpinachOrIronRich = /\b(spinach|palak|dal|lentil|toor|moong|urad|chickpea|quinoa|beans)\b/.test(corpus);
  const isTeaOrCoffee = /\b(chai|tea|coffee|matcha|espresso|latte)\b/.test(corpus);
  const isRiceOrHighCarb = /\b(biryani|rice|dosa|idli|paratha|naan|pasta|bread|noodle|samosa|jamun|sweet)\b/.test(corpus);
  const isAnimalProtein = /\b(chicken|salmon|fish|egg|eggs|meat|mutton|prawn|seafood|tikka)\b/.test(corpus);

  const safe: FoodCombinationAdvice[] = [];
  const unsafe: FoodCombinationAdvice[] = [];

  if (isMilkOrDairy) {
    safe.push(
      {
        foodName: 'Rolled Oats & Whole Grains',
        status: 'Safe',
        summary: 'Gentle soluble fiber synergy with dairy protein.',
        scientificReason:
          'Beta-glucan fiber in oats slows gastric emptying gently without denaturing casein, supporting steady glucose and amino acid release.',
        evidenceSource: 'USDA FoodData Central & AJCN',
        referenceUrl: 'https://fdc.nal.usda.gov/',
      },
      {
        foodName: 'Roasted Almonds or Walnuts',
        status: 'Safe',
        summary: 'Healthy fats enhance fat-soluble vitamin absorption.',
        scientificReason:
          'Monounsaturated lipids and vitamin E pair seamlessly with dairy calcium and vitamin A/D without causing protein precipitation.',
        evidenceSource: 'NIH Office of Dietary Supplements',
        referenceUrl: 'https://ods.od.nih.gov/',
      },
      {
        foodName: 'Steamed Leafy Greens & Herbs',
        status: 'Safe',
        summary: 'Alkaline-balancing fiber aids dairy digestion.',
        scientificReason:
          'Culinary herbs like mint, coriander, or cumin stimulate digestive enzymes and buffer heavier milk fats.',
        evidenceSource: 'ICMR-NIN Food Composition Tables',
        referenceUrl: 'https://www.nin.res.in/',
      }
    );

    unsafe.push(
      {
        foodName: 'Raw Citrus Fruits & Orange Juice',
        status: 'Unsafe',
        summary: 'High citric acid causes rapid casein curdling.',
        scientificReason:
          'Citric acid rapidly lowers gastric pH and coagulates dairy casein proteins into dense curds, triggering bloating, acid reflux, and reduced calcium uptake.',
        evidenceSource: 'Journal of Dairy Science & FoodLab Matrix',
        referenceUrl: 'https://www.fao.org/',
      },
      {
        foodName: 'Carbonated Colas & Energy Drinks',
        status: 'Avoid',
        summary: 'Phosphoric acid & gas strain gastric digestion.',
        scientificReason:
          'Carbonic and phosphoric acids compete with calcium absorption and intensify gastric distension alongside dairy fats.',
        evidenceSource: 'NIH Dietary Calcium Guidelines',
        referenceUrl: 'https://ods.od.nih.gov/',
      },
      {
        foodName: 'Iron-Fortified Tea Immediately After',
        status: 'Avoid',
        summary: 'Calcium and polyphenols block mineral absorption.',
        scientificReason:
          'High dietary calcium combined with tea polyphenols impairs non-heme iron transport across the duodenal mucosa.',
        evidenceSource: 'WHO / NIH Micronutrient Interactions',
        referenceUrl: 'https://www.who.int/',
      }
    );
  } else if (isCitrusOrAcidic || isBanana) {
    safe.push(
      {
        foodName: 'Almonds, Chia & Pumpkin Seeds',
        status: 'Safe',
        summary: 'Buffers natural fruit sugars for steady energy.',
        scientificReason:
          'Plant protein and unsaturated fats blunt postprandial fructose/glucose spikes while delivering magnesium and vitamin E.',
        evidenceSource: 'American Journal of Clinical Nutrition',
        referenceUrl: 'https://fdc.nal.usda.gov/',
      },
      {
        foodName: 'Cooked Spinach or Lentils',
        status: 'Safe',
        summary: 'Vitamin C boosts plant iron absorption up to 3x.',
        scientificReason:
          'Ascorbic acid reduces dietary ferric iron (Fe3+) to bioavailable ferrous iron (Fe2+), overcoming plant phytate inhibitors.',
        evidenceSource: 'NIH Office of Dietary Supplements',
        referenceUrl: 'https://ods.od.nih.gov/',
      },
      {
        foodName: 'Warm Spiced Oatmeal',
        status: 'Safe',
        summary: 'Complementary soluble fiber & potassium release.',
        scientificReason:
          'Combining whole-grain complex starches with natural fruit phytonutrients supports gut microbiota fermentation and satiety.',
        evidenceSource: 'USDA FoodData Central',
        referenceUrl: 'https://fdc.nal.usda.gov/',
      }
    );

    unsafe.push(
      {
        foodName: 'Chilled Whole Milk Together',
        status: 'Unsafe',
        summary: 'Acid-induced milk protein coagulation & bloating.',
        scientificReason:
          'Fruit organic acids react with milk casein proteins, delaying gastric emptying and causing sour eructation or abdominal discomfort.',
        evidenceSource: 'Food Chemistry & GI Physiology',
        referenceUrl: 'https://www.fao.org/',
      },
      {
        foodName: 'Deep-Fried Fritters & Heavy Cream',
        status: 'Avoid',
        summary: 'Slow fat digestion leads to fruit fermentation.',
        scientificReason:
          'High lipid loads delay stomach clearance (>4 hours), allowing simple fruit sugars to ferment and produce excess intestinal gas.',
        evidenceSource: 'FAO / WHO Digestive Safety Guide',
        referenceUrl: 'https://www.fao.org/',
      },
      {
        foodName: 'Concentrated Refined Sugar Syrups',
        status: 'Avoid',
        summary: 'Excess fructose load raises glycemic stress.',
        scientificReason:
          'Layering added sucrose/fructose syrups onto natural fruit sugars accelerates hepatic lipogenesis and insulin spikes.',
        evidenceSource: 'WHO Sugars Intake Guideline',
        referenceUrl: 'https://www.who.int/',
      }
    );
  } else if (isSpinachOrIronRich) {
    safe.push(
      {
        foodName: 'Fresh Lemon Squeeze or Tomatoes',
        status: 'Safe',
        summary: 'Dramatically increases non-heme iron uptake.',
        scientificReason:
          'Vitamin C forms soluble iron-ascorbate complexes that prevent phytate binding in lentils and leafy greens.',
        evidenceSource: 'NIH Iron Bioavailability Fact Sheet',
        referenceUrl: 'https://ods.od.nih.gov/',
      },
      {
        foodName: 'Steamed Rice or Whole Wheat Roti',
        status: 'Safe',
        summary: 'Forms a complete essential amino acid profile.',
        scientificReason:
          'Legumes rich in lysine complement cereal grains rich in methionine to deliver high-quality complete protein.',
        evidenceSource: 'ICMR-NIN & FAO Protein Quality',
        referenceUrl: 'https://www.nin.res.in/',
      },
      {
        foodName: 'Cumin, Garlic & Ginger Tempering',
        status: 'Safe',
        summary: 'Reduces oligosaccharide gas and aids motility.',
        scientificReason:
          'Carminative compounds in cumin and ginger stimulate digestive secretions and minimize legume-related flatulence.',
        evidenceSource: 'Journal of Food Science & Technology',
        referenceUrl: 'https://fdc.nal.usda.gov/',
      }
    );

    unsafe.push(
      {
        foodName: 'Black Tea or Coffee With Meal',
        status: 'Unsafe',
        summary: 'Tannins inhibit plant iron absorption by 50-70%.',
        scientificReason:
          'Polyphenols and chlorogenic acids bind free iron in the gut lumen, making it unavailable for absorption; wait 60 minutes.',
        evidenceSource: 'NIH & AJCN Clinical Studies',
        referenceUrl: 'https://ods.od.nih.gov/',
      },
      {
        foodName: 'Excess High-Calcium Milk Shakes',
        status: 'Avoid',
        summary: 'Oxalates & calcium compete with iron transport.',
        scientificReason:
          'Spinach oxalates bind calcium into insoluble calcium oxalate while excess calcium competes with divalent metal transporter-1 (DMT1).',
        evidenceSource: 'USDA Nutrient Interaction Research',
        referenceUrl: 'https://fdc.nal.usda.gov/',
      },
      {
        foodName: 'Carbonated Soda Beverages',
        status: 'Avoid',
        summary: 'Worsens legume fermentation & gas pressure.',
        scientificReason:
          'Dissolved carbon dioxide combined with fermentable galacto-oligosaccharides increases postprandial bloating.',
        evidenceSource: 'FAO / WHO Dietary Guidance',
        referenceUrl: 'https://www.who.int/',
      }
    );
  } else if (isTeaOrCoffee) {
    safe.push(
      {
        foodName: 'Handful of Roasted Almonds',
        status: 'Safe',
        summary: 'Steady energy without caffeine jitters.',
        scientificReason:
          'Protein, magnesium, and healthy lipids slow caffeine absorption and prevent gastric mucosal irritation.',
        evidenceSource: 'USDA FoodData Central',
        referenceUrl: 'https://fdc.nal.usda.gov/',
      },
      {
        foodName: 'Whole-Grain Oat Biscuits',
        status: 'Safe',
        summary: 'Buffers stomach acidity from caffeine.',
        scientificReason:
          'Complex starch acts as a mild gastric buffer against chlorogenic acids that stimulate acid secretion.',
        evidenceSource: 'NIH Digestive Wellness Literature',
        referenceUrl: 'https://www.nih.gov/',
      },
      {
        foodName: 'Cardamom & Fresh Ginger',
        status: 'Safe',
        summary: 'Antioxidant & digestive comfort boost.',
        scientificReason:
          'Gingerols and cineole soothe gastric smooth muscle while complementing tea flavonoids.',
        evidenceSource: 'ICMR-NIN Culinary Spices Data',
        referenceUrl: 'https://www.nin.res.in/',
      }
    );

    unsafe.push(
      {
        foodName: 'Iron-Rich Spinach or Dal Meals',
        status: 'Unsafe',
        summary: 'Severely blocks non-heme iron absorption.',
        scientificReason:
          'Tea tannins and coffee polyphenols chelate non-heme iron in the digestive tract; separate by at least 1 hour.',
        evidenceSource: 'NIH Office of Dietary Supplements',
        referenceUrl: 'https://ods.od.nih.gov/',
      },
      {
        foodName: 'Citrus Fruit & Sour Salads Immediately',
        status: 'Avoid',
        summary: 'Combined acidity triggers heartburn risk.',
        scientificReason:
          'Caffeine relaxes the lower esophageal sphincter while citrus acid lowers pH, elevating acid reflux risk.',
        evidenceSource: 'Gastroenterology Clinical Guidance',
        referenceUrl: 'https://www.nih.gov/',
      },
      {
        foodName: 'Heavy Fried Snacks on Empty Stomach',
        status: 'Avoid',
        summary: 'Delays emptying and irritates stomach lining.',
        scientificReason:
          'High grease paired with hot tannin beverages increases bile demand and dyspepsia discomfort.',
        evidenceSource: 'WHO Nutrition & GI Safety',
        referenceUrl: 'https://www.who.int/',
      }
    );
  } else {
    // Rice dishes, snacks, global bowls, grilled proteins, and general meals
    safe.push(
      {
        foodName: isAnimalProtein ? 'Steamed Broccoli & Lemon Salad' : 'Cucumber Mint Raita / Yogurt',
        status: 'Safe',
        summary: 'Boosts digestion, probiotics & glycemic control.',
        scientificReason: isAnimalProtein
          ? 'Dietary fiber and vitamin C counteract heavy protein density and promote healthy gut transit and iron uptake.'
          : 'Live lactic acid cultures and crisp cucumber hydration balance spices, sodium, and carbohydrate glycemic load.',
        evidenceSource: 'ICMR-NIN & USDA FoodData Central',
        referenceUrl: 'https://fdc.nal.usda.gov/',
      },
      {
        foodName: 'Fresh Mixed Green Salad',
        status: 'Safe',
        summary: 'Insoluble fiber slows post-meal sugar spike.',
        scientificReason:
          'Pre-loading or pairing fibrous leafy greens delays gastric glucose absorption and improves micronutrient density.',
        evidenceSource: 'American Journal of Clinical Nutrition',
        referenceUrl: 'https://www.nih.gov/',
      },
      {
        foodName: 'Warm Spiced Herbal Infusion / Water',
        status: 'Safe',
        summary: 'Supports enzymatic breakdown & hydration.',
        scientificReason:
          'Adequate hydration maintains optimal mucosal viscosity and pancreatic enzyme efficiency during digestion.',
        evidenceSource: 'FAO / WHO Hydration Standards',
        referenceUrl: 'https://www.who.int/',
      }
    );

    unsafe.push(
      {
        foodName: 'Sugary Carbonated Soft Drinks',
        status: 'Unsafe',
        summary: 'Causes rapid insulin surge & gastric bloating.',
        scientificReason:
          'Liquid high-fructose corn syrup combined with a main meal spikes postprandial triglycerides and crowds out satiety signals.',
        evidenceSource: 'WHO Sugars & Cardiometabolic Report',
        referenceUrl: 'https://www.who.int/',
      },
      {
        foodName: isRiceOrHighCarb ? 'Heavy Cream-Loaded Desserts Immediately' : 'Ice-Cold Milkshakes Immediately',
        status: 'Avoid',
        summary: 'Excess saturated fat + sugar delays digestion.',
        scientificReason:
          'Layering dense dairy fats and simple sugars on top of a complete meal prolongs gastric emptying beyond 4–5 hours.',
        evidenceSource: 'NIH Dietary Guidelines',
        referenceUrl: 'https://www.nih.gov/',
      },
      {
        foodName: 'Deep-Fried Salty Packaged Chips',
        status: 'Avoid',
        summary: 'Compounds sodium & trans/oxidized lipid load.',
        scientificReason:
          'Adding ultra-processed sodium-dense snacks pushes single-meal sodium past 1,200mg and increases oxidative lipid stress.',
        evidenceSource: 'FAO / WHO Sodium Reduction Benchmark',
        referenceUrl: 'https://www.who.int/',
      }
    );
  }

  return {
    safeCombinations: safe,
    unsafeCombinations: unsafe,
  };
}

export function ensureAnalysisCombinations(analysis: FoodAnalysisResponse): FoodAnalysisResponse {
  const existingSafe = analysis.combinations?.safeCombinations || [];
  const existingUnsafe = analysis.combinations?.unsafeCombinations || [];
  if (existingSafe.length > 0 && existingUnsafe.length > 0) {
    return analysis;
  }

  const generated = buildFoodCombinations({
    foodName: analysis.foodName,
    category: analysis.category,
    cuisine: analysis.cuisine,
    ingredientNames: (analysis.ingredients || []).map((i) => i.name),
    calories: analysis.nutrition?.calories,
  });

  return {
    ...analysis,
    combinations: {
      safeCombinations: existingSafe.length > 0 ? existingSafe : generated.safeCombinations,
      unsafeCombinations: existingUnsafe.length > 0 ? existingUnsafe : generated.unsafeCombinations,
    },
  };
}
