import { useState, useEffect, useCallback, useMemo } from "react";
import { News } from "../types";
import { useCreateNews, useUpdateNews } from "../hooks/useNews";

// Constantes
const TITLE_MAX_LENGTH = 100;
const TITLE_WARNING_THRESHOLD = 80;

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  news?: News | null;
}

interface NewsFormData {
  title: string;
  content: string;
  author: string;
  imageUrl: string;
}

const initialFormData: NewsFormData = {
  title: "",
  content: "",
  author: "",
  imageUrl: "",
};

export function NewsModal({ isOpen, onClose, news }: NewsModalProps) {
  const [formData, setFormData] = useState<NewsFormData>(initialFormData);
  const [imageError, setImageError] = useState(false);

  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();

  const isEditing = !!news;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setImageError(false);
      return;
    }

    if (news) {
      setFormData({
        title: news.title,
        content: news.content,
        author: news.author || "",
        imageUrl: news.imageUrl || "",
      });
      setImageError(false);
    } else {
      setFormData(initialFormData);
    }
  }, [news, isOpen]);

  // Validação do formulário
  const isFormValid = useMemo(
    () => formData.title.trim().length > 0 && formData.content.trim().length > 0,
    [formData.title, formData.content]
  );

  const titleValidation = useMemo(() => {
    const length = formData.title.length;
    return {
      length,
      remaining: TITLE_MAX_LENGTH - length,
      isOverLimit: length > TITLE_MAX_LENGTH,
      showWarning: length > TITLE_WARNING_THRESHOLD,
    };
  }, [formData.title]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isFormValid) {
        return;
      }

      try {
        if (isEditing && news) {
          await updateMutation.mutateAsync({
            id: news.id,
            newsData: formData,
          });
        } else {
          await createMutation.mutateAsync(formData);
        }
        onClose();
      } catch {
        // Erro já é tratado no hook
      }
    },
    [formData, isEditing, news, isFormValid, createMutation, updateMutation, onClose]
  );

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    setImageError(false);
    onClose();
  }, [onClose]);

  // Listener para fechar modal com ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isLoading, handleClose]);

  const handleFieldChange = useCallback(
    (field: keyof NewsFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (field === "imageUrl") {
        setImageError(false);
      }
    },
    []
  );

  const handleRemoveImage = useCallback(() => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-1 sm:p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-3xl max-h-[98vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-3 py-2.5 sm:px-6 sm:py-4 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-700 to-amber-800 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">
              {isEditing ? "Editar Notícia" : "Nova Notícia"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            disabled={isLoading}
            aria-label="Fechar"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-6">
            {/* Seção Principal - Título e Conteúdo */}
            <div className="space-y-3 sm:space-y-5 mb-4 sm:mb-6">
              {/* Título */}
              <div>
                <label
                  htmlFor="title"
                  className="flex text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 items-center gap-1.5"
                >
                  <span>Título</span>
                  <span className="text-red-500" aria-label="obrigatório">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={handleFieldChange("title")}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm sm:text-base ${
                      titleValidation.isOverLimit
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-amber-400"
                    }`}
                    placeholder="Digite o título da notícia"
                    required
                    disabled={isLoading}
                    maxLength={TITLE_MAX_LENGTH}
                  />
                  {titleValidation.showWarning && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div
                        className={`text-xs font-medium ${
                          titleValidation.isOverLimit ? "text-red-500" : "text-amber-600"
                        }`}
                      >
                        {titleValidation.remaining}
                      </div>
                    </div>
                  )}
                </div>
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${
                    titleValidation.isOverLimit ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  <span>
                    {titleValidation.length}/{TITLE_MAX_LENGTH} caracteres
                  </span>
                  {titleValidation.isOverLimit && (
                    <span className="text-red-500">• Limite excedido</span>
                  )}
                </p>
              </div>

              {/* Conteúdo */}
              <div>
                <label
                  htmlFor="content"
                  className="flex text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 items-center gap-1.5"
                >
                  <span>Conteúdo</span>
                  <span className="text-red-500" aria-label="obrigatório">*</span>
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={handleFieldChange("content")}
                  rows={5}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-y transition-all hover:border-amber-400 text-sm sm:text-base sm:rows-10 min-h-[120px] sm:min-h-[200px]"
                  placeholder="Digite o conteúdo da notícia..."
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length.toLocaleString("pt-BR")} caracteres
                </p>
              </div>
            </div>

            {/* Seção Secundária - Autor e Imagem */}
            <div className="border-t border-gray-200 pt-4 sm:pt-5">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-gray-200"></span>
                <span className="text-gray-500">Informações Adicionais (Opcional)</span>
                <span className="h-px flex-1 bg-gray-200"></span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Autor */}
                <div>
                  <label
                    htmlFor="author"
                    className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2"
                  >
                    Autor
                  </label>
                  <input
                    type="text"
                    id="author"
                    value={formData.author}
                    onChange={handleFieldChange("author")}
                    placeholder="Nome do autor"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all hover:border-amber-400 text-sm sm:text-base bg-gray-50"
                    disabled={isLoading}
                  />
                </div>

                {/* URL da Imagem */}
                <div>
                  <label
                    htmlFor="imageUrl"
                    className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2"
                  >
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleFieldChange("imageUrl")}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all hover:border-amber-400 text-sm sm:text-base bg-gray-50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Preview da Imagem */}
              {formData.imageUrl && (
                <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Preview da Imagem
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs text-red-600 hover:text-red-700 hover:underline"
                      disabled={isLoading}
                    >
                      Remover
                    </button>
                  </div>
                  <div className="w-full h-32 sm:h-56 md:h-64 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                    {imageError ? (
                      <div className="text-center p-4">
                        <svg
                          className="w-12 h-12 mx-auto text-red-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-xs text-red-500 font-medium">Erro ao carregar imagem</p>
                        <p className="text-xs text-gray-500 mt-1">Verifique se a URL está correta</p>
                      </div>
                    ) : (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-3 py-2.5 sm:px-6 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 sticky bottom-0 z-10">
          <div className="text-xs text-gray-500 hidden sm:block">
            <span className="text-red-500">*</span> Campos obrigatórios
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm text-sm sm:text-base order-2 sm:order-1"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-amber-800 text-white rounded-lg hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isEditing ? "Salvar Alterações" : "Criar Notícia"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

