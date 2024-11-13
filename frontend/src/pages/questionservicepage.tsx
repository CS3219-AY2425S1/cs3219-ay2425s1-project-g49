import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContextProvider";
import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, Icon } from 'semantic-ui-react';
import QuestionTable from "../components/questiontable";
import FilterCategories from "../components/filtercategory";
import FilterComplexity from "../components/filtercomplexity";
import SearchBar from "../components/searchbar";
import UploadFile from "../components/uploadquestion";
import { Question } from "../components/questiontable";


interface tokenQuestions {
  id: number;
  title: string;
  solution: string;
  language: string;
  complexity: string;
  categories: string;
  time: string;
}

interface CustomJwtPayload extends JwtPayload {
  email?: string;
  name?: string;
  role?: string;
  questions?: tokenQuestions[];
}

const QuestionServicePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [complexityFilter, setComplexityFilter] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [admin, setAdmin] = useState(false);
  const context = useContext(UserContext);
  const { ready } = context!;
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`http://localhost:3002/questions/`);
      setQuestions(response.data);
    } catch (error) {
      alert("Error fetching questions: " + error);
    }
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem("access_token");
    let decodedToken: CustomJwtPayload | null = null;

    if (jwtToken) {
      decodedToken = jwtDecode<CustomJwtPayload>(jwtToken);
      console.log(decodedToken);
    }

    if (decodedToken?.role === 'admin') {
      setAdmin(true);
    }

    fetchQuestions();
  }, [questions]);

  while (!ready) {
    return <h1>Loading</h1>;
  }

  const home = () => {
		navigate('/matching-page');
	}

  return (
    <div className="bg-[#121212] min-h-screen p-4 text-white">
      <div className="flex items-center justify-between pr-4">
        <h1 className="text-3xl font-bold text-left mb-6">Peer Prep</h1>
        <div className="flex-1"></div>
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
      </div>
      <div className="flex justify-start items-center space-x-2 mb-4 text-sm">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <FilterCategories
          category={categoryFilter}
          setCategory={setCategoryFilter}
          questions={questions}
        />
        <FilterComplexity
          complexity={complexityFilter}
          setComplexity={setComplexityFilter}
          questions={questions}
        />
        {admin && (<UploadFile setQuestions={setQuestions} />)}
      </div>

      <div className="bg-[#1E1E1E] rounded-md shadow-md p-4">
        <QuestionTable
          searchTerm={searchTerm}
          category={categoryFilter}
          complexity={complexityFilter}
          questions={questions}
          setQuestions={setQuestions}
          admin={admin}
        />
      </div>
    </div>
  );
};

export default QuestionServicePage;
