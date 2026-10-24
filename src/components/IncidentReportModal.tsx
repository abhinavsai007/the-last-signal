import React from 'react';
import { X, FileText, AlertTriangle, ShieldAlert } from 'lucide-react';

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-zinc-950 border border-zinc-800 text-zinc-300 font-terminal shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold tracking-wider text-white">
              DEBRIEFING DOSSIER: INCIDENT 03:17-NIGHTFALL
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          <div className="p-3 bg-red-950/30 border border-red-900/50 flex items-start gap-3 text-red-300">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold tracking-wider">CLASSIFIED: LEVEL 5 CLEARANCE ONLY</p>
              <p className="text-[11px] text-zinc-400">UNAUTHORIZED REPRODUCTION WILL TRIGGER IMMEDIATE CONTAINMENT LOCKDOWN.</p>
            </div>
          </div>

          <section>
            <h3 className="font-bold text-zinc-200 tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> 1. OVERVIEW OF THE EVENT
            </h3>
            <p className="text-zinc-400">
              At 03:17 AM, seismic and bio-resonant sensors in Sub-Level 4 recorded an unprecedented spike in low-frequency radio propagation. Within 120 seconds, primary communications were severed.
            </p>
            <p className="text-zinc-400 mt-2">
              Automated lockdown protocols engaged. However, forensic analysis confirms that the magnetic deadbolts were engaged from the surface access portal, preventing personnel from exiting.
            </p>
          </section>

          <section className="p-4 bg-zinc-900/40 border border-zinc-800">
            <h3 className="font-bold text-zinc-200 tracking-wider mb-2">2. WITNESS TRANSCRIPTION — DR. V. KANE</h3>
            <p className="italic text-zinc-300">
              "We didn't manufacture the frequency. It was already vibrating through the bedrock. When we turned on the resonant coil in the laboratory, it didn't generate noise—it answered."
            </p>
            <p className="italic text-zinc-300 mt-2">
              "The shadows in the camera feeds... they aren't artifacts of camera interference. They have mass. If you hear someone whispering your name through the emergency PA, do not open the door."
            </p>
          </section>

          <section>
            <h3 className="font-bold text-zinc-200 tracking-wider mb-2">3. SURVIVOR DIRECTIVE</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Do not attempt elevator shafts; all hoist cables have been severed.</li>
              <li>Recover Dr. Kane's clearance card from the reception desk.</li>
              <li>Cycle auxiliary power in the maintenance tunnels to restore blast door relays.</li>
              <li>Avoid prolonged visual contact with high-entropy anomalies.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs tracking-wider cursor-pointer"
          >
            CLOSE REPORT
          </button>
        </div>
      </div>
    </div>
  );
};
