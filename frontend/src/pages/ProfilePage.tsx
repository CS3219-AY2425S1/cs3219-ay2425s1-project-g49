import { useContext, useEffect, useState } from "react";
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContextProvider";
import { Button, Icon } from 'semantic-ui-react';
import '../css/ProfilePage.css';


interface Question {
	id: number;
	title: string;
	solution: string;
	language: string;
	complexity: string;
	categories: string;
	time: string;
}

interface questionData {
	Easy: number;
	Medium: number;
	Hard: number;
	totalQuestions: number;
}

interface solvedQuestionData {
	Easy: number;
	Medium: number;
	Hard: number;
	totalQuestions: number;
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
	const [questionStats, setQuestionStats] = useState<questionData>({ Easy: 0, Medium: 0, Hard: 0, totalQuestions: 0 });
	const [solvedQuestions, setSolvedQuestions] = useState<solvedQuestionData>({ Easy: 0, Medium: 0, Hard: 0, totalQuestions: 0 });


	const jwtToken = localStorage.getItem("access_token");

	let decodedToken: CustomJwtPayload | null = null;

	if (jwtToken) {
		decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
	} else {
		console.log("No token found in localStorage");
		navigate('/login');
	}

	useEffect(() => {
		const solvedStats: { Easy: number; Medium: number; Hard: number, totalQuestions: 0 } = {
			Easy: 0,
			Medium: 0,
			Hard: 0,
			totalQuestions: 0
		};
		if (decodedToken?.questions) {
			decodedToken.questions.forEach((question: Question) => {
				const complexity = question.complexity as keyof typeof solvedStats;
				solvedStats[complexity] += 1;
			});
			solvedStats.totalQuestions += decodedToken.questions.length;

		}
		
		setSolvedQuestions(solvedStats)

		const getQuestionStats = async () => {
			try {
				const response = await fetch(
					'http://localhost:3002/questions/stats',
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
				const result = await response.json();
				if (result) {
					setQuestionStats(result);
					console.log(result)
				} else {
					console.log(result.status);
					alert("Failed to get question stats");
				}
			} catch (error) {
				console.error("Error during question stats post:", error);
				return null;
			}
		};

		getQuestionStats();
	}, []);

	while (!ready) {
		return (
			<h1>Loading</h1>
		)
	}

	if (!loggedIn) {
		return <Navigate to={'/login'} />;
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
		<div className="bg-[#121212] flex flex-col items-center justify-center h-screen w-full">
			<div className="bg-[#1E1E1E] p-10 rounded-3xl shadow-lg w-auto">
				<h1 className="text-3xl items-center font-bold text-white mb-4">My Profile</h1>
				{decodedToken && (
					<>
						<h2 className="text-lg text-white mb-2">Email: {decodedToken.email}</h2>
						<h2 className="text-lg text-white mb-4">Full name: {decodedToken.name}</h2>
					</>
				)}

				<h3>User statistics</h3>
				<h4>Questions solved: {solvedQuestions.totalQuestions} / {questionStats.totalQuestions}</h4>
				<h4>Easy: {solvedQuestions.Easy} / {questionStats.Easy}</h4>
				<h4>Medium: {solvedQuestions.Medium} / {questionStats.Medium}</h4>
				<h4>Hardd: {solvedQuestions.Hard} / {questionStats.Hard}</h4>
				<div className="flex items-center justify-between mt-6">
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

		</div >
	);
}
