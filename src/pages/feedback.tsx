import { useNavigate } from "react-router-dom";
import {
  useFeedback,
  useFilterOptions,
  useGroupedClasses,
  useStudentGroupedClasses,
} from "../hooks/useFeedback";
import { useAuth } from "../hooks/useAuth";
import { canViewAllFeedbacks } from "../utils/permissions";
import { useState } from "react";
import { FeedbackFilters } from "../components/feedback-filters";
import { FeedbackAdminView } from "../components/feedback-admin-view";
import { FeedbackStudentGroupedView } from "../components/feedback-student-grouped-view";
import { Pagination } from "../components/pagination";

export function Feedback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estado dos filtros aplicados (usado para a busca)
  const [appliedStyle, setAppliedStyle] = useState<string>("");
  const [appliedClass, setAppliedClass] = useState<string>("");
  const [appliedStartDate, setAppliedStartDate] = useState<string>("");
  const [appliedEndDate, setAppliedEndDate] = useState<string>("");

  // Estado dos filtros temporários (usado para edição)
  const [tempStyle, setTempStyle] = useState<string>("");
  const [tempClass, setTempClass] = useState<string>("");
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);

  const { feedbacks, isLoading, error, refetch, pagination } = useFeedback(
    currentPage,
    10,
    appliedStyle || undefined,
    appliedClass || undefined,
    appliedStartDate || undefined,
    appliedEndDate || undefined
  );

  const { styles, classes, isLoading: isLoadingFilters } = useFilterOptions();

  // Hook para turmas agrupadas (apenas para admin/professor/secretaria)
  const { classes: groupedClasses, isLoading: isLoadingClasses } =
    useGroupedClasses(
      appliedStyle || undefined,
      appliedClass || undefined,
      appliedStartDate || undefined,
      appliedEndDate || undefined
    );

  // Hook para turmas agrupadas do aluno
  const { classes: studentGroupedClasses, isLoading: isLoadingStudentClasses } =
    useStudentGroupedClasses(
      appliedStyle || undefined,
      appliedClass || undefined,
      appliedStartDate || undefined,
      appliedEndDate || undefined
    );

  function goToFeedbackDetails(feedbackId: number) {
    navigate(`/feedback/${feedbackId}`);
  }

  function goToClassFeedbacks(classId: number) {
    navigate(`/feedback/class/${classId}`);
  }

  function goToStudentClassFeedbacks(classId: number, date: string) {
    navigate(`/feedback/student/class/${classId}/${date}`);
  }

  const handleStyleFilter = (style: string) => {
    setTempStyle(style);
  };

  const handleClassFilter = (classValue: string) => {
    setTempClass(classValue);
  };

  const handleStartDateChange = (date: string) => {
    setTempStartDate(date);
  };

  const handleEndDateChange = (date: string) => {
    setTempEndDate(date);
  };

  const handleClearFilters = () => {
    setTempStyle("");
    setTempClass("");
    setTempStartDate("");
    setTempEndDate("");
    setAppliedStyle("");
    setAppliedClass("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedStyle(tempStyle);
    setAppliedClass(tempClass);
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    refetch();
  };

  const handleStudentClassClick = (groupId: string) => {
    // Extrai apenas o classId do groupId (formato: "classId-style-date")
    const [classId] = groupId.split("-");
    navigate(`/student-class-feedbacks/${classId}`);
  };

  // Verifica se há filtros não aplicados
  const hasUnappliedFilters =
    tempStyle !== appliedStyle ||
    tempClass !== appliedClass ||
    tempStartDate !== appliedStartDate ||
    tempEndDate !== appliedEndDate;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando feedbacks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const canViewAll = canViewAllFeedbacks(user || null);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold text-amber-900 mb-6">
        Histórico de Feedbacks
      </h1>

      <div className="p-4 w-full max-w-4xl">
        {/* Filtros */}
        <FeedbackFilters
          styles={styles}
          classes={classes}
          isLoading={isLoadingFilters}
          selectedStyle={tempStyle}
          selectedClass={tempClass}
          startDate={tempStartDate}
          endDate={tempEndDate}
          onStyleChange={handleStyleFilter}
          onClassChange={handleClassFilter}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
          hasUnappliedFilters={hasUnappliedFilters}
        />

        {/* Paginação */}
        {pagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <div className="w-full max-w-4xl p-4 text-center">
        {canViewAll ? (
          <FeedbackAdminView
            groupedClasses={groupedClasses}
            isLoading={isLoadingClasses}
            selectedStyle={appliedStyle}
            selectedClass={appliedClass}
            onClassClick={goToClassFeedbacks}
          />
        ) : (
          <FeedbackStudentGroupedView
            groupedClasses={studentGroupedClasses}
            isLoading={isLoadingStudentClasses}
            onClassClick={handleStudentClassClick}
          />
        )}
      </div>
    </div>
  );
}
