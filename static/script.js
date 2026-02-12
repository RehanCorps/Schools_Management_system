const select = document.getElementById("status");
select.addEventListener("change", () => {
    concole.log("Selected:", select.value)
})


// Data storage

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    event.target.classList.add('active');

    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'performance') updatePerformanceCharts();
}



// -----------------------------------
// Add students
// -----------------------------------
function addStudent() {
    event.preventDefault()
    const student = {
        name: document.getElementById("studentName").value.trim(),
        dob: document.getElementById("studentDOB").value,
        gender: document.getElementById("studentGender").value,
        class_name: document.getElementById("addstudentclass").value,
        section: document.getElementById("section").value.trim(),
        roll_number: document.getElementById("rollNumber").value.trim(),
        father: document.getElementById("fatherName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        total_fee: document.getElementById("totalFee").value.trim(),
        session: document.getElementById("session").value.trim()
    };

    if (!student.name || !student.class_name || !student.section || !student.roll_number) {
        showToast("Please fill in the fields", "error");
        return;
    }

    const webhookUrl = "http://127.0.0.1:5000/students";

    fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
    })
        .then(response => {
            if (response.ok) {
                showToast("Student added successfully!");

                document.getElementById("studentName").value = "";
                document.getElementById("studentDOB").value = "";
                document.getElementById("addstudentclass").value = "Select class";
                document.getElementById("section").value = "";
                document.getElementById("rollNumber").value = "";
                document.getElementById("fatherName").value = "";
                document.getElementById("phone").value = "";
                document.getElementById("totalFee").value = "";
                document.getElementById("session").value = "";
                document.getElementById("studentGender").value = "male";

            } else {
                showToast("Student already exists", "error");
            }
        })
        .catch(() => {
            showToast("Server error", "error");
        });

}



// -----------------------------------
// Delete student 
// -----------------------------------

var pendingDeleteData = null;

function openConfirm() {
    const class_name = document.getElementById("deletestudentclass").value;
    const section = document.getElementById("Section").value.trim();
    const roll_number = document.getElementById("Rollnumber").value.trim();


    if (!class_name || !roll_number || !section) {
        showToast("Fill all fields first", "error");
        return;
    }



    pendingDeleteData = { "class": class_name, "rollnumber": roll_number };
    document.getElementById("confirmModal").classList.add("show");
}

function closeConfirm() {
    document.getElementById("confirmModal").classList.remove("show");
    pendingDeleteData = null;
}

function confirmDelete() {
    if (!pendingDeleteData) return;

    const webhookUrl = `http://127.0.0.1:5000/students/${pendingDeleteData.class}/${pendingDeleteData.rollnumber}`;
    ;

    fetch(webhookUrl, {
        method: "DELETE",
    })
        .then(res => {
            if (res.ok) {
                showToast("Student deleted successfully");
                document.getElementById("deletestudentclass").value = "";
                document.getElementById("Section").value = "";
                document.getElementById("Rollnumber").value = "";
            } else {
                showToast("Student not found", "error");
            }
        })
        .catch(() => showToast("Server error", "error"))
        .finally(closeConfirm);

    document.getElementById("canceldeleteBtn").style.display = "none";
    document.getElementById("deletestudentscard").style.border = "none";


}

// -----------------------------------
// Render students 
// -----------------------------------

let editingStudentId = null;


async function fetchStudents() {
    const class_name = document.getElementById("classfetchfilter").value.trim();
    const roll_number = document.getElementById("rollfetchfilter").value.trim();

    if (roll_number === "") {
        url = `http://127.0.0.1:5000/students/${class_name}`
    }
    else {
        url = `http://127.0.0.1:5000/student/${class_name}/${roll_number}`
    }

    try {
        const res = await fetch(url, { method: "GET" });

        console.log("HTTP status:", res.status);

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        console.log("Raw response data:", data);

        if (!Array.isArray(data)) {
            throw new Error("Expected an array but received something else");
        }

        window.students = data;
        students.forEach((s, index) => {
    console.log(`Student ${index}:`, JSON.stringify(s, null, 2));
});
        renderStudents();

    } catch (err) {
        console.error("Fetch/render error:", err);
        showToast("Unable to retrieve data", "error");
    }

}




function renderStudents() {
    
    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    if (!students || students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">No students found</td></tr>`;
        return;
    }
    students.forEach((s, index) => {
        const row = document.createElement("tr");
                
    row.innerHTML = `
    <td>${s.full_name }</td>
    <td>${s.class_name }</td>
    <td>${s.section }</td>
    <td>${s.roll_number}</td>
    <td>${s.gender.toUpperCase()}</td>
    <td>${s.father_name}</td>
   
         <td>
           <button type="button" class="btn btn-primary" onclick="startUpdate(${index})">Edit</button>
           <button type="button" class="btn btn-primary" style="background: red;" onclick="delete_students(${index})">Delete</button>
           </td>
    `;
    tbody.appendChild(row);
});

}


// ------------------------------
// delete student from list
// ------------------------------ 


function delete_students(index) {

    deletingIndex = index;
    const s = students[index];

    document.getElementById("deletestudentclass").value = s.class_name;
    document.getElementById("Section").value = s.section;
    document.getElementById("Rollnumber").value = s.roll_number;

    document.getElementById("canceldeleteBtn").style.display = "inline-block";
    document.getElementById("deletestudentscard").style.border = "3px solid green";

    document.getElementById("deletestudentscard").scrollIntoView({
        behavior: "smooth"
    });
}


// =----------------------------------
// Update students 
// -----------------------------------




// updating start button ---------
function startUpdate(index) { 
    
    editingIndex = index;
    const s = students[index];
    

    document.getElementById("studentName").value = s.full_name;
    document.getElementById("section").value = s.section;
    document.getElementById("fatherName").value = s.father_name;
    document.getElementById("studentDOB").value = s.dob;
    document.getElementById("session").value=s.total_fee;


    document.getElementById("addstudentclass").style.display= "none";
    document.getElementById("rollNumber").style.display = "none";
    document.getElementById("classheading").style.display = "none";
    document.getElementById("rollheading").style.display = "none";

    document.getElementById("addBtn").style.display = "none";
    document.getElementById("addlabel").style.display = "none";
    document.getElementById("updateBtn").style.display = "inline-block";
    document.getElementById("cancelBtn").style.display = "inline-block";
    document.getElementById("updatelabel").style.display = "inline-block";
    document.getElementById("studentForm").style.border = "3px solid green";


    document.getElementById("studentForm").scrollIntoView({
        behavior: "smooth"
    });
}

// main Update func ---------

function updateStudent() {
    if (editingIndex === null) return;

    const original = students[editingIndex];

    const updated = {
        name: document.getElementById("studentName").value.trim(),
        class_name: document.getElementById("addstudentclass").value,
        section: document.getElementById("section").value.trim(),
        roll_number: document.getElementById("rollNumber").value.trim(),
        father: document.getElementById("fatherName").value.trim(),
        phone: document.getElementById("phone").value.trim()
    };

    const url = `http://127.0.0.1:5000/students/${original.class_name}/${original.roll_number}`;

    fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    })
        .then(res => {
            if (res.status === 404) {
                showToast("Student not found", "error");
                return null;
            }
            if (!res.ok) {
                showToast("Invalid update", "error");
                return null;
            }
            return res.text(); // ← safe even if empty
        })
        .then(data => {
            if (data === null) return;

            showToast("Student updated");
            resetFormState();
            // fetchStudents();
        })
        .catch(err => {
            console.error(err);
            showToast("Server error", "error");
        });
}

function resetFormState() {
    editingIndex = null;

    document.getElementById("studentName").value = "";
    document.getElementById("addstudentclass").value = "";
    document.getElementById("section").value = "";
    document.getElementById("rollNumber").value = "";
    document.getElementById("fatherName").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("studentDOB").value = "";


    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("cancelBtn").style.display = "none";
    document.getElementById("updatelabel").style.display = "none";
    document.getElementById("studentForm").style.border = "none";
    document.getElementById("addBtn").style.display = "inline-block";
    document.getElementById("addlabel").style.display = "inline-block";
    document.getElementById("addstudentclass").style.display= "inline-block";
    document.getElementById("rollNumber").style.display = "inline-block";
    document.getElementById("classheading").style.display = "inline-block";
    document.getElementById("rollheading").style.display = "inline-block";

}


// cancel button func-------

function cancelUpdate() {

    editingIndex = null;

    document.getElementById("studentName").value = "";
    document.getElementById("addstudentclass").value = "";
    document.getElementById("section").value = "";
    document.getElementById("rollNumber").value = "";
    document.getElementById("fatherName").value = "";
    document.getElementById("phone").value = "";

    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("cancelBtn").style.display = "none";
    document.getElementById("updatelabel").style.display = "none";
    document.getElementById("addBtn").style.display = "inline-block";
    document.getElementById("addlabel").style.display = "inline-block";
    document.getElementById("studentForm").style.border = "none";
    document.getElementById("addstudentclass").style.display= "inline-block";
    document.getElementById("rollNumber").style.display = "inline-block";
    document.getElementById("classheading").style.display = "inline-block";
    document.getElementById("rollheading").style.display = "inline-block";




    showToast("Update cancelled", "notify");
}

function canceldelete() {

    editingIndex = null;

    document.getElementById("deletestudentclass").value = "";
    document.getElementById("Section").value = "";
    document.getElementById("Rollnumber").value = "";

    document.getElementById("canceldeleteBtn").style.display = "none";
    document.getElementById("deletestudentscard").style.border = "none";


    showToast("Delete cancelled", "notify");
}


// ----------------------------------------
// Fee submission
// ----------------------------------------


function addfee() {
    const data = {
        class_name: document.getElementById("classforfee").value,
        section: document.getElementById("Sectionforfee").value,
        roll_number: document.getElementById("Rollnumberforfee").value,
        paid_on: document.getElementById("feedate").value,
        month: document.getElementById('feemonth').value,
        amount: document.getElementById('amount').value,
    };

    if (!data.name || !data.roll_number || !data.class_name || !data.section || !data.paid_on || !data.month || !data.amount) {
        showToast("Fill the fields first", "notify")
        return;
    }

    fetch("http://127.0.0.1:5000/add-fee-payment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

        .then(res => {
            if (res.status === 404) {
                showToast("Student not found", "error");
                return null;
            }
            if (!res.ok) {
                showToast("database error", "error");
                return null;
            }
            return res.text(); // ← safe even if empty
        })
        .then(data => {
            if (data === null) return;
            showToast("Record Added successfully");
            reset_fee_form();
            // fetchfeedetails(data)
        })
        .catch(err => {
            console.error(err);
            showToast("Server error", "error");
        });
}

function reset_fee_form() {
    document.getElementById("studentNameforfee").value = "";
    document.getElementById("classforfee").value = "";
    document.getElementById("Sectionforfee").value = "";
    document.getElementById("Rollnumberforfee").value = "";
    document.getElementById("feedate").value = "";
    document.getElementById("feemonth").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("paymentmethod").value = "";
}


let feedetails = [];


async function fetchfeedetails(data) {
    const class_name = data.get("class_name");
    const roll_number = data.get("roll_number");
    const month = data.get("month")

    // if (roll_number === "") {
    //     url = `http://127.0.0.1:5000/students/${class_name}`
    // }
    // else {
    //     url = `http://127.0.0.1:5000/student/${class_name}/${roll_number}`
    // }

    // try {
    //     const res = await fetch(
    //         url, {
    //         method: "GET",
    //     }
    //     );

    //     students = await res.json();
    //     renderStudents();

    // } catch (err) {
    //     showToast("Unable to retrieve data", "error");
    // }
}




function renderStudentsforfee() {
    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    if (!students || students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No students found</td></tr>`;
        return;
    }

    students.forEach((s, index) => {
        const row = document.createElement("tr");
        const student_id = '${s.class_name}-${s.roll_number}';

        row.innerHTML = `<td>${s.name}</td>
                <td>${s.class_name}</td>
                <td>${s.section}</td>
            <td>${s["roll_number"]}</td>
            <td>${s["father"]}</td>
            <td>${s.parent_contact}</td>
            <td>
           <button type="button" class="btn btn-primary" onclick="startUpdate(${index})">Edit</button>
           <button type="button" class="btn btn-primary" style="background: red;" onclick="delete_students(${index})">Delete</button>
           </td>
            `;

        tbody.appendChild(row);
    });

}




// Dashboard functions
// function updateDashboard() {
//             document.getElementById('totalStudents').textContent = students.length;
//             document.getElementById('totalTeachers').textContent = teachers.length;
//             const totalFees = students.filter(s => s.feeStatus === 'Paid').reduce((acc, s) => acc + s.amount, 0);
//             document.getElementById('totalFees').textContent = '$' + totalFees;

//             updateFeeChart();
//         }

//         function updateFeeChart() {
//             const paid = students.filter(s => s.feeStatus === 'Paid').length;
//             const pending = students.filter(s => s.feeStatus === 'Pending').length;
//             const overdue = students.filter(s => s.feeStatus === 'Overdue').length;

//             if (feeChart) feeChart.destroy();

//             const ctx = document.getElementById('feeChart').getContext('2d');
//             feeChart = new Chart(ctx, {
//                 type: 'pie',
//                 data: {
//                     labels: ['Paid', 'Pending', 'Overdue'],
//                     datasets: [{
//                         data: [paid, pending, overdue],
//                         backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false
//                 }
//             });
//         }

//         function updatePerformanceCharts() {
//             // Performance bar chart
//             if (performanceChart) performanceChart.destroy();
//             const ctx1 = document.getElementById('performanceChart').getContext('2d');
//             performanceChart = new Chart(ctx1, {
//                 type: 'bar',
//                 data: {
//                     labels: performanceData.map(p => p.class),
//                     datasets: [{
//                         label: 'Average Score',
//                         data: performanceData.map(p => p.avgScore),
//                         backgroundColor: '#3b82f6'
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     scales: {
//                         y: {
//                             beginAtZero: true,
//                             max: 100
//                         }
//                     }
//                 }
//             });

//             // Student count line chart
//             if (studentCountChart) studentCountChart.destroy();
//             const ctx2 = document.getElementById('studentCountChart').getContext('2d');
//             studentCountChart = new Chart(ctx2, {
//                 type: 'line',
//                 data: {
//                     labels: performanceData.map(p => p.class),
//                     datasets: [{
//                         label: 'Students',
//                         data: performanceData.map(p => p.students),
//                         borderColor: '#10b981',
//                         tension: 0.4
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false
//                 }
//             });

//             renderPerformanceTable();
//         }



// ------------------------------
//    Toast message
// ------------------------------
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;

    toast.className = "toast show";
    if (type === "error") toast.classList.add("error");
    if (type === "notify") toast.classList.add("notify");

    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}


//         // Initialize
//         // renderStudentTable();
//         // renderFeeTable();
//         // renderTeacherTable();
//         // renderPerformanceTable();
//         // renderEvents();
//         // renderSchedules();
//         // updateDashboard();