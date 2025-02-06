import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
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

interface Photo {
    _id: string;
    description: string;
    filename: string;
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
        _id: string | undefined;
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
    photos: Photo[];
}

const ContentContainer = styled.article`
  max-width: 35rem;
  margin: 40px auto;
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
  }

  .text:last-of-type {
    font-weight: bold;
    padding-top: 0.75rem;
    display: inline-block;
    font-size: 0.85rem;
  }

  .center-button {
    margin-bottom: 20px;
    text-align: center;
  }
`;

const ContentWrapper = styled.div`
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

const Content = styled.div`
display: flex;
  flex-direction: column;
  padding-top: 1rem;
  gap: 0.5rem;

  img {
    max-width: 100%;
    border-radius: 12px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;

    &:hover {
      transform: scale(1.03);
    }
  }
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

const ProfileDetails = () => {
    const { username } = useParams<{ username: string }>();
    const [profileUser, setProfileUser] = useState<Data | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
    const [commentInputsPost, setCommentInputsPost] = useState<Record<string, string>>({});
    const [commentsByPhoto, setCommentsByPhoto] = useState<Record<string, Comment[]>>({});
    const [commentInputsPhoto, setCommentInputsPhoto] = useState<Record<string, string>>({});
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: user } = await api.get(`/user/${username}`);
                setProfileUser(user);
            } catch (error) {}
        };

        fetchUserData();
    }, [username]);

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

    useEffect(() => {
        const fetchPostsPhotosAndComments = async () => {
            if (!profileUser) return;

            try {
                const userPosts = profileUser?.posts || [];
                const userPhotos = profileUser?.photos || [];
                setPosts(userPosts);
                setPhotos(userPhotos);

                const commentsPromisesPosts = posts.map((post: Post) => api.get(`/posts/${post._id}/comments`));
                const commentsResponsesPosts = await Promise.all(commentsPromisesPosts);

                const commentsPromisesPhotos = photos.map((photo: Photo) => api.get(`/photos/${photo._id}/comments`));
                const commentsResponsesPhotos = await Promise.all(commentsPromisesPhotos);

                const commentsDataPosts: Record<string, Comment[]> = {};
                commentsResponsesPosts.forEach((response, index) => {
                    commentsDataPosts[posts[index]._id] = response.data;
                });

                const commentsDataPhotos: Record<string, Comment[]> = {};
                commentsResponsesPhotos.forEach((response, index) => {
                    commentsDataPhotos[photos[index]._id] = response.data;
                });

                setCommentsByPost(commentsDataPosts);
                setCommentsByPhoto(commentsDataPhotos);
            } catch (error) {
                console.error("Error fetching posts or comments:", error);
            }
        };

        fetchPostsPhotosAndComments();
    }, [profileUser]);

    const addCommentPost = async (postId: string, e: React.FormEvent) => {
        e.preventDefault();

        const content = commentInputsPost[postId]?.trim();
        if (!content) return;

        try {
            await api.post(`/posts/${postId}/comments`, { content });

            const { data: updatedComments } = await api.get(`/posts/${postId}/comments`);
            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: updatedComments,
            }));

            setCommentInputsPost((prev) => ({
                ...prev,
                [postId]: "",
            }));
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    const addCommentPhoto = async (photoId: string, e: React.FormEvent) => {
        e.preventDefault();

        const content = commentInputsPhoto[photoId]?.trim();
        if (!content) return;

        try {
            await api.post(`/photos/${photoId}/comments`, { content });

            const { data: updatedComments } = await api.get(`/photos/${photoId}/comments`);
            setCommentsByPhoto((prev) => ({
                ...prev,
                [photoId]: updatedComments,
            }));

            setCommentInputsPhoto((prev) => ({
                ...prev,
                [photoId]: "",
            }));
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

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

    const deleteCommentPhoto = async (photoId: string, commentId: string) => {
        try {
            await api.delete(`/photos/${photoId}/comments/${commentId}`);

            setCommentsByPhoto((prev) => {
                const updatedComments = prev[photoId]?.filter((comment) => comment._id !== commentId);
                return {
                    ...prev,
                    [photoId]: updatedComments || [],
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

    const deletePhoto = async (photoId: string) => {
        try {
            await api.delete(`/photos/${photoId}`);

            setPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
        } catch (error) {
            console.error("Failed to delete photo:", error);
        }
    };

    const mergedData = [...posts, ...photos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <ContentContainer>
            <div className="center-button">
                {isAuthenticated && profileUser?.user._id && (
                    <Link to={"edit"}>
                        <Button>Edit Profile</Button>
                    </Link>
                )}
            </div>
            {mergedData.map((item) =>
                "title" in item ? (
                    <ContentWrapper key={item._id}>
                        <UserContent>
                            <img width="40px" height="40px" src={process.env.PUBLIC_URL + "/user.png"} alt="user" />
                            <strong>@{profileUser?.user.username}</strong>
                            {isAuthenticated && item.user.toString() === profileUser?.user._id && (
                                <ButtonIcon onClick={() => deletePost(item._id)}>
                                    <img width="24px" height="24px" src={process.env.PUBLIC_URL + "/delete.png"} alt="user" />
                                </ButtonIcon>
                            )}
                        </UserContent>
                        <Content>
                            <h3>{item.title}</h3>
                            <p>{item.content}</p>
                        </Content>
                        <span className="text">
                            {new Intl.DateTimeFormat("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }).format(new Date(item.createdAt))}
                        </span>
                        <CommentsWrapper>
                            <AddCommentForm onSubmit={(e) => addCommentPost(item._id, e)}>
                                <Input
                                    type="text"
                                    value={commentInputsPost[item._id] || ""}
                                    onChange={(e) =>
                                        setCommentInputsPost((prev) => ({
                                            ...prev,
                                            [item._id]: e.target.value,
                                        }))
                                    }
                                    placeholder="Add a comment"
                                />
                                <Button type="submit">
                                    <img className="invert" width="16px" height="16px" src={process.env.PUBLIC_URL + "/send-button.png"} alt="send" />
                                </Button>
                            </AddCommentForm>
                            {commentsByPost[item._id]?.map((comment) => (
                                <div className="comment" key={comment._id}>
                                    <Link to={`/${item.user.username}`}>
                                        <img width="40px" height="40px" src={process.env.PUBLIC_URL + "/user-comment.png"} alt="user" />
                                    </Link>
                                    <div className="comment-content">
                                        <div className="comment-user">
                                            <Link to={`/${item.user.username}`}>
                                                <strong>@{comment.user.username} </strong>{" "}
                                            </Link>
                                            <span>· </span>
                                            <span className="text-muted">
                                                {new Intl.DateTimeFormat("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                }).format(new Date(item.createdAt))}
                                            </span>
                                            {isAuthenticated && comment.user._id === profileUser?.user._id && (
                                                <ButtonIcon onClick={() => deleteCommentPost(item._id, comment._id)}>
                                                    <img width="24px" height="24px" src={process.env.PUBLIC_URL + "/delete.png"} alt="user" />
                                                </ButtonIcon>
                                            )}
                                        </div>
                                        <p>{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </CommentsWrapper>
                    </ContentWrapper>
                ) : (
                    <ContentWrapper key={item._id}>
                        <UserContent>
                            <img width="40px" height="40px" src={process.env.PUBLIC_URL + "/user.png"} alt="user" />
                            <strong>@{profileUser?.user.username}</strong>
                            {isAuthenticated && item.user.toString() === profileUser?.user._id && (
                                <ButtonIcon onClick={() => deletePhoto(item._id)}>
                                    <img width="24px" height="24px" src={process.env.PUBLIC_URL + "/delete.png"} alt="user" />
                                </ButtonIcon>
                            )}
                        </UserContent>
                        <Content>
                            <h3>{item.description}</h3>
                            <img src={`http://localhost:5000/uploads/${item.filename}`} alt={item.description} />
                        </Content>
                        <span className="text">
                            {new Intl.DateTimeFormat("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }).format(new Date(item.createdAt))}
                        </span>

                        <CommentsWrapper>
                            <AddCommentForm onSubmit={(e) => addCommentPhoto(item._id, e)}>
                                <Input
                                    type="text"
                                    value={commentInputsPhoto[item._id] || ""}
                                    onChange={(e) =>
                                        setCommentInputsPhoto((prev) => ({
                                            ...prev,
                                            [item._id]: e.target.value,
                                        }))
                                    }
                                    placeholder="Add a comment"
                                />
                                <Button type="submit">
                                    <img className="invert" width="16px" height="16px" src={process.env.PUBLIC_URL + "/send-button.png"} alt="send" />
                                </Button>
                            </AddCommentForm>
                            {commentsByPhoto[item._id]?.map((comment) => (
                                <div className="comment" key={comment._id}>
                                    <img width="40px" height="40px" src={process.env.PUBLIC_URL + "/user-comment.png"} alt="user" />
                                    <div className="comment-content">
                                        <div className="comment-user">
                                            <strong>@{comment.user.username} </strong>
                                            <span>· </span>
                                            <span className="text-muted">
                                                {new Intl.DateTimeFormat("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                }).format(new Date(item.createdAt))}
                                            </span>
                                            {isAuthenticated && comment.user._id === profileUser?.user._id && (
                                                <ButtonIcon onClick={() => deleteCommentPhoto(item._id, comment._id)}>
                                                    <img width="24px" height="24px" src={process.env.PUBLIC_URL + "/delete.png"} alt="user" />
                                                </ButtonIcon>
                                            )}
                                        </div>
                                        <p>{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </CommentsWrapper>
                    </ContentWrapper>
                )
            )}
        </ContentContainer>
    );
};

export default ProfileDetails;
