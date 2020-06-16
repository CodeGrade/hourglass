import React, { useState } from 'react';
import {
  Form,
  Card,
  Alert,
  Row,
  Col,
  InputGroup,
  Collapse,
  Button,
} from 'react-bootstrap';
import { alphabetIdx } from '@hourglass/common/helpers';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import { HTMLVal, FileRef, ExamFile } from '@student/exams/show/types';
import { Field, WrappedFieldProps, FormSection } from 'redux-form';
// // import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
// import ShowBodyItems from '@professor/exams/new/editor/containers/ShowBodyItems';
// import { FilePickerPart } from '@professor/exams/new/editor/containers/FilePicker';
// import { MovePartAction, DeletePartAction } from '@professor/exams/new/types';
// import { movePart, deletePart } from '@professor/exams/new/actions';
// import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
// import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
// import { createMap, getFilesForRefs } from '@student/exams/show/files';
// import { PartFilesContext } from '@hourglass/workflows/student/exams/show/context';

const PartName: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <>
      <Form.Label column sm="2">Part name</Form.Label>
      <Col sm="10">
        <CustomEditor
          className="bg-white"
          value={value.value}
          placeholder="Give a short (optional) descriptive name for the part"
          onChange={(newName, _delta, source, _editor): void => {
            if (source === 'user') {
              onChange({
                type: 'HTML',
                value: newName,
              });
            }
          }}
        />
      </Col>
    </>
  );
};

const Part: React.FC<{
  memberName: string;
  qnum: number;
  pnum: number;
}> = (props) => {
  const {
    memberName,
    qnum,
    pnum,
  } = props;
  return (
    <Card
      className="mb-3"
      border="success"
    >
      <Alert variant="success">
        <FormSection name={memberName}>
          <Card.Title>
            {`Part ${alphabetIdx(pnum)}`}
          </Card.Title>
          <Card.Subtitle>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-name`}>
              <Field name="name" component={PartName} />
            </Form.Group>
          </Card.Subtitle>
        </FormSection>
      </Alert>
    </Card>
  );
}

// 
// 
// export interface PartProps {
//   qnum: number;
//   pnum: number;
//   numParts: number;
//   name: HTMLVal;
//   description: HTMLVal;
//   points: number;
//   reference: FileRef[];
//   files: ExamFile[];
//   onChange: (name: HTMLVal, description: HTMLVal, points: number) => void;
// }
// 
// const Part: React.FC<PartProps> = (props) => {
//   const {
//     qnum,
//     pnum,
//     numParts,
//     name,
//     description,
//     points,
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
//     <PartFilesContext.Provider
//       value={{
//         references: reference,
//       }}
//     >
//       <Card
//         onMouseOver={(): void => setMoversVisible(true)}
//         onFocus={(): void => setMoversVisible(true)}
//         onBlur={(): void => setMoversVisible(false)}
//         onMouseOut={(): void => setMoversVisible(false)}
//       >
//         {/* <MoveItem */}
//         {/*   visible={moversVisible} */}
//         {/*   variant="success" */}
//         {/*   enableUp={pnum > 0} */}
//         {/*   enableDown={pnum + 1 < numParts} */}
//         {/*   onUp={(): MovePartAction => movePart(qnum, pnum, pnum - 1)} */}
//         {/*   onDown={(): MovePartAction => movePart(qnum, pnum, pnum + 1)} */}
//         {/*   onDelete={(): DeletePartAction => deletePart(qnum, pnum)} */}
//         {/* /> */}
//         <Alert variant="success">
//           <Card.Title>
//           </Card.Title>
//           <Card.Subtitle>
//             <Form.Group as={Row} controlId={`${qnum}-${pnum}-desc`}>
//               <Form.Label column sm="2">Description:</Form.Label>
//               <Col sm="10">
//                 <CustomEditor
//                   className="bg-white"
//                   value={description.value}
//                   placeholder="Give a longer description of the part"
//                   onChange={(newDesc, _delta, source, _editor): void => {
//                     if (source === 'user') {
//                       onChange(
//                         name,
//                         {
//                           type: 'HTML',
//                           value: newDesc,
//                         },
//                         points,
//                       );
//                     }
//                   }}
//                 />
//               </Col>
//             </Form.Group>
//             <Form.Group as={Row} controlId={`${qnum}-${pnum}-points`}>
//               <Form.Label column sm="2">Points</Form.Label>
//               <Col sm="10">
//                 <Form.Control
//                   type="number"
//                   value={points}
//                   placeholder="Points for this part"
//                   min={0}
//                   max={100}
//                   step={0.5}
//                   onChange={(e): void => {
//                     if (e.target.value === '') {
//                       onChange(name, description, 0);
//                     } else {
//                       const newVal = Number.parseFloat(e.target.value);
//                       const actual = (Number.isFinite(newVal) ? newVal : points);
//                       onChange(name, description, actual);
//                     }
//                   }}
//                 />
//                 {/* <NumberPicker
//                     placeholder="Points for this part"
//                     value={points}
//                     onChange={(newVal): void => onChange(name, description, newVal)}
//                     min={0}
//                     max={100}
//                     step={0.5}
//                     format="#.#"
//                     /> */}
//               </Col>
//             </Form.Group>
//             <Form.Group as={Row} controlId={`${qnum}-${pnum}-files`}>
//               <Form.Label column sm="2">Files to be shown for this question part:</Form.Label>
//               <Col sm={10}>
//                 <InputGroup>
//                   <div className="flex-grow-1">
//                     <FilePickerPart qnum={qnum} pnum={pnum} />
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
//           <ShowBodyItems qnum={qnum} pnum={pnum} />
//         </Card.Body>
//       </Card>
//     </PartFilesContext.Provider>
//   );
// };

export default Part;
