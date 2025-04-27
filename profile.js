import React from 'react';
import { Navbar, Nav, Button, Container, Form, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 


const Profile = () => {
    const storedData = localStorage.getItem('userdata');
    const parsedData = storedData ? JSON.parse(storedData) : null;

    return (
            <div style={{width:'1500px', height:'700px' }}>

                <Navbar bg="dark" data-bs-theme="dark">
                    <Navbar.Brand href="/usrdashboard/${urole}/${uid}/${uname}">VocaFlow</Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link href="/usrdashboard/${urole}/${uid}/${uname}">Home</Nav.Link>
                            <Nav.Link href="/profile">My Profile</Nav.Link>
                        </Nav>
                            <Nav>
                                <Nav.Link href="#">Notifications</Nav.Link>
                                <Nav.Link href="/">Logout</Nav.Link>
                            </Nav>
                </Navbar>

                <Container>
                <Form>
                <h2 style={{textAlign:'center'}}>Profile</h2>
                    <Row>
                        <Col><Form.Label>ID: </Form.Label></Col>
                        <Col><p>{parsedData.id}</p></Col>                       
                    </Row>
                    <Row>
                        <Col><Form.Label>Name: </Form.Label></Col>
                        <Col><p>{parsedData.name}</p></Col>                       
                    </Row>
                    <Row>
                        <Col><Form.Label>Email: </Form.Label></Col>
                        <Col><p>{parsedData.email}</p></Col>                       
                    </Row>
                    <Row>
                        <Col><Form.Label>Gender: </Form.Label></Col>
                        <Col><p>{parsedData.gender}</p></Col>                       
                    </Row>
                    <Row>
                        <Col><Form.Label>DOB: </Form.Label></Col>
                        <Col><p>{parsedData.dob}</p></Col>                       
                    </Row>
                    <Button variant="dark" size='sm'>Change Password</Button>
                </Form>

                   
                </Container>           
            </div>
    );
};

export default Profile;