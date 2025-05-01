import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Table, ToastHeader, ToastBody, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Don't forget to import Bootstrap CSS


const Attendance = () => {
    const udata = useParams(); 
    const [attendanceData, setattendanceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filters, setFilters] = useState({startDate: '', endDate: '', status: ''});
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:3001/attendance?uid=${udata.uid}`)
        .then((response) => {
            setattendanceData(response.data);
            setFilteredData(response.data);
        })
        .catch((error) => {
            console.error('Error fetching attendance data: ', error);
            setError('Database Error: Error while fetching attendance data')
        });
    }, []);

     // Handle filter change
    const handleFilterChange = (column, value) => {
        setFilters((prevFilters) => ({
        ...prevFilters,
        [column]: value
        }));
    };

    // Filter the data based on the filter state
    useEffect(() => {
        const filtered = attendanceData.filter(item => {
            const itemDate = new Date(item.date);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            // Check if the item date is within the selected range
            const isWithinDateRange =
                (!startDate || itemDate >= startDate) &&
                (!endDate || itemDate <= endDate);

            return (
                isWithinDateRange &&
                (filters.status === '' || item.status.toLowerCase().includes(filters.status.toLowerCase()))
            );
        });
        setFilteredData(filtered);
    }, [filters, attendanceData]);

    const clearFilter = () => {
        setFilters({startDate: null, endDate: null, status:''});
    }


    return (
        <div style={{width:'1500px', height:'700px' }}>
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

            <div>
                <h3 style={{textAlign: 'center'}}>Attendance Data</h3>

                {/* Filters */}
                <div className="filters">
                    {/* Date Range Filter */}
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        placeholder="End Date"
                    />
                    {/* Filter by Attendance Status */}
                    <input
                        type="text"
                        placeholder="Filter by Status"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    />
                    <button onClick={clearFilter}>Clear Filter</button>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <Table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Attendance Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length===0 ? (
                            <tr><td colSpan={2}>No attendance records found for the user</td></tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.date}</td>
                                    <td>{item.status}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default Attendance