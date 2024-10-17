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
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<div className="bg-slate-900 p-20 rounded-3xl">
				<h1>My profile</h1>
				{decodedToken && (
                    <>
                        <h2>{decodedToken.email}</h2>
                        <h2>{decodedToken.name}</h2>
                    </>
                )}
				<button className="rounded-full mt-5 p-2 bg-slate-700" onClick={logout}>Logout</button>
			</div>
		</div>
	)
}