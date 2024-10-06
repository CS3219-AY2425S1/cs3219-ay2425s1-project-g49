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
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        console.log("Content is: ", content);
        if (typeof content === "string") {
          try {
            const jsonQuestions: JSONQuestion[] = JSON.parse(content);
            console.log("JSON questions are: ", jsonQuestions);
            for (const question of jsonQuestions) {
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
                console.log("Question created successfully:" + response.data);
              } catch (error) {
                console.log("Error creating question: " + error);
              }
            }

            // WORKING EXAMPLE
            // try {
            //   const questionData = {
            //     id: "3",
            //     title: "this is title",
            //     description: "this is question",
            //     categories: "Heap",
            //     complexity: "medium",
            //     link: "www.google.com",
            //   };
            //   const response = await axios.post(
            //     "http://localhost:3002/questions",
            //     questionData
            //   );
            //   console.log("Question created successfully:" + response.data);
            // } catch (error) {
            //   console.log("Error creating question: " + error);
            // }

            setQuestions((prevQuestions) => [
              ...prevQuestions,
              ...jsonQuestions,
            ]);
          } catch (error) {
            alert("Error parsing JSON: " + error);
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
