import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Photo {
    _id: string;
    description: string;
    filename: string;
    user: {
        _id: string;
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
    photo: Photo[];
}

const PhotoContainer = styled.article`
  max-width: 35rem;
  margin: 40px auto;
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
  }
`;

const PhotoWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
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

const PhotoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
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

const Photos = () => {
    const [profileUser, setProfileUser] = useState<Data | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [commentsByPhoto, setCommentsByPhoto] = useState<Record<string, Comment[]>>({});
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
                const decoded: any = jwtDecode(token); // Decode the token
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

    const addComment = async (photoId: string, e: React.FormEvent) => {
        e.preventDefault();

        const content = commentInputs[photoId]?.trim();
        if (!content) return;

        try {
            await api.post(`/photos/${photoId}/comments`, { content });

            const { data: updatedComments } = await api.get(`/photos/${photoId}/comments`);
            setCommentsByPhoto((prev) => ({
                ...prev,
                [photoId]: updatedComments,
            }));

            setCommentInputs((prev) => ({
                ...prev,
                [photoId]: "",
            }));
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    useEffect(() => {
        const fetchPhotosAndComments = async () => {
            try {
                const { data: photos } = await api.get("/photos");
                const sortedPhotos = photos.sort((a: Photo, b: Photo) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setPhotos(sortedPhotos);

                const commentsPromises = photos.map((photo: Photo) => api.get(`/photos/${photo._id}/comments`));
                const commentsResponses = await Promise.all(commentsPromises);

                const commentsData: Record<string, Comment[]> = {};
                commentsResponses.forEach((response, index) => {
                    commentsData[photos[index]._id] = response.data;
                });

                setCommentsByPhoto(commentsData);
            } catch (error) {
                console.error("Error fetching photos or comments:", error);
            }
        };
        fetchPhotosAndComments();
    }, []);

    const deleteCommentPhoto = async (photoId: string, commentId: string) => {
        try {
            // Make the API request to delete the comment
            await api.delete(`/photos/${photoId}/comments/${commentId}`);

            // After successful deletion, filter out the deleted comment from the state
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

    const deletePhoto = async (photoId: string) => {
        try {
            await api.delete(`/photos/${photoId}`);

            setPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
        } catch (error) {
            console.error("Failed to delete photo:", error);
        }
    };

    return (
        <PhotoContainer>
            {photos.map((photo) => (
                <PhotoWrapper key={photo._id}>
                    <UserContent>
                        <Link to={`/${photo.user.username}`}>
                            <img width="40px" height="40px" src={process.env.PUBLIC_URL + "/user.png"} alt="user" />
                        </Link>
                        <Link to={`/${photo.user.username}`}>
                            <strong>@{photo.user.username}</strong>
                        </Link>
                        {isAuthenticated && photo.user._id === profileUser?.user._id && (
                            <ButtonIcon onClick={() => deletePhoto(photo._id)}>
                                <img width="24px" height="24px" src={process.env.PUBLIC_URL + "/delete.png"} alt="user" />
                            </ButtonIcon>
                        )}
                    </UserContent>
                    <PhotoContent>
                        <h3>{photo.description}</h3>
                        <img src={`http://localhost:5000/uploads/${photo.filename}`} alt={photo.description} />
                    </PhotoContent>
                    <span className="text">
                        {new Intl.DateTimeFormat("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }).format(new Date(photo.createdAt))}
                    </span>

                    <CommentsWrapper>
                        <AddCommentForm onSubmit={(e) => addComment(photo._id, e)}>
                            <Input
                                type="text"
                                value={commentInputs[photo._id] || ""}
                                onChange={(e) =>
                                    setCommentInputs((prev) => ({
                                        ...prev,
                                        [photo._id]: e.target.value,
                                    }))
                                }
                                placeholder="Add a comment"
                            />
                            <Button type="submit">
                                <img className="invert" width="16px" height="16px" src={process.env.PUBLIC_URL + "/send-button.png"} alt="send" />
                            </Button>
                        </AddCommentForm>
                        {commentsByPhoto[photo._id]?.map((comment) => (
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
                                            }).format(new Date(photo.createdAt))}
                                        </span>
                                        {isAuthenticated && comment.user._id === profileUser?.user._id && (
                                            <ButtonIcon onClick={() => deleteCommentPhoto(photo._id, comment._id)}>
                                                <img width="24px" height="24px" src={process.env.PUBLIC_URL + "/delete.png"} alt="user" />
                                            </ButtonIcon>
                                        )}
                                    </div>
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </CommentsWrapper>
                </PhotoWrapper>
            ))}
        </PhotoContainer>
    );
};

export default Photos;
