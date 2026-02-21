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
        gender: document.getElementById("studentGender").value.trim(),
        roll_number: document.getElementById("rollNumber").value.trim(),
        father: document.getElementById("fatherName").value.trim(),
        total_fee: document.getElementById("totalFee").value.trim()
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
    const feedata = {
        class_name: document.getElementById("classforfee").value,
        section: document.getElementById("Sectionforfee").value,
        roll_number: document.getElementById("Rollnumberforfee").value,
        paid_on: document.getElementById("feedate").value,
        month: document.getElementById('feemonth').value,
        amount: document.getElementById('amount').value,
        method: document.getElementById('paymentmethod').value,
        dues: document.getElementById('Dues').value,
    };

    if ( !feedata.roll_number || !feedata.class_name || !feedata.section || !feedata.paid_on || !feedata.month || !feedata.amount || !feedata.dues) {
        showToast("Fill the fields first", "notify")
        return;
    }

    fetch("http://127.0.0.1:5000/add-fee-payment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(feedata)
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
            return res.text(); 
        })
        .then(data => {
            if (data === null) return;
            showToast("Record Added successfully");
            reset_fee_form();
            fetchfeedetails(feedata)
        })
        .catch(err => {
            console.error(err);
            showToast("Server error", "error");
        });
}

function reset_fee_form() {
    document.getElementById("classforfee").value = "";
    document.getElementById("Sectionforfee").value = "";
    document.getElementById("Rollnumberforfee").value = "";
    document.getElementById("feedate").value = "";
    document.getElementById("feemonth").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("Dues").value = "";
    document.getElementById("paymentmethod").value = "";
}


let feedetails = [];

async function fetchfeedetails(feedata) {

   const data=feedata

    try {
        const url = "http://127.0.0.1:5000/feedetails"; 
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("HTTP status:", res.status);

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const responseData = await res.json();
        console.log("Fee details response:", responseData);

        renderStudentsforfee(responseData);

    } catch (err) {
        console.error("Error fetching fee details:", err);
        showToast("Unable to fetch fee details", "error");
    }
}

function renderStudentsforfee(responseData) {
    document.getElementById("showfeetable").style.display = "block";
    const tbody = document.querySelector("#showfeetable tbody");
    tbody.innerHTML = "";

    if (!responseData || responseData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No records found</td></tr>`;
        return;
    }

    responseData.reverse().forEach((s) => {
        const row = document.createElement("tr");

        row.innerHTML = `<td>${s.full_name}</td>
        <td>${s.class_name}</td>
        <td>${s.roll_number}</td>
        <td>${s.month.toUpperCase()}</td>
                <td style="color:green; font-weight:600;">Rs. ${s.amount}</td>
                <td>${s.paid_on}</td>
            <td style="color:#ff392bff; font-weight:300; border-radius:30px; ">Rs. ${s.dues}</td>
            `;

        tbody.appendChild(row);
    });

    const firstrow=tbody.querySelector("tr:first-child");
    if (firstrow) {
        const duescell=firstrow.querySelector("td:nth-child(7)");
        const originalContent=duescell.textContent;
      duescell.innerHTML=`
      <span style='color:red; font-weight:600'>${originalContent}</span>
      <span style='color: black;font-weight:100'>( Current )</span>
      `;
      
}
}



// General rendering 


async function fetchstudentsfee() {
    const class_name=document.getElementById("feeclassfilter").value.trim()
    const roll_number = document.getElementById("feerollfilter").value
    const month = document.getElementById("feemonthfilter").value.trim()
    
    let payload={};

    if (class_name) payload.class_name=class_name;
    if (roll_number) payload.roll_number=roll_number;
    if (month) payload.month=month;


   try {
        const url = "http://127.0.0.1:5000/allfeedetails"; 
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        console.log("HTTP status:", res.status);

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const responseData = await res.json();
        console.log("Fee details response:", responseData);

        handle_response(responseData);

       

    } catch (err) {
        console.error("Error fetching fee details:", err);
        showToast("Unable to fetch fee details", "error");
    }
}

// handle response function 

function handle_response(responseData){

    if (responseData.mode=='student_mode' ){
        renderstudentview(responseData)
    }
    if (responseData.mode=='general_mode'){
        generalrenderforfee(responseData)
    }
    else{
        generalrenderforfee(responseData)
    }
}

// General render  

function generalrenderforfee(responseData) {
    const table = document.getElementById("generalfeeTable");
    table.innerHTML = ""; // reset

    if (!responseData || responseData.length === 0) {
        table.innerHTML = "<tr><td>No data found</td></tr>";
        return;
    }

    // Extract dynamic columns
    const columns = [];
    for (const key in responseData[0]){
        if(responseData[0].hasOwnProperty(key))
            columns.push(key);
    }



    // Create header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column.replace(/_/g, "").toUpperCase();
        headerRow.appendChild(th);
    });

    const statusHeader= document.createElement("th");
    statusHeader.textContent= "Status";
    headerRow.appendChild(statusHeader)

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement("tbody");
    

    responseData.forEach(row => {
        const tr = document.createElement("tr");


        const statusCell= document.createElement("td");

        const badge = document.createElement("span");
            let status;
            if (row.amount==0){
                status="Due";
            }

            else if (row.dues==0){
                status="Paid";
            }
            else{
                status="Partial";
            }
                
            
            badge.classList.add("status-badge");

            if (status==="Paid"){
                badge.classList.add("status-paid")
            }
            else if (status==="Due"){
                badge.classList.add("status-due")
            }
            else{
                badge.classList.add("status-partial")
            }
            
            badge.textContent=status;
            statusCell.appendChild(badge)


            columns.forEach(column => {
                
            const td = document.createElement("td");
            responseData.forEach(row=>{
                const tr= document.createElement("tr");
                let cellValue=row[column]??"";
                if(column=="month"){
                    cellValue=cellValue.toUpperCase();
                }
                if (column==="dues" && parseFloat(cellValue)>0){
                    td.style.color="red";
                    td.style.fontWeight="bold";
                }
                if(column==="amount"){
                    td.style.textAlign="left";
                    td.style.color="green";
                    td.style.fontWeight="bold";
                }
                
            })
            
            td.textContent = row[column] ?? "";
            
            tr.appendChild(td);
            tr.appendChild(statusCell);

        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
}

// Student render 




//     responseData.reverse().forEach((s) => {
//         const row = document.createElement("tr");

//         row.innerHTML = `<td>${s.roll_number}</td>
//         <td>${s.class_name}</td>
//         <td>${s.roll_number}</td>
//         <td>${s.month.toUpperCase()}</td>
//                 <td style="color:green; font-weight:600;">Rs. ${s.total_fee}</td>
//                 <td>${s.dues}</td>
//             <td style="color:#ff392bff; font-weight:300; border-radius:30px; ">Rs. ${s.dues}</td>
//             `;

//         tbody.appendChild(row);
//     });

//     const firstrow=tbody.querySelector("tr:first-child");
//     if (firstrow) {
//         const duescell=firstrow.querySelector("td:nth-child(7)");
//         const originalContent=duescell.textContent;
//       duescell.innerHTML=`
//       <span style='color:red; font-weight:600'>${originalContent}</span>
//       <span style='color: black;font-weight:100'>( Current )</span>
//       `;
      
// }
// }


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
//                         backgroundColor: ['#ff392bff', '#f59e0b', '#ef4444']
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