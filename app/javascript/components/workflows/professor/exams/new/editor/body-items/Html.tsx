import { useContext } from 'react';
import {
  graphql,
  useMutation,
} from 'relay-hooks';
import { MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';

import { HtmlCreateMutation } from './__generated__/HtmlCreateMutation.graphql';

// eslint-disable-next-line import/prefer-default-export
export function useCreateHtmlMutation(): MutationReturn<HtmlCreateMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<HtmlCreateMutation>(
    graphql`
    mutation HtmlCreateMutation($input: CreateHtmlInput!) {
      createHtml(input: $input) {
        part {
          id
          bodyItems {
            id
            ...BodyItemEditor
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating new HTML body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}
