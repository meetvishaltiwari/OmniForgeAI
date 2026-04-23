import { Target, TrendingUp, DollarSign, Layout, Activity, Lightbulb, ShieldCheck, Sparkles } from 'lucide-react';

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
};

export function MetaAdRenderer({ data }: { data: any }) {
  if (!data) return null;

  const variant = data.ad_copy_variants?.[0] || {};
  const rationale = data.performance_rationale || {};
  const metrics = rationale.expected_metrics || {};
  const best = rationale.best_recommendation || {};
  const audience = rationale.audience_recommendations || {};

  const primaryText = variant.primary_text?.medium || variant.primary_text?.long || variant.primary_text?.short || variant.primary_text || 'No primary text provided.';
  const whyItWorks = toList(rationale.why_this_image_works);
  const compliance = toList(rationale.compliance_checklist);
  const personas = [...toList(audience.personas), ...toList(audience.interest_clusters)].slice(0, 6);
  const ageGroups = toList(audience.age_groups);
  const regions = toList(audience.regions);
  const budgetAllocation = Object.entries(best.budget_allocation || {}).filter(([, value]) => typeof value === 'string' && value.trim() !== '');

  const strategicTakeaways = [
    rationale.summary,
    best.execution_note,
    rationale.budget_efficiency_note,
    rationale.creative_refresh_note,
    whyItWorks[0]
  ]
    .filter(Boolean)
    .filter((item, idx, arr) => arr.indexOf(item) === idx)
    .slice(0, 4);

  const metricCards = [
    { label: 'Est. CTR', value: metrics.CTR, icon: Activity, classes: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { label: 'Est. ROAS', value: metrics.ROAS, icon: TrendingUp, classes: 'bg-amber-50 border-amber-100 text-amber-700' },
    { label: 'Est. CAC', value: metrics.CAC, icon: DollarSign, classes: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
    { label: 'Est. CPM', value: metrics.CPM, icon: Activity, classes: 'bg-sky-50 border-sky-100 text-sky-700' },
    { label: 'Est. CVR', value: metrics.CVR, icon: TrendingUp, classes: 'bg-rose-50 border-rose-100 text-rose-700' },
    { label: 'Est. CPC', value: metrics.CPC, icon: DollarSign, classes: 'bg-violet-50 border-violet-100 text-violet-700' }
  ].filter(card => card.value);

  const summaryCopy =
    rationale.summary ||
    best.execution_note ||
    best.starting_creative ||
    whyItWorks[0] ||
    'A launch-ready Meta Ads concept with creative direction, copy, and performance guidance.';

  return (
    <div className="space-y-6 text-gray-800 font-sans">
      <section className="rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white overflow-hidden relative">
        <div className="absolute -top-20 -right-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-28 left-10 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
              <Sparkles className="w-3.5 h-3.5" />
              Meta Ads Launch Brief
            </span>
            <h3 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-white">A clearer read on the creative and its launch path</h3>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-7">{summaryCopy}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {best.priority_audience && (
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-slate-200">
                  Audience: {best.priority_audience}
                </span>
              )}
              {best.starting_creative && (
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-slate-200">
                  Start with: {best.starting_creative}
                </span>
              )}
              {variant.CTA_button && (
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-slate-200">
                  CTA: {variant.CTA_button}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3">
            {(metricCards.length > 0 ? metricCards : [
              { label: 'Est. CTR', value: '--', icon: Activity, classes: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
              { label: 'Est. ROAS', value: '--', icon: TrendingUp, classes: 'bg-amber-50 border-amber-100 text-amber-700' },
              { label: 'Est. CAC', value: '--', icon: DollarSign, classes: 'bg-indigo-50 border-indigo-100 text-indigo-700' }
            ]).map((card) => (
              <div key={card.label} className={`rounded-2xl border px-4 py-4 min-h-[116px] ${card.classes}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">{card.label}</span>
                  <card.icon className="w-4 h-4 opacity-60" />
                </div>
                <div className="mt-4 text-xl sm:text-2xl font-black break-words leading-tight">{card.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {strategicTakeaways.length > 0 && (
        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-500">Key Takeaways</div>
              <h4 className="mt-2 text-2xl font-black text-gray-900">What to pay attention to first</h4>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
              {strategicTakeaways.length} highlights
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategicTakeaways.map((takeaway, idx) => (
              <article key={idx} className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-slate-50/80 p-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Takeaway {idx + 1}</div>
                <p className="mt-3 text-sm text-gray-700 leading-7">{takeaway}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,0.9fr] gap-6">
        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">Creative Payload</div>
              <h4 className="mt-1 text-2xl font-black text-gray-900">Copy system</h4>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-slate-50 px-5 py-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Primary Text</div>
              <p className="mt-3 text-sm sm:text-[15px] text-gray-700 leading-7">{primaryText}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Headline</div>
                <p className="mt-3 text-base font-bold text-gray-900">{variant.headline || 'No headline provided'}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Description</div>
                <p className="mt-3 text-sm text-gray-600 leading-7">{variant.description || 'No description provided'}</p>
              </div>
            </div>

            <div className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
              {variant.CTA_button || 'Learn More'}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-fuchsia-600" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-500">Launch Strategy</div>
              <h4 className="mt-1 text-2xl font-black text-gray-900">How to put it into market</h4>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Priority Audience</div>
              <p className="mt-2 text-sm font-semibold text-gray-800">{best.priority_audience || 'Broad prospecting'}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Starting Creative</div>
              <p className="mt-2 text-sm font-semibold text-gray-800">{best.starting_creative || 'Use the first creative variant'}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">First Test</div>
              <p className="mt-2 text-sm font-semibold text-gray-800">{best.copy_variant_to_test_first || variant.headline || 'Test the default variant first'}</p>
            </div>

            {budgetAllocation.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Budget Allocation</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {budgetAllocation.map(([key, value]) => (
                    <span key={key} className="px-3 py-2 rounded-full bg-slate-100 text-xs font-bold text-slate-700 capitalize">
                      {key.replace(/_/g, ' ')}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-500">Creative Rationale</div>
              <h4 className="mt-1 text-2xl font-black text-gray-900">Why this should land</h4>
            </div>
          </div>

          {whyItWorks.length > 0 ? (
            <div className="mt-5 space-y-3">
              {whyItWorks.map((reason, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 text-sm text-gray-700 leading-7">
                  {reason}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-5 py-5 text-sm text-gray-500">
              No supporting rationale was generated for this creative.
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500">Audience Focus</div>
              <h4 className="mt-1 text-2xl font-black text-gray-900">Targeting guidance</h4>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Audience Size</div>
              <p className="mt-2 text-sm font-semibold text-gray-800">{audience.audience_size || 'Not specified'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Gender</div>
                <p className="mt-2 text-sm font-semibold text-gray-800">{audience.gender || 'All genders'}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Age Groups</div>
                <p className="mt-2 text-sm font-semibold text-gray-800">{ageGroups.length > 0 ? ageGroups.join(', ') : 'Not specified'}</p>
              </div>
            </div>

            {regions.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Regions</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {regions.map((region, idx) => (
                    <span key={idx} className="px-3 py-2 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {personas.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Personas & Interest Clusters</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {personas.map((persona, idx) => (
                    <span key={idx} className="px-3 py-2 rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 border border-emerald-100">
                      {persona}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {compliance.length > 0 && (
        <section className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500">Compliance & Guardrails</div>
              <h4 className="mt-1 text-2xl font-black text-gray-900">Checks before launch</h4>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {compliance.map((item, idx) => (
              <span key={idx} className="px-3 py-2 rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 border border-emerald-100">
                {item}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
