import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal';
import Results from './Results';

function OldSession() {
    const location = useLocation();
    const oldSessions = location.state?.old;
    const question = location.state?.questions;
    const navigate = useNavigate();
    const [showResults,setShowResults]=useState(false);
    const token = localStorage.getItem('token');
    const[results, setResults] =useState([]);

    const getResults =async(q)=>{
        try {
            const response = await axios.get(
                `http://localhost:5005/admin/session/${q}/results`,
                {headers: { Authorization: `Bearer ${token}` }}
            );
            if (response.status === 200) {
                console.log(response.data)
                setResults(response.data)
            }
        } catch (err) {
            console.log(err)
        }

        setShowResults(true)
    };


    return (
        <div>
            <button
                onClick={() => navigate('/dashboard')}
                style={{ padding: '10px 20px' }}
            >
                Back to Dashboard
            </button>
            {Array.isArray(oldSessions) && oldSessions.length > 0 ? (
                <ul style={{ paddingLeft: '20px' }}>
                    {oldSessions.map((q, index) => (
                        <li key={index}>
                            {q}
                            <button onClick={()=> getResults(q)}>result</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No old session available.</p>
            )}

            {showResults &&(
                <Modal onClose={() => setShowResults(false)}>
                    <Results data={results} question={question}>
                    </Results>
                </Modal>
            )}
        </div>
    );
}

export default OldSession;