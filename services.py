from database import get_connection
import traceback


def roll_exists(class_name, roll_number):
    conn=get_connection()
    cursor=conn.cursor()
    cursor.execute("SELECT * FROM enrollments WHERE class_name = ? AND roll_number = ? AND status = ?", (class_name, roll_number, "active"))

    row= cursor.fetchone()
    conn.close()
    return row is not None

def get_enroll_id(class_name, roll_number):
    conn=get_connection()
    cursor=conn.cursor()
    id=cursor.execute("SELECT id FROM enrollments WHERE class_name = ? AND roll_number = ? ", (class_name, roll_number)).fetchone()
    conn.close

    enrollment_id=id[0]
    return enrollment_id

def month(data, enroll_id):
    conn=get_connection()
    cursor=conn.cursor()
    enroll_id_value=f"{enroll_id}"
    last_data=cursor.execute("SELECT month, dues FROM fee_records WHERE enrollment_id =? ORDER BY id DESC LIMIT 1", (enroll_id_value)).fetchone()
    return dict(last_data)
    
def add_enrollments(data, id):

    conn=get_connection()
    cursor=conn.cursor()

    cursor.execute("""
        INSERT INTO enrollments (student_id, class_name, section, roll_number, total_fee, status, session_year)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
        id,
        data.get("class_name"),
        data.get("section"),
        data.get("roll_number"),
        data.get("total_fee"),
        "active",
        data.get("session")
        ))

    conn.commit()
    conn.close()

    return True

    




def add_student(data):


    if roll_exists(data.get("class_name"), data.get("roll_number")):
        return {"success": False, "message": "Roll already exists"}, 400
    else:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO students_record (full_name, father_name, dob, gender)
        VALUES (?, ?, ?, ?)
        """, (
        data["name"],
        data.get("father"),
        data["dob"],
        data.get("gender"),
        ))

        conn.commit()
        conn.close()

        id=cursor.lastrowid

        enrollments_details_add= add_enrollments(data, id)

        traceback.print_stack(limit=5)
        return {"success": True, "message": "Roll Doesnt exists"}, 200
  


def get_students(class_name):


    conn = get_connection()
    cursor = conn.cursor()
    students_data= cursor.execute("""
    SELECT
    sr.full_name,
    sr.father_name,
    sr.dob,
    sr.gender,
    e.section,
    e.roll_number,
    e.class_name
    FROM enrollments e
    INNER JOIN students_record sr
    ON e.student_id = sr.id
    WHERE e.class_name = ?""", (class_name,)).fetchall()
    conn.close()
    return [dict(row) for row in students_data]

def get_student(class_name, roll_number):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students_record WHERE class_name = ? AND roll_number = ?", (class_name, roll_number))
    rows = cursor.fetchall()

    conn.close()
    return [dict(row) for row in rows]


def delete_student(class_name, roll_number):
    conn=get_connection()
    cursor=conn.cursor()
    cursor.execute( "DELETE FROM students_record WHERE class_name = ? AND roll_number =?", (class_name, roll_number) )

    affected_rows=cursor.rowcount

    conn.commit()
    conn.close()

    return affected_rows > 0



def update_student(class_name, roll_number, data):

    FIELD_MAP = {
        "name": "name",
        "class_name": "class_name",
        "section": "section",
        "father": "father",
        "phone": "parent_contact"
    }

    conn = get_connection()
    cursor = conn.cursor()

    # existence check
    cursor.execute(
        "SELECT 1 FROM students_record WHERE class_name = ? AND roll_number = ?",
        (class_name, roll_number)
    )

    if cursor.fetchone() is None:
        conn.close()
        return {"error": "Student not found"}

    fields = []
    values = []

    for key, value in data.items():
        if key in FIELD_MAP:
            fields.append(f"{FIELD_MAP[key]} = ?")
            values.append(value)

    if not fields:
        conn.close()
        return {"error": "No valid fields to update"}

    values.extend([class_name, roll_number])

    query = f"""
        UPDATE students_record
        SET {', '.join(fields)}
        WHERE class_name = ? AND roll_number = ?
    """

    cursor.execute(query, tuple(values))
    conn.commit()
    conn.close()

    return {"success": "Student updated"}

# fee management functions 


def get_due(data, id):

    class_name= data.get("class_name")
    roll_number = data.get("roll_number")
    month =data.get("month")
    conn=get_connection()
    cursor=conn.cursor()
    
    total_fee=cursor.execute("SELECT total_fee FROM enrollments WHERE class_name = ? AND roll_number= ?", (class_name, roll_number)).fetchone()
    enrollment_id=cursor.execute("SELECT id FROM enrollments WHERE class_name = ? AND roll_number= ?", (class_name, roll_number)).fetchone()
    enrollment_id_value=enrollment_id[0]
    paid_fee = cursor.execute("SELECT SUM(amount) FROM fee_records WHERE enrollment_id= ? AND month =?", (enrollment_id_value, month,)).fetchone()
    
    if paid_fee[0]==None:
        paid_fee=0
        dues=total_fee[0]-paid_fee
      
        cursor.execute("""
            UPDATE fee_records SET dues = ? WHERE id = ?
            """, (dues,id))
        conn.commit()
        conn.close()
        return dues
    else:
        dues=total_fee[0]-paid_fee[0]
        
        cursor.execute("""
            UPDATE fee_records SET dues = ? WHERE id = ?
                       """, (dues,id))
        conn.commit()
        conn.close()
        return dues




def add_fee(data):

    exist = roll_exists(data.get("class_name"), data.get("roll_number"))
    if exist == False:
        return False
    else:
        conn = get_connection()
        cursor = conn.cursor()
        enroll_id= get_enroll_id(data.get("class_name"), data.get("roll_number"))
        
        month_check= cursor.execute("""SELECT SUM(amount) FROM fee_records WHERE enrollment_id = ? AND month =?""", (enroll_id, data.get("month"))).fetchone()
        if month_check[0] is None:
            last_due= month(data, enroll_id)
            total_fee=cursor.execute("SELECT total_fee FROM enrollments WHERE class_name = ? AND roll_number= ?", (data.get("class_name"), data.get("roll_number"))).fetchone()
            current_due=int(last_due["dues"])+int(total_fee[0])
            dues_with_payment=current_due- int(data.get("amount"))
            method="cash"
            cursor.execute("""
                INSERT INTO fee_records (enrollment_id,  amount, month, paid_on, method, dues)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
            enroll_id,
            data.get("amount"),
            data["month"],
            data.get("paid_on"),
            method,
            dues_with_payment
            ))
            conn.commit()
            conn.close()
        else:
        
            method="cash"
            cursor.execute("""
                INSERT INTO fee_records (enrollment_id,  amount, month, paid_on, method)
                VALUES (?, ?, ?, ?, ?)
            """, (
            enroll_id,
            data.get("amount"),
            data["month"],
            data.get("paid_on"),
            method
            ))
        
            id=cursor.lastrowid
        
            conn.commit()
            conn.close()
            get_due(data, id)
        
        
        return "okay", 200
    # ---------------------------------

    
if __name__=="__main__":
    data = {'class_name': '10'}
    enroll_id="1"
    result= get_students(data)
    print(result)


