import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import  { jwtDecode, JwtPayload } from "jwt-decode";
import { Button, Icon, Grid, Segment, Loader, Header } from "semantic-ui-react";
import Editor from "@monaco-editor/react";

interface CustomJwtPayload extends JwtPayload {
	email?: string;
	name?: string;
}

export default function CollaborationPage() {
	const [isValidRoom, setIsValidRoom] = useState(false);
	const [loading, setLoading] = useState(true);
	const [question, setQuestion] = useState<string>(""); // Sample question data
	const [code, setCode] = useState<string>("// Start Coding Here");
	const navigate = useNavigate();
	const location = useLocation();
	const requestData = location.state;
	const { roomId } = useParams();
	const editorRef = useRef<any>(null);

	useEffect(() => {
		const validateRoom = async () => {
			const jwtToken = localStorage.getItem("access_token");
			let decodedToken: CustomJwtPayload | null = null;
			if (jwtToken) {
				decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
			}
			try {
				const response = await fetch("http://localhost:3009/rabbitmq/validate_room", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: decodedToken?.email,
						roomId: roomId
					}),
				});
				const result = await response.json();
				if (result.room_status) {
					setIsValidRoom(true);
					// Placed dummy question for now, 
					// Need to fetch random question from question service based on match parameters
					setQuestion("Implement a function to check if a string is a palindrome.");
				} else {
					console.log("Invalid room id");
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
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
		<Header as="h1" textAlign="center" style={{ color: 'white' }}>
		  Invalid Room
		</Header>
	  </div>
	}

	const submitCode = () => {
		navigate('/matching-page');
	}

	const handleEditorChange = (value: string | undefined) => {
		if (value) {
			setCode(value);
		}
	};

	const formatCode = () => {
		if (editorRef.current) {
			editorRef.current.getAction('editor.action.formatDocument').run(); // Use Monaco's format action
		}
	};

	return (
		<div>
			<div className="flex items-center justify-between pr-4">
				<h1 className="text-left text-3xl font-bold pt-4 pb-4 pl-4 pr-8">PeerPrep</h1>
				<div className="flex-1"></div>
				<Button icon circular className="flex items-center px-4" color="vk" onClick={formatCode}>
					<Icon name="code" />
					<span className="ml-2">Format</span>
				</Button>
				<Button icon circular className="flex items-center px-4" color="olive" onClick={submitCode}>
					<Icon name="upload" />
					<span className="ml-2">Submit</span>
				</Button>
			</div>
			<Grid padded>
				<Grid.Row>
					<Grid.Column width={6}>
						<Segment style={{ backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
							<Header as="h2" style={{ color: '#FFFFFF' }}>Coding Question</Header>
							<p>{question}</p>
						</Segment>
					</Grid.Column>
					<Grid.Column width={10}>
						<Segment style={{ backgroundColor: '#1E1E1E', color: '#FFFFFF' }}>
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
						</Segment>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</div>
	);
}
