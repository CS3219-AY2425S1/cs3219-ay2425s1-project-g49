import React, { useEffect, useRef, useState } from "react";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import io, { Socket } from "socket.io-client";

interface CollaborativeEditorProps {
  sessionId: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  sessionId,
}) => {
  const [editorContent, setEditorContent] = useState<string>("");
  const socketRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

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
    setEditorContent(value || "");
    socketRef.current?.emit("edit", { sessionId, text: value });
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div>
      <MonacoEditor
        height="500px"
        language="javascript"
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
