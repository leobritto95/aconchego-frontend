import { useEffect, useMemo, useState } from "react";

let hasRun = false;

export function Calendar() {
  const calendar = useMemo(
    () => [
      {
        date: "2023-01-07",
        times: [
          {
            time: "11:00",
            events: [
              {
                title: "Daily Standup Meeting",
                timeRange: "10:00 - 11:00",
                color: "blue",
              },
            ],
          },
        ],
      },
      {
        date: "2023-01-08",
        times: [
          {
            time: "09:00",
            events: [
              {
                title: "Dancing Zumba",
                timeRange: "09:00 - 10:00",
                color: "blue",
              },
            ],
          },
        ],
      },
      {
        date: "2023-01-09",
        times: [
          {
            time: "07:00",
            events: [
              {
                title: "Pickup the grandmother",
                timeRange: "06:00 - 07:30",
                color: "purple",
              },
              {
                title: "Workout and Yoga Session",
                timeRange: "06:00 - 07:55",
                color: "green",
              },
            ],
          },
          {
            time: "12:00",
            events: [
              {
                title: "Meeting with Project Manager",
                timeRange: "12:00 - 12:50",
                color: "blue",
              },
            ],
          },
        ],
      },
      {
        date: "2023-01-10",
        times: [
          {
            time: "07:00",
            events: [
              {
                title: "Workout and Yoga Session",
                timeRange: "06:00 - 07:55",
                color: "green",
              },
            ],
          },
          {
            time: "10:00",
            events: [
              {
                title: "School Friend’s Birthday Party",
                timeRange: "10:00 - 11:45",
                color: "yellow",
              },
            ],
          },
        ],
      },
      {
        date: "2023-01-11",
        times: [
          {
            time: "08:00",
            events: [
              {
                title: "Project Task Review",
                timeRange: "08:00 - 08:25",
                color: "blue",
              },
            ],
          },
        ],
      },
      {
        date: "2023-01-12",
        times: [
          {
            time: "10:00",
            events: [
              {
                title: "Doctor’s Appointment for Mother",
                timeRange: "10:00 - 10:45",
                color: "purple",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const dates = useMemo(
    () => [
      "2023-01-07",
      "2023-01-08",
      "2023-01-09",
      "2023-01-10",
      "2023-01-11",
      "2023-01-12",
      "2023-01-13",
    ],
    []
  );

  const times = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00"];

  const [divs, setDivs] = useState<{ [key: string]: JSX.Element[] }>(() => {
    const initialDivs: { [key: string]: JSX.Element[] } = {};
    dates.forEach((date) => {
      times.forEach((time) => {
        initialDivs[date + "T" + time] = [];
      });
    });
    return initialDivs;
  });

  const addElementToDiv = (targetDiv: string, content: JSX.Element) => {
    setDivs((prevState) => ({
      ...prevState,
      [targetDiv]: [...prevState[targetDiv], content],
    }));
  };

  useEffect(() => {
    if (hasRun) return;

    calendar.forEach(({ date, times }) => {
      times.forEach(({ time, events }) => {
        events.forEach((event) => {
          addElementToDiv(
            `${date}T${time}`,
            <div
              className={`rounded p-1.5 border-l-2 border-${event.color}-600 bg-${event.color}-50`}
            >
              <p className="text-xs font-normal text-gray-900 mb-px">
                {event.title}
              </p>
              <p className={`text-xs font-semibold text-${event.color}-600`}>
                {event.timeRange}
              </p>
            </div>
          );
        });
      });
    });

    hasRun = true;
  }, [dates, calendar]);

  return (
    <div className="relative">
      <div className="w-full mx-auto overflow-x-auto">
        <div className="flex flex-col w-full overflow-x-auto">
          <div className="flex ">
            <div className="p-0.5 md:p-3.5 border-t border-r border-gray-200 flex items-end transition-all hover:bg-stone-100">
              <span className="text-xs font-semibold opacity-0">00:00</span>
            </div>
            {dates.map((date, dateIdx) => (
              <div
                key={dateIdx}
                className="sm:w-56 w-28 min-w-28 p-0.5 md:p-3.5 border-t border-r border-gray-200 flex items-end transition-all hover:bg-stone-100"
              >
                {date}
              </div>
            ))}
          </div>
          {times.map((time, timeIdx) => (
            <div key={timeIdx} className="flex">
              <div className="p-0.5 md:p-3.5 border-t border-r border-gray-200 flex items-end transition-all hover:bg-stone-100">
                <span className="text-xs font-semibold text-gray-400">
                  {time}
                </span>
              </div>
              {dates.map((date) => (
                <div key={date + "T" + time} className="flex">
                  <div
                    id={date + "T" + time}
                    className="sm:w-56 w-28 p-0.5 md:p-3.5 border-t border-r border-gray-200 flex items-end transition-all hover:bg-stone-100"
                  >
                    <span className="text-xs font-semibold text-gray-400">
                      {divs[date + "T" + time]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
