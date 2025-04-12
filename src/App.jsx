import React, { useState, useEffect } from 'react';
// Import Recharts components for the bar chart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Simple Card Components ---
// Reusable Card component for styling sections
const Card = ({ children, className }) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
);

// Reusable CardHeader component
const CardHeader = ({ children, className }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// Reusable CardTitle component
const CardTitle = ({ children, className }) => (
  <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
);

// Reusable CardContent component
const CardContent = ({ children, className }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// --- Print Styles Component ---
// Adds CSS rules specifically for printing
const PrintStyles = () => (
  <style type="text/css">
    {`
      @media print {
        body * {
          visibility: hidden; /* Hide everything by default */
        }
        #printable-area, #printable-area * {
          visibility: visible; /* Show only the printable area */
        }
        #printable-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print, .no-print * {
          display: none !important; /* Hide elements marked with no-print */
        }
        /* Optional: Adjust layout for printing */
        .print-grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }
         .print-p-0 {
            padding: 0 !important;
         }
         .print-shadow-none {
            box-shadow: none !important;
         }
         .print-border-none {
            border: none !important;
         }
         /* Attempt to prevent chart legend/tooltip overlap */
         .recharts-legend-wrapper {
            position: relative !important;
         }
         .recharts-tooltip-wrapper {
            display: none !important; /* Hide tooltip on print */
         }
         /* Ensure card backgrounds print */
         .bg-white {
             background-color: white !important;
             -webkit-print-color-adjust: exact; /* Chrome, Safari */
             print-color-adjust: exact; /* Firefox, Edge */
         }
         .bg-gray-50 {
             background-color: #f9fafb !important; /* Use hex for reliability */
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
         }
         .bg-\[\#eaf6da\] { /* bg-[#eaf6da] */
             background-color: #eaf6da !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
         }
         .bg-green-50 {
             background-color: #ecfdf5 !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
         }
         .bg-indigo-50 {
             background-color: #eef2ff !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
         }
         .bg-purple-50 {
             background-color: #faf5ff !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
         }
         /* Ensure text colors print */
         * {
            color: inherit !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
         }
      }
    `}
  </style>
);


// --- Main Calculator Component ---
function AIReceptionistROICalculator() {
  // --- State Variables ---

  // AI pricing tiers data structure
  const pricingTiers = {
    basic: {
      name: "Basic",
      setupFee: 745,
      monthlyCost: 250,
      perMinuteCost: 0.55,
      description: "Essential features for small businesses"
    },
    professional: {
      name: "Professional",
      setupFee: 1500,
      monthlyCost: 500,
      perMinuteCost: 0.45,
      description: "Advanced features with priority support"
    },
    enterprise: {
      name: "Enterprise",
      setupFee: 5000, // Note: Often custom, using a base value here
      monthlyCost: 2500,
      perMinuteCost: 0.35,
      // Updated description below
      description: "Custom solutions starting at"
    }
  };

  // Input States: Call Volume & Business Operations
  const [businessHourCalls, setBusinessHourCalls] = useState(12); // Avg daily calls during business hours
  const [afterHourCalls, setAfterHourCalls] = useState(2); // Avg daily calls after hours
  const [missedBusinessHourCalls, setMissedBusinessHourCalls] = useState(3); // Avg daily missed calls during business hours
  const [avgCallDuration, setAvgCallDuration] = useState(8); // Avg duration per call in minutes
  const [salesCallPercentage, setSalesCallPercentage] = useState(47); // Percentage of calls that are sales opportunities
  const [daysOpen, setDaysOpen] = useState("sixdays"); // Business operating days per week

  // Input States: Business Value Metrics
  const [avgLeadValue, setAvgLeadValue] = useState(250); // Average value of a converted lead + upsells
  const [conversionRate, setConversionRate] = useState(12); // Percentage of leads that convert to customers
  const [industry, setIndustry] = useState("plumbing"); // Selected industry for presets

  // Input States: Human Receptionist Costs (Detailed Inputs)
  const [humanHourlyWage, setHumanHourlyWage] = useState(18); // Average hourly wage
  const [humanHoursPerWeek, setHumanHoursPerWeek] = useState(40); // Average hours worked per week
  const [humanOverheadPercentage, setHumanOverheadPercentage] = useState(25); // Estimated overhead (benefits, taxes, etc.) as %

  // Input Validation States
  const [inputErrors, setInputErrors] = useState({
    businessHourCalls: false,
    afterHourCalls: false,
    missedBusinessHourCalls: false,
    avgCallDuration: false,
    salesCallPercentage: false,
    avgLeadValue: false,
    conversionRate: false,
    humanHourlyWage: false,
    humanHoursPerWeek: false,
    humanOverheadPercentage: false,
  });

  // Overall Validation State
  const [validationError, setValidationError] = useState(false); // True if any input error exists

  // Effect to update overall validation state when individual input errors change
  useEffect(() => {
    const hasErrors = Object.values(inputErrors).some(error => error);
    setValidationError(hasErrors);
  }, [inputErrors]);

  // Selected AI Pricing Tier State
  const [selectedTier, setSelectedTier] = useState("professional"); // Default to 'professional'

  // AI Cost Parameter States (derived from selected tier)
  const [aiSetupFee, setAiSetupFee] = useState(pricingTiers.professional.setupFee);
  const [aiSubscriptionCost, setAiSubscriptionCost] = useState(pricingTiers.professional.monthlyCost);
  const [aiPerMinuteCost, setAiPerMinuteCost] = useState(pricingTiers.professional.perMinuteCost);

  // Industry Presets for common home service businesses
  const industryPresets = {
    plumbing: { avgLeadValue: 300, conversionRate: 13 },
    hvac: { avgLeadValue: 450, conversionRate: 11 },
    electrician: { avgLeadValue: 350, conversionRate: 12 },
    landscaping: { avgLeadValue: 120, conversionRate: 15 },
    cleaning: { avgLeadValue: 100, conversionRate: 18 },
    roofing: { avgLeadValue: 500, conversionRate: 9 },
    painting: { avgLeadValue: 250, conversionRate: 14 },
    carpentry: { avgLeadValue: 300, conversionRate: 13 },
    flooring: { avgLeadValue: 400, conversionRate: 12 },
    pest_control: { avgLeadValue: 150, conversionRate: 16 },
    other: { avgLeadValue: 250, conversionRate: 12 } // Default 'other' values
  };

  // Effect to update AI cost parameters when the selected tier changes
  useEffect(() => {
    if (pricingTiers[selectedTier]) {
      setAiSetupFee(pricingTiers[selectedTier].setupFee);
      setAiSubscriptionCost(pricingTiers[selectedTier].monthlyCost);
      setAiPerMinuteCost(pricingTiers[selectedTier].perMinuteCost);
    }
  }, [selectedTier]); // Dependency: selectedTier

  // Handler for industry dropdown change
  const handleIndustryChange = (e) => {
    const selectedIndustry = e.target.value;
    setIndustry(selectedIndustry);

    // Apply presets if the selected industry exists in the presets object
    if (industryPresets[selectedIndustry]) {
      setAvgLeadValue(industryPresets[selectedIndustry].avgLeadValue);
      setConversionRate(industryPresets[selectedIndustry].conversionRate);
      // Reset validation errors for these fields when presets are applied
      setInputErrors(prevErrors => ({
          ...prevErrors,
          avgLeadValue: false,
          conversionRate: false
      }));
    }
  };

  // Results State - Stores all calculated values
  const [results, setResults] = useState({
    totalCalls: 0,
    missedCalls: 0,
    salesMissedCalls: 0,
    totalMinutes: 0,
    aiBaseCost: 0,
    aiMinuteCost: 0,
    aiSetupFee: 0,
    aiSetupFeeMonthly: 0,
    aiTotalMonthlyCost: 0,
    aiTotalCostWithSetup: 0,
    humanCost: 0, // Calculated human cost
    potentialRevenue: 0,
    costSavings: 0, // Human Cost vs Effective AI Cost
    netBenefit: 0, // costSavings + potentialRevenue
    roi: 0, // netBenefit / aiTotalCostWithSetup
    paybackPeriod: 0,
    yearlyCostSavings: 0, // costSavings * 12
    yearlyPotentialRevenue: 0, // potentialRevenue * 12
    yearlyNetBenefit: 0, // netBenefit * 12
    // State for First Year Net Return (after setup fee)
    firstYearNetReturn: 0,
  });

  // --- Calculation Logic ---
  // Effect to recalculate ROI whenever relevant input states change
  useEffect(() => {
    // --- Calculate Human Receptionist Monthly Cost ---
    const weeklyWageCost = humanHourlyWage * humanHoursPerWeek;
    const yearlyWageCost = weeklyWageCost * 52;
    const monthlyWageCost = yearlyWageCost / 12;
    const calculatedHumanMonthlyCost = monthlyWageCost * (1 + humanOverheadPercentage / 100);

    // --- Monthly Call & Minute Calculations ---
    const daysPerMonth = daysOpen === "weekdays" ? 22 : daysOpen === "sixdays" ? 26 : 30;
    const totalMonthlyCalls = (businessHourCalls * daysPerMonth) + (afterHourCalls * 30); // Assumes after-hours calls happen 7 days/week (30 days/month approx)
    const monthlyMissedBusinessHourCalls = missedBusinessHourCalls * daysPerMonth;
    const monthlyAfterHourCalls = afterHourCalls * 30; // All after-hour calls are considered 'missed' by standard staff
    const totalMissedCalls = monthlyMissedBusinessHourCalls + monthlyAfterHourCalls;
    const totalMinutes = totalMonthlyCalls * avgCallDuration;

    // --- Revenue & AI Cost Calculations ---
    const salesMissedCalls = totalMissedCalls * (salesCallPercentage / 100);
    const valuePerCall = avgLeadValue * (conversionRate / 100);
    const potentialRevenueFromMissedCalls = salesMissedCalls * valuePerCall;

    const aiBaseCost = aiSubscriptionCost;
    const aiUsageCost = totalMinutes * aiPerMinuteCost;
    const aiTotalMonthlyCost = aiBaseCost + aiUsageCost; // Recurring AI cost

    // Amortize setup fee over 12 months for effective monthly cost comparison
    const aiSetupFeeMonthly = aiSetupFee / 12;
    // Effective monthly cost includes the amortized setup fee for ROI calculation purposes
    const aiTotalCostWithSetup = aiTotalMonthlyCost + aiSetupFeeMonthly;

    // --- ROI & Benefit Calculations ---
    // Cost Savings: Human cost vs EFFECTIVE AI cost (incl. amortized setup)
    const costSavings = calculatedHumanMonthlyCost - aiTotalCostWithSetup;
    // Net Benefit: Includes cost savings (which accounts for amortized setup impact) + added revenue
    const totalBenefit = costSavings + potentialRevenueFromMissedCalls;
    // Potential ROI: Compares net benefit to effective AI cost
    const roi = aiTotalCostWithSetup > 0 ? (totalBenefit / aiTotalCostWithSetup) * 100 : 0;

    // --- Payback Period Calculation ---
    // Total investment = setup fee. Benefit used to pay it back = Net Benefit (Savings + Revenue)
    // Payback = Setup Fee / Monthly Net Benefit
    const paybackPeriodMonths = totalBenefit > 0 ? (aiSetupFee / totalBenefit) : 0; // Payback in months

    // --- Yearly Calculations ---
    const yearlyCostSavings = (calculatedHumanMonthlyCost - aiTotalMonthlyCost) * 12; // Yearly savings based on recurring costs
    const yearlyPotentialRevenue = potentialRevenueFromMissedCalls * 12;
    const yearlyNetBenefit = (yearlyCostSavings + yearlyPotentialRevenue); // Yearly benefit before considering setup fee

    // --- First Year Net Return Calculation (Clearer Approach) ---
    // 1. Calculate Annual Operational Gain (before setup fee amortization)
    const annualOperationalGain = (calculatedHumanMonthlyCost - aiTotalMonthlyCost + potentialRevenueFromMissedCalls) * 12;
    // 2. Subtract the full one-time setup fee
    const firstYearNetReturn_clearer = annualOperationalGain - aiSetupFee;

    // Update the results state
    setResults({
      totalCalls: totalMonthlyCalls,
      missedCalls: totalMissedCalls,
      salesMissedCalls: salesMissedCalls,
      totalMinutes: totalMinutes,
      aiBaseCost: aiBaseCost,
      aiMinuteCost: aiUsageCost,
      aiSetupFee: aiSetupFee,
      aiSetupFeeMonthly: aiSetupFeeMonthly,
      aiTotalMonthlyCost: aiTotalMonthlyCost,
      aiTotalCostWithSetup: aiTotalCostWithSetup,
      humanCost: calculatedHumanMonthlyCost,
      potentialRevenue: potentialRevenueFromMissedCalls,
      costSavings: costSavings, // Monthly savings vs effective AI cost
      netBenefit: totalBenefit, // Monthly benefit including savings & revenue
      roi: roi, // Monthly ROI based on effective cost
      paybackPeriod: paybackPeriodMonths, // Payback period in months
      yearlyCostSavings: yearlyCostSavings, // Based on recurring costs
      yearlyPotentialRevenue: yearlyPotentialRevenue,
      yearlyNetBenefit: yearlyNetBenefit, // Before setup fee
      // Store only the first year net return
      firstYearNetReturn: firstYearNetReturn_clearer,
    });

  }, [ // Dependencies array
    businessHourCalls, afterHourCalls, missedBusinessHourCalls, avgCallDuration,
    avgLeadValue, conversionRate, salesCallPercentage, daysOpen,
    aiSubscriptionCost, aiPerMinuteCost, aiSetupFee,
    humanHourlyWage, humanHoursPerWeek, humanOverheadPercentage
  ]);

  // --- Input Handler Function ---
  // Handles number input changes, performs validation, and updates state
  const handleNumberInputChange = (setter, errorKey, value, min = 0, max = Infinity) => {
      const numValue = parseFloat(value);
      const isValid = !isNaN(numValue) && numValue >= min && numValue <= max;
      // Update specific input error state
      setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: !isValid }));
      // Set the value, clamping to min/max if invalid but numeric, or setting to min if NaN
      if (isNaN(numValue)) { setter(min); }
      else if (numValue < min) { setter(min); }
      else if (numValue > max) { setter(max); }
      else { setter(numValue); }
  };

  // --- Helper Function for Payback Period Text ---
  // Formats the payback period from months into a user-friendly string (Months or Years)
  const formatPaybackPeriod = (periodInMonths) => {
    if (!isFinite(periodInMonths) || periodInMonths <= 0) {
      return "N/A"; // Not applicable if no benefit or infinite payback
    }
    if (periodInMonths > 12) {
      // Display in years if over 12 months
      return `${(periodInMonths / 12).toLocaleString(undefined, { maximumFractionDigits: 1 })} Years`;
    }
    // Display in months otherwise
    return `${periodInMonths.toLocaleString(undefined, { maximumFractionDigits: 1 })} Months`;
  };

  // --- Print Function ---
  const handlePrint = () => {
    window.print(); // Triggers the browser's print dialog
  };

  // --- JSX Rendering ---
  return (
    // Main container with padding and max width
    // Add PrintStyles component to include print-specific CSS
    <>
      <PrintStyles />
      {/* Add id="printable-area" to the main container you want to print */}
      <div id="printable-area" className="p-4 max-w-6xl mx-auto font-sans print-p-0">
        <Card className="w-full print-shadow-none print-border-none">
          {/* Card Header with black background and white text */}
          <CardHeader className="bg-black text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl">AI Receptionist ROI Calculator</CardTitle>
             {/* Updated subtitle text color for better contrast on black */}
             <p className="text-center text-sm text-gray-300 mt-1">Compare AI vs. Human Receptionist Costs & Benefits</p>
          </CardHeader>

          {/* Card Content area */}
          <CardContent className="p-6">
            {/* Grid layout for Inputs and Main Results - Force single column on print */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-grid-cols-1">

              {/* Left Column: Contains all input sections */}
              <div className="space-y-8">
                {/* Business Profile & Call Volume Section */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Business Profile & Call Volume</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Industry Selection Dropdown */}
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium mb-1 text-gray-600">Industry</label>
                      <select id="industry" value={industry} onChange={handleIndustryChange} className="w-full p-2 border border-gray-300 rounded focus:ring-[#8cc63f] focus:border-[#8cc63f] transition duration-150">
                        {/* Map over industry presets to create options */}
                        {Object.keys(industryPresets).map(key => (<option key={key} value={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select industry for typical Lead Value & Conversion Rate presets.</p>
                    </div>
                    {/* Days Open Selection Dropdown */}
                    <div>
                      <label htmlFor="daysOpen" className="block text-sm font-medium mb-1 text-gray-600">Business Operating Days</label>
                      <select id="daysOpen" value={daysOpen} onChange={(e) => setDaysOpen(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-[#8cc63f] focus:border-[#8cc63f] transition duration-150">
                        <option value="weekdays">Monday-Friday (5 days/week)</option>
                        <option value="sixdays">Monday-Saturday (6 days/week)</option>
                        <option value="alldays">All Days (7 days/week)</option>
                      </select>
                    </div>
                    {/* Business Hours Calls Input */}
                    <div>
                      <label htmlFor="businessHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Calls (Business Hours)</label>
                      <input id="businessHourCalls" type="number" min="0" value={businessHourCalls} onChange={(e) => handleNumberInputChange(setBusinessHourCalls, 'businessHourCalls', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.businessHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                      {/* Display error message if input is invalid */}
                      {inputErrors.businessHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                    </div>
                    {/* After Hours Calls Input */}
                    <div>
                      <label htmlFor="afterHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Calls (After Hours)</label>
                      <input id="afterHourCalls" type="number" min="0" value={afterHourCalls} onChange={(e) => handleNumberInputChange(setAfterHourCalls, 'afterHourCalls', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.afterHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                      {inputErrors.afterHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                    </div>
                    {/* Missed Business Hour Calls Input */}
                    <div>
                      <label htmlFor="missedBusinessHourCalls" className="block text-sm font-medium mb-1 text-gray-600">Avg. Daily Missed Calls (Business Hours)</label>
                      <input id="missedBusinessHourCalls" type="number" min="0" value={missedBusinessHourCalls} onChange={(e) => handleNumberInputChange(setMissedBusinessHourCalls, 'missedBusinessHourCalls', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.missedBusinessHourCalls ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                      {inputErrors.missedBusinessHourCalls && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                    </div>
                    {/* Average Call Duration Input */}
                    <div>
                      <label htmlFor="avgCallDuration" className="block text-sm font-medium mb-1 text-gray-600">Average Call Duration (minutes)</label>
                      <input id="avgCallDuration" type="number" min="0" step="0.5" value={avgCallDuration} onChange={(e) => handleNumberInputChange(setAvgCallDuration, 'avgCallDuration', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.avgCallDuration ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                      {inputErrors.avgCallDuration && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Pricing Tier Selection */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Select AI Pricing Tier</CardTitle> </CardHeader>
                   <CardContent>
                     {/* Grid for pricing tier cards */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       {/* Map over pricing tiers to display each one */}
                       {Object.entries(pricingTiers).map(([key, tier]) => (
                         <div
                           key={key}
                           className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 ${
                             selectedTier === key
                               ? 'border-[#8cc63f] bg-[#eaf6da] shadow-lg ring-2 ring-[#8cc63f] ring-opacity-50' // Use new color for selected tier
                               : 'border-gray-300 hover:border-[#8cc63f] hover:bg-gray-50' // Use new color for hover border
                           } ${key === 'professional' ? 'relative' : ''}`}
                           onClick={() => setSelectedTier(key)} // Set selected tier on click
                         >
                           {/* Add a "Recommended" badge for the professional tier */}
                           {key === 'professional' && (
                             <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 no-print"> {/* Hide badge on print */}
                               {/* Use new color for badge background */}
                               <span className="bg-[#8cc63f] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                                 RECOMMENDED
                               </span>
                             </div>
                           )}
                           <div className={`text-center mb-2 ${key === 'professional' ? 'mt-3' : ''}`}> {/* Adjust margin for badge */}
                              {/* Use darker shade of new color for tier name text */}
                              <div className="text-md font-bold text-[#5a8228]">{tier.name}</div>
                              <div className="text-xs text-gray-500">{tier.description}</div>
                           </div>
                           {/* Display tier pricing details */}
                           <div className="space-y-1.5 mt-3 text-sm">
                              <div className="flex justify-between"><span>Setup:</span><span className="font-medium">${tier.setupFee.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Monthly:</span><span className="font-medium">${tier.monthlyCost.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span>Per Minute:</span><span className="font-medium">${tier.perMinuteCost.toFixed(2)}</span></div>
                           </div>
                         </div>
                       ))}
                     </div>
                     <p className="text-xs text-gray-500 mt-3 text-center">Click a tier to update the AI cost calculations.</p>
                   </CardContent>
                </Card>

                {/* Revenue & Human Cost Data Section */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Revenue & Current Staff Costs</CardTitle> </CardHeader>
                   <CardContent className="space-y-4">
                     {/* Sales Call Percentage Input */}
                     <div>
                       <label htmlFor="salesCallPercentage" className="block text-sm font-medium mb-1 text-gray-600">Sales Opportunity Calls (%)</label>
                       <input id="salesCallPercentage" type="number" min="0" max="100" value={salesCallPercentage} onChange={(e) => handleNumberInputChange(setSalesCallPercentage, 'salesCallPercentage', e.target.value, 0, 100)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.salesCallPercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                       {inputErrors.salesCallPercentage && (<p className="text-red-500 text-xs mt-1">Please enter a value between 0 and 100.</p>)}
                     </div>
                     {/* Average Lead Value Input */}
                     <div>
                       <label htmlFor="avgLeadValue" className="block text-sm font-medium mb-1 text-gray-600">Average Value per Customer ($)</label>
                       <input id="avgLeadValue" type="number" min="0" value={avgLeadValue} onChange={(e) => handleNumberInputChange(setAvgLeadValue, 'avgLeadValue', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.avgLeadValue ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                        <p className="text-xs text-gray-500 mt-1">Include initial sale value + potential upsells/repeat business.</p>
                       {inputErrors.avgLeadValue && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                     </div>
                     {/* Conversion Rate Input */}
                     <div>
                       <label htmlFor="conversionRate" className="block text-sm font-medium mb-1 text-gray-600">Lead-to-Customer Conversion Rate (%)</label>
                       <input id="conversionRate" type="number" min="0" max="100" value={conversionRate} onChange={(e) => handleNumberInputChange(setConversionRate, 'conversionRate', e.target.value, 0, 100)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.conversionRate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                       {inputErrors.conversionRate && (<p className="text-red-500 text-xs mt-1">Please enter a value between 0 and 100.</p>)}
                     </div>
                     {/* Human Cost Inputs Section */}
                     <div className="pt-4 mt-4 border-t">
                         <h4 className="text-md font-semibold mb-2 text-gray-600">Current Human Receptionist Details</h4>
                         {/* Hourly Wage */}
                         <div>
                           <label htmlFor="humanHourlyWage" className="block text-sm font-medium mb-1 text-gray-600">Average Hourly Wage ($)</label>
                           <input id="humanHourlyWage" type="number" min="0" step="0.01" value={humanHourlyWage} onChange={(e) => handleNumberInputChange(setHumanHourlyWage, 'humanHourlyWage', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHourlyWage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                           {inputErrors.humanHourlyWage && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                         </div>
                         {/* Hours Per Week */}
                         <div className="mt-4">
                           <label htmlFor="humanHoursPerWeek" className="block text-sm font-medium mb-1 text-gray-600">Average Hours Worked per Week</label>
                           <input id="humanHoursPerWeek" type="number" min="0" value={humanHoursPerWeek} onChange={(e) => handleNumberInputChange(setHumanHoursPerWeek, 'humanHoursPerWeek', e.target.value)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHoursPerWeek ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                           {inputErrors.humanHoursPerWeek && (<p className="text-red-500 text-xs mt-1">Please enter a valid positive number.</p>)}
                         </div>
                         {/* Overhead Percentage */}
                          <div className="mt-4">
                           <label htmlFor="humanOverheadPercentage" className="block text-sm font-medium mb-1 text-gray-600">Estimated Overhead (%)</label>
                           <input id="humanOverheadPercentage" type="number" min="0" max="200" value={humanOverheadPercentage} onChange={(e) => handleNumberInputChange(setHumanOverheadPercentage, 'humanOverheadPercentage', e.target.value, 0, 200)} className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanOverheadPercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#8cc63f] focus:border-[#8cc63f]'}`}/>
                           <p className="text-xs text-gray-500 mt-1">Include benefits, taxes, software, office space, etc., as a percentage of wage cost.</p>
                           {inputErrors.humanOverheadPercentage && (<p className="text-red-500 text-xs mt-1">Please enter a valid percentage (e.g., 0-200).</p>)}
                         </div>
                     </div>
                   </CardContent>
                 </Card>

                {/* Calculate Button - Hide on print */}
                <div className="mt-6 no-print">
                  <button
                    onClick={() => {
                      // Scroll only if there are no validation errors
                      if (!validationError) {
                        const resultsSection = document.getElementById('results-section');
                        if (resultsSection) {
                          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
                    disabled={validationError} // Disable button if there are errors
                    className={`w-full font-bold py-3 px-4 rounded transition duration-200 ease-in-out text-white shadow-md hover:shadow-lg ${
                      validationError
                        ? 'bg-gray-400 cursor-not-allowed' // Style for disabled state
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer' // Style for enabled state
                    }`}
                  >
                    {validationError ? 'Please Fix Errors Above' : 'Calculate ROI & View Results'}
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    {/* Helper text below button */}
                    {validationError
                      ? 'Correct the highlighted fields to enable calculation.'
                      : 'Click to see your potential savings and revenue gains.'}
                  </p>
                </div>
              </div> {/* End Left Column */}


              {/* Right Column: Contains all results sections */}
              <div id="results-section" className="space-y-6">

                {/* Call Analysis Section */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold text-gray-700">Monthly Call Analysis</CardTitle> </CardHeader>
                   <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                     {/* Display Total Calls Handled */}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Total Calls Handled (Est.):</span>
                        <span className="font-medium text-gray-900">{results.totalCalls.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                     </div>
                      <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Business + After Hours)</p>
                     {/* Display Currently Missed Calls */}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Currently Missed Calls (Est.):</span>
                        <span className="font-medium text-red-600">{results.missedCalls.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                     </div>
                     <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Missed Business Hours + All After Hours)</p>
                     {/* Display Missed Sales Opportunities */}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Missed Sales Opportunities (Est.):</span>
                        <span className="font-medium text-red-700">{results.salesMissedCalls.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                     </div>
                      <p className="text-xs text-gray-500 -mt-2 pl-1"> (Missed Calls × Sales %)</p>
                   </CardContent>
                </Card>

                {/* AI Receptionist Cost Section */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold text-gray-700">AI Receptionist Cost ({pricingTiers[selectedTier]?.name} Tier)</CardTitle> </CardHeader>
                   <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                     {/* Display AI Setup Fee */}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">One-time Setup Fee:</span>
                        <span className="font-medium text-gray-900">${results.aiSetupFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                     {/* Display AI Monthly Subscription */}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Monthly Subscription:</span>
                        <span className="font-medium text-gray-900">${results.aiBaseCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                     {/* Display Estimated Monthly Usage Cost */}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Est. Monthly Usage Cost:</span>
                        <span className="font-medium text-gray-900">${results.aiMinuteCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                      <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> ({results.totalMinutes.toLocaleString(undefined, { maximumFractionDigits: 0 })} mins × ${aiPerMinuteCost.toFixed(2)}/min)</p>
                     {/* Display Total Monthly Recurring Cost */}
                     <div className="flex justify-between items-center border-t pt-2 mt-2">
                        <span className="text-sm font-semibold text-gray-800">Total Monthly Recurring Cost:</span>
                        {/* Use new color for this cost */}
                        <span className="font-semibold text-[#5a8228]">${results.aiTotalMonthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                      <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> (Subscription + Usage)</p>
                     {/* Display Effective Monthly Cost (Year 1) */}
                     <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-700">Effective Monthly Cost (Yr 1):</span>
                        <span className="font-medium text-gray-900">${results.aiTotalCostWithSetup.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                     <p className="text-xs text-gray-500 -mt-2 pl-1"> (Monthly Recurring + Setup Fee/12)</p>
                   </CardContent>
                </Card>

                {/* Human Receptionist Cost Section */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold text-gray-700">Calculated Human Receptionist Cost</CardTitle> </CardHeader>
                   <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                     {/* Display Estimated Monthly Human Cost */}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Est. Monthly Cost (Wages + Overhead):</span>
                        <span className="font-medium text-gray-900">${results.humanCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                      <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> Based on inputs: ${humanHourlyWage}/hr, {humanHoursPerWeek} hrs/wk, {humanOverheadPercentage}% overhead</p>
                     {/* Display Estimated Annual Human Cost */}
                     <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-700">Est. Annual Cost:</span>
                        <span className="font-medium text-gray-900">${(results.humanCost * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                   </CardContent>
                </Card>

                {/* Financial Impact Section */}
                {/* Let's update the colors here too for consistency */}
                <Card className="border border-[#8cc63f]/50 bg-[#eaf6da] print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold text-[#5a8228]">Monthly Financial Impact (AI vs. Human)</CardTitle> </CardHeader>
                   <CardContent className="p-4 space-y-3">
                     {/* Display Direct Cost Savings */}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-[#5a8228]">Direct Cost Savings (vs. Human):</span>
                        {/* Dynamically color based on positive/negative savings */}
                        <span className={`font-medium ${results.costSavings >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                           ${results.costSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                     </div>
                      <p className="text-xs text-gray-600 -mt-2 mb-2 pl-1"> (Calculated Human Cost - Effective Monthly AI Cost)</p>
                     {/* Display Potential Added Revenue */}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-[#5a8228]">Potential Added Revenue:</span>
                        <span className="font-medium text-green-700">
                           + ${results.potentialRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                     </div>
                     <p className="text-xs text-gray-600 -mt-2 mb-2 pl-1"> (From capturing missed sales calls)</p>
                     {/* Display Total Monthly Benefit */}
                     <div className="flex justify-between items-center border-t border-[#8cc63f]/30 pt-2 mt-2">
                        <span className="text-sm font-semibold text-[#5a8228]">Total Monthly Benefit:</span>
                        {/* Dynamically color based on positive/negative benefit */}
                        <span className={`font-semibold text-xl ${results.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           ${results.netBenefit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                     </div>
                      <p className="text-xs text-gray-600 -mt-2 pl-1"> (Cost Savings + Added Revenue)</p>
                   </CardContent>
                </Card>

                {/* ROI & Payback Section */}
                {/* Update colors here too */}
                <Card className="border border-green-300 bg-green-50 print-shadow-none print-border-none">
                   <CardHeader className="text-center"> <CardTitle className="text-lg font-semibold text-green-800">Potential Return on Investment (ROI)</CardTitle> </CardHeader>
                   <CardContent className="p-4 text-center space-y-4">
                     {/* Display Monthly ROI */}
                     <div>
                        <div className="text-4xl font-bold text-green-700">
                          {/* Format ROI percentage, handle non-finite cases */}
                          {isFinite(results.roi) && !isNaN(results.roi) ? `${results.roi.toLocaleString(undefined, { maximumFractionDigits: 0 })}%` : "N/A"}
                        </div>
                        <div className="text-sm text-gray-600">Monthly ROI</div>
                        <p className="text-xs text-gray-500 mt-1"> (Total Benefit / Effective Monthly AI Cost)</p>
                     </div>
                     {/* Display Payback Period */}
                     <div>
                        <div className="text-md font-semibold text-gray-700">Payback Period</div>
                        {/* Use new color for payback period */}
                        <div className="text-2xl font-bold text-[#5a8228] mt-1">
                          {/* Format payback period using helper function */}
                          {formatPaybackPeriod(results.paybackPeriod)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1"> (Time to recoup initial setup fee via Net Benefit)</p>
                     </div>
                   </CardContent>
                </Card>

                {/* Cost Comparison Chart */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold text-gray-700 mb-1">Monthly Cost & Benefit Comparison</CardTitle> </CardHeader>
                   <CardContent className="p-4">
                     {/* Container for the Recharts Bar Chart */}
                     {/* Important: Charts might not render perfectly in print/PDF */}
                     <div style={{ width: '100%', height: 280 }}>
                       <ResponsiveContainer>
                         <BarChart
                           data={[
                             // Data for the bar chart (single data point for monthly comparison)
                             {
                               name: 'Monthly',
                               'Human Cost (Calculated)': results.humanCost,
                               // Use new color for AI Cost bar fill
                               'AI Cost (Effective)': results.aiTotalCostWithSetup,
                               // Only show positive net benefit on the chart for clarity
                               'Net Benefit': results.netBenefit > 0 ? results.netBenefit : 0
                             }
                           ]}
                           margin={{ top: 5, right: 5, left: 15, bottom: 5 }} // Adjust margins for labels
                         >
                           <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                           <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                           <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} tick={{ fontSize: 10 }} />
                           <Tooltip
                              formatter={(value, name) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]} // Format tooltip values as currency
                              labelFormatter={() => 'Monthly Comparison'} // Tooltip title
                              cursor={{ fill: 'rgba(230, 230, 230, 0.3)' }} // Cursor style on hover
                              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} // Tooltip style
                           />
                           <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '10px' }} />
                           {/* Define the bars */}
                           <Bar dataKey="Human Cost (Calculated)" fill="#F87171" name="Human Cost (Calculated)" radius={[4, 4, 0, 0]} />
                           {/* Use new color for AI Cost bar */}
                           <Bar dataKey="AI Cost (Effective)" fill="#8cc63f" name="AI Cost (Incl. Setup/12)" radius={[4, 4, 0, 0]} />
                           <Bar dataKey="Net Benefit" fill="#34D399" name="Net Monthly Benefit" radius={[4, 4, 0, 0]} />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                   </CardContent>
                </Card>

              </div> {/* End Right Column */}

            </div> {/* End Grid */}


            {/* --- Key Insights Section (Moved Below Grid) --- */}
            {/* Update colors here */}
            <div className="mt-8">
                 <Card className="border border-indigo-200 bg-indigo-50 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold text-indigo-800">Key Insights & Annual Projections</CardTitle> </CardHeader>
                   <CardContent className="p-4 space-y-4 text-sm">

                     {/* First Year Net Return (After Setup Fee) - Highlighted Box */}
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                        <p className="font-medium text-gray-800 mb-1">First Year Net Return (After Setup Fee):</p>
                         <p className={`text-xl font-semibold ${results.firstYearNetReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           ${(results.firstYearNetReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         </p>
                         <p className="text-xs text-gray-500 mt-1">(Annual Operational Gain - Full Setup Fee)</p>
                     </div>

                     {/* --- DYNAMIC INSIGHTS LIST --- */}
                     <ul className="list-disc pl-5 space-y-2 text-gray-700">

                         {/* Insight 1: Overall Monthly Net Benefit */}
                         <li>
                             Overall, the AI solution projects a net monthly
                             {/* Dynamically show gain/loss */}
                             <span className={`font-semibold ${results.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                 {results.netBenefit >= 0 ? ' gain ' : ' loss '}
                                 of ${Math.abs(results.netBenefit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </span>
                             , combining cost savings and added revenue.
                         </li>

                          {/* Insight 2: Payback Period (Conditional rendering based on value) */}
                          {(results.paybackPeriod > 0 && isFinite(results.paybackPeriod)) && (
                              <li>
                                  The initial investment (setup fee of ${results.aiSetupFee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
                                  is estimated to be paid back within
                                  {/* Use new color for payback period text */}
                                  <span className="font-semibold text-[#5a8228]"> {formatPaybackPeriod(results.paybackPeriod)}</span>
                                  through the net monthly benefits
                                  {/* Add comment if payback is quick */}
                                  {results.paybackPeriod <= 12 && " (indicating a quick return)"}.
                              </li>
                          )}
                          {/* Case: Payback not possible due to negative benefit */}
                          {(results.paybackPeriod <= 0 || !isFinite(results.paybackPeriod)) && results.netBenefit <= 0 && (
                              <li>
                                  Based on the current inputs, the initial investment is not projected to be paid back via net benefits.
                              </li>
                          )}
                           {/* Case: Payback immediate due to positive benefit and no/low setup */}
                           {(results.paybackPeriod <= 0) && results.netBenefit > 0 && isFinite(results.paybackPeriod) && (
                               <li>
                                   With a positive net benefit and zero or negligible setup fee, the return is effectively immediate.
                               </li>
                           )}


                         {/* Insight 3: Potential Added Revenue (Show only if positive) */}
                         {results.potentialRevenue > 0 && (
                             <li>
                                 Capturing currently missed calls is estimated to add
                                 <span className="font-semibold text-green-600"> ${results.potentialRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                 in potential revenue each month.
                             </li>
                         )}

                         {/* Insight 4: Direct Cost Savings (Show only if non-zero) */}
                         {results.costSavings !== 0 && (
                              <li>
                                  Compared to the calculated human cost, the AI shows potential monthly
                                  {/* Dynamically show savings/increased cost */}
                                  <span className={`font-semibold ${results.costSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                       {results.costSavings >= 0 ? ' savings ' : ' increased cost '}
                                       of ${Math.abs(results.costSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                  (after factoring in the amortized setup fee).
                              </li>
                         )}

                         {/* Insight 5: First Year Net Return */}
                         <li>
                              After accounting for the full setup fee, the estimated net financial impact in the first year is
                              {/* Dynamically show gain/loss */}
                              <span className={`font-semibold ${results.firstYearNetReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                   {results.firstYearNetReturn >= 0 ? ' a gain ' : ' a loss '}
                                   of ${Math.abs(results.firstYearNetReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>.
                         </li>

                         {/* Insight 6: Potential Monthly ROI (Show only if finite and non-zero) */}
                         {isFinite(results.roi) && !isNaN(results.roi) && results.roi !== 0 && (
                              <li>
                                  This translates to a potential monthly ROI of
                                  {/* Dynamically color ROI */}
                                  <span className={`font-semibold ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                       {results.roi.toLocaleString(undefined, { maximumFractionDigits: 0 })}%
                                  </span>
                                  , comparing the total monthly benefit to the effective AI cost (including amortized setup).
                              </li>
                         )}

                     </ul>
                     {/* --- END DYNAMIC INSIGHTS LIST --- */}

                   </CardContent>
                 </Card>
            </div> {/* End Moved Key Insights Section Wrapper */}

            {/* --- Qualitative Benefits Section --- */}
            <div className="mt-8">
                 <Card className="border border-purple-200 bg-purple-50 print-shadow-none print-border-none">
                     <CardHeader>
                         <CardTitle className="text-lg font-semibold text-purple-800">Additional Potential Benefits (Qualitative)</CardTitle>
                     </CardHeader>
                     <CardContent className="p-4 text-sm text-gray-700">
                         <p className="mb-3">Beyond the quantifiable metrics above, consider how an AI receptionist addresses common operational challenges:</p>
                         {/* List focusing on problem -> solution -> benefit */}
                         <ul className="list-disc pl-5 space-y-2">
                             <li>
                                 <span className="font-medium">Never Miss a Call:</span> Unlike human staff needing breaks, vacations, or sick days, the AI operates 24/7/365, ensuring every incoming call during or after hours is answered promptly, maximizing lead capture and customer support availability.
                             </li>
                             <li>
                                 <span className="font-medium">Eliminate Hold Times:</span> Avoid frustrating callers with long waits or voicemail when staff are busy. The AI answers instantly, improving the customer experience and reducing hang-ups from impatient leads.
                             </li>
                             <li>
                                 <span className="font-medium">Guarantee Service Consistency:</span> Eliminate variations in service quality or accuracy due to human factors. The AI delivers standardized, error-free information and follows processes exactly the same way for every call.
                             </li>
                             <li>
                                 <span className="font-medium">Handle Peak Times Effortlessly:</span> Manage sudden increases in call volume without overwhelming staff or dropping calls. The AI scales instantly to meet demand, ensuring smooth operations during busy periods or marketing campaigns.
                             </li>
                              <li>
                                 <span className="font-medium">Free Up Your Team:</span> Offload repetitive call handling from your skilled staff. The AI manages routine inquiries, allowing your team to focus on complex issues, sales follow-ups, and higher-value customer interactions, boosting productivity.
                             </li>
                         </ul>
                     </CardContent>
                 </Card>
            </div>

            {/* --- Print Button Section (Hide on print) --- */}
            <div className="mt-8 text-center no-print">
              <button
                onClick={handlePrint}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow hover:shadow-md"
              >
                Print Results
              </button>
               <p className="text-xs text-gray-500 mt-2">
                 Use your browser's print dialog to save as PDF.
               </p>
            </div>

          </CardContent>
        </Card>
      </div> {/* End Printable Area */}
    </> // End Fragment
  );
}

// Export the component as default
export default AIReceptionistROICalculator;