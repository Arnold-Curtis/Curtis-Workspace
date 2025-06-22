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
      <div className="main" id="main" data-line="1-15">
        <h1 id='hellophrase' data-line="1">Hello👋, my name is</h1>
        <h1 id='namephrase' data-line="2">Arnold Curtis.</h1>
        <h2 id='whatido' data-line="3">Full-Stack Engineer & Machine Learning Innovator.</h2>
        <h3 id='whatido1' data-line="5-8"> I'm a passionate software engineer who loves building seamless applications, from intuitive front-end interfaces to robust back-end systems, integrating machine learning, and creating impactful solutions. Programming is my true passion, and I'm always excited for new challenges.</h3>
        <div className="button-container" id="button-container" data-line="16-25">
          <button className="about-button" data-line="16" onClick={navigateToAbout}>Discover My Journey!</button>
          <button className="skills-button" data-line="17" onClick={navigateToSkills}>What I Bring to the Table?</button>
        </div>
      </div>
    </div>
  );
}

export default Home;