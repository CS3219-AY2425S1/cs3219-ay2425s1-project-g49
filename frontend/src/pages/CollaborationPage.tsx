import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { Button, Icon, Grid, Segment, Loader, Header } from "semantic-ui-react";
import Editor from "@monaco-editor/react";
import CollaborativeEditor from "../components/CollaborativeEditor";
import ChatWindow from "../components/ChatWindow";
import ChatGPTButton from '../components/ChatGPTButton';

interface tokenQuestions {
  id: number;
  title: string;
  solution: string;
  time: string;
}

interface CustomJwtPayload extends JwtPayload {
  email?: string;
  name?: string;
  questions?: tokenQuestions[];
}

interface Question {
  id: string;
  title: string;
  question: string;
  categories: string;
  complexity: string;
}


export default function CollaborationPage() {
  const [isValidRoom, setIsValidRoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null); // Sample question data
  const [code, setCode] = useState<string>("// Start Coding Here");
  const navigate = useNavigate();
  const location = useLocation();
  const requestData = location.state;
  const { roomId } = useParams();
  const editorRef = useRef<any>(null);


  const jwtToken = localStorage.getItem("access_token");
  let decodedToken: CustomJwtPayload | null = null;

  if (jwtToken) {
    decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
  }



  // const endCollab = async () => {
  //   const response = await fetch("http://localhost:3008/collab/end_collab", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       email: decodedToken?.email,
  //       roomId: roomId
  //     }),
  //   });
  //   if (!response.ok) {
  //     console.error("Failed to end collab");
  //   } else {
  //     console.log("Collab Room successfully deleted");
  //   }
  // }


  useEffect(() => {
    const getCollabQuestion = async () => {
      try {
        
        const response = await fetch(`http://localhost:3008/collab/collab_qn/${roomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        const result = await response.json();
        if (result.status) {
          setQuestion(result)
        } else {
          console.log(result.status)
          alert("Failed to get questions for collab")
          navigate('/matching-page')
        }
      } catch (error) {
        console.error("Error during collab Room post:", error);
        return null;
      }
    }

    const validateRoom = async () => {
      try {
        const response = await fetch(
          "http://localhost:3008/collab/validate_room",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: decodedToken?.email,
              roomId: roomId,
            }),
          }
        );
        const result = await response.json();
        if (result.room_status) {
          setIsValidRoom(true);
          await getCollabQuestion();
        } else {
          alert("Invalid room. Room does not exist / you are not authorised for this collab room!")
          navigate('/matching-page')
        }
      } catch (error) {
        console.error("Error during accept post:", error);
        navigate("/matching-page");
      } finally {
        setLoading(false);
      }
    };

    validateRoom();
  }, [roomId, navigate]);

  if (loading) {
    return <Loader active>Loading...</Loader>;
  }

  if (!isValidRoom) {
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Header as="h1" textAlign="center" style={{ color: "white" }}>
        Invalid Room
      </Header>
    </div>;
  }



  // const updateUser = async () => {
  //   const response = await fetch(`http://localhost:3001/users/${decodedToken?.email}`, {
  //     method: "PATCH",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       questions: [{
  //         id: question?.id,
  //         title: question?.title,
  //         solution: code,
  //         time: new Date().toLocaleString()
  //       }]
  //     }),
  //   });
  //   if (!response.ok) {
  //     console.error("Failed to update user");
  //   } else {
  //     console.log("User successfully updated");
  //     const data = await response.json()
  //     localStorage.setItem("access_token", data.jwtToken);
  //   }
  // }

  const endCollab = async () => {
    const response = await fetch("http://localhost:3008/collab/end_collab", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: decodedToken?.email,
        roomId: roomId,
        solution: {
          id: question?.id,
          title: question?.title,
          solution: code,
          time: new Date().toLocaleString()
        },

      }),
    });
    if (!response.ok) {
      console.error("Failed to end collab");
    } else {
      console.log("Collab Room successfully deleted");
    }
  }

  const submitCode = async () => {
    await endCollab();
    navigate("/matching-page");
    alert("Collaboration completed")
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument").run(); // Use Monaco's format action
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between pr-4">
        <h1 className="text-left text-3xl font-bold pt-4 pb-4 pl-4 pr-8">
          PeerPrep
        </h1>
        <div className="flex-1"></div>
        <Button
          icon
          circular
          className="flex items-center px-4"
          color="vk"
          onClick={formatCode}
        >
          <Icon name="code" />
          <span className="ml-2">Format</span>
        </Button>
        <Button
          icon
          circular
          className="flex items-center px-4"
          color="olive"
          onClick={submitCode}
        >
          <Icon name="upload" />
          <span className="ml-2">Submit</span>
        </Button>
        <ChatGPTButton/>
      </div>
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            <Segment style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}>
              <Header as="h2" style={{ color: "#FFFFFF" }}>
                {question?.title}
              </Header>
              <p>{question?.question}</p>
            </Segment>
            <ChatWindow />
          </Grid.Column>
          <Grid.Column width={10}>
            {/* <Segment style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}>
              <Editor
                height="450px"
                defaultLanguage="javascript"
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                onMount={(editor) => {
                  editorRef.current = editor; // Set the editor reference
                  editor.updateOptions({ automaticLayout: true }); // Enable automatic layout
                }}
              />
            </Segment> */}
            <CollaborativeEditor sessionId={roomId!} onCodeChange={handleEditorChange} />
            
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}
