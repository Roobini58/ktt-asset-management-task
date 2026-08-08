import 'dotenv/config';

import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import methodOverride from 'method-override';
import session from 'express-session';
import flash from 'connect-flash';

import indexRoutes from './routes/index.js';
import employeeRoutes from './routes/employees.js';
import categoryRoutes from './routes/categories.js';
import assetRoutes from './routes/assets.js';
import stockRoutes from './routes/stock.js';
import issueRoutes from './routes/issue.js';
import returnRoutes from './routes/return.js';
import scrapRoutes from './routes/scrap.js';
import historyRoutes from './routes/history.js';
import reportRoutes from './routes/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }
  })
);
app.use(flash());

// Make flash messages + current path available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

app.use('/', indexRoutes);
app.use('/employees', employeeRoutes);
app.use('/categories', categoryRoutes);
app.use('/assets', assetRoutes);
app.use('/stock', stockRoutes);
app.use('/issue', issueRoutes);
app.use('/return', returnRoutes);
app.use('/scrap', scrapRoutes);
app.use('/history', historyRoutes);
app.use('/reports', reportRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).render('500', { title: 'Error', error: process.env.NODE_ENV === 'development' ? err : {} });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Asset Management server running on http://localhost:${PORT}`);
});

export default app;
