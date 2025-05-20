import React from 'react';
import { useNavigate } from 'react-router-dom';

export function DashboardCard ( {title = 'titleXD', link='linkXD', text='textXD'}) {

    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate("/"+link);
    }

    return (
        <div onClick = {handleNavigation} className='section-box' >
            <h1 className='title-card'>{title}</h1>
            <p className='text-card'>{text}</p>
        </div>
       
    )
};