import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { v3 as uuid } from 'uuid';
import ReactQuill from 'react-quill';
import QuillPasteSmart from 'quill-paste-smart';
import { 
  useRemirror,
  useCommands,
  ThemeProvider,
  Remirror,
  EditorComponent,
  Toolbar,
  ToolbarItemUnion,
  ComponentItem,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';
import '@remirror/styles/all.css';
import { BubbleMenu } from './RemirrorBubbleMenu';
import { TopToolbar } from './RemirrorTopToolbar';
import { 
  FontFamilyExtension,
  FontSizeExtension,
  BoldExtension, BoldOptions,
  DropCursorExtension, DropCursorOptions,
  ItalicExtension,
  HeadingExtension, HeadingOptions,
  UnderlineExtension,
  StrikeExtension,
  SubExtension,
  SupExtension,
  TextColorExtension,
  BlockquoteExtension,
  CodeExtension,
  CodeBlockExtension, CodeBlockOptions,
  LinkExtension, LinkOptions,
  NodeFormattingExtension,
  TrailingNodeExtension, TrailingNodeOptions,
  SearchExtension, SearchOptions,
  BulletListExtension,
  OrderedListExtension,
  PlaceholderExtension, PlaceholderOptions,
} from 'remirror/extensions';
import './CustomEditor.scss';

ReactQuill.Quill.register('modules/clipboard', QuillPasteSmart, true);

export interface CustomEditorProps {
  value: string;
  placeholder?: string;
  className?: string;
  id?: string;
  theme?: string;
  onChange?: ReactQuill.ReactQuillProps['onChange'];
  disabled?: boolean;
  disableTab?: boolean;
}

export interface WysiwygOptions
  extends BoldOptions,
    CodeBlockOptions,
    DropCursorOptions,
    HeadingOptions,
    LinkOptions,
    SearchOptions,
    TrailingNodeOptions,
    PlaceholderOptions {}

const DEFAULT_OPTIONS: WysiwygOptions = {
  ...BoldExtension.defaultOptions,
  ...CodeBlockExtension.defaultOptions,
  ...DropCursorExtension.defaultOptions,
  ...SearchExtension.defaultOptions,
  ...TrailingNodeExtension.defaultOptions,
  ...HeadingExtension.defaultOptions,
  ...PlaceholderExtension.defaultOptions,
};

const RemirrorEditor: React.FC<React.PropsWithChildren<CustomEditorProps & { 
    options?: WysiwygOptions,
    readOnly?: boolean,
  }>> = (props) => {
  const {
    value,
    placeholder,
    className,
    theme,
    onChange,
    disabled,
    disableTab,
    options = DEFAULT_OPTIONS,
    children,
  } = props;
  const { weight } = options;
  const extensions = useCallback(
    () => [
      new BoldExtension({ weight }),
      new ItalicExtension(),
      new UnderlineExtension(),
      new StrikeExtension(),
      new PlaceholderExtension({ placeholder }),
      new HeadingExtension({ levels: [1,2,3,4,5,6] }),
      new CodeExtension(),
      new SubExtension(),
      new SupExtension(),
      new TextColorExtension({}),
      new BlockquoteExtension(),
      new FontFamilyExtension(),
      new FontSizeExtension({}),
      new BulletListExtension({}),
      new OrderedListExtension({}),
      new NodeFormattingExtension({}),
      new CodeBlockExtension({}),
    ],
    [placeholder]);
  const { manager, state } = useRemirror({
    extensions: extensions,
    extraAttributes: [
      {identifiers: ['code', 'codeblock'], attributes: { id: { default: () => uuid() } }}
    ],
    content: value,
    selection: 'end',
    stringHandler: 'html',
  });
  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state}>
          <TopToolbar items={remirrorToolbarOptions} refocusEditor label="Top Toolbar" />
          <EditorComponent />
          <BubbleMenu items={remirrorToolbarOptions} />
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  )
};

const toolbarOptions = [
  [
    { font: [] },
    'bold', 'italic', 'underline', 'strike', 'code',
    { script: 'sub' }, { script: 'super' },
    { color: [] }, { background: [] },
  ],

  [
    { align: [] },
    'blockquote', 'code-block',
    { list: 'ordered' }, { list: 'bullet' },
    { indent: '-1' }, { indent: '+1' },
  ],

  ['image'],

  //  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  //  [{ header: [4, 5, 6, false] }],

  ['clean'], // remove formatting button
];

const remirrorToolbarOptions : ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: "History",
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: "undo", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "redo", display: "icon" },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Simple Formatting",
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleBold", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleItalic", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleUnderline", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleStrike", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleCode", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleSubscript", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleSuperscript", display: "icon" },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Block Formatting",
    items: [
      {
        type: ComponentItem.ToolbarMenu,
        label: "Alignment",
        items: [
          {
            type: ComponentItem.MenuGroup,
            role: "radio",
            items: [
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "setLeftAlign",
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "setCenterAlign",
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "setRightAlign",
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "setJustified",
              },
            ],
          },
        ],
      },
      //{ type: ComponentItem.ToolbarCommandButton, commandName: "liftListItemOutOfList", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleBlockquote", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleCodeBlock", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleOrderedList", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "toggleBulletList", display: "icon" },
      { type: ComponentItem.ToolbarCommandButton, commandName: "sharedSinkListItem", display: "label" },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Heading Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleHeading",
        display: "icon",
        attrs: { level: 1 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleHeading",
        display: "icon",
        attrs: { level: 2 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleHeading",
        display: "icon",
        attrs: { level: 3 },
      },
    ],
    separator: "none",
  },
  {
    type: ComponentItem.ToolbarMenu,
    label: "Headings",
    items: [
      {
        type: ComponentItem.MenuGroup,
        role: "radio",
        items: [
          {
            type: ComponentItem.MenuCommandPane,
            commandName: "toggleHeading",
            attrs: { level: 1 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: "toggleHeading",
            attrs: { level: 2 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: "toggleHeading",
            attrs: { level: 3 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: "toggleHeading",
            attrs: { level: 4 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: "toggleHeading",
            attrs: { level: 5 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: "toggleHeading",
            attrs: { level: 6 },
          },
        ],
      },
    ],
  },
]

const modules = {
  toolbar: toolbarOptions,
};
const modulesNoTab = {
  toolbar: toolbarOptions,
  keyboard: {
    bindings: {
      tab: null,
    },
  },
};

const formatOptions = [
  'background', 'color', 'bold', 'italic', 'underline', 'font', 'code', 'size', 'strike', 'script',
  // NO 'link'
  'blockquote', 'header', 'indent', 'list', 'align', 'code-block', 'direction',
  'formula', 'image',
  // NO 'video'
];

const CustomEditor: React.FC<CustomEditorProps> = ((props) => {
  const {
    value,
    placeholder,
    className,
    id,
    theme,
    onChange,
    disabled = false,
    // The snow theme has an actual toolbar, and is a multiline editor,
    // so Tab for formatting makes sense.  For one-line editors,
    // Tab is more useful for navigation.
    disableTab = (theme !== 'snow'),
  } = props;

  const filteredOnChange = useCallback((val: string, delta, source, editor) => {
    if (onChange) {
      const quillBreak = /<p><br><\/p>/g;
      let filteredVal = val.replace(quillBreak, '');
      const onlyOnePar = (filteredVal.startsWith('<p>') && filteredVal.indexOf('<p>', 3) === -1)
        && (filteredVal.endsWith('</p>') && filteredVal.indexOf('</p>', 3) === filteredVal.length - 4);
      if (onlyOnePar) {
        filteredVal = filteredVal.substring(3, filteredVal.length - 4);
      }
      onChange(filteredVal, delta, source, editor);
    }
  }, [onChange]);

  const ref = useRef<ReactQuill>();
  useEffect(() => {
    if (!ref.current) { return; }
    const rootDataset = ref.current.getEditor().root.dataset;
    if (placeholder) {
      rootDataset.placeholder = placeholder;
    } else {
      delete rootDataset.dataset;
    }
  }, [ref.current, placeholder]);

  // When the component first mounts, setting the initial value
  // adds one item to the undo stack, but the initial value
  // should not be undoable.
  useEffect(() => {
    if (ref.current) {
      ref.current.getEditor().getModule('history').clear();
    }
  }, []);

  return (
    <div className="d-inline-block">
      <p>Quill:</p>
      <ReactQuill
        ref={ref}
        readOnly={disabled}
        id={id}
        className={className}
        theme={theme || 'snow'}
        value={value}
        formats={formatOptions}
        modules={disableTab ? modulesNoTab : modules}
        onChange={filteredOnChange}
      />
      <p>Remirror:</p>
      <RemirrorEditor
        readOnly={disabled}
        id={`${id}-remirror`}
        className={className}
        value={value}
        placeholder={placeholder}
        onChange={() => {}}
        />
    </div>
  );
});

export default CustomEditor;
