import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { clientId, url } = await request.json();

    if (!clientId || !url) {
      return Response.json(
        { error: 'clientId and url are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Look up the site_health record
    const { data: siteRecord, error: siteError } = await supabase
      .from('site_health')
      .select('id, tenant_id')
      .eq('client_id', clientId)
      .eq('url', url)
      .single();

    if (siteError || !siteRecord) {
      return Response.json(
        { error: 'Site health record not found' },
        { status: 404 }
      );
    }

    // Get the tenant's pagespeed_api_key, falling back to env variable
    let apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || '';

    const { data: tenantData } = await supabase
      .from('tenants')
      .select('google_pagespeed_api_key')
      .eq('id', siteRecord.tenant_id)
      .single();

    if (tenantData?.google_pagespeed_api_key) {
      apiKey = tenantData.google_pagespeed_api_key;
    }

    if (!apiKey) {
      return Response.json(
        { error: 'No PageSpeed API key configured. Add one in Settings or set GOOGLE_PAGESPEED_API_KEY.' },
        { status: 400 }
      );
    }

    // Call Google PageSpeed Insights API
    const encodedUrl = encodeURIComponent(url);
    const pageSpeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&key=${apiKey}&strategy=mobile`;

    const psResponse = await fetch(pageSpeedUrl);

    if (!psResponse.ok) {
      const errBody = await psResponse.text();
      return Response.json(
        { error: `PageSpeed API error: ${psResponse.status}`, details: errBody },
        { status: 502 }
      );
    }

    const psData = await psResponse.json();

    // Extract scores from lighthouseResult.categories
    const categories = psData.lighthouseResult?.categories;
    const performanceScore = categories?.performance?.score != null
      ? Math.round(categories.performance.score * 100)
      : null;
    const seoScore = categories?.seo?.score != null
      ? Math.round(categories.seo.score * 100)
      : null;
    const accessibilityScore = categories?.accessibility?.score != null
      ? Math.round(categories.accessibility.score * 100)
      : null;
    const bestPracticesScore = categories?.['best-practices']?.score != null
      ? Math.round(categories['best-practices'].score * 100)
      : null;

    // Update the site_health record with scores and last_checked_at
    const { data: updated, error: updateError } = await supabase
      .from('site_health')
      .update({
        performance_score: performanceScore,
        seo_score: seoScore,
        accessibility_score: accessibilityScore,
        best_practices_score: bestPracticesScore,
        last_checked_at: new Date().toISOString(),
        raw_data: psData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteRecord.id)
      .select()
      .single();

    if (updateError) {
      return Response.json(
        { error: 'Failed to update site health record', details: updateError.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      scores: {
        performance: performanceScore,
        seo: seoScore,
        accessibility: accessibilityScore,
        bestPractices: bestPracticesScore,
      },
      last_checked_at: updated.last_checked_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
