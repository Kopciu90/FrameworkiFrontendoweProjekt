import { Link } from "react-router-dom";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const NavbarWrapper = styled.nav`
  font-size: 17px;
  padding: 30px 50px;
  background: #282c34;
  color: white;
`;

const NavContainer = styled.ul`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const NavGroup = styled.ul`
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
`;

const NavItem = styled.li`
  text-align: center;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  font-size: 15px;
  background: #ff5733;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #e64c2c;
  }
`;

const OutlineButton = styled.button`
  padding: 8px 16px;
  font-size: 15px;
  background: transparent;
  color: #ff5733;
  border: 2px solid #ff5733;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #ff5733;
    color: white;
  }
`;

const Navbar = () => {
    const { logout, user, fetchMyProfile } = useAuth();
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const verifyAuth = () => setLoggedIn(!!localStorage.getItem("token"));

        verifyAuth();
        fetchMyProfile();

        window.addEventListener("storage", verifyAuth);
        return () => window.removeEventListener("storage", verifyAuth);
    }, []);

    const handleSignOut = () => {
        logout();
        setLoggedIn(false);
    };

    return (
        <NavbarWrapper>
            <NavContainer>
                <NavGroup>
                    <NavItem>
                        <Link to="/">Home</Link>
                    </NavItem>
                    <NavItem>
                        <Link to="/posts">Posts</Link>
                    </NavItem>
                    <NavItem>
                        <Link to="/photos">Photos</Link>
                    </NavItem>
                    <NavItem>
                        <Link to="/post/add">New Post</Link>
                    </NavItem>
                    <NavItem>
                        <Link to="/photo/upload">Upload</Link>
                    </NavItem>
                </NavGroup>
                <NavGroup>
                    {loggedIn ? (
                        <>
                            <NavItem>
                                <Link to={user?.username || "#"}>Profile</Link>
                            </NavItem>
                            <NavItem>
                                <ActionButton onClick={handleSignOut}>Logout</ActionButton>
                            </NavItem>
                        </>
                    ) : (
                        <>
                            <NavItem>
                                <Link to="/login">
                                    <ActionButton>Login</ActionButton>
                                </Link>
                            </NavItem>
                            <NavItem>
                                <Link to="/register">
                                    <OutlineButton>Register</OutlineButton>
                                </Link>
                            </NavItem>
                        </>
                    )}
                </NavGroup>
            </NavContainer>
        </NavbarWrapper>
    );
};

export default Navbar;
