import React, { useEffect, useRef, useState } from "react";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import io, { Socket } from "socket.io-client";
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";

interface CollaborativeEditorProps {
  sessionId: string;
  onCodeChange: (code: string) => void;
  initialCode: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  sessionId,
  onCodeChange,
  initialCode,
}) => {
  const [editorContent, setEditorContent] = useState<string>(initialCode);
  const socketRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
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
  console.log("selected is", sessionStorage.getItem("selectedLanguage"));
  useEffect(() => {
    socketRef.current = io("http://localhost:3008");

    socketRef.current.emit("joinSession", sessionId);

    socketRef.current.on("update", (data: { text: string }) => {
      if (editorRef.current && data.text !== editorRef.current.getValue()) {
        editorRef.current.setValue(data.text);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [sessionId]);

  const handleEditorChange: OnChange = (value) => {
    const updatedCode = value || "";
    setEditorContent(updatedCode);
    onCodeChange(updatedCode);
    sessionStorage.setItem("collab_editor_content", updatedCode);
    socketRef.current?.emit("edit", { sessionId, text: value });
  };

  const handleFormat = () => {
    if (editorRef.current) {
      const formatted = prettier.format(editorRef.current.getValue(), {
        parser: "babel",
        plugins: [parserBabel as any],
      });
      editorRef.current.setValue(formatted);
      socketRef.current?.emit("edit", { sessionId, text: formatted });
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.setValue(initialCode);
  };

  return (
    <div>
      <select
        className="text-black mb-2"
        onChange={(e) => setSelectedLanguage(e.target.value)}
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
