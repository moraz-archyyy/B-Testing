export default async function handler(req, res) {
  const targetUrl = process.env.VICTIM_API_URL;

  if (!targetUrl) {
    return res.status(500).json({
      error: "VICTIM_API_URL environment variable is missing"
    });
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "Accept": "application/json"
      },
      signal: AbortSignal.timeout(10000)
    });

    const responseText = await response.text();

    let victimCanaryAccessible = false;

    try {
      const data = JSON.parse(responseText);

      victimCanaryAccessible =
        data.owner === "ACCOUNT_A" &&
        (
          Boolean(data.production_canary) ||
          Boolean(data.preview_canary)
        );
    } catch {
      // Response bukan JSON.
    }

    return res.status(200).json({
      attacker: "ACCOUNT_B",
      victim: "ACCOUNT_A",
      test: "CROSS_TENANT_UNAUTHENTICATED",
      credentials_sent: false,
      target_status: response.status,
      redirect_present: response.status >= 300 && response.status < 400,
      redirect_location: response.headers.get("location"),
      victim_canary_accessible: victimCanaryAccessible,
      response_content_type: response.headers.get("content-type"),
      error: null
    });

  } catch (error) {
    return res.status(200).json({
      attacker: "ACCOUNT_B",
      victim: "ACCOUNT_A",
      test: "CROSS_TENANT_UNAUTHENTICATED",
      credentials_sent: false,
      target_status: null,
      redirect_present: false,
      redirect_location: null,
      victim_canary_accessible: false,
      response_content_type: null,
      error: error.message
    });
  }
}
