"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { Play, Send, ChevronLeft, Settings, Sun, Moon } from 'lucide-react';
import { LANGUAGES, LangaugeKey } from '@/config/languages';
import { escape, unescape } from 'querystring';


const CodeWorkspace = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<any>(null);
  const problemId=1;

  const [compileError, setcompileError] = useState();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setlanguage] = useState<LangaugeKey>("cpp");

  // Sync theme with document class for Tailwind dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  function encodeBase64(text: string = ""): string {
  return btoa(
    new TextEncoder().encode(text)
      .reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
}


function decodeBase64(encoded: string = ""): string {
  const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

  const fetchcompileresponse = async () => {

    const encoded_code= encodeBase64(code);

   
   
  

    try {
      const response = await fetch("/api/coderun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encoded_code ,
           judge0_id:LANGUAGES[language].judge0_id  }),

      });

      const result = await response.json();
       console.log(output);
       

      setOutput(result);
      







    } catch (error) {
      console.log(error);
    }


  };

const decodedStdout =
  output?.stderr
    ? new TextDecoder().decode(
        Uint8Array.from(atob(output.stderr), c => c.charCodeAt(0))
      )
    : "";


  useEffect(()=>{
    try{
    const fetchProblem= async ()=>{

      const res= fetch(`api/problems/${problemId}`);
      const data = await (await res).json();


      setCode(data.starterTemplate[language]);

    }

    fetchProblem();
  }catch(error){
    console.error("Failed to fetch problem:", error);

  }




  },[problemId,language]);  


  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#1a1a1a] text-slate-900 dark:text-gray-200 transition-colors duration-200">
      {/* Navbar */}
      <nav className="h-12 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-[#282828]">
        <div className="flex items-center gap-4">
          <ChevronLeft className="w-5 h-5 cursor-pointer hover:text-blue-500" />
          <span className="font-medium text-sm">Two Sum</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={fetchcompileresponse} className="flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 rounded text-sm transition">
              <Play className="w-3 h-3 fill-current text-green-600" /> Run
            </button>
            <button className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition font-bold">
              <Send className="w-3 h-3 fill-current" /> Submit
            </button>
          </div>

          <div className="h-6 w-[1px] bg-slate-300 dark:bg-gray-600" />

          <select
            value={language}
            className="px-3 py-1 text-sm rounded bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 transition outline-none"
            onChange={(e) => setlanguage(e.target.value as LangaugeKey)}


          >
            {
              Object.entries(LANGUAGES).map(([key,lang])=>(
              <option key={key} value={key}>
                {lang.label}
              
            
                
              </option>
              ))
            }
          
        


          </select>


          <div className="h-6 w-[1px] bg-slate-300 dark:bg-gray-600 mx-2" />

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700 transition"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
          <Settings className="w-5 h-5 text-slate-400 cursor-pointer" />
        </div>
      </nav>

      {/* Main Content Areas */}
      <PanelGroup orientation="horizontal" className="flex-grow">
        {/* Left: Problem Description */}
        <Panel defaultSize={40} minSize={20} className="bg-white dark:bg-[#282828] overflow-y-auto border-r border-slate-200 dark:border-transparent">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">1. Two Sum</h1>
            <div className="flex gap-2 mb-4">
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-medium">Easy</span>
            </div>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed mb-4 text-sm">
              Given an array of integers <code className="bg-slate-100 dark:bg-gray-700 px-1 rounded">nums</code> and an integer <code className="bg-slate-100 dark:bg-gray-700 px-1 rounded">target</code>,
              return indices of the two numbers such that they add up to target.
            </p>
            <div className="bg-slate-100 dark:bg-[#333] p-4 rounded-lg font-mono text-sm border border-slate-200 dark:border-transparent">
              <p className="text-slate-500 dark:text-gray-400">Example 1:</p>
              <p className="mt-2">Input: nums = [2,7,11,15], target = 9</p>
              <p>Output: [0,1]</p>
            </div>
          </div>
        </Panel>

        {/* Resizable Divider */}
        <PanelResizeHandle className="w-1.5 bg-slate-100 dark:bg-black hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors cursor-col-resize" />

        {/* Right: Code Editor & Console */}
        <Panel defaultSize={60}>
          <PanelGroup orientation="vertical">
            <Panel defaultSize={70} className="bg-white dark:bg-[#1e1e1e]">
              <Editor
                height="100%"
                theme={isDarkMode ? "vs-dark" : "light"}
                defaultLanguage="javascript"
                value={LANGUAGES[language].template}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 }
                }}
              />
            </Panel>

            <PanelResizeHandle className="h-1.5 bg-slate-100 dark:bg-black hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors cursor-row-resize" />

            {/* Bottom: Console/Test Cases */}
            <Panel defaultSize={30} className="bg-white dark:bg-[#282828] border-t border-slate-200 dark:border-gray-700">
              <div className="p-4">
                <div className="flex gap-4 border-b border-slate-200 dark:border-gray-700 mb-4 text-sm font-medium">
                  <span className="text-slate-400  dark:text-gray-500 pb-2 cursor-pointer hover:text-slate-600">Testcase</span>
                  <span className="border-b-2 border-blue-500 dark:border-white pb-2 cursor-pointer text-blue-600 dark:text-white">Result</span>
                </div>
                <div className="text-sm text-slate-500 dark:text-gray-900 italic">
                  {output ?decodeBase64(output.compile_output ?? output.stdout) : "Click Run to see your output"}
               
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default CodeWorkspace;