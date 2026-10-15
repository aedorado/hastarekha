'use client';

import React from 'react';
import { VedicData, HandProfile, LineAnalysisData, MarriageLineData } from '@/types/palmistry';

interface LinesTabProps {
  vedicData: VedicData;
  updateVedicField: (key: keyof VedicData, value: any) => void;
  profile: HandProfile;
  updateLineField: (line: string, value: string) => void;
  updateProfileField: (key: keyof HandProfile, value: any) => void;
}

export default function LinesTab({
  vedicData,
  updateVedicField,
  profile,
  updateLineField,
  updateProfileField,
}: LinesTabProps) {
            const LINE_SIGNS = ['Star ⭐', 'Cross ✝', 'Square □', 'Triangle △', 'Island ◯', 'Dot •', 'Fish 🐟', 'Macchā Rekhā 🐟', 'Trident ψ', 'Diamond Chain', 'Canopy (Circle at end)', 'Flag', 'Mole', 'Grille #'];
          const LINE_FEATURES = ['Supportive parallel line', 'Parasite line (draining)', 'Upward branch', 'Downward branch', 'Fork at start', 'Fork at end (Trident)', 'Break', 'Chain section', 'Influence lines merging in', 'Cutting cross-line', 'Double line', 'Frayed/multiple threads'];

          const getLine = (key: keyof typeof vedicData): LineAnalysisData => {
            const existing = vedicData[key] as LineAnalysisData | null;
            return existing || { quality: '', origin: '', terminus: '', signs: [], features: [], age_events: [], notes: '' };
          };
          const updateLine = (key: keyof typeof vedicData, field: keyof LineAnalysisData, value: any) => {
            const current = getLine(key);
            updateVedicField(key, { ...current, [field]: value });
          };
          const toggleLineSign = (key: keyof typeof vedicData, sign: string) => {
            const current = getLine(key);
            const signs = current.signs.includes(sign) ? current.signs.filter((s) => s !== sign) : [...current.signs, sign];
            updateVedicField(key, { ...current, signs });
          };
          const toggleLineFeature = (key: keyof typeof vedicData, feat: string) => {
            const current = getLine(key);
            const features = current.features.includes(feat) ? current.features.filter((f) => f !== feat) : [...current.features, feat];
            updateVedicField(key, { ...current, features });
          };

          const LINE_CONFIGS = [
            {
              key: 'line_life' as const,
              label: 'Life Line (Jīvana Rekhā)',
              emoji: '❤️',
              origin_options: ['Starts from Jupiter mount area', 'Starts from between thumb and Jupiter'],
              terminus_options: [
                'Curves inward toward thumb (100+ longevity, attachment to roots - Note 21 §3)',
                'Branches outward to Moon mount (foreign travel, outward expansion - Note 21 §3)',
                'Ends toward Ketū mount (moksha / highly spiritual - Note 21 §5.1)',
                'Ends at Venus mount',
                'Ends mid-palm',
                'Short (ends at mid-palm)',
              ],
              hint: 'All events of life show on the Life Line. Age counted from top (near Jupiter) downward — midpoint = age 30 (teacher\'s method).',
              signMeanings: {
                'Square □': '□ Square on Life Line: Protection period — square marks where the person was protected from an obstacle.',
                'Island ◯': '◯ Island on Life Line: Struggle for that entire duration of island.',
                'Star ⭐': '⭐ Star on Life Line: Sudden event or shock at that age.',
                'Cross ✝': '✝ Cross on Life Line: Obstacle, disease, or difficult event.',
                'Fish 🐟': '🐟 Fish on Life Line: Power, name/fame, spiritual growth, researcher-type insight — but explicitly does NOT bring money.',
                'Macchā Rekhā 🐟': '🐟 Macchā Rekhā (Samrāṭ Yoga): Note 21 — the age at which this forms marks an active samrāṭ yoga, but it also brings health problems. The teacher herself said she had not personally seen this sign.',
                'Canopy (Circle at end)': '◯ Canopy at Life Line end: Whole life is protected, however many ups and downs occur.',
              },
            },
            {
              key: 'line_fate' as const,
              label: 'Fate Line (Bhāgya Rekhā / Dhana Rekhā)',
              emoji: '⚡',
              origin_options: [
                'From wrist/maṇibandha (early self-made career)',
                'From Moon mount (public/state-government support, or Moon-related income: arts, share market, rental, interest - Note 23 §2.2)',
                'From Venus mount (family business, deep family support - Note 23 §2.2)',
                'From Life Line / joined (father-figure responsibility for family - Note 23 §1)',
                'Second fate line starting mid-palm (additional income source in 30s/40s, alongside the main line - Note 23 §2.2)',
                'From Head Line (career begins after 40-45)',
                'From Heart Line (very late start ~50+)',
              ],
              terminus_options: [
                'Ends at Saturn mount (complete karma / career)',
                'Stops at Head Line (career halted/altered around 40-50 due to mental decision/anger - Note 23 §3.1)',
                'Stops at Heart Line (career impacted by emotional disturbance or relationship - Note 23 §3.2)',
                'Branch goes to Jupiter mount (teaching, spirituality, storytelling, or motivational speaking enters the career)',
                'Branch goes to Mercury mount (business diversification, higher study - Note 23 §5)',
                'Branch goes to Sun mount (public acclaim & fame)',
                'Runs full length',
              ],
              hint: 'Also called career line, wealth line. Age counted from wrist (maṇibandha = age 0) upward. Two fate lines = two income streams (Note 23 §2.2).',
              signMeanings: {
                'Diamond Chain': '💎 Diamond Chain at end of Fate Line: Wish fulfilment — doubles the power of the fate line throughout life.',
                'Island ◯': '◯ Island: Career struggle / financial difficulty for that duration.',
                'Cross ✝': '✝ Cross: Career obstacle or sudden change.',
                'Square □': '□ Square: Protection from career obstacles/challenges — "not hand-to-mouth," has savings. Can also indicate a property/asset in combination with other signs.',
                'Triangle △': '△ Triangle: Asset indicator — property, land, or major long-term investment.',
                'Star ⭐': '⭐ Star: Sudden shock/disturbance in career at that age (general Star rule — no fate-line-specific meaning was taught).',
                'Trident ψ': 'ψ Trident at end: Strong drive for and success in one\'s work; career continues with name and fame into old age (50s-70s+).',
              },
            },
            {
              key: 'line_head' as const,
              label: 'Head / Brain Line (Mastiṣka Rekhā)',
              emoji: '🧠',
              origin_options: [
                'Joined with Life Line (follows family guidance, traditional - Note 24 §2.5A)',
                'Slight gap from Life Line (independent thinker, shares views respectfully - Note 24 §2.5B)',
                'Large gap (finger-width) from Life Line (risk-taker, self-willed, acts purely on own terms - Note 24 §2.5C)',
                'Starts independently from Jupiter area (high intellectual ambition)',
                'Starts from Mars inner (quick-tempered, combative thought process)',
              ],
              terminus_options: [
                'Straight across to upper Mars (very good if the mount\'s condition is good — strong personality; not good if the mount\'s condition is poor - Note 24 §2.7D)',
                'Sloping/wavy toward Moon mount — very dangerous: mood swings, daydreaming/living in imagination (not necessarily bad), possible depression; watch for a cross/star at the end (suicidal-tendency warning) - Note 24 §2.7E/§2.6N',
                'Deep dip into lower Moon (overthinking, depression / anxiety risk if Moon afflicted)',
                'Fork at end (Writer\'s Fork — one branch to Mercury, one to Mars or Moon: multitasking, good writer/artist, business mind, BUT the mind stays disturbed/not calm despite the multitasking - Note 24 §2.7H)',
                'Ends at Mercury mount (very logical, very creative, out-of-the-box thinker, very intelligent)',
              ],
              hint: 'The base of the whole hand — manifestation tool. If thought process is strong, lines form. Also called: Mātṛ rekhā, Śīrṣa rekhā, Bhoga rekhā.',
              signMeanings: {
                'Island ◯': '◯ Island on Head Line: Mental struggle, tension, stress for that duration.',
                'Square □': '□ Square: Mental protection — thought process stabilized.',
                'Star ⭐': '⭐ Star: Sudden mental shock or breakthrough.',
                'Cross ✝': '✝ Cross: Mental conflict, accident, or head injury.',
              },
            },
            {
              key: 'line_heart' as const,
              label: 'Heart Line (Hṛidaya Rekhā)',
              emoji: '💖',
              origin_options: [
                'From percussion/little-finger side (standard starting point)',
              ],
              terminus_options: [
                'Ends at percussion (outer edge — deep emotional capacity)',
                'Downward branch touching Head Line (emotional turbulence / heartbreak affecting thought process - Note 26 §2.1)',
                'Upward branches toward mounts (deep latent desires directed toward that mount - Note 26 §2.1)',
                'Multiple branches at end (multiple hobbies / late-life interests - Note 26 §2.1)',
                'Short (ends at Saturn)',
                'Ends at Jupiter mount (practical but fair-minded; gives honest views in groups without being harsh on others; guru-like wisdom, straightforward)',
                'Ends between Jupiter and Saturn (balanced, realistic, mature emotions)',
                'Ends at Saturn mount (cold, somewhat selfish (matlabī), little warmth or emotional attachment; speaks only when it serves a purpose; if curved toward Saturn specifically: only physical love, no feeling of love)',
                'Ends at upper Mars (aggressive emotions, reactive)',
              ],
              hint: 'Shows emotional life, relationships, and heart health. Age counted from Mercury side leftward: 18+6+18+6… method (teacher Method A).',
              signMeanings: {
                'Island ◯': '◯ Island: Emotional struggle or broken relationship for that duration.',
                'Cross ✝': '✝ Cross: Heartbreak or serious relationship obstacle.',
                'Square □': '□ Square: Emotional protection.',
                'Star ⭐': '⭐ Star: Sudden emotional event — can be positive or negative.',
              },
            },
            {
              key: 'line_sun' as const,
              label: 'Sun / Apollo Line (Sūrya Rekhā)',
              emoji: '☀️',
              origin_options: [
                'From Moon mount (mass appeal, public support, female patronage - Note 26 §3.2)',
                'From Mars - Pūrva-Puṇya Rekhā (past-life merit: deep research, courage, comedy/arts - Note 26 §3.2)',
                'From Venus mount (fame via prestigious family heritage, in-laws, or feminine grace - Note 26 §3.2)',
                'Above Heart Line only (fame & soul satisfaction after age 50 or through children - Note 26 §3.1)',
              ],
              terminus_options: [
                'Ends at Sun mount (full soul satisfaction & renown)',
                'Segmented / Wavy (struggle for soul satisfaction, unfulfilled despite work - Note 26 §3.3)',
                'Trident / Fork at end (renown across 2-3 distinct domains - Note 26 §3.3)',
                'Reaches Heart Line only',
              ],
              hint: 'Governs soul satisfaction (ātma-santoṣa) and fame. Absence or wavy line = lacks work satisfaction despite success (Note 26 §3.1).',
              signMeanings: {
                'Diamond Chain': '💎 Diamond Chain at end of Sun Line: Wish fulfilment and doubled fame power.',
                'Trident ψ': 'ψ Trident at Sun Line end: Fame in 2+ ways simultaneously (Mercury + Saturn channels).',
                'Island ◯': '◯ Island: Setback/scandal in reputation for that period.',
                'Cross ✝': '✝ Cross: Obstacle or defamation in career/fame.',
                'Star ⭐': '⭐ Star: Sudden fame or recognition.',
                'Square □': '□ Square: Protection of reputation.',
              },
            },
          ] as const;

          return (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-medium leading-relaxed">
                📖 <strong>Key Sign Rules:</strong> Cross on Jupiter = marriage/education (good). Cross elsewhere = disease/obstacle. Star on Moon = suicidal tendency. Square anywhere = protection. Island on any line = struggle for that duration. Diamond Chain at line end = wish fulfilment (doubles power).
              </div>

              {LINE_CONFIGS.map((line) => {
                const lineData = getLine(line.key as keyof typeof vedicData);
                return (
                  <div key={line.key} className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                    <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                      <span>{line.emoji}</span>
                      {line.label}
                    </h4>
                    <p className="text-[10px] text-stone-500 leading-relaxed italic">{line.hint}</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Line Quality</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={lineData.quality}
                          onChange={(e) => updateLine(line.key as any, 'quality', e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Normal">Normal / Good</option>
                          <option value="Faint/Thin">Faint/Thin</option>
                          <option value="Dark/Bleeding">Dark/Bleeding (difficult)</option>
                          <option value="Broken">Broken</option>
                          <option value="Wavy/Uneven">Wavy/Uneven</option>
                          <option value="Chain-like">Chain-like (struggle throughout)</option>
                          <option value="Double">Double line (very strong)</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Origin Point</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={lineData.origin}
                          onChange={(e) => updateLine(line.key as any, 'origin', e.target.value)}>
                          <option value="">Select origin...</option>
                          {line.origin_options.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Terminus (Ending)</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={lineData.terminus}
                          onChange={(e) => updateLine(line.key as any, 'terminus', e.target.value)}>
                          <option value="">Select terminus...</option>
                          {line.terminus_options.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Signs */}
                    <div>
                      <label className="form-label text-xs mb-1.5 block">Signs on this Line</label>
                      <div className="flex flex-wrap gap-1.5">
                        {LINE_SIGNS.map((sign) => (
                          <label key={sign} className={`flex items-center gap-0.5 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${lineData.signs.includes(sign) ? 'bg-accent-gold text-white border-accent-gold' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-accent-gold/40'}`}>
                            <input type="checkbox" className="sr-only"
                              checked={lineData.signs.includes(sign)}
                              onChange={() => toggleLineSign(line.key as any, sign)} />
                            {sign}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Structural features */}
                    <div>
                      <label className="form-label text-xs mb-1.5 block">Structural Features</label>
                      <div className="flex flex-wrap gap-1.5">
                        {LINE_FEATURES.map((feat) => (
                          <label key={feat} className={`flex items-center gap-0.5 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${lineData.features.includes(feat) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-emerald-400'}`}>
                            <input type="checkbox" className="sr-only"
                              checked={lineData.features.includes(feat)}
                              onChange={() => toggleLineFeature(line.key as any, feat)} />
                            {feat}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Interpretation */}
                    {(lineData.quality || lineData.signs.length > 0 || lineData.features.length > 0) && (
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] space-y-1 leading-relaxed">
                        {lineData.quality === 'Absent' && <p className="text-rose-700 font-semibold">⚠️ <strong>Line Absent:</strong> {line.key === 'line_fate' ? 'No defined career path or life direction. Person lives without clear karma drive.' : line.key === 'line_sun' ? 'Fame and recognition do not come easily. Success still possible via other lines.' : 'Unusual — note other compensating factors.'}</p>}
                        {lineData.quality === 'Double' && line.key === 'line_life' && (
                          <p className="text-purple-700 font-semibold">✨ <strong>Double Life Line (Notes 21 §2 &amp; 23 §2.1):</strong> Does NOT indicate longevity or long life (ref. Sushant Singh Rajput case study). Indicates a dual lifestyle, living in two places, or two completely distinct life patterns/careers. (A separate parallel non-touching line = Supportive / Mars line).</p>
                        )}
                        {lineData.quality === 'Double' && line.key === 'line_fate' && (
                          <p className="text-emerald-700 font-semibold">✨ <strong>Two Fate Lines (Note 23 §2.2):</strong> Two careers or two income sources (e.g. primary job + investments/rental/part-time teaching).</p>
                        )}
                        {lineData.quality === 'Double' && line.key !== 'line_life' && line.key !== 'line_fate' && (
                          <p className="text-emerald-700 font-semibold">✨ <strong>Double line:</strong> Very strong energy in this area. Acts as a sister/support line.</p>
                        )}
                        {lineData.quality === 'Chain-like' && <p className="text-orange-700 font-semibold">⚠️ <strong>Chain-like:</strong> Struggle throughout the entire duration represented by this line.</p>}
                        {lineData.features.includes('Supportive parallel line') && <p className="text-emerald-700 font-semibold">✨ <strong>Supportive / Mars Line:</strong> A line running parallel to the Life Line without touching it — someone provides real support/help through a difficult period, for as long as the line runs alongside.</p>}
                        {lineData.features.includes('Parasite line (draining)') && <p className="text-rose-700 font-semibold">⚠️ <strong>Parasite line:</strong> Energy being drained from this line. Indicates obligations or relationships that take more than they give.</p>}
                        {lineData.features.includes('Fork at end (Trident)') && <p className="text-emerald-700 font-semibold">✨ <strong>Fork/Trident at end:</strong> Energy divides into 2-3 channels — multiple areas of success or achievement.</p>}
                        {lineData.signs.map((sign) => {
                          const meaning = (line.signMeanings as any)[sign];
                          return meaning ? <p key={sign} className="text-stone-700 font-semibold">{meaning}</p> : null;
                        })}
                      </div>
                    )}

                    <div className="form-group">
                      <textarea className="form-input h-16 resize-none text-xs"
                        placeholder="Additional observations for this line..."
                        value={lineData.notes}
                        onChange={(e) => updateLine(line.key as any, 'notes', e.target.value)} />
                    </div>
                  </div>
                );
              })}

              {/* Simian & Semi-Simian (Sydney Line) — Lectures 24, 26, 27 */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <span>⚡</span>
                    Simian &amp; Semi-Simian (Sydney Line) Formations
                  </h4>
                  <span className="text-[10px] font-semibold text-stone-400">Notes 24, 26, 27</span>
                </div>
                <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 font-medium leading-relaxed">
                  📖 <strong>Core Definition (Note 26 §1):</strong> Head Line (intellect) and Heart Line (emotion) run very close together / touching. If a branch runs across and joins them, it becomes a <strong>Full Simian</strong> line. If no branch joins them, it is called a <strong>Semi-Simian</strong> line.
                </div>

                <div className="space-y-3">
                  <div className="form-group">
                    <label className="form-label text-xs">Simian Formation Type</label>
                    <select className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.simian_type || ''}
                      onChange={(e) => updateVedicField('simian_type', e.target.value)}>
                      <option value="">None — Independent Head &amp; Heart Lines</option>
                      <option value="Full Simian (Heart + Head fused)">Full Simian Line — Head &amp; Heart run close/touching AND a branch joins them across</option>
                      <option value="Semi-Simian / Sydney Line (Bridge branch or parallel touch)">Semi-Simian / Sydney Line — Head &amp; Heart run close/touching, no joining branch</option>
                    </select>
                  </div>

                  {vedicData.simian_type === 'Full Simian (Heart + Head fused)' && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 font-semibold space-y-1 leading-relaxed">
                      🧠💖 <strong>Full Simian Line (Note 26 §1):</strong> Mastiṣka and Hṛdaya Rekhā run very close together with a branch joining them across. Very sharp mind, very practical, very stubborn. Knows how to balance heart and mind when the line quality is good — but becomes irritable, anxious, or suspicious (śakkī) when unbalanced.
                    </div>
                  )}

                  {vedicData.simian_type === 'Semi-Simian / Sydney Line (Bridge branch or parallel touch)' && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 font-semibold space-y-1 leading-relaxed">
                      🌉 <strong>Semi-Simian / Sydney Line (Note 24 §2.7B):</strong> Head and Heart Lines run very close together / touching, with no branch joining them.
                      <p className="mt-1 text-stone-700 font-normal">
                        Stubborn (jiddi) — once an idea sits in the mind it cannot be removed; very practical (but also check the heart line); very emotional, yet thinks differently; motivated by "show me something different"; research-oriented mind.
                      </p>
                    </div>
                  )}

                  <div className="form-group">
                    <textarea className="form-input h-14 resize-none text-xs"
                      placeholder="Simian / Sydney line observations (e.g. connecting bridge branch origin, single palm vs both hands)..."
                      value={vedicData.simian_notes || ''}
                      onChange={(e) => updateVedicField('simian_notes', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Mercury / Health Line (Note 27) */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                  ☿ Mercury / Health Line (Budha Rekhā — Note 27 dedicated lecture)
                </h4>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-medium leading-relaxed">
                  <strong>Key rule:</strong> Absence of Mercury line = better than its presence. Its presence shows health/business fluctuation. When present, character depends entirely on its origin and path.
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Mercury Line Present?</label>
                  <div className="flex gap-3 mt-1">
                    {(['Absent (better)', 'Present'] as const).map((opt) => {
                      const isAbsent = opt === 'Absent (better)';
                      const current = vedicData.line_mercury_present;
                      const isSelected = isAbsent ? current === false : current === true;
                      return (
                        <label key={opt} className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${isSelected ? (isAbsent ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-orange-500 text-white border-orange-500') : 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                          <input type="radio" className="sr-only"
                            checked={isSelected}
                            onChange={() => updateVedicField('line_mercury_present', isAbsent ? false : true)} />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {vedicData.line_mercury_present === true && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="form-label text-xs">Mercury Line Characteristics (check all that apply)</label>
                      {[
                        { key: 'line_mercury_starts_below_heart' as const, label: 'Starts below Heart Line → health problems', color: 'rose' },
                        { key: 'line_mercury_starts_above_heart' as const, label: 'Starts only above Heart Line → healer / business line (good)', color: 'emerald' },
                        { key: 'line_mercury_joins_moon' as const, label: 'Runs Moon → Mercury mount = Intuition Line (premonition ability)', color: 'blue' },
                        { key: 'line_mercury_single_vertical' as const, label: 'Single vertical line on Mercury mount only = sudden money gain', color: 'amber' },
                      ].map(({ key, label, color }) => (
                        <label key={key} className={`flex items-start gap-2 cursor-pointer font-medium text-xs text-stone-700 p-2 rounded-lg border ${(vedicData[key] as boolean) ? `bg-${color}-50 border-${color}-200 text-${color}-800` : 'bg-stone-50 border-stone-200'}`}>
                          <input type="checkbox" className="rounded text-accent-gold focus:ring-accent-gold mt-0.5"
                            checked={(vedicData[key] as boolean) || false}
                            onChange={(e) => updateVedicField(key, e.target.checked)} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="form-group">
                      <textarea className="form-input h-16 resize-none text-xs"
                        placeholder="Mercury line notes — path, signs, any cuts or islands..."
                        value={(vedicData.line_mercury_data as LineAnalysisData | null)?.notes || ''}
                        onChange={(e) => {
                          const current = (vedicData.line_mercury_data as LineAnalysisData | null) || { quality: '', origin: '', terminus: '', signs: [], features: [], age_events: [], notes: '' };
                          updateVedicField('line_mercury_data', { ...current, notes: e.target.value });
                        }} />
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Vivāha Rekhā (Marriage Line) — Lecture 28 ─── */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    💍 Vivāha Rekhā (Marriage Line / Śīla-guṇa Rekhā)
                  </h4>
                  <span className="text-[10px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                    Mercury Mount (Budha Parvata) • Lecture 28
                  </span>
                </div>

                {/* Consultation Principle / Ethical Warning */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-950">
                    <span>⚠️</span> Palmist Ethics &amp; Deśa-Kāla Principle (Lecture 28 §4):
                  </p>
                  <p className="text-[11px] text-amber-800">
                    • <strong>Never declare an extramarital affair</strong> from the hand — palm lines register emotional impressions, attractions, or past crushes.<br />
                    • <strong>No line ≠ no marriage</strong> (indicates low romantic dependency or practical detachment).<br />
                    • <strong>Multiple lines ≠ multiple spouses</strong> (reflects deep infatuations, broken engagements, or sequential relationship negotiations).
                  </p>
                </div>

                {(() => {
                  const mData = vedicData.line_marriage || {
                    quality: '',
                    formations: [],
                    estimated_age: '',
                    has_parasite_line_on_life: false,
                    secondary_lines_count: '',
                    venus_line_cutting: false,
                    reaches_sun_mount: false,
                    cuts_sun_mount: false,
                    crosses_heart_line: false,
                    notes: '',
                  };

                  const updateMarriageField = <K extends keyof typeof mData>(field: K, value: typeof mData[K]) => {
                    updateVedicField('line_marriage', { ...mData, [field]: value });
                  };

                  const toggleFormation = (formName: string) => {
                    const current = mData.formations || [];
                    const normalized = current.map((f) => (f === '>< Divorce Indication' ? '>--< Divorce Indication' : f));
                    const next = normalized.includes(formName)
                      ? normalized.filter((f) => f !== formName)
                      : [...normalized, formName];
                    updateMarriageField('formations', next);
                  };

                  const VIVAHA_FORMATIONS = [
                    { name: 'Sharp Upward Hook', desc: 'No marriage / lifelong bachelorhood / aversion to marriage (Lecture 28 §5 #1)', icon: '🚫' },
                    { name: 'Cut by Vertical Line', desc: 'Sudden break or partner accidental danger (Lecture 28 §5 #2)', icon: '⚡' },
                    { name: 'Continues after Vertical Cut', desc: 'Trouble weathered; smooth line = resolved; dark line = trouble escalates (Lecture 28 §5 #3)', icon: '🔄' },
                    { name: 'Dropping toward Heart Line', desc: 'Dull married life; low emotional connection; emotional burden / heartbreak (Lecture 28 §5 #4)', icon: '💔' },
                    { name: 'Cutting Heart Line', desc: 'Worst sorrowful termination; sorrowful end of married life (Lecture 28 §5 #4)', icon: '⚡' },
                    { name: 'Short Downward Branches', desc: 'Normal ups and downs (found in 50%+ of hands) (Lecture 28 §5 #5)', icon: '〰️' },
                    { name: 'Gentle Upward Curve / Upward Branches', desc: 'Happy, auspicious married life (cross-check Guru/Mars in female, Venus in male) (Lecture 28 §5 #6)', icon: '✨' },
                    { name: 'Circle / Dot at End', desc: 'Spouse mortality / death indication (Lecture 28 §5 #8)', icon: '⭕' },
                    { name: 'Small Island', desc: 'Acute, sudden crisis felt with high shock value (felt more than big island) (Lecture 28 §5.1)', icon: '⚠️' },
                    { name: 'Large Island', desc: 'Chronic ongoing struggle normalized from day one (Lecture 28 §5.1)', icon: '⚠️' },
                    { name: 'Fork at Start', desc: 'Distraction, hesitation, or dual parental/cultural interference in beginning (Lecture 28 §5.2)', icon: '🌱' },
                    { name: 'Fork at End', desc: 'Gradual loss of interest / emotional estrangement in twilight years (Lecture 28 §5.2)', icon: '🥀' },
                    { name: 'Fork in Middle', desc: 'Upward branch = good growth; downward branch = bad friction (Lecture 28 §5.2)', icon: '🌿' },
                    { name: 'Triangle on Line', desc: 'Extremely auspicious and rare blessing in marital life (Lecture 28 §5 #12)', icon: '🔺' },
                    { name: 'Reaching Sun Mount', desc: 'Name, fame, and wealth gained after marriage (Lecture 28 §5.3)', icon: '🌟' },
                    { name: 'Cutting Sun Mount/Line', desc: 'Scandal, defamation, or financial dispute due to a woman/spouse (Lecture 28 §5.3)', icon: '⚠️' },
                    { name: 'Line from Venus Mount Cutting', desc: 'Extreme domestic violence or spousal harm risk — check Mars & Thumb (Lecture 28 §5.6)', icon: '⚔️' },
                    { name: '>--< Divorce Indication', desc: 'Classical >--< (bifurcated on both entry and exit) separation sign indicating divorce (Lecture 28 §5 #16)', icon: '⚡' },
                    { name: 'Downward Hook', desc: 'Permanent unresolved marital deadlock (Lecture 28 §5 #17)', icon: '⚓' },
                  ];

                  return (
                    <div className="space-y-4">
                      {/* Line Quality */}
                      <div className="form-group">
                        <label className="form-label text-xs font-semibold text-stone-800">Line Quality (Vivāha Rekhā Svabhāva)</label>
                        <select
                          className="form-input bg-white border border-stone-200 text-xs"
                          value={mData.quality || ''}
                          onChange={(e) => updateMarriageField('quality', e.target.value as any)}
                        >
                          <option value="">Select Quality...</option>
                          <option value="Normal (Healthy)">Normal / Balanced (Indicative of a happy married life)</option>
                          <option value="Faint/Thin (Detached)">Faint / Not Visible (Emotionally detached / low romantic commitment)</option>
                          <option value="Dark/Heavy (Rigid/Burdened)">Dark / Heavy — Gaḍhī (Orthodox, rigid, controlling; domestic burdens)</option>
                          <option value="Broken Repeatedly">Broken Repeatedly (Cyclical good/trouble phases)</option>
                          <option value="Zigzag">Zigzag (Rare; fluctuating relationship dynamics)</option>
                          <option value="Absent">Absent (Self-contained / practical; not necessarily no marriage)</option>
                        </select>
                      </div>

                      {/* Parasite Line Alert when Dark Line */}
                      {mData.quality === 'Dark/Heavy (Rigid/Burdened)' && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
                          <p className="font-bold flex items-center gap-1">
                            <span>🔍</span> Check Life Line for Parasite Line (Lecture 28 §4.1):
                          </p>
                          <p className="text-[11px] text-rose-800">
                            A very dark marriage line indicates high pressure and orthodox rigidity. Check if an <em>Upajīvī Rekhā</em> (parasite line) runs alongside the Life Line in this age sector (e.g. sick elder, dependent in-laws straining the marital bond).
                          </p>
                          <label className="flex items-center gap-2 cursor-pointer pt-1 font-semibold text-xs text-rose-950">
                            <input
                              type="checkbox"
                              className="rounded text-rose-600 focus:ring-rose-500"
                              checked={mData.has_parasite_line_on_life || false}
                              onChange={(e) => updateMarriageField('has_parasite_line_on_life', e.target.checked)}
                            />
                            <span>Parasite Line present alongside Life Line</span>
                          </label>
                        </div>
                      )}

                      {/* Age Calibration on Mercury Mount (0–56 scale) */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-group">
                          <label className="form-label text-xs">
                            Estimated Marriage Age (0–56 Scale)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="56"
                              step="0.5"
                              placeholder="e.g. 24"
                              className="form-input text-xs pr-14"
                              value={mData.estimated_age ?? ''}
                              onChange={(e) =>
                                updateMarriageField(
                                  'estimated_age',
                                  e.target.value === '' ? '' : parseFloat(e.target.value)
                                )
                              }
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400">
                              years
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1">
                            Heart Line = 0 • Midpoint ≈ 28 yrs • Base Crease = 56 yrs (Lecture 28 §4.2)
                          </p>
                        </div>

                        <div className="form-group">
                          <label className="form-label text-xs">
                            Affection / Attraction Lines Count
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="6"
                            placeholder="e.g. 1 (primary) or 2+"
                            className="form-input text-xs"
                            value={mData.secondary_lines_count ?? ''}
                            onChange={(e) =>
                              updateMarriageField(
                                'secondary_lines_count',
                                e.target.value === '' ? '' : parseInt(e.target.value)
                              )
                            }
                          />
                          <p className="text-[10px] text-stone-500 mt-1">
                            Primary = darkest/longest line; extra lines = crushes / negotiations
                          </p>
                        </div>
                      </div>

                      {/* Heart Line Linkage Synthesis */}
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-xs">
                        <span className="font-bold text-stone-800 text-[10px] uppercase tracking-wider block">
                          ❤️ Heart Line Synergy (Lecture 28 §5.7):
                        </span>
                        {vedicData.line_heart?.terminus?.includes('Saturn') ? (
                          <p className="text-stone-700">
                            <strong>Arranged Marriage Inclination:</strong> Heart Line terminates under Saturn Mount. Loves with the intellect/head, practical, minds own business.
                          </p>
                        ) : vedicData.line_heart?.terminus?.includes('Jupiter') ? (
                          <p className="text-stone-700">
                            <strong>Love Marriage Inclination:</strong> Heart Line curves up to Jupiter Mount. High romantic idealism and devotion; stronger in Fire and Water hands.
                          </p>
                        ) : (
                          <p className="text-stone-500 italic">
                            Trace the Heart Line terminus to evaluate Love vs. Arranged marriage alignment.
                          </p>
                        )}
                        <p className="text-[10px] text-stone-600 border-t border-stone-200/60 pt-1.5 leading-relaxed">
                          {profile.gender?.toLowerCase() === 'female' ? (
                            <span>
                              👩 <strong>Female Hand Focus:</strong> Cross-verify <strong>Jupiter Mount</strong> (Guru / Pati-kāraka) for husband's status/dharma and <strong>Mars Mount</strong> (Māṅgalya) for domestic peace.
                            </span>
                          ) : profile.gender?.toLowerCase() === 'male' ? (
                            <span>
                              👨 <strong>Male Hand Focus:</strong> Cross-verify <strong>Venus Mount</strong> (Śukra / Patnī-kāraka) for wife's affection, domestic harmony, and vitality.
                            </span>
                          ) : (
                            <span>
                              ⚖️ <strong>Gender Cross-Checks (Lecture 28 §5):</strong> Female → inspect Jupiter &amp; Mars mounts; Male → inspect Venus mount.
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Formations Checklist (17 Formations) */}
                      <div className="space-y-2">
                        <label className="form-label text-xs font-semibold text-stone-800">
                          17 Classical Formations (Lecture 28 §5)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {VIVAHA_FORMATIONS.map(({ name, desc, icon }) => {
                            const isChecked = mData.formations?.includes(name) || (name === '>--< Divorce Indication' && mData.formations?.includes('>< Divorce Indication')) || false;
                            return (
                              <label
                                key={name}
                                className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${isChecked
                                  ? 'bg-pink-50 border-pink-300 text-pink-950 font-medium shadow-2xs'
                                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100/70'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  className="rounded text-pink-600 focus:ring-pink-500 mt-0.5 shrink-0"
                                  checked={isChecked}
                                  onChange={() => toggleFormation(name)}
                                />
                                <div className="space-y-0.5 min-w-0">
                                  <div className="font-semibold text-xs flex items-center gap-1.5">
                                    <span>{icon}</span>
                                    <span>{name}</span>
                                  </div>
                                  <p className="text-[10px] text-stone-500 leading-tight">
                                    {desc}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Marriage Notes */}
                      <div className="form-group">
                        <textarea
                          className="form-input h-16 resize-none text-xs"
                          placeholder="Marriage line notes — partner nature, timing verification with client events, health/parasite cross-checks..."
                          value={mData.notes || ''}
                          onChange={(e) => updateMarriageField('notes', e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Special Yogas (Notes 19-27) */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                  ✨ Special Yogas &amp; Combined Signs
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Mahābhāgya Yoga', desc: 'Life + Fate + Mercury + Sun lines all connect / come from one origin point — everything in life.' },
                    { label: 'Money Room (Dhana Koṭhī)', desc: 'Triangle formed by Fate Line + Head Line + Mercury Line — wealth accumulation sign.' },
                    { label: 'Pūrva-puṇya Rekhā', desc: 'Mars area → Sun line = courage, creativity, research from past-life merits.' },
                    { label: 'Mystic Cross', desc: 'Cross in Plain of Mars between Head and Heart lines = occult/spiritual wisdom.' },
                  ].map(({ label, desc }) => {
                    const tagKey = label.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    const isPresent = profile.tags.includes(tagKey);
                    return (
                      <label key={label} className={`flex items-start gap-2 cursor-pointer p-2 rounded-lg border transition-all ${isPresent ? 'bg-amber-50 border-accent-gold/60 text-stone-800' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
                        <input type="checkbox" className="rounded text-accent-gold focus:ring-accent-gold mt-0.5"
                          checked={isPresent}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...profile.tags, tagKey]
                              : profile.tags.filter((t) => t !== tagKey);
                            updateProfileField('tags', newTags);
                          }} />
                        <div>
                          <span className="font-bold text-stone-800">{label}:</span>
                          <span className="ml-1 text-stone-600">{desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Left vs Right comparison */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                  🤲 Left vs Right Hand Comparison
                </h4>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium leading-relaxed">
                  <strong>Left hand (pūrvārjita karma):</strong> What was brought at birth — destiny, inherited patterns.<br />
                  <strong>Right hand (active/gocara):</strong> What effort produces — current karma, what is changing (rekhā changes every 2-3 months with active use).
                </div>
                <div className="form-group">
                  <textarea className="form-input h-20 resize-none text-xs"
                    placeholder="Note key differences between left and right hands. e.g. 'Left has fate line from moon mount, right has fate line from life line — destiny shifted through own effort.'"
                    value={vedicData.lh_vs_rh_notes || ''}
                    onChange={(e) => updateVedicField('lh_vs_rh_notes', e.target.value)} />
                </div>
              </div>
            </div>
          );
}
