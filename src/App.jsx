// File: AiReceptionistCalculator.jsx
// Description: A React component for calculating the ROI of an AI receptionist
// compared to a human receptionist, including industry benchmarks, pricing tiers,
// and separate analysis scenarios (Replacing vs. Enhancing Staff).
// Dependencies: React, Recharts, Tailwind CSS (for styling classes)

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Simple Card Components ---
const Card = ({ children, className }) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
);
const CardHeader = ({ children, className }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }) => (
  <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
);
const CardContent = ({ children, className }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// --- Print Styles Component ---
const PrintStyles = () => (
  <style type="text/css">
    {`
      @media print {
        body * { visibility: hidden; }
        #printable-area, #printable-area * { visibility: visible; }
        #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print, .no-print * { display: none !important; }
        .print-grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        .print-p-0 { padding: 0 !important; }
        .print-shadow-none { box-shadow: none !important; }
        .print-border-none { border: none !important; }
        .recharts-legend-wrapper { position: relative !important; }
        .recharts-tooltip-wrapper { display: none !important; }
        /* Force background/color printing */
        .bg-white { background-color: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-50 { background-color: #f9fafb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-100 { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-900 { background-color: #111827 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-lime-50 { background-color: #f7fee7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-lime-400 { background-color: #a3e635 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-700 { background-color: #374151 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        * { color: inherit !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .text-white { color: #ffffff !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-red-500 { color: #ef4444 !important; }
        .text-red-600 { color: #dc2626 !important; }
        .text-red-700 { color: #b91c1c !important; }
        .text-lime-500 { color: #84cc16 !important; }
        .text-lime-600 { color: #65a30d !important; }
        .text-lime-700 { color: #4d7c0f !important; }
        .text-lime-800 { color: #3f6212 !important; }
        .border-lime-500\\/50 { border-color: rgba(132, 204, 22, 0.5) !important; }
        .border-lime-500 { border-color: #84cc16 !important; }
        .border-lime-300 { border-color: #bef264 !important; }
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-gray-400 { border-color: #9ca3af !important; }
        .border-t { border-top-width: 1px !important; }
        .border-2 { border-width: 2px !important; }
      }
    `}
  </style>
);

// --- Helper Function to Safely Format Numbers ---
const safeLocaleString = (value, options = {}, fallback = '0.00') => {
  if (typeof value === 'number' && isFinite(value)) {
    return value.toLocaleString(undefined, options);
  }
  if ((options.style === 'percent' && fallback === 'N/A') || fallback === 'N/A') {
      return 'N/A';
  }
  return fallback;
};

// --- Main Calculator Component ---
function App() {
  // --- State Variables ---

  // Analysis mode state ('replace' or 'enhance')
  const [analysisMode, setAnalysisMode] = useState('replace'); // Default to 'replace'

  const pricingTiers = {
    basic: { name: "Basic", setupFee: 745, monthlyCost: 250, perMinuteCost: 0.45, description: "Essential features for small businesses" },
    professional: { name: "Professional", setupFee: 1500, monthlyCost: 500, perMinuteCost: 0.40, description: "Advanced features with priority support" },
    enterprise: { name: "Enterprise", setupFee: 5000, monthlyCost: 2500, perMinuteCost: 0.30, description: "Custom solutions starting at" }
  };

  const industryPresets = {
    plumbing:                 { daysOpen: 'alldays',  businessHourCalls: 15,  afterHourCalls: 5,   missedBusinessHourCalls: 3, avgCallDuration: 10,    avgLeadValue: 300, conversionRate: 13 },
    HVAC:                     { daysOpen: 'alldays',  businessHourCalls: 20,  afterHourCalls: 7,   missedBusinessHourCalls: 3, avgCallDuration: 12.5,  avgLeadValue: 450, conversionRate: 11 },
    electrician:              { daysOpen: 'sixdays',  businessHourCalls: 12.5,afterHourCalls: 4,   missedBusinessHourCalls: 3, avgCallDuration: 15,    avgLeadValue: 350, conversionRate: 12 },
    landscaping_and_lawn_care:{ daysOpen: 'sixdays',  businessHourCalls: 10,  afterHourCalls: 2.5, missedBusinessHourCalls: 3, avgCallDuration: 6.5,   avgLeadValue: 120, conversionRate: 15 },
    cleaning_services:        { daysOpen: 'sixdays',  businessHourCalls: 15,  afterHourCalls: 1.5, missedBusinessHourCalls: 3, avgCallDuration: 8,     avgLeadValue: 100, conversionRate: 18 },
    roofing:                  { daysOpen: 'sixdays',  businessHourCalls: 7.5, afterHourCalls: 1.5, missedBusinessHourCalls: 3, avgCallDuration: 17.5,  avgLeadValue: 500, conversionRate: 9  },
    painting:                 { daysOpen: 'weekdays', businessHourCalls: 9,   afterHourCalls: 1.5, missedBusinessHourCalls: 3, avgCallDuration: 10,    avgLeadValue: 250, conversionRate: 14 },
    carpentry:                { daysOpen: 'weekdays', businessHourCalls: 6,   afterHourCalls: 1,   missedBusinessHourCalls: 3, avgCallDuration: 25,    avgLeadValue: 300, conversionRate: 13 },
    flooring_installation:    { daysOpen: 'sixdays',  businessHourCalls: 6.5, afterHourCalls: 1,   missedBusinessHourCalls: 3, avgCallDuration: 12.5,  avgLeadValue: 400, conversionRate: 12 },
    pest_control:             { daysOpen: 'sixdays',  businessHourCalls: 11,  afterHourCalls: 3,   missedBusinessHourCalls: 3, avgCallDuration: 7,     avgLeadValue: 150, conversionRate: 16 },
    other_home_services:      { daysOpen: 'sixdays',  businessHourCalls: 9.5, afterHourCalls: 2.5, missedBusinessHourCalls: 3, avgCallDuration: 10,    avgLeadValue: 250, conversionRate: 12 },
  };

  const defaultIndustry = "plumbing";
  const defaultPreset = industryPresets[defaultIndustry];

  const [industry, setIndustry] = useState(defaultIndustry);
  const [businessHourCalls, setBusinessHourCalls] = useState(defaultPreset.businessHourCalls);
  const [afterHourCalls, setAfterHourCalls] = useState(defaultPreset.afterHourCalls);
  const [missedBusinessHourCalls, setMissedBusinessHourCalls] = useState(defaultPreset.missedBusinessHourCalls);
  const [avgCallDuration, setAvgCallDuration] = useState(defaultPreset.avgCallDuration);
  const [daysOpen, setDaysOpen] = useState(defaultPreset.daysOpen);
  const [avgLeadValue, setAvgLeadValue] = useState(defaultPreset.avgLeadValue);
  const [conversionRate, setConversionRate] = useState(defaultPreset.conversionRate);
  const [salesCallPercentage, setSalesCallPercentage] = useState(47);
  const [humanHourlyWage, setHumanHourlyWage] = useState(18);
  const [humanHoursPerWeek, setHumanHoursPerWeek] = useState(40);
  const [humanOverheadPercentage, setHumanOverheadPercentage] = useState(25);

  const [inputErrors, setInputErrors] = useState({
    businessHourCalls: false, afterHourCalls: false, missedBusinessHourCalls: false,
    avgCallDuration: false, salesCallPercentage: false, avgLeadValue: false,
    conversionRate: false, humanHourlyWage: false, humanHoursPerWeek: false,
    humanOverheadPercentage: false,
  });
  const [validationError, setValidationError] = useState(false);

  const [selectedTier, setSelectedTier] = useState("professional");
  const [aiSetupFee, setAiSetupFee] = useState(pricingTiers.professional.setupFee);
  const [aiSubscriptionCost, setAiSubscriptionCost] = useState(pricingTiers.professional.monthlyCost);
  const [aiPerMinuteCost, setAiPerMinuteCost] = useState(pricingTiers.professional.perMinuteCost);

  // --- Updated Results State ---
  // Added fields specific to the 'enhance' scenario
  const [results, setResults] = useState({
    // Core metrics (used by both)
    totalCalls: 0, missedCalls: 0, salesMissedCalls: 0, totalMinutes: 0,
    aiBaseCost: 0, aiMinuteCost: 0, aiSetupFee: 0, aiTotalMonthlyCost: 0,
    potentialRevenue: 0, // Monthly potential revenue from missed calls
    // 'Replace' scenario metrics
    aiSetupFeeMonthly: 0, aiTotalCostWithSetup: 0, humanCost: 0,
    costSavings: 0, // Monthly savings vs human (Yr 1, includes amortized setup)
    netBenefit: 0, // Monthly total benefit (Yr 1, savings + revenue)
    paybackPeriod: 0, // Overall payback (months)
    yearlyCostSavings: 0, // Annual recurring savings
    yearlyPotentialRevenue: 0, // Annual added revenue
    yearlyNetBenefit: 0, // Annual total benefit (recurring savings + revenue)
    firstYearNetReturn: 0,
    firstYearRevenueVsAiCost: 0,
    annualRoi: 0, // Overall annual ROI (Yr 1)
    // 'Enhance' scenario metrics (NEW)
    enhanceMonthlyNetGain: 0, // Monthly gain (Revenue - AI Recurring Cost)
    enhancePaybackPeriod: 0 // Payback based only on enhancement gain (months)
  });

  // --- Effects ---
  useEffect(() => {
    const hasErrors = Object.values(inputErrors).some(error => error);
    setValidationError(hasErrors);
  }, [inputErrors]);

  useEffect(() => {
    if (pricingTiers[selectedTier]) {
      setAiSetupFee(pricingTiers[selectedTier].setupFee);
      setAiSubscriptionCost(pricingTiers[selectedTier].monthlyCost);
      setAiPerMinuteCost(pricingTiers[selectedTier].perMinuteCost);
    }
  }, [selectedTier]);

  // --- Calculation Logic ---
  useEffect(() => {
    try {
      // Input Validation & Conversion
      const validBusinessHourCalls = Number(businessHourCalls) || 0;
      const validAfterHourCalls = Number(afterHourCalls) || 0;
      const validMissedBusinessHourCalls = Number(missedBusinessHourCalls) || 0;
      const validAvgCallDuration = Number(avgCallDuration) || 0;
      const validSalesCallPercentage = Number(salesCallPercentage) || 0;
      const validAvgLeadValue = Number(avgLeadValue) || 0;
      const validConversionRate = Number(conversionRate) || 0;
      const validHumanHourlyWage = Number(humanHourlyWage) || 0;
      const validHumanHoursPerWeek = Number(humanHoursPerWeek) || 0;
      const validHumanOverheadPercentage = Number(humanOverheadPercentage) || 0;

      // Human Cost Calculation
      const weeklyWageCost = validHumanHourlyWage * validHumanHoursPerWeek;
      const yearlyWageCost = weeklyWageCost * 52;
      const monthlyWageCost = yearlyWageCost / 12;
      const calculatedHumanMonthlyCost = monthlyWageCost * (1 + validHumanOverheadPercentage / 100);

      // Call Volume & Duration Calculation
      const daysPerMonth = daysOpen === "weekdays" ? 22 : daysOpen === "sixdays" ? 26 : 30;
      const totalMonthlyCalls = (validBusinessHourCalls * daysPerMonth) + (validAfterHourCalls * 30);
      const monthlyMissedBusinessHourCalls = validMissedBusinessHourCalls * daysPerMonth;
      const monthlyAfterHourCalls = validAfterHourCalls * 30;
      const totalMissedCalls = monthlyMissedBusinessHourCalls + monthlyAfterHourCalls;
      const totalMinutes = totalMonthlyCalls * validAvgCallDuration;

      // Potential Revenue Calculation (from missed calls)
      const salesMissedCalls = totalMissedCalls * (validSalesCallPercentage / 100);
      const valuePerCall = validAvgLeadValue * (validConversionRate / 100);
      const potentialRevenueFromMissedCalls = salesMissedCalls * valuePerCall; // Monthly

      // AI Cost Calculation
      const aiBaseCost = aiSubscriptionCost;
      const aiUsageCost = totalMinutes * aiPerMinuteCost;
      const aiTotalMonthlyCost = aiBaseCost + aiUsageCost; // Recurring monthly AI cost

      // --- Calculations for 'Replace' Scenario ---
      const aiSetupFeeMonthly = aiSetupFee / 12;
      const aiTotalCostWithSetup = aiTotalMonthlyCost + aiSetupFeeMonthly; // Effective monthly cost (Yr 1)
      const costSavings = calculatedHumanMonthlyCost - aiTotalCostWithSetup; // Monthly savings (Yr 1)
      const totalBenefit = costSavings + potentialRevenueFromMissedCalls; // Monthly total benefit (Yr 1)
      const paybackPeriodMonths = totalBenefit > 0 ? (aiSetupFee / totalBenefit) : Infinity; // Overall payback
      const yearlyCostSavings = (calculatedHumanMonthlyCost - aiTotalMonthlyCost) * 12; // Annual recurring savings
      const yearlyPotentialRevenue = potentialRevenueFromMissedCalls * 12; // Annual added revenue
      const yearlyNetBenefit = yearlyCostSavings + yearlyPotentialRevenue; // Annual total benefit
      const annualOperationalGain = (calculatedHumanMonthlyCost - aiTotalMonthlyCost + potentialRevenueFromMissedCalls) * 12;
      const firstYearNetReturn_clearer = annualOperationalGain - aiSetupFee;
      const totalInvestmentFirstYear = (aiTotalMonthlyCost * 12) + aiSetupFee;
      const calculatedFirstYearRevenueVsAiCost = yearlyPotentialRevenue - totalInvestmentFirstYear;
      const annualRoiCalc = totalInvestmentFirstYear > 0 ? (yearlyNetBenefit / totalInvestmentFirstYear) * 100 : (yearlyNetBenefit > 0 ? Infinity : 0); // Overall ROI

      // --- Calculations for 'Enhance' Scenario (NEW) ---
      // Net gain is just the added revenue minus the recurring AI cost
      const enhanceMonthlyNetGainCalc = potentialRevenueFromMissedCalls - aiTotalMonthlyCost;
      // Payback is setup fee divided by this specific net gain
      const enhancePaybackPeriodCalc = enhanceMonthlyNetGainCalc > 0 ? (aiSetupFee / enhanceMonthlyNetGainCalc) : Infinity;

      // Update Results State (including new 'enhance' metrics)
      setResults({
        totalCalls: totalMonthlyCalls, missedCalls: totalMissedCalls, salesMissedCalls: salesMissedCalls,
        totalMinutes: totalMinutes, aiBaseCost: aiBaseCost, aiMinuteCost: aiUsageCost,
        aiSetupFee: aiSetupFee, aiTotalMonthlyCost: aiTotalMonthlyCost,
        potentialRevenue: potentialRevenueFromMissedCalls,
        // Replace metrics
        aiSetupFeeMonthly: aiSetupFeeMonthly, aiTotalCostWithSetup: aiTotalCostWithSetup, humanCost: calculatedHumanMonthlyCost,
        costSavings: costSavings, netBenefit: totalBenefit, paybackPeriod: paybackPeriodMonths,
        yearlyCostSavings: yearlyCostSavings, yearlyPotentialRevenue: yearlyPotentialRevenue,
        yearlyNetBenefit: yearlyNetBenefit, firstYearNetReturn: firstYearNetReturn_clearer,
        firstYearRevenueVsAiCost: calculatedFirstYearRevenueVsAiCost, annualRoi: annualRoiCalc,
        // Enhance metrics
        enhanceMonthlyNetGain: enhanceMonthlyNetGainCalc,
        enhancePaybackPeriod: enhancePaybackPeriodCalc,
      });
    } catch (error) {
        console.error("Error during calculation:", error);
    }
  }, [
    businessHourCalls, afterHourCalls, missedBusinessHourCalls, avgCallDuration,
    avgLeadValue, conversionRate, salesCallPercentage, daysOpen,
    aiSubscriptionCost, aiPerMinuteCost, aiSetupFee,
    humanHourlyWage, humanHoursPerWeek, humanOverheadPercentage
  ]);

  // --- Handlers & Helpers ---
  const handleIndustryChange = (e) => {
    const selectedIndustry = e.target.value;
    setIndustry(selectedIndustry);
    const preset = industryPresets[selectedIndustry] || industryPresets[defaultIndustry];
    setDaysOpen(preset.daysOpen);
    setBusinessHourCalls(preset.businessHourCalls);
    setAfterHourCalls(preset.afterHourCalls);
    setMissedBusinessHourCalls(preset.missedBusinessHourCalls);
    setAvgCallDuration(preset.avgCallDuration);
    setAvgLeadValue(preset.avgLeadValue);
    setConversionRate(preset.conversionRate);
    setInputErrors(prevErrors => ({
      ...prevErrors, daysOpen: false, businessHourCalls: false, afterHourCalls: false,
      missedBusinessHourCalls: false, avgCallDuration: false, avgLeadValue: false, conversionRate: false,
    }));
  };

  const handleNumberInputChange = (setter, errorKey, value, min = 0, max = Infinity) => {
    const numValue = Number(value);
    if (isNaN(numValue) || value.trim() === '' || numValue < min || numValue > max) {
      setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: true }));
      setter(value);
    } else {
      setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: false }));
      setter(numValue);
    }
  };

  const formatPaybackPeriod = (periodInMonths) => {
      if (periodInMonths === 0) return "Immediate";
      if (!isFinite(periodInMonths) || periodInMonths === Infinity) return "Never";
      const years = Math.floor(periodInMonths / 12);
      const months = Math.floor(periodInMonths % 12);
      let result = "";
      if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
      if (months > 0) result += (result ? " " : "") + `${months} month${months > 1 ? 's' : ''}`;
      return result || "Less than 1 month";
  };

  const handlePrint = () => {
      window.print();
  };

  // --- JSX Rendering ---
  return (
    <>
      <PrintStyles />
      <div id="printable-area" className="p-4 max-w-6xl mx-auto font-sans print-p-0">
        {/* Outermost card */}
        <Card className="w-full print-shadow-none print-border-none">
          {/* Calculator Header */}
          <CardHeader className="bg-gray-900 text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl">AI Receptionist ROI Calculator</CardTitle>
              <p className="text-center text-sm text-gray-400 mt-1">Compare AI vs. Human Receptionist Costs & Benefits</p>
          </CardHeader>

          <CardContent className="p-6">
            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-grid-cols-1">

              {/* --- Left Column: Inputs --- */}
              <div className="space-y-8">
                  {/* Business Profile Card */}
                  <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Business Profile & Call Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Industry Select */}
                      <div>
                        <label htmlFor="industry" className="block text-sm font-medium mb-1 text-gray-600">Industry</label>
                        <select id="industry" value={industry} onChange={handleIndustryChange} className="w-full p-2 border border-gray-400 rounded focus:ring-lime-500 focus:border-lime-500 transition duration-150">
                          {Object.keys(industryPresets).map(key => (
                            <option key={key} value={key}>
                              {key === 'HVAC' ? key : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select industry to load average benchmarks (you can adjust below).</p>
                      </div>
                      {/* Days Open Select */}
                      <div>
                        <label htmlFor="daysOpen" className="block text-sm font-medium mb-1 text-gray-600">Business Operating Days</label>
                        <select id="daysOpen" value={daysOpen} onChange={(e) => setDaysOpen(e.target.value)} className="w-full p-2 border border-gray-400 rounded focus:ring-lime-500 focus:border-lime-500 transition duration-150">
                          <option value="weekdays">Monday-Friday (5 days/week)</option>
                          <option value="sixdays">Monday-Saturday (6 days/week)</option>
                          <option value="alldays">All Days (7 days/week)</option>
                        </select>
                      </div>
                      {/* Number Inputs */}
                      <div>
                        <label htmlFor="businessHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Calls (Business Hours)</label>
                        <input id="businessHourCalls" type="number" min="0" value={businessHourCalls} onChange={(e) => handleNumberInputChange(setBusinessHourCalls, 'businessHourCalls', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.businessHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        {inputErrors.businessHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="afterHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Calls (After Hours)</label>
                        <input id="afterHourCalls" type="number" min="0" value={afterHourCalls} onChange={(e) => handleNumberInputChange(setAfterHourCalls, 'afterHourCalls', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.afterHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        {inputErrors.afterHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="missedBusinessHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Missed Calls (Business Hours)</label>
                        <input id="missedBusinessHourCalls" type="number" min="0" value={missedBusinessHourCalls} onChange={(e) => handleNumberInputChange(setMissedBusinessHourCalls, 'missedBusinessHourCalls', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.missedBusinessHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        {inputErrors.missedBusinessHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="avgCallDuration" className="block text-sm font-medium mb-1 text-gray-600">Average Call Duration (minutes)</label>
                        <input id="avgCallDuration" type="number" min="0" step="0.5" value={avgCallDuration} onChange={(e) => handleNumberInputChange(setAvgCallDuration, 'avgCallDuration', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.avgCallDuration ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        {inputErrors.avgCallDuration && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Pricing Tier Card */}
                  <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Select AI Pricing Tier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(pricingTiers).map(([key, tier]) => (
                          <div key={key} className={`rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 ${
                              selectedTier === key
                                ? 'border-2 border-lime-500 bg-lime-50 shadow-lg'
                                : 'border border-gray-400 hover:border-lime-500 hover:bg-gray-50'
                            } ${key === 'professional' ? 'relative' : ''}`}
                            onClick={() => setSelectedTier(key)}
                          >
                            {key === 'professional' && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 no-print">
                                <span className="bg-lime-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">RECOMMENDED</span>
                              </div>
                            )}
                            <div className={`text-center mb-2 ${key === 'professional' ? 'mt-3' : ''}`}>
                              <div className={`text-md font-bold ${selectedTier === key ? 'text-lime-800' : 'text-lime-700'}`}>{tier.name}</div>
                              <div className={`text-xs ${selectedTier === key ? 'text-gray-600' : 'text-gray-500'}`}>{tier.description}</div>
                            </div>
                            <div className={`space-y-1.5 mt-3 text-sm ${selectedTier === key ? 'text-gray-700' : 'text-gray-600'}`}>
                              <div className="flex justify-between"><span>Setup:</span><span className={`font-medium ${selectedTier === key ? 'text-gray-900' : 'text-gray-800'}`}>${tier.setupFee.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Monthly:</span><span className={`font-medium ${selectedTier === key ? 'text-gray-900' : 'text-gray-800'}`}>${tier.monthlyCost.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Per Minute:</span><span className={`font-medium ${selectedTier === key ? 'text-gray-900' : 'text-gray-800'}`}>${tier.perMinuteCost.toFixed(2)}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">Click a tier to update the AI cost calculations.</p>
                    </CardContent>
                  </Card>

                  {/* Revenue Inputs Card */}
                  <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Revenue Factors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label htmlFor="salesCallPercentage" className="block text-sm font-medium mb-1 text-gray-600">Sales Opportunity Calls (%)</label>
                        <input id="salesCallPercentage" type="number" min="0" max="100" value={salesCallPercentage} onChange={(e) => handleNumberInputChange(setSalesCallPercentage, 'salesCallPercentage', e.target.value, 0, 100)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.salesCallPercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        {inputErrors.salesCallPercentage && (<p className="text-red-500 text-xs mt-1">Please enter a value between 0 and 100.</p>)}
                      </div>
                      <div>
                        <label htmlFor="avgLeadValue" className="block text-sm font-medium mb-1 text-gray-600">Average Value per Customer ($)</label>
                        <input id="avgLeadValue" type="number" min="0" value={avgLeadValue} onChange={(e) => handleNumberInputChange(setAvgLeadValue, 'avgLeadValue', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.avgLeadValue ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        <p className="text-xs text-gray-500 mt-1">Include initial sale value + potential upsells/repeat business.</p>
                        {inputErrors.avgLeadValue && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="conversionRate" className="block text-sm font-medium mb-1 text-gray-600">Lead-to-Customer Conversion Rate (%)</label>
                        <input id="conversionRate" type="number" min="0" max="100" value={conversionRate} onChange={(e) => handleNumberInputChange(setConversionRate, 'conversionRate', e.target.value, 0, 100)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.conversionRate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        {inputErrors.conversionRate && (<p className="text-red-500 text-xs mt-1">Please enter a value between 0 and 100.</p>)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Staff Cost Card */}
                  <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Current Human Receptionist Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label htmlFor="humanHourlyWage" className="block text-sm font-medium mb-1 text-gray-600">Average Hourly Wage ($)</label>
                        <input id="humanHourlyWage" type="number" min="0" step="0.01" value={humanHourlyWage} onChange={(e) => handleNumberInputChange(setHumanHourlyWage, 'humanHourlyWage', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHourlyWage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        {inputErrors.humanHourlyWage && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="humanHoursPerWeek" className="block text-sm font-medium mb-1 text-gray-600">Average Hours Worked per Week</label>
                        <input id="humanHoursPerWeek" type="number" min="0" value={humanHoursPerWeek} onChange={(e) => handleNumberInputChange(setHumanHoursPerWeek, 'humanHoursPerWeek', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHoursPerWeek ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        {inputErrors.humanHoursPerWeek && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                      </div>
                      <div>
                        <label htmlFor="humanOverheadPercentage" className="block text-sm font-medium mb-1 text-gray-600"> Estimated Overhead (%) </label>
                        <input id="humanOverheadPercentage" type="number" min="0" max="200" value={humanOverheadPercentage} onChange={(e) => handleNumberInputChange(setHumanOverheadPercentage, 'humanOverheadPercentage', e.target.value, 0, 200)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanOverheadPercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-400 focus:ring-lime-500 focus:border-lime-500'}`}/>
                        <p className="text-xs text-gray-500 mt-1">Include benefits, taxes, software, office space, etc.</p>
                        {inputErrors.humanOverheadPercentage && (<p className="text-red-500 text-xs mt-1">Please enter a valid percentage (e.g., 0-200).</p>)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calculate Button */}
                  <div className="mt-6 no-print">
                    <button
                      onClick={() => {
                        if (!validationError) {
                          const resultsSection = document.getElementById('results-section');
                          if (resultsSection) {
                            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }
                      }}
                      disabled={validationError}
                      className={`w-full font-bold py-3 px-4 rounded transition duration-200 ease-in-out text-white shadow-md hover:shadow-lg ${
                        validationError
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gray-700 hover:bg-gray-800 cursor-pointer'
                      }`}
                    >
                      {validationError ? 'Please Fix Errors Above' : 'Calculate ROI & View Results'}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      {validationError ? 'Correct the highlighted fields to enable calculation.' : 'Click to see your potential savings and revenue gains.'}
                    </p>
                  </div>
              </div> {/* --- End Left Column --- */}


              {/* --- Right Column: Results --- */}
              <div id="results-section" className="space-y-6">

                {/* --- Scenario Tabs (NEW) --- */}
                <div className="flex border-b border-gray-300 no-print">
                  <button
                    onClick={() => setAnalysisMode('replace')}
                    className={`py-2 px-4 font-medium text-sm transition-colors duration-150 ${
                      analysisMode === 'replace'
                        ? 'border-b-2 border-lime-500 text-lime-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Scenario: AI Replacing Staff
                  </button>
                  <button
                    onClick={() => setAnalysisMode('enhance')}
                    className={`py-2 px-4 font-medium text-sm transition-colors duration-150 ${
                      analysisMode === 'enhance'
                        ? 'border-b-2 border-lime-500 text-lime-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Scenario: AI Enhancing Staff
                  </button>
                </div>

                {/* --- Conditional Results: AI Replacing Staff --- */}
                {analysisMode === 'replace' && (
                  <div className="space-y-6">
                    {/* ROI/Impact Section (Overall) */}
                    <Card className="border border-gray-200 print-shadow-none print-border-none">
                      <CardHeader>
                          <CardTitle className="text-center text-xl font-semibold text-gray-800">Estimated Impact: AI Replacing Staff</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center px-6 py-4">
                          <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-1">Potential Annual Total Gain</p>
                              <p className="text-4xl font-bold text-lime-500">
                                  ${safeLocaleString(results.yearlyNetBenefit, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">(Annual Labor Savings + Annual Added Revenue)</p>
                          </div>
                          <hr className="my-4 border-gray-300"/>
                          <div className="flex justify-around items-start mb-4">
                              <div className="flex-1 px-2">
                                  <p className="text-sm text-gray-600 mb-1">Estimated Annual ROI</p>
                                  <p className="text-3xl font-semibold text-gray-800">
                                      {safeLocaleString(results.annualRoi, { maximumFractionDigits: 0 }, 'N/A')}%
                                  </p>
                              </div>
                              <div className="flex-1 px-2">
                                  <p className="text-sm text-gray-600 mb-1">Overall Payback Period</p>
                                  <p className="text-3xl font-semibold text-gray-800">
                                      {formatPaybackPeriod(results.paybackPeriod)}
                                  </p>
                              </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-4">
                              Driven by: ${safeLocaleString(results.yearlyCostSavings, { maximumFractionDigits: 0 })} in annual cost savings and ${safeLocaleString(results.yearlyPotentialRevenue, { maximumFractionDigits: 0 })} in potential added revenue.
                          </p>
                          <a
                              href="https://api.leadconnectorhq.com/widget/booking/9rk5cHU2aY3skvtraBB7"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="no-print inline-block w-full max-w-xs mx-auto bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow hover:shadow-md"
                          >
                              Let's Discuss Your Results
                          </a>
                      </CardContent>
                    </Card>

                    {/* Monthly Call Analysis Card (Relevant for both) */}
                    <Card className="border border-gray-200 print-shadow-none print-border-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Monthly Call Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Total Calls Handled (Est.):</span>
                          <span className="font-medium text-gray-800">{safeLocaleString(results.totalCalls, { maximumFractionDigits: 0 }, '0')}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Business + After Hours)</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Currently Missed Calls (Est.):</span>
                          <span className="font-medium text-red-600">{safeLocaleString(results.missedCalls, { maximumFractionDigits: 0 }, '0')}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Missed Business Hours + All After Hours)</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Missed Sales Opportunities (Est.):</span>
                          <span className="font-medium text-red-700">{safeLocaleString(results.salesMissedCalls, { maximumFractionDigits: 0 }, '0')}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 pl-1"> (Missed Calls × Sales %)</p>
                      </CardContent>
                    </Card>

                    {/* AI Cost Card */}
                    <Card className="border border-gray-200 print-shadow-none print-border-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">AI Receptionist Cost ({pricingTiers[selectedTier]?.name} Tier)</CardTitle>
                      </CardHeader>
                      <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">One-time Setup Fee:</span>
                          <span className="font-medium text-gray-800">${safeLocaleString(results.aiSetupFee, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Monthly Subscription:</span>
                          <span className="font-medium text-gray-800">${safeLocaleString(results.aiBaseCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Est. Monthly Usage Cost:</span>
                          <span className="font-medium text-gray-800">${safeLocaleString(results.aiMinuteCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> ({safeLocaleString(results.totalMinutes, { maximumFractionDigits: 0 }, '0')} mins × ${safeLocaleString(aiPerMinuteCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/min)</p>
                        <div className="flex justify-between items-center border-t pt-2 mt-2">
                          <span className="text-sm font-semibold text-gray-800">Total Monthly Recurring Cost:</span>
                          <span className="font-semibold text-lime-700">${safeLocaleString(results.aiTotalMonthlyCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Subscription + Usage)</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-700"> Effective Monthly Cost (Yr 1) </span>
                          <span className="font-medium text-gray-800">${safeLocaleString(results.aiTotalCostWithSetup, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 pl-1"> (Monthly Recurring + Setup Fee/12)</p>
                      </CardContent>
                    </Card>

                    {/* Human Cost Card */}
                    <Card className="border border-gray-200 print-shadow-none print-border-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Calculated Human Receptionist Cost</CardTitle>
                      </CardHeader>
                      <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Est. Monthly Cost (Wages + Overhead):</span>
                          <span className="font-medium text-gray-800">${safeLocaleString(results.humanCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> Based on inputs: ${humanHourlyWage}/hr, {humanHoursPerWeek} hrs/wk, {humanOverheadPercentage}% overhead</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-700">Est. Annual Cost:</span>
                          <span className="font-medium text-gray-800">${safeLocaleString(results.humanCost * 12, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Financial Impact Card (Monthly - Overall) */}
                    <Card className="border border-lime-500/50 bg-lime-400 print-shadow-none print-border-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-lime-700">Monthly Financial Impact (AI Replacing Staff)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-lime-700">Direct Cost Savings (vs. Human):</span>
                          <span className={`font-medium ${results.costSavings >= 0 ? 'text-lime-600' : 'text-red-600'}`}> ${safeLocaleString(results.costSavings, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                        </div>
                        <p className="text-xs text-gray-600 -mt-2 mb-2 pl-1"> (Calculated Human Cost - Effective Monthly AI Cost)</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-lime-700">Potential Added Revenue:</span>
                          <span className="font-medium text-lime-600"> + ${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (From capturing missed sales calls)</p>
                        <div className="flex justify-between items-center border-t border-lime-500/30 pt-2 mt-2">
                          <span className="text-sm font-semibold text-lime-700">Total Monthly Benefit:</span>
                          <span className={`font-semibold text-xl ${results.netBenefit >= 0 ? 'text-lime-600' : 'text-red-600'}`}> ${safeLocaleString(results.netBenefit, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                        </div>
                        <p className="text-xs text-gray-600 -mt-2 pl-1"> (Cost Savings + Added Revenue)</p>
                      </CardContent>
                    </Card>

                    {/* Chart Card (Overall Comparison) */}
                    <Card className="border border-gray-200 print-shadow-none print-border-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700 mb-1">Monthly Cost & Benefit Comparison (Replace Scenario)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div style={{ width: '100%', height: 280 }}>
                          <ResponsiveContainer>
                            <BarChart
                              data={[
                                { name: 'Monthly', 'Human Cost': results.humanCost, 'AI Cost (Effective)': results.aiTotalCostWithSetup, 'Net Benefit': results.netBenefit > 0 ? results.netBenefit : 0 }
                              ]}
                              margin={{ top: 5, right: 5, left: 15, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis tickFormatter={(value) => `$${safeLocaleString(value)}`} tick={{ fontSize: 10 }} />
                              <Tooltip
                                formatter={(value, name) => [`$${safeLocaleString(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                                labelFormatter={() => 'Monthly Comparison'}
                                cursor={{ fill: 'rgba(230, 230, 230, 0.3)' }}
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                              />
                              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '10px' }} />
                              <Bar dataKey="Human Cost" fill="#F87171" name="Human Cost (Calculated)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="AI Cost (Effective)" fill="#84cc16" name="AI Cost (Incl. Setup/12)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="Net Benefit" fill="#65a30d" name="Net Monthly Benefit" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* --- Conditional Results: AI Enhancing Staff --- */}
                {analysisMode === 'enhance' && (
                  <div className="space-y-6">
                    {/* Enhancement Impact Summary Card */}
                     <Card className="border border-gray-200 print-shadow-none print-border-none">
                      <CardHeader>
                          <CardTitle className="text-center text-xl font-semibold text-gray-800">Estimated Impact: AI Enhancing Staff</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center px-6 py-4">
                          <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-1">Potential Annual Added Revenue</p>
                              <p className="text-4xl font-bold text-lime-500">
                                  ${safeLocaleString(results.yearlyPotentialRevenue, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">(From capturing currently missed calls)</p>
                          </div>
                          <hr className="my-4 border-gray-300"/>
                          <div className="flex justify-around items-start mb-4">
                              <div className="flex-1 px-2">
                                  <p className="text-sm text-gray-600 mb-1">Net Monthly Gain</p>
                                  <p className={`text-3xl font-semibold ${results.enhanceMonthlyNetGain >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                      ${safeLocaleString(results.enhanceMonthlyNetGain, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">(Added Revenue - AI Recurring Cost)</p>
                              </div>
                              <div className="flex-1 px-2">
                                  <p className="text-sm text-gray-600 mb-1">Payback Period (Enhance Only)</p>
                                  <p className="text-3xl font-semibold text-gray-800">
                                      {formatPaybackPeriod(results.enhancePaybackPeriod)}
                                  </p>
                                   <p className="text-xs text-gray-500 mt-1">(Setup Fee / Net Monthly Gain)</p>
                              </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-4">
                              Focuses only on the value generated by capturing {safeLocaleString(results.missedCalls, {maximumFractionDigits: 0})} missed calls/month vs. the AI cost.
                          </p>
                          <a
                              href="https://api.leadconnectorhq.com/widget/booking/9rk5cHU2aY3skvtraBB7"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="no-print inline-block w-full max-w-xs mx-auto bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow hover:shadow-md"
                          >
                              Discuss Enhancement Strategy
                          </a>
                      </CardContent>
                    </Card>

                    {/* Monthly Call Analysis Card (Repeated for context) */}
                    <Card className="border border-gray-200 print-shadow-none print-border-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Monthly Call Analysis (Focus on Missed Calls)</CardTitle>
                      </CardHeader>
                      <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Currently Missed Calls (Est.):</span>
                          <span className="font-medium text-red-600">{safeLocaleString(results.missedCalls, { maximumFractionDigits: 0 }, '0')}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Missed Business Hours + All After Hours)</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Missed Sales Opportunities (Est.):</span>
                          <span className="font-medium text-red-700">{safeLocaleString(results.salesMissedCalls, { maximumFractionDigits: 0 }, '0')}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Missed Calls × Sales %)</p>
                         <div className="flex justify-between items-center border-t pt-2 mt-2">
                          <span className="text-sm font-semibold text-gray-800">Potential Added Revenue:</span>
                          <span className="font-semibold text-lime-700">${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 pl-1"> (From capturing missed sales calls)</p>
                      </CardContent>
                    </Card>

                    {/* AI Cost Card (Repeated for context) */}
                    <Card className="border border-gray-200 print-shadow-none print-border-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">AI Receptionist Cost ({pricingTiers[selectedTier]?.name} Tier)</CardTitle>
                      </CardHeader>
                      <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">One-time Setup Fee:</span>
                          <span className="font-medium text-gray-800">${safeLocaleString(results.aiSetupFee, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Monthly Subscription:</span>
                          <span className="font-medium text-gray-800">${safeLocaleString(results.aiBaseCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Est. Monthly Usage Cost:</span>
                          <span className="font-medium text-gray-800">${safeLocaleString(results.aiMinuteCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> ({safeLocaleString(results.totalMinutes, { maximumFractionDigits: 0 }, '0')} mins × ${safeLocaleString(aiPerMinuteCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/min)</p>
                        <div className="flex justify-between items-center border-t pt-2 mt-2">
                          <span className="text-sm font-semibold text-gray-800">Total Monthly Recurring Cost:</span>
                          <span className="font-semibold text-lime-700">${safeLocaleString(results.aiTotalMonthlyCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                         <p className="text-xs text-gray-500 -mt-2 pl-1"> (Subscription + Usage)</p>
                      </CardContent>
                    </Card>

                     {/* Financial Impact Card (Monthly - Enhancement Only) */}
                    <Card className="border border-lime-500/50 bg-lime-400 print-shadow-none print-border-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-lime-700">Monthly Financial Impact (AI Enhancing Staff)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-lime-700">Potential Added Revenue:</span>
                          <span className="font-medium text-lime-600"> ${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (From capturing missed sales calls)</p>
                         <div className="flex justify-between items-center">
                          <span className="text-sm text-lime-700">AI Monthly Recurring Cost:</span>
                          <span className="font-medium text-red-600"> - ${safeLocaleString(results.aiTotalMonthlyCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                        </div>
                         <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Subscription + Usage)</p>
                        <div className="flex justify-between items-center border-t border-lime-500/30 pt-2 mt-2">
                          <span className="text-sm font-semibold text-lime-700">Net Monthly Gain (Enhancement):</span>
                          <span className={`font-semibold text-xl ${results.enhanceMonthlyNetGain >= 0 ? 'text-lime-600' : 'text-red-600'}`}> ${safeLocaleString(results.enhanceMonthlyNetGain, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>
                        </div>
                        <p className="text-xs text-gray-600 -mt-2 pl-1"> (Added Revenue - AI Recurring Cost)</p>
                      </CardContent>
                    </Card>

                    {/* Chart Card (Enhancement Scenario) */}
                    <Card className="border border-gray-200 print-shadow-none print-border-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700 mb-1">Monthly Revenue vs. AI Cost (Enhance Scenario)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div style={{ width: '100%', height: 280 }}>
                          <ResponsiveContainer>
                            <BarChart
                              data={[
                                { name: 'Monthly', 'Added Revenue': results.potentialRevenue, 'AI Recurring Cost': results.aiTotalMonthlyCost, 'Net Gain': results.enhanceMonthlyNetGain > 0 ? results.enhanceMonthlyNetGain : 0 }
                              ]}
                              margin={{ top: 5, right: 5, left: 15, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis tickFormatter={(value) => `$${safeLocaleString(value)}`} tick={{ fontSize: 10 }} />
                              <Tooltip
                                formatter={(value, name) => [`$${safeLocaleString(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                                labelFormatter={() => 'Monthly Comparison'}
                                cursor={{ fill: 'rgba(230, 230, 230, 0.3)' }}
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                              />
                              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '10px' }} />
                              <Bar dataKey="Added Revenue" fill="#a3e635" name="Potential Added Revenue" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="AI Recurring Cost" fill="#FBBF24" name="AI Recurring Cost" radius={[4, 4, 0, 0]} />
                               <Bar dataKey="Net Gain" fill="#65a30d" name="Net Monthly Gain" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                )}

              </div> {/* --- End Right Column --- */}

            </div> {/* --- End Grid --- */}


            {/* --- Key Insights & Qualitative Benefits (Common or Conditional) --- */}
            {/* Keep these sections outside the tabs for now, or tailor them per tab later */}
            <div className="mt-8">
                <Card className="border border-gray-200 bg-gray-100 print-shadow-none print-border-none">
                   <CardHeader>
                     <CardTitle className="text-lg font-semibold text-gray-800">
                       {analysisMode === 'replace' ? 'Key Insights & Annual Projections (Replace Scenario)' : 'Key Insights (Enhance Scenario)'}
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="p-4 space-y-4 text-sm">
                     {/* Conditional Insights */}
                     {analysisMode === 'replace' && (
                       <>
                        {results.yearlyPotentialRevenue > 0 && (
                            <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                                <p className="font-medium text-gray-800 mb-1">
                                Potential Annual Added Revenue:
                                <span className="text-xs text-gray-500 font-normal ml-1">(First Year)</span>
                                </p>
                                <p className={`text-xl font-semibold text-lime-600`}>
                                    ${safeLocaleString(results.yearlyPotentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">(Est. Revenue from Captured Missed Calls x 12)</p>
                            </div>
                        )}
                        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                            <p className="font-medium text-gray-800 mb-1">Potential Annual Benefit:</p>
                            <p className={`text-xl font-semibold ${results.yearlyNetBenefit >= 0 ? 'text-lime-600' : 'text-red-600'}`}>
                                ${safeLocaleString(results.yearlyNetBenefit, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">(Annual Recurring Cost Savings + Annual Added Revenue)</p>
                        </div>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li> Overall, replacing staff with the AI solution projects a net monthly <span className={`font-semibold ${results.netBenefit >= 0 ? 'text-lime-600' : 'text-red-600'}`}> {results.netBenefit >= 0 ? ' gain ' : ' loss '} of ${safeLocaleString(Math.abs(results.netBenefit), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span>, combining cost savings and added revenue. </li>
                            {(results.paybackPeriod > 0 && isFinite(results.paybackPeriod)) && ( <li> The initial investment (setup fee of ${safeLocaleString(results.aiSetupFee, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}) is estimated to be paid back within <span className="font-semibold text-lime-700"> {formatPaybackPeriod(results.paybackPeriod)}</span> through the net monthly benefits {results.paybackPeriod <= 12 && " (indicating a quick return)"}. </li> )}
                            {(results.paybackPeriod <= 0 || !isFinite(results.paybackPeriod)) && results.netBenefit <= 0 && ( <li> Based on the current inputs, the initial investment is not projected to be paid back via net benefits in the replace scenario. </li> )}
                            {(results.paybackPeriod <= 0) && results.netBenefit > 0 && isFinite(results.paybackPeriod) && ( <li> With a positive net benefit and zero or negligible setup fee, the return is effectively immediate. </li> )}
                            {results.potentialRevenue > 0 && ( <li> Capturing currently missed calls is estimated to add <span className="font-semibold text-lime-600"> ${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> in potential revenue each month. </li> )}
                            {results.costSavings !== 0 && ( <li> Compared to the calculated human cost, the AI shows potential monthly <span className={`font-semibold ${results.costSavings >= 0 ? 'text-lime-600' : 'text-red-600'}`}> {results.costSavings >= 0 ? ' savings ' : ' increased cost '} of ${safeLocaleString(Math.abs(results.costSavings), { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span> (after factoring in the amortized setup fee). </li> )}
                            {isFinite(results.annualRoi) && !isNaN(results.annualRoi) && results.annualRoi !== 0 && ( <li> This translates to a potential annual ROI of <span className={`font-semibold ${results.annualRoi >= 0 ? 'text-lime-600' : 'text-red-600'}`}> {safeLocaleString(results.annualRoi, { maximumFractionDigits: 0 }, 'N/A')}% </span>, comparing the total annual benefit to the total first-year AI cost (including setup). </li> )}
                            <li> Comparing only the potential annual added revenue against the total first-year AI cost (including setup) results in a net <span className={`font-semibold ${results.firstYearRevenueVsAiCost >= 0 ? 'text-lime-600' : 'text-red-600'}`}>{results.firstYearRevenueVsAiCost >=0 ? 'gain' : 'loss'} of ${safeLocaleString(Math.abs(results.firstYearRevenueVsAiCost), {minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (this excludes savings from replacing staff).</li>
                        </ul>
                       </>
                     )}
                     {analysisMode === 'enhance' && (
                       <>
                        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                            <p className="font-medium text-gray-800 mb-1">Potential Monthly Added Revenue:</p>
                            <p className={`text-xl font-semibold text-lime-600`}>
                                ${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">(From capturing {safeLocaleString(results.missedCalls, {maximumFractionDigits: 0})} missed calls/month)</p>
                        </div>
                         <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                            <p className="font-medium text-gray-800 mb-1">Net Monthly Gain (Enhancement):</p>
                            <p className={`text-xl font-semibold ${results.enhanceMonthlyNetGain >= 0 ? 'text-lime-600' : 'text-red-600'}`}>
                                ${safeLocaleString(results.enhanceMonthlyNetGain, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">(Added Revenue - AI Recurring Cost)</p>
                        </div>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li> By capturing missed calls, the AI could generate an estimated <span className="font-semibold text-lime-600">${safeLocaleString(results.potentialRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> in additional monthly revenue.</li>
                            <li> After accounting for the AI's recurring monthly cost (${safeLocaleString(results.aiTotalMonthlyCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}), the net monthly gain from enhancing staff is <span className={`font-semibold ${results.enhanceMonthlyNetGain >= 0 ? 'text-lime-600' : 'text-red-600'}`}>${safeLocaleString(results.enhanceMonthlyNetGain, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>.</li>
                            {(results.enhancePaybackPeriod > 0 && isFinite(results.enhancePaybackPeriod)) && ( <li> The AI setup fee (${safeLocaleString(results.aiSetupFee, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}) is estimated to be paid back within <span className="font-semibold text-lime-700">{formatPaybackPeriod(results.enhancePaybackPeriod)}</span> based solely on this net monthly gain.</li> )}
                             {(results.enhancePaybackPeriod <= 0 || !isFinite(results.enhancePaybackPeriod)) && results.enhanceMonthlyNetGain <= 0 && ( <li> Based on current inputs, the setup fee is not projected to be paid back solely through the net gain of capturing missed calls. </li> )}
                             {(results.enhancePaybackPeriod <= 0) && results.enhanceMonthlyNetGain > 0 && isFinite(results.enhancePaybackPeriod) && ( <li> With a positive net gain and zero or negligible setup fee, the return is effectively immediate. </li> )}
                            <li> This scenario focuses *only* on the value of capturing missed calls and does not include potential cost savings from reducing staff hours.</li>
                        </ul>
                       </>
                     )}
                   </CardContent>
                </Card>
            </div>

            {/* Qualitative Benefits Section (Remains common) */}
            <div className="mt-8">
                <Card className="border border-gray-200 bg-gray-100 print-shadow-none print-border-none">
                    <CardHeader> <CardTitle className="text-lg font-semibold text-gray-800">Additional Potential Benefits (Qualitative)</CardTitle> </CardHeader>
                    <CardContent className="p-4 text-sm text-gray-700">
                        <p className="mb-3">Beyond the quantifiable metrics above, consider how an AI receptionist addresses common operational challenges:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li> <span className="font-medium">Never Miss a Call:</span> Unlike human staff needing breaks, vacations, or sick days, the AI operates 24/7/365, ensuring every incoming call during or after hours is answered promptly, maximizing lead capture and customer support availability. </li>
                            <li> <span className="font-medium">Eliminate Hold Times:</span> Avoid frustrating callers with long waits or voicemail when staff are busy. The AI answers instantly, improving the customer experience and reducing hang-ups from impatient leads. </li>
                            <li> <span className="font-medium">Guarantee Service Consistency:</span> Eliminate variations in service quality or accuracy due to human factors. The AI delivers standardized, error-free information and follows processes exactly the same way for every call. </li>
                            <li> <span className="font-medium">Handle Peak Times Effortlessly:</span> Manage sudden increases in call volume without overwhelming staff or dropping calls. The AI scales instantly to meet demand, ensuring smooth operations during busy periods or marketing campaigns. </li>
                            <li> <span className="font-medium">Free Up Your Team:</span> Offload repetitive call handling from your skilled staff. The AI manages routine inquiries, allowing your team to focus on complex issues, sales follow-ups, and higher-value customer interactions, boosting productivity. </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Print & Discuss Button Section */}
            <div className="mt-8 text-center no-print flex flex-wrap justify-center items-center gap-4">
               <a
                 href="https://api.leadconnectorhq.com/widget/booking/9rk5cHU2aY3skvtraBB7"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-block bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow hover:shadow-md"
               >
                 Let's Discuss Your Results
               </a>
              <button onClick={handlePrint} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow hover:shadow-md"> Print Results </button>
            </div>
             <p className="text-xs text-gray-500 mt-2 text-center no-print"> Use your browser's print dialog to save as PDF. </p>


          </CardContent> {/* End Main Card Content */}
        </Card> {/* End Outermost Card */}
      </div> {/* --- End Printable Area --- */}
    </> // --- End React Fragment ---
  );
}

// Export the App component as the default export
export default App;
