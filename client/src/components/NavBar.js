import React from "react";
import { NavLink } from "react-router-dom"

// const sidebarStyles = {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "start",  // Align links to the start of the container.
//     position: "fixed",   // Fix position so the sidebar stays put while scrolling.
//     left: 0,             // Position it on the left side.
//     top: 0,              // Start from the top.
//     height: "100vh",     // Full viewport height.
//     width: "200px",      // Width of the sidebar.
//     backgroundColor: "grey",
//     padding: "16px",
//     boxSizing: "border-box",
// }

const linkStyles = {
    width: "100%",
    padding: "8px 16px",
    margin: "8px 0",     // Updated margins for vertical spacing.
    background: "darkgrey",
    textDecoration: "none",
    color: "white",
    borderRadius: "4px",  // Optional rounded corners.
}

function NavBar() {
    return (
        <div>
            <NavLink style={linkStyles} to="/">Home</NavLink>
            <NavLink style={linkStyles} to="/employeeform">New Employee</NavLink>
            <NavLink style={linkStyles} to="/about">About</NavLink>
            <NavLink style={linkStyles} to="/associatetable">Associates Table</NavLink>
            <NavLink style={linkStyles} to="/schedulebuilder">Schedule Builder</NavLink>
            <NavLink style={linkStyles} to="/allocationsummary">Allocation Summary</NavLink>
        </div>
    );
}

export default NavBar;


// export default function NavBar() {
//     const activeItem = 'home';
// //   state = { activeItem: 'home' }

//     const handleItemClick = (e, { name }) => console.log('hi')

//     return (
//       <Menu pointing vertical>
//         <Menu.Item
//           name='home'
//           active={activeItem === 'home'}
//           onClick={handleItemClick}
//         />
//         <Menu.Item
//           name='messages'
//           active={activeItem === 'messages'}
//           onClick={handleItemClick}
//         />
//         <Menu.Item
//           name='friends'
//           active={activeItem === 'friends'}
//           onClick={handleItemClick}
//         />
//       </Menu>
//     )

// }
