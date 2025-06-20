interface FeedbackFiltersProps {
  styles: string[];
  classes: string[];
  isLoading: boolean;
  selectedStyle: string;
  selectedClass: string;
  startDate: string;
  endDate: string;
  onStyleChange: (style: string) => void;
  onClassChange: (classValue: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  hasUnappliedFilters?: boolean;
}

export function FeedbackFilters({
  styles,
  classes,
  isLoading,
  selectedStyle,
  selectedClass,
  startDate,
  endDate,
  onStyleChange,
  onClassChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  onApplyFilters,
  hasUnappliedFilters = false,
}: FeedbackFiltersProps) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Filtros</h3>
        {hasUnappliedFilters && (
          <div className="flex items-center text-amber-700 text-sm">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
            Filtros não aplicados
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Estilos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estilo
          </label>
          <select
            value={selectedStyle}
            onChange={(e) => onStyleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
          >
            <option value="">Todos os estilos</option>
            {styles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Turmas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Turma
          </label>
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
          >
            <option value="">Todas as turmas</option>
            {classes.map((classItem) => (
              <option key={classItem} value={classItem}>
                {classItem}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Data Inicial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Filtro de Data Final */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Botões de ação dos filtros */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Limpar Filtros
        </button>
        <button
          onClick={onApplyFilters}
          className={`px-4 py-2 text-white rounded-md transition-colors ${
            hasUnappliedFilters
              ? "bg-amber-700 hover:bg-amber-800"
              : "bg-amber-900 hover:bg-amber-800"
          }`}
        >
          {hasUnappliedFilters ? "Aplicar Filtros*" : "Aplicar Filtros"}
        </button>
      </div>
    </div>
  );
}
