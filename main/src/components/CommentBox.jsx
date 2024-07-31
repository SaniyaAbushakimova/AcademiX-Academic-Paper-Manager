import React, { useEffect, useState } from 'react';

const CommentForm = (props) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(new URL(`/api/comments/${props.paperId}`, baseUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentContent: comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      // Comment submitted successfully
      setComment('');
      console.log('Comment submitted successfully!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      console.log('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
      window.location.reload()
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <textarea
          id="comment"
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write your comment here..."
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={isSubmitting | !props.user}
        className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800 disabled:opacity-50"
      >
        {isSubmitting ? 'Posting...' : 'Post comment'}
      </button>
    </form>
  );
};

export default CommentForm;



