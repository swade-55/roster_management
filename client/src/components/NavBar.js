import React from "react";
import { NavLink } from "react-router-dom"

const sidebarStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",  // Align links to the start of the container.
    position: "fixed",    // Fix position so the sidebar stays put while scrolling.
    left: 0,              // Position it on the left side.
    top: 0,               // Start from the top.
    height: "100vh",      // Full viewport height.
    width: "200px",       // Width of the sidebar.
    backgroundColor: "#2C2C2C",
    padding: "16px",
    boxSizing: "border-box",
    zIndex: 1000,         
}

const linkStyles = {
    width: "100%",
    padding: "8px 16px",
    margin: "8px 0",     
    background: "darkgrey",
    textDecoration: "none",
    color: "white",
    borderRadius: "4px",  // Optional rounded corners.
    fontSize: "14px",   
}

function NavBar() {
    return (
        <div style={sidebarStyles}>
            <NavLink style={linkStyles} to="/">Roster</NavLink>
            <NavLink style={linkStyles} to="/employeeform">Add Associate</NavLink>
            <NavLink style={linkStyles} to="/about">About</NavLink>
            <NavLink style={linkStyles} to="/associatetable">Associate Schedules</NavLink>
            <NavLink style={linkStyles} to="/schedulebuilder">Schedule Build Optimizer </NavLink>
            <NavLink style={linkStyles} to="/allocationsummary">Department Allocation Optimizer</NavLink>
        </div>
    );
}

export default NavBar;
