SELECT employees.email, flex_reimbursement.* FROM flexben.flex_reimbursement
LEFT JOIN employees
ON employees.employee_id = flex_reimbursement.employee_id;