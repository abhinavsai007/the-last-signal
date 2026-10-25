import React, { useState, useEffect } from 'react';
import { RoomId, InventoryItem, JournalEntry, GameSettings, PuzzlesState, HauntingEvent } from './types/game';
import { OpeningSequence } from './components/OpeningSequence';
import { LandingPage } from './components/LandingPage';
import { IntroVideoSequence } from './components/IntroVideoSequence';
import { FacilityMap } from './components/FacilityMap';
import { AudioController } from './components/AudioController';
import { AccessibilityModal } from './components/AccessibilityModal';
import { InventoryModal } from './components/InventoryModal';
import { JournalModal } from './components/JournalModal';
import { IncidentReportModal } from './components/IncidentReportModal';
import { TransmissionLogModal } from './components/TransmissionLogModal';
import { FlashlightOverlay } from './components/FlashlightOverlay';
import { EndingSequence } from './components/EndingSequence';
import { RoomSurvivalHUD } from './components/RoomSurvivalHUD';
import { FACILITY_ROOMS } from './data/facilityData';

// 8 Room Components
import { ReceptionRoom } from './components/rooms/ReceptionRoom';
import { SecurityRoom } from './components/rooms/SecurityRoom';
import { ResearchLabRoom } from './components/rooms/ResearchLabRoom';
import { PatientWardRoom } from './components/rooms/PatientWardRoom';
import { MaintenanceTunnelRoom } from './components/rooms/MaintenanceTunnelRoom';
import { ArchiveRoom } from './components/rooms/ArchiveRoom';
import { RedRoom } from './components/rooms/RedRoom';
import { ExitRoom } from './components/rooms/ExitRoom';

import { audioEngine } from './services/audioEngine';
import { hauntingEngine } from './services/hauntingEngine';

type ActiveView = 'opening' | 'landing' | 'intro_video' | 'facility_map' | 'room' | 'ending';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: false,
  masterVolume: 0.7,
  ambientVolume: 0.5,
  musicVolume: 0.55,
  sfxVolume: 0.8,
  reducedMotion: false,
  lowIntensityVisuals: false,
  flashlightEffect: true
};

const DEFAULT_PUZZLES: PuzzlesState = {
  receptionBadgeCollected: false,
  receptionDoorUnlocked: false,
  securityTerminalUnlocked: false,
  securityCamChannel: 1,
  securitySilhouetteTriggered: false,
  labSymbolsSolved: false,
  wardRecordsInspected: [],
  wardCurtainInvestigated: false,
  tunnelCircuitSolved: false,
  tunnelTimerActive: false,
  tunnelTimeLeft: 60,
  archiveFilesFound: [],
  archiveMasterUnlocked: false,
  redRoomObserverSpottedCount: 0,
  redRoomGlyphsActivated: [],
  exitConsoleUnlocked: false,
  selectedEnding: null
};

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('opening');
  const [currentRoom, setCurrentRoom] = useState<RoomId | null>(null);

  // Facility progress states
  const [unlockedRooms, setUnlockedRooms] = useState<RoomId[]>(['reception']);
  const [clearedRooms, setClearedRooms] = useState<RoomId[]>([]);
  const [discoveredRooms, setDiscoveredRooms] = useState<RoomId[]>(['reception']);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [journalNotes, setJournalNotes] = useState<JournalEntry[]>([]);
  const [puzzlesState, setPuzzlesState] = useState<PuzzlesState>(DEFAULT_PUZZLES);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Active haunting event banner or screen glitch
  const [activeHaunt, setActiveHaunt] = useState<HauntingEvent | null>(null);

  // Modals
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIncidentReportOpen, setIsIncidentReportOpen] = useState(false);
  const [isTransmissionLogOpen, setIsTransmissionLogOpen] = useState(false);

  // Load saved game state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('last_signal_save_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.unlockedRooms) setUnlockedRooms(parsed.unlockedRooms);
        if (parsed.clearedRooms) setClearedRooms(parsed.clearedRooms);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.journalNotes) setJournalNotes(parsed.journalNotes);
        if (parsed.puzzlesState) setPuzzlesState(parsed.puzzlesState);
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }
    } catch {
      // Ignore corrupted save state
    }
  }, []);

  // Persist game state
  useEffect(() => {
    try {
      const stateToSave = {
        unlockedRooms,
        clearedRooms,
        inventory,
        journalNotes,
        puzzlesState,
        settings
      };
      localStorage.setItem('last_signal_save_state', JSON.stringify(stateToSave));
    } catch {}
  }, [unlockedRooms, clearedRooms, inventory, journalNotes, puzzlesState, settings]);

  // Dynamic Haunting Engine subscription
  useEffect(() => {
    hauntingEngine.start();
    const unsubscribe = hauntingEngine.subscribe((event) => {
      setActiveHaunt(event);
      setTimeout(() => {
        setActiveHaunt(null);
      }, event.durationMs);
    });

    return () => {
      hauntingEngine.stop();
      unsubscribe();
    };
  }, []);

  // Update haunting settings when accessibility changes
  useEffect(() => {
    hauntingEngine.setSettings(settings.lowIntensityVisuals, settings.reducedMotion);
  }, [settings.lowIntensityVisuals, settings.reducedMotion]);

  // Keep haunting engine notified of current room
  useEffect(() => {
    hauntingEngine.setRoom(currentRoom);
  }, [currentRoom]);

  // Inventory & Journal handlers
  const handleCollectItem = (item: InventoryItem) => {
    setInventory(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const handleAddJournal = (entry: JournalEntry) => {
    setJournalNotes(prev => {
      if (prev.some(e => e.id === entry.id)) return prev;
      return [entry, ...prev];
    });
  };

  const handleUnlockRoom = (roomId: RoomId) => {
    setUnlockedRooms(prev => {
      if (prev.includes(roomId)) return prev;
      return [...prev, roomId];
    });
    setDiscoveredRooms(prev => {
      if (prev.includes(roomId)) return prev;
      return [...prev, roomId];
    });
  };

  const handleMarkRoomCleared = (roomId: RoomId) => {
    setClearedRooms(prev => {
      if (prev.includes(roomId)) return prev;
      return [...prev, roomId];
    });
  };

  const handleNavigateToRoom = (roomId: RoomId) => {
    setCurrentRoom(roomId);
    setActiveView('room');
    audioEngine.playStaticBurst(0.2, 0.2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleResetGame = () => {
    setUnlockedRooms(['reception']);
    setClearedRooms([]);
    setDiscoveredRooms(['reception']);
    setInventory([]);
    setJournalNotes([]);
    setPuzzlesState(DEFAULT_PUZZLES);
    setCurrentRoom(null);
    setActiveView('landing');
    localStorage.removeItem('last_signal_save_state');
    audioEngine.playTerminalBeep('success');
  };

  const handleTriggerEscape = (endingType: 'A' | 'B' | 'C') => {
    setPuzzlesState(prev => ({ ...prev, selectedEnding: endingType }));
    setActiveView('ending');
  };

  return (
    <div className={`relative min-h-screen bg-[#050505] text-[#E8E8E8] selection:bg-red-950 selection:text-red-200 ${
      activeHaunt?.type === 'flicker' && !settings.lowIntensityVisuals ? 'animate-flicker' : ''
    }`}>
      {/* Dynamic Flashlight Beam (follows cursor unless touch or disabled) */}
      <FlashlightOverlay
        enabled={settings.flashlightEffect && !settings.reducedMotion}
        intensity={currentRoom === 'red_room' ? 0.9 : 0.8}
        color={currentRoom === 'red_room' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(220, 240, 255, 0.08)'}
      />

      {/* Floating Audio & Accessibility HUD */}
      <AudioController
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Dynamic Supernatural Event Overlay Banner */}
      {activeHaunt && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top duration-300">
          <div className="px-4 py-1.5 bg-black/90 border border-red-900/90 text-red-500 font-terminal text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(179,0,24,0.4)]">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span className="animate-glitch font-bold">
              {activeHaunt.text || 'ANOMALOUS ELECTROMAGNETIC SURGE DETECTED'}
            </span>
          </div>
        </div>
      )}

      {/* VIEW: Opening Sequence */}
      {activeView === 'opening' && (
        <OpeningSequence
          onComplete={() => setActiveView('landing')}
          reducedMotion={settings.reducedMotion}
        />
      )}

      {/* VIEW: Main Landing Page */}
      {activeView === 'landing' && (
        <LandingPage
          onEnterFacility={() => setActiveView('intro_video')}
          onOpenIncidentReport={() => setIsIncidentReportOpen(true)}
          onOpenTransmissionLog={() => setIsTransmissionLogOpen(true)}
          reducedMotion={settings.reducedMotion}
        />
      )}

      {/* VIEW: Cinematic Horror Intro Video */}
      {activeView === 'intro_video' && (
        <IntroVideoSequence
          onComplete={() => setActiveView('facility_map')}
          reducedMotion={settings.reducedMotion}
        />
      )}

      {/* VIEW: Facility Blueprint Map */}
      {activeView === 'facility_map' && (
        <FacilityMap
          currentRoom={currentRoom}
          unlockedRooms={unlockedRooms}
          clearedRooms={clearedRooms}
          discoveredRooms={discoveredRooms}
          inventory={inventory}
          onSelectRoom={handleNavigateToRoom}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenJournal={() => setIsJournalOpen(true)}
          onReturnToSurface={() => setActiveView('landing')}
        />
      )}

      {/* VIEW: Playable Rooms 1-8 */}
      {activeView === 'room' && (
        <div className="min-h-screen flex flex-col justify-between">
          {/* Survival Countdown Timer with Jumpscare & "THE GHOST GOT YOU" on failure */}
          <RoomSurvivalHUD
            currentRoom={currentRoom}
            roomName={currentRoom ? (FACILITY_ROOMS[currentRoom]?.name || 'CLASSIFIED SECTOR') : 'SECTOR'}
            isRoomCleared={currentRoom ? clearedRooms.includes(currentRoom) : false}
            onRetryRoom={() => {
              // Retry sector
            }}
            onReturnToMap={() => setActiveView('facility_map')}
            reducedMotion={settings.reducedMotion}
          />
          <div className="flex-1">
            {/* Room 1: Reception */}
            {currentRoom === 'reception' && (
              <ReceptionRoom
                onCollectItem={handleCollectItem}
                onAddJournal={handleAddJournal}
                onUnlockRoom={handleUnlockRoom}
                onNavigateToRoom={handleNavigateToRoom}
                onReturnToMap={() => setActiveView('facility_map')}
                inventory={inventory}
                badgeCollected={puzzlesState.receptionBadgeCollected}
                doorUnlocked={unlockedRooms.includes('security')}
              />
            )}

            {/* Room 2: Security Room */}
            {currentRoom === 'security' && (
              <SecurityRoom
                onCollectItem={handleCollectItem}
                onAddJournal={handleAddJournal}
                onUnlockRoom={handleUnlockRoom}
                onNavigateToRoom={handleNavigateToRoom}
                onReturnToMap={() => setActiveView('facility_map')}
                inventory={inventory}
                terminalUnlocked={puzzlesState.securityTerminalUnlocked || unlockedRooms.includes('lab')}
                onUnlockTerminal={() => {
                  setPuzzlesState(prev => ({ ...prev, securityTerminalUnlocked: true }));
                  handleMarkRoomCleared('security');
                }}
              />
            )}

            {/* Room 3: Research Laboratory */}
            {currentRoom === 'lab' && (
              <ResearchLabRoom
                onCollectItem={handleCollectItem}
                onAddJournal={handleAddJournal}
                onUnlockRoom={handleUnlockRoom}
                onNavigateToRoom={handleNavigateToRoom}
                onReturnToMap={() => setActiveView('facility_map')}
                inventory={inventory}
                symbolsSolved={puzzlesState.labSymbolsSolved || unlockedRooms.includes('ward')}
                onSolveSymbols={() => {
                  setPuzzlesState(prev => ({ ...prev, labSymbolsSolved: true }));
                  handleMarkRoomCleared('lab');
                }}
              />
            )}

            {/* Room 4: Patient Ward */}
            {currentRoom === 'ward' && (
              <PatientWardRoom
                onCollectItem={handleCollectItem}
                onAddJournal={handleAddJournal}
                onUnlockRoom={handleUnlockRoom}
                onNavigateToRoom={handleNavigateToRoom}
                onReturnToMap={() => setActiveView('facility_map')}
                inventory={inventory}
                inspectedRecords={puzzlesState.wardRecordsInspected}
                onInspectRecord={(recId) => {
                  setPuzzlesState(prev => ({
                    ...prev,
                    wardRecordsInspected: Array.from(new Set([...prev.wardRecordsInspected, recId]))
                  }));
                }}
                curtainInvestigated={puzzlesState.wardCurtainInvestigated}
                onInvestigateCurtain={() => {
                  setPuzzlesState(prev => ({ ...prev, wardCurtainInvestigated: true }));
                }}
                tunnelUnlocked={unlockedRooms.includes('tunnel')}
                onUnlockTunnel={() => {
                  handleMarkRoomCleared('ward');
                }}
              />
            )}

            {/* Room 5: Maintenance Tunnel */}
            {currentRoom === 'tunnel' && (
              <MaintenanceTunnelRoom
                onCollectItem={handleCollectItem}
                onAddJournal={handleAddJournal}
                onUnlockRoom={handleUnlockRoom}
                onNavigateToRoom={handleNavigateToRoom}
                onReturnToMap={() => setActiveView('facility_map')}
                inventory={inventory}
                circuitSolved={puzzlesState.tunnelCircuitSolved || unlockedRooms.includes('archive')}
                onSolveCircuit={() => {
                  setPuzzlesState(prev => ({ ...prev, tunnelCircuitSolved: true }));
                  handleMarkRoomCleared('tunnel');
                }}
                reducedMotion={settings.reducedMotion}
              />
            )}

            {/* Room 6: Archive Room */}
            {currentRoom === 'archive' && (
              <ArchiveRoom
                onCollectItem={handleCollectItem}
                onAddJournal={handleAddJournal}
                onUnlockRoom={handleUnlockRoom}
                onNavigateToRoom={handleNavigateToRoom}
                onReturnToMap={() => setActiveView('facility_map')}
                inventory={inventory}
                archiveFilesFound={puzzlesState.archiveFilesFound}
                onFindArchiveFile={(fId) => {
                  setPuzzlesState(prev => ({
                    ...prev,
                    archiveFilesFound: Array.from(new Set([...prev.archiveFilesFound, fId]))
                  }));
                }}
                masterUnlocked={puzzlesState.archiveMasterUnlocked || unlockedRooms.includes('red_room')}
                onUnlockMaster={() => {
                  setPuzzlesState(prev => ({ ...prev, archiveMasterUnlocked: true }));
                  handleMarkRoomCleared('archive');
                }}
              />
            )}

            {/* Room 7: The Red Room */}
            {currentRoom === 'red_room' && (
              <RedRoom
                onCollectItem={handleCollectItem}
                onAddJournal={handleAddJournal}
                onUnlockRoom={handleUnlockRoom}
                onNavigateToRoom={handleNavigateToRoom}
                onReturnToMap={() => setActiveView('facility_map')}
                inventory={inventory}
                observerSpottedCount={puzzlesState.redRoomObserverSpottedCount}
                onSpotObserver={() => {
                  setPuzzlesState(prev => ({
                    ...prev,
                    redRoomObserverSpottedCount: prev.redRoomObserverSpottedCount + 1
                  }));
                }}
                glyphsActivated={puzzlesState.redRoomGlyphsActivated}
                onActivateGlyph={(glyphId) => {
                  setPuzzlesState(prev => ({
                    ...prev,
                    redRoomGlyphsActivated: Array.from(new Set([...prev.redRoomGlyphsActivated, glyphId]))
                  }));
                }}
                exitUnlocked={unlockedRooms.includes('exit')}
                onUnlockExit={() => {
                  handleMarkRoomCleared('red_room');
                }}
                reducedMotion={settings.reducedMotion}
              />
            )}

            {/* Room 8: The Exit */}
            {currentRoom === 'exit' && (
              <ExitRoom
                onCollectItem={handleCollectItem}
                onAddJournal={handleAddJournal}
                onNavigateToRoom={handleNavigateToRoom}
                onReturnToMap={() => setActiveView('facility_map')}
                inventory={inventory}
                onTriggerEscape={handleTriggerEscape}
              />
            )}
          </div>
        </div>
      )}

      {/* VIEW: Ending Sequence */}
      {activeView === 'ending' && (
        <EndingSequence
          endingType={puzzlesState.selectedEnding || 'A'}
          onRestart={handleResetGame}
          reducedMotion={settings.reducedMotion}
        />
      )}

      {/* Global Interactive Modals */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
      />

      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalNotes}
        currentRoom={currentRoom}
        discoveredClues={[]}
      />

      <AccessibilityModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetGame={handleResetGame}
      />

      <IncidentReportModal
        isOpen={isIncidentReportOpen}
        onClose={() => setIsIncidentReportOpen(false)}
      />

      <TransmissionLogModal
        isOpen={isTransmissionLogOpen}
        onClose={() => setIsTransmissionLogOpen(false)}
      />
    </div>
  );
}
