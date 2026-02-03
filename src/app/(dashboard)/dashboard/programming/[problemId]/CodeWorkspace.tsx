"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Panel, Group, Separator } from "react-resizable-panels";
import { Play, Send, ChevronLeft, Sun, Moon, Terminal, CheckCircle2, XCircle, Code2, Layers } from 'lucide-react';
import { LANGUAGES, LangaugeKey } from '@/config/languages';
import ReactMarkdown from 'react-markdown';

export default function CodeWorkspace({ problem }: any) {
  const router = useRouter();
  const [language, setLanguage] = useState<LangaugeKey>("cpp");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<any[] | null>(null);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark for pro feel
  const [isRunning, setIsRunning] = useState(false);

  const testCases = typeof problem.testCases === 'string' ? JSON.parse(problem.testCases) : problem.testCases;

  useEffect(() => {
    if (problem.starterTemplate?.[language]) {
      setCode(problem.starterTemplate[language]);
    }
  }, [language, problem]);

  useEffect(() => {
    if (output && activeTestCase >= output.length) {
      setActiveTestCase(0);
    }
  }, [output, activeTestCase]);

  const decodeBase64 = (encoded: string) => {
    if (!encoded) return "";
    try { return atob(encoded); } catch { return "Decode Error"; }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const res = await fetch("/api/problems/run", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, userCode: code, language }),
      });
      const data = await res.json();
      const results = Array.isArray(data) ? data : data.submissions || [];
      setOutput(results);
      setActiveTestCase(0);
    } catch (err) {
      console.error(err);
    } finally { setIsRunning(false); }
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''} transition-colors duration-300`}>
      {/* PROFESSIONAL NAVBAR */}
      <nav className="h-14 border-b flex items-center justify-between px-6 bg-white dark:bg-[#0a0a0a] dark:border-zinc-800 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-all">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Problems</span>
          </div>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
          <span className="font-semibold text-sm tracking-tight dark:text-zinc-200">{problem.id}. {problem.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LangaugeKey)}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 outline-none transition-all cursor-pointer"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => <option key={key} value={key}>{lang.label}</option>)}
          </select>

          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border dark:border-zinc-800">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm ${isRunning ? 'opacity-50 cursor-not-allowed' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:scale-[1.02]'}`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse' : 'text-emerald-500 fill-emerald-500'}`} />
              {isRunning ? "Running..." : "Run"}
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]">
              <Send className="w-3.5 h-3.5" /> Submit
            </button>
          </div>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5 text-zinc-400 hover:text-yellow-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
          </button>
        </div>
      </nav>

      {/* WORKSPACE LAYOUT */}
      <Group orientation="horizontal" className="flex-1">
        {/* PROBLEM DESCRIPTION PANEL */}
        <Panel defaultSize={40} minSize={30} className="bg-white dark:bg-[#0a0a0a] flex flex-col border-r dark:border-zinc-800">
          <div className="flex items-center gap-2 px-6 py-3 border-b dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/30">
            <Layers className="w-4 h-4" /> Description
          </div>
          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            <h1 className="text-2xl font-bold mb-4 dark:text-white tracking-tight">{problem.title}</h1>
            <div className="flex items-center gap-2 mb-6">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 [&_strong]:text-zinc-900 dark:[&_strong]:text-zinc-100 [&_h1]:text-zinc-900 dark:[&_h1]:text-zinc-100 [&_h2]:text-zinc-900 dark:[&_h2]:text-zinc-100 [&_h3]:text-zinc-900 dark:[&_h3]:text-zinc-100 [&_code]:text-pink-500 dark:[&_code]:text-pink-400">
              <ReactMarkdown>{problem.description}</ReactMarkdown>
            </div>
          </div>
        </Panel>

        <Separator className="w-[2px] bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 transition-colors cursor-col-resize" />

        {/* EDITOR & OUTPUT PANEL */}
        <Panel defaultSize={60}>
          <Group orientation="vertical">
            <Panel defaultSize={65} className="bg-white dark:bg-[#0a0a0a] flex flex-col">
              <div className="flex items-center gap-2 px-6 py-3 border-b dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/30">
                <Code2 className="w-4 h-4" /> Code Editor
              </div>
              <div className="flex-1 pt-2">
                <Editor
                  height="100%"
                  theme={isDarkMode ? "vs-dark" : "light"}
                  language={language}
                  value={code}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    padding: { top: 20 },
                    fontFamily: "'JetBrains Mono', monospace",
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                  }}
                  onChange={(v) => setCode(v || "")}
                />
              </div>
            </Panel>

            <Separator className="h-[2px] bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 transition-colors cursor-row-resize" />

            <Panel defaultSize={35} className="bg-white dark:bg-[#0a0a0a] flex flex-col">
              <div className="flex items-center gap-2 px-6 py-3 border-b dark:border-zinc-800 text-xs font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/30">
                <Terminal className="w-4 h-4" /> Test Results
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {output && output.length > 0 ? (
                  <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-2">
                      {output.map((res, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveTestCase(i)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTestCase === i ? 'bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                        >
                          {res.status?.id === 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                          Case {i + 1}
                        </button>
                      ))}
                    </div>

                    {output && output.length > 0 && output[activeTestCase] ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className={`text-sm font-bold mb-2 ${output[activeTestCase].status?.id === 3 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {output[activeTestCase].status?.description}
                            </h3>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">Input</p>
                            <pre className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl text-xs font-mono border dark:border-zinc-800 dark:text-zinc-300 overflow-x-auto">
                              {JSON.stringify(testCases[activeTestCase].input, null, 2)}
                            </pre>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">Output</p>
                            <pre className={`p-4 rounded-xl text-xs font-mono border dark:border-zinc-800 overflow-x-auto ${output[activeTestCase].status?.id === 3 ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50/30 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                              {decodeBase64(output[activeTestCase].stdout) || "No output result"}
                            </pre>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">Expected</p>
                            <pre className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl text-xs font-mono border dark:border-zinc-800 dark:text-zinc-300 overflow-x-auto">
                              {testCases[activeTestCase].output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4 opacity-60">
                    <Terminal className="w-12 h-12 stroke-[1px]" />
                    <p className="text-sm font-medium">Click "Run" to execute test cases against your code.</p>
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