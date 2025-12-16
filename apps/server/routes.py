from flask import Blueprint, request, send_file, jsonify
from services.pdf_services import PDFService
import os
import uuid

pdf_bp = Blueprint('pdf', __name__)
UPLOAD_FOLDER = 'app/uploads'


@pdf_bp.route('/rotate', methods=['POST'])
def rotate():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    angle = int(request.form.get('angle', 90))

    # Save temp file
    temp_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_FOLDER, f"{temp_id}_in.pdf")
    output_path = os.path.join(UPLOAD_FOLDER, f"{temp_id}_out.pdf")
    file.save(input_path)

    # Process
    PDFService.rotate_pdf(input_path, output_path, angle)

    return send_file(os.path.abspath(output_path), as_attachment=True)


@pdf_bp.route('/merge', methods=['POST'])
def merge():
    files = request.files.getlist('files')
    if len(files) < 2:
        return jsonify({"error": "At least two files required"}), 400

    temp_paths = []
    temp_id = str(uuid.uuid4())

    for i, file in enumerate(files):
        path = os.path.join(UPLOAD_FOLDER, f"{temp_id}_{i}.pdf")
        file.save(path)
        temp_paths.append(path)

    output_path = os.path.join(UPLOAD_FOLDER, f"{temp_id}_merged.pdf")
    PDFService.merge_pdfs(temp_paths, output_path)

    return send_file(os.path.abspath(output_path), as_attachment=True)
