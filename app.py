from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from services import add_student, get_students, get_student, update_student, delete_student
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
    students = get_students(class_name)
    return jsonify(students), 200

@app.route('/student/<class_name>/<roll_number>', methods=['GET'])
def read_student(class_name, roll_number):
    students = get_student(class_name, roll_number)
    return jsonify(students), 200



# update student func 
from flask import jsonify, request

@app.route('/students/<class_name>/<roll_number>', methods=['PUT'])
def modify_student(class_name, roll_number):
    
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

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



@app.route('/')
def render_page():
    return render_template("index(2).html")


if __name__=="__main__":
    app.run(port=5000, debug=True)
