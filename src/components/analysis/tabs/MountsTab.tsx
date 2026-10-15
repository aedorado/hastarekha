'use client';

import React from 'react';
import { VedicData, HandProfile, MountSignData } from '@/types/palmistry';

interface MountsTabProps {
  vedicData: VedicData;
  updateVedicField: (key: keyof VedicData, value: any) => void;
  profile: HandProfile;
  updateMountField: (mount: string, value: string) => void;
}

export default function MountsTab({
  vedicData,
  updateVedicField,
  profile,
  updateMountField,
}: MountsTabProps) {
            // Note 19: Islands exist only on lines, never on mounts.
          const ALL_SIGNS = ['Star ⭐', 'Cross ✝', 'Square □', 'Triangle △', 'Dot •', 'Grille #', 'Mole', 'Fish 🐟', 'Flag 🚩', 'Trident ψ', 'Circle ⭕', 'Conch (Śaṅkha) 🐚', 'Temple (Mandir) 🛕'];

          const MOUNT_CONFIGS = [
            {
              key: 'mount_jupiter' as const,
              label: 'Jupiter Mount (Guru Parvat)',
              emoji: '♃',
              color: 'indigo',
              location: 'Below index finger',
              normal: 'Knowledge, discernment, patience, spirituality, respect for elders, generosity, justice-loving, fortunate.',
              over: 'Over-developed: arrogance, repeated self-praise, belittles others, too-opinionated.',
              under: 'Under-developed: low ambition, poor self-confidence, avoids teaching or guiding.',
              customSigns: ['Ring of Solomon ⭕', 'Line of Sympathy 📏'],
              apexOptions: [
                { value: 'Centered', label: 'Centered — Dominant Planet (Guru-pradhān)', meaning: 'Dominant planet influence on nature. High vivek, moral discernment, patience, and fortunate expansion.' },
                { value: 'Toward Saturn', label: '→ Toward Saturn (Karma / Research)', meaning: 'Knowledge gains seriousness (gambhīrtā), technical acumen, research depth ("khojī"), hardworking patience, and respect for societal rules.' },
                { value: 'Toward Thumb', label: '→ Toward Thumb (Self / Leadership)', meaning: 'Knowledge directed toward "I" (self) — natural leadership ability, extroverted authority, desire to prove oneself, possible overconfidence.' },
                { value: 'Toward Head Line', label: '→ Toward Mind / Head Line (Intellect)', meaning: 'Knowledge channelled through mind & intellect — practicality added to wisdom, multi-disciplinary learning, early research capacity (active from childhood).' },
                { value: 'Toward Heart Line', label: '→ Toward Heart Line (Wisdom + Compassion)', meaning: 'Wisdom tempered by heart — practicality added to wisdom, but because it touches the Heart Line, the native also listens to their heart.' },
              ],
              signMeanings: {
                'Ring of Solomon ⭕': '⭕ Ring of Solomon (Guru Valaya, Notes 13 & 20): Curved semi-circle toward thumb — high sixth sense, ability to listen to nature/animals, psychic and healing wisdom.',
                'Line of Sympathy 📏': '📏 Line of Sympathy (Dayā Rekhā, Note 20): Straight diagonal line across Jupiter — deep empathy and devotion to others, shown without discrimination.',
                'Star ⭐': '⭐ Star on Jupiter: Good sign — multiple channels of name/fame arriving together.',
                'Cross ✝': '✝ Cross on Jupiter (Note 19): Auspicious here (the ONLY positive place for a cross). Signifies happy marriage and education achievements.',
                'Square □': '□ Square on Jupiter: Teaching capacity / strong protection from downfall.',
                'Triangle △': '△ Triangle on Jupiter: Scientific, research-oriented, diplomatic nature.',
                'Conch (Śaṅkha) 🐚': '🐚 Conch (Śaṅkha): High spiritual journey and noble dharmic destiny (Note 21 §1.1).',
                'Temple (Mandir) 🛕': '🛕 Temple (Mandir): Sacred protective roof and devotional excellence (Note 21 §1.4).',
                'Flag 🚩': '🚩 Flag on Jupiter: Renowned reputation and enhanced leadership willpower (Note 21 §1.2).',
              },
            },
            {
              key: 'mount_saturn' as const,
              label: 'Saturn Mount (Śani Parvat)',
              emoji: '♄',
              color: 'slate',
              location: 'Below middle finger',
              normal: 'Discipline, responsibility, karmic work, research, deep focus, solitude. Loves solitary, focused work.',
              over: 'Over-developed: excessive seriousness, melancholy, accident-prone, rigid.',
              under: 'Under-developed: irresponsible, avoids commitments, poor perseverance.',
              apexOptions: [
                { value: 'Centered', label: 'Centered — Dominant Planet (Śani-pradhān)', meaning: 'Strong sense of duty, philosophical solitude, disciplined labor, perseverance through obstacles.' },
                { value: 'Toward Jupiter', label: '→ Toward Jupiter (Wisdom & Dharma)', meaning: 'Adds wisdom, dharma, and benevolence to work/karma. Always brings improvement and auspiciousness (shubhta) to Saturnian results.' },
                { value: 'Toward Sun', label: '→ Toward Sun (Fame through Work)', meaning: 'Desire for fame/recognition through karma. Favourable for career prominence, but arthritis and digestive issues increase; BP (blood pressure) problems can also occur.' },
              ],
              signMeanings: {
                'Star ⭐': '⭐ Star on Saturn: Mixed — accident or sudden event (read with fate line).',
                'Cross ✝': '✝ Cross on Saturn: Accident sign. Disease sign. Not auspicious here.',
                'Square □': '□ Square on Saturn: Protection from accidents/downfall.',
                'Triangle △': '△ Triangle on Saturn: Research/occult/metaphysical talent.',
                'Flag 🚩': '🚩 Flag on Saturn: Prominence in karmic/scholarly works and high perseverance (Note 21 §1.2).',
              },
            },
            {
              key: 'mount_sun' as const,
              label: 'Sun Mount (Sūrya / Apollo Parvat)',
              emoji: '☀️',
              color: 'amber',
              location: 'Below ring finger',
              normal: 'Creative ability, fame, vivek (discernment), artistic talent, love of beauty, success in arts/media.',
              over: 'Over-developed: arrogance around fame, waste of creativity, showoff.',
              under: 'Under-developed: poor taste, lack of creative drive, difficulty gaining recognition.',
              apexOptions: [
                { value: 'Centered', label: 'Centered — Dominant Planet (Sūrya-pradhān)', meaning: 'Natural creative brilliance, healthy self-respect, love of beauty, high vitality, and dignified presence.' },
                { value: 'Toward Saturn', label: '→ Toward Saturn (Disciplined / Serious Art)', meaning: 'Fame achieved through laborious, disciplined karma. Serious artistic or scholarly output; recognition may come with patience/delay.' },
                { value: 'Toward Mercury', label: '→ Toward Mercury (Commercial Arts & Eloquence)', meaning: 'Creative talents blended with commercial acumen, speech, writing, and successful enterprise in creative fields.' },
              ],
              signMeanings: {
                'Star ⭐': '⭐ Star on Sun: Sudden fame, unexpected recognition — auspicious.',
                'Cross ✝': '✝ Cross on Sun: Obstacle to fame/recognition, defamation risk.',
                'Square □': '□ Square on Sun: Protection of reputation/name.',
                'Triangle △': '△ Triangle on Sun: Scientific/artistic fame through structured work.',
                'Trident ψ': 'ψ Trident on Sun: Fame in 2+ domains (Sun + Saturn + Mercury streams).',
                'Flag 🚩': '🚩 Flag on Sun: High renown, widespread celebrity, strengthened willpower (Note 21 §1.2).',
              },
            },
            {
              key: 'mount_mercury' as const,
              label: 'Mercury Mount (Budha Parvat)',
              emoji: '☿',
              color: 'teal',
              location: 'Below little finger',
              normal: 'Communication, business, diplomacy, speech, writing, science, trade, medicine.',
              over: 'Over-developed: dishonesty, cunning speech, deception for gain.',
              under: 'Under-developed: poor communication, business failures, difficulty with logic.',
              apexOptions: [
                { value: 'Centered', label: 'Centered — Dominant Planet (Budha-pradhān)', meaning: 'Sharp analytical logic, versatility, commercial acumen, diplomatic speech, and trade talent.' },
                { value: 'Toward Sun', label: '→ Toward Sun (Charisma & Commercial Oratory)', meaning: 'Communication backed by artistic charm and charisma. Persuasive speaker, attractive public presentation in business.' },
                { value: 'Toward Outside Edge', label: '→ Outside Edge / Percussion (Rough Boundary)', meaning: 'Apex crosses natural palm boundary with jagged edge — classical texts associate this with increased life struggle.' },
              ],
              signMeanings: {
                'Star ⭐': '⭐ Star on Mercury: Mixed — clever speaker/researcher, but can indicate trickery.',
                'Cross ✝': '✝ Cross on Mercury: Business failure or communication trouble.',
                'Square □': '□ Square on Mercury: Protection in business/trade.',
                'Triangle △': '△ Triangle on Mercury: Scientific, medical, or diplomatic talent.',
                'Single vertical line': '| Single vertical line on Mercury: Sudden money gain sign.',
              },
            },
            {
              key: 'mount_moon' as const,
              label: 'Moon Mount (Chandra Parvat / Luna)',
              emoji: '🌙',
              color: 'blue',
              location: 'Inner lower base (percussion side)',
              normal: 'Imagination, intuition, creativity, emotional sensitivity, love of travel, poetry, music.',
              over: 'Over-developed: excessive fantasy, emotional instability, restlessness.',
              under: 'Under-developed: lack of imagination, rigid thinking, poor adaptability.',
              apexLabel: 'Bulge / Shift Direction',
              apexOptions: [
                { value: 'Centered / Sāmānya', label: 'Centered / Sāmānya (Balanced Moon)', meaning: 'Normal balanced imagination, healthy sociability, calm equanimity in all circumstances.' },
                { value: 'Toward Upper Mars', label: '→ Toward Upper Mars (Bulge Direction)', meaning: 'Increased aggression, tendency toward quarrels and irritation. Can also indicate wealth/property synergy if substantiated by lines.' },
                { value: 'Toward Wrist / Ketu', label: '→ Toward Wrist / Ketū (Bulge Direction)', meaning: 'Inclination toward spirituality, good intuition, may prefer solitude — but stomach tends to get upset frequently.' },
                { value: 'Toward Venus', label: '→ Toward Venus (Indirect Indication)', meaning: 'Inferred via Venus mount expansion or an unusually wide Life Line sweep claiming Moon territory.' },
              ],
              signMeanings: {
                'Star ⭐': '⭐ Star on Moon: Suicidal tendency or severe emotional crisis — serious warning.',
                'Cross ✝': '✝ Cross on Moon: Emotional turmoil, depression risk.',
                'Square □': '□ Square on Moon: Protection from drowning/emotional crises.',
                'Triangle △': '△ Triangle on Moon: Intuitive, psychic, or travel-related talent.',
                'Conch (Śaṅkha) 🐚': '🐚 Conch (Śaṅkha) near Moon/Ketū: High spiritual attainment and sudden wealth (Note 21 §1.1).',
              },
            },
            {
              key: 'mount_venus' as const,
              label: 'Venus Mount (Śukra Parvat)',
              emoji: '♀️',
              color: 'pink',
              location: 'Thumb base / thenar eminence',
              normal: 'Love, passion, vitality, generosity, beauty, family warmth, attraction, music, luxury.',
              over: 'Over-developed: excess sensuality, indulgence, possessiveness in relationships.',
              under: 'Under-developed: coldness, poor family bonds, lack of physical vitality.',
              apexLabel: 'Apex / Boundary Assessment',
              apexOptions: [
                { value: 'No Apex (Judged by Height & Boundary Sweep)', label: 'No Apex — Judged by Height & Life Line Boundary (Note 18)', meaning: 'Venus mount has no apex displacement in classical palmistry. It is evaluated by height (normal/raised/depressed) and the territory claimed by the Life Line curve.' },
              ],
              signMeanings: {
                'Star ⭐': '⭐ Star on Venus: Multiple love affairs or fame connected to personal charisma.',
                'Cross ✝': '✝ Cross on Venus: Complicated love affair or relationship trouble.',
                'Square □': '□ Square on Venus: Protection in relationships.',
                'Triangle △': '△ Triangle on Venus: Cautious, controlled love life — diplomacy in relationships.',
                'Grille #': '# Grille on Venus: Excessive desires, multiple unfulfilled relationships.',
              },
            },
          ] as const;

          const getMount = (key: keyof typeof vedicData): MountSignData => {
            const existing = vedicData[key] as MountSignData | null;
            return existing || { height: '', apex: '', signs: [], quality: '', notes: '' };
          };

          const updateMount = (key: keyof typeof vedicData, field: keyof MountSignData, value: any) => {
            const current = getMount(key);
            updateVedicField(key, { ...current, [field]: value });
          };

          const toggleMountSign = (key: keyof typeof vedicData, sign: string) => {
            const current = getMount(key);
            const signs = current.signs.includes(sign)
              ? current.signs.filter((s) => s !== sign)
              : [...current.signs, sign];
            updateVedicField(key, { ...current, signs });
          };

          return (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium leading-relaxed">
                ⛰️ <strong>Mount reading order (teacher's method):</strong> Check height (raised/flat/over-built) → Find Apex → Check Apex direction → Read signs/symbols on mount → Cross-reference with lines.
              </div>

              {MOUNT_CONFIGS.map((mount) => {
                const mountData = getMount(mount.key as keyof typeof vedicData);
                const hasData = mountData.height || mountData.apex || mountData.signs.length > 0;
                return (
                  <div key={mount.key} className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                    <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                      <span>{mount.emoji}</span>
                      {mount.label}
                      <span className="text-[10px] text-stone-400 font-normal ml-auto">{mount.location}</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Height / Development</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={mountData.height}
                          onChange={(e) => updateMount(mount.key as any, 'height', e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Raised">Raised / Normal-good</option>
                          <option value="Normal">Normal (average)</option>
                          <option value="Flat">Flat / Under-developed</option>
                          <option value="Very High / Overbuilt">Very High / Overbuilt</option>
                          <option value="Displaced/Shifted">Displaced / Shifted</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">{(mount as any).apexLabel || 'Apex Direction'}</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={mountData.apex}
                          onChange={(e) => updateMount(mount.key as any, 'apex', e.target.value)}>
                          <option value="">Select Apex...</option>
                          {mount.apexOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Mount Quality</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={mountData.quality}
                          onChange={(e) => updateMount(mount.key as any, 'quality', e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Firm/Healthy">Firm/Healthy — springs back immediately</option>
                          <option value="Spongy (poor)">Spongy — returns slowly (poor sign)</option>
                          <option value="Flat/Pressed">Flat/Pressed — undeveloped</option>
                        </select>
                      </div>
                    </div>

                    {/* Signs checkboxes */}
                    <div>
                      <label className="form-label text-xs mb-1.5 block">Signs &amp; Symbols on Mount</label>
                      <div className="flex flex-wrap gap-2">
                        {[...((mount as any).customSigns || []), ...ALL_SIGNS].map((sign: string) => (
                          <label key={sign} className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${mountData.signs.includes(sign) ? 'bg-accent-gold text-white border-accent-gold' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-accent-gold/40'}`}>
                            <input type="checkbox" className="sr-only"
                              checked={mountData.signs.includes(sign)}
                              onChange={() => toggleMountSign(mount.key as any, sign)} />
                            {sign}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Mount interpretation */}
                    {(hasData || mountData.notes) && (
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] space-y-1.5 leading-relaxed">
                        {mountData.height === 'Raised' && <p className="text-stone-700 font-semibold">✨ <strong>Normal/Raised:</strong> {mount.normal}</p>}
                        {mountData.height === 'Very High / Overbuilt' && <p className="text-orange-700 font-semibold">⚠️ <strong>Over-developed:</strong> {mount.over}</p>}
                        {mountData.height === 'Flat' && <p className="text-rose-700 font-semibold">📉 <strong>Under-developed:</strong> {mount.under}</p>}
                        {mountData.apex && (() => {
                          const matched = (mount.apexOptions as readonly { value: string; label: string; meaning: string }[]).find((opt) => opt.value === mountData.apex);
                          return matched ? (
                            <p className="text-stone-700 font-semibold">
                              🎯 <strong>Apex {matched.label}:</strong> {matched.meaning}
                            </p>
                          ) : (
                            <p className="text-stone-700 font-semibold">
                              🎯 <strong>Apex:</strong> {mountData.apex}
                            </p>
                          );
                        })()}
                        {mountData.quality === 'Spongy (poor)' && <p className="text-orange-700 font-semibold">⚠️ <strong>Spongy quality:</strong> Teacher says this is a poor sign — mount should return immediately like a mattress. Slow return = poor results from this mount.</p>}
                        {mountData.signs.map((sign) => {
                          const meaning = (mount.signMeanings as any)[sign];
                          return meaning ? <p key={sign} className="text-stone-600 font-semibold">{meaning}</p> : null;
                        })}
                      </div>
                    )}

                    <div className="form-group">
                      <textarea className="form-input h-16 resize-none text-xs"
                        placeholder="Additional mount observations..."
                        value={mountData.notes}
                        onChange={(e) => updateMount(mount.key as any, 'notes', e.target.value)} />
                    </div>
                  </div>
                );
              })}

              {/* Mars Mounts (Lower Mars, Upper Mars, Plain of Mars) — Lecture 18 */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <span className="text-rose-600">♂️</span>
                    Mars Mounts (Maṅgala Parvata — Lecture 18)
                  </h4>
                  <span className="text-[10px] font-semibold text-stone-400">Nimna &amp; Ucca Maṅgala</span>
                </div>
                <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-xl text-xs text-rose-900 font-medium leading-relaxed space-y-1">
                  <p>
                    <strong>Lower Mars (Nimna Maṅgala, inner):</strong> Near the thumb between Jupiter and Venus. Governs <em>āntarika sāhasa</em> (inner courage felt inside vs. trembling inside) and enthusiasm. Origin of &quot;Enemy Lines&quot; (śatru rekhā, correlated with 6th house in Jyotiṣa) which cut main lines. Bluish/dark tint = blood/hemoglobin alert.
                  </p>
                  <p>
                    <strong>Upper Mars (Ucca Maṅgala, outer):</strong> On outer percussion between Mercury and Moon. Governs <em>bāhya sāhasa</em> (outer courage, physical retaliation, willingness to strike/fight back or defend). Over-developed = explosive anger/breaking things (needs gym/physical outlet). Depressed = cowardice, inability to confront or discipline.
                  </p>
                  <p>
                    <strong>Plain of Mars (Middle Palm / Rāhu Area):</strong> Central depression where planetary energies traverse.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(['mount_mars_lower', 'mount_mars_upper', 'mount_mars_plain'] as const).map((marsKey) => {
                    const label = marsKey === 'mount_mars_lower'
                      ? 'Lower Mars / Nimna Maṅgala (Inner Courage & Enemy Lines)'
                      : marsKey === 'mount_mars_upper'
                        ? 'Upper Mars / Ucca Maṅgala (Outer Courage & Retaliation)'
                        : 'Plain of Mars / Rāhu Zone (Center Palm)';
                    const marsData = getMount(marsKey);
                    return (
                      <div key={marsKey} className="border border-stone-100 rounded-xl p-3 space-y-2">
                        <label className="form-label text-xs font-semibold text-stone-800">{label}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select className="form-input bg-white border border-stone-200 text-xs"
                            value={marsData.height}
                            onChange={(e) => updateMount(marsKey, 'height', e.target.value)}>
                            <option value="">Height...</option>
                            <option value="Raised">Raised / Developed</option>
                            <option value="Normal">Normal (Sāmānya - balanced)</option>
                            <option value="Flat">Flat / Depressed (Nimna)</option>
                            <option value="Very High / Overbuilt">Very High / Over-developed (Atividikasita)</option>
                          </select>
                          <div className="flex flex-wrap gap-1">
                            {['Star ⭐', 'Cross ✝', 'Square □', 'Triangle △', 'Enemy Line ⚔️', 'Mole'].map((sign) => (
                              <label key={sign} className={`flex items-center gap-0.5 cursor-pointer px-1.5 py-0.5 rounded border text-[9px] font-semibold transition-all ${marsData.signs.includes(sign) ? 'bg-rose-500 text-white border-rose-500' : 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                                <input type="checkbox" className="sr-only"
                                  checked={marsData.signs.includes(sign)}
                                  onChange={() => toggleMountSign(marsKey, sign)} />
                                {sign}
                              </label>
                            ))}
                          </div>
                        </div>
                        {marsKey === 'mount_mars_lower' && marsData.signs.includes('Enemy Line ⚔️') && (
                          <p className="text-[10px] text-rose-700 font-semibold">⚔️ Enemy Lines (Śatru Rekhā, Note 18 §2.2): Lines shooting from Lower Mars across main lines indicate 6th house obstacles, opponents, or acute stress patches.</p>
                        )}
                        {marsKey === 'mount_mars_lower' && marsData.signs.includes('Star ⭐') && (
                          <p className="text-[10px] text-rose-700 font-semibold">⭐ Star on Lower Mars: Sudden quarrel, accident risk, or turbulent early affair.</p>
                        )}
                        {marsKey === 'mount_mars_upper' && marsData.height === 'Very High / Overbuilt' && (
                          <p className="text-[10px] text-amber-700 font-semibold">⚡ Highly Raised Upper Mars (Note 18 §2.4): Intense outer retaliatory drive. Strong physical energy that must be channeled into sports, martial arts, or gym to avoid domestic temper flareups.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ketū Parvata (Ketū Mount / Base-Palm Zone) — Lectures 02, 17, 20, 21, 22 */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <span className="text-purple-600">☋</span>
                    Ketū Parvata (Base-Palm / Wrist Zone)
                  </h4>
                  <span className="text-[10px] font-semibold text-stone-400">Between Moon &amp; Venus at Maṇibandha</span>
                </div>
                <div className="p-2 bg-purple-50/70 border border-purple-200/60 rounded-xl text-xs text-purple-900 font-medium leading-relaxed">
                  🔱 <strong>Core Teaching:</strong> Seat of Moksha and spirituality (ādhyātma). <strong>90% of genuine complete Fish signs (Matsya Chinha) appear here</strong> at the base of the Fate Line or end of the Life Line. Gives spiritual renown, fame, and deep research capability (not liquid cash).
                </div>

                {(() => {
                  const ketuData = getMount('mount_ketu');
                  const hasKetuData = ketuData.height || ketuData.signs.length > 0 || ketuData.notes;
                  const KETU_SIGNS = ['Fish 🐟', 'Conch (Śaṅkha) 🐚'];
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-group">
                          <label className="form-label text-xs">Development / State</label>
                          <select className="form-input bg-white border border-stone-200 text-xs"
                            value={ketuData.height}
                            onChange={(e) => updateMount('mount_ketu', 'height', e.target.value)}>
                            <option value="">Select...</option>
                            <option value="Raised">Raised / Prominent</option>
                            <option value="Normal">Normal</option>
                            <option value="Flat">Flat / Sunken</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label text-xs">Mount Quality</label>
                          <select className="form-input bg-white border border-stone-200 text-xs"
                            value={ketuData.quality}
                            onChange={(e) => updateMount('mount_ketu', 'quality', e.target.value)}>
                            <option value="">Select...</option>
                            <option value="Firm/Healthy">Firm / Clear</option>
                            <option value="Spongy (poor)">Spongy / Disturbed</option>
                            <option value="Flat/Pressed">Flat / Sunken</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="form-label text-xs mb-1.5 block">Signs &amp; Symbols on Ketū</label>
                        <div className="flex flex-wrap gap-2">
                          {KETU_SIGNS.map((sign) => (
                            <label key={sign} className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${ketuData.signs.includes(sign) ? 'bg-purple-600 text-white border-purple-600' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-purple-300'}`}>
                              <input type="checkbox" className="sr-only"
                                checked={ketuData.signs.includes(sign)}
                                onChange={() => toggleMountSign('mount_ketu', sign)} />
                              {sign}
                            </label>
                          ))}
                        </div>
                      </div>

                      {hasKetuData && (
                        <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-[11px] space-y-1.5 leading-relaxed text-stone-700">
                          {ketuData.signs.includes('Fish 🐟') && (
                            <p className="text-purple-900 font-semibold">
                              🐟 <strong>Fish on Ketū :</strong> Power, name/fame, spiritual growth, researcher-type insight — does NOT bring money.
                            </p>
                          )}
                          {ketuData.signs.includes('Conch (Śaṅkha) 🐚') && (
                            <p className="text-stone-700 font-semibold">
                              🐚 <strong>Conch (Śaṅkha) on Ketū:</strong> Spiritual journey at a very high level, and sudden money gain — a rare sign.
                            </p>
                          )}
                        </div>
                      )}

                      <div className="form-group">
                        <textarea className="form-input h-14 resize-none text-xs"
                          placeholder="Ketū zone observations (e.g. Life Line branch terminating directly into Ketū)..."
                          value={ketuData.notes}
                          onChange={(e) => updateMount('mount_ketu', 'notes', e.target.value)} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
}
