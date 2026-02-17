const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const archiver = require('archiver');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'cattle-images');
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}
// Serve files from uploads/cattle-images at /uploads
app.use('/uploads', express.static(IMAGES_DIR));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

const DATA_DIR = path.join(__dirname, 'data');
const CATTLE_FILE = path.join(DATA_DIR, 'cattle.json');
const MILK_FILE = path.join(DATA_DIR, 'milk.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize users with pre-defined users
function initializeUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    const users = [
      { id: '1', username: 'lovega', password: 'lovega123', role: 'admin' },
      { id: '2', username: 'lazarus', password: 'lazarus123', role: 'admin' }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }
}
initializeUsers();

// JWT Secret
const JWT_SECRET = 'cattle-info-secret-key-2026';

// Helper functions
function readJson(file) {
  if (!fs.existsSync(file)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Activity logging function
function logActivity(userId, username, action, details) {
  const activity = {
    id: generateId(),
    userId,
    username,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  const activities = readJson(ACTIVITY_FILE);
  activities.unshift(activity); // Add to beginning
  writeJson(ACTIVITY_FILE, activities);
  return activity;
}

// ==================== Authentication Endpoints ====================

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }
  
  const users = readJson(USERS_FILE);
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  
  // Generate token
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  
  // Log activity
  logActivity(user.id, user.username, 'LOGIN', 'User logged in');
  
  res.json({
    success: true,
    user: { id: user.id, username: user.username, role: user.role },
    token,
  });
});

// Verify token endpoint
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  res.json({
    success: true,
    imageUrl,
    imagePath: req.file.filename,
  });
});

// ==================== Activity Log Endpoints ====================

// Get all activities
app.get('/api/activities', (req, res) => {
  const activities = readJson(ACTIVITY_FILE);
  res.json({ success: true, activities });
});

// Clear all activities (admin only)
app.delete('/api/activities', (req, res) => {
  writeJson(ACTIVITY_FILE, []);
  res.json({ success: true, message: 'Activity log cleared' });
});

// Get base URL dynamically
function getBaseUrl(req) {
  // Use HTTPS if request is secure or if deployed on Render
  const protocol = req.get('x-forwarded-proto') || req.protocol;
  return `${protocol}://${req.get('host')}`;
}

// Helper to fix image URLs
function fixImageUrls(cattle, req) {
  const baseUrl = getBaseUrl(req);
  return cattle.map(cow => ({
    ...cow,
    imageUrl: cow.imagePath ? `${baseUrl}/uploads/${cow.imagePath}` : null
  }));
}

// ==================== Cattle endpoints ====================

app.get('/api/cattle', (req, res) => {
  const cattle = readJson(CATTLE_FILE);
  const fixedCattle = fixImageUrls(cattle, req);
  res.json({ success: true, cattle: fixedCattle });
});

app.get('/api/cattle/:id', (req, res) => {
  const cattle = readJson(CATTLE_FILE);
  const cow = cattle.find(c => c.id === req.params.id);
  if (!cow) {
    return res.status(404).json({ success: false, error: 'Cattle not found' });
  }
  const fixedCow = fixImageUrls([cow], req)[0];
  res.json({ success: true, cattle: fixedCow });
});

app.post('/api/cattle', (req, res) => {
  const cattle = readJson(CATTLE_FILE);
  const id = generateId();
  const newCattle = {
    id,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  cattle.push(newCattle);
  writeJson(CATTLE_FILE, cattle);
  
  // Log activity
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET);
      const details = [
        newCattle.breed ? `Breed: ${newCattle.breed}` : null,
        newCattle.gender ? `Gender: ${newCattle.gender}` : null,
        newCattle.dateOfBirth ? `DOB: ${newCattle.dateOfBirth}` : null,
        newCattle.weight ? `Weight: ${newCattle.weight}kg` : null,
        newCattle.status ? `Status: ${newCattle.status}` : null,
      ].filter(Boolean).join(', ');
      logActivity(decoded.id, decoded.username, 'ADD_CATTLE', `Added new cattle: ${newCattle.name || newCattle.tagNumber} (${details})`);
      console.log('Activity logged: ADD_CATTLE for', newCattle.name || newCattle.tagNumber);
    } catch (err) {
      console.error('Failed to log ADD_CATTLE activity:', err.message);
    }
  }
  
  res.json({ success: true, cattle: newCattle });
});

app.put('/api/cattle/:id', (req, res) => {
  let cattle = readJson(CATTLE_FILE);
  const index = cattle.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Cattle not found' });
  }
  
  const oldCattle = cattle[index];
  const changes = [];
  const fieldsToCheck = ['name', 'tagNumber', 'breed', 'gender', 'dateOfBirth', 'weight', 'color', 'status', 'sire', 'dam', 'notes'];
  
  fieldsToCheck.forEach(field => {
    if (req.body[field] !== undefined && oldCattle[field] !== req.body[field]) {
      const fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      changes.push(`${fieldLabel}: ${oldCattle[field] || '(empty)'} → ${req.body[field]}`);
    }
  });
  
  cattle[index] = {
    ...cattle[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeJson(CATTLE_FILE, cattle);
  
  // Log activity
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET);
      const cattleName = oldCattle.name || oldCattle.tagNumber;
      if (changes.length > 0) {
        logActivity(decoded.id, decoded.username, 'UPDATE_CATTLE', `${cattleName}: ${changes.join(', ')}`);
      } else {
        logActivity(decoded.id, decoded.username, 'UPDATE_CATTLE', `${cattleName}: details updated`);
      }
      console.log('Activity logged: UPDATE_CATTLE for', cattleName);
    } catch (err) {
      console.error('Failed to log UPDATE_CATTLE activity:', err.message);
    }
  }
  
  res.json({ success: true, cattle: cattle[index] });
});

app.delete('/api/cattle/:id', (req, res) => {
  let cattle = readJson(CATTLE_FILE);
  const index = cattle.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Cattle not found' });
  }
  const deleted = cattle.splice(index, 1)[0];
  writeJson(CATTLE_FILE, cattle);
  
  // Log activity
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET);
      const details = [
        deleted.breed ? `Breed: ${deleted.breed}` : null,
        deleted.gender ? `Gender: ${deleted.gender}` : null,
        deleted.status ? `Status: ${deleted.status}` : null,
      ].filter(Boolean).join(', ');
      logActivity(decoded.id, decoded.username, 'DELETE_CATTLE', `Deleted cattle: ${deleted.name || deleted.tagNumber} (${details})`);
      console.log('Activity logged: DELETE_CATTLE for', deleted.name || deleted.tagNumber);
    } catch (err) {
      console.error('Failed to log DELETE_CATTLE activity:', err.message);
    }
  }
  
  res.json({ success: true, cattle: deleted });
});

// ==================== Milk production endpoints ====================

app.get('/api/milk', (req, res) => {
  const milk = readJson(MILK_FILE);
  res.json({ success: true, records: milk });
});

app.get('/api/milk/cattle/:cattleId', (req, res) => {
  const milk = readJson(MILK_FILE);
  const records = milk.filter(m => m.cattleId === req.params.cattleId);
  res.json({ success: true, records });
});

app.post('/api/milk', (req, res) => {
  console.log('POST /api/milk called');
  console.log('Request body:', req.body);
  console.log('Auth header:', req.headers.authorization ? 'present' : 'missing');
  
  const milk = readJson(MILK_FILE);
  const id = `milk-${generateId()}`;
  const newRecord = {
    id,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  milk.push(newRecord);
  writeJson(MILK_FILE, milk);
  console.log('Milk record saved, total records:', milk.length);
  
  // Log activity
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET);
      const cowName = req.body.cattleName || req.body.cattleTagNumber;
      const morning = req.body.morningLiters || 0;
      const evening = req.body.eveningLiters || 0;
      logActivity(decoded.id, decoded.username, 'ADD_MILK', `Recorded milk for ${cowName}: ${morning}L (morning) + ${evening}L (evening) = ${req.body.totalLiters}L on ${req.body.date}`);
      console.log('Activity logged: ADD_MILK for', cowName);
    } catch (err) {
      console.error('Failed to log ADD_MILK activity:', err.message);
    }
  }
  
  res.json({ success: true, record: newRecord });
});

app.delete('/api/milk/:id', (req, res) => {
  let milk = readJson(MILK_FILE);
  const index = milk.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }
  const deleted = milk.splice(index, 1)[0];
  writeJson(MILK_FILE, milk);
  
  // Log activity
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET);
      const cowName = deleted.cattleName || deleted.cattleTagNumber;
      logActivity(decoded.id, decoded.username, 'DELETE_MILK', `Deleted milk record for ${cowName}: ${deleted.morningLiters}L (morning) + ${deleted.eveningLiters}L (evening) = ${deleted.totalLiters}L on ${deleted.date}`);
      console.log('Activity logged: DELETE_MILK for', cowName);
    } catch (err) {
      console.error('Failed to log DELETE_MILK activity:', err.message);
    }
  }
  
  res.json({ success: true, record: deleted });
});

// ==================== Export/Backup Endpoints ====================

// Helper function to convert JSON to CSV
function jsonToCSV(data, fields) {
  if (data.length === 0) return '';
  const header = fields.join(',');
  const rows = data.map(item => {
    return fields.map(field => {
      const value = item[field] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });
  return [header, ...rows].join('\n');
}

// Export cattle data as JSON
app.get('/api/export/cattle/json', (req, res) => {
  const cattle = readJson(CATTLE_FILE);
  res.setHeader('Content-Disposition', 'attachment; filename=cattle-export.json');
  res.setHeader('Content-Type', 'application/json');
  res.json(cattle);
});

// Export cattle data as CSV
app.get('/api/export/cattle/csv', (req, res) => {
  const cattle = readJson(CATTLE_FILE);
  const fields = ['id', 'tagNumber', 'name', 'breed', 'gender', 'dateOfBirth', 'weight', 'color', 'status', 'notes', 'imageUrl', 'createdAt', 'updatedAt'];
  const csv = jsonToCSV(cattle, fields);
  res.setHeader('Content-Disposition', 'attachment; filename=cattle-export.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

// Export milk data as JSON
app.get('/api/export/milk/json', (req, res) => {
  const milk = readJson(MILK_FILE);
  res.setHeader('Content-Disposition', 'attachment; filename=milk-export.json');
  res.setHeader('Content-Type', 'application/json');
  res.json(milk);
});

// Export milk data as CSV
app.get('/api/export/milk/csv', (req, res) => {
  const milk = readJson(MILK_FILE);
  const fields = ['id', 'cattleId', 'date', 'morningYield', 'eveningYield', 'totalYield', 'notes', 'createdAt'];
  const csv = jsonToCSV(milk, fields);
  res.setHeader('Content-Disposition', 'attachment; filename=milk-export.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

// Full backup - ZIP file with all data and images
app.get('/api/backup', (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  res.setHeader('Content-Disposition', 'attachment; filename=cattle-info-backup.zip');
  res.setHeader('Content-Type', 'application/zip');
  
  res.on('close', () => {
    console.log('Backup completed. Total bytes:', archive.pointer());
  });
  
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    res.status(500).json({ success: false, error: 'Failed to create backup' });
  });
  
  archive.pipe(res);
  
  // Add data files
  const cattle = readJson(CATTLE_FILE);
  const milk = readJson(MILK_FILE);
  const activities = readJson(ACTIVITY_FILE);
  
  archive.append(JSON.stringify(cattle, null, 2), { name: 'data/cattle.json' });
  archive.append(JSON.stringify(milk, null, 2), { name: 'data/milk.json' });
  archive.append(JSON.stringify(activities, null, 2), { name: 'data/activity.json' });
  
  // Add manifest file
  const manifest = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    cattleCount: cattle.length,
    milkRecordsCount: milk.length,
    activityCount: activities.length,
  };
  archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
  
  // Add images directory if it exists
  if (fs.existsSync(IMAGES_DIR)) {
    const files = fs.readdirSync(IMAGES_DIR);
    files.forEach(file => {
      const filePath = path.join(IMAGES_DIR, file);
      if (fs.statSync(filePath).isFile()) {
        archive.file(filePath, { name: `uploads/cattle-images/${file}` });
      }
    });
  }
  
  archive.finalize();
});

// Import backup - restore data from ZIP or JSON file
app.post('/api/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  
  try {
    if (ext === '.json') {
      // Single JSON file import
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (Array.isArray(data)) {
        // Determine if it's cattle or milk data based on fields
        if (data.length > 0 && data[0].tagNumber) {
          // Cattle data
          writeJson(CATTLE_FILE, data);
          fs.unlinkSync(filePath);
          return res.json({ success: true, message: `Imported ${data.length} cattle records` });
        } else if (data.length > 0 && data[0].cattleId) {
          // Milk data
          writeJson(MILK_FILE, data);
          fs.unlinkSync(filePath);
          return res.json({ success: true, message: `Imported ${data.length} milk records` });
        }
      }
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, error: 'Invalid JSON format' });
    } else if (ext === '.zip') {
      // ZIP file import - extract and restore
      const extract = require('extract-zip');
      const tempDir = path.join(__dirname, 'temp-import');
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      extract(filePath, { dir: tempDir }).then(() => {
        // Restore cattle data
        const importedCattleFile = path.join(tempDir, 'data', 'cattle.json');
        if (fs.existsSync(importedCattleFile)) {
          const importedCattle = JSON.parse(fs.readFileSync(importedCattleFile, 'utf8'));
          writeJson(CATTLE_FILE, importedCattle);
        }
        
        // Restore milk data
        const importedMilkFile = path.join(tempDir, 'data', 'milk.json');
        if (fs.existsSync(importedMilkFile)) {
          const importedMilk = JSON.parse(fs.readFileSync(importedMilkFile, 'utf8'));
          writeJson(MILK_FILE, importedMilk);
        }
        
        // Restore activity data
        const importedActivityFile = path.join(tempDir, 'data', 'activity.json');
        if (fs.existsSync(importedActivityFile)) {
          const importedActivity = JSON.parse(fs.readFileSync(importedActivityFile, 'utf8'));
          writeJson(ACTIVITY_FILE, importedActivity);
        }
        
        // Restore images
        const importedImagesDir = path.join(tempDir, 'uploads', 'cattle-images');
        if (fs.existsSync(importedImagesDir)) {
          const files = fs.readdirSync(importedImagesDir);
          files.forEach(file => {
            const srcFile = path.join(importedImagesDir, file);
            const destFile = path.join(IMAGES_DIR, file);
            if (fs.statSync(srcFile).isFile() && !fs.existsSync(destFile)) {
              fs.copyFileSync(srcFile, destFile);
            }
          });
        }
        
        // Clean up temp files
        fs.rmSync(tempDir, { recursive: true, force: true });
        fs.unlinkSync(filePath);
        
        res.json({ success: true, message: 'Backup restored successfully' });
      }).catch(err => {
        console.error('Extract error:', err);
        fs.unlinkSync(filePath);
        res.status(400).json({ success: false, error: 'Failed to extract ZIP file' });
      });
      return;
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, error: 'Unsupported file format. Use JSON or ZIP' });
    }
  } catch (err) {
    console.error('Import error:', err);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ success: false, error: 'Failed to import file' });
  }
});

// Seed initial data if empty
const initialCattle = [
  {
    id: 'sample-1',
    tagNumber: 'A001',
    name: 'Bessie',
    breed: 'Holstein',
    gender: 'female',
    dateOfBirth: '2022-03-15',
    weight: 550,
    color: 'Black and White',
    status: 'active',
    notes: 'Excellent milk producer, calm temperament',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    tagNumber: 'A002',
    name: 'Thunder',
    breed: 'Angus',
    gender: 'male',
    dateOfBirth: '2021-05-20',
    weight: 850,
    color: 'Black',
    status: 'active',
    sire: 'Champion Bull 123',
    notes: 'Strong breeding bull with excellent genetics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    tagNumber: 'A003',
    name: 'Daisy',
    breed: 'Jersey',
    gender: 'female',
    dateOfBirth: '2023-01-10',
    weight: 420,
    color: 'Light Brown',
    status: 'active',
    dam: 'Jersey Queen 456',
    notes: 'High butterfat milk content',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

if (readJson(CATTLE_FILE).length === 0) {
  writeJson(CATTLE_FILE, initialCattle);
  console.log('Seeded initial cattle data');
}

// Seed initial activity log
if (readJson(ACTIVITY_FILE).length === 0) {
  writeJson(ACTIVITY_FILE, [
    {
      id: 'init-1',
      userId: 'system',
      username: 'System',
      action: 'SYSTEM_INIT',
      details: 'System initialized with sample cattle data',
      timestamp: new Date().toISOString(),
    },
  ]);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('========================================');
  console.log('Pre-defined Users:');
  console.log('  Username: lovegah | Password: lovegah123');
  console.log('  Username: farmer2 | Password: farmer2123');
  console.log('========================================');
  console.log('Auth Endpoints:');
  console.log('  POST   /api/auth/login - Login with username/password');
  console.log('  GET    /api/auth/me - Get current user info');
  console.log('Activity Endpoints:');
  console.log('  GET    /api/activities - Get all activities');
  console.log('  DELETE /api/activities - Clear activity log');
  console.log('Cattle Endpoints:');
  console.log('  POST   /api/upload-image - Upload cattle images');
  console.log('  GET    /api/cattle');
  console.log('  GET    /api/cattle/:id');
  console.log('  POST   /api/cattle');
  console.log('  PUT    /api/cattle/:id');
  console.log('  DELETE /api/cattle/:id');
  console.log('Milk Endpoints:');
  console.log('  GET    /api/milk');
  console.log('  GET    /api/milk/cattle/:cattleId');
  console.log('  POST   /api/milk');
  console.log('  DELETE /api/milk/:id');
  console.log('Export/Backup Endpoints:');
  console.log('  GET    /api/export/cattle/json - Export cattle data as JSON');
  console.log('  GET    /api/export/cattle/csv - Export cattle data as CSV');
  console.log('  GET    /api/export/milk/json - Export milk data as JSON');
  console.log('  GET    /api/export/milk/csv - Export milk data as CSV');
  console.log('  GET    /api/backup - Download full backup (ZIP)');
  console.log('  POST   /api/import - Import backup (JSON or ZIP)');
  console.log('Uploads served at: http://localhost:3001/uploads/');
});
