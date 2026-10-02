import React from 'react';
import { TicketProvider, useTickets } from './context/TicketContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TicketsListView } from './components/TicketsListView';
import { TicketsKanbanView } from './components/TicketsKanbanView';
import { AnalyticsView } from './components/AnalyticsView';
import { TeamView } from './components/TeamView';
import { TicketDetailModal } from './components/TicketDetailModal';
import { NewTicketModal } from './components/NewTicketModal';
import { ToastNotification } from './components/ToastNotification';
import { DeviceSimulatorWrapper } from './components/DeviceSimulatorWrapper';
import { MobileDashboard } from './components/MobileDashboard';

const MainContent: React.FC = () => {
  const { activeTab, ticketViewLayout, viewMode } = useTickets();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tickets':
        return ticketViewLayout === 'list' ? <TicketsListView /> : <TicketsKanbanView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'team':
        return <TeamView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <Header />

      {/* Main Content Area */}
      {viewMode === 'mobile_preview' ? (
        <DeviceSimulatorWrapper />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Mobile Direct View (Clean, Non-Cluttered, Thumb-Optimized) */}
          <div className="block md:hidden">
            <MobileDashboard />
          </div>

          {/* Desktop Web View (Multi-column, High-Density Table / Kanban) */}
          <div className="hidden md:block">
            {renderActiveView()}
          </div>
        </main>
      )}

      {/* Modals & Live Toasts */}
      <TicketDetailModal />
      <NewTicketModal />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <TicketProvider>
      <MainContent />
    </TicketProvider>
  );
}
