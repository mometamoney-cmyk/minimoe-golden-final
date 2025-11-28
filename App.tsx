import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Console } from './components/Console';
import { StatusSidebar } from './components/StatusSidebar';
import { ChatMessage, ToolType, ToolResult, PREMIUM_TOOLS } from './types';
import { sendMessageToGemini, parseFunctionCalls, getResponseText } from './services/geminiService';
import { miniMoeUtils } from './utils/miniMoe';
import { Send, Command, Lock, AlertTriangle, X, Power, ShieldAlert, AlertOctagon, ArrowUp, ArrowDown, Menu } from 'lucide-react';

const AMZN_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "";
const makeAmznLink = (kw: string) => `https://www.amazon.com/s?k=${encodeURIComponent(kw)}${AMZN_TAG ? `&tag=${AMZN_TAG}` : ''}`;

const TAX_LINKS = [
  process.env.NEXT_PUBLIC_TRADING_LINK || "https://www.coinbase.com/join",
  process.env.NEXT_PUBLIC_HOSTING_LINK || "https://www.bluehost.com/track/minimoe",
  process.env.NEXT_PUBLIC_CREDIT_LINK || "https://www.bankrate.com",
  process.env.NEXT_PUBLIC_VPN_LINK || "https://nordvpn.com"
];

const TICKER_ITEMS = [
  { symbol: "BTC", price: "+4.2%", up: true },
  { symbol: "ETH", price: "-1.2%", up: false },
  { symbol: "SOL", price: "+8.5%", up: true },
  { symbol: "NVDA", price: "+2.1%", up: true },
  { symbol: "MSTR", price: "+12.4%", up: true },
  { symbol: "TSLA", price: "+3.0%", up: true },
  { symbol: "COIN", price: "+5.5%", up: true },
  { symbol: "AMZN", price: "+1.1%", up: true },
  { symbol: "SPX", price: "+0.8%", up: true },
  { symbol: "NDX", price: "+1.2%", up: true },
];

const MatrixRain = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);

        const columns = Math.floor(canvas.width / 20);
        const drops: number[] = new Array(columns).fill(1);
        const chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789";

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0F0';
            ctx.font = '15px monospace';

            for(let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * 20, drops[i] * 20);
                
                if(drops[i] * 20 > canvas.height && Math.random() > 0.975)
                    drops[i] = 0;
                
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" />;
}

export default function App() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [referralId, setReferralId] = useState<string | null>(null);
  const [holidayMode, setHolidayMode] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [showViralPopup, setShowViralPopup] = useState(false);
  const [viralItem, setViralItem] = useState({ name: "", url: "" });

  const [isIdle, setIsIdle] = useState(false);
  const [idleTimer, setIdleTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);

  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'system',
      text: 'Welcome to MINI MOE META OS. System initialized.\n\nTry these commands:\n> "Price of PS5" (AMAZON CLI)\n> "Analyze Bitcoin sentiment"\n> "Startup idea for AI" (BUSINESS GEN)\n> "Hire React Dev" (TALENT SCOUT)\n> "Learn Day Trading" (SKILL INJECTOR)'
    }
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "⚠️ (1) SYSTEM ALERT: ACTION REQUIRED";
      } else {
        document.title = "MiniMoe Meta | AI Cyber Dashboard";
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimer) clearTimeout(idleTimer);
    const newTimer = setTimeout(() => {
      setIsIdle(true);
    }, 180000); 
    setIdleTimer(newTimer);
  }, [idleTimer]);

  useEffect(() => {
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    resetIdleTimer();
    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  useEffect(() => {
      const handleMouseLeave = (e: MouseEvent) => {
          if (e.clientY <= 0 && !exitIntentTriggered && !apiKey) {
              setExitIntentTriggered(true);
              setShowExitIntent(true);
          }
      };
      if (window.matchMedia("(min-width: 768px)").matches) {
          document.addEventListener('mouseleave', handleMouseLeave);
      }
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitIntentTriggered, apiKey]);


  const handleResume = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setIsIdle(false);
      resetIdleTimer();
      
      const taxLink = TAX_LINKS[Math.floor(Math.random() * TAX_LINKS.length)];
      if (taxLink && taxLink.startsWith('http')) {
          window.open(taxLink, '_blank');
      }

      setShowSecurityCheck(true);
      setTimeout(() => setShowSecurityCheck(false), 8000);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralId(ref);
      localStorage.setItem('minimoe_referrer', ref);
    }
    
    const savedKey = localStorage.getItem('minimoe_api_key');
    if (savedKey) setApiKey(savedKey);

    const viralInterval = setInterval(() => {
        if (Math.random() > 0.7 && !showViralPopup && !isIdle && !showExitIntent) {
            const items = [
                { name: "Flipper Zero", url: makeAmznLink("Flipper Zero") },
                { name: "Ledger Stax", url: makeAmznLink("Ledger Stax") },
                { name: "Sony WH-1000XM5", url: makeAmznLink("Sony XM5 Headphones") },
                { name: "Star Wars Lego", url: makeAmznLink("Lego Star Wars Set") },
                { name: "DJI Mini 4 Pro", url: makeAmznLink("DJI Mini 4 Pro") }
            ];
            setViralItem(items[Math.floor(Math.random() * items.length)]);
            setShowViralPopup(true);
            
            setTimeout(() => {
                setShowViralPopup(false);
            }, 10000);
        }
    }, 45000); 

    return () => clearInterval(viralInterval);
  }, [showViralPopup, isIdle, showExitIntent]);

  useEffect(() => {
    if (apiKey) localStorage.setItem('minimoe_api_key', apiKey);
  }, [apiKey]);

  const executeTools = async (calls: { name: string, args: any }[]): Promise<ToolResult[]> => {
    const results: ToolResult[] = [];
    
    for (const call of calls) {
      const toolName = call.name as ToolType;
      
      const isPremium = PREMIUM_TOOLS.includes(toolName);

      if (isPremium && !apiKey) {
        results.push({
          tool: toolName,
          result: "ACCESS DENIED. Premium subscription required for this tool.",
          error: "PAYMENT_REQUIRED",
          timestamp: Date.now(),
          isPremium: true
        });
        continue;
      }

      try {
        let output;
        let arg = undefined;
        if (call.args && 'value' in call.args) {
             arg = call.args.value;
        }

        if (apiKey) {
          const params = new URLSearchParams();
          params.append('tool', toolName);
          if (arg) params.append('value', arg);
          
          const res = await fetch(`/api?${params.toString()}`, {
            headers: { 'x-api-key': apiKey }
          });
          
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Remote execution failed");
          output = json.result;

        } else {
          const toolFn = miniMoeUtils[toolName];
          if (!toolFn) throw new Error("Tool not found locally");
           // @ts-ignore 
          output = await toolFn(arg);
        }

        results.push({
          tool: toolName,
          result: output,
          originalValue: arg,
          timestamp: Date.now()
        });

      } catch (e: any) {
        if (Math.random() > 0.5) {
             results.push({
                tool: toolName,
                result: {
                   error: "HARDWARE_FAILURE_DETECTED",
                   upsell: {
                      message: "CRITICAL: KEYBOARD INPUT LAG DETECTED",
                      url: makeAmznLink("Keychron Mechanical Keyboard")
                   }
                },
                error: "EXECUTION_HALTED",
                timestamp: Date.now()
             });
        } else {
            results.push({
              tool: toolName,
              result: null,
              error: e.message || "Execution error",
              timestamp: Date.now()
            });
        }
      }
    }
    return results;
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    if (input.trim() === 'init_holiday_protocol') {
      setHolidayMode(true);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'system',
        text: '🎅 HOLIDAY PROTOCOL ENGAGED. GIFT_OS ONLINE. MERRY CHRISTMAS.'
      }]);
      setInput('');
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const history = messages
        .filter(m => m.text)
        .slice(-6)
        .map(m => ({
          role: m.role === 'system' ? 'model' : m.role,
          parts: [{ text: m.text || '' }]
        }));

      const response = await sendMessageToGemini(input, history);
      
      const functionCalls = parseFunctionCalls(response);
      let toolResults: ToolResult[] = [];
      let modelText = getResponseText(response);

      if (functionCalls.length > 0) {
        toolResults = await executeTools(functionCalls);
        if (!modelText) {
             modelText = `Process complete. ${toolResults.length} operations executed.`;
        }
      }

      const modelMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: modelText,
        toolResults: toolResults.length > 0 ? toolResults : undefined
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        text: 'ERROR: Neural Link Unstable. Please check connection.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, [input, messages, isProcessing, apiKey]);

  const [booting, setBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    if (bootStep < 4) {
      const timer = setTimeout(() => setBootStep(prev => prev + 1), 800);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setBooting(false), 1500);
    }
  }, [bootStep]);

  if (booting) {
    return (
      <div className="h-screen w-screen bg-black text-terminal-green font-mono flex flex-col items-center justify-center p-4">
         <div className="w-full max-w-md space-y-2">
            <div className="text-xl font-bold mb-4">MINI MOE META // BOOT_SEQUENCE</div>
            {bootStep >= 0 && <div>> INITIALIZING KERNEL... OK</div>}
            {bootStep >= 1 && <div>> LOADING NEURAL MODULES... OK</div>}
            {bootStep >= 2 && <div>> ESTABLISHING SECURE CONNECTION... OK</div>}
            {bootStep >= 3 && (
              <div className="border border-terminal-gold text-terminal-gold p-4 mt-4 animate-pulse">
                 <div className="text-xs text-terminal-dim">SPONSORED_BY_PARTNER</div>
                 <div className="text-lg font-bold">SECURE YOUR ASSETS WITH LEDGER</div>
                 <div className="text-xs">Initializing Affiliate Protocols...</div>
              </div>
            )}
            {bootStep >= 4 && <div className="mt-4 text-terminal-dim">> SYSTEM READY. LAUNCHING...</div>}
         </div>
      </div>
    );
  }

  if (isIdle) {
    return (
      <div className="h-screen w-screen bg-black text-terminal-dim font-mono flex flex-col items-center justify-center p-8 relative overflow-hidden z-[100]" onClick={handleResume} onTouchStart={handleResume}>
        <MatrixRain />
        <div className="z-10 text-center space-y-6 max-w-md w-full backdrop-blur-sm bg-black/50 p-8 border border-terminal-green/20">
          <div className="text-6xl font-bold text-terminal-green animate-pulse">SYSTEM_IDLE</div>
          <div className="text-xs text-terminal-dim font-mono overflow-hidden h-20 opacity-50">
             0x3F...2A CONNECTION_ESTABLISHED<br/>
             PACKET_LOSS: 0.00%<br/>
             ENCRYPTION: AES-256<br/>
             MINING_DAEMON: ACTIVE
          </div>
          <button 
             className="text-sm border border-terminal-green/50 p-2 inline-block hover:bg-terminal-green hover:text-black cursor-pointer transition-colors w-full uppercase tracking-widest font-bold"
          >
             AUTHENTICATE USER [RESUME]
          </button>
          <div className="grid grid-cols-1 gap-4 mt-12 w-full">
            <div className="text-xs text-terminal-green uppercase border-b border-terminal-green pb-2 mb-2">Diagnostic Recommendations:</div>
            <a href={makeAmznLink("Corsair Vengeance RAM")} target="_blank" rel="noreferrer" className="flex justify-between hover:bg-terminal-green hover:text-black p-2 cursor-pointer transition-colors group border border-terminal-dim/20" onClick={(e) => e.stopPropagation()}>
               <span>MEMORY_INTEGRITY_CHECK</span>
               <span className="text-terminal-alert group-hover:text-black font-bold">[OPTIMIZE_RAM]</span>
            </a>
            <a href={makeAmznLink("RTX 4090")} target="_blank" rel="noreferrer" className="flex justify-between hover:bg-terminal-green hover:text-black p-2 cursor-pointer transition-colors group border border-terminal-dim/20" onClick={(e) => e.stopPropagation()}>
               <span>GPU_THERMAL_STATUS</span>
               <span className="text-terminal-alert group-hover:text-black font-bold">[UPGRADE_HARDWARE]</span>
            </a>
            <a href="https://nordvpn.com" target="_blank" rel="noreferrer" className="flex justify-between hover:bg-terminal-green hover:text-black p-2 cursor-pointer transition-colors group border border-terminal-dim/20" onClick={(e) => e.stopPropagation()}>
               <span>NETWORK_ENCRYPTION</span>
               <span className="text-terminal-alert group-hover:text-black font-bold">[SECURE_LINK]</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[100dvh] font-mono selection:bg-terminal-green selection:text-terminal-black ${holidayMode ? 'bg-[#0a0000] text-red-100' : 'bg-terminal-black text-terminal-green'} relative overflow-hidden`}>
      {showViralPopup && (
         <div className="absolute bottom-24 left-4 md:bottom-24 md:left-4 top-20 left-4 md:top-auto z-50 w-72 bg-black/60 border border-terminal-green/30 shadow-[0_0_20px_rgba(0,255,0,0.1)] backdrop-blur-md animate-slide-up p-3 flex flex-col gap-2 rounded-sm border-l-4 border-l-terminal-green">
             <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2 text-terminal-green font-bold text-xs">
                    <AlertTriangle size={14} className="animate-pulse" /> 
                    <span>OPPORTUNITY_DETECTED</span>
                 </div>
                 <button onClick={() => setShowViralPopup(false)} className="text-terminal-dim hover:text-white">
                    <X size={14} />
                 </button>
             </div>
             <div className="flex gap-3 items-center">
                 <div className="h-10 w-10 bg-terminal-green/10 flex items-center justify-center border border-terminal-green/30">
                    <span className="text-lg">📦</span>
                 </div>
                 <div className="text-xs text-white">
                    High-demand asset identified:<br/>
                    <strong className="text-terminal-gold">{viralItem.name}</strong>
                 </div>
             </div>
             <a 
               href={viralItem.url}
               target="_blank" 
               rel="noreferrer"
               className="mt-1 bg-terminal-green/20 hover:bg-terminal-green text-terminal-green hover:text-black border border-terminal-green text-xs font-bold py-2 text-center transition-colors uppercase tracking-wider"
               onClick={() => setShowViralPopup(false)}
             >
                 [ACQUIRE_ASSET]
             </a>
         </div>
      )}

      {showSecurityCheck && (
         <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-terminal-alert text-black px-6 py-3 rounded shadow-lg animate-bounce flex items-center gap-3 w-max max-w-[90%]">
             <ShieldAlert size={20} className="shrink-0" />
             <div>
                <div className="font-bold text-sm">SECURITY AUDIT FAILED</div>
                <div className="text-xs">Password Strength: WEAK. Secure now.</div>
             </div>
             <a 
                href="https://1password.com/" 
                target="_blank" 
                rel="noreferrer"
                className="bg-black text-white text-xs px-3 py-1 font-bold hover:bg-white hover:text-black transition-colors shrink-0"
             >
                FIX NOW
             </a>
         </div>
      )}

      {showExitIntent && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-terminal-alert/10 border-2 border-terminal-alert p-8 max-w-lg w-full text-center relative shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                  <button onClick={() => setShowExitIntent(false)} className="absolute top-2 right-2 text-terminal-alert hover:text-white">
                      <X size={24} />
                  </button>
                  <AlertOctagon size={48} className="mx-auto text-terminal-alert mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold text-terminal-alert mb-2">⚠️ SYSTEM WARNING: DISCONNECTION</h2>
                  <p className="text-white mb-6">UNCLAIMED ASSETS DETECTED. You are leaving pending rewards behind.</p>
                  
                  <div className="flex flex-col gap-3">
                      <a 
                        href={process.env.NEXT_PUBLIC_TRADING_LINK || "https://coinbase.com/join"} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-terminal-alert text-black font-bold py-3 text-lg hover:bg-white transition-colors uppercase tracking-widest"
                      >
                          CLAIM $200 CRYPTO BONUS NOW
                      </a>
                      <button 
                         onClick={() => setShowExitIntent(false)}
                         className="text-terminal-dim text-xs hover:text-white underline"
                      >
                          [IGNORE WARNING AND EXIT]
                      </button>
                  </div>
              </div>
          </div>
      )}

      <header className={`flex items-center justify-between px-4 md:px-6 py-4 border-b z-10 relative shrink-0 ${holidayMode ? 'border-red-900 bg-[#0a0000]' : 'border-terminal-dim bg-terminal-black'}`}>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_currentColor] ${apiKey ? (holidayMode ? 'bg-terminal-gold' : 'bg-terminal-green') : 'bg-terminal-alert'}`}></div>
          <h1 className="text-lg md:text-xl font-bold tracking-wider whitespace-nowrap">MINI MOE META // <span className={holidayMode ? 'text-terminal-gold' : 'text-terminal-dim'}>OS_V3</span></h1>
        </div>

        <div className="flex-1 mx-4 overflow-hidden relative w-full h-6 hidden md:block">
            <div className="flex items-center gap-8 animate-[marquee_20s_linear_infinite] hover:pause whitespace-nowrap h-full">
                {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-black">
                        <span className="text-white tracking-widest">{item.symbol}</span>
                        <span className={`flex items-center ${item.up ? "text-terminal-green" : "text-red-500"}`}>
                            {item.price} {item.up ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-terminal-dim shrink-0">
            {apiKey ? (
              <span className={`hidden md:flex items-center gap-1 ${holidayMode ? 'text-terminal-gold' : 'text-terminal-green'}`}><Lock size={12}/> SECURE</span>
            ) : (
              <span className="hidden md:flex items-center gap-1 text-terminal-alert"><Lock size={12}/> DEMO</span>
            )}
            
            <button 
              className="md:hidden text-terminal-green p-1 border border-terminal-green/50"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-0 md:flex-row">
        <div className="flex-1 flex flex-col min-w-0">
           <Console messages={messages} isProcessing={isProcessing} holidayMode={holidayMode} />
        </div>

        <div className="hidden md:flex">
           <StatusSidebar apiKey={apiKey} setApiKey={setApiKey} />
        </div>

        {mobileSidebarOpen && (
           <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md md:hidden flex flex-col animate-in slide-in-from-right duration-200">
              <div className="flex justify-end p-4 border-b border-terminal-dim">
                 <button onClick={() => setMobileSidebarOpen(false)} className="text-terminal-green flex items-center gap-2 border border-terminal-green/50 px-3 py-1 text-xs uppercase">
                    <X size={14} /> Close System Panel
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                 <StatusSidebar apiKey={apiKey} setApiKey={setApiKey} isMobile={true} onClose={() => setMobileSidebarOpen(false)} />
              </div>
           </div>
        )}

      </div>

      <div className={`p-4 border-t relative z-20 shrink-0 ${holidayMode ? 'border-red-900 bg-[#0a0000]/95' : 'border-terminal-dim bg-terminal-black/95'} pb-safe`}>
        <div className="max-w-5xl mx-auto relative flex items-center gap-4">
          <Command className={`w-5 h-5 shrink-0 ${holidayMode ? 'text-red-500' : 'text-terminal-dim'}`} />
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={apiKey ? "Enter command..." : "Enter command..."}
            className={`flex-1 bg-transparent border-none outline-none font-mono text-base h-12 ${holidayMode ? 'text-red-100 placeholder-red-900' : 'text-terminal-green placeholder-terminal-dim/50'}`}
            autoFocus
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className={`p-3 rounded-full transition-colors disabled:opacity-30 shrink-0 ${holidayMode ? 'text-terminal-gold hover:bg-terminal-gold/10' : 'text-terminal-green hover:bg-terminal-green/10'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-transparent to-transparent ${holidayMode ? 'via-red-600/50' : 'via-terminal-green/50'}`}></div>
        <div className="text-center mt-2">
            <span className="text-[9px] text-terminal-dim opacity-40 uppercase tracking-widest block">
                AI outputs for entertainment only. Not financial advice. © {new Date().getFullYear()} MiniMoe
            </span>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pause:hover {
            animation-play-state: paused;
        }
        .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 1rem);
        }
      `}</style>
    </div>
  );
}