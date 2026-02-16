"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Panel, Group, Separator } from "react-resizable-panels";
import {
  Play, Send, ChevronLeft, Sun, Moon, Terminal,
  CheckCircle2, XCircle, Code2, BookOpen, AlertCircle,
  Lock, Trophy, ListChecks, Timer as TimerIcon, Layers
} from 'lucide-react';
import { Spinner } from "@/components/ui/loader";
import { LANGUAGES, LanguageKey } from '@/config/languages';
import ReactMarkdown from 'react-markdown';

export default function CodeWorkspace({ problem }: any) {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageKey>("cpp");
  const [code, setCode] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [executionMeta, setExecutionMeta] = useState<any>(null);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(true);

  const parsedData = useMemo(() => {
    const parseItem = (item: any) => {
      if (!item) return [];
      if (Array.isArray(item)) return item;
      try { return JSON.parse(item); } catch (e) { return [item]; }
    };

    return {
      constraints: parseItem(problem.constraints),
      examples: parseItem(problem.examples)
    };
  }, [problem.constraints, problem.examples]);

  const testCases = useMemo(() => {
    return typeof problem.testCases === 'string' ? JSON.parse(problem.testCases) : problem.testCases;
  }, [problem.testCases]);

  useEffect(() => {
    const loadCode = async () => {
      setIsLoadingCode(true);
      try {
        const res = await fetch(`/api/problems/saved?problemId=${problem.id}&language=${language}`);

        if (res.ok) {
          const data = await res.json();
          if (data && data.code) {
            setCode(data.code);
            setIsLoadingCode(false);
            return;
          }
        }
      } catch (err) {
        console.error("Network error fetching saved code:", err);
      }

      const savedCode = localStorage.getItem(`code-${problem.id}-${language}`);
      if (savedCode) {
        setCode(savedCode);
        setIsLoadingCode(false);
        return;
      }

      const templates = typeof problem.starterTemplate === 'string'
        ? JSON.parse(problem.starterTemplate)
        : problem.starterTemplate;

      setCode(templates?.[language] || "");
      setIsLoadingCode(false);
    };

    loadCode();
  }, [language, problem.id, problem.starterTemplate]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);
    localStorage.setItem(`code-${problem.id}-${language}`, newCode);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResults(null);
    setExecutionMeta(null);
    try {
      const res = await fetch("/api/problems/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          userCode: code,
          language,
          languageId: LANGUAGES[language].judge0_id
        }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setExecutionMeta({ time: data.time, memory: data.memory, status: data.status });
      } else {
        setExecutionMeta({
          error: data.error || data.status?.description,
          compile_output: data.compile_output,
          stderr: data.stderr,
          status: data.status
        });
      }
      setActiveTestCase(0);
    } catch (err) {
      console.error(err);
    } finally { setIsRunning(false); }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/problems/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          userCode: code,
          language,
        }),
      });
      const data = await res.json();
      alert(data.message || "Submission received!");
    } catch (err) {
      console.error(err);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <nav className="h-12 border-b flex items-center justify-between px-4 bg-white dark:bg-[#0d0d0d] border-zinc-200 dark:border-zinc-800 shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-semibold">Back</span>
          </div>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
          <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{problem.id}. {problem.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageKey)}
            className="px-2.5 py-1 text-xs font-bold rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-transparent outline-none cursor-pointer"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => <option key={key} value={key}>{lang.label}</option>)}
          </select>

          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border dark:border-zinc-800">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm ${isRunning ? 'opacity-50 cursor-not-allowed' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:scale-[1.02]'}`}
            >
              <Play className={`w-3 h-3 ${isRunning ? 'animate-pulse' : 'text-emerald-500 fill-emerald-500'}`} />
              Run
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              <Send className="w-3 h-3" /> {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            {isDarkMode ? <Sun className="w-4 h-4 text-zinc-400" /> : <Moon className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>
      </nav>

      <Group orientation="horizontal" className="flex-1 overflow-hidden">
        <Panel defaultSize={40} minSize={30} className="bg-white dark:bg-[#0a0a0a] flex flex-col border-r border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 px-6 py-2.5 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30 shrink-0">
            <BookOpen className="w-3.5 h-3.5" /> Description
          </div>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin dark:scrollbar-thumb-zinc-800">
            <h1 className="text-2xl font-extrabold mb-4 text-zinc-900 dark:text-white tracking-tight">{problem.title}</h1>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>{problem.difficulty}</span>
            </div>

            <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <ReactMarkdown>{problem.description}</ReactMarkdown>

              {parsedData.examples.map((ex: any, i: number) => (
                <div key={i} className="mt-6">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-tighter">Example {i + 1}:</h4>
                  <pre className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap break-words overflow-hidden space-y-2">
                    <div><span className="text-zinc-500 font-bold uppercase text-[10px]">Input:</span> <span className="text-zinc-800 dark:text-zinc-200">{ex.input}</span></div>
                    <div><span className="text-zinc-500 font-bold uppercase text-[10px]">Output:</span> <span className="text-zinc-800 dark:text-zinc-200">{ex.output}</span></div>
                    {ex.explanation && (
                      <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-zinc-500 font-bold uppercase text-[10px]">Explanation:</span>
                        <p className="mt-1 text-zinc-600 dark:text-zinc-400 italic leading-snug">{ex.explanation}</p>
                      </div>
                    )}
                  </pre>
                </div>
              ))}

              <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white">
                  <ListChecks className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold m-0">Constraints</h3>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-xs font-medium text-zinc-500">
                  {parsedData.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase mb-1"><TimerIcon className="w-3 h-3" /> Time Complexity</div>
                  <code className="text-xs font-bold text-emerald-500">{problem.expectedTime}</code>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase mb-1"><Layers className="w-3 h-3" /> Space Complexity</div>
                  <code className="text-xs font-bold text-blue-500">{problem.expectedSpace}</code>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Separator className="w-[2px] bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 cursor-col-resize transition-colors shrink-0" />

        <Panel defaultSize={60}>
          <Group orientation="vertical">
            <Panel defaultSize={65} className="bg-white dark:bg-[#0a0a0a] flex flex-col relative">
              <div className="flex items-center justify-between px-6 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <Code2 className="w-3.5 h-3.5" /> Editor
                </div>
              </div>
              <div className="flex-1 pt-2">
                {isLoadingCode ? (
                  <div className="h-full w-full flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
                    <Spinner size={24} className="text-zinc-400" />
                  </div>
                ) : (
                  <Editor
                    key={`${problem.id}-${language}`}
                    height="100%"
                    theme={isDarkMode ? "vs-dark" : "light"}
                    language={language}
                    value={code}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      fontFamily: "'JetBrains Mono', monospace",
                      scrollBeyondLastLine: false,
                      padding: { top: 10 },
                      automaticLayout: true,
                    }}
                    onChange={handleCodeChange}
                  />
                )}
              </div>
            </Panel>

            <Separator className="h-[2px] bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 cursor-row-resize transition-colors shrink-0" />

            <Panel defaultSize={35} className="bg-white dark:bg-[#0a0a0a] flex flex-col">
              <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400"><Terminal className="w-4 h-4" /> Test Results</div>
                  {results && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      <Trophy className="w-3 h-3" /> {results.filter(r => r.passed).length} / {results.length} Passed
                    </div>
                  )}
                </div>
                {executionMeta?.time && <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Time: {executionMeta.time}s | Memory: {Math.floor(executionMeta.memory / 1024)}MB</div>}
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#0a0a0a]">
                {executionMeta?.error && (
                  <div className="animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500 mb-4 font-bold text-sm"><AlertCircle className="w-5 h-5" /> {executionMeta.error}</div>
                    <pre className="bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 p-4 rounded-xl text-xs font-mono text-rose-700 dark:text-rose-400 overflow-x-auto">
                      {executionMeta.compile_output || executionMeta.stderr || "An unknown error occurred."}
                    </pre>
                  </div>
                )}

                {results ? (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {results.slice(0, 2).map((res, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveTestCase(i)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium ${activeTestCase === i ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white ring-1 ring-zinc-300 dark:ring-zinc-700' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                          >
                            {res.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" />}
                            Case {i + 1}
                          </button>
                        ))}
                      </div>
                      {results.length > 2 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <Lock className="w-3 h-3 text-zinc-400" />
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{results.length - 2} Private Cases Hidden</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Input</p>
                        <pre className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl text-xs font-mono border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 overflow-x-auto">
                          {Object.entries(testCases[activeTestCase].metadata || {}).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-emerald-600 dark:text-emerald-500/80">{key} =</span>
                              <span>{Array.isArray(value) ? `[${value.join(", ")}]` : String(value)}</span>
                            </div>
                          ))}
                          {!testCases[activeTestCase].metadata && <div>No metadata</div>}
                        </pre>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Actual Output</p>
                        <pre className={`p-4 rounded-xl text-xs font-mono border overflow-x-auto ${results[activeTestCase].passed ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'}`}>
                          {results[activeTestCase].actual || "No Output"}
                        </pre>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Expected Output</p>
                        <pre className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl text-xs font-mono border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 overflow-x-auto">
                          {results[activeTestCase].expected}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-4 uppercase tracking-widest font-bold text-[10px]">
                    <Terminal className="w-10 h-10 stroke-[1px]" />
                    Run tests to see results
                  </div>
                )}

                {isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-emerald-500 gap-3">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Running Tests...</p>
                  </div>
                )}
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  );
}