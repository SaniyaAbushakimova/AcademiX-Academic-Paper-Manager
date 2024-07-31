import React, { useState } from "react";
import CommentForm from "./CommentBox";
import Comment from "./Comment";

const UserComments = ({ user, paperId, comments }) => {
  const [commentList, setCommentList] = useState(comments);

  const onDelete = (commentId) => {
    const newCommentList = commentList.filter(
      (comment) => comment.commentId != commentId
    );
    setCommentList(newCommentList);
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">User Comments</h2>
      <CommentForm user={user} paperId={paperId} />
      <div className="flex flex-col space-y-4">
        {commentList.map((comment, index) => (
          <Comment
            key={index}
            user={user}
            username={comment.username}
            commentId={comment.commentId}
            commentText={comment.commentContent}
            date={comment.commentTimestamp}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default UserComments;
