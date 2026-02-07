def get_enroll_id(class_name, roll_number):
    conn=get_connection()
    cursor=conn.cursor()
    enrollment_id=cursor.execute("SELECT id FROM enrollments WHERE class_name = ? AND roll_number = ? ", ("10", "123")).fetchone()
    conn.close
    print(enrollment_id)