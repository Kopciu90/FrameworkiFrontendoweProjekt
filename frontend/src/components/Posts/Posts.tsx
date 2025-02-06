import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Post {
    _id: string;
    title: string;
    content: string;
    user: {
        _id: string | undefined;
        username: string;
    };
    createdAt: string;
}

interface Comment {
    _id: string;
    content: string;
    user: {
        _id: string;
        username: string;
    };
    createdAt: string;
}

interface User {
    _id: string;
    username: string;
    email: string;
}

interface Data {
    user: User;
    posts: Post[];
}
const PostContainer = styled.article`
  max-width: 35rem;
  margin: 40px auto;
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
  }
`;

const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  border-bottom: 1px solid #eee;
`;

const UserContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;

  a {
    text-decoration: none;
    font-weight: bold;
    color: #333;

    &:hover {
      color: #007bff;
    }
  }
`;

const PostContent = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  gap: 0.5rem;
`;

const CommentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  margin-top: 1rem;

  .comment {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 0;
  }

  .comment-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .comment-user {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .text-muted {
    color: #888;
    font-size: 0.85rem;
  }
`;

const AddCommentForm = styled.form`
   display: flex;
  align-items: center;
  gap: 0.75rem;
    `;

const Input = styled.input`
  flex: 1;
  height: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 1rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ButtonIcon = styled.button`
   background-color: #FFFFFF;
  border: none;
  font-size: 1rem;
  cursor: pointer;

`;

const Posts = () => {
    const [profileUser, setProfileUser] = useState<Data | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const decoded: any = jwtDecode(token);
                    const userId = decoded?.userId;
                    const { data: user } = await api.get(`/user/id/${userId}`);
                    setProfileUser(user);
                }
            } catch (error) {
                console.error("Invalid token", error);
                setIsAuthenticated(false);
            }
        };
        fetchUserData();
    }, []);

    const handleAuthentication = () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                const tokenId = decoded?.userId;
                const userId = profileUser?.user?._id;
                setIsAuthenticated(tokenId === userId);
            } catch (error) {
                console.error("Invalid token", error);
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        if (profileUser) {
            handleAuthentication();
        }
    }, [profileUser]);

    const addComment = async (postId: string, e: React.FormEvent) => {
        e.preventDefault();

        const content = commentInputs[postId]?.trim();
        if (!content) return;

        try {
            await api.post(`/posts/${postId}/comments`, { content });

            const { data: updatedComments } = await api.get(`/posts/${postId}/comments`);
            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: updatedComments,
            }));

            setCommentInputs((prev) => ({
                ...prev,
                [postId]: "",
            }));
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    useEffect(() => {
        const fetchPostsAndComments = async () => {
            try {
                const { data: posts } = await api.get("/posts");
                const sortedPosts = posts.sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setPosts(sortedPosts);

                const commentsPromises = posts.map((post: Post) => api.get(`/posts/${post._id}/comments`));
                const commentsResponses = await Promise.all(commentsPromises);

                const commentsData: Record<string, Comment[]> = {};
                commentsResponses.forEach((response, index) => {
                    commentsData[posts[index]._id] = response.data;
                });

                setCommentsByPost(commentsData);
            } catch (error) {
                console.error("Error fetching posts or comments:", error);
            }
        };

        fetchPostsAndComments();
    }, []);

    const deleteCommentPost = async (postId: string, commentId: string) => {
        try {
            await api.delete(`/posts/${postId}/comments/${commentId}`);

            setCommentsByPost((prev) => {
                const updatedComments = prev[postId]?.filter((comment) => comment._id !== commentId);
                return {
                    ...prev,
                    [postId]: updatedComments || [],
                };
            });
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    const deletePost = async (postId: string) => {
        try {
            await api.delete(`/posts/${postId}`);

            setPosts((prev) => prev.filter((post) => post._id !== postId));
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    return (
        <PostContainer>
            {posts.map((post) => (
                <PostWrapper key={post._id}>
                    <UserContent>
                        <Link to={`/${post.user.username}`}>
                            <img width="40px" height="40px" src={process.env.PUBLIC_URL + "/user.png"} alt="user" />
                        </Link>
                        <Link to={`/${post.user.username}`}>
                            <strong>@{post.user.username}</strong>
                        </Link>
                        {isAuthenticated && post.user._id === profileUser?.user._id && (
                            <ButtonIcon onClick={() => deletePost(post._id)}>
                                <img width="24px" height="24px" src={process.env.PUBLIC_URL + "/delete.png"} alt="user" />
                            </ButtonIcon>
                        )}
                    </UserContent>
                    <PostContent>
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                    </PostContent>
                    <span className="text">
                        {new Intl.DateTimeFormat("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }).format(new Date(post.createdAt))}
                    </span>

                    <CommentsWrapper>
                        <AddCommentForm onSubmit={(e) => addComment(post._id, e)}>
                            <Input
                                type="text"
                                value={commentInputs[post._id] || ""}
                                onChange={(e) =>
                                    setCommentInputs((prev) => ({
                                        ...prev,
                                        [post._id]: e.target.value,
                                    }))
                                }
                                placeholder="Add a comment"
                            />
                            <Button type="submit">
                                <img className="invert" width="16px" height="16px" src={process.env.PUBLIC_URL + "/send-button.png"} alt="send" />
                            </Button>
                        </AddCommentForm>
                        {commentsByPost[post._id]?.map((comment) => (
                            <div className="comment" key={comment._id}>
                                <Link to={`/${post.user.username}`}>
                                    <img width="40px" height="40px" src={process.env.PUBLIC_URL + "/user-comment.png"} alt="user" />
                                </Link>
                                <div className="comment-content">
                                    <div className="comment-user">
                                        <Link to={`/${post.user.username}`}>
                                            <strong>@{comment.user.username} </strong>{" "}
                                        </Link>
                                        <span>· </span>
                                        <span className="text-muted">
                                            {new Intl.DateTimeFormat("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            }).format(new Date(post.createdAt))}
                                        </span>
                                        {isAuthenticated && comment.user._id === profileUser?.user._id && (
                                            <ButtonIcon onClick={() => deleteCommentPost(post._id, comment._id)}>
                                                <img width="24px" height="24px" src={process.env.PUBLIC_URL + "/delete.png"} alt="user" />
                                            </ButtonIcon>
                                        )}
                                    </div>
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </CommentsWrapper>
                </PostWrapper>
            ))}
        </PostContainer>
    );
};

export default Posts;
