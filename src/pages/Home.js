import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../stylings/home.css";

function Home() {
  const navigate = useNavigate();

  const navigateToSkills = () => {
    navigate('/skills');
  };
  const navigateToAbout = () =>{
    navigate('/about');
  }

  return (
    <div className="container">
      <div className="main">
        <h1 id='hellophrase'>Hello👋, my name is</h1>
        <h1 id='namephrase'>Arnold Curtis.</h1>
        <h2 id='whatido'>Full-Stack Engineer & Machine Learning Innovator.</h2>
        <h3 id='whatido1'> I’m a passionate software engineer who loves building seamless applications, from intuitive front-end interfaces to robust back-end systems, integrating machine learning, and creating impactful solutions. Programming is my true passion, and I’m always excited for new challenges.</h3>
        <div className="button-container">
          <button className="about-button"onClick={navigateToAbout}>Discover My Journey!</button>
          <button className="skills-button" onClick={navigateToSkills}>What I Bring to the Table?</button>
        </div>
      </div>
    </div>
  );
}

export default Home;