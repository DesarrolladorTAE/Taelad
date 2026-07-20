import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Box,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import {
  Node,
} from "@tiptap/core";

import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";

export type BlogRichTextImageInput = {
  /*
   * URL pública generada automáticamente por
   * Multimedia. En el editor se representa como
   * hipervínculo y en la página pública como imagen.
   */
  url: string;

  altText?: string | null;
  title?: string | null;
  caption?: string | null;
};

export type BlogRichTextImageInserter = (
  image: BlogRichTextImageInput
) => boolean;

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  minHeight?: number;

  /*
   * El componente padre recibe una función para
   * insertar la imagen exactamente en la posición
   * donde estaba el cursor.
   *
   * El padre puede subir una imagen a Multimedia
   * y después entregar su URL pública.
   */
  onSelectImage?: (
    insertImage: BlogRichTextImageInserter
  ) => void;
};

type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3";

type ColorPickerButtonProps = {
  title: string;
  value: string;
  disabled: boolean;
  mode: "text" | "highlight";
  onChange: (color: string) => void;
};

const FONT_FAMILIES = [
  {
    value: "",
    label: "Fuente predeterminada",
  },
  {
    value: "Arial",
    label: "Arial",
  },
  {
    value: "Helvetica",
    label: "Helvetica",
  },
  {
    value: "Georgia",
    label: "Georgia",
  },
  {
    value: '"Times New Roman"',
    label: "Times New Roman",
  },
  {
    value: "Verdana",
    label: "Verdana",
  },
  {
    value: "Tahoma",
    label: "Tahoma",
  },
  {
    value: '"Courier New"',
    label: "Courier New",
  },
];

const FONT_SIZES = [
  {
    value: "",
    label: "Tamaño normal",
  },
  {
    value: "12px",
    label: "12",
  },
  {
    value: "14px",
    label: "14",
  },
  {
    value: "16px",
    label: "16",
  },
  {
    value: "18px",
    label: "18",
  },
  {
    value: "20px",
    label: "20",
  },
  {
    value: "24px",
    label: "24",
  },
  {
    value: "28px",
    label: "28",
  },
  {
    value: "32px",
    label: "32",
  },
  {
    value: "40px",
    label: "40",
  },
  {
    value: "48px",
    label: "48",
  },
];

function normalizeEmptyContent(
  html: string
): string {
  const normalized = html.trim();

  const emptyValues = [
    "",
    "<p></p>",
    "<p><br></p>",
  ];

  return emptyValues.includes(normalized)
    ? ""
    : html;
}

function getValidColor(
  value: unknown,
  fallback: string
): string {
  if (
    typeof value === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(value)
  ) {
    return value;
  }

  return fallback;
}

function isValidHttpUrl(
  value: string
): boolean {
  try {
    const parsedUrl = new URL(value);

    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    );
  } catch {
    return false;
  }
}

const BlogImageReference = Node.create({
  name: "blogImageReference",

  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },

      alt: {
        default: null,
      },

      title: {
        default: null,
      },

      caption: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      /*
       * Nuevo formato: en el editor se muestra
       * únicamente la URL pública como vínculo.
       */
      {
        tag: "figure[data-blog-image-reference]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          const link =
            element.querySelector<HTMLAnchorElement>(
              "a[href]"
            );

          const caption =
            element.querySelector(
              "figcaption"
            );

          const src =
            element.getAttribute(
              "data-image-src"
            ) ||
            link?.getAttribute("href") ||
            "";

          if (!isValidHttpUrl(src)) {
            return false;
          }

          return {
            src,

            alt:
              element.getAttribute(
                "data-image-alt"
              ) || null,

            title:
              element.getAttribute(
                "data-image-title"
              ) || null,

            caption:
              caption?.textContent?.trim() ||
              null,
          };
        },
      },

      /*
       * Compatibilidad con imágenes insertadas
       * previamente por versiones anteriores.
       */
      {
        tag: "figure[data-blog-image]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          const image =
            element.querySelector<HTMLImageElement>(
              "img[src]"
            );

          if (!image) {
            return false;
          }

          const caption =
            element.querySelector(
              "figcaption"
            );

          const src =
            image.getAttribute("src") ||
            "";

          if (!isValidHttpUrl(src)) {
            return false;
          }

          return {
            src,

            alt:
              image.getAttribute("alt"),

            title:
              image.getAttribute("title"),

            caption:
              caption?.textContent?.trim() ||
              null,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const {
      src,
      alt,
      title,
      caption,
    } = node.attrs;

    const attributes: Record<
      string,
      string
    > = {
      "data-blog-image-reference": "true",
      "data-image-src": src,
      class: "blog-image-reference",
    };

    if (alt) {
      attributes["data-image-alt"] =
        alt;
    }

    if (title) {
      attributes["data-image-title"] =
        title;
    }

    const link = [
      "a",
      {
        href: src,
        target: "_blank",
        rel: "noopener noreferrer",
        "data-image-reference-link":
          "true",
      },
      src,
    ];

    if (caption) {
      return [
        "figure",
        attributes,
        link,
        [
          "figcaption",
          {},
          caption,
        ],
      ];
    }

    return [
      "figure",
      attributes,
      link,
    ];
  },
});

function ColorPickerButton({
  title,
  value,
  disabled,
  mode,
  onChange,
}: ColorPickerButtonProps) {
  return (
    <Tooltip title={title}>
      <Box
        component="label"
        sx={{
          /*
           * Este contenedor limita el input de color
           * únicamente al botón de 36 x 36.
           */
          position: "relative",
          overflow: "hidden",

          width: 36,
          height: 36,
          flex: "0 0 36px",

          cursor: disabled
            ? "default"
            : "pointer",

          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          bgcolor:
            mode === "highlight"
              ? value
              : "background.paper",

          color:
            mode === "highlight"
              ? "#000000"
              : value,
        }}
      >
        <Typography
          component="span"
          fontWeight={900}
          lineHeight={1}
          sx={{
            color:
              mode === "highlight"
                ? "#000000"
                : value,

            textDecoration:
              mode === "text"
                ? "underline"
                : "none",

            textDecorationColor:
              mode === "text"
                ? value
                : "transparent",
          }}
        >
          A
        </Typography>

        <Box
          component="input"
          type="color"
          aria-label={title}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value)
          }
          sx={{
            /*
             * En MUI, width: 1 equivale a 100%.
             * Por eso se usa 100% explícitamente y
             * el padre tiene position: relative.
             */
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            padding: 0,
            margin: 0,
            border: 0,
            opacity: 0,
            cursor: disabled
              ? "default"
              : "pointer",
          }}
        />
      </Box>
    </Tooltip>
  );
}

export default function BlogRichTextEditor({
  value,
  onChange,
  disabled = false,
  minHeight = 320,
  onSelectImage,
}: Props) {
  const [revision, setRevision] =
    useState(0);

  /*
   * Conserva la posición del cursor aunque se abra
   * un diálogo de carga o de selección multimedia.
   */
  const imageInsertionPositionRef =
    useRef<number | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),

      /*
       * Incluye TextStyle, Color, FontFamily,
       * FontSize, BackgroundColor y LineHeight.
       */
      TextStyleKit,

      TextAlign.configure({
        types: [
          "heading",
          "paragraph",
        ],
        alignments: [
          "left",
          "center",
          "right",
          "justify",
        ],
      }),

      Highlight.configure({
        multicolor: true,
      }),

      Image.configure({
        inline: false,
        allowBase64: false,
      }),

      BlogImageReference,
    ],

    content: value || "<p></p>",
    editable: !disabled,

    editorProps: {
      attributes: {
        class: "blog-rich-text-content",
        spellcheck: "true",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label":
          "Contenido de la publicación",
      },
    },

    onUpdate: ({
      editor: currentEditor,
    }) => {
      const html = normalizeEmptyContent(
        currentEditor.getHTML()
      );

      onChange(html);

      setRevision(
        (current) => current + 1
      );
    },

    onSelectionUpdate: () => {
      setRevision(
        (current) => current + 1
      );
    },

    onTransaction: () => {
      setRevision(
        (current) => current + 1
      );
    },
  });

  /*
   * Carga el contenido cuando se abre otra
   * publicación o cuando cambia el valor externo.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent =
      value || "<p></p>";

    const currentContent =
      editor.getHTML();

    if (currentContent !== nextContent) {
      editor.commands.setContent(
        nextContent,
        {
          emitUpdate: false,
        }
      );
    }
  }, [editor, value]);

  /*
   * Desactiva la edición mientras se guarda.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  const currentBlock =
    useMemo<BlockType>(() => {
      void revision;

      if (!editor) {
        return "paragraph";
      }

      if (
        editor.isActive(
          "heading",
          { level: 1 }
        )
      ) {
        return "heading1";
      }

      if (
        editor.isActive(
          "heading",
          { level: 2 }
        )
      ) {
        return "heading2";
      }

      if (
        editor.isActive(
          "heading",
          { level: 3 }
        )
      ) {
        return "heading3";
      }

      return "paragraph";
    }, [editor, revision]);

  const currentFontFamily =
    useMemo(() => {
      void revision;

      if (!editor) {
        return "";
      }

      const fontFamily =
        editor.getAttributes(
          "textStyle"
        ).fontFamily;

      return typeof fontFamily === "string"
        ? fontFamily
        : "";
    }, [editor, revision]);

  const currentFontSize =
    useMemo(() => {
      void revision;

      if (!editor) {
        return "";
      }

      const fontSize =
        editor.getAttributes(
          "textStyle"
        ).fontSize;

      return typeof fontSize === "string"
        ? fontSize
        : "";
    }, [editor, revision]);

  const textColor = useMemo(() => {
    void revision;

    if (!editor) {
      return "#000000";
    }

    return getValidColor(
      editor.getAttributes(
        "textStyle"
      ).color,
      "#000000"
    );
  }, [editor, revision]);

  const highlightColor =
    useMemo(() => {
      void revision;

      if (!editor) {
        return "#fff59d";
      }

      return getValidColor(
        editor.getAttributes(
          "highlight"
        ).color,
        "#fff59d"
      );
    }, [editor, revision]);

  const isEditorEmpty = useMemo(() => {
    void revision;

    return editor?.isEmpty ?? true;
  }, [editor, revision]);

  if (!editor) {
    return (
      <Box
        sx={{
          minHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography color="text.secondary">
          Cargando editor...
        </Typography>
      </Box>
    );
  }

  function applyBlockType(
    type: BlockType
  ) {
    const chain =
      editor.chain().focus();

    switch (type) {
      case "heading1":
        chain
          .setHeading({
            level: 1,
          })
          .run();
        break;

      case "heading2":
        chain
          .setHeading({
            level: 2,
          })
          .run();
        break;

      case "heading3":
        chain
          .setHeading({
            level: 3,
          })
          .run();
        break;

      default:
        chain
          .setParagraph()
          .run();
        break;
    }
  }

  function applyFontFamily(
    fontFamily: string
  ) {
    if (!fontFamily) {
      editor
        .chain()
        .focus()
        .unsetFontFamily()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .setFontFamily(fontFamily)
      .run();
  }

  function applyFontSize(
    fontSize: string
  ) {
    if (!fontSize) {
      editor
        .chain()
        .focus()
        .unsetFontSize()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .setFontSize(fontSize)
      .run();
  }

  function configureLink() {
    const previousUrl =
      editor.getAttributes(
        "link"
      ).href ?? "";

    const url = window.prompt(
      "Ingresa la dirección del enlace:",
      previousUrl
    );

    if (url === null) {
      return;
    }

    const cleanUrl = url.trim();

    if (!cleanUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: cleanUrl,
        target: "_blank",
        rel: "noopener noreferrer",
      })
      .run();
  }

  function rememberImageInsertionPosition() {
    imageInsertionPositionRef.current =
      editor.state.selection.anchor;
  }

  const insertImageAtSavedPosition:
    BlogRichTextImageInserter = (
      image
    ) => {
      const cleanUrl = image.url.trim();

      if (!isValidHttpUrl(cleanUrl)) {
        return false;
      }

      const maximumPosition =
        editor.state.doc.content.size;

      const requestedPosition =
        imageInsertionPositionRef.current ??
        editor.state.selection.anchor;

      const insertionPosition = Math.min(
        Math.max(requestedPosition, 0),
        maximumPosition
      );

      const altText =
        image.altText?.trim() || null;

      const title =
        image.title?.trim() || null;

      const caption =
        image.caption?.trim() || null;

      const inserted = editor
        .chain()
        .focus()
        .setTextSelection(insertionPosition)
        .insertContent({
          type: "blogImageReference",

          attrs: {
            src: cleanUrl,
            alt: altText,
            title,
            caption,
          },
        })
        .run();

      imageInsertionPositionRef.current =
        null;

      return inserted;
    };

  function requestImageUpload() {
    if (
      disabled ||
      !onSelectImage
    ) {
      return;
    }

    rememberImageInsertionPosition();

    onSelectImage(
      insertImageAtSavedPosition
    );
  }

  return (
    <>
      <Box
      sx={{
        width: "100%",
        minWidth: 0,

        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",

        bgcolor: disabled
          ? "action.disabledBackground"
          : "background.paper",
      }}
    >
      {/* BARRA DE HERRAMIENTAS */}
      <Box
        sx={{
          p: 1,
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
          >
            {/* TIPO DE TEXTO */}
            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 150,
                },
              }}
            >
              <Select
                value={currentBlock}
                disabled={disabled}
                onChange={(event) =>
                  applyBlockType(
                    event.target
                      .value as BlockType
                  )
                }
              >
                <MenuItem value="paragraph">
                  Texto normal
                </MenuItem>

                <MenuItem value="heading1">
                  Título principal
                </MenuItem>

                <MenuItem value="heading2">
                  Subtítulo
                </MenuItem>

                <MenuItem value="heading3">
                  Título pequeño
                </MenuItem>
              </Select>
            </FormControl>

            {/* FUENTE */}
            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 170,
                },
              }}
            >
              <Select
                value={currentFontFamily}
                displayEmpty
                disabled={disabled}
                onChange={(event) =>
                  applyFontFamily(
                    String(
                      event.target.value
                    )
                  )
                }
                renderValue={(selected) => {
                  const font =
                    FONT_FAMILIES.find(
                      (item) =>
                        item.value ===
                        selected
                    );

                  return (
                    font?.label ??
                    "Fuente"
                  );
                }}
              >
                {FONT_FAMILIES.map(
                  (font) => (
                    <MenuItem
                      key={
                        font.value ||
                        "default"
                      }
                      value={font.value}
                      sx={{
                        fontFamily:
                          font.value ||
                          "inherit",
                      }}
                    >
                      {font.label}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            {/* TAMAÑO */}
            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 125,
                },
              }}
            >
              <Select
                value={currentFontSize}
                displayEmpty
                disabled={disabled}
                onChange={(event) =>
                  applyFontSize(
                    String(
                      event.target.value
                    )
                  )
                }
                renderValue={(selected) => {
                  const size =
                    FONT_SIZES.find(
                      (item) =>
                        item.value ===
                        selected
                    );

                  return (
                    size?.label ??
                    "Tamaño"
                  );
                }}
              >
                {FONT_SIZES.map(
                  (size) => (
                    <MenuItem
                      key={
                        size.value ||
                        "default"
                      }
                      value={size.value}
                    >
                      {size.label}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <Divider
              orientation="vertical"
              flexItem
            />

            <ColorPickerButton
              title="Color del texto"
              value={textColor}
              disabled={disabled}
              mode="text"
              onChange={(color) =>
                editor
                  .chain()
                  .focus()
                  .setColor(color)
                  .run()
              }
            />

            <ColorPickerButton
              title="Color de resaltado"
              value={highlightColor}
              disabled={disabled}
              mode="highlight"
              onChange={(color) =>
                editor
                  .chain()
                  .focus()
                  .setHighlight({
                    color,
                  })
                  .run()
              }
            />
          </Stack>

          <Stack
            direction="row"
            spacing={0.25}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
          >
            <Tooltip title="Negrita">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive("bold")
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleBold()
                    .run()
                }
              >
                <FormatBoldIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Cursiva">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive("italic")
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleItalic()
                    .run()
                }
              >
                <FormatItalicIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Subrayado">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive("underline")
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleUnderline()
                    .run()
                }
              >
                <FormatUnderlinedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Tachado">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive("strike")
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleStrike()
                    .run()
                }
              >
                <StrikethroughSIcon />
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 0.5 }}
            />

            <Tooltip title="Alinear a la izquierda">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive({
                    textAlign: "left",
                  })
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setTextAlign("left")
                    .run()
                }
              >
                <FormatAlignLeftIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Centrar">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive({
                    textAlign: "center",
                  })
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setTextAlign("center")
                    .run()
                }
              >
                <FormatAlignCenterIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Alinear a la derecha">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive({
                    textAlign: "right",
                  })
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setTextAlign("right")
                    .run()
                }
              >
                <FormatAlignRightIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Justificar">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive({
                    textAlign: "justify",
                  })
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setTextAlign("justify")
                    .run()
                }
              >
                <FormatAlignJustifyIcon />
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 0.5 }}
            />

            <Tooltip title="Lista con viñetas">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive("bulletList")
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleBulletList()
                    .run()
                }
              >
                <FormatListBulletedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Lista numerada">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive("orderedList")
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleOrderedList()
                    .run()
                }
              >
                <FormatListNumberedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Cita">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive("blockquote")
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleBlockquote()
                    .run()
                }
              >
                <FormatQuoteIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Separador">
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setHorizontalRule()
                    .run()
                }
              >
                <HorizontalRuleIcon />
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 0.5 }}
            />

            <Tooltip title="Agregar o editar enlace">
              <IconButton
                size="small"
                disabled={disabled}
                color={
                  editor.isActive("link")
                    ? "primary"
                    : "default"
                }
                onClick={configureLink}
              >
                <LinkIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Quitar enlace">
              <span>
                <IconButton
                  size="small"
                  disabled={
                    disabled ||
                    !editor.isActive("link")
                  }
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run()
                  }
                >
                  <LinkOffIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Seleccionar imagen de Multimedia">
              <span>
                <IconButton
                  size="small"
                  disabled={
                    disabled ||
                    !onSelectImage
                  }
                  onClick={requestImageUpload}
                >
                  <ImageOutlinedIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 0.5 }}
            />

            <Tooltip title="Limpiar formato">
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .unsetAllMarks()
                    .clearNodes()
                    .run()
                }
              >
                <FormatClearIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Deshacer">
              <span>
                <IconButton
                  size="small"
                  disabled={
                    disabled ||
                    !editor.can().undo()
                  }
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .undo()
                      .run()
                  }
                >
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Rehacer">
              <span>
                <IconButton
                  size="small"
                  disabled={
                    disabled ||
                    !editor.can().redo()
                  }
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .redo()
                      .run()
                  }
                >
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* ÁREA DE EDICIÓN */}
      <Box
        onClick={() => {
          if (!disabled) {
            editor
              .chain()
              .focus()
              .run();
          }
        }}
        sx={{
          position: "relative",
          width: "100%",
          minWidth: 0,
          minHeight: `${minHeight}px`,
          maxHeight: 500,
          overflowY: "auto",

          bgcolor: "background.paper",
          cursor: disabled
            ? "default"
            : "text",

          borderTop: "1px solid",
          borderColor: "divider",

          "& > div": {
            width: "100%",
          },

          "& .ProseMirror": {
            display: "block",
            width: "100%",
            minHeight: `${minHeight}px`,
            boxSizing: "border-box",

            px: 2,
            py: 2,

            outline: "none",
            border: 0,

            lineHeight: 1.7,
            color: "text.primary",
            bgcolor: "background.paper",

            cursor: disabled
              ? "default"
              : "text",

            overflowWrap: "anywhere",

            "& p": {
              minHeight: "1.5em",
              my: 1,
            },

            "& h1": {
              fontSize: "2rem",
              lineHeight: 1.25,
              mt: 2,
              mb: 1,
            },

            "& h2": {
              fontSize: "1.6rem",
              lineHeight: 1.3,
              mt: 2,
              mb: 1,
            },

            "& h3": {
              fontSize: "1.3rem",
              lineHeight: 1.35,
              mt: 1.5,
              mb: 1,
            },

            "& ul, & ol": {
              pl: 4,
            },

            "& blockquote": {
              m: 0,
              my: 2,
              pl: 2,
              borderLeft: "4px solid",
              borderColor: "primary.main",
              color: "text.secondary",
            },

            "& hr": {
              my: 2.5,
              border: 0,
              borderTop: "1px solid",
              borderColor: "divider",
            },

            "& a": {
              color: "primary.main",
              textDecoration: "underline",
              cursor: "pointer",
            },

            "& figure.blog-image-reference": {
              width: "100%",
              my: 2,
              mx: 0,
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderLeft: "4px solid",
              borderLeftColor: "primary.main",
              borderRadius: 2,
              bgcolor: "action.hover",
            },

            "& figure.blog-image-reference > a": {
              display: "block",
              color: "primary.main",
              fontWeight: 700,
              lineHeight: 1.55,
              overflowWrap: "anywhere",
              textDecoration: "underline",
            },

            "& figure.blog-image-reference figcaption": {
              mt: 1,
              color: "text.secondary",
              fontSize: "0.9rem",
              lineHeight: 1.55,
            },

            "& > img": {
              display: "block",
              width: "100%",
              maxWidth: "100%",
              height: "auto",
              my: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              objectFit: "contain",
            },

            "& pre": {
              maxWidth: "100%",
              overflowX: "auto",
              p: 2,
              borderRadius: 1,
              bgcolor: "action.hover",
            },

            "& code": {
              fontFamily:
                '"Courier New", monospace',
            },
          },
        }}
      >
        {isEditorEmpty && !disabled && (
          <Typography
            color="text.disabled"
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            Escribe aquí el contenido de la publicación...
          </Typography>
        )}

        <EditorContent editor={editor} />
      </Box>

      <Box
        sx={{
          px: 2,
          py: 0.75,

          borderTop: "1px solid",
          borderColor: "divider",

          bgcolor: "action.hover",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Coloca el cursor donde debe aparecer la imagen.
          En el editor se mostrará su hipervínculo y el pie
          de imagen; la imagen centrada se renderizará
          únicamente en la página pública. No existe límite
          de tres imágenes dentro del contenido.
        </Typography>
      </Box>
    </Box>

    </>
  );
}