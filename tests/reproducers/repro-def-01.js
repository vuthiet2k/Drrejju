/**
 * Reproducer for DEF-01: Admin Setting Leak in Flash Sale Section
 */
const http = require('http');

module.exports = async function reproduceDef01(baseUrl) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/`, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const leaked = body.includes('sec_flash_sale_col') || body.includes('Chưa có sản phẩm cho Flash Sale');
        resolve({
          taskId: 'DEF-01',
          overallStatus: !leaked ? 'PASS' : 'FAIL',
          checks: [
            {
              name: 'No admin placeholder leaked',
              status: !leaked ? 'PASS' : 'FAIL',
              details: leaked ? 'Leaked sec_flash_sale_col in response' : 'Clean customer-facing HTML'
            }
          ]
        });
      });
    }).on('error', reject);
  });
};
