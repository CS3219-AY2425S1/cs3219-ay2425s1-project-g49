import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface CustomJwtPayload extends JwtPayload {
	email?: string;
	name?: string;
}

export default function CollaborationPage() {
	const [isValidRoom, setIsValidRoom] = useState(false);
	const [loading, setLoading] = useState(true);
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
				fetch("http://localhost:3009/rabbitmq/validate_room", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: decodedToken?.email,
						roomId: roomId
					}),
				})
					.then((response) => response.json())
					.then((result) => {
						console.log("Accept post successful", result);
						if (result.room_status) {
							setIsValidRoom(true);
						} else {
							console.log("Invalid room id")
						}
					})
					.catch((error) => {
						console.error("Error during accept post:", error);
						navigate("/matching-page")
					});
			} finally {
				setLoading(false);
			}
		};

		validateRoom();
	}, [roomId, navigate]);

	if (loading) {
		return <div>Loading...</div>; // Display a loading state while validating
	}

	return (
		<div className="text-center">
			{isValidRoom ? (
				<h1 className="mt-3 text-7xl">Collaboration Page</h1>
			) : (
				<h1 className="mt-3 text-7xl">Invalid Room</h1>
			)}
		</div>
	);
}
