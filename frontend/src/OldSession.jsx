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
    const [showResults, setShowResults] = useState(false);
    const token = localStorage.getItem('token');
    const [results, setResults] = useState([]);

    const getResults = async (q) => {
        try {
            const response = await axios.get(
                `http://localhost:5005/admin/session/${q}/results`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                console.log(response.data);
                setResults(response.data);
            }
        } catch (err) {
            console.log(err);
        }

        setShowResults(true);
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        minHeight: '70vh',
        width: '100%',
        padding: '0px',
        margin: '0px',
    };

    const boxStyle = {
        width: '50vw',
        padding: '2vh 3vw',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        margin: '2vh 0',
    };

    const titleStyle = {
        fontSize: '3vh',
        fontWeight: '600',
        color: '#333',
        marginBottom: '2vh',
    };

    const textStyle = {
        fontSize: '1.8vh',
        color: '#555',
        marginBottom: '0.5vh',
    };

    const sessionListStyle = {
        listStyle: 'none',
        padding: '0',
        margin: '0',
    };

    const sessionItemStyle = {
        padding: '1vh 1vw',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5vh',
        borderBottom: '1px solid #eee',
    };

    const sessionTextStyle = {
        fontSize: '1.8vh',
        color: '#333',
    };

    const buttonContainerStyle = {
        marginTop: '2vh',
        textAlign: 'center',
    };

    const buttonStyle = {
        padding: '1vh 2vw',
        fontSize: '1.8vh',
        fontWeight: '500',
        color: '#fff',
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        margin: '0.5vh 1vw',
        transition: 'background-color 0.3s, transform 0.1s',
    };

    return (
        <div style={containerStyle}>
            <div style={boxStyle}>
                <h2 style={titleStyle}>Sessions Review</h2>
                <div>
                    <button
                        style={buttonStyle}
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
                {Array.isArray(oldSessions) && oldSessions.length > 0 ? (
                    <ul style={sessionListStyle}>
                        {oldSessions.map((q, index) => (
                            <li key={index} style={sessionItemStyle}>
                                <span style={sessionTextStyle}>{q}</span>
                                <button style={buttonStyle} onClick={() => getResults(q)}>
                                    Result
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={textStyle}>No old session available.</p>
                )}

                {showResults && (
                    <Modal onClose={() => setShowResults(false)}>
                        <Results data={results} question={question} />
                    </Modal>
                )}
            </div>
        </div>
    );
}

export default OldSession;