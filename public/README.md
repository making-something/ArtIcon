# Articon Hackathon 2025 - Submission Portal

## Overview

This is a simple HTML submission portal for participants to submit their work via Google Drive links.

## Features

- ✅ Simple, user-friendly interface
- ✅ Google Drive link validation
- ✅ Real-time submission feedback
- ✅ Mobile responsive design
- ✅ Success confirmation with submission details

## How to Access

Once the server is running, access the submission portal at:

```
http://localhost:8000/submit.html
```

## Usage Instructions

### For Participants

1. **Upload your work to Google Drive:**
   - Upload your submission file (video, image, design, etc.) to your Google Drive
   - Right-click on the file → "Get link"
   - Set sharing to "Anyone with the link"
   - Copy the shareable link

2. **Submit via the portal:**
   - Open the submission portal in your browser
   - Enter your Participant ID (provided during registration)
   - Enter the Task ID (provided by organizers)
   - Paste your Google Drive link
   - Click "Submit Your Work"

3. **Confirmation:**
   - You'll receive an on-screen confirmation with your submission details
   - Email and WhatsApp confirmations will be sent automatically
   - Your submission will be auto-assigned to a judge

### URL Parameters (Optional)

You can pre-fill the form using URL parameters:

```
http://localhost:8000/submit.html?participant_id=YOUR_ID&task_id=TASK_ID
```

## Accepted File Types

- Videos (MP4, AVI, MOV, etc.)
- Images (JPG, PNG, GIF, etc.)
- Design Files (PSD, AI, Figma links, etc.)
- Any file format supported by Google Drive

## Drive Link Format

The system accepts Google Drive links in these formats:
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`
- `https://drive.google.com/drive/folders/FOLDER_ID`

## Technical Details

### API Endpoint

The form submits to:
```
POST /api/submissions
```

### Request Body
```json
{
  "participant_id": "uuid",
  "task_id": "uuid",
  "drive_link": "https://drive.google.com/..."
}
```

### Response
```json
{
  "success": true,
  "message": "Submission created successfully",
  "data": {
    "id": "submission_uuid",
    "participant_id": "uuid",
    "task_id": "uuid",
    "drive_link": "https://drive.google.com/...",
    "preview_url": null,
    "submitted_at": "2025-01-15T10:30:00Z",
    "judge_id": "auto_assigned_judge_uuid"
  }
}
```

## Error Handling

The portal handles various error scenarios:
- Invalid participant or task ID
- Duplicate submissions
- Invalid Drive links
- Network errors
- Task category mismatch

## Future Enhancements

- [ ] Direct file upload support
- [ ] Preview generation from Drive links
- [ ] Multiple file submissions
- [ ] Progress tracking
- [ ] Edit/update submissions

## Support

For technical issues, contact the Articon Hackathon support team.

---

**Note:** The `preview_url` field will be populated by admins after copying the submission to the organization's Drive for judging purposes.