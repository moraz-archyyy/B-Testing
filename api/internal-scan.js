// api/internal-scan.js
export default async function handler(req, res) {
  const targets = [
    // AWS VPC default ranges
    { ip: '172.31.0.1', label: 'aws_default_gateway' },
    { ip: '172.31.0.2', label: 'aws_dns' },
    { ip: '10.0.0.1', label: 'vpc_gateway_10' },
    { ip: '10.0.0.2', label: 'vpc_dns_10' },
    { ip: '10.1.0.1', label: 'vpc_subnet_1' },
    { ip: '10.2.0.1', label: 'vpc_subnet_2' },
    { ip: '192.168.0.1', label: 'class_c_gateway' },
    // Vercel internal API kemungkinan
    { ip: '172.31.1.1', label: 'possible_control_plane' },
    { ip: '172.31.255.254', label: 'vpc_broadcast_area' },
  ];

  const results = {};
  const TIMEOUT_MS = 2000;

  for (const target of targets) {
    for (const port of [80, 443, 8080, 8443, 9090]) {
      const key = `${target.label}_${port}`;
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(), TIMEOUT_MS
      );

      try {
        await fetch(`http://${target.ip}:${port}/`, {
          signal: controller.signal
        });
        results[key] = 'CONNECTED';
      } catch (e) {
        const code = e.cause?.code || '';
        if (e.name === 'AbortError') {
          results[key] = 'TIMEOUT';
        } else if (code === 'ECONNREFUSED') {
          results[key] = 'REFUSED';
        } else if (code === 'ENETUNREACH') {
          results[key] = 'UNREACHABLE';
        } else {
          results[key] = `OTHER:${code}`;
        }
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  return res.status(200).json({
    source_function: 'sin1',
    scan_results: results
  });
}
