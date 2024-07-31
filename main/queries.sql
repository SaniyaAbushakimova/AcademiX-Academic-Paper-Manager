-- Query 1: Find all saved papers where a specific user was the top commenter on the paper. Includes if they tied for most comments with another user.
SELECT DISTINCT a.paperId, u.username, ar.title, comment_count
FROM Actions a JOIN Comments c ON a.userId = c.userId AND a.paperId = c.paperId JOIN Arxiv ar on a.paperId = ar.paperId JOIN UserInfo u on a.userId = u.userId, (SELECT(COUNT(c.userId)) as comment_count
				FROM Comments c NATURAL JOIN UserInfo u
				WHERE u.username = '[username]'
                        GROUP BY c.paperId) as comment_count_tbl
WHERE a.paperId in (SELECT c2.paperId
			FROM Comments c2
			WHERE (SELECT(COUNT(c3.userId))
				FROM Comments c3
				WHERE c2.paperID = c3.paperId
				AND c3.userId = c2.userId)
            >=
			ALL(SELECT(COUNT(c3.userId))
				FROM Comments c3
				WHERE c2.paperID = c3.paperId)
			AND c2.userId = c.userId
		)
AND u.username = '[username]'
Order By paperId;

-- Query 2: Get all comments and notes of a user with a keyword.
SELECT userId, content, contentType
FROM (SELECT userId, commentContent AS content, 'comment' AS contentType
      FROM Comments
	WHERE commentContent LIKE '%[keyword]%'

      UNION ALL

      Select userId, noteContent AS content, 'note' AS contentType
      FROM Notes 
	WHERE noteContent LIKE '%[keyword]%'
      ) AS subq
WHERE userId = [userid]
ORDER BY contentType DESC;

-- Query 3: Top Engaged Papers; Papers that were saved were also left comments OR notes on 90% of the time.
SELECT activity.paperId, ax.title, ratio
FROM (SELECT a.paperId, COUNT(DISTINCT CASE WHEN c.userId IS NOT NULL OR n.userId IS NOT NULL
                    		                THEN a.userId END) 
											/ COUNT(DISTINCT a.userId) AS ratio
      FROM Actions a
      LEFT JOIN Comments c ON a.paperId = c.paperId AND a.userId = c.userId
      LEFT JOIN Notes n ON a.paperId = n.paperId AND a.userId = n.userId
      WHERE a.actionType = 'save'
      GROUP BY a.paperId
      ) AS activity JOIN Arxiv ax ON activity.paperId = ax.paperId
WHERE ratio >= 0.9
ORDER BY ratio DESC, paperId DESC;

-- Query 4: Top 15 papers that have been saved plus viewed the most times. Also finds cases where no saves are present but have views. For tie-breakers, the lower paperId value comes first.
SELECT ax.paperId, (COALESCE(subq.saveCount, 0) + ax.views) AS total
FROM Arxiv ax LEFT JOIN (SELECT paperId, COUNT(*) AS saveCount
                         FROM Actions
                         WHERE actionType = 'save'
                         GROUP BY paperId
                         ) AS subq ON ax.paperId = subq.paperId
ORDER BY total DESC, ax.paperId;