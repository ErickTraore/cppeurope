'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const fs = require('fs');
const { PresseGle, sequelize } = require('../models');

const OUT_DIR = path.join(__dirname, '..', '..', 'frontend', 'cypress', 'snapshots');
const OUT_JSON = path.join(OUT_DIR, 'pressegle-title-content.json');
const OUT_MD = path.join(OUT_DIR, 'pressegle-title-content.md');

async function run() {
  try {
    await sequelize.authenticate();
    const rows = await PresseGle.findAll({
      attributes: ['id', 'title', 'content'],
      order: [['id', 'ASC']],
      raw: true,
    });
    const data = { table: 'PresseGle', count: rows.length, rows };
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(OUT_JSON, JSON.stringify(data, null, 2), 'utf8');
    const lines = ['# Snapshot PresseGle (title + content)', '', '| id | title | content |', '|----|-------|--------|'];
    rows.forEach((r) => {
      const content = (r.content || '').replace(/\r?\n/g, ' ').slice(0, 80);
      const suffix = (r.content && r.content.length > 80) ? '...' : '';
      lines.push('| ' + r.id + ' | ' + (r.title || '').slice(0, 40) + ' | ' + content + suffix + ' |');
    });
    fs.writeFileSync(OUT_MD, lines.join('\n'), 'utf8');
    console.log('Snapshot écrit:', OUT_JSON, OUT_MD);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
