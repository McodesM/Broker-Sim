import { useState } from 'react';

const useLoginController = () => {
    const sendLoginData = async (formData, navigate, myContext) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonResponse = await response.json();
            console.log('Message:', jsonResponse.message);
            myContext.login();
            navigate('/home');
        } catch (error) {
            console.error("Error:", error.message);
            alert("Error logging you in, try again");
        }
    };

    return { sendLoginData };
};

export default useLoginController;