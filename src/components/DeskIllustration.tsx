const DeskIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 3D Desk Platform */}
      <div className="relative">
        {/* Platform Base */}
        <div className="w-96 h-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full transform rotate-x-12 shadow-2xl relative overflow-hidden">
          {/* Platform surface gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-600/50 to-slate-700/50 rounded-full"></div>

          {/* Subtle platform details */}
          <div className="absolute inset-4 border border-slate-500/20 rounded-full"></div>
        </div>

        {/* Computer Monitor */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-4">
          <div className="relative">
            {/* Monitor Stand */}
            <div className="w-3 h-12 bg-slate-400 mx-auto rounded-sm shadow-lg"></div>
            <div className="w-16 h-4 bg-slate-500 mx-auto rounded-lg shadow-lg -mt-1"></div>

            {/* Monitor Screen */}
            <div className="w-32 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-xl border-4 border-slate-300 -mt-2">
              {/* Screen content */}
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-blue-500 rounded-md p-1">
                <div className="w-full h-2 bg-white/20 rounded-sm mb-1"></div>
                <div className="w-3/4 h-1 bg-white/30 rounded-sm mb-1"></div>
                <div className="w-1/2 h-1 bg-white/20 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Desk Lamp */}
        <div className="absolute top-4 left-8 transform -translate-y-2">
          <div className="relative">
            {/* Lamp Base */}
            <div className="w-8 h-3 bg-blue-600 rounded-full shadow-lg"></div>

            {/* Lamp Arm */}
            <div className="w-1 h-16 bg-blue-500 mx-auto rounded-full shadow-md transform -rotate-12 origin-bottom"></div>

            {/* Lamp Head */}
            <div className="w-8 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-full shadow-lg transform -translate-x-3 -translate-y-4 -rotate-12">
              <div className="w-6 h-4 bg-yellow-200 rounded-t-full mx-auto mt-1 shadow-inner"></div>
            </div>
          </div>
        </div>

        {/* Books Stack */}
        <div className="absolute top-12 right-12 transform translate-y-2">
          <div className="relative">
            <div className="w-12 h-2 bg-red-600 rounded-sm shadow-lg"></div>
            <div className="w-12 h-2 bg-green-600 rounded-sm shadow-lg -mt-0.5 transform rotate-1"></div>
            <div className="w-12 h-2 bg-blue-600 rounded-sm shadow-lg -mt-0.5 transform -rotate-1"></div>
          </div>
        </div>

        {/* Plant */}
        <div className="absolute top-6 right-20 transform -translate-y-1">
          <div className="relative">
            {/* Pot */}
            <div className="w-6 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-b-lg shadow-lg"></div>

            {/* Plant leaves */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-6 bg-green-500 rounded-full transform -rotate-12 shadow-md"></div>
              <div className="w-3 h-6 bg-green-400 rounded-full transform rotate-12 -mt-4 ml-2 shadow-md"></div>
              <div className="w-2 h-4 bg-green-600 rounded-full transform -rotate-45 -mt-2 ml-1 shadow-md"></div>
            </div>
          </div>
        </div>

        {/* Coffee Cup */}
        <div className="absolute top-14 left-20 transform translate-y-1">
          <div className="relative">
            <div className="w-6 h-6 bg-gradient-to-b from-slate-100 to-slate-200 rounded-b-lg shadow-lg border border-slate-300">
              {/* Coffee */}
              <div className="w-5 h-4 bg-gradient-to-b from-amber-900 to-amber-800 rounded-b-lg mx-auto mt-1"></div>
            </div>
            {/* Handle */}
            <div className="absolute right-0 top-2 w-2 h-3 border-2 border-slate-300 rounded-r-full"></div>
          </div>
        </div>

        {/* Notebook/Papers */}
        <div className="absolute top-16 left-1/2 transform -translate-x-8 translate-y-3">
          <div className="w-10 h-8 bg-white rounded-sm shadow-lg border border-slate-200 transform rotate-12">
            <div className="w-8 h-0.5 bg-slate-300 mx-auto mt-1 rounded"></div>
            <div className="w-6 h-0.5 bg-slate-300 mx-auto mt-1 rounded"></div>
            <div className="w-7 h-0.5 bg-slate-300 mx-auto mt-1 rounded"></div>
          </div>
        </div>

        {/* Mouse */}
        <div className="absolute top-20 left-1/2 transform translate-x-4 translate-y-2">
          <div className="w-4 h-6 bg-gradient-to-b from-slate-300 to-slate-400 rounded-lg shadow-md">
            <div className="w-2 h-3 bg-slate-200 rounded-lg mx-auto mt-0.5"></div>
          </div>
        </div>

        {/* Decorative particles */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full opacity-80 animate-pulse delay-300"></div>
          <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-70 animate-pulse delay-700"></div>
        </div>
      </div>
    </div>
  );
};

export default DeskIllustration;
