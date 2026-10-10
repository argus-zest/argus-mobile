import React from 'react';
import { ShieldAlert, Map, Camera, FileText } from 'lucide-react';

export type TabType = 'corridors' | 'map' | 'report' | 'cases';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'corridors' as TabType, label: 'Corridors', icon: ShieldAlert },
    { id: 'map' as TabType, label: 'Live Map', icon: Map },
    { id: 'report' as TabType, label: 'Report', icon: Camera, highlight: true },
    { id: 'cases' as TabType, label: 'Cases', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#0c192c] text-white flex items-center justify-center shadow-md active:scale-95 transition">
                  <Icon className="w-5 h-5 text-sky-400" />
                </div>
                <span className="text-[10px] font-medium text-slate-700 mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-16 py-1 transition ${
                isActive ? 'text-[#0c192c] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#0c192c]' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
