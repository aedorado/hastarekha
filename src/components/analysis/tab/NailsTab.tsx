'use client';

import React from 'react';
import { VedicData } from '@/types/palmistry';
import { Activity, Eye, Heart, Smile } from 'lucide-react';

interface NailsTabProps {
  vedicData: VedicData;
  updateVedicField: (key: keyof VedicData, value: any) => void;
}

export default function NailsTab({ vedicData, updateVedicField }: NailsTabProps) {
  return (
          <div className="space-y-5">
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-xs leading-relaxed text-violet-800 font-medium">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-sm">💅 Nails (Nakh) Analysis — Lectures 11 &amp; 12</span>
              Nails are the primary indicator of <strong>health</strong> in palmistry. Teachers method: combine nail length, width, and thickness — three independent axes — to build a combined reading. Use palm hand-type to modify nail reading.
            </div>

            {/* Nail Dimensions */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-violet-500" />
                Nail Dimensions (Three Independent Axes)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Length (Axis 1)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_length || ''}
                    onChange={(e) => updateVedicField('nail_length', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Small/Short">Small/Short — Researcher, nitpicking</option>
                    <option value="Large/Long">Large/Long — Water-element, creative</option>
                    <option value="Medium">Medium — Balanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Width (Axis 2)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_width || ''}
                    onChange={(e) => updateVedicField('nail_width', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Wide (Chauṛā)">Wide (Chauṛā) — Hardworking, assertive</option>
                    <option value="Narrow/Tight (Sankrā)">Narrow/Tight (Sankrā) — Timid, health issues</option>
                    <option value="Normal">Normal Width</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Thickness (Axis 3)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_thickness || ''}
                    onChange={(e) => updateVedicField('nail_thickness', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Thick (Earth)">Thick (Earth) — Best type, stable</option>
                    <option value="Thin/Papery">Thin/Papery — Curls/breaks, low hemoglobin</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              {/* Combined reading */}
              {(vedicData.nail_length || vedicData.nail_width || vedicData.nail_thickness) && (
                <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl text-xs space-y-1.5 leading-relaxed">
                  <span className="font-bold text-violet-900 uppercase tracking-wider block text-[9px]">Combined Nail Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.nail_length === 'Small/Short' && <p>🔍 <strong>Small nail:</strong> Researcher/investigative mindset. Goes deep into subjects. Can become nitpicking. Alert/cautious, hardworking, blunt. May show impatience. May indicate underlying nervousness/anxiety.</p>}
                    {vedicData.nail_length === 'Large/Long' && <p>💧 <strong>Long nail:</strong> Water-element — emotional, caring, sensitive, creative. Relaxed working pace. Prone to anxiety (harder to manage than small-nail anxiety).</p>}
                    {vedicData.nail_width === 'Wide (Chauṛā)' && <p>💪 <strong>Wide nail:</strong> Hardworking, sharp-minded but short-tempered, plain-spoken, adjustable. Tends to be thicker.</p>}
                    {vedicData.nail_width === 'Narrow/Tight (Sankrā)' && <p>⚠️ <strong>Narrow nail:</strong> Timidity, poor self-expression, sensitivity/anxiety. A significant general health-issue indicator (specific immunity link applies when combined with a small nail).</p>}
                    {vedicData.nail_thickness === 'Thick (Earth)' && <p>🌍 <strong>Thick nail:</strong> Best overall type. Earth-element stability, discipline, responsibility, practicality. Values routine. Best when combined with wide nail.</p>}
                    {vedicData.nail_thickness === 'Thin/Papery' && <p>⚠️ <strong>Thin/Papery nail:</strong> Curls downward/upward or breaks repeatedly. Linked to low hemoglobin. Sensitivity (water hand) or irritability/temper (fire hand).</p>}
                    {/* Combinations */}
                    {vedicData.nail_length === 'Small/Short' && vedicData.nail_width === 'Wide (Chauṛā)' && <p>🔬 <strong>Small+Wide:</strong> Researcher + hardworking. Increased temper. Very determined.</p>}
                    {vedicData.nail_length === 'Small/Short' && vedicData.nail_thickness === 'Thin/Papery' && <p>🫁 <strong>Small+Thin (ALERT):</strong> Teacher observed this combination repeatedly with <em>throat disease, respiratory disease, TB, and lung issues</em>. Watch closely.</p>}
                    {vedicData.nail_length === 'Small/Short' && vedicData.nail_width === 'Narrow/Tight (Sankrā)' && <p>😶 <strong>Small+Narrow:</strong> Researcher who cannot present findings. Poor immunity. Timidity. If also clubbed thumb → dangerous aggression combination.</p>}
                    {vedicData.nail_length === 'Large/Long' && vedicData.nail_thickness === 'Thin/Papery' && <p>🩸 <strong>Long+Thin (WORST combination):</strong> Blood-related and hormonal issues. High irritability and emotional disturbance. Water element doubled.</p>}
                    {vedicData.nail_length === 'Large/Long' && vedicData.nail_thickness === 'Thick (Earth)' && <p>⚖️ <strong>Long+Thick:</strong> Methodical, stable, practical, disciplined. Balances emotional and practical. Increases emotional intensity in relationships (traditional texts).</p>}
                    {vedicData.nail_length === 'Small/Short' && vedicData.nail_thickness === 'Thick (Earth)' && <p>📋 <strong>Small+Thick:</strong> Physical labor + discipline + research depth. Sets timetables. Balances well with fire or airy hands.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Nail Shape (from Lecture 12) */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Eye className="w-4 h-4 text-violet-500" />
                Nail Shape (Element Classification — Lecture 12)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Nail Shape Detail</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_shape_detail || ''}
                    onChange={(e) => updateVedicField('nail_shape_detail', e.target.value)}>
                    <option value="">Select Shape...</option>
                    <option value="Square">Square (Earth — practical, stubborn)</option>
                    <option value="Round">Round (Air — investigative, philosophical)</option>
                    <option value="Conical/Tapered">Conical/Tapered (Water — emotional, sensitive)</option>
                    <option value="Spatulate">Spatulate (Fire — action-first, energetic)</option>
                    <option value="Spoon-shaped (Concave)">Spoon-shaped/Concave — health concern: thyroid, heart, anemia, liver</option>
                    <option value="Clubbed nail">Clubbed nail — severe disease indicator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Nail Surface (Health — Lecture 12)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_surface || ''}
                    onChange={(e) => updateVedicField('nail_surface', e.target.value)}>
                    <option value="">Select Surface...</option>
                    <option value="Smooth">Smooth — Healthy baseline</option>
                    <option value="Vertical lines (Father inheritance / stress)">Vertical lines — Father's side inherited disease, stress, vāta-doṣa</option>
                    <option value="Fluted vertical ridges (severe arthritis / vascular alert)">Fluted vertical ridges — Deep cracks (arthritis risk, vascular alert)</option>
                    <option value="Horizontal ridges (Mother inheritance / acute shock / protein)">Horizontal ridges — Mother's side inherited disease, acute shock/trauma, protein deficiency</option>
                    <option value="Spotted">Spotted / uneven</option>
                    <option value="Brittle/Breaks easily">Brittle/Breaks — thin papery type</option>
                  </select>
                </div>
              </div>
              {vedicData.nail_surface === 'Vertical lines (Father inheritance / stress)' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold leading-relaxed">
                  🩺 <strong>Vertical Lines on Nails (Note 12 §7):</strong> Associated with disease patterns inherited from the <strong>father's side</strong>, nervous stress, zinc deficiency, and vāta-doṣa ailments. If light/faint, indicates ordinary daily tension.
                </div>
              )}
              {vedicData.nail_surface === 'Fluted vertical ridges (severe arthritis / vascular alert)' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-semibold leading-relaxed">
                  🚨 <strong>Fluted Nails (Note 12 §7):</strong> Advanced longitudinal ridges with deep cracks revealing inner nail bed. High warning indicator for severe arthritis, chronic degenerative conditions, or vascular risk.
                </div>
              )}
              {vedicData.nail_surface === 'Horizontal ridges (Mother inheritance / acute shock / protein)' && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-semibold leading-relaxed">
                  ⚠️ <strong>Horizontal Lines across Nails (Note 12 §8):</strong> Associated with disease patterns inherited from the <strong>mother's side</strong>, severe acute health shock or fever arrest during nail formation, and protein/metabolic deficiency.
                </div>
              )}
              {vedicData.nail_shape_detail === 'Spoon-shaped (Concave)' && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-900 font-semibold leading-relaxed">
                  ⚠️ <strong>Spoon-shaped nail:</strong> Not a good health sign. Indicates possible thyroid issues, heart disease, anemia, or liver conditions. Teacher recommends getting a liver check done. Timing of issue: confirm with heart line and life line islands.
                </div>
              )}
              {vedicData.nail_shape_detail === 'Clubbed nail' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-semibold leading-relaxed">
                  🚨 <strong>Clubbed nail:</strong> Serious disease indicator. Associated with severe diseases (including sexual diseases), lung problems/TB, stomach infection/inflammation, constipation, weak immunity, autoimmune diseases.
                </div>
              )}
            </div>

            {/* Nail Color & Chandramā (Lecture 12) */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Nail Color &amp; Chandramā (Health Indicators)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Nail Color (compare against palm skin)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_color || ''}
                    onChange={(e) => updateVedicField('nail_color', e.target.value)}>
                    <option value="">Select Color...</option>
                    <option value="Pink/Normal (Healthy)">Pink/Normal — Healthy baseline</option>
                    <option value="Pale/White">Pale/White — Possible anaemia</option>
                    <option value="Yellow (Liver/Health)">Yellow — Liver/health concern</option>
                    <option value="Blue/Purple (Serious)">Blue/Purple — Serious illness concern</option>
                    <option value="Reddish">Reddish — Heat/aggression</option>
                    <option value="White spots present">White spots — Wealth sign (traditional)</option>
                    <option value="Dark discoloration">Dark discoloration — Injury/cooking damage</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Chandramā (Lunula / Half-Moon)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_lunula || ''}
                    onChange={(e) => updateVedicField('nail_lunula', e.target.value)}>
                    <option value="">Select Lunula...</option>
                    <option value="Visible on all fingers">Visible on all fingers — Good health</option>
                    <option value="Visible on some fingers">Visible on some fingers</option>
                    <option value="Absent (health concern)">Absent/Reduced — Health impact, possible stomach issues</option>
                  </select>
                </div>
              </div>
              {vedicData.nail_lunula === 'Absent (health concern)' && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg text-[11px] text-orange-800 font-semibold">
                  ⚠️ Lunula absence: generally associated with health impact. Teacher specifically noted stomach issues (not necessarily liver) in one case with Moon-sign Cancer and absent lunula.
                </div>
              )}
              <div className="form-group">
                <label className="form-label text-xs">Nail-biting habit?</label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-stone-700 mt-1">
                  <input type="checkbox" className="rounded text-accent-gold focus:ring-accent-gold"
                    checked={vedicData.nail_biting || false}
                    onChange={(e) => updateVedicField('nail_biting', e.target.checked)} />
                  <span>Nail-biting present (driven by tension — weakens root chakra: bone problems, security fears, lower back pain)</span>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label text-xs">Specific Health Notes / Observations</label>
                <textarea className="form-input h-16 resize-none text-xs"
                  placeholder="e.g. vertical lines on Jupiter nail, Saturn nail looks square, thin nails on ring finger..."
                  value={vedicData.nail_health_flag || ''}
                  onChange={(e) => updateVedicField('nail_health_flag', e.target.value)} />
              </div>
            </div>

            {/* Palm Color (Note 04) */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Smile className="w-4 h-4 text-pink-500" />
                Palm Skin Color (Note 04 — Diagnostic Sign)
              </h4>
              <div className="form-group">
                <label className="form-label text-xs">Palm Color</label>
                <select className="form-input bg-white border border-stone-200 text-xs"
                  value={vedicData.palm_color || ''}
                  onChange={(e) => updateVedicField('palm_color', e.target.value)}>
                  <option value="">Select Palm Color...</option>
                  <option value="Pinkish (Healthy)">Pinkish — Healthy baseline</option>
                  <option value="Pale/Whitish">Pale / Whitish — Stomach / low vitality / insomnia</option>
                  <option value="Yellow (health/liver)">Yellow tinge — Liver / low hemoglobin / jaundice history</option>
                  <option value="Reddish (heat/aggression)">Reddish — High heat / Mars / short-tempered</option>
                  <option value="Bluish (kidney/renal alert)">Bluish — Kidney / renal alert (veins on Venus)</option>
                  <option value="Purple / Aubergine (terminal alert)">Purple / Aubergine — Critical condition alert</option>
                </select>
              </div>
            </div>
          </div>
  );
}
