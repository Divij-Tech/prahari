import { useEffect, useMemo, useRef, useState } from 'react';
import PhoneShell from './components/PhoneShell.jsx';
import CallScreen from './components/CallScreen.jsx';
import PauseProtocol from './components/PauseProtocol.jsx';
import MessageScanner from './components/MessageScanner.jsx';
import LinkScanner from './components/LinkScanner.jsx';
import Investigator from './components/Investigator.jsx';
import AnalysisPanel from './components/AnalysisPanel.jsx';
import GuardianPanel from './components/GuardianPanel.jsx';
import { analyze, shouldTriggerPauseProtocol } from './lib/scamEngine.js';
import { geminiConfigured } from './lib/gemini.js';
import { startLiveCall, PERSONAS, liveAvailable } from './lib/geminiLive.js';
import { SCENARIOS } from './lib/scenarios.js';

export default function App() {
  const [tab, setTab] = useState('call');

  const [callActive, setCallActive] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerLabel, setCallerLabel] = useState('');
  const [lines, setLines] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);  

  const [micError, setMicError] = useState('');
  const [lang, setLang] = useState('en-IN');

  const [simulation, setSimulation] = useState(null);
  const [liveState, setLiveState] = useState('idle');
  const [userInterim, setUserInterim] = useState('');

  const [pauseActive, setPauseActive] = useState(false);
  const [pauseDismissed, setPauseDismissed] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [elderMode, setElderMode] = useState(true);

  const [messageResult, setMessageResult] = useState(null);

  const liveRef = useRef(null);
  const replayRef = useRef([]);  

  const callResult = useMemo(() => analyze(transcript), [transcript]);
  const shownResult = tab === 'messages' && messageResult ? messageResult : callResult;

  useEffect(() => {
    if (!callActive) return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [callActive]);

  useEffect(() => {  
    if (!callActive || pauseDismissed) return;
    if (shouldTriggerPauseProtocol(callResult)) {
      setPauseActive(true);
      setTab('call'); 
    }
  }, [callResult, callActive, pauseDismissed]);

  useEffect(() => {
    if (!elderMode || !callActive) return;
    if (callResult.score < 72 || alerts.length > 0) return;
    sendGuardianAlert(true);  

  }, [callResult.score, elderMode, callActive]);

  useEffect(() => () => teardown(), []);

  function teardown() {
    liveRef.current?.stop();
    liveRef.current = null;
    replayRef.current.forEach(clearTimeout);
    replayRef.current = []; 
  }

  function resetCall() {
    teardown();
    setCallActive(false);
    setSimulation(null);
    setLiveState('idle');
    setLines([]);
    setTranscript('');
    setInterim('');
    setUserInterim('');
    setSeconds(0);
    setStartedAt(null);
    setPauseActive(false); 
    setPauseDismissed(false);
    setAlerts([]);
    setMicError('');
  }  


  function playScenario(scenario) {
    resetCall();
    setCaller(scenario.caller);
    setCallerLabel(scenario.callerLabel);
    setCallActive(true);
    setStartedAt(Date.now());
    setTab('call');

    let at = 500;
    scenario.lines.forEach((line) => {
      replayRef.current.push(
        setTimeout(() => {
          setLines((prev) => [...prev, { s: line.s, t: line.t }]);
          if (line.s === 'caller') {
            setTranscript((prev) => `${prev} ${line.t}`.trim());
          }
        }, at),
      );
      at += line.d;
    });
  }

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('demo');
    if (!id) return;
    const scenario = SCENARIOS.find((s) => s.id === id);
    if (scenario) playScenario(scenario);

  }, []);


  async function startSimulation(persona) {
    resetCall();
    setSimulation(persona);
    setCaller('+91 91XXXX0142');
    setCallerLabel(`Simulated caller • ${persona.name}`);
    setCallActive(true);
    setStartedAt(Date.now());
    setTab('call');
    setLiveState('connecting');

    try {
      liveRef.current = await startLiveCall({
        persona,
        languageCode: lang,
        onState: setLiveState,
        onError: (msg) => setMicError(msg),  
        onCallerText: (text, final) => {
          if (!final) {
            setInterim(text);
            return;
          }
          setInterim('');
          setLines((prev) => [...prev, { s: 'caller', t: text }]);
          setTranscript((prev) => `${prev} ${text}`.trim());
        },
        onUserText: (text, final) => {
          if (!final) {
            setUserInterim(text);  
            return;
          }
          setUserInterim('');

          setLines((prev) => [...prev, { s: 'you', t: text }]);
        },
      });
    } catch (err) {  
      setMicError(err.message || String(err));
      setCallActive(false);
      setSimulation(null);
      setLiveState('idle');
    }
  }

  function sendGuardianAlert(automatic = false) {
    setAlerts((prev) => {
      if (prev.length > 0) return prev;
      return [
        { 
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          caller: caller || 'Unknown',
          score: callResult.score,
          stages: callResult.stagesSeen,
          signature: callResult.signature,
          automatic,
        },
        ...prev,
      ];
    });
  }

  useEffect(() => {
    if (!callActive || alerts.length === 0) return;
    setAlerts((prev) => {  
      const [latest, ...rest] = prev;
      if (latest.score === callResult.score) return prev;  
      return [
        {
          ...latest,
          score: callResult.score,
          stages: callResult.stagesSeen,
          signature: callResult.signature,
        },
        ...rest,
      ];
    });
  }, [callResult, callActive, alerts.length]);

  const alarm = callActive && callResult.score >= 72;

  return (
    <div className="min-h-screen">
      <Header
        elderMode={elderMode}
        setElderMode={setElderMode}
        lang={lang}
        setLang={setLang}
      />

      <main className="mx-auto grid max-w-[1500px] gap-5 px-4 pb-12 pt-5 lg:grid-cols-[minmax(0,370px)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <PhoneShell tab={tab} onTab={setTab} alarm={alarm}>
            {tab === 'call' && (
              <CallScreen
                active={callActive}
                caller={caller}
                callerLabel={callerLabel}
                lines={lines}
                interim={interim}
                userInterim={userInterim}
                result={callResult}
                seconds={seconds}
                simulation={simulation}
                liveState={liveState}
                onEnd={resetCall}
              />
            )}
            {tab === 'messages' && <MessageScanner onResult={setMessageResult} />} 
            {tab === 'links' && <LinkScanner />}
            {tab === 'investigator' && (
              <Investigator
                context={
                  transcript
                    ? `Live call risk score ${callResult.score}/100. Detected: ${
                        callResult.hits.map((h) => h.label).join('; ') || 'nothing'
                      }.`
                    : ''
                }  
              />
            )}

            {pauseActive && (
              <PauseProtocol
                result={callResult}
                coolOff={30}
                guardianNotified={alerts.length > 0}
                onAlertGuardian={() => sendGuardianAlert(false)}
                onDismiss={() => {
                  setPauseActive(false);
                  setPauseDismissed(true);
                }}
              />
            )}
          </PhoneShell> 

          <SimulationLauncher
            onSimulate={startSimulation}
            liveState={liveState}
            micError={micError}
          />   
        </div>

        <AnalysisPanel result={shownResult} active={callActive} />

        <GuardianPanel
          alerts={alerts}
          result={callResult}
          transcript={transcript}
          caller={caller}
          startedAt={startedAt}  
        />
      </main>

      <footer className="mx-auto max-w-[1500px] px-4 pb-8 text-center">  
        <p className="text-[10.5px] leading-relaxed text-slate-600">
          Prahari is a hackathon prototype, not a substitute for the police. If you
          are being defrauded right now, call <span className="text-slate-400">1930</span> or
          file at{' '}
          <a href="https://cybercrime.gov.in" className="text-sky-500 hover:underline">
            cybercrime.gov.in
          </a>
          . Scam scripts shown here are reconstructions from public advisories; no real
          victim data is used.
        </p>
      </footer>
    </div>  
  );
}

function Header({ elderMode, setElderMode, lang, setLang }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500">
            <svg viewBox="0 0 24 24" className="size-5 text-white" fill="currentColor">
              <path d="M12 2 4 5.2v6c0 5 3.4 9.5 8 10.8 4.6-1.3 8-5.8 8-10.8v-6z" />
            </svg>
          </div>
          <div>  
            <h1 className="text-[15px] font-black leading-none tracking-tight text-white">
              PRAHARI <span className="font-medium text-haze">प्रहरी</span>  
            </h1>
            <p className="mt-0.5 text-[10px] leading-none text-haze">
              AI Digital Arrest Shield · real-time coercion detection
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-[11px] font-medium text-slate-300 focus:outline-none"
          >
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">हिन्दी</option>
          </select>

          <button
            onClick={() => setElderMode((v) => !v)}
            className={`chip transition ${
              elderMode
                ? 'border-emerald-400/30 bg-emerald-500/12 text-emerald-300'
                : 'border-white/10 bg-white/[0.04] text-slate-500'
            }`} 
          > 
            <span
              className={`size-1.5 rounded-full ${elderMode ? 'bg-emerald-400' : 'bg-slate-600'}`}
            />
            Elder Mode
          </button>

          <span
            className={`chip ${
              geminiConfigured
                ? 'border-sky-400/25 bg-sky-500/10 text-sky-300'
                : 'border-amber-400/25 bg-amber-500/10 text-amber-300'
            }`}
          >
            {geminiConfigured ? 'Gemini connected' : 'Offline mode'}
          </span>

          <span className="chip border-white/10 bg-white/[0.04] text-slate-400">
            detection runs on-device
          </span>
        </div>
      </div>  
    </header>
  );
}

function SimulationLauncher({ onSimulate, liveState, micError }) {
  const connecting = liveState === 'connecting';  

  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="panel-title">Adversarial Simulation</span>
        <span className="chip border-fuchsia-400/25 bg-fuchsia-500/10 text-[9px] text-fuchsia-300">
          Gemini Live
        </span>
      </div>

      <p className="mt-1.5 text-[10.5px] leading-snug text-haze">
        An AI plays the scammer and you argue back out loud. The detector scores speech
        nobody scripted — which is the only version of “it works” you can stress-test.
      </p>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {Object.values(PERSONAS).map((p) => (
          <button
            key={p.id}
            onClick={() => onSimulate(p)}
            disabled={!liveAvailable || connecting}
            className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 py-2.5 text-[12px] font-bold text-fuchsia-200 transition hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {connecting ? 'Connecting…' : p.name}
            <span className="block text-[9px] font-medium opacity-60">talk to it</span>
          </button>
        ))}
      </div>

      {!liveAvailable && (
        <p className="mt-2 text-[10px] leading-snug text-amber-300/80">
          Needs VITE_GEMINI_API_KEY in .env.local.
        </p>
      )}

      {micError && (
        <p className="mt-2 rounded-lg border border-amber-400/25 bg-amber-500/10 px-2.5 py-1.5 text-[10.5px] leading-snug text-amber-200">
          {micError}
        </p>
      )}

      <p className="mt-2 text-[10px] leading-snug text-slate-600">
        Use headphones — on speakers the AI hears itself. Say “stop simulation” to break
        character at any time.
      </p>
    </section>
  );
} 
