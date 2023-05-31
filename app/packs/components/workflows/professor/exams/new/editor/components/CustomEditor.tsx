import React, {
  MouseEventHandler,
  useCallback,
  useState,
} from 'react';
import {
  useRemirror,
  ThemeProvider,
  Remirror,
  EditorComponent,
  Toolbar,
  VerticalDivider,
  useCommands,
  useActive,
  CommandButtonGroup,
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
  IncreaseIndentButton,
  DecreaseIndentButton,
  OnChangeHTML,
  OnChangeHTMLProps,
  IconType,
  useEditorState,
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
  TextColorExtension, TextColorOptions,
  TextHighlightExtension, TextHighlightOptions,
  BlockquoteExtension,
  CodeExtension,
  CodeBlockExtension, CodeBlockOptions,
  LinkExtension,
  LinkOptions,
  NodeFormattingExtension,
  TrailingNodeExtension, TrailingNodeOptions,
  BulletListExtension,
  OrderedListExtension,
  PlaceholderExtension, PlaceholderOptions, SetTextColorOptions,
} from 'remirror/extensions';

import './CustomEditor.scss';
import {
  ActiveFromExtensions, CommandShape, getMarkRanges,
} from 'remirror';
import { MenuProps } from '@material-ui/core';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';
import { BlockPicker, ColorResult } from 'react-color';
import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaCode,
  FaIndent,
  FaItalic,
  FaListOl,
  FaListUl,
  FaOutdent,
  FaStrikethrough,
  FaSubscript,
  FaSuperscript,
  FaUnderline,
} from 'react-icons/fa';
import {
  LuHeading,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuHeading5,
  LuHeading6,
} from 'react-icons/lu';
import { BsBraces } from 'react-icons/bs';
import { TbBlockquote } from 'react-icons/tb';
import { MdOutlineFormatColorFill, MdOutlineFormatColorText } from 'react-icons/md';

import { RemirrorDropdownButton } from './RemirrorDropdownButton';

export interface CustomEditorProps {
  value: string;
  placeholder?: string;
  className?: string;
  id?: string;
  theme?: string;
  onChange?: OnChangeHTMLProps['onChange'];
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
    PlaceholderOptions,
    TextColorOptions,
    TextHighlightOptions {}

const DEFAULT_OPTIONS: WysiwygOptions = {
  ...BoldExtension.defaultOptions,
  ...CodeBlockExtension.defaultOptions,
  ...DropCursorExtension.defaultOptions,
  ...FindExtension.defaultOptions,
  ...LinkExtension.defaultOptions,
  ...TrailingNodeExtension.defaultOptions,
  ...HeadingExtension.defaultOptions,
  ...PlaceholderExtension.defaultOptions,
  ...TextColorExtension.defaultOptions,
  ...TextHighlightExtension.defaultOptions,
};

const textColorExtension = new TextColorExtension({});
const textHighlightExtension = new TextHighlightExtension({});
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
      new HeadingExtension({ levels: [1, 2, 3, 4, 5, 6] }),
      new CodeExtension(),
      new SubExtension(),
      new SupExtension(),
      textColorExtension,
      textHighlightExtension,
      new BlockquoteExtension(),
      new FontFamilyExtension(),
      new FontSizeExtension({}),
      new BulletListExtension({}),
      new OrderedListExtension({}),
      new NodeFormattingExtension({
        indents: disableTab ? [] : NodeFormattingExtension.defaultOptions.indents,
      }),
      new CodeBlockExtension({}),
    ],
    [placeholder, disableTab],
  );
  const { manager, state } = useRemirror({
    extensions,
    content: value,
    selection: 'end',
    stringHandler: 'html',
  });

  const [toolbarVisible, setToolbarVisible] = useState(false);
  const showToolbar = useCallback(() => {
    setToolbarVisible(true);
  }, [setToolbarVisible]);
  const hideToolbar = useCallback(() => {
    setToolbarVisible(false);
  }, [setToolbarVisible]);
  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} editable={!disabled}>
          <WysiwygToolbar
            className={`${className} ${theme} ${toolbarVisible ? 'menu-active' : ''}`}
            onDropdownOpen={showToolbar}
            onDropdownClose={hideToolbar}
          />
          <OnChangeHTML onChange={onChange} />
          <EditorComponent />
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

const FONT_FAMILIES: Array<[React.CSSProperties['fontFamily'], string]> = [
  ['sans-serif', 'Sans serif'],
  ['serif', 'Serif'],
  ['monospace', 'Monospace'],
];

const fontFamilyName = (active: ActiveFromExtensions<Remirror.Extensions>): string => {
  const ans = FONT_FAMILIES.find(([fontFamily, _]) => active.fontFamily({ fontFamily }));
  if (ans) return ans[1];
  return 'Unstyled';
};

const FontFamilyButtons: React.FC<{
  onDropdownOpen?: MouseEventHandler<HTMLElement>,
  onDropdownClose?: MenuProps['onClose']
}> = (props) => {
  const {
    onDropdownClose,
    onDropdownOpen,
  } = props;
  const { setFontFamily } = useCommands();
  const active = useActive();
  return (
    <CommandButtonGroup>
      <RemirrorDropdownButton
        aria-label="Font family"
        icon={(<span style={{ fontSize: '1rem' }}>{fontFamilyName(active)}</span>)}
        onClick={onDropdownOpen}
        onClose={onDropdownClose}
      >
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
      </RemirrorDropdownButton>
    </CommandButtonGroup>
  );
};

const JustificationMenu: React.FC<{
  onDropdownOpen?: MouseEventHandler<HTMLElement>,
  onDropdownClose?: MenuProps['onClose']
}> = (props) => {
  const {
    onDropdownClose,
    onDropdownOpen,
  } = props;
  const {
    leftAlign,
    rightAlign,
    centerAlign,
    justifyAlign,
  } = useCommands();
  return (
    <RemirrorDropdownButton
      aria-label="Justification"
      icon="alignJustify"
      onClick={onDropdownOpen}
      onClose={onDropdownClose}
    >
      <CommandMenuItem
        commandName="leftAlign"
        onSelect={leftAlign}
        enabled={leftAlign.enabled()}
        active={leftAlign.active?.()}
        icon={<Icon I={FaAlignLeft} size="1em" />}
      />
      <CommandMenuItem
        commandName="centerAlign"
        onSelect={centerAlign}
        enabled={centerAlign.enabled()}
        active={centerAlign.active?.()}
        icon={<Icon I={FaAlignCenter} size="1em" />}
      />
      <CommandMenuItem
        commandName="rightAlign"
        onSelect={rightAlign}
        enabled={rightAlign.enabled()}
        active={rightAlign.active?.()}
        icon={<Icon I={FaAlignRight} size="1em" />}
      />
      <CommandMenuItem
        commandName="justifyAlign"
        onSelect={justifyAlign}
        enabled={justifyAlign.enabled()}
        active={justifyAlign.active?.()}
        icon={<Icon I={FaAlignJustify} size="1em" />}
      />
    </RemirrorDropdownButton>
  );
};
const HEADING_ICONS = [
  LuHeading,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuHeading5,
  LuHeading6,
];
const headingLevel = (active: ActiveFromExtensions<Remirror.Extensions>): IconType => {
  for (let i = 1; i <= 6; i += 1) {
    if (active.heading({ level: i })) { return HEADING_ICONS[i]; }
  }
  return HEADING_ICONS[0];
};

const BLACK: ColorResult = {
  hex: '#000',
  rgb: { r: 0, g: 0, b: 0 },
  hsl: { h: 0, s: 0, l: 0 },
};
const FormatColorButton: React.FC<{
  I: IconType,
  setColor: CommandShape<[color: string, options?: SetTextColorOptions]>,
  removeColor: CommandShape<[options?: SetTextColorOptions]>,
  extensionName: string,
  extensionAttr: string,
  onDropdownOpen?: MouseEventHandler<HTMLElement>,
  onDropdownClose?: MenuProps['onClose']
}> = (props) => {
  const {
    I,
    setColor,
    removeColor,
    extensionName,
    extensionAttr,
    onDropdownClose,
    onDropdownOpen,
  } = props;
  const active = useActive();
  const state = useEditorState();

  const toggleColor = useCallback((color: ColorResult) => {
    if (active[extensionName]({ color: color.hex })) {
      removeColor();
    } else {
      setColor(color.hex);
    }
  }, [setColor, removeColor, active]);

  const markColor = getMarkRanges(state.selection, extensionName)[0]?.mark?.attrs;
  const initColor: ColorResult = markColor?.[extensionAttr] || BLACK;
  const [curColor, setCurColor] = useState<ColorResult>(initColor);
  return (
    <RemirrorDropdownButton
      aria-label="text color"
      icon={<Icon I={I} size="0.75em" />}
      iconSx={{ color: `${curColor.hex} !important` }}
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      transformOrigin={{ horizontal: 'center', vertical: 'top' }}
      onClick={onDropdownOpen}
      onClose={onDropdownClose}
      PaperProps={{
        sx: {
          '> .MuiList-padding': {
            paddingBottom: '0 !important',
            paddingTop: 0,
          },
        },
      }}
    >
      <BlockPicker
        className="block-picker"
        onChange={setCurColor}
        onChangeComplete={toggleColor}
        color={curColor.hex}
      />
    </RemirrorDropdownButton>
  );
};

const TextColorButton: React.FC<{
  onDropdownOpen?: MouseEventHandler<HTMLElement>,
  onDropdownClose?: MenuProps['onClose']
}> = (props) => {
  const {
    onDropdownOpen,
    onDropdownClose,
  } = props;
  const { setTextColor, removeTextColor } = useCommands();
  return (
    <FormatColorButton
      I={MdOutlineFormatColorText}
      setColor={setTextColor}
      removeColor={removeTextColor}
      extensionName={textColorExtension.name}
      extensionAttr="color"
      onDropdownOpen={onDropdownOpen}
      onDropdownClose={onDropdownClose}
    />
  );
  // const active = useActive();
  // const state = useEditorState();

  // const curColor = getMarkRanges(state.selection, textColorExtension.name)[0]?.mark?.attrs;
  // const toggleTextColor = useCallback((color: ColorResult) => {
  //   if (active.textColor({ color: color.hex })) {
  //     removeTextColor();
  //   } else {
  //     setTextColor(color.hex);
  //   }
  // }, [setTextColor, removeTextColor, active]);
  // return (
  //   <RemirrorDropdownButton
  //     aria-label="text color"
  //     icon={<Icon I={MdOutlineFormatColorText} size="0.75em" />}
  //     iconSx={{ color: `${curColor?.color || 'black'} !important` }}
  //     anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
  //     transformOrigin={{ horizontal: 'center', vertical: 'top' }}
  //     PaperProps={{
  //       sx: {
  //         MuiList: {
  //           paddingTop: 0,
  //           paddingBottom: 0,
  //         },
  //       },
  //     }}
  //   >
  //     <BlockPicker
  //       className="block-picker"
  //       onChange={toggleTextColor}
  //       color={curColor?.color || 'black'}
  //     />
  //   </RemirrorDropdownButton>
  // );
};
const TextBackgroundColor: React.FC<{
  onDropdownOpen?: MouseEventHandler<HTMLElement>,
  onDropdownClose?: MenuProps['onClose']
}> = (props) => {
  const {
    onDropdownOpen,
    onDropdownClose,
  } = props;
  const { setTextHighlight, removeTextHighlight } = useCommands();
  return (
    <FormatColorButton
      I={MdOutlineFormatColorFill}
      setColor={setTextHighlight}
      removeColor={removeTextHighlight}
      extensionName={textHighlightExtension.name}
      extensionAttr="highlight"
      onDropdownOpen={onDropdownOpen}
      onDropdownClose={onDropdownClose}
    />
  );
};

export const WysiwygToolbar: React.FC<{
  className?: string,
  onDropdownOpen?: MouseEventHandler<HTMLElement>,
  onDropdownClose?: MenuProps['onClose']
}> = (props) => {
  const {
    className,
    onDropdownOpen,
    onDropdownClose,
  } = props;
  const active = useActive();
  return (
    <Toolbar className={`remirror-toolbar ${className}`}>
      <FontFamilyButtons
        onDropdownOpen={onDropdownOpen}
        onDropdownClose={onDropdownClose}
      />
      <CommandButtonGroup>
        <ToggleBoldButton icon={<Icon I={FaBold} size="1em" />} />
        <ToggleItalicButton icon={<Icon I={FaItalic} size="1em" />} />
        <ToggleUnderlineButton icon={<Icon I={FaUnderline} size="1em" />} />
        <ToggleStrikeButton icon={<Icon I={FaStrikethrough} size="1em" />} />
        <ToggleCodeButton icon={<Icon I={FaCode} size="1em" />} />
        <ToggleSubscriptButton icon={<Icon I={FaSubscript} size="1em" />} />
        <ToggleSuperscriptButton icon={<Icon I={FaSuperscript} size="1em" />} />
        <TextColorButton
          onDropdownOpen={onDropdownOpen}
          onDropdownClose={onDropdownClose}
        />
        <TextBackgroundColor
          onDropdownOpen={onDropdownOpen}
          onDropdownClose={onDropdownClose}
        />
      </CommandButtonGroup>
      <VerticalDivider />
      <CommandButtonGroup>
        <JustificationMenu
          onDropdownOpen={onDropdownOpen}
          onDropdownClose={onDropdownClose}
        />
        <ToggleBlockquoteButton icon={<Icon I={TbBlockquote} size="1.5em" />} />
        <ToggleCodeBlockButton icon={<Icon I={BsBraces} size="1.5em" />} />
        <RemirrorDropdownButton
          aria-label="Heading level options"
          icon={<Icon I={headingLevel(active)} size="0.75em" />}
          onClick={onDropdownOpen}
          onClose={onDropdownClose}
        >
          <ToggleHeadingMenuItem attrs={{ level: 1 }} icon={<Icon I={LuHeading1} size="1.5em" />} />
          <ToggleHeadingMenuItem attrs={{ level: 2 }} icon={<Icon I={LuHeading2} size="1.5em" />} />
          <ToggleHeadingMenuItem attrs={{ level: 3 }} icon={<Icon I={LuHeading3} size="1.5em" />} />
          <ToggleHeadingMenuItem attrs={{ level: 4 }} icon={<Icon I={LuHeading4} size="1.5em" />} />
          <ToggleHeadingMenuItem attrs={{ level: 5 }} icon={<Icon I={LuHeading5} size="1.5em" />} />
          <ToggleHeadingMenuItem attrs={{ level: 6 }} icon={<Icon I={LuHeading6} size="1.5em" />} />
        </RemirrorDropdownButton>
        <ToggleOrderedListButton icon={<Icon I={FaListOl} size="1em" />} />
        <ToggleBulletListButton icon={<Icon I={FaListUl} size="1em" />} />
        <IncreaseIndentButton icon={<Icon I={FaIndent} size="1em" />} />
        <DecreaseIndentButton icon={<Icon I={FaOutdent} size="1em" />} />
      </CommandButtonGroup>
      {/* <HistoryButtonGroup /> */}
      {/* copy/cut/paste */}
      {/* <DataTransferButtonGroup /> */}
    </Toolbar>
  );
};

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

  /*
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
  */
  const onChangeCallback = useCallback((newVal: string) => onChange?.(newVal), [onChange]);

  return (
    <RemirrorEditor
      readOnly={disabled}
      id={`${id}-remirror`}
      className={className}
      theme={theme || 'snow'}
      value={value}
      placeholder={placeholder}
      disableTab={disableTab}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onChange={onChangeCallback}
    />
  );
});

export default CustomEditor;
