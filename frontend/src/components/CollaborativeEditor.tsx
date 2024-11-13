import React, { useEffect, useRef, useState } from "react";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import io, { Socket } from "socket.io-client";
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import { debounce } from "lodash";

interface CollaborativeEditorProps {
  sessionId: string;
  onCodeChange: (code: string) => void;
  initialCode: string;
  onLanguageChange: (code: string) => void;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  sessionId,
  onCodeChange,
  initialCode,
  onLanguageChange,
}) => {
  const [editorContent, setEditorContent] = useState<string>(initialCode);
  const socketRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const isRemoteUpdate = useRef(false); // Flag to track remote updates

  var language = sessionStorage.getItem("selectedLanguage");
  const languageOptions = {
    C: "c",
    "C#": "csharp",
    "C++": "cpp",
    Go: "go",
    Java: "java",
    JavaScript: "javascript",
    Kotlin: "kotlin",
    Python: "python",
    Rust: "rust",
    TypeScript: "typescript",
  };

  const mappedValue = language
    ? languageOptions[language as keyof typeof languageOptions]
    : "c";

  const [selectedLanguage, setSelectedLanguage] = useState<string>(mappedValue);

  useEffect(() => {
    socketRef.current = io("http://localhost:3008");

    socketRef.current.emit("joinSession", sessionId);

    socketRef.current.on("update", (data: { text: string }) => {
      if (editorRef.current && data.text !== editorRef.current.getValue()) {
        isRemoteUpdate.current = true; // Set flag for remote update
        editorRef.current.setValue(data.text);
        onCodeChange(data.text);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [sessionId]);

  const debouncedEmit = debounce((sessionId, value) => {
    socketRef.current?.emit("edit", { sessionId, text: value });
  }, 100);

  const handleEditorChange: OnChange = (value) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const updatedCode = value || "";
    setEditorContent(updatedCode);
    onCodeChange(updatedCode);
    sessionStorage.setItem("collab_editor_content", updatedCode);
    debouncedEmit(sessionId, updatedCode);
  };

  const handleFormat = () => {
    if (editorRef.current) {
      const formatted = prettier.format(editorRef.current.getValue(), {
        parser: "babel",
        plugins: [parserBabel as any],
      });
      editorRef.current.setValue(formatted);
      debouncedEmit(sessionId, formatted);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.setValue(initialCode);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    onLanguageChange(language);
  }

  return (
    <div>
      <select
        className="text-black mb-2"
        onChange={(e) => handleLanguageChange(e.target.value)}
        value={selectedLanguage}
      >
        <option value="c">C</option>
        <option value="csharp">C#</option>
        <option value="cpp">C++</option>
        <option value="go">Go</option>
        <option value="java">Java</option>
        <option value="javascript">JavaScript</option>
        <option value="kotlin">Kotlin</option>
        <option value="python">Python</option>
        <option value="rust">Rust</option>
        <option value="typescript">TypeScript</option>
      </select>
      <MonacoEditor
        height="500px"
        language={selectedLanguage}
        theme="vs-dark"
        value={editorContent}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
};

export default CollaborativeEditor;
