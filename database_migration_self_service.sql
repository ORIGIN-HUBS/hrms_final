-- Self Service Tickets Table
-- Run this SQL script in your PostgreSQL database to create the self_service_tickets table

CREATE TABLE IF NOT EXISTS self_service_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    assigned_to BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution TEXT,
    admin_notes TEXT,
    
    -- Foreign key constraints
    CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Check constraints for enums
    CONSTRAINT chk_category CHECK (category IN (
        'PAYROLL', 'PAYSTUBS', 'LEAVE_MANAGEMENT', 'TRAVEL_INDIA', 
        'VISA_IMMIGRATION', 'BENEFITS', 'IT_SUPPORT', 'WORKPLACE_ISSUES', 
        'TRAINING', 'DOCUMENTS', 'OTHER'
    )),
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    CONSTRAINT chk_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_employee_id ON self_service_tickets(employee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON self_service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON self_service_tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON self_service_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON self_service_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON self_service_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON self_service_tickets(ticket_number);

-- Insert some sample data for testing (optional)
-- INSERT INTO self_service_tickets (
--     ticket_number, employee_id, category, priority, subject, description, status
-- ) VALUES (
--     'TKT-20251029001', 1, 'PAYROLL', 'HIGH', 'Missing overtime payment for September', 
--     'I noticed that my overtime hours for September 2024 were not included in my paycheck. I worked 15 hours of overtime during that month but they do not appear on my pay stub.', 
--     'OPEN'
-- );

COMMENT ON TABLE self_service_tickets IS 'Self Service Portal tickets for employee support requests';
COMMENT ON COLUMN self_service_tickets.ticket_number IS 'Unique ticket identifier in format TKT-YYYYMMDDHHMMSS';
COMMENT ON COLUMN self_service_tickets.category IS 'Issue category: PAYROLL, PAYSTUBS, LEAVE, TRAVEL_INDIA, VISA, BENEFITS, IT_SUPPORT, WORKPLACE, TRAINING, DOCUMENTS, OTHER';
COMMENT ON COLUMN self_service_tickets.priority IS 'Priority level: LOW, MEDIUM, HIGH, URGENT';
COMMENT ON COLUMN self_service_tickets.status IS 'Ticket status: OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED';
COMMENT ON COLUMN self_service_tickets.assigned_to IS 'Employee ID of HR/Admin assigned to handle this ticket';
COMMENT ON COLUMN self_service_tickets.resolution IS 'Resolution details when ticket is resolved';
COMMENT ON COLUMN self_service_tickets.admin_notes IS 'Internal notes for HR/Admin team';