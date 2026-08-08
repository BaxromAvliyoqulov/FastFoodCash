const fs = require('fs');
const path = require('path');

function getStats(dir, ignorePaths = ['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'vendor', 'venv']) {
  let fileCount = 0;
  let dirCount = 0;
  let totalSize = 0;
  let extCounts = {};
  let largestFiles = [];
  let loc = 0;

  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      if (ignorePaths.includes(file)) continue;
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        dirCount++;
        walk(fullPath);
      } else {
        fileCount++;
        totalSize += stat.size;
        
        const ext = path.extname(file).toLowerCase();
        extCounts[ext] = (extCounts[ext] || 0) + 1;
        
        largestFiles.push({ path: fullPath, size: stat.size });
        
        if (['.ts', '.js', '.vue', '.json', '.html', '.css', '.md'].includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            loc += content.split('\n').length;
          } catch(e) {}
        }
      }
    }
  }

  walk(dir);
  
  largestFiles.sort((a, b) => b.size - a.size);
  largestFiles = largestFiles.slice(0, 10).map(f => `${f.path}: ${(f.size / 1024 / 1024).toFixed(2)} MB`);

  return {
    fileCount,
    dirCount,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    extCounts,
    largestFiles,
    estimatedLOC: loc
  };
}

const stats = getStats(__dirname);
console.log(JSON.stringify(stats, null, 2));
