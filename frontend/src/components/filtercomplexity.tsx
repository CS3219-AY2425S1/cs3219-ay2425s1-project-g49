import React from 'react';
import { Question } from './questiontable';

interface FilterComplexityProps {
  complexity: string;
  setComplexity: React.Dispatch<React.SetStateAction<string>>;
  questions: Question[];
}

const FilterComplexity: React.FC<FilterComplexityProps> = ({ complexity, setComplexity, questions }) => {
  const uniqueComplexities = Array.from(new Set(questions.map((q) => q.complexity)));
  return (
    <select
      value={complexity}
      onChange={(e) => setComplexity(e.target.value)}
      className="border rounded-md p-2 text-sm dark:bg-gray-700 dark:text-white relative w-1/6"
    >
      <option value="">All Complexities</option>
      {uniqueComplexities.map((complexityOption) => (
        <option key={complexityOption} value={complexityOption}>
          {complexityOption}
        </option>
      ))}
    </select>
  );
};

export default FilterComplexity;
