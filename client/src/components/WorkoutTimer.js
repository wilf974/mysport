import React, { useState, useEffect, useRef } from 'react';
import './WorkoutTimer.css';

function WorkoutTimer({ defaultDuration = 90 }) {
    const [timeLeft, setTimeLeft] = useState(defaultDuration);
    const [isActive, setIsActive] = useState(false);
    const [initialTime, setInitialTime] = useState(defaultDuration);
    const audioRef = useRef(null);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            playAlarm();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
    };

    const adjustTime = (seconds) => {
        const newTime = Math.max(0, initialTime + seconds);
        setInitialTime(newTime);
        setTimeLeft(newTime);
    };

    const playAlarm = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed', e));
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="workout-timer">
            <div className="timer-display">
                <span className={`time ${timeLeft === 0 ? 'finished' : ''}`}>
                    {formatTime(timeLeft)}
                </span>
                <span className="timer-label">Repos</span>
            </div>

            <div className="timer-controls">
                <button
                    className="btn-timer-adjust"
                    onClick={() => adjustTime(-15)}
                    disabled={isActive}
                >
                    -15s
                </button>

                <button
                    className={`btn-timer-main ${isActive ? 'active' : ''}`}
                    onClick={toggleTimer}
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>

                <button
                    className="btn-timer-adjust"
                    onClick={() => adjustTime(15)}
                    disabled={isActive}
                >
                    +15s
                </button>

                <button
                    className="btn-timer-reset"
                    onClick={resetTimer}
                    title="Réinitialiser"
                >
                    ↺
                </button>
            </div>

            <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" />
        </div>
    );
}

export default WorkoutTimer;
