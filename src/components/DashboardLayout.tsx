import React from 'react';
import { Outlet, OutletProps } from 'react-router-dom';
import AppMenu from '../components/AppMenu';
import './DashboardLayout.css';

const CustomOutlet = Outlet as React.FC<OutletProps>;

const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <AppMenu />
      <main className="main-content">
        <div className="content-container">
          <CustomOutlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
