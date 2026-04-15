"""Event Invitation Manager - A flexible, reusable workflow for managing event invitations."""

import sys
import streamlit as st
import pandas as pd
import io as py_io
import json
from pathlib import Path

from config_manager import ConfigManager
from template_maker import TemplateMaker, generate_template_html

# Add parent dir to path
parent_dir = Path(__file__).parent.parent / "src"
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

try:
    from automate_invite_emails.link_generator import generate_rsvp_link, build_tokens
    from automate_invite_emails.response_sync import sync_response_status
    from automate_invite_emails.template_renderer import render_template_file
    from automate_invite_emails.google_sheets import GoogleSheetsManager
except ImportError as e:
    st.error(f"Failed to import module: {e}")

st.set_page_config(
    page_title="Event Invitation Manager",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Initialize config manager
config_mgr = ConfigManager()
template_maker = TemplateMaker()

# Initialize session state
if "current_config" not in st.session_state:
    st.session_state.current_config = config_mgr.get_default_config()
if "current_config_name" not in st.session_state:
    st.session_state.current_config_name = None
if "generated_links" not in st.session_state:
    st.session_state.generated_links = None
if "template_mode" not in st.session_state:
    st.session_state.template_mode = "create"  # "create" or "load"
if "template_content" not in st.session_state:
    st.session_state.template_content = ""
if "template_editing" not in st.session_state:
    st.session_state.template_editing = False  # Track if user started editing
if "uploaded_images" not in st.session_state:
    st.session_state.uploaded_images = []
if "google_sheets_manager" not in st.session_state:
    st.session_state.google_sheets_manager = None
if "gs_credentials_uploaded" not in st.session_state:
    st.session_state.gs_credentials_uploaded = False
if "gs_invitees_sheet_id" not in st.session_state:
    st.session_state.gs_invitees_sheet_id = ""
if "gs_responses_sheet_id" not in st.session_state:
    st.session_state.gs_responses_sheet_id = ""
if "cached_invitees" not in st.session_state:
    st.session_state.cached_invitees = None
if "cached_responses" not in st.session_state:
    st.session_state.cached_responses = None

# Comprehensive styling
st.markdown("""
    <style>
    /* Color scheme */
    :root {
        --primary: #2E7D32;
        --primary-dark: #1b5e20;
        --primary-light: #4CAF50;
        --accent: #FF6B6B;
        --success: #2E7D32;
        --warning: #FFA500;
        --info: #2196F3;
        --bg-light: #F8F9FA;
        --border: #E0E0E0;
    }
    
    /* Header styling */
    .header-section {
        background: linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%);
        color: white;
        padding: 2rem 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
    }
    
    .header-section h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.5px;
    }
    
    .header-section p {
        margin: 0.5rem 0 0 0;
        opacity: 0.95;
        font-size: 0.95rem;
        letter-spacing: 2px;
    }
    
    /* Card styling */
    .card {
        background: #FFFFFF;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 1rem 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: box-shadow 0.2s ease;
    }
    
    .card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    
    .card-header {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1b5e20;
        margin-bottom: 1rem;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 0.5rem;
    }
    
    /* Status badges */
    .status-ok {
        color: #2E7D32;
        font-weight: 600;
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #C8E6C9;
        border-radius: 20px;
        font-size: 0.85rem;
    }
    
    .status-warning {
        color: #E65100;
        font-weight: 600;
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #FFE0B2;
        border-radius: 20px;
        font-size: 0.85rem;
    }
    
    .status-pending {
        color: #1565C0;
        font-weight: 600;
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #BBDEFB;
        border-radius: 20px;
        font-size: 0.85rem;
    }
    
    /* Section dividers */
    .section-divider {
        margin: 2rem 0;
        border-top: 2px solid #e0e0e0;
    }
    
    /* Form styling */
    .form-section {
        background: #F8F9FA;
        padding: 1.5rem;
        border-radius: 8px;
        margin: 1rem 0;
    }
    
    /* Button styling */
    .stButton>button {
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
    }
    
    /* Metric styling */
    .metric-card {
        background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #2E7D32;
    }
    
    /* Sidebar styling */
    .sidebar-card {
        background: #F8F9FA;
        padding: 1rem;
        border-radius: 6px;
        margin: 0.5rem 0;
        border-left: 3px solid #2E7D32;
    }
    
    /* Tab styling improvements */
    .stTabs [data-baseweb="tab-list"] {
        gap: 1rem;
    }
    
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        font-weight: 600;
    }
    
    /* Expander improvements */
    .streamlit-expanderHeader {
        font-weight: 600;
        color: #1b5e20;
    }
    
    </style>
""", unsafe_allow_html=True)

# SIDEBAR: Event management
with st.sidebar:
    st.markdown("""
    <div class="sidebar-card">
        <h3 style="margin: 0; color: #1b5e20;">📋 Event Management</h3>
    </div>
    """, unsafe_allow_html=True)
    
    event_name = st.session_state.current_config.get("event_name", "Not configured")
    event_display = event_name if event_name else "No event selected"
    
    st.markdown(f"""
    <div style="background: #E8F5E9; padding: 1rem; border-radius: 6px; margin: 0.5rem 0;">
        <small style="color: #666;">Current Event</small><br>
        <strong style="color: #1b5e20; font-size: 1rem;">{event_display}</strong>
    </div>
    """, unsafe_allow_html=True)
    
    st.divider()
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("📂 Load", use_container_width=True, help="Load a saved event configuration"):
            st.session_state.show_load = True
    with col2:
        if st.button("➕ New", use_container_width=True, help="Start a new event"):
            st.session_state.current_config = config_mgr.get_default_config()
            st.session_state.current_config_name = None
            st.rerun()
    
    st.divider()
    
    saved = config_mgr.list_saved_configs()
    if saved:
        st.markdown("<small style='color: #666;'>**Recent Events**</small>", unsafe_allow_html=True)
        for config_name in saved[:3]:
            if st.button(f"✓ {config_name}", use_container_width=True):
                st.session_state.current_config = config_mgr.load_config(config_name)
                st.session_state.current_config_name = config_name
                st.rerun()

# MAIN HEADER
st.markdown("""
<div class="header-section">
    <h1>Event Invitation Manager</h1>
    <p>Setup • Generate • Template • Sync</p>
</div>
""", unsafe_allow_html=True)

# TAB SETUP
tab_setup, tab_template, tab_links, tab_sync, tab_help = st.tabs([
    "Setup",
    "Template Maker",
    "Generate Links",
    "Sync Responses",
    "Help"])

# TAB 1: SETUP
with tab_setup:
    # Quick save/load at top
    st.markdown("<h3 style='color: #1b5e20; margin-top: 0;'>💾 Save & Load Configuration</h3>", unsafe_allow_html=True)
    col1, col2, col3 = st.columns([2, 1, 1])
    
    with col1:
        save_name = st.text_input(
            "Configuration name:",
            value=st.session_state.current_config_name or "",
            placeholder="e.g., Asia_Fest_2026"
        )
    
    with col2:
        if save_name and st.button("💾 Save", use_container_width=True, type="primary"):
            config_mgr.save_config(save_name, st.session_state.current_config)
            st.session_state.current_config_name = save_name
            st.success(f"✓ Saved as '{save_name}'")
            st.rerun()
    
    with col3:
        saved = config_mgr.list_saved_configs()
        if saved:
            if st.button("📂 Load", use_container_width=True):
                selected = st.selectbox("Select configuration", saved, label_visibility="collapsed")
                st.session_state.current_config = config_mgr.load_config(selected)
                st.session_state.current_config_name = selected
                st.rerun()
    
    st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
    
    # Event details
    st.markdown("<h3 style='color: #1b5e20;'>📅 Event Details</h3>", unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    with col1:
        st.session_state.current_config["event_name"] = st.text_input(
            "Event Name *",
            value=st.session_state.current_config.get("event_name", ""),
            placeholder="e.g., Asia Fest 2026"
        )
    with col2:
        st.session_state.current_config["event_description"] = st.text_input(
            "Description",
            value=st.session_state.current_config.get("event_description", ""),
            placeholder="Brief description of the event"
        )
    
    st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
    
    # Form settings
    st.markdown("<h3 style='color: #1b5e20;'>📋 Google Form Settings</h3>", unsafe_allow_html=True)
    st.session_state.current_config["form_url"] = st.text_area(
        "Form Prefill URL *",
        value=st.session_state.current_config.get("form_url", ""),
        height=60,
        placeholder="Copy the prefilled link from Google Form > Share > Get prefilled link",
        help="This URL will be used to create personalized RSVP links for each invitee"
    )
    
    st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
    
    # Email settings
    st.markdown("<h3 style='color: #1b5e20;'>✉️ Email Settings</h3>", unsafe_allow_html=True)
    
    st.markdown("<small style='color: #666;'>**Available Variables:** {{FirstName}}, {{LastName}}, {{EventName}}, {{RSVPLink}}</small>", unsafe_allow_html=True)
    
    col1, col2 = st.columns([3, 1])
    with col1:
        st.session_state.current_config["email_subject"] = st.text_input(
            "Email Subject *",
            value=st.session_state.current_config.get("email_subject", ""),
            placeholder="e.g., You're Invited to {{EventName}}!"
        )
    
    col1, col2 = st.columns(2)
    with col1:
        st.session_state.current_config["email_intro"] = st.text_area(
            "Email Opening",
            value=st.session_state.current_config.get("email_intro", ""),
            height=70,
            placeholder="Hi {{FirstName}}, you are warmly invited to {{EventName}}..."
        )
    with col2:
        st.session_state.current_config["email_outro"] = st.text_area(
            "Email Closing",
            value=st.session_state.current_config.get("email_outro", ""),
            height=70,
            placeholder="We look forward to celebrating with you!"
        )
    
    st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
    
    # Column management - simplified
    st.markdown("**Master Sheet Columns** (columns in your invitee CSV)")
    
    master_cols = st.session_state.current_config.get("master_columns", [])
    new_master_cols = []
    
    for idx, col in enumerate(master_cols):
        col1, col2, col3 = st.columns([2, 1, 0.8])
        
        with col1:
            name = st.text_input(
                "Name",
                value=col.get("name", ""),
                key=f"mc_name_{idx}",
                placeholder="e.g., FirstName",
                label_visibility="collapsed"
            )
        
        with col2:
            col_type = st.selectbox(
                "Type",
                ["string", "email", "number"],
                index=["string", "email", "number"].index(col.get("type", "string")),
                key=f"mc_type_{idx}",
                label_visibility="collapsed"
            )
        
        with col3:
            if st.button("Remove", key=f"mc_del_{idx}", use_container_width=True):
                continue
        
        if name:
            new_master_cols.append({"name": name, "type": col_type})
    
    col1, col2 = st.columns([3, 1])
    with col2:
        if st.button("Add Column", key="mc_add_btn", use_container_width=True):
            st.session_state.current_config["master_columns"].append({"name": "", "type": "string"})
            st.rerun()
    
    st.session_state.current_config["master_columns"] = new_master_cols
    
    st.divider()
    
    st.markdown("**Form Response Columns** (columns in Google Form export)")
    
    form_cols = st.session_state.current_config.get("form_columns", [])
    new_form_cols = []
    
    for idx, col in enumerate(form_cols):
        col1, col2, col3 = st.columns([2, 1, 0.8])
        
        with col1:
            name = st.text_input(
                "Name",
                value=col.get("name", ""),
                key=f"fc_name_{idx}",
                placeholder="e.g., Email",
                label_visibility="collapsed"
            )
        
        with col2:
            col_type = st.selectbox(
                "Type",
                ["string", "email", "number"],
                index=["string", "email", "number"].index(col.get("type", "string")),
                key=f"fc_type_{idx}",
                label_visibility="collapsed"
            )
        
        with col3:
            if st.button("Remove", key=f"fc_del_{idx}", use_container_width=True):
                continue
        
        if name:
            new_form_cols.append({"name": name, "type": col_type})
    
    col1, col2 = st.columns([3, 1])
    with col2:
        if st.button("Add Column", key="fc_add_btn", use_container_width=True):
            st.session_state.current_config["form_columns"].append({"name": "", "type": "string"})
            st.rerun()
    
    st.session_state.current_config["form_columns"] = new_form_cols
    
    # Google Sheets Integration
    st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
    st.markdown("<h3 style='color: #1b5e20;'>🔗 Google Sheets Integration</h3>", unsafe_allow_html=True)
    st.markdown("<small style='color: #666;'>Connect to your Google Sheets for live data sync. <a href='docs/GOOGLE_SHEETS_SETUP.md' target='_blank'>Setup Guide →</a></small>", unsafe_allow_html=True)
    
    # Step 1
    with st.expander("📝 Step 1: Upload Credentials", expanded=not st.session_state.gs_credentials_uploaded):
        st.markdown("<small style='color: #666;'>**How to get credentials:**</small>", unsafe_allow_html=True)
        st.markdown("""
        1. Go to [Google Cloud Console](https://console.cloud.google.com/)
        2. Create a new project
        3. Enable Google Sheets API
        4. Create a service account
        5. Download the JSON credentials file
        """)
        
        creds_file = st.file_uploader("Upload Service Account JSON", type=["json"], key="gs_creds_upload", help="Download from Google Cloud Console")
        
        if creds_file:
            try:
                creds_dict = json.loads(creds_file.read())
                creds_path = Path("credentials.json")
                with open(creds_path, "w") as f:
                    json.dump(creds_dict, f)
                st.session_state.gs_credentials_uploaded = True
                
                # Try to authenticate
                gs_manager = GoogleSheetsManager("credentials.json")
                if gs_manager.authenticate():
                    st.session_state.google_sheets_manager = gs_manager
                    st.success("✅ Google Sheets API authenticated successfully")
                else:
                    st.error("❌ Failed to authenticate. Check your credentials.")
            except Exception as e:
                st.error(f"Error: {str(e)}")
    
    # Step 2
    if st.session_state.gs_credentials_uploaded:
        with st.expander("🔗 Step 2: Link Your Sheets", expanded=True):
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("<small style='color: #666;'>**Invitees Sheet**</small>", unsafe_allow_html=True)
                invitees_url = st.text_input(
                    "Invitees Sheet URL",
                    value=st.session_state.gs_invitees_sheet_id or "",
                    placeholder="Paste your invitees Google Sheet URL",
                    key="invitees_url_input"
                )
                if invitees_url:
                    gs_manager = st.session_state.google_sheets_manager
                    if gs_manager:
                        sheet_id = gs_manager.extract_sheet_id_from_url(invitees_url)
                        if sheet_id:
                            st.session_state.gs_invitees_sheet_id = sheet_id
                            st.markdown(f"<span class='status-ok'>✓ Sheet ID extracted</span>", unsafe_allow_html=True)
                        else:
                            st.warning("Could not extract sheet ID from URL")
            
            with col2:
                st.markdown("<small style='color: #666;'>**Form Responses Sheet**</small>", unsafe_allow_html=True)
                responses_url = st.text_input(
                    "Form Responses Sheet URL",
                    value=st.session_state.gs_responses_sheet_id or "",
                    placeholder="Paste your form responses sheet URL",
                    key="responses_url_input"
                )
                if responses_url:
                    gs_manager = st.session_state.google_sheets_manager
                    if gs_manager:
                        sheet_id = gs_manager.extract_sheet_id_from_url(responses_url)
                        if sheet_id:
                            st.session_state.gs_responses_sheet_id = sheet_id
                            st.markdown(f"<span class='status-ok'>✓ Sheet ID extracted</span>", unsafe_allow_html=True)
                        else:
                            st.warning("Could not extract sheet ID from URL")
            
            if st.session_state.gs_invitees_sheet_id and st.session_state.gs_responses_sheet_id:
                st.markdown("""<div style='background: #E8F5E9; padding: 1rem; border-radius: 6px; margin-top: 1rem; border-left: 4px solid #2E7D32;'>
                <strong style='color: #1b5e20;'>✅ Ready to sync!</strong><br>
                <small style='color: #666;'>Both sheets are linked. Go to the "Sync Responses" tab to fetch data.</small>
                </div>""", unsafe_allow_html=True)
    
    # Status
    st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
    st.markdown("<h3 style='color: #1b5e20;'>✓ Configuration Status</h3>", unsafe_allow_html=True)
    
    is_valid, errors = config_mgr.validate_config(st.session_state.current_config)
    
    if is_valid:
        st.markdown("""<div style='background: #E8F5E9; padding: 1rem; border-radius: 6px; border-left: 4px solid #2E7D32;'>
        <strong style='color: #1b5e20;'>✅ Configuration Complete</strong><br>
        <small style='color: #666;'>Your event is configured. You can now generate links or sync responses.</small>
        </div>""", unsafe_allow_html=True)
    else:
        st.warning("⚠️ Configuration incomplete:")
        for error in errors:
            st.markdown(f"<small style='color: #E65100;'>• {error}</small>", unsafe_allow_html=True)

# TAB 2: GENERATE LINKS
with tab_links:
    st.markdown("<h2 style='color: #1b5e20;'>🔗 Generate Personalized RSVP Links</h2>", unsafe_allow_html=True)
    
    is_valid, _ = config_mgr.validate_config(st.session_state.current_config)
    
    if not is_valid:
        st.warning("⚠ First complete configuration in the Setup tab")
    else:
        uploaded_file = st.file_uploader("Upload Invitees CSV", type=["csv"], key="invitees_upload")
        
        if uploaded_file:
            try:
                df = pd.read_csv(uploaded_file)
                
                with st.expander("Preview Data", expanded=False):
                    st.dataframe(df.head(10), use_container_width=True)
                
                st.caption(f"{len(df)} invitees loaded")
                
                if st.button("Generate RSVP Links", type="primary", use_container_width=True):
                    with st.spinner("Generating links..."):
                        try:
                            master_cols = {col["name"]: col["name"] for col in st.session_state.current_config["master_columns"]}
                            form_url = st.session_state.current_config["form_url"]
                            
                            result_rows = []
                            for idx, row in df.iterrows():
                                tokens = build_tokens(
                                    row.to_dict(),
                                    {
                                        "FIRSTNAME+LASTNAME": master_cols.get("FirstName", "FirstName"),
                                        "EMAIL": master_cols.get("Email", "Email"),
                                    }
                                )
                                rsvp_link = generate_rsvp_link(form_url, tokens)
                                
                                row_dict = row.to_dict()
                                row_dict["RSVP_Link"] = rsvp_link
                                row_dict["InviteSent"] = ""
                                result_rows.append(row_dict)
                            
                            result_df = pd.DataFrame(result_rows)
                            st.session_state.generated_links = result_df
                            st.success(f"Generated links for {len(result_df)} invitees")
                        except Exception as e:
                            st.error(f"Error: {str(e)}")
                
                if st.session_state.generated_links is not None:
                    st.divider()
                    st.dataframe(st.session_state.generated_links, use_container_width=True)
                    
                    csv_buffer = py_io.BytesIO()
                    st.session_state.generated_links.to_csv(csv_buffer, index=False)
                    csv_buffer.seek(0)
                    
                    st.download_button(
                        "Download CSV with Links",
                        csv_buffer.getvalue(),
                        "invitees_with_links.csv",
                        "text/csv",
                        use_container_width=True
                    )
            except Exception as e:
                st.error(f"Error loading CSV: {str(e)}")

# TAB 3: TEMPLATE MAKER
with tab_template:
    st.markdown("<h2 style='color: #1b5e20; margin-top: 0;'>🎨 HTML Email Template Maker</h2>", unsafe_allow_html=True)
    
    # Mode toggle buttons
    col1, col2, col3 = st.columns([2, 1, 1])
    
    with col1:
        st.markdown("<small style='color: #666;'>**Choose how to manage templates:**</small>", unsafe_allow_html=True)
    
    with col2:
        mode_create = st.button("✏️ Create New", use_container_width=True, key="mode_create", type="primary" if st.session_state.template_mode == "create" else "secondary")
        if mode_create:
            st.session_state.template_mode = "create"
            st.session_state.template_editing = True
            st.session_state.template_content = ""  # Reset for new template
            st.rerun()
    
    with col3:
        mode_load = st.button("📂 Load Existing", use_container_width=True, key="mode_load", type="primary" if st.session_state.template_mode == "load" else "secondary")
        if mode_load:
            st.session_state.template_mode = "load"
            st.session_state.template_editing = False  # Reset when switching to load mode
            st.rerun()
    
    # Visual indicator of current mode
    if st.session_state.template_mode == "create" and st.session_state.template_editing:
        st.markdown("""<div style='background: #E3F2FD; padding: 1rem; border-radius: 6px; margin: 1rem 0; border-left: 4px solid #2196F3;'>
        <strong style='color: #1565C0;'>✏️ Create & Edit Mode</strong><br>
        <small style='color: #666;'>Build a new template from scratch or edit loaded content. Upload images, add text, and preview your design.</small>
        </div>""", unsafe_allow_html=True)
    elif st.session_state.template_mode == "create":
        st.markdown("""<div style='background: #F0F4C3; padding: 1rem; border-radius: 6px; margin: 1rem 0; border-left: 4px solid #FDD835;'>
        <strong style='color: #827717;'>👉 Ready to create?</strong><br>
        <small style='color: #666;'>Click the <strong>"✏️ Create New"</strong> button to start, or go to <strong>"📂 Load Existing"</strong> to edit a template.</small>
        </div>""", unsafe_allow_html=True)
    else:
        st.markdown("""<div style='background: #F3E5F5; padding: 1rem; border-radius: 6px; margin: 1rem 0; border-left: 4px solid #9C27B0;'>
        <strong style='color: #6A1B9A;'>📂 Load Mode</strong><br>
        <small style='color: #666;'>Browse your saved templates below. Click "Load" to open one for editing, or "Delete" to remove it.</small>
        </div>""", unsafe_allow_html=True)
    
    st.divider()
    
    # ===== MODE: LOAD EXISTING TEMPLATES =====
    if st.session_state.template_mode == "load":
        st.subheader("📚 Browse Templates")
        
        saved_templates = template_maker.list_templates()
        
        if not saved_templates:
            st.info("No templates saved yet.")
        else:
            # Create a 2-column layout for templates
            cols = st.columns(2)
            col_idx = 0
            
            for template in saved_templates:
                with cols[col_idx % 2]:
                    with st.container(border=True):
                        # Template info
                        display_path = template.get('display_path', template['filename'])
                        subdir = template.get('subdir', 'html')
                        
                        if subdir != 'html':
                            st.markdown(f"**📁 {display_path}**")
                        else:
                            st.markdown(f"**📄 {template['name']}**")
                        
                        if template['description']:
                            st.caption(f"📝 {template['description']}")
                        
                        st.caption(f"Size: {template['size'] / 1024:.1f} KB")
                        
                        # Action buttons
                        col1, col2 = st.columns(2)
                        
                        with col1:
                            if st.button("📂 Load", key=f"load_card_{template['name']}", use_container_width=True):
                                filepath = template.get('filepath')
                                loaded_content = template_maker.load_template(template['filename'], filepath)
                                if loaded_content:
                                    st.session_state.template_content = loaded_content
                                    st.session_state.template_mode = "create"  # Auto switch to edit mode
                                    st.session_state.template_editing = True  # Enable editing
                                    st.success(f"Loaded: {template['name']}")
                                    st.rerun()
                        
                        with col2:
                            if st.button("🗑️ Delete", key=f"del_card_{template['name']}", use_container_width=True):
                                try:
                                    filepath = template.get('filepath')
                                    if filepath and filepath.exists():
                                        filepath.unlink()
                                    st.success("Template deleted")
                                    st.rerun()
                                except Exception as e:
                                    st.error(f"Error: {str(e)}")
                    
                    col_idx += 1
    
    # ===== MODE: CREATE & EDIT =====
    elif st.session_state.template_mode == "create":
        if not st.session_state.template_editing:
            st.warning("👉 Click '✏️ Create New' above to start building a new template")
        else:
            st.subheader("📸 Images")
            
            with st.expander("🖼️ Manage Images", expanded=False):
                tab_upload, tab_gallery = st.tabs(["Upload New", "Gallery"])
                
                with tab_upload:
                    col1, col2 = st.columns([2, 1])
                    
                    with col1:
                        uploaded_img = st.file_uploader(
                            "Upload an image",
                            type=["png", "jpg", "jpeg", "gif", "webp"],
                            label_visibility="collapsed"
                        )
                    
                    with col2:
                        img_name = st.text_input(
                            "Optional name",
                            placeholder="e.g., logo",
                            label_visibility="collapsed"
                        )
                
                if uploaded_img:
                    if st.button("Upload", use_container_width=True, key="upload_btn"):
                        try:
                            filename, base64_snippet, file_snippet = template_maker.upload_image(uploaded_img, img_name or None)
                            
                            st.success(f"✓ Uploaded: {filename}")
                            
                            available_images = template_maker.get_available_images()
                            current_img = next((img for img in available_images if img["name"] == filename), None)
                            
                            if current_img:
                                st.markdown("**Select a size:**")
                                selected_size = st.selectbox(
                                    "Size",
                                    list(current_img["size_presets"].keys()),
                                    key=f"upload_size_{filename}",
                                    label_visibility="collapsed"
                                )
                                selected_snippet = current_img["size_presets"][selected_size]
                                st.code(selected_snippet, language="html")
                                st.caption(f"👆 Copy this {selected_size} snippet")
                            
                            st.rerun()
                        except Exception as e:
                            st.error(f"Error: {str(e)}")
            
            with tab_gallery:
                available_images = template_maker.get_available_images()
                
                if not available_images:
                    st.info("No images yet.")
                else:
                    for img in available_images:
                        col1, col2, col3 = st.columns([1, 2.5, 0.5])
                        
                        with col1:
                            try:
                                st.image(str(img["full_path"]), width=70)
                            except:
                                st.caption("📷")
                        
                        with col2:
                            st.markdown(f"**{img['name']}**")
                            st.caption(f"{img['file_size'] / 1024:.1f} KB")
                            
                            with st.expander("📐 Sizes", expanded=False):
                                for size_name, sized_snippet in img["size_presets"].items():
                                    with st.expander(f"{size_name}", expanded=False):
                                        st.code(sized_snippet, language="html")
                        
                        with col3:
                            if st.button("🗑️", key=f"del_img_{img['name']}", use_container_width=True):
                                if template_maker.delete_image(img["name"]):
                                    st.success("Deleted")
                                    st.rerun()
            
            st.divider()
            
            # Template naming
            st.subheader("📝 Template Details")
            
            col1, col2 = st.columns([1, 1])
            with col1:
                template_name = st.text_input(
                    "Template Name *",
                    value="My Template",
                    placeholder="e.g., VIP_Invite_2026"
                )
            with col2:
                template_description = st.text_area(
                    "Description",
                    value="",
                    height=40,
                    placeholder="Optional description..."
                )
            
            st.divider()
            
            # Template editor
            st.subheader("✏️ Editor")
            
            template_title = st.text_input(
                "Email Title",
                value="Event Invitation",
                placeholder="Title for the email"
            )
            
            template_content = st.text_area(
                "HTML Content *",
                value=st.session_state.template_content or f"""<h1>{template_title}</h1>
<p>Hi {{{{FirstName}}}},</p>
<p>You are invited to <strong>{{{{EventName}}}}</strong>!</p>
<p><a href="{{{{RSVPLink}}}}" style="display:inline-block; background-color:#2E7D32; color:white; padding:12px 24px; text-decoration:none; border-radius:4px;">RSVP Here</a></p>
<p>Thank you!</p>""",
                height=250,
                placeholder="Enter HTML here..."
            )
            
            st.session_state.template_content = template_content
            
            # Variable insertion
            st.markdown("**Insert Variables:**")
            cols = st.columns(4)
            vars_list = ["{{FirstName}}", "{{LastName}}", "{{EventName}}", "{{RSVPLink}}"]
            for idx, var in enumerate(vars_list):
                with cols[idx]:
                    if st.button(var, use_container_width=True, key=f"var_btn_{idx}"):
                        st.session_state.template_content += f"\n{var}"
                        st.rerun()
            
            st.divider()
            
            # Preview
            st.subheader("👁️ Preview")
            
            col1, col2 = st.columns(2)
            with col1:
                preview_first = st.text_input("First Name", "Jane", key="prev_first")
                preview_last = st.text_input("Last Name", "Smith", key="prev_last")
            with col2:
                preview_event = st.text_input(
                    "Event Name",
                    value=st.session_state.current_config.get("event_name", "Our Event"),
                    key="prev_event"
                )
                preview_rsvp = st.text_input(
                    "RSVP Link",
                    value="https://example.com/rsvp?token=preview",
                    key="prev_rsvp"
                )
            
            if st.button("🔄 Refresh", type="primary", use_container_width=True):
                try:
                    sample_data = {
                        "FirstName": preview_first,
                        "LastName": preview_last,
                        "EventName": preview_event,
                        "RSVPLink": preview_rsvp,
                    }
                    
                    preview_html = template_content
                    for key, val in sample_data.items():
                        preview_html = preview_html.replace("{{" + key + "}}", str(val))
                    
                    if not preview_html.strip().startswith("<!DOCTYPE"):
                        preview_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }}
        .container {{ max-width: 700px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }}
    </style>
</head>
<body>
    <div class="container">
        {preview_html}
    </div>
</body>
</html>"""
                    
                    st.html(preview_html)
                except Exception as e:
                    st.error(f"Preview error: {str(e)}")
            
            st.divider()
            
            # Save
            st.subheader("💾 Save")
            
            col1, col2 = st.columns([3, 1])
            with col1:
                overwrite = st.checkbox("Overwrite if exists")
            
            col1, col2, col3 = st.columns([1, 1, 1])
            
            with col1:
                if st.button("💾 Save", use_container_width=True, type="primary"):
                    if not template_content.strip():
                        st.error("Content required")
                    elif not template_name.strip():
                        st.error("Name required")
                    else:
                        success, message = template_maker.save_template(
                            template_name,
                            template_content,
                            template_description,
                            overwrite=overwrite
                        )
                        if success:
                            st.success(f"✓ {message}")
                            st.session_state.template_content = ""
                            st.rerun()
                        else:
                            st.error(f"✗ {message}")


# TAB 4: SYNC RESPONSES
with tab_sync:
    st.markdown("<h2 style='color: #1b5e20;'>📊 Sync RSVP Responses</h2>", unsafe_allow_html=True)
    
    # Check if Google Sheets is configured
    if not st.session_state.google_sheets_manager or not st.session_state.gs_responses_sheet_id:
        st.markdown("""<div style='background: #FFF3E0; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #FFA500;'>
        <strong style='color: #E65100;'>⚠️ Google Sheets Not Configured</strong><br>
        <small style='color: #666;'>Please set up Google Sheets integration in the <strong>Setup</strong> tab first.</small>
        </div>""", unsafe_allow_html=True)
    else:
        # Action buttons
        col1, col2, col3 = st.columns([2, 2, 2])
        
        with col1:
            if st.button("🔄 Fetch Latest Data", type="primary", use_container_width=True, help="Pull the latest data from Google Sheets"):
                with st.spinner("Fetching from Google Sheets..."):
                    try:
                        gs_manager = st.session_state.google_sheets_manager
                        
                        # Fetch invitees
                        invitees = gs_manager.fetch_invitees(
                            st.session_state.gs_invitees_sheet_id,
                            sheet_name="Sheet1"  # Adjust based on your sheet name
                        )
                        if invitees:
                            st.session_state.cached_invitees = invitees
                            st.success(f"✅ Fetched {len(invitees)} invitees")
                        else:
                            st.error("❌ Could not fetch invitees. Check sheet name or permissions.")
                        
                        # Fetch responses
                        responses = gs_manager.fetch_rsvp_responses(
                            st.session_state.gs_responses_sheet_id,
                            sheet_name="Form Responses"  # Adjust based on your sheet name
                        )
                        if responses:
                            st.session_state.cached_responses = responses
                            st.success(f"✅ Fetched {len(responses)} responses")
                        else:
                            st.error("❌ Could not fetch responses. Check sheet name or permissions.")
                    except Exception as e:
                        st.error(f"Error fetching data: {str(e)}")
        
        with col2:
            if st.button("🔍 View Configuration", use_container_width=True, help="View the linked sheets"):
                with st.expander("Sheet Configuration", expanded=True):
                    st.json({
                        "invitees_sheet_id": st.session_state.gs_invitees_sheet_id[:30] + "...",
                        "responses_sheet_id": st.session_state.gs_responses_sheet_id[:30] + "..."
                    })
        
        with col3:
            if st.button("📋 View Help", use_container_width=True, help="View the setup documentation"):
                st.info("📖 See **docs/GOOGLE_SHEETS_SETUP.md** for detailed setup instructions")
        
        st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
        
        # Display metrics
        if st.session_state.cached_invitees and st.session_state.cached_responses:
            invitees_df = pd.DataFrame(st.session_state.cached_invitees)
            responses_df = pd.DataFrame(st.session_state.cached_responses)
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown("<div class='metric-card'>", unsafe_allow_html=True)
                st.metric("👥 Invitees", len(invitees_df))
                st.markdown("</div>", unsafe_allow_html=True)
            with col2:
                st.markdown("<div class='metric-card'>", unsafe_allow_html=True)
                st.metric("✉️ Responses", len(responses_df))
                st.markdown("</div>", unsafe_allow_html=True)
            with col3:
                st.markdown("<div class='metric-card'>", unsafe_allow_html=True)
                match_pct = len(responses_df) / len(invitees_df) * 100 if len(invitees_df) > 0 else 0
                st.metric("📈 Response Rate", f"{match_pct:.1f}%")
                st.markdown("</div>", unsafe_allow_html=True)
            
            st.divider()
            
            # Show responses
            with st.expander("📥 Form Responses", expanded=True):
                st.dataframe(responses_df, use_container_width=True)
                
                csv_buffer = py_io.BytesIO()
                responses_df.to_csv(csv_buffer, index=False)
                csv_buffer.seek(0)
                
                st.download_button(
                    "Download Responses",
                    csv_buffer.getvalue(),
                    "rsvp_responses.csv",
                    "text/csv",
                    use_container_width=True
                )
            
            # Show invitees with sync option
            with st.expander("📋 Invitees List", expanded=False):
                st.dataframe(invitees_df, use_container_width=True)
                
                csv_buffer = py_io.BytesIO()
                invitees_df.to_csv(csv_buffer, index=False)
                csv_buffer.seek(0)
                
                st.download_button(
                    "Download Invitees",
                    csv_buffer.getvalue(),
                    "invitees_list.csv",
                    "text/csv",
                    use_container_width=True
                )
            
            # Sync button
            if st.button("🔗 Sync Responses to Master", type="primary", use_container_width=True):
                with st.spinner("Syncing..."):
                    try:
                        master_rows = st.session_state.cached_invitees
                        response_rows = st.session_state.cached_responses
                        
                        form_map = st.session_state.current_config.get("form_mappings", {})
                        
                        updated_rows = sync_response_status(
                            master_rows,
                            response_rows,
                            email_field="Email",
                            status_field=form_map.get("response_status", "Status"),
                            timestamp_field=form_map.get("response_timestamp", "Timestamp"),
                        )
                        
                        updated_df = pd.DataFrame(updated_rows)
                        st.success(f"✓ Synced {len(updated_df)} records")
                        st.dataframe(updated_df, use_container_width=True)
                        
                        csv_buffer = py_io.BytesIO()
                        updated_df.to_csv(csv_buffer, index=False)
                        csv_buffer.seek(0)
                        
                        st.download_button(
                            "Download Updated Master",
                            csv_buffer.getvalue(),
                            "master_synced.csv",
                            "text/csv",
                            use_container_width=True
                        )
                    except Exception as e:
                        st.error(f"Error syncing: {str(e)}")
        else:
            st.info("👆 Click 'Fetch Latest Data' to load from Google Sheets")

# TAB 5: HELP
with tab_help:
    st.markdown("<h2 style='color: #1b5e20;'>📖 Help & Documentation</h2>", unsafe_allow_html=True)
    
    # Overview section
    st.markdown("<h3 style='color: #1b5e20; margin-top: 1.5rem;'>🎯 How It Works</h3>", unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown("""<div style='background: #E8F5E9; padding: 1rem; border-radius: 6px; text-align: center;'>
        <div style='font-size: 1.5rem; margin-bottom: 0.5rem;'>⚙️</div>
        <strong style='color: #1b5e20;'>Setup</strong><br>
        <small style='color: #666;'>Configure your event</small>
        </div>""", unsafe_allow_html=True)
    
    with col2:
        st.markdown("""<div style='background: #E3F2FD; padding: 1rem; border-radius: 6px; text-align: center;'>
        <div style='font-size: 1.5rem; margin-bottom: 0.5rem;'>🎨</div>
        <strong style='color: #1565C0;'>Template</strong><br>
        <small style='color: #666;'>Design templates</small>
        </div>""", unsafe_allow_html=True)
    
    with col3:
        st.markdown("""<div style='background: #FFF3E0; padding: 1rem; border-radius: 6px; text-align: center;'>
        <div style='font-size: 1.5rem; margin-bottom: 0.5rem;'>🔗</div>
        <strong style='color: #E65100;'>Generate</strong><br>
        <small style='color: #666;'>Create RSVP links</small>
        </div>""", unsafe_allow_html=True)
    
    with col4:
        st.markdown("""<div style='background: #F3E5F5; padding: 1rem; border-radius: 6px; text-align: center;'>
        <div style='font-size: 1.5rem; margin-bottom: 0.5rem;'>📊</div>
        <strong style='color: #6A1B9A;'>Sync</strong><br>
        <small style='color: #666;'>Track responses</small>
        </div>""", unsafe_allow_html=True)
    
    st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
    
    # Features section
    st.markdown("<h3 style='color: #1b5e20;'>✨ Key Features</h3>", unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        **🎨 Template Maker**
        - Upload images (base64 embedded)
        - Resize images with presets
        - Live HTML preview
        - Save & reuse templates
        
        **🔗 Smart Link Generation**
        - Personalized RSVP links
        - Bulk import from CSV
        - Export with links
        """)
    
    with col2:
        st.markdown("""
        **📊 Google Sheets Sync**
        - Connect to Google Sheets
        - Auto-fetch form responses
        - Track response rate
        - Match responses to invitees
        
        **📝 Flexible Configuration**
        - Save multiple events
        - Custom column names
        - Variable email templates
        """)
    
    st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
    
    # Variables section
    st.markdown("<h3 style='color: #1b5e20;'>📌 Available Variables</h3>", unsafe_allow_html=True)
    
    st.markdown("""
    Use these variables in your email templates and they will be automatically replaced:
    
    | Variable | Description | Example |
    |----------|-------------|---------|
    | `{{FirstName}}` | Guest first name | Jane |
    | `{{LastName}}` | Guest last name | Smith |
    | `{{EventName}}` | Your event name | Asia Fest 2026 |
    | `{{RSVPLink}}` | Personalized RSVP link | https://forms.google.com/... |
    """)
    
    st.markdown("""<div class="section-divider"></div>""", unsafe_allow_html=True)
    
    st.markdown("<h3 style='color: #1b5e20;'>💡 Tips & Best Practices</h3>", unsafe_allow_html=True)
    
    st.markdown("""
    **Column Names**
    - Column names are case-sensitive
    - Always include an Email column for matching responses
    - Use clear, descriptive names in your CSV
    
    **Event Management**
    - Save configurations for future events (Setup tab)
    - Use Google Form prefilled links with entry.XXXX parameters
    
    **Templates**
    - Upload images once, reuse HTML snippet in multiple templates
    - Use base64 snippets for email (self-contained)
    - Use file path snippets for production (smaller files)
    
    **Google Sheets**
    - Share invitees and responses sheets with service account email
    - Check sheet names match the config (default: Sheet1, Form Responses)
    - Ensure service account has Editor access
    """)

# Footer
st.divider()
st.caption("Event Invitation Manager • Powered by Streamlit")
