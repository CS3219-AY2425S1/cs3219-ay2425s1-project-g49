import React, { useState } from 'react';
import {
	Table,
	ModalHeader,
	ModalDescription,
	ModalContent,
	ModalActions,
	Modal,
	Button
} from 'semantic-ui-react';

import '../css/Modal.css'


interface Question {
	id: number;
	title: string;
	solution: string;
	time: string;
}

interface SolvedQuestionTableProps {
	questions?: Question[];
}

const SolvedQuestionTable: React.FC<SolvedQuestionTableProps> = ({ questions = [] }) => {
	const [open, setOpen] = useState(false);
	const [questionSolution, setQuestionSolution] = useState('');
	const [questionTitle, setQuestionTitle] = useState('');

	const handleRowClick = (title: string, solution: string) => {
		setQuestionSolution(solution);
		setQuestionTitle(title);
		setOpen(true);
	};

	return (
		<div className='h-auto'>
			{questions && questions.length > 0 ? (
				<div className="text-lg text-white">
					<Table celled inverted selectable>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>Question</Table.HeaderCell>
								<Table.HeaderCell>Time Solved</Table.HeaderCell>
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{questions.map((question, index) => (
								<Table.Row
									key={index}
									onClick={() => handleRowClick(question.title, question.solution)}>
									<Table.Cell>{question.title}</Table.Cell>
									<Table.Cell>{question.time}</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				</div>
			) : (
				<p className="text-lg text-white">Start matching and solve questions!</p>
			)}

			{/* Modal for displaying solution */}
			<Modal className='myModal'
				open={open}
				onOpen={() => setOpen(true)}
				onClose={() => setOpen(false)}>
				<ModalHeader>{questionTitle}</ModalHeader>
				<ModalContent>
					<p>{questionSolution}</p>
				</ModalContent>
				<ModalActions>
					<Button className='myModalButton' onClick={() => setOpen(false)}>
						Close
					</Button>
				</ModalActions>
			</Modal>
		</div>
	);
};

export default SolvedQuestionTable;