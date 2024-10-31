import React, { useContext, useEffect } from "react";
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContextProvider";
import '../css/ProfilePage.css';

interface CustomJwtPayload extends JwtPayload {
    email?: string;  // Optional, adjust according to your JWT structure
    name?: string;   // Optional, adjust according to your JWT structure
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

	return (
	<div className="bg-[#121212] flex flex-col items-center justify-center h-screen">
	<div className="bg-[#1E1E1E] p-10 rounded-3xl shadow-lg w-80">
		<h1 className="text-3xl font-bold text-white mb-4">My Profile</h1>
		{decodedToken && (
		<>
			<h2 className="text-lg text-white mb-2">{decodedToken.email}</h2>
			<h2 className="text-lg text-white mb-4">{decodedToken.name}</h2>
		</>
		)}
		<button
		className="rounded-full mt-5 p-2 bg-[#3C3C3C] text-white hover:bg-[#4B4B4B] transition duration-200"
		onClick={logout}
		>
		Logout
		</button>
	</div>
	</div>
	)
}
