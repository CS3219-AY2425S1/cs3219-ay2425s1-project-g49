import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import  { jwtDecode, JwtPayload } from "jwt-decode";
import { Grid, Segment, Loader, Header } from "semantic-ui-react";
import Editor from "@monaco-editor/react";

interface CustomJwtPayload extends JwtPayload {
	email?: string;
	name?: string;
}

export default function CollaborationPage() {
	const [isValidRoom, setIsValidRoom] = useState(false);
	const [loading, setLoading] = useState(true);
	const [question, setQuestion] = useState<string>(""); // Sample question data
	const navigate = useNavigate();
	const location = useLocation();
	const requestData = location.state;
	const { roomId } = useParams();

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
		return <Header as="h1" textAlign="center">Invalid Room</Header>;
	}

	return (
		<Grid padded>
			<Grid.Row>
				<Grid.Column width={8}>
					<Segment style={{ backgroundColor: '#1e1e1e', color: '#ffffff' }}>
						<Header as="h2" style={{ color: '#ffffff' }}>Coding Question</Header>
						<p>{question}</p>
					</Segment>
				</Grid.Column>
				<Grid.Column width={8}>
					<Segment style={{ backgroundColor: '#1e1e1e', color: '#ffffff' }}>
						<Header as="h2" style={{ color: '#ffffff' }}>Code Editor</Header>
						<Editor
							height="400px"
							defaultLanguage="javascript"
							defaultValue="// Write your code here"
							theme="vs-dark"
						/>
					</Segment>
				</Grid.Column>
			</Grid.Row>
		</Grid>
	);
}
