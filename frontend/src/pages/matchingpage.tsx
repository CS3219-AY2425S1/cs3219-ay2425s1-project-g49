import { useNavigate } from 'react-router-dom';

export default function MatchingPage() {

    const topic = ['Strings', 'Algorithms', 'Data Structures', 'Bit Manipulation', 'Recursion', 'Databases', 'Arrays', 'Brainteaser']
    const difficulty = ['Easy', 'Medium', 'Hard']
    const language = ['C++', 'Java', 'Javascript', 'Python']
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-4 h-screen items-center bg-gray-800">
            <div className="mx-4 min-h-[600px] bg-gray-800 outline outline-1 outline-gray-500 col-span-3 rounded-lg shadow"></div>
            <div className="mx-4 min-h-96 bg-gray-800 text-white col-span-1 rounded-lg shadow flex flex-col py-2 outline outline-1 outline-gray-500">
                <div className="flex flex-col px-4 py-2">
                    <label className="text-sm my-1 font-semibold text-left"> Select topic</label>
                    <select className="bg-gray-800 outline outline-1 outline-gray-500 my-1 h-10 rounded-lg">
                        {topic.map((t) => (<option value={t}> {t} </option>))}
                    </select>
                </div>
                <div className="flex flex-col px-4 py-2">
                    <label className="text-sm my-1 font-semibold text-left"> Select difficulty</label>
                    <select className="bg-gray-800 outline outline-1 outline-gray-500 my-1 h-10 rounded-lg">
                        {difficulty.map((level) => <option value={level}> {level} </option>)}
                    </select>

                </div>
                <div className="flex flex-col px-4 py-2">
                    <label className="text-sm my-1 font-semibold text-left"> Select Language</label>
                    <select className="bg-gray-800 outline outline-1 outline-gray-500 my-1 h-10 rounded-lg">
                        {language.map((lang) => <option value={lang}> {lang} </option>)}
                    </select>
                </div>

                <div className="flex flex-col justify-center px-3 my-4">
                    <hr className="my-5" />
                    <button className="bg-white h-12 rounded-lg text-center text-black w-full font-semibold" 
                    onClick={() => navigate("/loading")}>Find a Peer</button>
                </div>

            </div>
        </div>
    )
}