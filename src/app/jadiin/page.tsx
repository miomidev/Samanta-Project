"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, Check, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
    id: string;
    type: "info" | "success" | "error" | "loading";
    message: string;
    timestamp: string;
}

export default function JadiinPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const addLog = (type: LogEntry["type"], message: string) => {
        const timestamp = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        setLogs((prev) => [
            ...prev,
            { id: Math.random().toString(36).substr(2, 9), type, message, timestamp },
        ]);
    };

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        const init = async () => {
            // Simulate initial boot sequence
            await new Promise((resolve) => setTimeout(resolve, 500));
            addLog("info", "Initializing SAMANTA Agent v1.0.0...");

            await new Promise((resolve) => setTimeout(resolve, 800));
            addLog("loading", "Connecting to file system...");

            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const res = await fetch("/api/jadiin");

                if (!res.ok) throw new Error("Failed to reach endpoint");

                const data = await res.json();

                await new Promise((resolve) => setTimeout(resolve, 600));
                addLog("success", "Connection established.");

                await new Promise((resolve) => setTimeout(resolve, 400));
                addLog("info", `Executing command: create_file('testfile.txt')`);

                await new Promise((resolve) => setTimeout(resolve, 800));
                addLog("success", `File created successfully!`);
                addLog("info", `Content: "${data.content}"`);

                await new Promise((resolve) => setTimeout(resolve, 500));
                addLog("success", "Operation completed without errors.");
            } catch (error) {
                addLog("error", "Error: Failed to create file.");
                console.error(error);
            }
        };

        init();
    }, []);

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 flex items-center justify-center selection:bg-green-900 selection:text-green-100">
            <div className="w-full max-w-3xl bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[600px]">
                {/* Terminal Header */}
                <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
                        <Terminal size={14} />
                        <span>samanta-agent — zsh</span>
                    </div>
                    <div className="w-16" /> {/* Spacer for centering */}
                </div>

                {/* Terminal Content */}
                <div
                    ref={scrollRef}
                    className="flex-1 p-6 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
                >
                    <div className="text-neutral-500 mb-6">
                        Last login: {new Date().toDateString()} on ttys001
                        <br />
                        Type "help" for more information.
                    </div>

                    <AnimatePresence mode="popLayout">
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-start gap-3 group"
                            >
                                <div className="mt-1 shrink-0 opacity-50 select-none">
                                    {log.type === "success" && <Check className="text-green-400" size={14} />}
                                    {log.type === "error" && <AlertCircle className="text-red-400" size={14} />}
                                    {log.type === "loading" && <Loader2 className="animate-spin text-blue-400" size={14} />}
                                    {log.type === "info" && <span className="text-blue-400">➜</span>}
                                </div>

                                <div className="flex gap-3 w-full">
                                    <span className="text-neutral-600 select-none text-xs mt-0.5 w-16 text-right font-light">
                                        {log.timestamp}
                                    </span>
                                    <span
                                        className={`
                      ${log.type === "error" ? "text-red-400" : ""}
                      ${log.type === "success" ? "text-green-400 font-bold" : ""}
                      ${log.type === "loading" ? "text-blue-300" : ""}
                    `}
                                    >
                                        {log.message}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Prompt Line */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-2 mt-4 text-green-500 pt-2 border-t border-neutral-800/30"
                    >
                        <span className="text-blue-400">samanta@agent</span>
                        <span className="text-neutral-400">:</span>
                        <span className="text-purple-400">~/projects/dijadiin</span>
                        <span className="text-neutral-400">$</span>
                        <span className="w-2.5 h-5 bg-green-500/50 animate-pulse ml-1" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
