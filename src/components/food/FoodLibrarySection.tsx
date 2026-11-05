'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { indianFoodDatabase } from '@/data/indianFoods';
import { IndianFoodItem } from '@/types';
import {
  Utensils,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export default function FoodLibrarySection() {
  const {
    mealPlate,
    addToMealPlate,
    updateMealPlateItem,
    removeFromMealPlate,
    clearMealPlate,
    addMealLog,
    setActiveSection,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<IndianFoodItem | null>(null);
  const [customServings, setCustomServings] = useState<string>('1');
  const [savedSuccessBanner, setSavedSuccessBanner] = useState<string | null>(null);

  const categories = [
    'All',
    'Breakfast',
    'Breads & Rotis',
    'Rice & Biryani',
    'Dals & Curries',
    'Snacks & Street Food',
    'Fruits',
    'Beverages & Dairy',
  ];

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return indianFoodDatabase.filter((food) => {
      const matchesCategory =
        selectedCategory === 'All' || food.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        food.name.toLowerCase().includes(q) ||
        (food.regionalName && food.regionalName.toLowerCase().includes(q)) ||
        (food.hindiName && food.hindiName.toLowerCase().includes(q)) ||
        food.servingDescription.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Compute total carbs on plate
  const totalPlateCarbs = useMemo(() => {
    return mealPlate.reduce((acc, curr) => acc + curr.totalCarbs, 0);
  }, [mealPlate]);

  const handleOpenAddModal = (food: IndianFoodItem) => {
    setSelectedFoodForModal(food);
    setCustomServings('1');
  };

  const handleConfirmAddToPlate = () => {
    if (!selectedFoodForModal) return;
    const qty = parseFloat(customServings) || 1;
    addToMealPlate({
      foodId: selectedFoodForModal.id,
      name: selectedFoodForModal.name,
      servings: qty,
      servingDescription: selectedFoodForModal.servingDescription,
      carbsPerServing: selectedFoodForModal.carbsGrams,
      totalCarbs: Math.round(qty * selectedFoodForModal.carbsGrams),
    });
    setSelectedFoodForModal(null);
  };

  const handleSavePlateToQuickLog = () => {
    if (mealPlate.length === 0) return;

    const mealTitle =
      mealPlate.length === 1
        ? mealPlate[0].name
        : `${mealPlate[0].name} + ${mealPlate.length - 1} item${mealPlate.length > 2 ? 's' : ''}`;

    const saved = addMealLog({
      timestamp: new Date().toISOString(),
      mealType: 'lunch',
      name: mealTitle,
      items: mealPlate,
      totalCarbs: totalPlateCarbs,
      notes: 'Logged from Indian Food Library Plate Builder',
      isDemo: false,
    });

    if (saved) {
      setSavedSuccessBanner(`Meal plate saved (${totalPlateCarbs}g carbs recorded)`);
      clearMealPlate();
      setTimeout(() => {
        setSavedSuccessBanner(null);
        setActiveSection('quick-log');
      }, 1500);
    } else {
      setSavedSuccessBanner('Meal is only in this session. Export a backup before leaving this page.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Indian Food & Carbohydrate Library
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Approximate carbohydrate estimates for counting, drawn from general reference tables. These are not laboratory-verified values and have not yet been reviewed by a registered dietitian. Portion sizes vary, so weigh or measure when you can. Build meals, estimate carbs, and log locally.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          <strong>Zero Insulin Dosing Recommendations:</strong> GlucoNest estimates carbohydrates to help you count. The app never calculates or suggests insulin dosages. Always bolus according to your endocrinologist’s prescribed ratio.
        </span>
      </div>

      {/* Success Notification */}
      {savedSuccessBanner && (
        <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <Check className="w-4 h-4" />
          <span>{savedSuccessBanner}</span>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search foods (e.g. Idli, Dosa, Chapati, Biryani, Poha, Mango, Sambar)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nest-500/40"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Foods List (Left) + Active Meal Plate Builder (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Food Items List */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredFoods.length} foods</span>
            <span className="text-[11px]">Click &quot;+ Add to Plate&quot; to build your meal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="bg-white dark:bg-[#131b24] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-nest-600 dark:group-hover:text-nest-400 transition-colors">
                        {food.name}
                      </h4>
                      {food.regionalName && (
                        <div className="text-[11px] text-slate-400 font-medium">
                          {food.regionalName} {food.hindiName ? `· ${food.hindiName}` : ''}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold font-mono px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shrink-0">
                      {food.carbsGrams}g
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {food.servingDescription}
                  </div>

                  {/* Macronutrient breakdown */}
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-0.5">
                    <span>P: {food.proteinGrams || 0}g</span>
                    <span>•</span>
                    <span>F: {food.fatGrams || 0}g</span>
                    <span>•</span>
                    <span>Fiber: {food.fiberGrams || 0}g</span>
                  </div>

                  {food.t1dTip && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1 leading-relaxed">
                      💡 {food.t1dTip}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {food.sourceOrVerification}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(food)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-nest-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Meal Plate Builder Panel (Right Sidebar) */}
        <div className="lg:col-span-4 sticky top-20 space-y-4">
          <div className="bg-white dark:bg-[#131b24] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-nest-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Active Meal Plate
                </h3>
              </div>
              {mealPlate.length > 0 && (
                <button
                  type="button"
                  onClick={clearMealPlate}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            {mealPlate.length === 0 ? (
              <div className="py-8 text-center space-y-2 text-xs text-slate-400">
                <Utensils className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p>Your meal plate is empty.</p>
                <p className="text-[11px]">Click &quot;Add&quot; on any food item to calculate meal carbs together.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {mealPlate.map((item) => (
                    <div
                      key={item.foodId}
                      className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.servings}x ({item.carbsPerServing}g ea)
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {item.totalCarbs}g
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateMealPlateItem(item.foodId, item.servings - 0.5)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
                            title="Decrease serving"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMealPlateItem(item.foodId, item.servings + 0.5)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
                            title="Increase serving"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromMealPlate(item.foodId)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50"
                            title="Remove"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Carb Calculation Box */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Estimated Total Carbs:
                    </span>
                    <span className="text-2xl font-bold font-mono text-nest-600 dark:text-nest-400">
                      {totalPlateCarbs}g
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Calculated from Indian Food Composition Tables (NIN Hyderabad).
                  </p>

                  <button
                    type="button"
                    onClick={handleSavePlateToQuickLog}
                    className="w-full py-2.5 rounded-xl bg-nest-600 hover:bg-nest-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Meal to Quick Log</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Serving Size Quantity Modal */}
      {selectedFoodForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#131b24] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {selectedFoodForModal.name}
              </h3>
              <p className="text-xs text-slate-500">
                1 serving = {selectedFoodForModal.servingDescription} (~{selectedFoodForModal.carbsGrams}g carbs)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Serving Quantity
              </label>
              <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                {[0.5, 1, 1.5, 2].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setCustomServings(num.toString());
                    }}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                      parseFloat(customServings) === num
                        ? 'bg-nest-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Custom:</span>
                <input
                  type="number"
                  step="any"
                  min="0.25"
                  value={customServings}
                  onChange={(e) => setCustomServings(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs"
                />
                <span className="text-xs text-slate-400">servings</span>
              </div>
            </div>

            <div className="p-3 bg-nest-50 dark:bg-nest-950/40 rounded-xl border border-nest-100 dark:border-nest-900 text-xs flex items-center justify-between">
              <span>Estimated Carbs:</span>
              <span className="font-mono font-bold text-nest-700 dark:text-nest-300 text-sm">
                {Math.round((parseFloat(customServings) || 1) * selectedFoodForModal.carbsGrams)}g
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedFoodForModal(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddToPlate}
                className="px-4 py-2 rounded-xl bg-nest-600 hover:bg-nest-700 text-white text-xs font-semibold"
              >
                Add to Plate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
