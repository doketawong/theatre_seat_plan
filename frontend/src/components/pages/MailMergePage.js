import React, { useState, useEffect } from 'react';
import { generateQRCode, generateQRCodeBlob } from '../../util/qrcodeGenerator';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';

const defaultLayout = {
  subject: 'Your Event Ticket - {{event}}',
  body: 'Dear {{name}},\n\nWe are pleased to confirm your reservation for {{event}}.\n\nEvent Details:\n- Event: {{event}}\n- Your Seat: {{seat}}\n- Date: {{date}}\n\nPlease present the QR code below at the venue entrance.\n\nThank you for your attendance!'
};

const MailMergePage = () => {
  const [emailLayout, setEmailLayout] = useState(defaultLayout);
  const [preview, setPreview] = useState('');
  const [participant, setParticipant] = useState({ name: '', email: '', seat: '', event: '', date: '' });
  const [qrCode, setQrCode] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  // Load available events (you can replace this with actual API call)
  useEffect(() => {
    // Mock events data - replace with actual API call
    const mockEvents = [
      { id: 1, name: 'The Last Dance', date: '2025-08-30', venue: 'Main Theatre' },
      { id: 2, name: 'Cats Musical', date: '2025-09-05', venue: 'Broadway Hall' },
      { id: 3, name: 'Deadpool & Wolverine', date: '2025-09-12', venue: 'Cinema 1' },
      { id: 4, name: 'Jurassic World Rebirth', date: '2025-09-18', venue: 'IMAX Theatre' }
    ];
    setEvents(mockEvents);
  }, []);

  const handleEventSelect = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(eventId);
      setParticipant({
        ...participant,
        event: event.name,
        date: event.date
      });
    }
  };

  const handleGeneratePreview = async () => {
    const qrData = {
      ...participant,
      ticketId: `${selectedEvent}-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const qr = await generateQRCode(qrData);
    setQrCode(qr);
    
    let subject = emailLayout.subject
      .replace('{{name}}', participant.name)
      .replace('{{seat}}', participant.seat)
      .replace('{{event}}', participant.event)
      .replace('{{date}}', participant.date);
      
    let body = emailLayout.body
      .replace('{{name}}', participant.name)
      .replace('{{seat}}', participant.seat)
      .replace('{{event}}', participant.event)
      .replace('{{date}}', participant.date);
      
    setPreview({ subject, body });
  };

  const handleDownloadQR = async () => {
    const qrData = {
      ...participant,
      ticketId: `${selectedEvent}-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const blob = await generateQRCodeBlob(qrData);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-ticket-${participant.name.replace(/\s+/g, '-')}-${participant.seat}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // TODO: Add email sending logic (backend integration)

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mail Merge & QR Code Generator
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Configure email templates and generate QR codes for event participants
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Email Template Configuration */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Email Template Configuration</Typography>
            <Box mb={2}>
              <TextField 
                label="Email Subject" 
                fullWidth 
                value={emailLayout.subject} 
                onChange={e => setEmailLayout({ ...emailLayout, subject: e.target.value })} 
                sx={{ mb: 2 }} 
                helperText="Available placeholders: {{name}}, {{seat}}, {{event}}, {{date}}"
              />
              <TextField 
                label="Email Body" 
                fullWidth 
                multiline 
                minRows={6}
                value={emailLayout.body} 
                onChange={e => setEmailLayout({ ...emailLayout, body: e.target.value })} 
                helperText="Use placeholders: {{name}}, {{seat}}, {{event}}, {{date}}"
              />
            </Box>
            
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>Available Placeholders:</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label="{{name}}" size="small" />
                <Chip label="{{seat}}" size="small" />
                <Chip label="{{event}}" size="small" />
                <Chip label="{{date}}" size="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Participant Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Participant Information</Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Event</InputLabel>
              <Select
                value={selectedEvent}
                label="Select Event"
                onChange={(e) => handleEventSelect(e.target.value)}
              >
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.name} - {event.date} ({event.venue})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField 
              label="Participant Name" 
              fullWidth 
              value={participant.name} 
              onChange={e => setParticipant({ ...participant, name: e.target.value })} 
              sx={{ mb: 2 }} 
            />
            <TextField 
              label="Email Address" 
              fullWidth 
              type="email"
              value={participant.email} 
              onChange={e => setParticipant({ ...participant, email: e.target.value })} 
              sx={{ mb: 2 }} 
            />
            <TextField 
              label="Seat Assignment" 
              fullWidth 
              value={participant.seat} 
              onChange={e => setParticipant({ ...participant, seat: e.target.value })} 
              sx={{ mb: 2 }}
              placeholder="e.g., A5, B12, VIP-3"
            />
            
            {selectedEvent && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2">Selected Event Details:</Typography>
                <Typography variant="body2">Event: {participant.event}</Typography>
                <Typography variant="body2">Date: {participant.date}</Typography>
              </Box>
            )}

            <Button 
              variant="contained" 
              onClick={handleGeneratePreview}
              fullWidth
              sx={{ mt: 2 }}
              disabled={!participant.name || !participant.email || !selectedEvent}
            >
              Generate Preview & QR Code
            </Button>
          </Paper>
        </Grid>

        {/* Preview Section */}
        {preview && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Email Preview</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>Subject:</Typography>
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="body1">{preview.subject}</Typography>
                </Paper>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>Email Body:</Typography>
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {preview.body}
                  </Typography>
                </Paper>
              </Box>

              {qrCode && (
                <Box textAlign="center">
                  <Typography variant="subtitle1" gutterBottom>QR Code:</Typography>
                  <img src={qrCode} alt="QR Code" style={{ width: 200, height: 200, border: '1px solid #ddd' }} />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Scan this code for event entry verification
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary">
                  Send Email
                </Button>
                <Button variant="outlined" onClick={handleDownloadQR}>
                  Download QR Code
                </Button>
                <Button variant="outlined">
                  Export Preview
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default MailMergePage;
