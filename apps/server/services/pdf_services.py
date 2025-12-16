import pymupdf  # PyMuPDF
import os

class PDFService:
    @staticmethod
    def merge_pdfs(file_paths, output_path):
        """Merges multiple PDFs into one."""
        merged_doc = pymupdf.open()
        for path in file_paths:
            with pymupdf.open(path) as doc:
                merged_doc.insert_pdf(doc)
        merged_doc.save(output_path)
        merged_doc.close()
        return output_path

    @staticmethod
    def rotate_pdf(input_path, output_path, angle=90):
        """Rotates all pages in a PDF by a given angle."""
        doc = pymupdf.open(input_path)
        for page in doc:
            page.set_rotation(page.rotation + angle)
        doc.save(output_path)
        doc.close()
        return output_path
