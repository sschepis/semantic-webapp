import { FC } from 'react';
import { NavLink as BaseNavLink, NavLinkProps } from 'react-router-dom';
import { NetworkIcon, FieldIcon, QuantumIcon } from './Icons';
import './WelcomePage.css';

type CustomNavLinkProps = NavLinkProps & {
  children: React.ReactNode | ((props: { isActive: boolean, isPending: boolean }) => React.ReactNode);
};

const NavLink = BaseNavLink as React.FC<CustomNavLinkProps>;

const WelcomePage: FC = () => {
  const getButtonClass = (isActive: boolean) => 
    `step-button ${isActive ? 'active' : ''} ${isActive ? 'primary' : ''}`;
  return (
    <div className="welcome-page">
      <h1>Welcome to Quantum Semantic Fields</h1>
      
      <div className="welcome-description">
        This application helps you explore and analyze quantum semantic relationships
        through an intuitive interface. Follow the guided workflow to get started.
      </div>

      <div className="workflow-steps">
        <div className="workflow-step">
          <div className="step-number">1</div>
          <div className="step-icon"><NetworkIcon /></div>
          <h3>Generate Your Network</h3>
          <p>Start by creating a semantic network that will form the foundation of your analysis.</p>
          <NavLink to="/generate/network" className={({ isActive }) => getButtonClass(isActive)}>
            Begin Network Generation
          </NavLink>
        </div>

        <div className="workflow-step">
          <div className="step-number">2</div>
          <div className="step-icon"><FieldIcon /></div>
          <h3>Construct Quantum Fields</h3>
          <p>Transform your semantic network into quantum fields for advanced analysis.</p>
          <NavLink to="/generate/fields" className={({ isActive }) => getButtonClass(isActive)}>
            Explore Field Construction
          </NavLink>
        </div>

        <div className="workflow-step">
          <div className="step-number">3</div>
          <div className="step-icon"><QuantumIcon /></div>
          <h3>Analyze & Query</h3>
          <p>Explore relationships, patterns, and insights in your quantum semantic fields.</p>
          <NavLink to="/analyze/quantum" className={({ isActive }) => getButtonClass(isActive)}>
            Start Analysis
          </NavLink>
        </div>
      </div>

      <div className="quick-tips">
        <h4>Quick Tips</h4>
        <ul>
          <li>Use the sidebar menu to navigate between different tools and views</li>
          <li>Each section builds upon the previous one in the workflow</li>
          <li>Save your progress at any point using the persistence controls</li>
          <li>Refer to the documentation for detailed information about each tool</li>
        </ul>
      </div>
    </div>
  );
};

export default WelcomePage;
