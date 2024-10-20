import React, { useState } from 'react';
import { Question } from './questiontable'; // Adjust the import based on your file structure

interface EditQuestionFormProps {
    question: Question;
    onUpdate: (updatedQuestion: Question) => void;
    onClose: () => void;
}

const EditQuestionForm: React.FC<EditQuestionFormProps> = ({ question, onUpdate, onClose }) => {
    const [title, setTitle] = useState(question.title);
    const [description, setDescription] = useState(question.description);
    const [categories, setCategories] = useState(question.categories);
    const [complexity, setComplexity] = useState(question.complexity);
    const [link, setLink] = useState(question.link);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedQuestion = {
            ...question,
            title,
            description,
            categories,
            complexity,
            link,
        };
        onUpdate(updatedQuestion);
        onClose();
    };

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50">
            <form className="bg-white text-black p-5 rounded flex flex-col space-y-4" onSubmit={handleSubmit}>
                <h1 className="text-xl font-bold">Edit Question</h1>
                <label className="flex flex-row gap-4">
                <span className="text-lg font-semibold">Title:</span>
                    <input type="text" className="rounded border border-gray-300 p-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label className="flex flex-row gap-4">
                <span className="text-lg font-semibold">Description:</span>
                    <textarea value={description} className="rounded border border-gray-300 p-2" onChange={(e) => setDescription(e.target.value)} required />
                </label>
                <label className="flex flex-row gap-4">
                <span className="text-lg font-semibold">Categories:</span>
                    <input type="text" className="rounded border border-gray-300 p-2" value={categories} onChange={(e) => setCategories(e.target.value)} required />
                </label>
                <label className="flex flex-row gap-4">
                <span className="text-lg font-semibold">Complexity:</span>
                    <input type="text" className="rounded border border-gray-300 p-2" value={complexity} onChange={(e) => setComplexity(e.target.value)} required />
                </label>
                <label className="flex flex-row gap-4">
                <span className="text-lg font-semibold">Link:</span>
                    <input type="url" className="rounded border border-gray-300 p-2" value={link} onChange={(e) => setLink(e.target.value)} required />
                </label>
                <button type="submit" className="bg-blue-500 text-white rounded px-2 py-1">Update</button>
                <button type="button" onClick={onClose} className="bg-blue-500 text-white rounded px-2 py-1">Cancel</button>
            </form>
        </div>
    );
};

export default EditQuestionForm;
