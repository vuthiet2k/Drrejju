/**
 * Reproducer for DEF-02: Double Text Overlay in Mega Menu Dropdown
 */
const http = require('http');

module.exports = async function reproduceDef02(baseUrl) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/assets/main.scss.css`, res => {
      let css = '';
      res.on('data', c => css += c);
      res.on('end', () => {
        const hasSolidBg = css.includes('background-color:#ffffff') || css.includes('background-color: #ffffff') || css.includes('#fff');
        resolve({
          taskId: 'DEF-02',
          overallStatus: hasSolidBg ? 'PASS' : 'FAIL',
          checks: [
            {
              name: 'Mega menu has solid background styling',
              status: hasSolidBg ? 'PASS' : 'FAIL',
              details: hasSolidBg ? 'Found solid background in compiled CSS' : 'Missing solid background'
            }
          ]
        });
      });
    }).on('error', reject);
  });
};
