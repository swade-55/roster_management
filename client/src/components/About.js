import React from "react";

function About() {
    return (
        <div id="about">
            <h2>Labor Capacity Planner</h2>
            <p>This tool helps wholesale grocery warehouse management by enabling them to upload employees with their own specific productivity metrics and update the summary to reflect potential gaps. </p>
            <p>Examples of some productivity metrics would consist of uptime(the total length of time the associate was engaged in their primary job function), units per hour(total units that associate has selected per hour), attendance(number of days they attended work divided by number of days they were scheduled multiplied by 100). Each associate would have their individual variations of the above metrics displayed as part of their associate card. Wrapping all of it together, each metric would be totalled or averaged based on the relevance to each metric and then displayed towards the top of the spreadsheet. I like to call this section the "Executive Summary" tab. </p>
            <div>
                <h3>Sam Wade Links</h3>
                <a href="https://github.com/swade-55/Phase-2-Project/tree/test-branch-1">GitHub</a>
                <br/>
                <a href="https://www.linkedin.com/in/samuel-wade-b45473a1/">LinkedIn</a>
            </div>
        </div>
    );
}

export default About;
