import { BottomMenu } from "../components/bottom-menu";
import { ListboxComponent } from "../components/list-box-component";
import { Textarea } from "@headlessui/react";

export function FeedbackDetails() {
  return (
    <main className="h-screen flex flex-col items-center pt-4">
      <div className="p-4 w-full">
        <span className="text-base font-semibold">Exame</span>
        <ListboxComponent />
      </div>
      <div className="w-full text-center h-full pb-16 flex flex-col justify-center">
        <h1 className="text-2xl">Turma X / Falamansa</h1>
        <div className="w-96 m-4 text-center bg-gray-100 border border-gray-400 rounded-lg mx-auto pt-4 shadow-md">
          <h1 className="text-xl font-semibold pb-2">Média avaliadores</h1>
          <div className="flex flex-col">
            <span>Parametro 1: 4</span>
            <span>Parametro 2: 2</span>
            <span>Parametro 3: 4</span>
            <span>Parametro 4: 5</span>
            <span>Parametro 5: 1</span>
          </div>
          <div className="pt-2">
            <span className="text-lg">Média: 2,8</span>
          </div>
          <div className="pt-2">
            <span className="text-lg text-red-600">Status: Reprovado</span>
          </div>
          <div className=" m-4 flex flex-col">
            <span className="text-base font-semibold">
              Feedback do avaliador
            </span>
            <Textarea
              className="min-h-20 mt-2 bg-gray-100 border border-gray-400 rounded-lg p-1 text-center"
              name="description"
            >
              Texto feedback avaliador
            </Textarea>
          </div>
        </div>
      </div>
      <BottomMenu />
    </main>
  );
}
