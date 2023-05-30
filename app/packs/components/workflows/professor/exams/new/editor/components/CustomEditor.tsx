import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import ReactQuill from '@kylesferrazza/react-quill';
import QuillPasteSmart from 'quill-paste-smart';
import {
  useRemirror,
  ThemeProvider,
  Remirror,
  EditorComponent,
  Toolbar,
  VerticalDivider,
  FloatingToolbar,
  useCommands,
  useActive,
  CommandButtonGroup,
  DropdownButton,
  CommandMenuItem,
  ToggleBoldButton,
  ToggleItalicButton,
  ToggleUnderlineButton,
  ToggleStrikeButton,
  ToggleCodeButton,
  ToggleSubscriptButton,
  ToggleSuperscriptButton,
  ToggleBlockquoteButton,
  ToggleCodeBlockButton,
  ToggleOrderedListButton,
  ToggleBulletListButton,
  ToggleHeadingMenuItem,
  CommandButton,
} from '@remirror/react';
import { FindExtension, FindOptions } from '@remirror/extension-find';
import { AllStyledComponent } from '@remirror/styles/emotion';
import '@remirror/styles/all.css';
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
  LinkExtension,
  LinkOptions,
  NodeFormattingExtension,
  TrailingNodeExtension, TrailingNodeOptions,
  BulletListExtension,
  OrderedListExtension,
  PlaceholderExtension, PlaceholderOptions,
} from 'remirror/extensions';

// import { BubbleMenu } from './RemirrorBubbleMenu';
// import { TopToolbar } from './RemirrorTopToolbar';
import './CustomEditor.scss';
import { ActiveFromExtensions, CoreIcon } from 'remirror';

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
    FindOptions,
    TrailingNodeOptions,
    PlaceholderOptions {}

const DEFAULT_OPTIONS: WysiwygOptions = {
  ...BoldExtension.defaultOptions,
  ...CodeBlockExtension.defaultOptions,
  ...DropCursorExtension.defaultOptions,
  ...FindExtension.defaultOptions,
  ...LinkExtension.defaultOptions,
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
    // className,
    // theme,
    // onChange,
    // disabled,
    // disableTab,
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
      new HeadingExtension({ levels: [1, 2, 3, 4, 5, 6] }),
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
    [placeholder],
  );
  const { manager, state } = useRemirror({
    extensions,
    content: value,
    selection: 'end',
    stringHandler: 'html',
  });
  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state}>
          {/* <TopToolbar items={remirrorToolbarOptions} refocusEditor label="Top Toolbar" /> */}
          <WysiwygToolbar />
          <EditorComponent />
          <FloatingToolbar />
          {/* <BubbleMenu items={remirrorToolbarOptions} /> */}
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
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

const FONT_FAMILIES: Array<[React.CSSProperties['fontFamily'], string]> = [
  ['sans-serif', 'Sans serif'],
  ['serif', 'Serif'],
  ['monospace', 'Monospace'],
];

const FontFamilyButtons: React.FC = () => {
  const { setFontFamily } = useCommands();
  const active = useActive();
  return (
    <CommandButtonGroup>
      <DropdownButton aria-label="Font family" icon="text">
        {FONT_FAMILIES.map(([fontFamily, label]) => (
          <CommandMenuItem
            key={fontFamily}
            commandName="setFontFamily"
            onSelect={() => setFontFamily(fontFamily)}
            enabled={setFontFamily.enabled(fontFamily)}
            active={active.fontFamily({ fontFamily })}
            label={<span style={{ fontFamily }}>{label}</span>}
          />
        ))}
      </DropdownButton>
    </CommandButtonGroup>
  );
};

const JustificationMenu: React.FC = () => {
  const {
    leftAlign,
    rightAlign,
    centerAlign,
    justifyAlign,
  } = useCommands();
  return (
    <DropdownButton aria-label="Justification" icon="alignJustify">
      <CommandMenuItem
        commandName="leftAlign"
        onSelect={leftAlign}
        enabled={leftAlign.enabled()}
        active={leftAlign.active?.()}
      />
      <CommandMenuItem
        commandName="centerAlign"
        onSelect={centerAlign}
        enabled={centerAlign.enabled()}
        active={centerAlign.active?.()}
      />
      <CommandMenuItem
        commandName="rightAlign"
        onSelect={rightAlign}
        enabled={rightAlign.enabled()}
        active={rightAlign.active?.()}
      />
      <CommandMenuItem
        commandName="justifyAlign"
        onSelect={justifyAlign}
        enabled={justifyAlign.enabled()}
        active={justifyAlign.active?.()}
      />
    </DropdownButton>
  );
};
const headingLevel = (active: ActiveFromExtensions<Remirror.Extensions>): CoreIcon => {
  for (let i = 1; i <= 6; i += 1) {
    if (active.heading({ level: i })) { return `h${i}` as CoreIcon; }
  }
  return 'heading';
};

export const WysiwygToolbar: React.FC = () => {
  const active = useActive();
  const { increaseIndent, decreaseIndent } = useCommands();
  return (
    <Toolbar className="remirror-toolbar">
      <FontFamilyButtons />
      <CommandButtonGroup>
        <ToggleBoldButton />
        <ToggleItalicButton />
        <ToggleUnderlineButton />
        <ToggleStrikeButton />
        <ToggleCodeButton />
        <ToggleSubscriptButton />
        <ToggleSuperscriptButton />
      </CommandButtonGroup>
      <VerticalDivider />
      <CommandButtonGroup>
        <JustificationMenu />
        <ToggleBlockquoteButton />
        <ToggleCodeBlockButton />
        <DropdownButton
          aria-label="Heading level options"
          icon={headingLevel(active)}
        >
          <ToggleHeadingMenuItem attrs={{ level: 1 }} />
          <ToggleHeadingMenuItem attrs={{ level: 2 }} />
          <ToggleHeadingMenuItem attrs={{ level: 3 }} />
          <ToggleHeadingMenuItem attrs={{ level: 4 }} />
          <ToggleHeadingMenuItem attrs={{ level: 5 }} />
          <ToggleHeadingMenuItem attrs={{ level: 6 }} />
        </DropdownButton>
        <ToggleOrderedListButton />
        <ToggleBulletListButton />
        <CommandButton
          commandName="increaseIndent"
          onSelect={increaseIndent}
          enabled={increaseIndent.enabled?.()}
        />
        <CommandButton
          commandName="decreaseIndent"
          onSelect={decreaseIndent}
          enabled={decreaseIndent.enabled?.()}
        />
      </CommandButtonGroup>
      {/* <HistoryButtonGroup /> */}
      {/* copy/cut/paste */}
      {/* <DataTransferButtonGroup /> */}
    </Toolbar>
  );
};

/*
const remirrorToolbarOptions : ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'History',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'undo', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'redo', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
    { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
    { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
    { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleUnderline', display: 'icon' },
    { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleStrike', display: 'icon' },
    { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCode', display: 'icon' },
    { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleSubscript', display: 'icon' },
    { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleSuperscript', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Block Formatting',
    items: [
      {
        type: ComponentItem.ToolbarMenu,
        label: 'Alignment',
        items: [
          {
            type: ComponentItem.MenuGroup,
            role: 'radio',
            items: [
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'setLeftAlign',
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'setCenterAlign',
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'setRightAlign',
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'setJustified',
              },
            ],
          },
        ],
      },
{ type: ComponentItem.ToolbarCommandButton, commandName: 'liftListItemOutOfList', display: 'icon' },
{ type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBlockquote', display: 'icon' },
{ type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCodeBlock', display: 'icon' },
{ type: ComponentItem.ToolbarCommandButton, commandName: 'toggleOrderedList', display: 'icon' },
{ type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBulletList', display: 'icon' },
{ type: ComponentItem.ToolbarCommandButton, commandName: 'sharedSinkListItem', display: 'label' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Heading Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 1 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 2 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 3 },
      },
    ],
    separator: 'none',
  },
  {
    type: ComponentItem.ToolbarMenu,
    label: 'Headings',
    items: [
      {
        type: ComponentItem.MenuGroup,
        role: 'radio',
        items: [
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 1 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 2 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 3 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 4 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 5 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 6 },
          },
        ],
      },
    ],
  },
];
*/

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
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onChange={() => {}}
      />
    </div>
  );
});

export default CustomEditor;
