import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { UserContext } from "../UserContextProvider";
import { Button, Icon } from 'semantic-ui-react';

interface CustomJwtPayload extends JwtPayload {
    email?: string;
    name?: string;
}

export default function MatchingPage() {

    const topic = ['Algorithm', 'DynamicProgramming', 'Array', 'SQL', 'Heap', 'Recursion', 'Graph', 'Sorting']
    const difficulty = ['Easy', 'Medium', 'Hard']
    const lang = ['C', 'C#', 'C++', 'Go', 'Java', 'Javascript', 'Kotlin', 'Python', 'Rust', 'TypeScript']
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const context = useContext(UserContext);
	const { setLoggedIn } = context!;

    useEffect(() => {
        const jwtToken = localStorage.getItem("access_token");
        if (jwtToken) {
            const decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
            if (decodedToken.email) {
                setUserEmail(decodedToken.email);
            } else {
                console.log("Email not found in the token");
            }
        } else {
            console.log("No token found in localStorage");
            navigate('/login');
        }
    }, [navigate]);

    const logout = () => {
		localStorage.removeItem("access_token");
		setLoggedIn(false);
		navigate('/login');
	}

    const [selectedTopic, setSelectedTopic] = useState(topic[0]);
    const [selectedDificulty, setSelectedDifficulty] = useState(difficulty[0]);
    const [selectedLanguage, setSelectedLanguage] = useState(lang[0]);

    const handleSubmit = async () => {
        console.log("submit button pressed");
        const requestData = {
            categories: selectedTopic,
            complexity: selectedDificulty,
            language: selectedLanguage,
            email: userEmail  
        };

        try {
            const response = await fetch('http://localhost:3009/rabbitmq/enter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
            
            if (response.ok) {
                console.log('Request sent successfully');
                navigate('/loading',  { state: requestData });
            } else {
                console.error('Failed to send request');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="flex items-center justify-between pr-4">
                <h1 className="text-left text-3xl font-bold pt-4 pb-4 pl-4 pr-8">PeerPrep</h1>
                <Button icon circular className="flex items-center px-4" color="red" onClick={logout}>
                    <Icon name="sign-out" />
                    <span className="ml-2">Logout</span>
                </Button>
            </div>
            <div className="grid grid-cols-4 h-screen items-start">
                <div className="mx-4 min-h-[85vh] bg-gray-800 outline outline-1 outline-gray-500 col-span-3 rounded-lg shadow"></div>
                <div className="mx-4 min-h-[55vh] bg-gray-800 text-white col-span-1 rounded-lg shadow flex flex-col outline outline-1 outline-gray-500">
                    <div className="flex flex-col px-4 py-2">
                        <label className="text-sm my-1 font-semibold text-left"> Select Topic</label>
                        <select className="bg-gray-800 outline outline-1 outline-gray-500 my-1 h-10 rounded-lg" value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}>
                            {topic.map((t) => (<option value={t}> {t} </option>))}
                        </select>
                    </div>
                    <div className="flex flex-col px-4 py-2">
                        <label className="text-sm my-1 font-semibold text-left"> Select Difficulty</label>
                        <select className="bg-gray-800 outline outline-1 outline-gray-500 my-1 h-10 rounded-lg" value={selectedDificulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}>
                            {difficulty.map((level) => <option value={level}> {level} </option>)}
                        </select>
                    </div>
                    <div className="flex flex-col px-4 py-2">
                        <label className="text-sm my-1 font-semibold text-left"> Select Language</label>
                        <select className="bg-gray-800 outline outline-1 outline-gray-500 my-1 h-10 rounded-lg" value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}>
                            {lang.map((l) => <option value={l}> {l} </option>)}
                        </select>
                    </div>
                    <div className="flex flex-col justify-center px-4 py-4">
                        <hr className="my-2" />
                        <button className="bg-white h-12 rounded-lg text-center text-black font-semibold" onClick={handleSubmit}>Find a Peer</button>
                    </div>
                </div>
            </div>
        </div>
    )
}