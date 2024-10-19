import React, { useContext, useEffect } from "react";
import { UserContext } from "../UserContextProvider";
import { useNavigate, Navigate } from "react-router-dom";
import { GoogleLogin,  CredentialResponse } from "@react-oauth/google";
import axios from 'axios';
import '../css/LoginPage.css';

export default function LoginPage() {
	const context = useContext(UserContext);
	const { loggedIn, setToken, setLoggedIn, ready } = context!; 
	const navigate = useNavigate();

	if (loggedIn) {
		return <Navigate to={'/matching-page'} />;
	}

	const startConsume = async () => {
        try {
            // Assuming login is successful and user token is saved
            const response = await fetch('http://localhost:3009/rabbitmq/consume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('Consuming started successfully');
            } else {
                console.error('Failed to start consuming queue');
            }
        } catch (error) {
            console.error('Error while consuming messages:', error);
        }
    };

	const onSuccess = async (credentialResponse: CredentialResponse) => {
		try {
		const token = credentialResponse.credential;
		// console.log("SENDING")
		// console.log(token);

		const { data: { jwtToken } } = await axios.post('http://localhost:3001/auth/google/callback', { token })
		
		if (jwtToken) {
			// console.log(jwtToken);
			setLoggedIn(true);
			setToken(jwtToken);
			localStorage.setItem("access_token", jwtToken);
			startConsume();
			navigate('/matching-page');
		}
	} catch (error) {
		alert("Error logging in: " + error);		
	}
	};

	return (
		<div className="login flex flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="mt-3 text-7xl">PeerPrep</h1>
				<p className="mt-4 text-3xl">Match, Collaborate & Ace your Coding <br /> Interviews!</p>
				<div className="googleButton mt-4">
					<GoogleLogin
						onSuccess={onSuccess}
					// onError={onError}
					/></div>

			</div>
		</div>
	)
};