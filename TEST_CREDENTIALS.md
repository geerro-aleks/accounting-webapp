# Test Credentials for Accounting Software

## Test Users

### Client Account
- **Email:** `client@test.com`
- **Password:** `testpass123`
- **Username:** `testclient`
- **Name:** John Doe
- **User Type:** Client

### Admin Account  
- **Email:** `admin@test.com`
- **Password:** `adminpass123`
- **Username:** `testadmin`
- **Name:** Jane Smith
- **User Type:** Admin

## Setup Instructions

1. **Run the seed script:** Execute `scripts/seed-test-users.sql` in your PocketBase admin panel
2. **Set passwords:** In PocketBase admin, manually set the passwords for these users:
   - Set `client@test.com` password to `testpass123`
   - Set `admin@test.com` password to `adminpass123`
3. **Test login:** Use these credentials to test both client and admin functionality

## What's Included

The test client account (`client@test.com`) comes with:
- Sample transactions (deposits and withdrawals)
- Sample bills (electric, internet, water)
- Sample invoices (consulting and web development)
- Complete profile information

The test admin account (`admin@test.com`) has full administrative access to:
- View all client records
- Create, update, and delete clients
- Access system-wide statistics
- Manage all financial data

## Security Note

These are test credentials only. In production, use strong, unique passwords and proper user registration flows.
