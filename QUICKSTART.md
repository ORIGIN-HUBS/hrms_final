# HRMS Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup (2 minutes)

1. **Start PostgreSQL** (if not already running)
   - Windows: Start from Services or pgAdmin
   - Check if running on port 5432

2. **Create Database:**
   - Open pgAdmin or command line
   - Run this SQL command:
   ```sql
   CREATE DATABASE hrms_db;
   ```

### Step 2: Run the Application (1 minute)

**Option A - Using Command Line:**
```cmd
cd C:\Users\kalya\Downloads\HRMS\HRMS
mvnw.cmd spring-boot:run
```

**Option B - Using IntelliJ IDEA:**
1. Open the project folder in IntelliJ
2. Wait for Maven to download dependencies (first time only)
3. Find `HrmsApplication.java` in `src/main/java/com/originhubs/HRMS/`
4. Click the green ▶️ button next to the class name
5. Wait for "Started HrmsApplication" message in console

### Step 3: Access the System (30 seconds)

1. **Open your browser:** http://localhost:8080

2. **Login with default credentials:**
   - **Admin Access**: 
     - Username: `admin`
     - Password: `admin123`
   
   - **HR Access**: 
     - Username: `hr`
     - Password: `hr123`
   
   - **Employee Access**: 
     - Username: `employee`
     - Password: `emp123`

### Step 4: Test the Features (1 minute)

#### As Admin/HR User:

1. **Add an Employee:**
   - Click "Add New Employee" on dashboard
   - Fill in required fields (marked with *)
   - Click "Save Employee"
   - Note the auto-generated Employee ID and work email

2. **Create a Project:**
   - Navigate to Projects → Add Project
   - Fill in project details
   - Assign an employee
   - Save

3. **Upload Documents:**
   - Go to Employee View
   - Click "Upload Document"
   - Select document type and file
   - Upload

4. **Initiate Offboarding:**
   - Navigate to Offboarding → Initiate
   - Select employee
   - Fill exit details
   - Save

## 📊 What You'll See

### Dashboard (After Login)
- Total Employees count
- Active Employees count
- Onboarding count
- Active Projects count
- Quick action buttons

### Main Modules
- **Employees** - Full CRUD with document management
- **Projects** - Project tracking with assignments
- **Offboarding** - Exit workflow automation

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database `hrms_db` is created
- [ ] Application starts without errors
- [ ] Can access http://localhost:8080
- [ ] Can login with admin credentials
- [ ] Dashboard displays correctly
- [ ] Can add an employee
- [ ] Can create a project
- [ ] File uploads work

## 🔧 Common Issues & Solutions

### Issue 1: "Connection refused to PostgreSQL"
**Solution:**
- Check PostgreSQL is running
- Verify port 5432 is open
- Check credentials in `application.properties`

### Issue 2: "Port 8080 already in use"
**Solution:**
```properties
# Edit application.properties and change:
server.port=8081
# Then access: http://localhost:8081
```

### Issue 3: "Cannot upload files"
**Solution:**
- Application auto-creates `./uploads` folder
- Check write permissions
- Or manually create: `C:\Users\kalya\Downloads\HRMS\HRMS\uploads`

### Issue 4: Maven dependencies not downloading
**Solution:**
```cmd
mvnw.cmd clean install -U
```

## 📱 Key Features to Test

### Employee Management
✅ Auto-generated Employee IDs (EMP00001, EMP00002, etc.)
✅ Auto-generated work emails (firstname.lastname@originhubs.com)
✅ Document upload (Offer Letter, Passport, Visa, etc.)
✅ Status tracking (Onboarding → Active → Offboarding → Terminated)
✅ Search functionality

### Project Management
✅ Client and Vendor information
✅ Financial tracking (pay rates)
✅ Employee assignment
✅ Timeline management
✅ Document management (MSA, SOW, NDA)

### Offboarding
✅ Exit workflow
✅ IT access revocation
✅ Financial settlement
✅ Asset tracking
✅ Document generation status

## 🎯 Next Steps

1. **Explore all modules** as different user roles
2. **Add sample data** (5-10 employees, 2-3 projects)
3. **Test document uploads** with different file types
4. **Try the search** functionality
5. **Initiate an offboarding** process

## 📞 Need Help?

Check these in order:
1. Console logs for error messages
2. README.md for detailed documentation
3. Verify database connection
4. Check application.properties settings

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Login page loads without errors
- ✅ Dashboard shows statistics
- ✅ Can navigate between modules
- ✅ Can create employees and projects
- ✅ Documents can be uploaded
- ✅ No console errors

---

**Estimated Setup Time**: 5-10 minutes (first time)  
**Estimated Testing Time**: 10-15 minutes

Happy Testing! 🚀

