"""HTML Template Maker - Create and manage HTML email templates with images."""

import os
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import mimetypes
import base64


class TemplateMaker:
    """Manages HTML templates with image handling and storage."""
    
    def __init__(self):
        # Templates saved to html/ root directory
        self.templates_dir = Path(__file__).parent.parent / "html"
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        
        # Images stored in html/user_images/
        self.images_dir = self.templates_dir / "user_images"
        self.images_dir.mkdir(parents=True, exist_ok=True)
    
    def _image_to_base64(self, filepath: Path) -> str:
        """Convert image file to base64 data URI."""
        with open(filepath, "rb") as f:
            image_data = f.read()
        
        # Determine MIME type
        ext = filepath.suffix.lower()
        mime_types = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".webp": "image/webp",
        }
        mime_type = mime_types.get(ext, "image/png")
        
        # Convert to base64
        b64_data = base64.b64encode(image_data).decode("utf-8")
        return f"data:{mime_type};base64,{b64_data}"
    
    def generate_sized_snippet(self, base64_uri: str, width: str = "100%", alt_text: str = "Image") -> str:
        """
        Generate an HTML img tag with sizing.
        
        Args:
            base64_uri: Base64 data URI from _image_to_base64
            width: Width (e.g., "100%", "200px", "50%")
            alt_text: Alt text for the image
            
        Returns:
            HTML snippet with embedded image
        """
        return f'<img src="{base64_uri}" alt="{alt_text}" style="max-width:{width}; width:{width}; height:auto; display:block;">'
    
    def generate_compact_preview(self, filename: str, width: str = "100%") -> str:
        """
        Generate a compact HTML representation showing image without base64 data.
        
        Args:
            filename: Name of the image file
            width: Width for sizing
            
        Returns:
            HTML string that represents the image structure
        """
        return f'<!-- Image: {filename} ({width}) -->\n<img src="[base64 embedded]" alt="{filename}" style="max-width:{width}; width:{width}; height:auto;">'
    
    def upload_image(self, uploaded_file, unique_name: str = None) -> tuple[str, str, str]:
        """
        Save uploaded image and return (filename, base64_html_snippet, file_path_html_snippet).
        
        Args:
            uploaded_file: Streamlit UploadedFile object
            unique_name: Optional custom filename (without extension)
            
        Returns:
            Tuple of (filename, base64_html_snippet, file_path_html_snippet)
        """
        # Determine filename
        if unique_name:
            ext = Path(uploaded_file.name).suffix
            filename = f"{unique_name}{ext}"
        else:
            filename = uploaded_file.name
        
        # Sanitize filename
        filename = "".join(c for c in filename if c.isalnum() or c in "._-")
        
        # Save file
        filepath = self.images_dir / filename
        with open(filepath, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        # Generate HTML snippets
        base64_data_uri = self._image_to_base64(filepath)
        base64_snippet = f'<img src="{base64_data_uri}" alt="Image" style="max-width:100%; height:auto;">'
        
        relative_path = f"user_images/{filename}"
        file_snippet = f'<img src="{relative_path}" alt="Image" style="max-width:100%; height:auto;">'
        
        return filename, base64_snippet, file_snippet
    
    def get_available_images(self) -> List[Dict]:
        """Get all available images in the template folder."""
        images = []
        for img_file in sorted(self.images_dir.glob("*")):
            if img_file.suffix.lower() in [".png", ".jpg", ".jpeg", ".gif", ".webp"]:
                # Create both base64 and file-path snippets
                base64_data_uri = self._image_to_base64(img_file)
                base64_snippet_full = self.generate_sized_snippet(base64_data_uri, "100%", img_file.name)
                
                relative_path = f"user_images/{img_file.name}"
                file_snippet = f'<img src="{relative_path}" alt="Image" style="max-width:100%; height:auto;">'
                
                # Generate sized variants
                size_presets = {
                    "Small (200px)": self.generate_sized_snippet(base64_data_uri, "200px", img_file.name),
                    "Medium (400px)": self.generate_sized_snippet(base64_data_uri, "400px", img_file.name),
                    "Large (600px)": self.generate_sized_snippet(base64_data_uri, "600px", img_file.name),
                    "Full Width (100%)": self.generate_sized_snippet(base64_data_uri, "100%", img_file.name),
                    "Half Width (50%)": self.generate_sized_snippet(base64_data_uri, "50%", img_file.name),
                }
                
                images.append({
                    "name": img_file.name,
                    "relative_path": relative_path,
                    "base64_uri": base64_data_uri,
                    "base64_snippet": base64_snippet_full,
                    "file_snippet": file_snippet,
                    "size_presets": size_presets,
                    "file_size": img_file.stat().st_size,
                    "full_path": img_file,
                })
        return images
    
    def delete_image(self, filename: str) -> bool:
        """Delete an image from the templates folder."""
        filepath = self.images_dir / filename
        if filepath.exists() and filepath.parent == self.images_dir:
            filepath.unlink()
            return True
        return False
    
    def save_template(self, name: str, html_content: str, description: str = "", overwrite: bool = False) -> tuple[bool, str]:
        """
        Save an HTML template to file.
        
        Args:
            name: Template name (used as filename)
            html_content: HTML content to save
            description: Optional template description
            overwrite: Whether to overwrite existing template
            
        Returns:
            Tuple of (success, message)
        """
        # Sanitize name
        safe_name = "".join(c for c in name if c.isalnum() or c in "._-")
        if not safe_name:
            return False, "Invalid template name"
        
        filepath = self.templates_dir / f"{safe_name}.html"
        
        if filepath.exists() and not overwrite:
            return False, f"Template '{safe_name}' already exists. Choose 'Overwrite' to replace."
        
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(html_content)
            
            # Save metadata
            metadata = {
                "name": name,
                "description": description,
                "created": datetime.now().isoformat(),
                "filename": f"{safe_name}.html"
            }
            metadata_path = self.templates_dir / f"{safe_name}_metadata.json"
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2)
            
            return True, f"Template saved: {safe_name}.html"
        except Exception as e:
            return False, f"Error saving template: {str(e)}"
    
    def load_template(self, filename: str, filepath: Path = None) -> Optional[str]:
        """
        Load a template HTML file.
        
        Args:
            filename: Name of the template file
            filepath: Optional explicit path to the template (if already known)
            
        Returns:
            HTML content or None if not found
        """
        # If explicit filepath provided, use it
        if filepath and filepath.exists() and filepath.suffix == ".html":
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception:
                return None
        
        # Otherwise search in both directories
        search_dirs = [
            self.templates_dir,  # html/
            self.templates_dir / "af_templates"  # html/af_templates/
        ]
        
        for search_dir in search_dirs:
            filepath = search_dir / filename
            if filepath.exists() and filepath.suffix == ".html":
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        return f.read()
                except Exception:
                    continue
        
        return None
    
    def list_templates(self) -> List[Dict]:
        """List all saved templates from both html/ and html/af_templates/."""
        templates = []
        seen_names = set()  # Track to avoid duplicates
        
        # Search in both directories
        search_dirs = [
            (self.templates_dir, ""),  # html/ (no subdir prefix)
            (self.templates_dir / "af_templates", "af_templates")  # html/af_templates/ (with subdir prefix)
        ]
        
        for search_dir, subdir_prefix in search_dirs:
            if not search_dir.exists():
                continue
                
            for html_file in sorted(search_dir.glob("*.html")):
                # Skip if already found (avoid duplicates)
                if html_file.stem in seen_names:
                    continue
                
                seen_names.add(html_file.stem)
                
                # Look for metadata in the same directory as the HTML file
                metadata_file = search_dir / f"{html_file.stem}_metadata.json"
                
                description = ""
                if metadata_file.exists():
                    try:
                        with open(metadata_file, "r", encoding="utf-8") as f:
                            metadata = json.load(f)
                            description = metadata.get("description", "")
                    except:
                        pass
                
                # Build display path with optional subdir prefix
                if subdir_prefix:
                    display_path = f"{subdir_prefix}/{html_file.name}"
                else:
                    display_path = html_file.name
                
                templates.append({
                    "filename": html_file.name,
                    "name": html_file.stem,
                    "description": description,
                    "size": html_file.stat().st_size,
                    "filepath": html_file,  # Store full path for loading
                    "display_path": display_path,  # For UI display
                    "subdir": subdir_prefix or "html",  # Subdirectory info
                })
        
        return templates


def generate_template_html(
    title: str = "Email Template",
    body_content: str = "",
    style: str = None,
) -> str:
    """Generate a basic HTML template structure."""
    
    if style is None:
        style = """
    body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 700px;
        margin: 0 auto;
        background-color: white;
        padding: 20px;
        border-radius: 8px;
    }
    .header {
        text-align: center;
        border-bottom: 2px solid #2E7D32;
        padding-bottom: 15px;
        margin-bottom: 20px;
    }
    .footer {
        text-align: center;
        border-top: 1px solid #ddd;
        padding-top: 15px;
        margin-top: 20px;
        font-size: 12px;
        color: #666;
    }
    a {
        color: #0645AD;
        text-decoration: underline;
    }
    .button {
        display: inline-block;
        background-color: #2E7D32;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        margin: 10px 0;
    }
        """
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>{style}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{title}</h1>
        </div>
        <div class="content">
{body_content}
        </div>
        <div class="footer">
            <p>&copy; {datetime.now().year} All rights reserved.</p>
        </div>
    </div>
</body>
</html>"""
    
    return html
