-- Seed script to create test users for the accounting software
-- Run this after setting up your PocketBase collections

-- Test Client User
INSERT INTO users (id, email, username, name, birthday, place_of_residence, user_type, emailVisibility, verified) 
VALUES (
  'test_client_001',
  'client@test.com',
  'testclient',
  'John Doe',
  '1990-05-15',
  'New York, NY',
  'client',
  true,
  true
);

-- Test Admin User  
INSERT INTO users (id, email, username, name, birthday, place_of_residence, user_type, emailVisibility, verified)
VALUES (
  'test_admin_001', 
  'admin@test.com',
  'testadmin',
  'Jane Smith',
  '1985-08-22',
  'Los Angeles, CA', 
  'admin',
  true,
  true
);

-- Sample transactions for the test client
INSERT INTO transactions (user_id, type, amount, description, date)
VALUES 
  ('test_client_001', 'deposit', 5000.00, 'Initial deposit', '2024-01-15'),
  ('test_client_001', 'withdrawal', 150.00, 'ATM withdrawal', '2024-01-20'),
  ('test_client_001', 'deposit', 2500.00, 'Salary deposit', '2024-02-01'),
  ('test_client_001', 'withdrawal', 75.50, 'Grocery shopping', '2024-02-03');

-- Sample bills for the test client
INSERT INTO bills (user_id, title, amount, due_date, status, description)
VALUES 
  ('test_client_001', 'Electric Bill', 125.50, '2024-03-15', 'pending', 'Monthly electricity bill'),
  ('test_client_001', 'Internet Bill', 79.99, '2024-03-20', 'paid', 'Monthly internet service'),
  ('test_client_001', 'Water Bill', 45.25, '2024-03-25', 'pending', 'Monthly water bill');

-- Sample invoices for the test client  
INSERT INTO invoices (user_id, invoice_number, amount, issue_date, due_date, status, description)
VALUES
  ('test_client_001', 'INV-001', 1200.00, '2024-02-01', '2024-02-28', 'paid', 'Consulting services'),
  ('test_client_001', 'INV-002', 850.00, '2024-02-15', '2024-03-15', 'pending', 'Web development project');
