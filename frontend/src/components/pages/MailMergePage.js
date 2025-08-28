import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  Divider,
  Slider,
  FormControlLabel,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Tooltip
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatSize,
  Image,
  Palette,
  Download,
  Preview,
  Send,
  PhotoCamera,
  Delete,
  CloudUpload
} from '@mui/icons-material';

const defaultLayout = {
  subject: 'Your Event Ticket - {{event}}',
  body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50; text-align: center;">🎭 Event Ticket Confirmation</h2>
    <p>Dear <strong>{{name}}</strong>,</p>
    <p>We are pleased to confirm your reservation for <strong>{{event}}</strong>.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #495057; margin-top: 0;">📋 Event Details:</h3>
      <ul style="list-style: none; padding: 0;">
        <li><strong>🎭 Event:</strong> {{event}}</li>
        <li><strong>🎫 Your Seat:</strong> {{seat}}</li>
        <li><strong>📅 Date:</strong> {{date}}</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0f7ff; border-radius: 10px;">
      <h3 style="color: #2196f3; margin-bottom: 15px;">🎫 Your Digital Ticket</h3>
      {{qrcode}}
      <p style="margin-top: 15px; color: #666; font-size: 14px;">
        📱 <em>Please present this QR code at the venue entrance</em>
      </p>
    </div>
    
    <p style="text-align: center; margin-top: 30px;">
      <em>Thank you for your attendance!</em>
    </p>
  </div>`,
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  includeLogo: false,
  logoUrl: '',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  accentColor: '#2196f3',
  // QR Code specific settings
  qrCodeSize: 200,
  qrCodeStyle: 'default', // default, bordered, rounded, shadow
  qrCodePosition: 'center', // center, left, right
  includeQRCode: true,
  qrCodeBackgroundColor: '#ffffff',
  qrCodeForegroundColor: '#000000'
};

const MailMergePage = () => {
  const [emailLayout, setEmailLayout] = useState(defaultLayout);
  const [preview, setPreview] = useState('');
  const [participant, setParticipant] = useState({ name: '', email: '', seat: '', event: '', date: '' });
  const [qrCode, setQrCode] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const previewRef = useRef(null);
  const quillRef = useRef(null);

  // Quill editor modules with custom toolbar
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet',
    'indent',
    'direction', 'align',
    'link', 'image', 'video'
  ];

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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          name: file.name,
          url: e.target.result,
          size: file.size
        };
        setUploadedImages([...uploadedImages, newImage]);
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== imageId));
  };

  // Generate styled QR code HTML based on layout settings
  const generateStyledQRCodeHtml = (qrCodeUrl) => {
    let qrStyle = '';
    let containerStyle = `text-align: ${emailLayout.qrCodePosition}; margin: 20px 0;`;
    
    switch (emailLayout.qrCodeStyle) {
      case 'bordered':
        qrStyle = 'border: 3px solid #2196f3; border-radius: 8px; padding: 10px; background: white;';
        break;
      case 'rounded':
        qrStyle = 'border-radius: 20px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
        break;
      case 'shadow':
        qrStyle = 'box-shadow: 0 8px 16px rgba(0,0,0,0.2); border-radius: 8px;';
        break;
      default:
        qrStyle = '';
    }
    
    return `<div style="${containerStyle}">
      <img src="${qrCodeUrl}" 
           alt="QR Code Ticket" 
           style="width: ${emailLayout.qrCodeSize}px; height: ${emailLayout.qrCodeSize}px; ${qrStyle}" />
    </div>`;
  };

  // Insert QR code placeholder into email template
  const insertQRCodePlaceholder = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const placeholder = '\n{{qrcode}}\n';
      quill.insertText(range ? range.index : 0, placeholder);
    }
  };

  const insertImageToEmail = (imageUrl) => {
    const imageHtml = `<img src="${imageUrl}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="Event Image" />`;
    setEmailLayout({
      ...emailLayout,
      body: emailLayout.body + imageHtml
    });
    setShowImageDialog(false);
  };

  const handleGeneratePreview = async () => {
    const qrData = {
      ...participant,
      ticketId: `${selectedEvent}-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const qr = await generateQRCode(qrData, {
      width: emailLayout.qrCodeSize,
      color: {
        dark: emailLayout.qrCodeForegroundColor,
        light: emailLayout.qrCodeBackgroundColor
      }
    });
    setQrCode(qr);
    
    let subject = emailLayout.subject
      .replace(/{{name}}/g, participant.name)
      .replace(/{{seat}}/g, participant.seat)
      .replace(/{{event}}/g, participant.event)
      .replace(/{{date}}/g, participant.date);
      
    let body = emailLayout.body
      .replace(/{{name}}/g, participant.name)
      .replace(/{{seat}}/g, participant.seat)
      .replace(/{{event}}/g, participant.event)
      .replace(/{{date}}/g, participant.date);

    // Replace QR code placeholder with styled QR code
    if (qr && emailLayout.includeQRCode) {
      const qrCodeHtml = generateStyledQRCodeHtml(qr);
      body = body.replace(/{{qrcode}}/g, qrCodeHtml);
    } else {
      body = body.replace(/{{qrcode}}/g, '');
    }
      
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

  const handleExportPDF = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`ticket-${participant.name.replace(/\s+/g, '-')}-${participant.seat}.pdf`);
    }
  };

  const applyQuickFormat = (format) => {
    switch (format) {
      case 'bold':
        setEmailLayout({
          ...emailLayout,
          body: `<div style="font-weight: bold;">${emailLayout.body}</div>`
        });
        break;
      case 'large':
        setEmailLayout({
          ...emailLayout,
          fontSize: Math.min(emailLayout.fontSize + 2, 24)
        });
        break;
      case 'small':
        setEmailLayout({
          ...emailLayout,
          fontSize: Math.max(emailLayout.fontSize - 2, 10)
        });
        break;
      default:
        break;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          📧 Enhanced Mail Merge & QR Code Generator
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Create professional email templates with rich formatting, images, and QR codes
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Template Configuration */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, mb: 3, height: 'fit-content' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">📝 Email Template</Typography>
              <Box display="flex" gap={1}>
                <Tooltip title="Add Image">
                  <IconButton 
                    color="primary" 
                    onClick={() => setShowImageDialog(true)}
                    size="small"
                  >
                    <Image />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bold Text">
                  <IconButton 
                    color="primary" 
                    onClick={() => applyQuickFormat('bold')}
                    size="small"
                  >
                    <FormatBold />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Increase Font Size">
                  <IconButton 
                    color="primary" 
                    onClick={() => applyQuickFormat('large')}
                    size="small"
                  >
                    <FormatSize />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Subject Line */}
            <TextField 
              label="📧 Email Subject" 
              fullWidth 
              value={emailLayout.subject} 
              onChange={e => setEmailLayout({ ...emailLayout, subject: e.target.value })} 
              sx={{ mb: 3 }} 
              helperText="Available placeholders: {{name}}, {{seat}}, {{event}}, {{date}}"
              variant="outlined"
            />

            {/* Rich Text Editor */}
            <Typography variant="subtitle2" gutterBottom>
              📄 Email Body (Rich Text Editor)
            </Typography>
            <Box sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={emailLayout.body}
                onChange={(content) => setEmailLayout({ ...emailLayout, body: content })}
                modules={quillModules}
                formats={quillFormats}
                style={{ minHeight: 200 }}
              />
            </Box>

            {/* Style Controls */}
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa', mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                🎨 Style Settings
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="caption">Font Size: {emailLayout.fontSize}px</Typography>
                  <Slider
                    value={emailLayout.fontSize}
                    onChange={(_, value) => setEmailLayout({ ...emailLayout, fontSize: value })}
                    min={10}
                    max={24}
                    step={1}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailLayout.includeLogo}
                        onChange={(e) => setEmailLayout({ ...emailLayout, includeLogo: e.target.checked })}
                        size="small"
                      />
                    }
                    label="Include Logo"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* QR Code Settings */}
            <Paper sx={{ p: 2, bgcolor: '#e3f2fd', mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                🎫 QR Code Settings
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailLayout.includeQRCode}
                        onChange={(e) => setEmailLayout({ ...emailLayout, includeQRCode: e.target.checked })}
                        size="small"
                      />
                    }
                    label="Include QR Code in Email"
                  />
                </Grid>
                {emailLayout.includeQRCode && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="caption">QR Size: {emailLayout.qrCodeSize}px</Typography>
                      <Slider
                        value={emailLayout.qrCodeSize}
                        onChange={(_, value) => setEmailLayout({ ...emailLayout, qrCodeSize: value })}
                        min={100}
                        max={300}
                        step={25}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>QR Style</InputLabel>
                        <Select
                          value={emailLayout.qrCodeStyle}
                          label="QR Style"
                          onChange={(e) => setEmailLayout({ ...emailLayout, qrCodeStyle: e.target.value })}
                        >
                          <MenuItem value="default">Default</MenuItem>
                          <MenuItem value="bordered">Bordered</MenuItem>
                          <MenuItem value="rounded">Rounded</MenuItem>
                          <MenuItem value="shadow">Shadow</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Position</InputLabel>
                        <Select
                          value={emailLayout.qrCodePosition}
                          label="Position"
                          onChange={(e) => setEmailLayout({ ...emailLayout, qrCodePosition: e.target.value })}
                        >
                          <MenuItem value="center">Center</MenuItem>
                          <MenuItem value="left">Left</MenuItem>
                          <MenuItem value="right">Right</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <Tooltip title="Add QR Code Placeholder">
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={insertQRCodePlaceholder}
                          startIcon={<Image />}
                        >
                          Insert {{qrcode}}
                        </Button>
                      </Tooltip>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
            
            {/* Placeholder Chips */}
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                🏷️ Available Placeholders:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label="{{name}}" size="small" color="primary" />
                <Chip label="{{seat}}" size="small" color="secondary" />
                <Chip label="{{event}}" size="small" color="success" />
                <Chip label="{{date}}" size="small" color="warning" />
                <Chip label="{{qrcode}}" size="small" color="info" icon={<Image />} />
              </Box>
            </Box>

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  🖼️ Uploaded Images:
                </Typography>
                <Grid container spacing={1}>
                  {uploadedImages.map((image) => (
                    <Grid item xs={4} key={image.id}>
                      <Card sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="80"
                          image={image.url}
                          alt={image.name}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => insertImageToEmail(image.url)}
                        />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.8)' }}
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Panel - Participant Info & Preview */}
        <Grid item xs={12} lg={6}>
          {/* Participant Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              👤 Participant Information
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>🎭 Select Event</InputLabel>
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

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField 
                  label="👤 Name" 
                  fullWidth 
                  value={participant.name} 
                  onChange={e => setParticipant({ ...participant, name: e.target.value })} 
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="🎫 Seat" 
                  fullWidth 
                  value={participant.seat} 
                  onChange={e => setParticipant({ ...participant, seat: e.target.value })} 
                  placeholder="e.g., A5, B12"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="📧 Email Address" 
                  fullWidth 
                  type="email"
                  value={participant.email} 
                  onChange={e => setParticipant({ ...participant, email: e.target.value })} 
                />
              </Grid>
            </Grid>
            
            {selectedEvent && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Selected Event:</strong> {participant.event}<br />
                  <strong>Date:</strong> {participant.date}
                </Typography>
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleGeneratePreview}
                startIcon={<Preview />}
                fullWidth
                disabled={!participant.name || !participant.email || !selectedEvent}
                sx={{ bgcolor: '#2196f3' }}
              >
                Generate Preview & QR
              </Button>
            </Box>
          </Paper>

          {/* Quick Actions */}
          {preview && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                ⚡ Quick Actions
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<Send />}
                    color="success"
                  >
                    Send Email
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<Download />}
                    onClick={handleDownloadQR}
                  >
                    QR Code
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<Download />}
                    onClick={handleExportPDF}
                    color="secondary"
                  >
                    Export PDF
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<PhotoCamera />}
                    component="label"
                  >
                    Add Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* Full Width Preview Section */}
        {preview && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                👁️ Live Preview
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <div ref={previewRef}>
                {/* Subject Preview */}
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom color="text.secondary">
                    📧 Subject:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f0f7ff', borderLeft: '4px solid #2196f3' }}>
                    <Typography variant="h6" color="primary">
                      {preview.subject}
                    </Typography>
                  </Paper>
                </Box>

                {/* Email Body Preview */}
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom color="text.secondary">
                    📄 Email Content:
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    bgcolor: emailLayout.backgroundColor,
                    color: emailLayout.textColor,
                    fontSize: emailLayout.fontSize,
                    fontFamily: emailLayout.fontFamily,
                    border: '1px solid #e0e0e0'
                  }}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: preview.body }}
                      style={{ 
                        fontSize: emailLayout.fontSize + 'px',
                        fontFamily: emailLayout.fontFamily,
                        lineHeight: 1.6
                      }}
                    />
                  </Paper>
                </Box>

                {/* QR Code Section */}
                {qrCode && (
                  <Box textAlign="center" sx={{ 
                    p: 3, 
                    bgcolor: '#f8f9fa', 
                    borderRadius: 2,
                    border: '2px dashed #2196f3'
                  }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      🎫 QR Code Ticket
                    </Typography>
                    <Box sx={{ 
                      display: 'inline-block', 
                      p: 2, 
                      bgcolor: 'white', 
                      borderRadius: 2,
                      boxShadow: 2
                    }}>
                      <img 
                        src={qrCode} 
                        alt="QR Code" 
                        style={{ 
                          width: 200, 
                          height: 200, 
                          border: '2px solid #ddd',
                          borderRadius: 8
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      📱 Scan this code for event entry verification
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Ticket ID: {selectedEvent}-{Date.now().toString().slice(-6)}
                    </Typography>
                  </Box>
                )}
              </div>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onClose={() => setShowImageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          🖼️ Add Images to Email
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center" sx={{ py: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              size="large"
              sx={{ mb: 2 }}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              Supported formats: JPG, PNG, GIF, WebP
            </Typography>
          </Box>
          
          {uploadedImages.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {uploadedImages.map((image) => (
                <Grid item xs={4} key={image.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="100"
                      image={image.url}
                      alt={image.name}
                    />
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" noWrap>
                        {image.name}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Button
                          size="small"
                          onClick={() => insertImageToEmail(image.url)}
                          variant="outlined"
                        >
                          Insert
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImageDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MailMergePage;
