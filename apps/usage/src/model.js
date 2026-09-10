export function metric(value, locale = 'en') {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value) : '—';
}

export function remaining(window) {
  if (window.unlimited === true) return null;
  return typeof window.usedPercent === 'number' && Number.isFinite(window.usedPercent)
    && window.usedPercent >= 0 && window.usedPercent <= 100 ? 100 - window.usedPercent : null;
}

export function quotaTargetKey(provider, instance) {
  return JSON.stringify(['cli', provider, instance]);
}

export function quotaIsStale(quota, now = Date.now()) {
  const observed = Date.parse(quota.observedAt ?? '');
  return quota.freshness === 'stale' || !Number.isFinite(observed) || now - observed > 300_000
    || observed > now + 60_000 || quota.windows.some((window) => window.resetsAt && Date.parse(window.resetsAt) <= now);
}

export function aggregateUsage(usages) {
  const totals = { observations: 0, inputTokens: null, outputTokens: null, totalTokens: null, costs: [], confidence: { reported: 0, aggregated: 0, estimated: 0, unknown: 0 } };
  const costs = new Map();
  for (const usage of usages) {
    totals.observations += usage.observations;
    for (const kind of Object.keys(totals.confidence)) totals.confidence[kind] += usage.confidence?.[kind] ?? 0;
    for (const field of ['inputTokens', 'outputTokens', 'totalTokens']) {
      if (typeof usage[field] === 'number' && Number.isFinite(usage[field]) && usage[field] >= 0) totals[field] = (totals[field] ?? 0) + usage[field];
    }
    for (const cost of usage.costs) costs.set(cost.currency, (costs.get(cost.currency) ?? 0) + cost.amount);
  }
  totals.costs = [...costs].map(([currency, amount]) => ({ currency, amount }));
  return totals;
}

export function selectUsage(snapshot, filters) {
  const matches = (target) => (!filters.provider || target.provider === filters.provider) && (!filters.instance || target.instance === filters.instance);
  const targets = snapshot.targets.filter(matches);
  const sessions = snapshot.sessions.filter(matches).filter((session) => !filters.session || session.sessionId === filters.session);
  const totals = filters.session ? aggregateUsage(sessions.map((session) => session.usage))
    : filters.provider || filters.instance ? aggregateUsage(targets.map((target) => target.usage)) : snapshot.totals;
  return { targets, sessions, totals };
}
