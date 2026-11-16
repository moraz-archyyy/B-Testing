
export default async function handler(req, res) {
  const target =
    "https://bb-vercel-lab-2026-git-main-hackerone-a-by-moraz.vercel.app/api/check";

  const result = {
    attacker: "ACCOUNT_B",
    victim: "ACCOUNT_A",
    test: "CROSS_TENANT_UNAUTHENTICATED",
    credentials_sent: false,
    target_status: null,
    redirect_present: false,
    victim_canary_accessible: false,
    response_content_type: null,
    error: null
  };

  try {
    const response = await fetch(target, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(8000)
    });

    result.target_status = response.status;
    result.redirect_present =
      response.status >= 300 && response.status < 400;

    result.response_content_type =
      response.headers.get("content-type");

    // Only inspect the known synthetic canary.
    const body = await response.text();

    result.victim_canary_accessible =
      body.includes("prod-canary-A-2026");

  } catch (error) {
    result.error = {
      name: error.name,
      message: error.message,
      code: error.cause?.code || null
    };
  }

  return res.status(200).json(result);
}
