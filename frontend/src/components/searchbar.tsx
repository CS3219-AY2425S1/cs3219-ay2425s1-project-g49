import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-1/4">
      <input
        type="text"
        placeholder="Search by title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded-md p-2 text-sm dark:bg-gray-700 dark:text-white pl-10 pr-10 w-full"
      />
      <img
        src="search-icon.png"
        alt="Search"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4"
      />
    </div>
  );
};

export default SearchBar;
