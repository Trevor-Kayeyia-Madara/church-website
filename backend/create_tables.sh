#!/bin/bash
#
# CPANEL TABLE CREATION SCRIPT
# Run this in cPanel Terminal to create the new Session table
#
# Usage:
#   bash create_tables.sh
#
# Or just run the commands below directly in Terminal

set -e

echo "========================================"
echo "  Creating Session Table"
echo "========================================"
echo ""

# Change to backend directory
cd /domains/dcutawala.org/backend-app

# Create tables using Python
python setup_tables.py

echo ""
echo "========================================"
echo "  Tables Created Successfully!"
echo "========================================"
echo ""
echo "Next: Create admin user"
echo "  python init_admin.py create"
echo ""
