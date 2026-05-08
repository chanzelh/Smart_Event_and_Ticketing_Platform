// Test Route for Dashboard [cite: 185]
router.get('/dashboard', (req, res) => {
    // CHANGE THIS ROLE TO TEST: 'User', 'Merchant', or 'Admin'
    const mockUser = { 
        name: 'Jono', 
        role: 'Merchant' 
    }; 
    
    res.render('dashboard', { user: mockUser });
});

// Test Route for Event Management [cite: 184]
router.get('/admin/manage', (req, res) => {
    // Only 'Merchant' and 'Admin' should realistically access this
    const mockUser = { 
        role: 'Merchant' 
    };
    
    res.render('admin/manage', { user: mockUser });
});