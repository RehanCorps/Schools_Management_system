from database import get_connection


def roll_exists(class_name, roll_number):
    conn=get_connection()
    cursor=conn.cursor()
    cursor.execute("SELECT 1 FROM students_record WHERE class_name = ? AND roll_number = ? ", (class_name, roll_number))

    row= cursor.fetchone()
    conn.close()
    print("FOUND ROW:", row)
    return row is not None

    
import traceback
def add_student(data):

    print("CHECKING:", data.get("class_name"), data.get("roll_number"))


    if roll_exists(data.get("class_name"), data.get("roll_number")):
        return {"success": False, "message": "Roll already exists"}, 400
    else:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO students_record (name, class_name, section, father, parent_contact, roll_number)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
        data["name"],
        data.get("class_name"),
        data["section"],
        data.get("father"),
        data.get("phone"),
        data.get("roll_number")
        ))

        conn.commit()
        conn.close()
        traceback.print_stack(limit=5)
        return {"success": True, "message": "Roll Doesnt exists"}, 200
  


def get_students(class_name):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students_record WHERE class_name = ?", (class_name,))
    rows = cursor.fetchall()

    conn.close()
    return [dict(row) for row in rows]

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



