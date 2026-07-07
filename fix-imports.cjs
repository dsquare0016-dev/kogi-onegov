const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Find all dynamic imports like: const { func1, func2 } = await import('@/lib/postgres-service');
    const regex = /(?:const|let)\s+\{([^}]+)\}\s*=\s*await\s+import\(['"`]@\/lib\/postgres-service['"`]\);?/g;
    
    let importsToExtract = new Set();
    
    content = content.replace(regex, (match, importsStr) => {
        // extract function names
        const names = importsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        names.forEach(n => importsToExtract.add(n));
        return ''; // remove the dynamic import line
    });
    
    if (importsToExtract.size > 0) {
        const importLine = `import { ${Array.from(importsToExtract).join(', ')} } from '@/lib/postgres-service';\n`;
        content = importLine + content;
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated:", filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src', 'routes'));
walkDir(path.join(__dirname, 'src', 'components'));
