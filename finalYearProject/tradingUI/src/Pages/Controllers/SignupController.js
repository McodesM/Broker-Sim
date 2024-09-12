
const useSignupController = () => {
    const sendSignupData = async (formData, navigate) =>{
        try {
            const response = await fetch('http://127.0.0.1:8000/signup/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
              credentials: 'include'
            });
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonResponse = await response.json();
            console.log('Message:', jsonResponse.message);
            alert("SignedUp");
            navigate('/')
        }
        catch (error){
            console.error("Error:", error.message);
            alert("Error signing you up, try again");
        }
    }

    return { sendSignupData }
}

export default useSignupController;