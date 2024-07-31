import React from 'react';

const Comment = ({ user, username, commentId, commentText, date, onDelete }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/comments/delete/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onDelete(commentId);
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg px-4 py-2 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{username}</h3>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-gray-600">{date}</p>
          {user === username && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 focus:outline-none"
              aria-label="Delete comment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-700">{commentText}</p>
    </div>
  );
};

export default Comment;
