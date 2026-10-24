import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, CheckCircle, AlertOctagon, HelpCircle } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface TerminalInterfaceProps {
  title?: string;
  systemName?: string;
  initialLines?: string[];
  theme?: 'green' | 'red' | 'amber';
  onCommand?: (command: string) => { output: string[]; success?: boolean } | void;
  requiredPassword?: string;
  acceptedPasswords?: string[];
  onPasswordSuccess?: () => void;
  isUnlocked?: boolean;
  unlockedContent?: React.ReactNode;
  hint?: string;
}

export const TerminalInterface: React.FC<TerminalInterfaceProps> = ({
  title = 'NIGHTFALL OS v4.09',
  systemName = 'SECTOR-TERMINAL',
  initialLines = [
    'CONNECTING TO FACILITY SECURE NETWORK...',
    'CONNECTION ESTABLISHED. PORT 433.',
    'STATUS: BIO-CONTAINMENT LEVEL 5'
  ],
  theme = 'green',
  onCommand,
  requiredPassword,
  acceptedPasswords,
  onPasswordSuccess,
  isUnlocked = false,
  unlockedContent,
  hint
}) => {
  const [history, setHistory] = useState<string[]>(initialLines);
  const [inputVal, setInputVal] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [internalUnlocked, setInternalUnlocked] = useState(isUnlocked);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isUnlocked) {
      setInternalUnlocked(true);
    }
  }, [isUnlocked]);

  const themeClasses = {
    green: {
      text: 'text-emerald-400',
      border: 'border-emerald-900/60',
      headerBg: 'bg-emerald-950/40',
      prompt: 'text-emerald-500',
      cursor: 'bg-emerald-400'
    },
    red: {
      text: 'text-red-400',
      border: 'border-red-900/70',
      headerBg: 'bg-red-950/40',
      prompt: 'text-red-500',
      cursor: 'bg-red-500'
    },
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-900/60',
      headerBg: 'bg-amber-950/40',
      prompt: 'text-amber-500',
      cursor: 'bg-amber-400'
    }
  }[theme];

  const effectivelyUnlocked = isUnlocked || internalUnlocked;

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, effectivelyUnlocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    audioEngine.playTerminalBeep('key');
    const newHistory = [...history, `> ${cmd}`];
    setInputVal('');

    // Handle password attempt
    if (requiredPassword && !effectivelyUnlocked) {
      const allValid = [requiredPassword, ...(acceptedPasswords || [])].map(p => p.toUpperCase());
      if (allValid.includes(cmd.toUpperCase())) {
        audioEngine.playTerminalBeep('success');
        newHistory.push('ACCESS GRANTED. DECRYPTING CLASSIFIED LOGS...');
        setHistory(newHistory);
        setInternalUnlocked(true);
        onPasswordSuccess?.();
        return;
      } else {
        audioEngine.playTerminalBeep('error');
        newHistory.push('ACCESS DENIED: INVALID CLEARANCE KEY.');
        if (hint) {
          newHistory.push(`HINT: Type "hint" for decryption telemetry.`);
        }
        setHistory(newHistory);
        return;
      }
    }

    // Default internal commands
    const lowerCmd = cmd.toLowerCase();
    if (lowerCmd === 'clear') {
      setHistory([]);
      return;
    } else if (lowerCmd === 'help') {
      newHistory.push(
        'AVAILABLE COMMANDS:',
        '  status   - Probe regional subsystem health',
        '  scan     - Query electromagnetic entity signatures',
        '  logs     - Dump recent chronological system logs',
        '  hint     - Display sector decryption clue',
        '  clear    - Clear terminal buffer'
      );
    } else if (lowerCmd === 'status') {
      newHistory.push(
        'SUBSYSTEM TELEMETRY:',
        '  MAINFRAME RELAY: PARTIAL',
        '  AUXILIARY GENERATOR: OFFLINE',
        '  ATMOSPHERIC CO2: NOMINAL',
        '  ANOMALOUS ENTITY COUNT: 1 (SECTOR D)'
      );
    } else if (lowerCmd === 'scan') {
      newHistory.push(
        'PERFORMING SPECTRAL SCAN...',
        'WARNING: HIGH RESONANCE FREQUENCY DETECTED IN CORRIDORS.',
        'BIOMASS SIGNATURE LOCATED BEHIND WARD CURTAIN 3.'
      );
      audioEngine.playStaticBurst(0.4, 0.2);
    } else if (lowerCmd === 'hint') {
      if (hint) {
        newHistory.push(`DECRYPTION HINT: ${hint}`);
      } else {
        newHistory.push('NO ADDITIONAL INTEL ON FILE FOR THIS TERMINAL.');
      }
    } else if (onCommand) {
      const res = onCommand(cmd);
      if (res && res.output) {
        newHistory.push(...res.output);
        if (res.success) {
          audioEngine.playTerminalBeep('success');
        }
      }
    } else {
      audioEngine.playTerminalBeep('error');
      newHistory.push(`COMMAND NOT RECOGNIZED: "${cmd}". Type "help" for syntax.`);
    }

    setHistory(newHistory);
  };

  return (
    <div className={`relative w-full bg-black border ${themeClasses.border} shadow-[0_0_30px_rgba(0,0,0,0.85)] font-terminal text-xs overflow-hidden`}>
      {/* CRT Scanline overlay */}
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      {/* Terminal Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${themeClasses.border} ${themeClasses.headerBg} backdrop-blur-md`}>
        <div className="flex items-center gap-2">
          <TerminalIcon className={`w-4 h-4 ${themeClasses.text}`} />
          <span className="font-bold tracking-widest text-zinc-200">{title}</span>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">[{systemName}]</span>
        </div>

        <div className="flex items-center gap-3">
          {hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{showHint ? 'HIDE HINT' : 'HINT'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[10px]">
            <span className={`w-2 h-2 rounded-full ${effectivelyUnlocked ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
            <span className={effectivelyUnlocked ? 'text-emerald-400' : 'text-red-400'}>
              {effectivelyUnlocked ? 'UNLOCKED' : 'LOCKED'}
            </span>
          </div>
        </div>
      </div>

      {/* Optional Hint Banner */}
      {showHint && hint && (
        <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-900/60 text-amber-300 text-[11px]">
          <span className="font-bold">SECURITY HINT:</span> {hint}
        </div>
      )}

      {/* Terminal Screen Body */}
      <div className="p-4 max-h-72 overflow-y-auto space-y-1.5">
        {history.map((line, idx) => (
          <div key={idx} className={`${line.startsWith('>') ? 'text-zinc-200 font-bold' : themeClasses.text}`}>
            {line}
          </div>
        ))}

        {effectivelyUnlocked && unlockedContent && (
          <div className="my-3 p-3 bg-zinc-950 border border-emerald-900/80 animate-in fade-in duration-500">
            {unlockedContent}
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Prompt Input */}
      {(!requiredPassword || !effectivelyUnlocked) && (
        <form onSubmit={handleSubmit} className={`flex items-center px-4 py-2.5 border-t ${themeClasses.border} bg-zinc-950/80`}>
          <span className={`mr-2 font-bold ${themeClasses.prompt}`}>&gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={requiredPassword ? "ENTER CLEARANCE PASSWORD..." : "TYPE COMMAND (help, status, scan)..."}
            className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-700 focus:outline-none font-terminal text-xs"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-bold cursor-pointer"
          >
            EXECUTE
          </button>
        </form>
      )}
    </div>
  );
};
