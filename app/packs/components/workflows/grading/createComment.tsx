import { graphql } from 'relay-hooks';
import { RangeAddConfig } from 'relay-runtime/lib/mutations/RelayDeclarativeMutationConfig';

export const CREATE_COMMENT_MUTATION = graphql`
  mutation createCommentMutation($input: CreateGradingCommentInput!) {
    createGradingComment(input: $input) {
      gradingComment {
        id
        qnum
        pnum
        bnum
        points
        message
        presetComment {
          id
        }
      }
      gradingCommentEdge {
        node {
          id
        }
      }
    }
  }
`;

export const addCommentConfig = (registrationId: string): RangeAddConfig => ({
  type: 'RANGE_ADD',
  parentID: registrationId,
  connectionInfo: [{
    key: 'Registration_gradingComments',
    rangeBehavior: 'append',
  }],
  edgeName: 'gradingCommentEdge',
});
