"""
LaTeX Compilation Service — compiles LaTeX to PDF using Tectonic.

Workflow:
1. Write LaTeX source to a temporary .tex file
2. Run `tectonic` CLI to compile to PDF
3. Upload the resulting PDF to Supabase Storage
4. Return the public URL

Prerequisites:
  - Tectonic must be installed: https://tectonic-typesetting.github.io/
  - A Supabase Storage bucket named 'resumes' must exist (public or with signed URLs)
"""
import subprocess
import tempfile
import os
import uuid
from pathlib import Path
from typing import Tuple, Optional

from app.services.supabase_service import get_admin_client


STORAGE_BUCKET = "resumes"


def compile_latex(latex_code: str) -> Tuple[bool, Optional[bytes], Optional[str]]:
    """
    Compile LaTeX source code to PDF using Tectonic.

    Returns:
        (success, pdf_bytes, error_message)
        - If success is True: pdf_bytes contains the PDF, error_message is None
        - If success is False: pdf_bytes is None, error_message describes the issue
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = Path(tmpdir) / "resume.tex"
        pdf_path = Path(tmpdir) / "resume.pdf"

        # Write LaTeX source
        tex_path.write_text(latex_code, encoding="utf-8")

        try:
            # Run Tectonic compiler
            result = subprocess.run(
                ["tectonic", str(tex_path), "--outdir", tmpdir],
                capture_output=True,
                text=True,
                timeout=60,  # 60 second timeout
                cwd=tmpdir,
            )

            if result.returncode != 0:
                # Extract meaningful error from Tectonic output
                error_msg = result.stderr or result.stdout or "Unknown compilation error"
                # Truncate very long error messages
                if len(error_msg) > 2000:
                    error_msg = error_msg[:2000] + "\n... (truncated)"
                return False, None, error_msg

            if not pdf_path.exists():
                return False, None, "Compilation succeeded but no PDF was generated."

            pdf_bytes = pdf_path.read_bytes()
            return True, pdf_bytes, None

        except subprocess.TimeoutExpired:
            return False, None, "Compilation timed out (60s limit). Check for infinite loops."
        except FileNotFoundError:
            return False, None, (
                "Tectonic is not installed. "
                "Install it from: https://tectonic-typesetting.github.io/"
            )


def upload_pdf_to_storage(
    pdf_bytes: bytes,
    user_id: str,
    resume_id: str,
) -> str:
    """
    Upload compiled PDF to Supabase Storage.

    File path in bucket: {user_id}/{resume_id}.pdf
    Returns the public URL of the uploaded file.
    """
    client = get_admin_client()
    file_path = f"{user_id}/{resume_id}.pdf"

    # Upsert — overwrite if already exists (recompilation)
    client.storage.from_(STORAGE_BUCKET).upload(
        path=file_path,
        file=pdf_bytes,
        file_options={
            "content-type": "application/pdf",
            "upsert": "true",
        },
    )

    # Get the public URL
    public_url = client.storage.from_(STORAGE_BUCKET).get_public_url(file_path)
    return public_url


def compile_and_upload(
    latex_code: str,
    user_id: str,
    resume_id: str,
) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Full pipeline: compile LaTeX → upload PDF → return URL.

    Returns:
        (success, pdf_url, error_message)
    """
    success, pdf_bytes, error = compile_latex(latex_code)

    if not success:
        return False, None, error

    try:
        pdf_url = upload_pdf_to_storage(pdf_bytes, user_id, resume_id)
        return True, pdf_url, None
    except Exception as e:
        return False, None, f"PDF upload failed: {str(e)}"
