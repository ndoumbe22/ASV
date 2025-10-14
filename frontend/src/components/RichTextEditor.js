import React, { useState } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaLink,
  FaImage,
} from "react-icons/fa";

function RichTextEditor({ value, onChange, placeholder }) {
  const [content, setContent] = useState(value || "");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const handleChange = (newContent) => {
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    // Update the content after formatting
    const editor = document.getElementById("editor");
    if (editor) {
      handleChange(editor.innerHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      formatText("createLink", linkUrl);
      setLinkUrl("");
      setShowLinkModal(false);
    }
  };

  const handleContentChange = (e) => {
    handleChange(e.target.innerHTML);
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm me-1"
          onClick={() => formatText("bold")}
          title="Gras"
        >
          <FaBold />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm me-1"
          onClick={() => formatText("italic")}
          title="Italique"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm me-1"
          onClick={() => formatText("underline")}
          title="Souligné"
        >
          <FaUnderline />
        </button>
        <div className="vr mx-2"></div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm me-1"
          onClick={() => formatText("insertUnorderedList")}
          title="Liste à puces"
        >
          <FaListUl />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm me-1"
          onClick={() => formatText("insertOrderedList")}
          title="Liste numérotée"
        >
          <FaListOl />
        </button>
        <div className="vr mx-2"></div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm me-1"
          onClick={() => setShowLinkModal(true)}
          title="Insérer un lien"
        >
          <FaLink />
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => formatText("insertImage", prompt("URL de l'image:"))}
          title="Insérer une image"
        >
          <FaImage />
        </button>
      </div>

      <div
        id="editor"
        className="editor-content form-control"
        contentEditable
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          minHeight: "200px",
          border: "1px solid #ced4da",
          borderRadius: "0.375rem",
          padding: "0.375rem 0.75rem",
          marginTop: "0.5rem",
        }}
      ></div>

      {placeholder && !content && (
        <div
          className="editor-placeholder"
          style={{
            position: "relative",
            marginTop: "-200px",
            pointerEvents: "none",
            color: "#6c757d",
            padding: "0.375rem 0.75rem",
          }}
        >
          {placeholder}
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Insérer un lien</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLinkModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowLinkModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={insertLink}
                >
                  Insérer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
