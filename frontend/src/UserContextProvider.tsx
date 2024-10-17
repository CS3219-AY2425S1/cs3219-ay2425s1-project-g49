import React, { useState, createContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';

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
	const [ready, setReady] = useState(false); // New loading state

	const navigate = useNavigate();

	const isTokenValid = (token: string) => {
		const decodedToken = jwtDecode<JwtPayload>(token);
		const currentTime = Date.now() / 1000;
		// console.log("decoded", decodedToken);
		return decodedToken.exp !== undefined && decodedToken.exp > currentTime;
	};

	useEffect(() => {
		// console.log(token);
		// console.log(loggedIn);
		const jwtToken = localStorage.getItem("access_token");
		if (jwtToken && isTokenValid(jwtToken)) {
			setToken(jwtToken);
			setLoggedIn(true);
			setReady(true)
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