import { SelectedFoodItem, FoodLabExperimentResult, ResearchObjective, NutritionalFocus } from '../types/foodlab';

export function calculateExperimentResult(
  selectedFoods: SelectedFoodItem[],
  customName: string,
  researchObjective: ResearchObjective,
  nutritionalFocus: NutritionalFocus[]
): FoodLabExperimentResult {
  const totalWeightGrams = selectedFoods.reduce((acc, item) => acc + item.quantityGrams, 0);

  // Scaled Nutrition Calculation
  let calories = 0;
  let carbs = 0;
  let protein = 0;
  let fat = 0;
  let sugar = 0;
  let fiber = 0;
  let calcium = 0;
  let vitaminC = 0;

  selectedFoods.forEach(({ food, quantityGrams }) => {
    const factor = quantityGrams / 100;
    calories += food.caloriesPer100g * factor;
    carbs += food.carbsPer100g * factor;
    protein += food.proteinPer100g * factor;
    fat += food.fatPer100g * factor;
    sugar += food.sugarPer100g * factor;
    fiber += food.fiberPer100g * factor;
    calcium += food.calciumMgPer100g * factor;
    vitaminC += food.vitaminCMgPer100g * factor;
  });

  // Food combination type deduction
  const hasLiquid = selectedFoods.some(f => f.food.unit === 'ml' || f.food.category === 'DAIRY' && f.food.name.includes('Milk'));
  const isBeverage = hasLiquid && selectedFoods.length <= 3;
  const combinationType = isBeverage ? 'Beverage / Drink' : 'Solid Meal / Formulation';

  // Ratios
  const ratioSummary = selectedFoods.map(f => `${f.food.name}: ${f.quantityGrams}g`).join(' · ');

  // Chemistry Interaction Checks
  const hasDairy = selectedFoods.some(f => f.food.category === 'DAIRY' && (f.food.dairyType || f.food.name === 'Milk' || f.food.name === 'Curd'));
  const hasMilk = selectedFoods.some(f => f.food.name.toLowerCase().includes('milk'));
  const hasAcidicFruit = selectedFoods.some(f => f.food.isAcidic || ['Orange', 'Pineapple', 'Tomato'].includes(f.food.name));
  const hasOrange = selectedFoods.some(f => f.food.name.toLowerCase() === 'orange');
  const hasHoney = selectedFoods.some(f => f.food.name.toLowerCase() === 'honey');
  const hasGhee = selectedFoods.some(f => f.food.name.toLowerCase() === 'ghee');

  const hasTeaOrCoffee = selectedFoods.some((f) =>
    /tea|coffee|chai|espresso|matcha/i.test(f.food.name)
  );
  const hasIronRichPlant = selectedFoods.some((f) =>
    /spinach|palak|lentil|dal|bean|chickpea|chole|rajma/i.test(f.food.name)
  );
  const hasBanana = selectedFoods.some((f) => /banana/i.test(f.food.name));
  const hasSeafood = selectedFoods.some((f) =>
    /fish|salmon|prawn|shrimp|tuna|rohu|seafood/i.test(f.food.name)
  );

  let verdict: 'UNEATABLE' | 'SAFE' | 'CAUTION' | 'BENEFICIAL' = 'SAFE';
  let verdictTitle = 'Safe & Compatible';
  let verdictSubtitle = 'Nutritionally balanced and suitable for consumption.';
  let riskWeight = 22;
  let safetyRiskWeight = 20;
  let healthRiskWeight = 25;
  let keyReason = 'No adverse biochemical interactions detected between the selected foods.';
  let nutritionNote = 'Macronutrient and micronutrient balance supports sustained metabolic release.';

  const safetyRisks: FoodLabExperimentResult['safetyRisks'] = [];
  const healthImpacts: FoodLabExperimentResult['healthImpacts'] = [];

  // Case 1: Milk + Orange / Citrus (Direct match to user's second reference diagram)
  if (hasMilk && hasOrange) {
    verdict = 'UNEATABLE';
    verdictTitle = 'Uneatable (Unsafe)';
    verdictSubtitle = 'Not recommended for consumption.';
    riskWeight = 85;
    safetyRiskWeight = 85;
    healthRiskWeight = 78;
    keyReason = 'Acidic fruit (orange) and milk can react, causing curdling, digestive discomfort and reduced nutrient absorption.';
    nutritionNote = 'Vitamin C from orange can react with milk proteins, reducing its absorption and nutritional benefit.';

    safetyRisks.push(
      {
        type: 'Chemical Interaction',
        title: 'Casein Coagulation & Curdling',
        description: 'Acid (citric acid) from orange reacts with milk proteins (casein), causing curdling.',
        severity: 'High',
      },
      {
        type: 'Digestive Risk',
        title: 'Gastric Distress & Acidity',
        description: 'May cause stomach discomfort, acidity, bloating or indigestion.',
        severity: 'High',
      },
      {
        type: 'Nutrient Loss',
        title: 'Impaired Bioavailability',
        description: 'Reduces the bioavailability of protein and calcium from milk.',
        severity: 'Moderate',
      },
      {
        type: 'Stability Issue',
        title: 'Rapid Phase Separation',
        description: 'Poor shelf life and quick spoilage at room temperature.',
        severity: 'Moderate',
      }
    );

    healthImpacts.push(
      { text: 'May cause digestive discomfort (curdling and gas).', status: 'critical' },
      { text: 'Not advisable for people with sensitive stomach or acidity issues.', status: 'critical' },
      { text: 'Nutrient absorption (protein, calcium) may be reduced.', status: 'warning' },
      { text: 'Citric acid can alter milk proteins, leading to lower nutritional value.', status: 'warning' }
    );
  } else if (hasDairy && hasAcidicFruit) {
    verdict = 'CAUTION';
    verdictTitle = 'Caution / Digestive Irritation';
    verdictSubtitle = 'Potential curdling and acid-dairy incompatibility.';
    riskWeight = 68;
    safetyRiskWeight = 70;
    healthRiskWeight = 65;
    keyReason = 'Acidic compounds trigger gradual dairy protein curdling, potentially challenging delicate digestion.';
    
    safetyRisks.push({
      type: 'Chemical Interaction',
      title: 'Protein Destabilization',
      description: 'Organic fruit acids precipitate dairy casein proteins into dense curds in the stomach.',
      severity: 'Moderate',
    });
    healthImpacts.push({
      text: 'May cause mild acidity or sluggish digestion in acid-sensitive individuals.',
      status: 'warning',
    });
  } else if (hasTeaOrCoffee && hasIronRichPlant) {
    verdict = 'CAUTION';
    verdictTitle = 'Caution / Iron Inhibition';
    verdictSubtitle = 'Polyphenols & tannins reduce non-heme iron uptake.';
    riskWeight = 48;
    safetyRiskWeight = 32;
    healthRiskWeight = 52;
    keyReason = 'Tannins and chlorogenic polyphenols bind non-heme iron from leafy greens and legumes, lowering intestinal absorption.';
    nutritionNote = 'Space tea or coffee intake 45-60 minutes away from iron-rich meals for optimal mineral uptake.';
    safetyRisks.push({
      type: 'Nutrient Loss',
      title: 'Polyphenol-Iron Chelation',
      description: 'Tannins chelate dietary non-heme iron in the upper GI tract, reducing iron bioavailability by up to 50%.',
      severity: 'Moderate',
    });
    healthImpacts.push(
      { text: 'Safe to consume occasionally, though suboptimal for iron-deficiency management.', status: 'warning' },
      { text: 'Pairing with vitamin C instead of tea dramatically improves mineral uptake.', status: 'positive' }
    );
  } else if (hasSeafood && hasDairy) {
    verdict = 'CAUTION';
    verdictTitle = 'Digestive Caution (Seafood + Dairy)';
    verdictSubtitle = 'High histamine-protein load may challenge sensitive digestion.';
    riskWeight = 52;
    safetyRiskWeight = 54;
    healthRiskWeight = 50;
    keyReason = 'Combining concentrated marine proteins with cold dairy fats slows gastric emptying and increases sensitivity risk.';
    safetyRisks.push({
      type: 'Digestive Risk',
      title: 'Delayed Gastric Emptying',
      description: 'Dual dense animal protein matrices require elevated peptic acid secretion.',
      severity: 'Moderate',
    });
    healthImpacts.push({
      text: 'Individuals with mild lactose or histamine sensitivity may experience bloating.',
      status: 'warning',
    });
  } else if (hasHoney && hasGhee) {
    verdict = 'CAUTION';
    verdictTitle = 'Metabolic Caution (Honey + Ghee)';
    verdictSubtitle = 'Equal proportion caution in traditional food science.';
    riskWeight = 55;
    safetyRiskWeight = 50;
    healthRiskWeight = 60;
    keyReason = 'High lipid density coupled with concentrated fructose can overload pancreatic lipase during acute consumption.';
    safetyRisks.push({
      type: 'Digestive Risk',
      title: 'Lipid-Sugar Matrix Density',
      description: 'Dense lipid emulsification can delay gastric transit time.',
      severity: 'Moderate',
    });
    healthImpacts.push({
      text: 'Best consumed in uneven ratios to optimize metabolic clearance.',
      status: 'warning',
    });
  } else if (hasAcidicFruit && hasIronRichPlant) {
    verdict = 'BENEFICIAL';
    verdictTitle = 'Synergistic Bioavailability';
    verdictSubtitle = 'Vitamin C boosts non-heme iron absorption naturally.';
    riskWeight = 8;
    safetyRiskWeight = 8;
    healthRiskWeight = 10;
    keyReason = 'Ascorbic and citric acids reduce ferric iron to soluble ferrous iron, dramatically increasing intestinal mineral uptake.';
    nutritionNote = 'Vitamin C chelates plant iron and counteracts phytate inhibition for superior micronutrient absorption.';
    safetyRisks.push({
      type: 'Chemical Interaction',
      title: 'Ascorbate-Iron Reduction',
      description: 'Helpful biochemical synergy converting non-heme iron into its most absorbable state.',
      severity: 'Low',
    });
    healthImpacts.push(
      { text: 'Enhances iron bioavailability from greens and legumes.', status: 'positive' },
      { text: 'Provides balanced antioxidants, potassium, and dietary fiber.', status: 'positive' },
      { text: 'Supports healthy energy metabolism and oxygen transport.', status: 'positive' }
    );
  } else if (hasBanana && hasMilk) {
    verdict = 'SAFE';
    verdictTitle = 'Safe (Moderate Caloric Density)';
    verdictSubtitle = 'Nutrient-dense smoothie base; consume fresh.';
    riskWeight = 24;
    safetyRiskWeight = 18;
    healthRiskWeight = 26;
    keyReason = 'Balanced potassium, carbohydrates, and dairy protein; rapid fermentation occurs if stored warm.';
    safetyRisks.push({
      type: 'Stability Issue',
      title: 'Enzymatic Browning on Standing',
      description: 'Polyphenol oxidase browns blended banana quickly; consume within 30 minutes or chill.',
      severity: 'Low',
    });
    healthImpacts.push(
      { text: 'Good post-workout glycogen and electrolyte replenishment mix.', status: 'positive' },
      { text: 'May feel heavy for individuals with slow digestion or lactose sensitivity.', status: 'warning' }
    );
  } else {
    // Normal healthy combination
    verdict = 'BENEFICIAL';
    verdictTitle = 'Highly Compatible';
    verdictSubtitle = 'Nutritionally synergistic and safe for consumption.';
    riskWeight = 12;
    safetyRiskWeight = 10;
    healthRiskWeight = 14;
    keyReason = 'The selected food matrix demonstrates complementary amino acid, mineral, and antioxidant profiles.';
    
    safetyRisks.push(
      {
        type: 'Chemical Interaction',
        title: 'Harmonious Matrix',
        description: 'No antagonistic chemical precipitation or compound binding detected.',
        severity: 'Low',
      },
      {
        type: 'Digestive Risk',
        title: 'Optimal Gastrointestinal Transit',
        description: 'Balanced soluble fiber and macronutrients encourage healthy gut motility.',
        severity: 'Low',
      }
    );

    healthImpacts.push(
      { text: 'Rich in complementary micronutrients and bioavailable energy.', status: 'positive' },
      { text: 'Stable digestive processing with sustained satiety indices.', status: 'positive' },
      { text: 'Fosters favorable glycemic response when consumed as whole foods.', status: 'positive' }
    );
  }

  const finalConclusion = verdict === 'UNEATABLE'
    ? `The combination of ${selectedFoods.map(f => f.food.name).join(' + ')} is classified as UNEATABLE (Unsafe) for human consumption. Reason: The acidic nature of orange (citric acid) reacts with milk proteins, leading to curdling, digestive discomfort, reduced nutrient absorption and potential gastrointestinal issues.`
    : `The combination of ${selectedFoods.map(f => f.food.name).join(' + ')} is classified as ${verdictTitle.toUpperCase()} for human consumption. Reason: ${keyReason}`;

  return {
    experimentId: `FL-${Math.floor(10000 + Math.random() * 90000)}`,
    experimentName: customName || selectedFoods.map(f => f.food.name).join(' ') + (isBeverage ? ' Drink' : ' Mix'),
    selectedFoods,
    totalWeightGrams,
    combinationType,
    ratioSummary,
    researchObjective,
    nutritionalFocus,
    verdict,
    verdictTitle,
    verdictSubtitle,
    riskWeight,
    safetyRiskWeight,
    healthRiskWeight,
    keyReason,
    nutrition: {
      calories: Math.round(calories),
      carbsGrams: Number(carbs.toFixed(1)),
      proteinGrams: Number(protein.toFixed(1)),
      fatGrams: Number(fat.toFixed(1)),
      sugarGrams: Number(sugar.toFixed(1)),
      fiberGrams: Number(fiber.toFixed(1)),
      calciumMg: Math.round(calcium),
      vitaminCMg: Number(vitaminC.toFixed(1)),
      nutritionNote,
    },
    safetyRisks,
    healthImpacts,
    finalConclusion,
    createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  };
}
