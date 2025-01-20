import { FC } from 'react';
import { NavLink as BaseNavLink, NavLinkProps } from 'react-router-dom';
import {
  NetworkIcon,
  FieldIcon,
  TemporalIcon,
  QuantumIcon,
  PatternIcon,
  SemanticIcon,
  QueryIcon
} from './Icons';
import './AppMenu.css';

type CustomNavLinkProps = NavLinkProps & {
  children: React.ReactNode | ((props: { isActive: boolean, isPending: boolean }) => React.ReactNode);
};

const NavLink = BaseNavLink as React.FC<CustomNavLinkProps>;

const AppMenu: FC = () => {
  const getNavLinkClass = ({ isActive, isPending }: { isActive: boolean, isPending: boolean }) => 
    `menu-item ${isPending ? 'pending' : ''} ${isActive ? 'active' : ''}`;

  return (
    <nav className="app-menu" aria-label="Main navigation">
      <div className="menu-section">
        <h3 className="section-title">1. Generation</h3>
        <div className="section-description">Start by creating your quantum semantic network</div>
        <ul className="menu-list">
          <li>
            <NavLink to="/generate/network" className={getNavLinkClass}>
              <span className="menu-icon"><NetworkIcon /></span>
              <span className="menu-text">Network Generation</span>
              <span className="menu-badge recommended">Recommended</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/generate/fields" className={getNavLinkClass}>
              <span className="menu-icon"><FieldIcon /></span>
              <span className="menu-text">Field Construction</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="menu-section">
        <h3 className="section-title">2. Analysis</h3>
        <div className="section-description">Explore and analyze your quantum semantic fields</div>
        <ul className="menu-list">
          <li>
            <NavLink to="/analyze/temporal" className={getNavLinkClass}>
              <span className="menu-icon"><TemporalIcon /></span>
              <span className="menu-text">Temporal Analysis</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/analyze/quantum" className={getNavLinkClass}>
              <span className="menu-icon"><QuantumIcon /></span>
              <span className="menu-text">Quantum States</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/analyze/patterns" className={getNavLinkClass}>
              <span className="menu-icon"><PatternIcon /></span>
              <span className="menu-text">Pattern Detection</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="menu-section">
        <h3 className="section-title">3. Query</h3>
        <div className="section-description">Interact with and query your semantic fields</div>
        <ul className="menu-list">
          <li>
            <NavLink to="/query/semantic" className={getNavLinkClass}>
              <span className="menu-icon"><SemanticIcon /></span>
              <span className="menu-text">Semantic Search</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/query/quantum" className={getNavLinkClass}>
              <span className="menu-icon"><QueryIcon /></span>
              <span className="menu-text">Quantum Query</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default AppMenu;
