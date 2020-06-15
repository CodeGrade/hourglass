import React from 'react';
import { Card } from 'react-bootstrap';

const Question: React.FC<{
  qnum: number;
  memberName: string;
}> = (props) => {
  const {
    qnum,
  } = props;
  return (
    <Card
      className="mb-3"
    >
      <Card.Title>
        {`Question ${qnum + 1}`}
      </Card.Title>
    </Card>
  );
};

// import {
//   Form,
//   Card,
//   Alert,
//   Row,
//   Col,
//   InputGroup,
//   Collapse,
//   Button,
// } from 'react-bootstrap';
// import { MoveQuestionAction, DeleteQuestionAction } from '@professor/exams/new/types';
// import { moveQuestion, deleteQuestion } from '@professor/exams/new/actions';
// import YesNo from '@student/exams/show/components/questions/YesNo';
// import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
// import ShowParts from '@professor/exams/new/editor/containers/ShowParts';
// import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
// import { FilePickerQuestion } from '@professor/exams/new/editor/containers/FilePicker';
// import {
//   PartInfo, HTMLVal, FileRef, ExamFile,
// } from '@student/exams/show/types';
// import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
// import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
// import { createMap, getFilesForRefs } from '@student/exams/show/files';
// import { QuestionFilesContext } from '@hourglass/workflows/student/exams/show/context';
//
// export interface QuestionProps {
//   qnum: number;
//   numQuestions: number;
//   name: HTMLVal;
//   description: HTMLVal;
//   separateSubparts: boolean;
//   parts: PartInfo[];
//   reference: FileRef[];
//   files: ExamFile[];
//   onChange: (name: HTMLVal, description: HTMLVal, separateSubparts: boolean) => void;
// }
//
//
// const Question: React.FC<QuestionProps> = (props) => {
//   const {
//     qnum,
//     numQuestions,
//     name,
//     description,
//     separateSubparts,
//     onChange,
//     files = [],
//     reference = [],
//   } = props;
//   const [moversVisible, setMoversVisible] = useState(false);
//   const [open, setOpen] = useState(false);
//   const noFiles = reference.length === 0;
//   const fmap = createMap(files);
//   const filteredFiles = getFilesForRefs(fmap, reference);
//
//   return (
//     <QuestionFilesContext.Provider
//       value={{
//         references: reference,
//       }}
//     >
//       <Card
//         className="mb-3"
//         border="primary"
//         onMouseOver={(): void => setMoversVisible(true)}
//         onFocus={(): void => setMoversVisible(true)}
//         onBlur={(): void => setMoversVisible(false)}
//         onMouseOut={(): void => setMoversVisible(false)}
//       >
//         <MoveItem
//           visible={moversVisible}
//           variant="primary"
//           enableUp={qnum > 0}
//           enableDown={qnum + 1 < numQuestions}
//           onUp={(): MoveQuestionAction => moveQuestion(qnum, qnum - 1)}
//           onDown={(): MoveQuestionAction => moveQuestion(qnum, qnum + 1)}
//           onDelete={(): DeleteQuestionAction => deleteQuestion(qnum)}
//         />
//         <Alert variant="primary">
//           <Card.Title>
//             {`Question ${qnum + 1}`}
//           </Card.Title>
//           <Card.Subtitle>
//             <Form.Group as={Row} controlId={`${qnum}-name`}>
//               <Form.Label column sm="2">Question name</Form.Label>
//               <Col sm="10">
//                 <CustomEditor
//                   className="bg-white"
//                   value={name.value}
//                   placeholder="Give a short (optional) descriptive name for the question"
//                   onChange={(newName, _delta, source, _editor): void => {
//                     if (source === 'user') {
//                       onChange(
//                         {
//                           type: 'HTML',
//                           value: newName,
//                         },
//                         description,
//                         separateSubparts,
//                       );
//                     }
//                   }}
//                 />
//               </Col>
//             </Form.Group>
//             <Form.Group as={Row} controlId={`${qnum}-desc`}>
//               <Form.Label column sm="2">Description:</Form.Label>
//               <Col sm="10">
//                 <CustomEditor
//                   className="bg-white"
//                   value={description.value}
//                   placeholder="Give a longer description of the question"
//                   onChange={(newDesc, _delta, source, _editor): void => {
//                     if (source === 'user') {
//                       onChange(
//                         name,
//                         {
//                           type: 'HTML',
//                           value: newDesc,
//                         },
//                         separateSubparts,
//                       );
//                     }
//                   }}
//                 />
//               </Col>
//             </Form.Group>
//             <Form.Group as={Row} controlId={`${qnum}-separate`}>
//               <Form.Label column sm="2">Separate subparts?</Form.Label>
//               <Col sm="10">
//                 <YesNo
//                   className="bg-white rounded"
//                   value={!!separateSubparts}
//                   info={{
//                     type: 'YesNo',
//                     prompt: {
//                       type: 'HTML',
//                       value: '',
//                     },
//                   }}
//                   onChange={(newVal): void => {
//                     onChange(name, description, newVal);
//                   }}
//                 />
//               </Col>
//             </Form.Group>
//             <Form.Group as={Row} controlId={`${qnum}-files`}>
//               <Form.Label column sm="2">Files to be shown for this question:</Form.Label>
//               <Col sm={10}>
//                 <InputGroup>
//                   <div className="flex-grow-1">
//                     <FilePickerQuestion qnum={qnum} />
//                   </div>
//                   <InputGroup.Append>
//                     <Button
//                       variant="info"
//                       disabled={noFiles}
//                       onClick={(): void => setOpen((o) => !o)}
//                     >
//                       Preview files
//                       {open && !noFiles ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
//                     </Button>
//                   </InputGroup.Append>
//                 </InputGroup>
//                 <Collapse in={open && !noFiles}>
//                   <div className="border">
//                     <VeryControlledFileViewer files={filteredFiles} />
//                   </div>
//                 </Collapse>
//               </Col>
//             </Form.Group>
//           </Card.Subtitle>
//         </Alert>
//         <Card.Body>
//           <ShowParts qnum={qnum} />
//         </Card.Body>
//       </Card>
//     </QuestionFilesContext.Provider>
//   );
// };

export default Question;
