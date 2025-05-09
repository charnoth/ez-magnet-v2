document.addEventListener('DOMContentLoaded', async () => {
    const firstNameSpan = document.getElementById('firstName');
    const lastNameSpan = document.getElementById('lastName');
    const emailSpan = document.getElementById('email');
    const companyNameSpan = document.getElementById('companyName');
    const messageDiv = document.getElementById('message');

    // Check if all required DOM elements exist
    if (!firstNameSpan || !lastNameSpan || !emailSpan || !companyNameSpan || !messageDiv) {
        messageDiv.textContent = 'Error: Missing required elements on the page';
        messageDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/api/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication token if required (e.g., from localStorage)
                // 'Authorization': `Bearer ${localStorage.getItem('token')}` || ''
            },
            credentials: 'include' // Include cookies if authentication uses sessions
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Log the response data to debug
        console.log('API Response:', data);

        // Check if required fields are present in the response
        if (!data.firstName || !data.lastName || !data.email) {
            throw new Error('Invalid user data format from API');
        }

        firstNameSpan.textContent = data.firstName || '';
        lastNameSpan.textContent = data.lastName || '';
        emailSpan.textContent = data.email || '';
        companyNameSpan.textContent = data.companyName || 'None';
    } catch (error) {
        console.error('Error fetching user data:', error);
        messageDiv.textContent = `Error loading user data: ${error.message}`;
        messageDiv.style.color = 'red';
        // Redirect to login if unauthorized (e.g., 401 or 403)
        if (error.message.includes('401') || error.message.includes('403')) {
            setTimeout(() => window.location.href = '/', 2000);
        }
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    const messageDiv = document.getElementById('message');
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // Include cookies if authentication uses sessions
        });
        const data = await response.json();
        messageDiv.style.color = response.ok ? 'green' : 'red';
        messageDiv.textContent = data.message || 'Logout failed';
        if (response.ok) {
            setTimeout(() => window.location.href = '/', 1000);
        }
    } catch (error) {
        console.error('Error logging out:', error);
        messageDiv.textContent = 'Error logging out';
        messageDiv.style.color = 'red';
    }
});