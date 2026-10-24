import React, { useState } from 'react';
import { Archive, Search, FileText, AlertTriangle, ArrowRight, Map, CheckCircle2, ShieldAlert, Key } from 'lucide-react';
import { InventoryItem, JournalEntry, RoomId } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';

interface ArchiveRoomProps {
  onCollectItem: (item: InventoryItem) => void;
  onAddJournal: (entry: JournalEntry) => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onNavigateToRoom: (roomId: RoomId) => void;
  onReturnToMap: () => void;
  inventory: InventoryItem[];
  archiveFilesFound: string[];
  onFindArchiveFile: (fileId: string) => void;
  masterUnlocked: boolean;
  onUnlockMaster: () => void;
}

interface ArchiveRecord {
  id: string;
  code: string;
  title: string;
  classification: string;
  dossierSummary: string;
  fragmentCode: string;
}

export const ArchiveRoom: React.FC<ArchiveRoomProps> = ({
  onCollectItem,
  onAddJournal,
  onUnlockRoom,
  onNavigateToRoom,
  onReturnToMap,
  inventory,
  archiveFilesFound,
  onFindArchiveFile,
  masterUnlocked,
  onUnlockMaster
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);

  const archiveDatabase: ArchiveRecord[] = [
    {
      id: 'rec-1',
      code: 'DOC-861-GENESIS',
      title: 'PROJECT NIGHTFALL: GENESIS REPORT',
      classification: 'LEVEL 5 TOP SECRET',
      dossierSummary: 'Original drilling expedition encountered sub-crustal metallic structures transmitting pulsed sinusoidal waves at 433.92 MHz. The bunker was built over the anomaly to study the broadcast.',
      fragmentCode: 'NIGHTFALL'
    },
    {
      id: 'rec-2',
      code: 'DOC-914-TIMELINE',
      title: 'INCIDENT TIMELINE 03:17 AM',
      classification: 'RESTRICTED OPERATIONAL LOG',
      dossierSummary: 'At 03:17:12 AM, external command issued an emergency signal lockdown. Secondary vents were flooded with Halon fire suppressant, suffocating personnel in Sector C before the entity manifested.',
      fragmentCode: '0317'
    },
    {
      id: 'rec-3',
      code: 'DOC-992-OVERRIDE',
      title: 'EVACUATION PROTOCOL OVERRIDE',
      classification: 'DIRECTOR EYES ONLY',
      dossierSummary: 'Surface control initiated an external magnetic interlock. Surface valves were welded shut from the outside. The researchers were deliberately trapped as bait to observe biological resonance.',
      fragmentCode: 'OUTSIDE-LOCK'
    }
  ];

  const handleSelectRecord = (record: ArchiveRecord) => {
    setSelectedRecord(record);
    audioEngine.playTerminalBeep('key');

    if (!archiveFilesFound.includes(record.id)) {
      onFindArchiveFile(record.id);

      // Check if all 3 found
      const newFound = [...archiveFilesFound, record.id];
      if (newFound.length >= 3 && !masterUnlocked) {
        audioEngine.playTerminalBeep('success');
        audioEngine.playStaticBurst(0.4, 0.3);
        onUnlockMaster();
        onUnlockRoom('red_room');

        const masterDossierItem: InventoryItem = {
          id: 'dossier_outside_lock',
          name: 'Declassified Evacuation Dossier',
          description: 'Proof that the underground bunker was sealed from the surface to prevent survivors from escaping.',
          category: 'document',
          icon: 'file',
          inspectedText: '"THE INCIDENT WAS NOT AN ACCIDENT.\nSOMEONE LOCKED THE DOORS FROM THE OUTSIDE.\nSURFACE OVERRIDE CIPHER: NIGHTFALL-0317"',
          foundIn: 'Classified Archive Vault'
        };
        onCollectItem(masterDossierItem);

        onAddJournal({
          id: `journal-outside-lock-${Date.now()}`,
          title: 'The Horrifying Truth',
          content: 'Assembled all three archive records:\n"THE INCIDENT WAS NOT AN ACCIDENT. SOMEONE LOCKED THE DOORS FROM THE OUTSIDE." The Red Room security portal has energized.',
          timestamp: '03:17 AM',
          source: 'Archive Main Vault'
        });
      }
    }
  };

  const filteredRecords = archiveDatabase.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.dossierSummary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-[85vh] w-full bg-zinc-950 text-zinc-200 font-terminal p-4 sm:p-8 flex flex-col justify-between overflow-hidden border border-zinc-850 shadow-2xl">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black pointer-events-none opacity-90" />
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      {/* Room Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 font-bold">ROOM 06</span>
            <h2 className="text-xl font-cinematic font-black tracking-wider text-white">CENTRAL ARCHIVE VAULT</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Shelves of microfiche, damaged magnetic tape canisters, and digital catalog terminals.</p>
        </div>

        <button
          onClick={onReturnToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Map className="w-3.5 h-3.5 text-zinc-400" />
          <span>FACILITY MAP</span>
        </button>
      </div>

      {/* Main Archive Investigation Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1 items-start">
        {/* Left Column: Search & Catalog */}
        <div className="space-y-4">
          <div className="p-4 bg-black/60 border border-zinc-800 text-xs space-y-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <Archive className="w-4 h-4 text-red-500" />
              <span>CLASSIFIED DATABASE INDEX ({archiveFilesFound.length}/3 SECURED)</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Query the microfiche reels for the three pivotal incident files: Genesis, Incident Timeline 03:17, and Evacuation Override.
            </p>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="FILTER ARCHIVE LOGS..."
                className="w-full bg-zinc-900 border border-zinc-700 pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* List of 3 files */}
            <div className="space-y-2 mt-2">
              {filteredRecords.map(record => {
                const isFound = archiveFilesFound.includes(record.id);
                return (
                  <button
                    key={record.id}
                    onClick={() => handleSelectRecord(record)}
                    className={`w-full text-left p-3 border transition-colors flex items-start justify-between text-xs cursor-pointer ${
                      selectedRecord?.id === record.id
                        ? 'bg-red-950/40 border-red-600 text-white'
                        : isFound
                        ? 'bg-zinc-900/80 border-emerald-900/60 text-zinc-200'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold block text-xs">{record.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{record.code}</span>
                    </div>
                    {isFound ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <span className="text-red-400 text-[10px] font-mono">[RETRIEVE]</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Document Details & Combined Dossier */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selected Record Detail */}
          {selectedRecord ? (
            <div className="p-6 bg-black/90 border border-zinc-800 text-xs space-y-4 animate-in fade-in">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedRecord.title}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">{selectedRecord.code}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 font-bold">
                  {selectedRecord.classification}
                </span>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-200 leading-relaxed font-sans text-sm">
                {selectedRecord.dossierSummary}
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 flex justify-between items-center text-xs">
                <span className="text-zinc-400">CIPHER FRAGMENT RECOVERED:</span>
                <span className="font-mono font-bold text-emerald-400 px-2 py-1 bg-black border border-emerald-900">
                  {selectedRecord.fragmentCode}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-black/40 border border-zinc-800 text-center flex flex-col items-center justify-center min-h-[220px] text-zinc-500 text-xs">
              <FileText className="w-8 h-8 text-zinc-700 mb-2" />
              <p>SELECT A RECORD ON THE LEFT TO DECRYPT CLASSIFIED REELS</p>
            </div>
          )}

          {/* Master Revelation Dossier if 3 files assembled */}
          {masterUnlocked && (
            <div className="p-6 bg-red-950/40 border-2 border-red-700 text-xs space-y-3 shadow-[0_0_30px_rgba(179,0,24,0.3)] animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-red-400 font-bold tracking-widest text-sm border-b border-red-900 pb-2">
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                <span>UNREDACTED CLASSIFIED CONCLUSION</span>
              </div>

              <div className="p-4 bg-black border border-red-900 text-center space-y-2">
                <p className="font-cinematic text-lg sm:text-xl font-black text-red-400 tracking-wider">
                  "THE INCIDENT WAS NOT AN ACCIDENT.
                </p>
                <p className="font-cinematic text-xl sm:text-2xl font-black text-white tracking-widest">
                  SOMEONE LOCKED THE DOORS FROM THE OUTSIDE."
                </p>
              </div>

              <p className="text-zinc-300 text-xs leading-relaxed">
                The personnel below ground were sacrificed intentionally. The anomaly in Sector D was never an experiment gone wrong—it was an ancient beacon waiting for contact.
              </p>

              <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Heavy airlock to Room 07 (The Red Room) is unsealed.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Passage: The Red Room Door */}
      <div className="relative z-10 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs">
          <span className="font-bold text-zinc-300 block">
            PORTAL TO THE RED ROOM (ROOM 07): {masterUnlocked ? 'UNLOCKED' : 'SEALED'}
          </span>
          <span className="text-[11px] text-zinc-500">
            {masterUnlocked ? 'A pulsating crimson radiance filters under the door.' : 'Requires assembling all three archive documents.'}
          </span>
        </div>

        {masterUnlocked && (
          <button
            onClick={() => onNavigateToRoom('red_room')}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-950 hover:bg-red-900 border border-red-700 text-white font-cinematic font-bold text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(179,0,24,0.4)]"
          >
            <span>ENTER THE RED ROOM</span>
            <ArrowRight className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};
