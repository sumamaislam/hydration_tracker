import { useEffect, useState } from "react";

export default function HydrationTracker() {
  
  const glassSize = 0.25; // each glass = 250ml (0.25 liters)
  const [step, setStep] = useState(() =>  parseInt (typeof window !== "undefined"  && localStorage.getItem("step")) || 1);
  const [weight, setWeight] = useState(() => typeof window !== "undefined"  &&  localStorage.getItem("weight") || '');
  const [targetLiters, setTargetLiters] = useState(() => parseFloat( typeof window !== "undefined"  && localStorage.getItem("targetLiters")) || null);
  const [glasses, setGlasses] = useState(() => parseFloat( typeof window !== "undefined"  && localStorage.getItem("glasses")) || 0);
  const [goalReached, setGoalReached] = useState(() => JSON.parse( typeof window !== "undefined"  && localStorage.getItem("goalReached")) || false);
  const [isExercising, setIsExercising] = useState(() => JSON.parse( typeof window !== "undefined"  && localStorage.getItem("isExercising")) || false);
  
  const [notification, setNotification] = useState('');
  const [reminder, setReminder] = useState('');
  useEffect(() => {
    localStorage.setItem("step", step);
    localStorage.setItem("weight", weight);
    localStorage.setItem("targetLiters", targetLiters);
    localStorage.setItem("glasses", glasses);
    localStorage.setItem("goalReached", goalReached);
    localStorage.setItem("isExercising", isExercising);
  }, [step, weight, targetLiters, glasses, goalReached, isExercising]);
  useEffect(() => {
    let reminderIntervalId;
    if (targetLiters) {
      // totalGlassesNeeded calculated as a number:
      const dailyGlasses = parseFloat((targetLiters / glassSize).toFixed(2));
      // Calculate interval (ms) as 24 hours divided by dailyGlasses
      const intervalMs = Math.floor(86400000 / dailyGlasses);
      reminderIntervalId = setInterval(() => {
        // Show reminder message for 10 seconds
        setReminder(`⏰ Time to drink water!`);
        setTimeout(() => setReminder(""), 10000);
      }, intervalMs);
    }
    return () => {
      if (reminderIntervalId) clearInterval(reminderIntervalId);
    };
  }, [targetLiters, glassSize]);

  const calculateTarget = () => {
    if (weight && !isNaN(weight)) {
      let calculated = parseFloat(weight) * 0.033;
      if (isExercising) {
        calculated += 0.5; // add extra water for exercise
      }
      const target = parseFloat(calculated.toFixed(2));
      setTargetLiters(target);
      setGlasses(0);
      setGoalReached(false);
      setNotification('');
      setStep(3);
    }
  };

  // Calculate total liters drunk
  const totalDrunk = parseFloat((glasses * glassSize).toFixed(2));
  // Calculate percentage for progress bar
  const percentage = targetLiters
    ? Math.min((totalDrunk / targetLiters) * 100, 100)
    : 0;

  // Add glass function: adjust addition if remaining is less than a full glass
  const addGlass = () => {
    const remainingLiters = targetLiters - totalDrunk;
    let glassToAdd = remainingLiters >= glassSize ? glassSize : remainingLiters;
    const newTotal = totalDrunk + glassToAdd;
    // Update glasses count based on new total liters
    setGlasses(parseFloat((newTotal / glassSize).toFixed(2)));

    if (newTotal >= targetLiters) {
      setGoalReached(true);
      setNotification("🎉 Congratulations! You have met your daily water goal!");
    } else {
      setNotification("");
    }
  };

  // Total glasses needed (as a decimal value) for display
  const totalGlassesNeeded = targetLiters ? (targetLiters / glassSize).toFixed(2) : 0;
  const remainingLtrs = targetLiters ? Math.max(targetLiters - totalDrunk, 0).toFixed(2) : 0;
  const remainingMl = (remainingLtrs * 1000).toFixed(0);

  const handleReset = () => {
    localStorage.clear();
    setStep(1);
    setWeight("");
    setGlasses(0);
    setTargetLiters(null);
    setIsExercising(false);
    setGoalReached(false);
    setNotification("");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white min-h-[100vh] rounded-xl shadow-xl text-center space-y-4 sm:max-w-sm">
      {/* Back Button */}
      {step !== 1 && (
        <button
          onClick={() => setStep((prev) => prev - 1)}
          className="mb-4 inline-block text-blue-600 font-semibold hover:underline"
        >
          ← Back
        </button>
      )}

      <h2 className="text-3xl mb-4 font-semibold text-blue-600">💧 Hydration Tracker</h2>

      {reminder && <div className="text-yellow-600 text-sm font-semibold">{reminder}</div>}

      {/* Step 1: Exercise Cards */}
      {step === 1 && (
        <div className="flex flex-col gap-4 justify-center mt-6">
          <div
            onClick={() => {
              setIsExercising(false);
              setStep(2);
            }}
            className="cursor-pointer p-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg text-white"
          >
            <h3 className="text-xl font-semibold">Without Exercise</h3>
            <p className="mt-2">Set hydration goal without extra water.</p>
          </div>
          <div
            onClick={() => {
              setIsExercising(true);
              setStep(2);
            }}
            className="cursor-pointer p-6 bg-gradient-to-r from-yellow-400 to-red-500 rounded-xl shadow-lg text-white"
          >
            <h3 className="text-xl font-semibold">With Exercise</h3>
            <p className="mt-2">Add 0.5L extra water for exercise.</p>
          </div>
        </div>
      )}

      {/* Step 2: Weight Input */}
      {step === 2 && (
        <>
          <input
            type="number"
            placeholder="Enter your weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-4 rounded-lg border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={calculateTarget}
            className="w-full bg-blue-500 text-white p-4 rounded-lg mt-4 hover:bg-blue-600"
          >
            Calculate Water Goal
          </button>
        </>
      )}

      {/* Step 3: Display Tracker */}
      {step === 3 && (
        <>
          <p className="text-gray-700">Weight: {weight} kg</p>
          <p className="text-gray-700">Exercise: {isExercising ? "Yes" : "No"}</p>
          <p className="text-xl font-bold text-gray-800">
            Daily Goal: {targetLiters} Liters ({totalGlassesNeeded} Glasses)
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <p className="font-semibold text-gray-700 mt-2">
            {totalDrunk} L / {targetLiters} L
          </p>
          <p className="text-gray-700">Glasses Drunk: {glasses.toFixed(2)}</p>

          {goalReached ? (
            <button
              className="bg-gray-400 text-white w-full p-4 rounded-lg cursor-not-allowed mt-4"
              disabled
            >
              Water Goal Reached! 🎉
            </button>
          ) : (
            <button
              onClick={addGlass}
              className="bg-blue-500 text-white w-full p-4 rounded-lg mt-4 hover:bg-blue-600"
              disabled={parseFloat(remainingLtrs) <= 0}
            >
              + Add {parseInt(remainingMl) >= 250 ? "1 Glass (250ml)" : `Remaining (${remainingMl}ml)`}
            </button>
          )}

          {notification && (
            <div className="mt-3 text-green-600 font-semibold">{notification}</div>
          )}

          {/* Reset Tracker Button */}
          <button
            onClick={handleReset}
            className="w-full bg-red-100 text-red-600 border border-red-400 mt-6 p-3 rounded-lg font-semibold hover:bg-red-200 transition-all"
          >
            🔄 Reset Tracker
          </button>
        </>
      )}
    </div>
  );
}

