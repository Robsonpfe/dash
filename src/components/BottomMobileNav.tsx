import React from 'react';
import { LayoutDashboard, Ticket, BarChart3, Users, PlusCircle } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export const BottomMobileNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsNewTicketModalOpen, kpis } = useTickets();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Painel',
      icon: LayoutDashboard,
      badge: kpis.p1CriticalCount > 0 ? kpis.p1CriticalCount : null,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'tickets' as const,
      label: 'Chamados',
      icon: Ticket,
      badge: kpis.openCount + kpis.inProgressCount,
      badgeColor: 'bg-indigo-600',
    },
    {
      id: 'analytics' as const,
      label: 'SLAs',
      icon: BarChart3,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'team' as const,
      label: 'Equipe',
      icon: Users,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 pb-safe md:hidden">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center relative touch-manipulation"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                />
                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center font-mono ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-indigo-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Quick Action button */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="w-11 h-11 rounded-full bg-indigo-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform touch-manipulation"
            title="Abrir novo chamado"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center relative touch-manipulation"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                />
                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center font-mono ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-indigo-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
