import React from "react";
import { Question } from "./questiontable";
import axios from "axios";

interface UploadFileProps {
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

export interface JSONQuestion {
  id: string;
  title: string;
  description: string;
  categories: string;
  complexity: string;
  link: string;
}

const UploadFile: React.FC<UploadFileProps> = ({ setQuestions }) => {
  const allowedComplexities = ["Easy", "Medium", "Hard"];
  const allowedCategories = [
    "Strings",
    "Algorithms",
    "Data Structures",
    "Bit Manipulation",
    "Databases",
    "Recursion",
    "Arrays",
    "Brainteaser",
    "Heap",
  ];
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          try {
            const jsonQuestions: JSONQuestion[] = JSON.parse(content);
            const existingQuestions = await axios.get(
              "http://localhost:3002/questions"
            );
            const existingQuestionIds = existingQuestions.data.map(
              (q: JSONQuestion) => q.id
            );
            for (const question of jsonQuestions) {
              if (
                !question.id ||
                !question.title ||
                !question.description ||
                !question.categories ||
                !question.complexity ||
                !question.link
              ) {
                alert(
                  "Each question must have id, title, description, categories, complexity, and link fields."
                );
                return;
              }
              if (!allowedComplexities.includes(question.complexity)) {
                alert(
                  `Invalid complexity: ${question.complexity}. Allowed complexities are: ${allowedComplexities.join(", ")}`
                );
                return;
              }
              const questionCategories = question.categories
                .split(",")
                .map((cat) => cat.trim());
              const isValidCategories = questionCategories.every((cat) =>
                allowedCategories.includes(cat)
              );
              if (!isValidCategories) {
                alert(
                  `Invalid categories: ${question.categories}. Allowed categories are: ${allowedCategories.join(", ")}`
                );
                return;
              }
              if (existingQuestionIds.includes(Number(question.id))) {
                alert(
                  `Question with ID ${question.id} already exists in the database.`
                );
                continue;
              }
              const questionData = {
                id: question.id,
                title: question.title,
                description: question.description,
                link: question.link,
                categories: question.categories,
                complexity: question.complexity,
              };
              try {
                const response = await axios.post(
                  "http://localhost:3002/questions",
                  questionData
                );
                // const response = await axios.get('http://localhost:3002/questions');
              } catch (error) {
                console.log("Error creating question: " + error);
              }
            }
            setQuestions((prevQuestions) => [
              ...prevQuestions,
              ...jsonQuestions,
            ]);
          } catch (error) {
            alert("Invalid file format: please upload json formatted file");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".json"
        onChange={handleUpload}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <img
        src="upload-icon.png"
        alt="Upload"
        className="w-8 h-8 cursor-pointer"
      />
    </div>
  );
};

export default UploadFile;
