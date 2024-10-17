import axios from "axios";
import React, { useState } from "react";
import EditQuestionForm from "./editquestionform";

export interface Question {
  id: string;
  title: string;
  description: string;
  categories: string;
  complexity: string;
  link: string;
}

interface QuestionTableProps {
  searchTerm: string;
  category: string;
  complexity: string;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  searchTerm,
  category,
  complexity,
  questions,
  setQuestions,
}) => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const filteredQuestions = questions.filter((question) => {
    const matchesSearchTerm = question.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = category
      ? question.categories.includes(category)
      : true;
    const matchesComplexity = complexity
      ? question.complexity === complexity
      : true;
    return matchesSearchTerm && matchesCategory && matchesComplexity;
  });

  const handleDelete = async (id: string) => {
    try {
      console.log("id is ", id);
      await axios.delete(`http://localhost:3002/questions/${id}`);
      setQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question.id !== id)
      );
    } catch (error) {
      alert("Error deleting question: " + error);
    }
    setQuestions((prevQuestions) =>
      prevQuestions.filter((question) => question.id !== id)
    );
  };

  const handleUpdate = async (updatedQuestion: Question) => {
    try {
        console.log("updated question is ", updatedQuestion)
      const response = await axios.patch(
        `http://localhost:3002/questions/${updatedQuestion.id}`,
        updatedQuestion
      );
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question.id === updatedQuestion.id ? response.data : question
        )
      );
    } catch (error) {
      alert("Error updating question: " + error);
    }
  };

  const closeEditForm = () => {
    setEditingQuestion(null);
  };

  return (
    <div className="bg-gray-800 text-white">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-700">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Categories</th>
            <th className="border px-4 py-2">Complexity</th>
            <th className="border px-4 py-2">Link</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800">
          {filteredQuestions.map((question) => (
            <tr key={question.id}>
              <td className="border px-4 py-2">{question.id}</td>
              <td className="border px-4 py-2">{question.title}</td>
              <td className="border px-4 py-2">{question.description}</td>
              <td className="border px-4 py-2">{question.categories}</td>
              <td className="border px-4 py-2">{question.complexity}</td>
              <td className="border px-4 py-2">
                <a
                  href={question.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  View
                </a>
              </td>
              <td className="border px-4 py-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="bg-red-500 text-white rounded px-2 py-1"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setEditingQuestion(question)}
                    className="bg-red-500 text-white rounded px-2 py-1"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredQuestions.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="border border-gray-300 px-4 py-2 text-center"
              >
                No questions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {editingQuestion && (
        <EditQuestionForm
          question={editingQuestion}
          onUpdate={handleUpdate}
          onClose={closeEditForm}
        />
      )}
    </div>
  );
};

export default QuestionTable;
