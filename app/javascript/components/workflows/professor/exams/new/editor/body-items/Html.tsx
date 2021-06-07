import React, { useCallback, useContext } from 'react';
import {
  graphql,
  useMutation,
} from 'relay-hooks';
import { MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import { HTMLVal } from '@hourglass/workflows/student/exams/show/types';
import { EditHTMLVal } from '@professor/exams/new/editor/components/helpers';

import { HtmlCreateMutation } from './__generated__/HtmlCreateMutation.graphql';
import { HtmlChangeMutation } from './__generated__/HtmlChangeMutation.graphql';

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

function useChangeHtmlMutation(): MutationReturn<HtmlChangeMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<HtmlChangeMutation>(
    graphql`
    mutation HtmlChangeMutation($input: ChangeHtmlDetailsInput!) {
      changeHtmlDetails(input: $input) {
        bodyItem {
          id
          info
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing Html body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

const Html: React.FC<{
  info: HTMLVal;
  id: string;
  disabled?: boolean;
}> = (props) => {
  const {
    id,
    info,
    disabled: parentDisabled = false,
  } = props;
  const [mutate, { loading }] = useChangeHtmlMutation();
  const updatePrompt = useCallback((newVal: HTMLVal) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          value: newVal,
        },
      },
    });
  }, [id]);
  const disabled = parentDisabled || loading;
  return (
    <EditHTMLVal
      className="text-instructions bg-white"
      disabled={disabled}
      theme="snow"
      value={info}
      onChange={updatePrompt}
      debounceDelay={1000}
      placeholder="Provide instructions here..."
    />
  );
};

export default Html;
