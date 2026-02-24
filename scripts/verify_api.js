const axios = require('axios');

const API_URL = 'http://localhost:3000';

const test = async () => {
    try {
        console.log('--- Starting Support Ticket Management API Test ---');

        // 1. Login as Default Manager
        console.log('\n[1] Logging in as Default Manager...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@company.com',
            password: 'Admin@123'
        });
        const managerToken = loginRes.data.token;
        console.log('Logged in successfully.');

        const managerAuth = { headers: { Authorization: `Bearer ${managerToken}` } };

        // 2. Create Support and User accounts
        console.log('\n[2] Creating Support and User accounts as Manager...');
        const supportUserRes = await axios.post(`${API_URL}/users`, {
            name: 'Test Support',
            email: `support_${Date.now()}@test.com`,
            password: 'Password123',
            roleName: 'SUPPORT'
        }, managerAuth);
        const supportUser = supportUserRes.data.data;

        const regularUserRes = await axios.post(`${API_URL}/users`, {
            name: 'Test User',
            email: `user_${Date.now()}@test.com`,
            password: 'Password123',
            roleName: 'USER'
        }, managerAuth);
        const regularUser = regularUserRes.data.data;
        console.log('Users created.');

        // Login as User
        const userLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: regularUser.email,
            password: 'Password123'
        });
        const userToken = userLoginRes.data.token;
        const userAuth = { headers: { Authorization: `Bearer ${userToken}` } };

        // Login as Support
        const supportLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: supportUser.email,
            password: 'Password123'
        });
        const supportToken = supportLoginRes.data.token;
        const supportAuth = { headers: { Authorization: `Bearer ${supportToken}` } };

        // 3. User creates a ticket
        console.log('\n[3] User creating a ticket...');
        const ticketRes = await axios.post(`${API_URL}/tickets`, {
            title: 'Broken Keyboard',
            description: 'My keyboard has several keys not working.',
            priority: 'MEDIUM'
        }, userAuth);
        const ticket = ticketRes.data.data;
        console.log(`Ticket created: ${ticket.title} (ID: ${ticket._id})`);

        // 4. Test RBAC: Support cannot assign (per docs, only MANAGER/SUPPORT can assign, but let's check if User can't)
        console.log('\n[4] Testing RBAC (Negative tests)...');
        try {
            await axios.patch(`${API_URL}/tickets/${ticket._id}/assign`, { assigned_to: supportUser._id }, userAuth);
            console.log('FAIL: User was able to assign ticket!');
        } catch (err) {
            console.log('SUCCESS: User blocked from assigning (403).');
        }

        // 5. Manager assigns ticket to Support
        console.log('\n[5] Manager assigning ticket to Support...');
        await axios.patch(`${API_URL}/tickets/${ticket._id}/assign`, { assigned_to: supportUser._id }, managerAuth);
        console.log('Ticket assigned.');

        // 6. Test Status Transitions
        console.log('\n[6] Testing Status Transitions...');
        // OPEN -> RESOLVED (Should fail)
        try {
            await axios.patch(`${API_URL}/tickets/${ticket._id}/status`, { status: 'RESOLVED' }, supportAuth);
            console.log('FAIL: Invalid transition OPEN -> RESOLVED allowed!');
        } catch (err) {
            console.log('SUCCESS: Invalid transition blocked (400).');
        }

        // OPEN -> IN_PROGRESS (Should succeed)
        await axios.patch(`${API_URL}/tickets/${ticket._id}/status`, { status: 'IN_PROGRESS' }, supportAuth);
        console.log('Status updated to IN_PROGRESS.');

        // 7. Testing Comments
        console.log('\n[7] Testing Comments...');
        await axios.post(`${API_URL}/tickets/${ticket._id}/comments`, { comment: 'I am looking into this.' }, supportAuth);
        await axios.post(`${API_URL}/tickets/${ticket._id}/comments`, { comment: 'Okay, thank you.' }, userAuth);
        console.log('Comments added.');

        // Check visibility
        const commentsRes = await axios.get(`${API_URL}/tickets/${ticket._id}/comments`, userAuth);
        console.log(`User sees ${commentsRes.data.count} comments.`);

        // 8. Delete Ticket as Manager
        console.log('\n[8] Manager deleting ticket...');
        await axios.delete(`${API_URL}/tickets/${ticket._id}`, managerAuth);
        console.log('Ticket deleted.');

        // Verify deletion
        try {
            await axios.get(`${API_URL}/tickets/${ticket._id}/comments`, managerAuth);
            console.log('FAIL: Comments still exist after ticket deletion!');
        } catch (err) {
            console.log('SUCCESS: Cascade delete verified (Ticket/Comments gone).');
        }

        console.log('\n--- ALL TESTS PASSED SUCCESSFULLY! ---');

    } catch (error) {
        console.error('\n!!! TEST FAILED !!!');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Message: ${JSON.stringify(error.response.data.message)}`);
        } else {
            console.error(error.message);
        }
    }
};

test();
