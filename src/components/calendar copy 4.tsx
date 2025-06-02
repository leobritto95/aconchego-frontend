export function Calendar() {
  const calendar = [
    {
      date: "2023-01-07",
      times: [
        {
          time: "11:00 am",
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
          time: "09:00 am",
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
          time: "07:00 am",
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
          time: "12:00 am",
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
          time: "07:00 am",
          events: [
            {
              title: "Workout and Yoga Session",
              timeRange: "06:00 - 07:55",
              color: "green",
            },
          ],
        },
        {
          time: "10:00 am",
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
          time: "08:00 am",
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
          time: "10:00 am",
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
  ];

  return (
    <div className="relative">
      <div className="w-full mx-auto overflow-x-auto">
        {/* Cabeçalho com os dias da semana */}
        <div className="border-t border-gray-200 sticky top-0 left-0 w-full">
          <div className="p-3.5 flex items-center justify-center text-sm font-medium text-gray-900"></div>
          <div className="p-3.5 flex items-center justify-center text-sm font-medium text-gray-900">
            Jan 7
          </div>
          <div className="p-3.5 flex items-center justify-center text-sm font-medium text-gray-900">
            Jan 8
          </div>
          <div className="p-3.5 flex items-center justify-center text-sm font-medium text-indigo-600">
            Jan 9
          </div>
          <div className="p-3.5 flex items-center justify-center text-sm font-medium text-gray-900">
            Jan 10
          </div>
          <div className="p-3.5 flex items-center justify-center text-sm font-medium text-gray-900">
            Jan 11
          </div>
          <div className="p-3.5 flex items-center justify-center text-sm font-medium text-gray-900">
            Jan 12
          </div>
        </div>

        {/* Corpo da tabela de horários */}
        <div className="flex flex-col w-full overflow-x-auto">
          {calendar.map(({ date, times }) => (
            <div key={date} className="flex">
              {times.map(({ time, events }) => (
                <div className="flex">
                  {/* Coluna de horário */}
                  <div className="p-0.5 md:p-3.5 border-t border-r border-gray-200 flex items-end transition-all hover:bg-stone-100">
                    <span className="text-xs font-semibold text-gray-400">
                      {time}
                    </span>
                  </div>
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="w-56 min-w-28 flex flex-col gap-1 p-0.5 md:p-3.5 border-t border-r border-gray-200 transition-all hover:bg-stone-100"
                    >
                      {events.map(
                        (event, eventIndex) =>
                          colIndex === 0 && (
                            <div
                              key={eventIndex}
                              className={`rounded p-1.5 border-l-2 border-${event.color}-600 bg-${event.color}-50`}
                            >
                              <p className="text-xs font-normal text-gray-900 mb-px">
                                {event.title}
                              </p>
                              <p
                                className={`text-xs font-semibold text-${event.color}-600`}
                              >
                                {event.timeRange}
                              </p>
                            </div>
                          )
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
