import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Form } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { DndContext, useDroppable, useDraggable } from '@dnd-kit/core';     //for kanban board
import Menu from './HomeMenu';
import { Button, Card, Col, Container, Modal, Row } from 'react-bootstrap';


const KanbanBoard = () => {

    const udata = useParams();
    const [taskData, settaskData] = useState(
        {
            todo: [],
            inprogress: [],
            done: []
        }
    );
    const [error, setError] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [tname, setTname] = useState('');
    const [description, setDescription] = useState('');
    const [duedate, setDuedate] = useState('');
    const [tstatus, setTstatus] = useState('');
    const [taskid, setTaskid] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    

    useEffect(() => {
        console.log('ENTERED USEeffect')
        const todoList = [];
        const inProgressList = [];
        const doneList = [];

        axios.get(`http://localhost:3001/task?uid=${udata.uid}`)
        .then((response) => {
            if (response.data){
                console.log('TASK DAT: ', response.data);

                response.data.forEach((task) => {
                    if (task.status === 'todo') {
                        console.log("Entered todo status: ", task);
                        todoList.push(task);
                        console.log("todolist is: ", todoList)
                    } else if (task.status === 'inprogress') {
                        inProgressList.push(task);
                    } else if (task.status === 'done'){
                        doneList.push(task);
                    }
                    else{
                        console.log("No status for the task")
                    }
                });

                settaskData({
                    todo:todoList, 
                    inprogress: inProgressList, 
                    done: doneList
                });
                
            }

            if (taskData){
                console.log('The data lists are: ', taskData);
            }
        })
        .catch((error) => {
            console.error('Error fetching tasks. ', error);
            setError('Database Error: Error while fetching tasks');
        });
    }, [udata.uid]);


    const Column = ({ id, title, tasks }) => {
        console.log('Entered tasktododata ', tasks)
        const { setNodeRef } = useDroppable({ id: id }); 
  
        return (
            <div ref={setNodeRef} className="column">   
                <h3>{title}</h3>
                {tasks.map((task, index) => (
                    <DraggableTask key={task.taskid} task={task} index={index} column={id}/>
                ))}
            </div>
        );
    };


    const PopupClose = () => {setShowPopup(false)};


    const DraggableTask = ({ task, index, column }) => {
        const { attributes, listeners, setNodeRef } = useDraggable({ 
            id: task.taskid,
            data: {column}
        });
    
        const openPopup = () => {
            setSelectedTask(task);
            setShowPopup(true);
            setTaskid(task.taskid);
            setTname(task.taskname);
            setDescription(task.description);
            setDuedate(task.duedate);
            setTstatus(task.status);
        };

        return (
        <div ref={setNodeRef} className="card">
        <Card bg={'light'}>
            <Card.Body style={{ width: '15rem'}}>
                {/* Make only subtitle draggable */}
                <Card.Subtitle {...listeners} {...attributes}>
                    {task.taskname ? task.taskname : 'Task ' + task.taskid}
                </Card.Subtitle>
                <Card.Text>Duedate: {task.duedate ? task.duedate.slice(0, 10): ''}</Card.Text>
                <Card.Text>{task.description}</Card.Text>
                <Button 
                variant='outline-dark' 
                size='sm' 
                type='button' 
                onClick={(e) => {
                    e.stopPropagation(); // <== important to prevent drag from blocking click
                    openPopup();
                }}>Edit</Button>
            </Card.Body>
        </Card>
        </div>
        );
    };


    
    const updateTask = async(e) => {
        e.preventDefault();
        setError('');  
        const formData = {
            "taskname": tname,
            "description": description,
            "duedate": duedate,
            "status": tstatus,
            "userid": udata.uid,
            "taskid": taskid
        };

        try {
            const response = await fetch('http://localhost:3001/taskupdate', { 
                method: "POST",
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(formData)
            });
           
            const result = await response.json();
            if (response.ok) {
                setSuccessMessage('Task updated!', result);
            } 
            else {
                const errorResult = await response.json();
                setError(errorResult.message || 'Something went wrong, please try again.');
            }
        } catch (err) {
            console.error('Error during task updation:', err);
            setError('An error occurred. Please try again later.');
        } 
    };

    const handleDragEnd = async(event) => {
        const { active, over } = event;   //event.active=> the dragged item (the task)., event.over=> the column over which the item is dropped.
        if (!over) return;

        const taskidtomove = active.id;
        const fromColumn = active.data.current.column;
        const toColumn = over.id;

        if (!fromColumn || !toColumn || fromColumn === toColumn) return;

        const oldtaskdata = {...taskData}
        const fromTasks = [...taskData[fromColumn]];
        const toTasks = [...taskData[toColumn]];

        const taskIndex = fromTasks.findIndex(task => task.taskid === taskidtomove);
        const [movedTask] = fromTasks.splice(taskIndex, 1);
        toTasks.push(movedTask); 
    
        settaskData({
          ...taskData,
          [fromColumn]: fromTasks,
          [toColumn]: toTasks
        });


        //updating status in database
        try{
            const request = await axios.put('http://localhost:3001/taskstatus', {
                taskid: taskidtomove,
                userid: udata.uid,
                status: toColumn, 
            }); 
            console.log('Status updated in db')
        }catch{
            console.log('Error while updating status')
        }

    };


        //Wrapping the Drag-and-Drop Logic
    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div style={{width:'1500px', height:'700px'}}>
                <Menu/>
                <div className="kanban-board" style={{display: 'flex', gap:'30px'}}>  
                    <Column id='todo' title="To Do" tasks={taskData.todo} />
                    <Column id='inprogress' title="In Progress" tasks={taskData.inprogress} />
                    <Column id='done' title="Done" tasks={taskData.done} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                        {/* Modal for Editing task */}
                {selectedTask && (
                    <Modal show={showPopup} onHide={PopupClose} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedTask.taskid}: {selectedTask.taskname}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-center">
                        <Container style={{display: 'block', height:'200px'}}>
                            <Row>
                                <Col><label className="form-label">Created Date:</label></Col>
                                <Col><label>{selectedTask.date ? selectedTask.date.slice(0, 10) : ''}</label></Col> 
                            </Row>
                            <Row>
                                <Col><label className="form-label">Task Name:</label></Col>
                                <Col><input
                                        type="text"
                                        name="taskname"
                                        className="form-control"
                                        value={tname} 
                                        onChange={(e) => setTname(e.target.value)} 
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col><label className="form-label">Description:</label></Col>
                                <Col><textarea
                                        type="text"
                                        name="description"
                                        className="form-control"
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col><label className="form-label">Due Date:</label></Col>
                                <Col><input
                                        type="date"
                                        name="duedate"
                                        className="form-control"
                                        value={duedate} 
                                        onChange={(e) => setDuedate(e.target.value)} 
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col><label className="form-label">Status:</label></Col>
                                <Col>
                                <input list="status" 
                                    value={tstatus} 
                                    onChange={(e) => setTstatus(e.target.value)} />
                                <datalist id="status">
                                    <option value="todo"/>
                                    <option value="inprogress"/>
                                    <option value="done"/></datalist>
                                </Col>
                            </Row>
                        </Container>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="dark" onClick={updateTask}>Update</Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </DndContext>
    );
};



export default KanbanBoard;