/**
 * Estilos customizados para o FullCalendar
 * Estes estilos sobrescrevem os estilos padrão do FullCalendar
 * para manter consistência visual com o design da aplicação
 */
export const FULLCALENDAR_STYLES = `
  .fc {
    font-family: inherit;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
  }
  @media (min-width: 769px) {
    .fc {
      height: auto !important;
    }
  }
  .fc-view-harness,
  .fc-view-harness-active {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }
  @media (min-width: 769px) {
    .fc-view-harness,
    .fc-view-harness-active {
      overflow: visible !important;
      height: auto !important;
    }
    .fc-scrollgrid {
      height: auto !important;
      max-width: 100%;
    }
    .fc-scrollgrid-section {
      height: auto !important;
    }
    .fc-scrollgrid-section-body {
      overflow-y: visible !important;
      overflow-x: hidden !important;
      height: auto !important;
    }
    .fc-timegrid-body {
      overflow-y: visible !important;
      overflow-x: hidden !important;
      height: auto !important;
    }
    .fc-timegrid-col {
      height: auto !important;
      max-width: 100%;
    }
    .fc-timegrid-col-frame {
      height: auto !important;
      max-width: 100%;
    }
    .fc-scrollgrid-sync-table {
      height: auto !important;
      max-width: 100%;
    }
    .fc-event {
      max-width: 100%;
      box-sizing: border-box;
      word-wrap: break-word;
    }
    .fc-scrollgrid-sync-inner {
      max-width: 100%;
    }
  }
  .fc-theme-standard td, .fc-theme-standard th {
    border-color: #e5e7eb;
  }
  .fc-col-header-cell {
    background: linear-gradient(to bottom, #ffffff, #f9fafb);
    padding: 12px 8px;
    font-weight: 600;
    font-size: 0.875rem;
    color: #111827;
    border-bottom: 2px solid #e5e7eb;
    text-transform: capitalize;
  }
  .fc-day-today {
    background-color: #fffbeb !important;
  }
  .fc-day-today .fc-col-header-cell-cushion {
    color: #92400e;
    font-weight: 700;
  }
  .fc-timegrid-col.fc-day-today {
    background-color: #fffbeb;
  }
  .fc-timegrid-slot-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
    padding: 4px 8px;
  }
  .fc-timegrid-slot-minor {
    border-color: #f9fafb;
  }
  .fc-event {
    border-radius: 6px;
    border-width: 2px;
    padding: 3px 6px;
    font-weight: 500;
    font-size: 0.8125rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .fc-event:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
  /* Estilo para eventos relacionados da mesma turma em hover */
  .fc-event-related-hover {
    opacity: 0.95 !important;
    filter: brightness(1.08);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
    transition: opacity 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
  }
  /* Estilo para o evento que está sendo hovered */
  .fc-event-related-active {
    opacity: 1 !important;
    transform: translateY(-1px);
    filter: brightness(1.12);
    z-index: 15 !important;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15) !important;
    transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
  }
  .fc-event-title {
    font-weight: 600;
    line-height: 1.4;
    color: #000000 !important;
  }
  .fc-event-time {
    font-weight: 600;
    opacity: 0.95;
    color: #000000 !important;
  }
  .fc-daygrid-day-number {
    font-weight: 600;
    color: #374151;
    padding: 8px;
  }
  .fc-day-today .fc-daygrid-day-number {
    background-color: #fbbf24;
    color: #78350f;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }
  .fc-timegrid-now-indicator-line {
    border-color: #ef4444;
    border-width: 2px;
    opacity: 0.9;
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.3);
  }
  .fc-timegrid-now-indicator-arrow {
    border-color: #ef4444;
    border-width: 0 6px 6px 6px;
  }
  .fc-button {
    background-color: #92400e;
    border-color: #92400e;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s;
  }
  .fc-button:hover {
    background-color: #78350f;
    border-color: #78350f;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .fc-button:active {
    transform: translateY(0);
  }
  .fc-today-button {
    background-color: #f59e0b;
    border-color: #f59e0b;
  }
  .fc-today-button:hover {
    background-color: #d97706;
    border-color: #d97706;
  }
  .fc-scrollgrid {
    border-color: #e5e7eb;
  }
  .fc-scrollgrid-section-header > td {
    border-color: #e5e7eb;
  }
  .fc-scrollgrid-sync-table {
    height: auto !important;
  }
  .fc-timegrid-body {
    overflow-y: visible !important;
  }
  .fc-scrollgrid-section-body {
    overflow-y: visible !important;
    overflow-x: hidden;
  }
  .fc-timegrid-slot {
    height: 3em;
    border-color: #f3f4f6;
  }
  @media (min-width: 769px) {
    .fc-view-harness,
    .fc-view-harness-active {
      overflow: visible;
    }
    .fc-scrollgrid {
      height: auto !important;
    }
    .fc-scrollgrid-section-body {
      overflow-y: visible !important;
      overflow-x: hidden !important;
      max-height: none !important;
    }
  }
  .fc-more-link {
    font-weight: 600;
    color: #92400e;
    padding: 2px 6px;
    border-radius: 4px;
    transition: all 0.2s;
  }
  .fc-more-link:hover {
    background-color: #fffbeb;
    color: #78350f;
  }
  @media (max-width: 768px) {
    .fc {
      flex: 1 1 0% !important;
      min-height: 0 !important;
    }
    .fc-view-harness,
    .fc-view-harness-active {
      overflow: hidden !important;
      flex: 1 1 0% !important;
      min-height: 0 !important;
    }
    .fc-scrollgrid {
      border: none;
      -webkit-overflow-scrolling: touch;
      height: 100% !important;
    }
    .fc-scrollgrid-section {
      border-left: none;
      border-right: none;
    }
    .fc-scrollgrid-section-body {
      overflow-y: auto !important;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
    .fc-col-header-cell {
      padding: 10px 4px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-left: none;
      border-right: none;
    }
    .fc-timegrid-slot {
      height: 2.5em;
    }
    .fc-timegrid-slot-label {
      font-size: 0.7rem;
      padding: 4px;
      font-weight: 600;
    }
    .fc-timegrid-slot-label-cushion {
      padding-right: 2px;
    }
    .fc-timegrid-col {
      border-left: none;
      border-right: 1px solid #e5e7eb;
    }
    .fc-timegrid-col:last-child {
      border-right: none;
    }
    .fc-event {
      font-size: 0.75rem;
      padding: 5px 6px;
      border-radius: 6px;
      font-weight: 600;
      margin: 2px;
      min-height: 26px;
      display: flex;
      align-items: center;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .fc-event:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
    /* Estilo para eventos relacionados em mobile */
    .fc-event-related-hover {
      opacity: 0.95 !important;
      filter: brightness(1.08);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
    }
    .fc-event-related-active {
      opacity: 1 !important;
      filter: brightness(1.12);
      z-index: 15 !important;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15) !important;
    }
    .fc-event-title {
      font-size: 0.75rem;
      line-height: 1.3;
      color: #000000 !important;
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .fc-event-time {
      font-size: 0.7rem;
      color: #000000 !important;
      font-weight: 700;
      margin-right: 4px;
      flex-shrink: 0;
    }
    .fc-day-today .fc-daygrid-day-number {
      width: 26px;
      height: 26px;
      font-size: 0.8rem;
    }
    .fc-timegrid-col-frame {
      padding-right: 2px;
      border-right-color: #e5e7eb;
    }
    .fc-scrollgrid-sync-inner {
      padding: 2px;
    }
    .fc-timegrid-event-harness {
      margin: 2px 0;
    }
    .fc-timegrid-col {
      min-width: 0;
    }
    .fc-more-link {
      font-size: 0.7rem;
      padding: 3px 6px;
      margin-top: 2px;
    }
    .fc-timegrid-slot {
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: rgba(146, 64, 14, 0.1);
    }
    .fc-timegrid-slot:active {
      background-color: rgba(146, 64, 14, 0.05);
    }
    .fc-timegrid-col-frame,
    .fc-timegrid-col {
      cursor: pointer;
      touch-action: manipulation;
    }
    .fc-timegrid-bg {
      pointer-events: auto;
    }
  }
`;