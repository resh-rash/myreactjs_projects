import React from "react";
import { Navbar, Nav} from 'react-bootstrap';


const Menu = () =>{
    return(
        <Navbar bg="dark" data-bs-theme="dark">
                <Navbar.Brand href="/usrdashboard">VocaFlow</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="/profile">My Profile</Nav.Link>
                </Nav>
                <Nav>
                    <Nav.Link href="#">Notifications</Nav.Link>
                    <Nav.Link href="/">Logout</Nav.Link>
                </Nav>
        </Navbar>
    );
};

export default Menu;