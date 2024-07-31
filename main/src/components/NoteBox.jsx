import React, { useEffect, useState } from "react";

// Delete Note Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <p className="text-lg mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 mr-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const NoteBox = ({ paperId }) => {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingNote, setHasExistingNote] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    fetchExistingNote();
  }, [paperId]);

  const fetchExistingNote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        new URL(`/api/notes?paperId=${paperId}`, window.location.origin)
      );
      if (response.ok) {
        const data = await response.json();
        setNote(data.noteContent || "");
        setHasExistingNote(!!data.noteContent);
      } else {
        throw new Error("Failed to fetch note");
      }
    } catch (error) {
      console.error("Failed to fetch note:", error);
      setNote("");
      setHasExistingNote(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(new URL(`/api/notes`, baseUrl), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paperId, noteContent: note }),
      });

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      const result = await response.json();
      setNote(result.noteContent);
      setHasExistingNote(true);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to save note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDeleteConfirmation = () => {
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(new URL(`/api/notes`, baseUrl), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paperId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNote("");
      setHasExistingNote(false);
    } catch (error) {
      alert("Failed to delete note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="mb-6">
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              id={`note-${paperId}`}
              rows="4"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write your note here..."
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-green-600 rounded-lg focus:ring-4 focus:ring-green-200 hover:bg-green-700 disabled:opacity-50 mr-2"
          >
            {isSubmitting ? "Saving..." : "Save Note"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-gray-500 rounded-lg focus:ring-4 focus:ring-gray-200 hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div>
          {hasExistingNote ? (
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">Note:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{note}</p>
            </div>
          ) : null}
          <div className="flex">
            <button
              onClick={handleEdit}
              className={`inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white rounded-lg focus:ring-4 ${
                hasExistingNote
                  ? "bg-blue-700 hover:bg-blue-800 focus:ring-blue-200"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-200"
              } mr-2`}
            >
              {hasExistingNote ? "Edit Note" : "Add Note"}
            </button>
            {hasExistingNote && (
              <button
                onClick={handleDeleteConfirmation}
                disabled={isSubmitting}
                className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-red-600 rounded-lg focus:ring-4 focus:ring-red-200 hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Note"}
              </button>
            )}
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this note?"
      />
    </div>
  );
};

export default NoteBox;
