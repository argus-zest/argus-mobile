import React, { useState } from 'react';
import { MobileHeader } from './components/MobileHeader';
import { BottomNav, TabType } from './components/BottomNav';
import { CorridorsScreen } from './screens/CorridorsScreen';
import { MapScreen } from './screens/MapScreen';
import { ReportScreen } from './screens/ReportScreen';
import { CasesScreen } from './screens/CasesScreen';
import { HotspotDetailSheet } from './components/HotspotDetailSheet';
import { Hotspot } from './api/types';
import { MOCK_MOBILE_RISKS } from './mocks/data';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('corridors');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col max-w-md mx-auto shadow-2xl relative border-x border-slate-200">
      {/* Top Header */}
      <MobileHeader />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'corridors' && (
          <CorridorsScreen onSelectHotspot={(h) => setSelectedHotspot(h)} />
        )}
        {activeTab === 'map' && (
          <MapScreen onSelectHotspot={(h) => setSelectedHotspot(h)} />
        )}
        {activeTab === 'report' && <ReportScreen />}
        {activeTab === 'cases' && <CasesScreen />}
      </main>

      {/* Corridor Detail Sheet Modal */}
      {selectedHotspot && (
        <HotspotDetailSheet
          hotspot={selectedHotspot}
          risk={MOCK_MOBILE_RISKS[selectedHotspot.hotspot_id]}
          onClose={() => setSelectedHotspot(null)}
        />
      )}

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
