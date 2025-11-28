import {
    useRef,
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import { Button } from "@/components/ui/button";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "@/code/utils/codeplatform/constants";
import Output from "./Output";

const STORAGE_PREFIX = "coding-interview";

const CodeEditor = forwardRef(({ roomId, onRun, onSubmit, isRunning }, ref) => {
    const editorRef = useRef(null);
    const [value, setValue] = useState(
        "// Write your code here\n// Click 'Run' to test your solution"
    );
    const [language, setLanguage] = useState("javascript");
    const [stdinValue, setStdinValue] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = window.localStorage.getItem(
            `${STORAGE_PREFIX}:${roomId}`
        );
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.code) setValue(parsed.code);
                if (parsed.language) setLanguage(parsed.language);
            } catch {
                setValue(CODE_SNIPPETS[language] || "");
            }
        } else {
            setValue(CODE_SNIPPETS[language] || "");
        }
    }, [roomId]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const payload = {
            code: editorRef.current?.getValue() || value,
            language,
        };
        window.localStorage.setItem(
            `${STORAGE_PREFIX}:${roomId}`,
            JSON.stringify(payload)
        );
    }, [language, value, roomId]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        getCode: () => editorRef.current?.getValue() || value,
        getLanguage: () => language,
        getStdin: () => stdinValue,
        setCode: (newCode) => setValue(newCode),
        setLanguage: (newLanguage) => setLanguage(newLanguage),
        setStdin: (nextInput) => setStdinValue(nextInput),
    }));

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const onSelect = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        setValue(CODE_SNIPPETS[selectedLanguage] || "");
    };

    const handleRun = () => {
        if (onRun) {
            onRun(editorRef.current?.getValue() || value, language, stdinValue);
        }
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(editorRef.current?.getValue() || value, language);
        }
    };

    const handleSave = () => {
        if (typeof window === "undefined") return;
        const payload = {
            code: editorRef.current?.getValue() || value,
            language,
            savedAt: Date.now(),
        };
        window.localStorage.setItem(
            `${STORAGE_PREFIX}:${roomId}`,
            JSON.stringify(payload)
        );
    };

    return (
        <div className="coding-editor-wrapper h-full min-h-[460px] flex flex-col rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="coding-editor-toolbar flex flex-wrap items-center justify-between gap-4 border-b px-4 py-3 bg-slate-50">
                <LanguageSelector language={language} onSelect={onSelect} />
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        className="min-w-[80px]"
                    >
                        Save
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRun}
                        disabled={isRunning}
                        className="min-w-[80px]"
                    >
                        {isRunning ? "Running..." : "Run"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isRunning}
                        className="min-w-[90px]"
                    >
                        {isRunning ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex-1 coding-editor-monaco min-h-[320px]">
                    <Editor
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            smoothScrolling: true,
                        }}
                        height="100%"
                        theme="vs-dark"
                        language={language}
                        defaultValue={CODE_SNIPPETS[language]}
                        onMount={onMount}
                        value={value}
                        onChange={(newValue) => setValue(newValue || "")}
                    />
                </div>
                <div className="coding-editor-output border-t">
                    <Output
                        editorRef={editorRef}
                        language={language}
                        stdinValue={stdinValue}
                        onStdinChange={setStdinValue}
                    />
                </div>
            </div>
        </div>
    );
});

CodeEditor.displayName = "CodeEditor";

export default CodeEditor;