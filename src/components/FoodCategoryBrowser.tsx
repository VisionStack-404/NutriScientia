import React, { useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  Check,
  Info,
  Utensils,
  ChevronDown,
  ChevronUp,
  Layers,
  Plus,
} from 'lucide-react';
import { FoodCatalogueItem, FoodType } from '../data/foodCatalogue';
import {
  FOOD_CATEGORY_META,
  canonicalDishKey,
  createCustomRelatedFoodItem,
  getDeduplicatedFoodSections,
  getUniqueDishImageUrl,
  resolveRelatedDishImage,
  scoreFoodRelevance,
} from '../data/categoryMedia';

type DietaryFilter = 'All' | 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';

export type CategoryBrowserMode = 'experiment' | 'catalogue';

interface FoodCategoryBrowserProps {
  mode: CategoryBrowserMode;
  selectedFoodIds?: string[];
  onToggleFood?: (dish: FoodCatalogueItem) => void;
  onInspectFood?: (dish: FoodCatalogueItem) => void;
  maxGridHeightClass?: string;
}

export const FoodCategoryBrowser: React.FC<FoodCategoryBrowserProps> = ({
  mode,
  selectedFoodIds = [],
  onToggleFood,
  onInspectFood,
  maxGridHeightClass,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | FoodType>('All');
  const [selectedDiet, setSelectedDiet] = useState<DietaryFilter>('All');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Breakfast & Tiffin': true,
    'Curries, Breads & Rice': true,
  });

  const sectionsContainerRef = useRef<HTMLDivElement>(null);

  const allSections = useMemo(() => getDeduplicatedFoodSections(), []);

  const categoryCountMap = useMemo(() => {
    const map = new Map<FoodType, number>();
    for (const sec of allSections) {
      map.set(sec.meta.foodType, sec.items.length);
    }
    return map;
  }, [allSections]);

  const totalUniqueCount = useMemo(
    () => allSections.reduce((sum, sec) => sum + sec.items.length, 0),
    [allSections]
  );

  const trimmedQuery = searchQuery.trim();

  const hasExactCatalogueMatch = useMemo(() => {
    if (!trimmedQuery) return false;
    const key = canonicalDishKey(trimmedQuery);
    return allSections.some((sec) =>
      sec.items.some((item) => canonicalDishKey(item.name) === key)
    );
  }, [allSections, trimmedQuery]);

  const filteredSections = useMemo(() => {
    return allSections
      .filter((section) => selectedCategory === 'All' || section.meta.foodType === selectedCategory)
      .map((section) => {
        const scoredItems = section.items
          .map((item) => ({
            item,
            relevance: trimmedQuery ? scoreFoodRelevance(item, trimmedQuery) : 1,
          }))
          .filter(({ item, relevance }) => {
            const matchesSearch = !trimmedQuery || relevance > 0;
            const matchesDiet =
              selectedDiet === 'All' ||
              (selectedDiet === 'Vegetarian' &&
                (item.dietaryType === 'Vegetarian' || item.dietaryType === 'Vegan')) ||
              (selectedDiet === 'Vegan' && item.dietaryType === 'Vegan') ||
              (selectedDiet === 'Non-Vegetarian' && item.dietaryType === 'Non-Vegetarian');

            return matchesSearch && matchesDiet;
          })
          .sort((a, b) => b.relevance - a.relevance)
          .map(({ item }) => item);

        return {
          ...section,
          items: scoredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [allSections, trimmedQuery, selectedCategory, selectedDiet]);

  const filteredCount = useMemo(
    () => filteredSections.reduce((sum, sec) => sum + sec.items.length, 0),
    [filteredSections]
  );

  const isFilteringActive = trimmedQuery.length > 0 || selectedCategory !== 'All';

  const handleImageError = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  const handleSelectCategory = (foodType: 'All' | FoodType) => {
    if (foodType === 'All' || selectedCategory === foodType) {
      setSelectedCategory('All');
      return;
    }
    setSelectedCategory(foodType);
    setExpandedSections((prev) => ({ ...prev, [foodType]: true }));
    setTimeout(() => {
      sectionsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const toggleSectionExpanded = (foodType: FoodType) => {
    setExpandedSections((prev) => ({
      ...prev,
      [foodType]: !prev[foodType],
    }));
  };

  const handleDishCardTap = (dish: FoodCatalogueItem) => {
    if (mode === 'experiment') {
      onToggleFood?.(dish);
    } else {
      onInspectFood?.(dish);
    }
  };

  const handleUseCustomFood = () => {
    if (trimmedQuery.length < 2) return;
    const customDish = createCustomRelatedFoodItem(trimmedQuery);
    if (mode === 'experiment') {
      onToggleFood?.(customDish);
      setSearchQuery('');
    } else {
      onInspectFood?.(customDish);
    }
  };

  const customPreviewImg = trimmedQuery.length >= 2 ? resolveRelatedDishImage(trimmedQuery) : '';

  return (
    <div className="space-y-4">
      {/* Search / Enter Any Food Input */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or enter any food (e.g. Milk, Orange, Biryani)..."
            className="w-full min-h-[44px] pl-9 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 absolute right-0.5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Instant Custom Food Entry with Related Food Photo when user types a custom name */}
        {trimmedQuery.length >= 2 && !hasExactCatalogueMatch && (
          <button
            type="button"
            onClick={handleUseCustomFood}
            className="w-full min-h-[52px] p-2 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={customPreviewImg}
                alt={trimmedQuery}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover border border-white shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {mode === 'experiment'
                    ? `Add "${trimmedQuery}" to Lab Mix`
                    : `Inspect "${trimmedQuery}"`}
                </div>
                <div className="text-[11px] text-emerald-800 truncate">
                  {filteredCount > 0
                    ? `Custom food entry · ${filteredCount} related items shown below`
                    : 'Custom food entry with matched culinary preview'}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 whitespace-nowrap">
              <Plus className="w-3.5 h-3.5" />
              <span>{mode === 'experiment' ? 'Add' : 'View'}</span>
            </span>
          </button>
        )}
      </div>

      {/* Horizontal Quick-Jump Category Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => handleSelectCategory('All')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          All {FOOD_CATEGORY_META.length} Categories
        </button>

        {FOOD_CATEGORY_META.map((cat) => {
          const active = selectedCategory === cat.foodType;
          const thumbFailed = Boolean(failedImages[`chip_${cat.foodType}`]);
          return (
            <button
              key={cat.foodType}
              type="button"
              onClick={() => handleSelectCategory(cat.foodType)}
              className={`min-h-[40px] pl-1.5 pr-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border flex items-center gap-2 ${
                active
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="w-6 h-6 rounded-lg overflow-hidden bg-slate-100 shrink-0 block">
                {!thumbFailed ? (
                  <img
                    src={cat.coverImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError(`chip_${cat.foodType}`)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: cat.accentBg, color: cat.accentFg }}
                  >
                    <Utensils className="w-3 h-3" />
                  </span>
                )}
              </span>
              <span>{cat.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Category Overview Grid (Hidden while searching so related results show right away) */}
      {trimmedQuery.length === 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                Food Categories
              </span>
            </div>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="min-h-[36px] px-2 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {FOOD_CATEGORY_META.map((cat, idx) => {
              const count = categoryCountMap.get(cat.foodType) || 0;
              const isSelected = selectedCategory === cat.foodType;
              const coverFailed = Boolean(failedImages[`overview_${cat.foodType}`]);
              const isLastOddCard =
                FOOD_CATEGORY_META.length % 2 === 1 && idx === FOOD_CATEGORY_META.length - 1;

              return (
                <button
                  key={cat.foodType}
                  type="button"
                  onClick={() => handleSelectCategory(cat.foodType)}
                  className={`group relative rounded-2xl overflow-hidden border text-left transition-all cursor-pointer ${
                    isLastOddCard ? 'col-span-2' : ''
                  } ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`relative w-full bg-slate-100 overflow-hidden ${
                      isLastOddCard ? 'h-20' : 'h-24'
                    }`}
                  >
                    {!coverFailed ? (
                      <img
                        src={cat.coverImage}
                        alt={cat.foodType}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(`overview_${cat.foodType}`)}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: cat.accentBg, color: cat.accentFg }}
                      >
                        <Utensils className="w-5 h-5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
                    <div className="absolute inset-x-2.5 bottom-2 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white leading-tight truncate">
                          {cat.foodType}
                        </div>
                        <div className="text-[10px] text-emerald-200 font-medium tabular-nums mt-0.5">
                          {count} unique foods
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dietary Segmented Tabs & Unboxed Count */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
          {(['All', 'Vegetarian', 'Non-Vegetarian', 'Vegan'] as DietaryFilter[]).map((diet) => {
            const active = selectedDiet === diet;
            const shortLabel =
              diet === 'Vegetarian' ? 'Veg' : diet === 'Non-Vegetarian' ? 'Non-Veg' : diet;
            return (
              <button
                key={diet}
                type="button"
                onClick={() => setSelectedDiet(diet)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-slate-500 font-medium tabular-nums whitespace-nowrap shrink-0">
          {filteredCount} of {totalUniqueCount}
        </span>
      </div>

      {/* Expandable Food Category Sections with 1-to-1 Unique Dish Photos */}
      <div
        ref={sectionsContainerRef}
        className={`space-y-4 ${maxGridHeightClass ? `${maxGridHeightClass} overflow-y-auto pr-0.5` : ''}`}
      >
        {filteredSections.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                No curated matches for &ldquo;{trimmedQuery || selectedDiet}&rdquo;
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {trimmedQuery
                  ? 'Tap Add above to use it with matched culinary imagery, or clear your search.'
                  : 'Try switching dietary filters to see all curated categories.'}
              </p>
            </div>
          </div>
        ) : (
          filteredSections.map((section, sectionIdx) => {
            const foodType = section.meta.foodType;
            const coverFailed = Boolean(failedImages[`cat_${foodType}`]);
            const isExpanded = isFilteringActive || Boolean(expandedSections[foodType]);

            return (
              <section
                key={foodType}
                className={sectionIdx > 0 ? 'pt-4 border-t border-slate-200/80 space-y-3' : 'space-y-3'}
              >
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSectionExpanded(foodType)}
                  className="w-full min-h-[54px] flex items-center justify-between gap-3 text-left rounded-2xl p-1.5 hover:bg-slate-100/70 transition-colors cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                      {!coverFailed ? (
                        <img
                          src={section.meta.coverImage}
                          alt={foodType}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={() => handleImageError(`cat_${foodType}`)}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: section.meta.accentBg, color: section.meta.accentFg }}
                        >
                          <Utensils className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {foodType}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">
                          {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {section.meta.subtitle}
                      </p>
                    </div>
                  </div>

                  {!isFilteringActive && (
                    <span className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </button>

                {/* Unique-Image Dish Cards Grid */}
                {isExpanded && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {section.items.map((dish) => {
                      const isChecked = selectedFoodIds.includes(dish.id);
                      const imgFailed = Boolean(failedImages[dish.id]);
                      const resolvedImage = dish.imageUrl || getUniqueDishImageUrl(dish);
                      const dietShort =
                        dish.dietaryType === 'Non-Vegetarian'
                          ? 'Non-Veg'
                          : dish.dietaryType === 'Vegan'
                          ? 'Vegan'
                          : 'Veg';

                      return (
                        <div
                          key={dish.id}
                          className={`group rounded-2xl border transition-all overflow-hidden flex flex-col bg-white ${
                            mode === 'experiment' && isChecked
                              ? 'border-emerald-600 ring-2 ring-emerald-500/25 shadow-xs'
                              : 'border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                            {!imgFailed ? (
                              <img
                                src={resolvedImage}
                                alt={dish.name}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                onError={() => handleImageError(dish.id)}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                              />
                            ) : (
                              <div
                                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-2 text-center"
                                style={{
                                  backgroundColor: section.meta.accentBg,
                                  color: section.meta.accentFg,
                                }}
                              >
                                <Utensils className="w-5 h-5 mb-1" />
                                <span className="text-[11px] font-bold leading-tight">
                                  {dish.name}
                                </span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDishCardTap(dish)}
                              aria-label={
                                mode === 'experiment'
                                  ? `${isChecked ? 'Deselect' : 'Select'} ${dish.name} for experiment`
                                  : `Inspect ${dish.name}`
                              }
                              className="absolute inset-0 w-full h-full cursor-pointer text-left"
                            >
                              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
                              <div className="absolute inset-x-2.5 bottom-2">
                                <span className="text-xs font-bold text-white leading-tight line-clamp-1 block">
                                  {dish.name}
                                </span>
                              </div>
                            </button>

                            {onInspectFood && mode === 'experiment' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onInspectFood(dish);
                                }}
                                aria-label={`View ${dish.name} nutrition details`}
                                className="absolute top-1.5 left-1.5 z-10 w-8 h-8 rounded-full bg-white/92 text-slate-700 flex items-center justify-center hover:bg-white shadow-xs cursor-pointer"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {mode === 'experiment' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFood?.(dish);
                                }}
                                aria-label={
                                  isChecked
                                    ? `Remove ${dish.name} from mix`
                                    : `Select ${dish.name} for mix`
                                }
                                className={`absolute top-1.5 right-1.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white/92 border border-slate-300 text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {isChecked ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDishCardTap(dish)}
                            className="px-2.5 py-2 text-left flex items-center justify-between gap-1.5 min-h-[44px] hover:bg-slate-50/70 transition-colors cursor-pointer"
                          >
                            <span className="text-[11px] text-slate-500 truncate font-medium tabular-nums">
                              {dish.caloriesPer100g} kcal · {dietShort}
                            </span>
                            <span
                              className={`text-[10px] font-bold shrink-0 whitespace-nowrap ${
                                mode === 'experiment' && isChecked
                                  ? 'text-emerald-700'
                                  : 'text-slate-700'
                              }`}
                            >
                              {mode === 'experiment' ? (isChecked ? 'Added' : 'Select') : 'Details'}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};
