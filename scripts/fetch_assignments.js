const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://raw.githubusercontent.com/kunal-kushwaha/DSA-Bootcamp-Java/main/assignments/';

const ASSIGNMENT_FILES = [
  '01-flow-of-program.md',
  '02-first-java.md',
  '03-conditionals-loops.md',
  '04-functions.md',
  '05-arrays.md',
  '06-searching.md',
  '07-sorting.md',
  '08-strings.md',
  '09-patterns.md',
  '10-recursion.md',
  '11-bitwise.md',
  '12-math.md',
  '13-complexities.md',
  '14-oop.md',
  '15-linkedlist.md',
  '16-stack-queue.md',
  '17-trees.md',
  '18-heaps.md'
];

function fetchFile(filename) {
  return new Promise((resolve, reject) => {
    const url = BASE_URL + filename;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve({ filename, content: '' });
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ filename, content: data }));
    }).on('error', err => reject(err));
  });
}

function parseMarkdown(filename, content) {
  const idPrefix = filename.replace('.md', '');
  const rawTitle = filename.replace('.md', '').replace(/^\d+-/, '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  
  const lines = content.split('\n');
  let videoLink = null;
  const problems = [];
  
  let currentDifficulty = 'Easy';
  let questionIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for video link
    const videoMatch = line.match(/\[Video Link\]\((https?:\/\/[^\)]+)\)/i) || line.match(/(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s\)]+)/i);
    if (videoMatch && !videoLink) {
      videoLink = videoMatch[1];
    }

    // Check for section headers / difficulty
    if (line.startsWith('### Easy') || line.startsWith('## Easy') || line.toLowerCase().includes('basic java programs')) {
      currentDifficulty = 'Easy';
    } else if (line.startsWith('### Medium') || line.startsWith('## Medium') || line.toLowerCase().includes('intermediate java programs')) {
      currentDifficulty = 'Medium';
    } else if (line.startsWith('### Hard') || line.startsWith('## Hard')) {
      currentDifficulty = 'Hard';
    }

    // Check for list items (numbered or bulleted)
    const markdownLinkMatch = line.match(/^(\d+\.|\-|\*)\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)(.*)/);
    const plainQuestionMatch = line.match(/^(\d+\.|\-|\*)\s+(.+)/);

    if (markdownLinkMatch) {
      const title = markdownLinkMatch[2].trim();
      const url = markdownLinkMatch[3].trim();
      const extra = markdownLinkMatch[4] ? markdownLinkMatch[4].trim() : '';
      
      let platform = 'Other';
      if (url.includes('leetcode.com')) platform = 'LeetCode';
      else if (url.includes('geeksforgeeks.org')) platform = 'GeeksforGeeks';
      else if (url.includes('hackerrank.com')) platform = 'HackerRank';
      else if (url.includes('codingninjas.com') || url.includes('naukri.com')) platform = 'CodeStudio';
      else if (url.includes('spoj.com')) platform = 'SPOJ';
      else if (url.includes('codeforces.com')) platform = 'Codeforces';

      problems.push({
        id: `${idPrefix}-q${questionIndex++}`,
        title: extra ? `${title} ${extra}` : title,
        url: url,
        platform: platform,
        difficulty: currentDifficulty
      });
    } else if (plainQuestionMatch && !line.toLowerCase().includes('submit the following') && !line.toLowerCase().includes('create flowchart') && !line.startsWith('#') && !line.startsWith('---')) {
      const text = plainQuestionMatch[2].trim();
      if (text.length > 3 && !text.startsWith('[Video Link]') && !text.toLowerCase().startsWith('video link')) {
        problems.push({
          id: `${idPrefix}-q${questionIndex++}`,
          title: text,
          url: null,
          platform: 'Conceptual / Practice',
          difficulty: currentDifficulty
        });
      }
    }
  }

  return {
    id: idPrefix,
    title: rawTitle,
    filename: filename,
    videoLink: videoLink,
    totalProblems: problems.length,
    problems: problems
  };
}

async function main() {
  console.log('Fetching assignment markdown files from GitHub...');
  const results = [];
  
  for (const file of ASSIGNMENT_FILES) {
    process.stdout.write(`Fetching ${file}... `);
    try {
      const res = await fetchFile(file);
      const parsed = parseMarkdown(file, res.content);
      console.log(`✓ (${parsed.problems.length} problems)`);
      results.push(parsed);
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
    }
  }

  const totalAllProblems = results.reduce((acc, cat) => acc + cat.problems.length, 0);
  console.log(`\nTotal categories: ${results.length}`);
  console.log(`Total questions parsed: ${totalAllProblems}`);

  const outputDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save as JSON
  const jsonPath = path.join(outputDir, 'assignments.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`Saved JSON data to ${jsonPath}`);

  // Save as JS file with window variable for zero-CORS local file execution
  const jsPath = path.join(outputDir, 'assignments.js');
  fs.writeFileSync(jsPath, `window.ASSIGNMENTS_DATA = ${JSON.stringify(results, null, 2)};\n`);
  console.log(`Saved JS data to ${jsPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
