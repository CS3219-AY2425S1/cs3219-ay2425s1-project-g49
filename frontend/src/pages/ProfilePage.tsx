import React, { useContext, useEffect } from "react";
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContextProvider";
import { Button, Icon } from 'semantic-ui-react';
import '../css/ProfilePage.css';

interface Question {
	id: number;
	title: string;
	solution: string;
	time: string;
}

interface CustomJwtPayload extends JwtPayload {
	email?: string;
	name?: string;
	questions?: Question[];
}

export default function ProfilePage() {
	const context = useContext(UserContext);
	const { setLoggedIn, loggedIn, ready } = context!;
	const navigate = useNavigate();

	while (!ready) {
		return (
			<h1>Loading</h1>
		)
	}

	if (!loggedIn) {
		return <Navigate to={'/login'} />;
	}

	const jwtToken = localStorage.getItem("access_token");

	let decodedToken: CustomJwtPayload | null = null;

	if (jwtToken) {
		decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
	} else {
		console.log("No token found in localStorage");
		navigate('/login');
	}

	const logout = () => {
		localStorage.removeItem("access_token");
		setLoggedIn(false);
		navigate('/login');
	}

	const home = () => {
		navigate('/matching-page');
	}

	return (
		<div className="bg-[#121212] flex flex-col items-center justify-center h-screen">
			<div className="bg-[#1E1E1E] p-10 rounded-3xl shadow-lg w-80">
				<h1 className="text-3xl items-center font-bold text-white mb-4">My Profile</h1>
				{decodedToken && (
					<>
						<h2 className="text-lg text-white mb-2">{decodedToken.email}</h2>
						<h2 className="text-lg text-white mb-4">{decodedToken.name}</h2>
						{decodedToken.questions && decodedToken.questions.length > 0 ? (
							<div className="text-lg text-white mb-4">
								{decodedToken.questions.map((question, index) => (
									<div key={index} className="mb-2">
										<p>Question: {question.title}</p>
										<p>Solution: {question.solution}</p>
										<p>Time: {question.time}</p>
									</div>
								))}
							</div>
						) : (
							<p className="text-lg text-white">No questions found.</p>
						)}
					</>
				)}
				<div className="flex items-center justify-between pr-4">
					<Button icon circular className="flex items-center px-4" color="vk" onClick={home}>
						<Icon name="home" />
						<span className="ml-2">Home</span>
					</Button>
					<Button icon circular className="flex items-center px-4" color="red" onClick={logout}>
						<Icon name="sign-out" />
						<span className="ml-2">Logout</span>
					</Button>
				</div>
			</div>
		</div>
	)
}
