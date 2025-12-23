import { Calendar } from "../components/calendar";

export function Main() {

  return (
    <>
      <div className="bg-stone-50 shadow-md flex flex-col h-full" style={{ minHeight: 0 }}>
        <Calendar />
      </div>
    </>
  );
}
