export function Calendar() {
  return (
    <div className="relative">
      <div className="grid sm:grid-cols-7 grid-cols-3 border-t border-gray-200 sticky top-0">
        {["Jan 7", "Jan 8", "Jan 9", "Jan 10", "Jan 11", "Jan 12"].map(
          (date, idx) => (
            <div
              key={idx}
              className={`p-3.5 text-sm font-medium flex justify-center ${
                date === "Jan 9" ? "text-indigo-600" : "text-gray-900"
              }`}
            >
              {date}
            </div>
          )
        )}
      </div>
      <div className="grid sm:grid-cols-7 grid-cols-3">
        <div className="border-t border-r border-gray-200 p-3 flex items-center">
          <span className="text-xs font-semibold text-gray-400">07:00 am</span>
        </div>
        <div className="border-t border-r border-gray-200 p-3 hover:bg-stone-100"></div>
        <div className="border-t border-r border-gray-200 p-3 hover:bg-stone-100">
          <div className="rounded p-2 border-l-2 border-purple-600 bg-purple-50">
            <p className="text-xs font-normal text-gray-900 mb-px">
              Pickup Grandmother
            </p>
            <p className="text-xs font-semibold text-purple-600">
              06:00 - 07:30
            </p>
          </div>
        </div>
        <div className="border-t border-r border-gray-200 p-3 hover:bg-stone-100">
          <div className="rounded p-2 border-l-2 border-green-600 bg-green-50">
            <p className="text-xs font-normal text-gray-900 mb-px">Workout</p>
            <p className="text-xs font-semibold text-green-600">
              06:00 - 07:55
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
