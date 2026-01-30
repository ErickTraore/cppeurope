// File: frontend/src/components/pageContent/PageContent.jsx

import React from 'react';
import Auth from '../auth/Auth';
import Register from '../register/Register';
import '../pageContent/PageContent.css';
import Home from '../home/Home';
import ContactForm from '../contactForm/ContactForm';
import Attestation from '../attestation/Attestation';
import Login from '../login/Login';
import Zoompage from '../zoompage/Zoompage';
import Presse from '../admin/presse/Presse';          // module admin (prod)
import ProfilePage from '../profilepage/ProfilePage';
import NewPresse from '../presse/Presse';             // nouveau module presse

const PageContent = React.memo(({ activePage }) => {
  return (
    <div className="content" key={activePage}>
      {activePage === 'home' && <Home/>}
      {activePage === 'auth' && <Auth />}
      {activePage === 'register' && <Register />}
      {activePage === 'contact' && <ContactForm />}
      {activePage === 'login' && <Login />} 
      {activePage === 'attestation' && <Attestation />} 
      {activePage === 'zoompage' && <Zoompage />} 

      {activePage === 'presse' && <Presse />}          {/* ancien module admin */}
      {activePage === 'newpresse' && <NewPresse />}    {/* nouveau module */}

      {activePage === 'profilepage' && <ProfilePage />}
    </div>
  );
});

export default PageContent;
