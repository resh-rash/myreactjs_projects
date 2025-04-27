import {Routes, Route } from "react-router-dom";

import Login from './login';
import Registration from './registration';
import Dashboard from "./user_dashboard";
import Profile from "./profile"
import Attendance from "./attendance";
import KanbanBoard from "./tasks";
import AdminAttendance from "./admin_attendance";
import AdminTasks from "./admin_tasks";

function Project() {
  return(
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/register" element={<Registration/>} />
          <Route path="/usrdashboard/:urole/:uid/:uname" element={<Dashboard/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/attendance/:uid" element={<Attendance/>} />
          <Route path="/task/:uid" element={<KanbanBoard/>} />
          <Route path="/attendances" element={<AdminAttendance/>} />
          <Route path="/alltasks" element={<AdminTasks/>} />
        </Routes>
    
  );
}



export default Project;