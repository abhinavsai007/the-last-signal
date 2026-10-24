import React from 'react';
import { X, BookOpen, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';
import { JournalEntry, RoomId } from '../types/game';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  currentRoom: RoomId | null;
  discoveredClues: string[];
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentRoom,
  discoveredClues
}) => {
  if (!isOpen) return null;

  // Progressive guidance hints depending on current active room
  const getRoomHints = (room: RoomId | null): string[] => {
    switch (room) {
      case 'reception':
        return [
          'Step 1: Check the overturned desk to discover Dr. Kane’s employee ID badge.',
          'Step 2: Read the handwritten warning note left beside the keyboard.',
          'Step 3: Insert Kane’s badge into the security card terminal to unlock the Security Room door.'
        ];
      case 'security':
        return [
          'Step 1: Cycle through camera feeds CAM-01 to CAM-04 to observe sector corridors.',
          'Step 2: Notice the date and clearance memo or try password "BREACH" on the security terminal.',
          'Step 3: Unlocking the terminal reveals the Lab Key clearance and unlocks the door to Research Lab.'
        ];
      case 'lab':
        return [
          'Step 1: Inspect the experiment console in the center of the dark laboratory.',
          'Step 2: Arrange the 4 bio-containment symbols into the harmonic resonance sequence.',
          'Step 3: Solving the sequence reveals the classified Project Nightfall report and opens Patient Ward.'
        ];
      case 'ward':
        return [
          'Step 1: Read the medical logs for Patient 07, 19, and 42 to harvest three frequency digits.',
          'Step 2: Listen carefully near Curtain 3. You can choose to investigate or proceed cautiously.',
          'Step 3: The combined three-digit passcode unlocks the pneumatic lock to the Maintenance Tunnel.'
        ];
      case 'tunnel':
        return [
          'Step 1: Connect the three power junction nodes in order: Alpha (Generator) -> Beta (Relay) -> Gamma (Grid).',
          'Step 2: Power restoration triggers an alarm and initiates a pursuit countdown.',
          'Step 3: Rush through the restored blast gate to the Archive Room before the entity reaches you.'
        ];
      case 'archive':
        return [
          'Step 1: Query the archive terminal database for Genesis, Incident 03:17, and Evacuation Override files.',
          'Step 2: Assemble the three decrypted fragments to uncover the truth: doors were locked from the outside.',
          'Step 3: The unlocked master cipher unlocks the door to Sector D: The Red Room.'
        ];
      case 'red_room':
        return [
          'Step 1: Observe the anomalous crimson space without staring directly at The Observer silhouette.',
          'Step 2: Calibrate the three acoustic resonance glyphs on the walls while averting gaze when static spikes.',
          'Step 3: Stabilizing the frequencies reveals the final exit master override sequence.'
        ];
      case 'exit':
        return [
          'Step 1: Place your collected credentials into the emergency blast console.',
          'Step 2: Confirm the research code (482) and outside override sequence.',
          'Step 3: Trigger the hydraulic purge to experience your chosen ending.'
        ];
      default:
        return [
          'Enter Room 01 (Reception) to begin your investigation.',
          'Search for keys, notes, and terminals with interactive indicators.'
        ];
    }
  };

  const roomHints = getRoomHints(currentRoom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-zinc-950 border border-zinc-800 text-zinc-300 font-terminal shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold tracking-wider text-white">
              INVESTIGATOR'S LOGBOOK & PROGRESSIVE DOSSIER
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Progressive Hint Guidance */}
          <section className="p-4 bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>CURRENT SECTOR DIRECTIVE & HINTS ({currentRoom ? currentRoom.toUpperCase() : 'SURFACE'})</span>
            </div>
            <div className="space-y-2 mt-2">
              {roomHints.map((hint, idx) => (
                <div key={idx} className="flex items-start gap-2 text-zinc-300">
                  <span className="text-red-500 font-bold shrink-0">{idx + 1}.</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recorded Log Entries */}
          <section>
            <h3 className="font-bold text-zinc-200 tracking-wider mb-3">DISCOVERED TRANSCRIPTS & CLUES ({entries.length})</h3>
            {entries.length === 0 ? (
              <p className="text-zinc-600 italic">No notes logged yet. Examine documents and terminals in the facility.</p>
            ) : (
              <div className="space-y-3">
                {entries.map(entry => (
                  <div key={entry.id} className="p-3 bg-black/60 border border-zinc-800">
                    <div className="flex items-center justify-between text-zinc-400 text-[10px] mb-1">
                      <span className="text-red-400 font-bold">{entry.title}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-zinc-600" /> {entry.timestamp} // {entry.source}
                      </span>
                    </div>
                    <p className="text-zinc-300 whitespace-pre-line leading-relaxed">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer"
          >
            CLOSE JOURNAL
          </button>
        </div>
      </div>
    </div>
  );
};
