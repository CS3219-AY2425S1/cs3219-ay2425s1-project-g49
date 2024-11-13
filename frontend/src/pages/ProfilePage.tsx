import { useContext, useEffect, useState } from "react";
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContextProvider";
import { Button, Icon } from 'semantic-ui-react';
import '../css/ProfilePage.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TooltipItem, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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


	const chartData = {
		labels: ['Easy', 'Medium', 'Hard'],
		datasets: [
			{
				label: 'Questions Solved',
				data: [
					solvedQuestions.Easy,
					solvedQuestions.Medium,
					solvedQuestions.Hard,
				],
				backgroundColor: 'white',
				borderColor: 'black',
				borderWidth: 2,
			},
			{
				label: 'Total Questions',
				data: [
					questionStats.Easy,
					questionStats.Medium,
					questionStats.Hard,
				],
				backgroundColor: 'black',
				borderColor: 'white',
				borderWidth: 2,
			},
		],
	};


	const chartOptions: ChartOptions<'bar'> = {
		plugins: {
			legend: {
				position: 'bottom',
				labels: {
					color: 'white',
					font: {
						weight: 'lighter',
					}
				},
			},
		},
	};


	return (
		<div className="bg-[#121212] flex flex-col items-center justify-center h-screen w-full">
			<div className="bg-[#1E1E1E] p-8 rounded-3xl shadow-lg w-auto max-w-md">
				<h1 className="text-4xl font-bold text-white mb-6 text-center">My Profile</h1>

				{decodedToken && (
					<>
						<h2 className="text-xl text-white mb-2">Email: {decodedToken.email}</h2>
						<h2 className="text-xl text-white mb-6">Full Name: {decodedToken.name}</h2>
					</>
				)}

				<div className="mb-6">
					<h3 className="text-2xl font-semibold mb-4 text-white">User Statistics</h3>
					<div className="w-full">
						<Bar data={chartData} options={chartOptions} />
					</div>
				</div>

				<div className="flex items-center justify-between mt-8 space-x-4">
					<Button
						icon
						circular
						className="flex items-center px-6 py-3"
						color="vk"
						onClick={home}
					>
						<Icon name="home" />
						<span className="ml-2">Home</span>
					</Button>

					<Button
						icon
						circular
						className="flex items-center px-6 py-3"
						color="red"
						onClick={logout}
					>
						<Icon name="sign-out" />
						<span className="ml-2">Logout</span>
					</Button>
				</div>
			</div>
		</div>
	);
};