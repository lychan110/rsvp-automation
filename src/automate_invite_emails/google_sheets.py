"""
Google Sheets integration for fetching invitees and RSVP responses.
Requires service account credentials JSON file.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import gspread
from gspread.exceptions import SpreadsheetNotFound, WorksheetNotFound


class GoogleSheetsManager:
    """Manages Google Sheets API operations."""
    
    def __init__(self, credentials_path: Optional[str] = None, credentials_dict: Optional[Dict] = None):
        """
        Initialize Google Sheets manager with service account credentials.
        
        Args:
            credentials_path: Path to service account JSON file.
            credentials_dict: Service account credentials as a Python dict.
        """
        self.client = None
        self.credentials_path = credentials_path or "credentials.json"
        self.credentials_dict = credentials_dict
        
    def authenticate(self) -> bool:
        """
        Authenticate with Google Sheets API using service account.
        
        Returns:
            True if authentication successful, False otherwise.
        """
        try:
            creds_dict = self.credentials_dict
            if creds_dict is None:
                creds_file = Path(self.credentials_path)
                if not creds_file.exists():
                    return False
                with open(creds_file, 'r', encoding='utf-8') as f:
                    creds_dict = json.load(f)
            
            if not isinstance(creds_dict, dict):
                return False
            
            self.client = gspread.service_account_from_dict(creds_dict)
            return True
        except Exception as e:
            print(f"Auth error: {e}")
            return False
    
    def get_spreadsheet_by_id(self, sheet_id: str):
        """Get spreadsheet object by ID."""
        if not self.client:
            return None
        
        try:
            return self.client.open_by_key(sheet_id)
        except SpreadsheetNotFound:
            return None
        except Exception as e:
            print(f"Error opening sheet: {e}")
            return None
    
    def fetch_invitees(self, sheet_id: str, sheet_name: str = "Invitees") -> Optional[List[Dict]]:
        """
        Fetch invitee list from Google Sheet.
        
        Args:
            sheet_id: Google Sheet ID
            sheet_name: Name of worksheet (default: "Invitees")
        
        Returns:
            List of dicts with invitee data, or None if error
        """
        try:
            spreadsheet = self.get_spreadsheet_by_id(sheet_id)
            if not spreadsheet:
                return None
            
            worksheet = spreadsheet.worksheet(sheet_name)
            records = worksheet.get_all_records()
            return records
        except WorksheetNotFound:
            return None
        except Exception as e:
            print(f"Error fetching invitees: {e}")
            return None
    
    def fetch_rsvp_responses(self, sheet_id: str, sheet_name: str = "Form Responses") -> Optional[List[Dict]]:
        """
        Fetch RSVP responses from Google Form results sheet.
        
        Args:
            sheet_id: Google Sheet ID of form responses
            sheet_name: Name of worksheet (default: "Form Responses")
        
        Returns:
            List of dicts with response data, or None if error
        """
        try:
            spreadsheet = self.get_spreadsheet_by_id(sheet_id)
            if not spreadsheet:
                return None
            
            worksheet = spreadsheet.worksheet(sheet_name)
            records = worksheet.get_all_records()
            return records
        except WorksheetNotFound:
            return None
        except Exception as e:
            print(f"Error fetching responses: {e}")
            return None
    
    def update_sheet(self, sheet_id: str, data: List[Dict], sheet_name: str = "Updated Data") -> bool:
        """
        Write data to worksheet. Creates/clears existing data.
        
        Args:
            sheet_id: Google Sheet ID
            data: List of dicts to write
            sheet_name: Worksheet name
        
        Returns:
            True if successful, False otherwise
        """
        try:
            spreadsheet = self.get_spreadsheet_by_id(sheet_id)
            if not spreadsheet:
                return False
            
            try:
                worksheet = spreadsheet.worksheet(sheet_name)
                worksheet.clear()
            except WorksheetNotFound:
                worksheet = spreadsheet.add_worksheet(title=sheet_name, rows=1000, cols=20)
            
            if data:
                # Convert list of dicts to rows
                headers = list(data[0].keys())
                rows = [headers] + [[row.get(h, "") for h in headers] for row in data]
                worksheet.update(rows)
            
            return True
        except Exception as e:
            print(f"Error updating sheet: {e}")
            return False
    
    def fetch_sheet_headers(self, sheet_id: str, sheet_name: str = "Invitees") -> Optional[List[str]]:
        """
        Fetch only the header row from a worksheet.
        """
        try:
            spreadsheet = self.get_spreadsheet_by_id(sheet_id)
            if not spreadsheet:
                return None
            worksheet = spreadsheet.worksheet(sheet_name)
            headers = worksheet.row_values(1)
            return headers
        except WorksheetNotFound:
            return None
        except Exception as e:
            print(f"Error fetching sheet headers: {e}")
            return None
    
    def update_sheet_headers(self, sheet_id: str, headers: List[str], sheet_name: str = "Invitees") -> bool:
        """
        Update only the header row of a worksheet, creating it if needed.
        """
        try:
            spreadsheet = self.get_spreadsheet_by_id(sheet_id)
            if not spreadsheet:
                return False
            try:
                worksheet = spreadsheet.worksheet(sheet_name)
            except WorksheetNotFound:
                worksheet = spreadsheet.add_worksheet(title=sheet_name, rows=1000, cols=max(20, len(headers)))
            worksheet.update([headers])
            return True
        except Exception as e:
            print(f"Error updating sheet headers: {e}")
            return False
    
    def extract_sheet_id_from_url(self, url: str) -> Optional[str]:
        """
        Extract sheet ID from Google Sheets URL.
        
        Args:
            url: Google Sheets URL
        
        Returns:
            Sheet ID or None if not found
        """
        try:
            # Format: https://docs.google.com/spreadsheets/d/SHEET_ID/...
            if "docs.google.com/spreadsheets/d/" in url:
                parts = url.split("docs.google.com/spreadsheets/d/")[1]
                sheet_id = parts.split("/")[0]
                return sheet_id
        except:
            pass
        
        return None
