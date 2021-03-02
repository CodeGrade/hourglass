import { graphql } from 'relay-hooks';

const CREATE_RUBRIC_MUTATION = graphql`
mutation manageRubricsCreateRubricMutation($input: CreateRubricInput!) {
  createRubric(input: $input) {
    rubric {
      id
    }
  }  
}
`;

export default CREATE_RUBRIC_MUTATION;
