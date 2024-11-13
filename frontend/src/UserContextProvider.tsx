import React, { useState, createContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';


interface tokenQuestions {
	id: number;
	title: string;
	solution: string;
	time: string;
}

interface CustomJwtPayload extends JwtPayload {
	email: string;
	name: string;
	questions?: tokenQuestions[];
}

interface UserContextType {
	token: string | null;
	setToken: (token: string | null) => void;
	loggedIn: boolean;
	setLoggedIn: (loggedIn: boolean) => void;
	ready: boolean;
}

export const UserContext = createContext<UserContextType | null>(null);

export function UserContextProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [loggedIn, setLoggedIn] = useState(false);
	const [ready, setReady] = useState(false);
	const navigate = useNavigate();

	const isTokenValid = (token: string) => {
		const decodedToken = jwtDecode<CustomJwtPayload>(token);
		const currentTime = Date.now() / 1000;
		return { tokenStatus: decodedToken.exp !== undefined && decodedToken.exp > currentTime, email: decodedToken.email }
	};

	useEffect(() => {

		const checkUpdate = async (email: string) => {
			try {
				const response = await fetch(`http://localhost:3001/users/update_token/${email}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				})
				const result = await response.json();
				if (result.token) {
					setToken(result.token)
					localStorage.setItem("access_token", result.token)
				} else {
					console.log("ERROR updating token")
				}
			} catch (error) {
				console.error("Error during updating token:", error);
				return null;
			}
		}

		const jwtToken = localStorage.getItem("access_token");
		if (jwtToken) {
			const { tokenStatus, email } = isTokenValid(jwtToken);
			if (tokenStatus) {
				checkUpdate(email);
				setLoggedIn(true);
				setReady(true)
			}
		} else {
			setLoggedIn(false);
			setToken(null);
			localStorage.removeItem('jwtToken');
			setReady(false)
			navigate('/');
		}
	}, [navigate]);

	return (
		<UserContext.Provider value={{ token, setToken, loggedIn, setLoggedIn, ready }}>
			{children}
		</UserContext.Provider>
	);
}