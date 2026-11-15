export default async function handler(req, res) {
  const results = {};

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
  } catch (e) {
    results.error_message = e.message;
    results.error_cause = e.cause?.message || null;
    results.error_code = e.cause?.code || null;
  }

  // Test IPv6 representation
  try {
    const r2 = await fetch(
      'http://[::ffff:169.254.169.254]/latest/api/token',
      {
        method: 'PUT',
        headers: {
          'X-aws-ec2-metadata-token-ttl-seconds': '21600'
        }
      }
    );
    results.ipv6_status = r2.status;
  } catch (e) {
    results.ipv6_error = e.cause?.code || e.message;
  }

  // Test decimal representation
  try {
    const r3 = await fetch(
      'http://2852039166/latest/api/token',
      {
        method: 'PUT',
        headers: {
          'X-aws-ec2-metadata-token-ttl-seconds': '21600'
        }
      }
    );
    results.decimal_status = r3.status;
  } catch (e) {
    results.decimal_error = e.cause?.code || e.message;
  }

  return res.status(200).json(results);
}
