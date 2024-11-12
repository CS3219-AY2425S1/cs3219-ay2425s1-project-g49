import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../UserContextProvider";
import axios from "axios";
import QuestionTable from "../components/questiontable";
import FilterCategories from "../components/filtercategory";
import FilterComplexity from "../components/filtercomplexity";
import SearchBar from "../components/searchbar";
import UploadFile from "../components/uploadquestion";
import { Question } from "../components/questiontable";

const QuestionServicePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [complexityFilter, setComplexityFilter] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const context = useContext(UserContext);
  const { ready } = context!;

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`http://localhost:3002/questions/`);
      setQuestions(response.data);
    } catch (error) {
      alert("Error fetching questions: " + error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [questions]);

  while (!ready) {
    return <h1>Loading</h1>;
  }

  return (
    <div className="bg-[#121212] min-h-screen p-4 text-white">
      <h1 className="text-3xl font-bold text-left mb-6">Peer Prep</h1>
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
        <UploadFile setQuestions={setQuestions} />
      </div>

      <div className="bg-[#1E1E1E] rounded-md shadow-md p-4">
        <QuestionTable
          searchTerm={searchTerm}
          category={categoryFilter}
          complexity={complexityFilter}
          questions={questions}
          setQuestions={setQuestions}
        />
      </div>
    </div>
  );
};

export default QuestionServicePage;
