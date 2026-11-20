import React, { useState } from 'react';
import {
  FoodLabScreenStep,
  SelectedFoodItem,
  ResearchObjective,
  NutritionalFocus,
  FoodLabExperimentResult,
} from '../../types/foodlab';
import { FOOD_CATALOGUE, FoodCatalogueItem } from '../../data/foodCatalogue';
import { getDeduplicatedFoodCatalogue } from '../../data/categoryMedia';
import { calculateExperimentResult } from '../../services/foodLabEngine';
import { apiService } from '../../services/apiService';
import { dispatchAppNotification } from '../../services/settingsService';

import { FoodLabHome } from './FoodLabHome';
import { FoodLabCatalogueView } from './FoodLabCatalogueView';
import { FoodLabSelectFoods } from './FoodLabSelectFoods';
import { FoodLabCombineFormulate } from './FoodLabCombineFormulate';
import { FoodLabSetRequirements } from './FoodLabSetRequirements';
import { FoodLabRunSimulation } from './FoodLabRunSimulation';
import { FoodLabResults } from './FoodLabResults';
import { FoodLabReport } from './FoodLabReport';
import { FoodLabMyExperiments } from './FoodLabMyExperiments';
import { FoodLabReportsView } from './FoodLabReportsView';
import { FoodLabHelpGuide } from './FoodLabHelpGuide';

interface FoodLabMasterProps {
  initialStep?: FoodLabScreenStep;
  onBackToMainApp: () => void;
}

export const FoodLabMaster: React.FC<FoodLabMasterProps> = ({
  initialStep = 'home',
  onBackToMainApp,
}) => {
  const [step, setStep] = useState<FoodLabScreenStep>(initialStep);

  const uniqueCatalogue = React.useMemo(() => getDeduplicatedFoodCatalogue(), []);
  const defaultFirst =
    uniqueCatalogue.find((f) => f.name === 'Paneer Butter Masala') || uniqueCatalogue[0] || FOOD_CATALOGUE[0];
  const defaultSecond =
    uniqueCatalogue.find((f) => f.name === 'Garlic Naan') || uniqueCatalogue[1] || FOOD_CATALOGUE[1];

  const [selectedFoods, setSelectedFoods] = useState<SelectedFoodItem[]>([]);

  const [productName, setProductName] = useState<string>('');
  const [researchObjective, setResearchObjective] = useState<ResearchObjective>('Complete scientific assessment');
  const [nutritionalFocus, setNutritionalFocus] = useState<NutritionalFocus[]>([
    'Analyse complete nutrition',
  ]);
  const [isSimulationReady, setIsSimulationReady] = useState<boolean>(true);

  const [experimentResult, setExperimentResult] = useState<FoodLabExperimentResult>(() =>
    calculateExperimentResult(
      [
        { food: defaultFirst, quantityGrams: 100 },
        { food: defaultSecond, quantityGrams: 100 },
      ],
      'Paneer Butter Masala & Garlic Naan Mix',
      'Complete scientific assessment',
      ['Analyse complete nutrition']
    )
  );

  const handleToggleFood = (food: FoodCatalogueItem) => {
    const exists = selectedFoods.some((f) => f.food.id === food.id);
    if (exists) {
      const updated = selectedFoods.filter((f) => f.food.id !== food.id);
      setSelectedFoods(updated);
      setProductName(
        updated.length >= 2
          ? `${updated[0].food.name} & ${updated[1].food.name} Mix`
          : updated[0]?.food.name || ''
      );
    } else {
      const updated = [...selectedFoods, { food, quantityGrams: food.defaultGrams }];
      setSelectedFoods(updated);
      setProductName(
        updated.length >= 2
          ? `${updated[0].food.name} & ${food.name} Mix`
          : `${food.name} Mix`
      );
    }
  };

  const handleStartFreshExperiment = () => {
    setSelectedFoods([]);
    setProductName('');
    setStep('select_foods');
  };

  const handleStartExperimentWithFood = (food: FoodCatalogueItem) => {
    if (!selectedFoods.some((f) => f.food.id === food.id)) {
      const nextFoods = [...selectedFoods, { food, quantityGrams: food.defaultGrams }];
      setSelectedFoods(nextFoods);
      setProductName(
        nextFoods.length >= 2
          ? `${nextFoods[0].food.name} & ${food.name} Mix`
          : `${food.name} Mix`
      );
    }
    setStep('select_foods');
  };

  const handleRemoveFood = (foodId: string) => {
    if (selectedFoods.length > 2) {
      setSelectedFoods(selectedFoods.filter((f) => f.food.id !== foodId));
    }
  };

  const handleApplyQuickMix = (foods: FoodCatalogueItem[], mixName: string) => {
    setSelectedFoods(foods.map((food) => ({ food, quantityGrams: food.defaultGrams })));
    setProductName(mixName);
    setStep('combine_formulate');
  };

  const handleToggleFocus = (focus: NutritionalFocus) => {
    if (nutritionalFocus.includes(focus)) {
      setNutritionalFocus(nutritionalFocus.filter((f) => f !== focus));
    } else {
      setNutritionalFocus([...nutritionalFocus, focus]);
    }
  };

  const handleExecuteSimulation = async () => {
    setIsSimulationReady(false);
    setStep('run_simulation');
    const result = await apiService.runFoodLabExperiment({
      selectedFoods,
      customName: productName,
      researchObjective,
      nutritionalFocus,
    });
    setExperimentResult(result);
    try {
      const storedRaw = localStorage.getItem('foodlab_saved_experiments');
      const prev: FoodLabExperimentResult[] = storedRaw ? JSON.parse(storedRaw) : [];
      const next = [result, ...prev.filter((e) => e.experimentId !== result.experimentId)].slice(0, 20);
      localStorage.setItem('foodlab_saved_experiments', JSON.stringify(next));
    } catch {
      // ignore storage quota failures
    }
    setIsSimulationReady(true);
    dispatchAppNotification({
      category: 'foodLabNotifications',
      title: `FoodLab Verdict: ${result.verdict}`,
      message: `${result.experimentName} completed (${result.verdictTitle}).`,
    });
  };

  const handleSimulationCompleted = React.useCallback(() => {
    setStep('results');
  }, []);

  const handleLoadSavedExperiment = (exp: FoodLabExperimentResult) => {
    setExperimentResult(exp);
    setSelectedFoods(exp.selectedFoods);
    setProductName(exp.experimentName);
    setStep('results');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {step === 'home' && (
        <FoodLabHome
          onStartNewExperiment={handleStartFreshExperiment}
          onOpenCatalogue={() => setStep('catalogue')}
          onOpenMyExperiments={() => setStep('my_experiments')}
          onOpenReports={() => setStep('reports_view')}
          onOpenHelp={() => setStep('help')}
          onBackToMainApp={onBackToMainApp}
        />
      )}

      {step === 'catalogue' && (
        <FoodLabCatalogueView
          onBack={() => setStep('home')}
          onStartExperimentWithFood={handleStartExperimentWithFood}
        />
      )}

      {step === 'my_experiments' && (
        <FoodLabMyExperiments
          onSelectExperiment={handleLoadSavedExperiment}
          onStartNew={handleStartFreshExperiment}
          onBack={() => setStep('home')}
        />
      )}

      {step === 'reports_view' && (
        <FoodLabReportsView
          onViewReportDetails={() => setStep('report')}
          onBack={() => setStep('home')}
        />
      )}

      {step === 'help' && (
        <FoodLabHelpGuide
          onBack={() => setStep('home')}
          onStartExperiment={handleStartFreshExperiment}
        />
      )}

      {step === 'select_foods' && (
        <FoodLabSelectFoods
          selectedFoods={selectedFoods}
          onToggleFood={handleToggleFood}
          onApplyQuickMix={handleApplyQuickMix}
          onProceedToCombine={() => setStep('combine_formulate')}
          onBack={() => setStep('home')}
        />
      )}

      {step === 'combine_formulate' && (
        <FoodLabCombineFormulate
          selectedFoods={selectedFoods}
          productName={productName}
          onUpdateProductName={setProductName}
          onRemoveFood={handleRemoveFood}
          onProceedToRequirements={() => setStep('set_requirements')}
          onRunQuickSimulation={handleExecuteSimulation}
          onBack={() => setStep('select_foods')}
        />
      )}

      {step === 'set_requirements' && (
        <FoodLabSetRequirements
          researchObjective={researchObjective}
          onUpdateObjective={setResearchObjective}
          nutritionalFocus={nutritionalFocus}
          onToggleFocus={handleToggleFocus}
          onProceedToSimulation={handleExecuteSimulation}
          onBack={() => setStep('combine_formulate')}
        />
      )}

      {step === 'run_simulation' && (
        <FoodLabRunSimulation
          experimentName={productName}
          foodSummary={selectedFoods.map((f) => f.food.name).join(' + ')}
          isSimulationReady={isSimulationReady}
          onSimulationCompleted={handleSimulationCompleted}
          onBack={() => setStep('set_requirements')}
        />
      )}

      {step === 'results' && (
        <FoodLabResults
          result={experimentResult}
          onOpenReport={() => setStep('report')}
          onBack={() => setStep('combine_formulate')}
        />
      )}

      {step === 'report' && (
        <FoodLabReport
          result={experimentResult}
          onBackToResults={() => setStep('results')}
          onBackToHome={() => setStep('home')}
        />
      )}
    </div>
  );
};
