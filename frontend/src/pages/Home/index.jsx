import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section text-center animate-fade-in">
        <h1 className="hero-title">
          Connect, Create, <span className="text-primary">Collaborate</span>
        </h1>
        <p className="hero-subtitle animate-slide-up-delay-1">
          The ultimate platform for developers to showcase their portfolios, manage projects, and connect with peers.
        </p>
        <div className="hero-actions animate-slide-up-delay-2">
          <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
          <Link to="/search" className="btn btn-secondary btn-lg ml-sm">Explore Developers</Link>
        </div>
      </section>

      <section className="features-section container grid">
        <Card className="feature-card animate-slide-up-delay-1">
          <div className="feature-icon">🚀</div>
          <h3>Build Your Portfolio</h3>
          <p>Create stunning public profiles to showcase your skills, resume, and best projects to the world.</p>
        </Card>
        <Card className="feature-card animate-slide-up-delay-2">
          <div className="feature-icon">💼</div>
          <h3>Manage Projects</h3>
          <p>Keep track of all your ongoing and completed projects with links to live demos and GitHub repositories.</p>
        </Card>
        <Card className="feature-card animate-slide-up-delay-2">
          <div className="feature-icon">🌐</div>
          <h3>Connect Globally</h3>
          <p>Search and discover other developers by skills or titles to collaborate on the next big idea.</p>
        </Card>
      </section>
    </div>
  );
};

export default Home;
