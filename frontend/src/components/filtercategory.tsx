import React from 'react';
import { Question } from './questiontable';

interface FilterCategoriesProps {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  questions: Question[]; 
}

const FilterCategories: React.FC<FilterCategoriesProps> = ({ category, setCategory, questions }) => {
  const uniqueCategories = Array.from(new Set(
    questions
      .flatMap((q) => q.categories.split(',').map(cat => cat.trim())) 
  ));
  return (
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      className="border rounded-md p-2 text-sm dark:bg-gray-700 dark:text-white relative w-1/6"
    >
      <option value="">All Categories</option>
      {uniqueCategories.map((categoryOption) => (
        <option key={categoryOption} value={categoryOption}>
          {categoryOption}
        </option>
      ))}
    </select>
  );
};

export default FilterCategories;
