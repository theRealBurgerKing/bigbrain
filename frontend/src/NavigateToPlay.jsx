import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal'; // 引入 Modal 组件

function NavigateToPlay() {
    const [error, setError] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false); // 控制弹窗显示
    const [sessionId, setSessionId] = useState('');
    const navigate = useNavigate();

    const checkSession = async () => {
        try {
            // Use POST /play/join/{sessionid} to check if the session exists
            const response = await axios.post(
                `http://localhost:5005/play/join/${sessionId}`,
                { name: "Anonymous Player" } // Use a placeholder name for validation
            );
            if (response.status === 200) {
                // Session exists, navigate to the play page with playerId
                navigate(`/play/${sessionId}`, { state: { playerId: response.data.playerId } });
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 400) {
                    setError('Invalid Session ID. Please enter a valid Session ID.');
                } else {
                    setError(err.response.data.error || 'An error occurred while checking the session.');
                }
            } else {
                setError('Failed to connect to the server. Please try again.');
            }
            setShowErrorModal(true); // 显示错误弹窗
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkSession();
        }
    };

    const handleCloseModal = () => {
        setShowErrorModal(false);
        setError(''); // 关闭弹窗时清除错误信息
    };

    // Define styles as named objects
    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        padding: '0px',
        margin: '0px',
    };

    const boxStyle = {
        width: '30vw',
        padding: '2vh 3vw',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        marginTop: '20vh',
        textAlign: 'center',
    };

    const titleStyle = {
        fontSize: '4vh',
        fontWeight: '600',
        color: '#333',
        marginBottom: '0vh',
    };

    const subtitleStyle = {
        fontSize: '1.3vh',
        fontWeight: '500',
        color: '#333',
        marginBottom: '2vh',
    };

    const errorStyle = {
        color: 'red',
        fontSize: '1.8vh',
        marginBottom: '1vh',
        textAlign: 'center',
    };

    const inputGroupStyle = {
        marginBottom: '1.5vh',
        textAlign: 'left',
    };

    const labelStyle = {
        fontSize: '1.5vh',
        color: '#555',
        marginBottom: '0.5vh',
        display: 'block',
    };

    const inputStyle = {
        width: '20vw',
        padding: '1vh 1vw',
        fontSize: '1.8vh',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff',
        marginTop: '1vw',
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

    const modalTextStyle = {
        fontSize: '1.8vh',
        color: '#333',
        textAlign: 'center',
    };

    return (
        <div style={containerStyle}>
            <div style={boxStyle}>
                <h1 style={titleStyle}>Welcome To Play</h1>
                <h2 style={subtitleStyle}>Please Enter the Game Session ID:</h2>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>
                        Session ID:
                        <input
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                            onKeyDown={handleKeyDown}
                            type="text"
                            style={inputStyle}
                        />
                    </label>
                </div>
                <div style={buttonContainerStyle}>
                    <button style={buttonStyle} onClick={checkSession}>
                        Submit
                    </button>
                </div>
            </div>

            {/* Modal for displaying errors */}
            {showErrorModal && (
                <Modal onClose={handleCloseModal}>
                    <p style={modalTextStyle}>{error}</p>
                </Modal>
            )}
        </div>
    );
}

export default NavigateToPlay;