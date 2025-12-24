import { FiEdit2, FiUsers, FiCalendar, FiTrash2 } from "react-icons/fi";
import { Class } from "../types";

interface ClassCardProps {
  classItem: Class;
  teacher?: { id: number | string; name: string } | null;
  index?: number;
  formatSchedule: (classItem: Class) => string[] | null;
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
  onManageStudents: (classItem: Class) => void;
  onManageExceptions: (classItem: Class) => void;
  isMobile?: boolean;
}

export function ClassCard({
  classItem,
  teacher,
  index,
  formatSchedule,
  onEdit,
  onDelete,
  onManageStudents,
  onManageExceptions,
  isMobile = false,
}: ClassCardProps) {
  const scheduleGroups = classItem.recurringDays && classItem.recurringDays.length > 0 
    ? formatSchedule(classItem) 
    : null;

  if (isMobile) {
    return (
      <div
        className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-all"
        style={index !== undefined ? { animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` } : undefined}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base truncate">{classItem.name}</h3>
            {classItem.style && (
              <p className="text-xs text-gray-600 mt-0.5">Estilo: {classItem.style}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  classItem.active !== false
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {classItem.active !== false ? "Ativa" : "Inativa"}
              </span>
            </div>
          </div>
          <button
            onClick={() => onDelete(classItem)}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110 flex-shrink-0 ml-2"
            title="Excluir"
          >
            <FiTrash2 size={16} />
          </button>
        </div>

        <div className="space-y-1 mb-2 text-xs text-gray-600">
          {teacher && (
            <div className="flex items-center gap-1.5">
              <FiUsers className="w-3 h-3" />
              <span className="truncate">{teacher.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <FiUsers className="w-3 h-3" />
            <span>{classItem.studentsCount || 0} aluno(s)</span>
          </div>
          {scheduleGroups && scheduleGroups.length > 0 && (
            <div className="flex items-start gap-1.5">
              <FiCalendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col gap-0.5">
                {scheduleGroups.map((group, idx) => (
                  <span key={idx} className="text-[10px] text-gray-600">
                    {group}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onManageStudents(classItem)}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-xs"
          >
            <FiUsers size={14} />
            Alunos
          </button>
          <button
            onClick={() => onManageExceptions(classItem)}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors font-medium text-xs"
          >
            <FiCalendar size={14} />
            Cancelamentos
          </button>
          <button
            onClick={() => onEdit(classItem)}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-xs"
          >
            <FiEdit2 size={14} />
            Editar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all flex flex-col"
      style={index !== undefined ? { animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` } : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{classItem.name}</h3>
          {classItem.style && (
            <p className="text-sm text-gray-600 mb-1">Estilo: {classItem.style}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                classItem.active !== false
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {classItem.active !== false ? "Ativa" : "Inativa"}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(classItem)}
          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110 flex-shrink-0 ml-2"
          title="Excluir"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      {classItem.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{classItem.description}</p>
      )}

      <div className="space-y-2 mb-4 text-xs text-gray-600">
        {teacher && (
          <div className="flex items-center gap-2">
            <FiUsers className="w-4 h-4" />
            <span className="truncate">Prof: {teacher.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4" />
          <span>{classItem.studentsCount || 0} aluno(s)</span>
        </div>
        {scheduleGroups && scheduleGroups.length > 0 && (
          <div className="flex items-start gap-2">
            <FiCalendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-1">
              {scheduleGroups.map((group, idx) => (
                <span key={idx} className="text-xs text-gray-600">
                  {group}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
        <button
          onClick={() => onManageStudents(classItem)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-xs"
        >
          <FiUsers size={14} />
          Alunos
        </button>
        <button
          onClick={() => onManageExceptions(classItem)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors font-medium text-xs"
        >
          <FiCalendar size={14} />
          Cancelamentos
        </button>
        <button
          onClick={() => onEdit(classItem)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-xs"
        >
          <FiEdit2 size={14} />
          Editar
        </button>
      </div>
    </div>
  );
}

