import { BottomMenu } from "../components/bottom-menu";
import { Calendar } from "../components/calendar";

export function Main() {
  const name = "Leandro";

  return (
    <main className="h-screen p-4 pt-10 pb-16">
      <p className="pb-4">Olá {name}</p>
      <div className="bg-stone-50 shadow-md pt-2">
        <h2 className="font-medium">Aulas da semana</h2>
        <Calendar />
      </div>
      <BottomMenu />
    </main>
  );
}
