import { Calendar } from "../components/calendar";

export function Main() {

  return (
    <>
      <div className="bg-stone-50 shadow-md flex flex-col flex-1" style={{ minHeight: 0 }}>
        <Calendar />
      </div>
    </>
  );
}
