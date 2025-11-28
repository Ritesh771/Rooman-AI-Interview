import { useState } from "react";
import { Button } from "@/components/ui/button";
import { executeCode } from "@/code/utils/codeplatform/api";
import "@/code/styles/coding-interview.css";

const Output = ({ editorRef, language, stdinValue, onStdinChange }) => {
    const [output, setOutput] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const runCode = async () => {
        const sourceCode = editorRef.current?.getValue();
        if (!sourceCode) return;
        try {
            setIsLoading(true);
            setIsError(false);
            setOutput([]);

            const { run: result } = await executeCode(
                language,
                sourceCode,
                stdinValue
            );

            const outputLines = [];
            if (result.stdout) {
                outputLines.push(...result.stdout.split("\n"));
            }
            if (result.stderr) {
                outputLines.push("----- Error -----");
                outputLines.push(...result.stderr.split("\n"));
                setIsError(true);
            }

            setOutput(outputLines);
        } catch (error) {
            setIsError(true);
            setOutput(["Execution failed", error.message]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="coding-editor-output-panel flex h-full flex-col bg-slate-950 text-slate-100">
            <div className="border-b border-white/10 px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold">Execution Output</p>
                        <p className="text-xs text-slate-400">
                            {isError ? "Errors detected" : "Console stream"}
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                        onClick={runCode}
                        className="bg-white text-slate-900 hover:bg-slate-200 border-none"
                    >
                        {isLoading ? "Running..." : "Run"}
                    </Button>
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Custom Input (stdin)
                    </label>
                    <textarea
                        value={stdinValue}
                        onChange={(event) => onStdinChange?.(event.target.value)}
                        placeholder="Provide custom input for your program..."
                        className="mt-1 w-full min-h-[72px] rounded-md border border-white/20 bg-white/5 p-2 text-sm text-white placeholder:text-slate-400 focus:border-white/40 focus:outline-none focus:ring-0"
                    />
                </div>
            </div>

            <div className="coding-interview-scrollbar flex-1 overflow-auto px-4 py-3 text-sm leading-6">
                {output.length > 0 ? (
                    output.map((line, index) => (
                        <p
                            key={`${line}-${index}`}
                            className={
                                line.includes("Error") || line.includes("-----")
                                    ? "text-rose-300"
                                    : ""
                            }
                        >
                            {line}
                        </p>
                    ))
                ) : (
                    <p className="text-slate-400">
                        {isLoading
                            ? "Running code..."
                            : "Click Run to see your console output"}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Output;
