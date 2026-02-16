from database import get_connection
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import traceback
from services import add_student, get_students, get_student, update_student, delete_student,  fee_details,  fee_report, add_fee_basic
app = Flask(__name__)

CORS(app)




# add student func
@app.route('/students', methods=['POST'])
def create_student():
    data = request.json

    response, status_code = add_student(data)

    return jsonify(response), status_code


# get student func 
@app.route('/students/<class_name>', methods=['GET'])
def read_students(class_name):
    students_details = get_students(class_name)
    return jsonify(students_details), 200

@app.route('/student/<class_name>/<roll_number>', methods=['GET'])
def read_student(class_name, roll_number):
    students = get_student(class_name, roll_number)
    return jsonify(students), 200




# update student func 

@app.route('/students/<class_name>/<roll_number>', methods=['PUT'])
def modify_student(class_name, roll_number):
    
    data = request.get_json()

    result = update_student(class_name, roll_number, data)

    if "error" in result:
        if result["error"] == "Student not found":
            return jsonify(result), 404
        else:
            return jsonify(result), 400

    return jsonify({"success": "Student updated"}), 200

   



# delete student func 
@app.route('/students/<class_name>/<roll_number>', methods=['DELETE'])
def remove_student(class_name, roll_number):
    success = delete_student(class_name, roll_number)

    if not success:
        return jsonify({"error": "Student not found"}), 404
    return jsonify({"status": "success"}), 200


# ------------------------------
# fee management

@app.route('/add-fee-payment', methods=['POST'])
def showdata():
    data=request.get_json()
    response= add_fee_basic(data)
    
    if not response  :
        return jsonify({"error": "Student not found"}), 404
    else:
        return jsonify({"status": "success"}), 200  
    
# render fee details function

@app.route('/feedetails', methods=['POST'])
def fetch_fee_details():
    data=request.json
    response=fee_details(data)
    traceback.print_exc()
    if not response:
        return jsonify({"error": "Student not found"}), 404
    else:
        return jsonify(response), 200




@app.route('/allfeedetails', methods=['POST'])
def student_total_fee_details():
    data=request.json
    response=fee_report(data)
    if response==[]:
        return []
    elif response==None:
        return jsonify({"error": "error"}), 404

    else:
        return jsonify(response), 200  



@app.route('/')
def render_page():
    return render_template("index.html")


if __name__=="__main__":
    app.run(port=5000, debug=True)
