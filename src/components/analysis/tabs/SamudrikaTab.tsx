'use client';

import React from 'react';
import { HandProfile, VedicData } from '@/types/palmistry';
import { HAND_TYPES, HAND_TYPE_DETAILS } from '@/lib/content/handTypes';
import { Sparkles, Activity, Info, HelpCircle, Smile, Compass, Eye, FileText } from 'lucide-react';

interface SamudrikaTabProps {
  profile: HandProfile;
  updateProfileField: (key: keyof HandProfile, value: any) => void;
  vedicData: VedicData;
  updateVedicField: (key: keyof VedicData, value: any) => void;
}

export default function SamudrikaTab({
  profile,
  updateProfileField,
  vedicData,
  updateVedicField,
}: SamudrikaTabProps) {
  return (
          <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 shadow-sm text-xs leading-normal">
              <span className="font-bold flex items-center gap-1.5 text-accent-gold text-sm mb-1">
                <Sparkles className="w-4 h-4 text-accent-gold" />
                Hasta Sāmudrika Śāstra (Vedic Palmistry)
              </span>
              Analyze the structural elements of the hand: shape, measurements, texture, and finger ratios before examining lines and mounts.
            </div>

            {/* Core Hand Classification */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Core Hand Classification
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Dominant Hand (Active)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs text-stone-850"
                    value={profile.dominant_hand}
                    onChange={(e) => updateProfileField('dominant_hand', e.target.value)}
                  >
                    <option value="Right">Right Handed</option>
                    <option value="Left">Left Handed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Classical Hand Type</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs text-stone-850"
                    value={vedicData.hand_type || ''}
                    onChange={(e) => {
                      updateVedicField('hand_type', e.target.value);
                    }}
                  >
                    <option value="">Select Classic Type...</option>
                    {HAND_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Elemental Hand (Tattva)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs text-stone-850"
                    value={vedicData.hand_tattva || ''}
                    onChange={(e) => {
                      updateVedicField('hand_tattva', e.target.value);
                    }}
                  >
                    <option value="">Select Tattva...</option>
                    <option value="Agni Tattva (Fiery Hand)">Agni Tattva (Fiery Hand)</option>
                    <option value="Jala Tattva (Watery Hand)">Jala Tattva (Watery Hand)</option>
                    <option value="Pṛthvī Tattva (Earthy Hand)">Pṛthvī Tattva (Earthy Hand)</option>
                    <option value="Vāyu Tattva (Airy Hand)">Vāyu Tattva (Airy Hand)</option>
                    <option value="Mixed Hand (Agni-Jala Blend)">Mixed Hand (Agni-Jala Blend)</option>
                    <option value="Mixed Hand (Air-Earth Blend)">Mixed Hand (Air-Earth Blend)</option>
                    <option value="Mixed Hand">Mixed Hand</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Palm Color (Lecture 04)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs text-stone-850"
                    value={vedicData.palm_color || ''}
                    onChange={(e) => updateVedicField('palm_color', e.target.value)}
                  >
                    <option value="">Select Color...</option>
                    <option value="Pinkish (Healthy)">🌸 Pinkish (Healthy baseline)</option>
                    <option value="Pale/Whitish">⚪ Pale / Whitish (Stomach / low vitality / insomnia)</option>
                    <option value="Yellow (health/liver)">🟡 Yellow (Liver / low hemoglobin / jaundice history)</option>
                    <option value="Reddish (heat/aggression)">🔴 Reddish (High heat / Mars / short-tempered)</option>
                    <option value="Bluish (kidney/renal alert)">🔵 Bluish (Kidney / renal alert, veins on Venus)</option>
                    <option value="Purple / Aubergine (terminal alert)">🟣 Purple / Aubergine (Critical condition alert)</option>
                  </select>
                </div>
              </div>
            </div>

            {vedicData.hand_type && HAND_TYPE_DETAILS[vedicData.hand_type] && (
              <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 shadow-sm text-xs space-y-2.5 transition-all duration-300">
                <div className="flex items-center gap-2 border-b border-stone-200/40 pb-2">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                  <span className="font-bold text-stone-900 text-xs tracking-wide">
                    {HAND_TYPE_DETAILS[vedicData.hand_type].title} Details
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[8px] text-stone-400">Core Identification:</span>
                    <p className="text-stone-600 font-medium mt-0.5 text-[11px]">{HAND_TYPE_DETAILS[vedicData.hand_type].identification}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[8px] text-stone-400">Core Mentality:</span>
                    <p className="text-stone-600 font-medium mt-0.5 text-[11px]">{HAND_TYPE_DETAILS[vedicData.hand_type].mentality}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[8px] text-stone-400">Prosperity & Struggle:</span>
                    <p className="text-stone-600 font-medium mt-0.5 text-[11px]">{HAND_TYPE_DETAILS[vedicData.hand_type].struggleOrStrength}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[8px] text-stone-400">Nail/Skin Modifiers:</span>
                    <p className="text-stone-600 font-medium mt-0.5 text-[11px]">{HAND_TYPE_DETAILS[vedicData.hand_type].modifiers}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hand Tattva Calculator */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Hand Tattva (Element) Calculator
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Palm Shape</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.palm_shape}
                    onChange={(e) => updateVedicField('palm_shape', e.target.value)}
                  >
                    <option value="">Select Shape...</option>
                    <option value="Square">Square</option>
                    <option value="Rectangular">Rectangular</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Elemental Hand Tattva (Computed)</label>
                  <div className="form-input bg-stone-50 text-xs font-bold flex items-center h-9 px-3 border border-stone-200 text-stone-850 truncate">
                    {vedicData.hand_tattva || 'Set shape & lengths...'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Palm Length (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input text-xs"
                    placeholder="e.g. 10"
                    value={vedicData.palm_length}
                    onChange={(e) => updateVedicField('palm_length', e.target.value ? parseFloat(e.target.value) : '')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Palm Width (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input text-xs"
                    placeholder="e.g. 9.5"
                    value={vedicData.palm_width || ''}
                    onChange={(e) => updateVedicField('palm_width', e.target.value ? parseFloat(e.target.value) : '')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Finger Length (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input text-xs"
                    placeholder="e.g. 8.5"
                    value={vedicData.finger_length}
                    onChange={(e) => updateVedicField('finger_length', e.target.value ? parseFloat(e.target.value) : '')}
                  />
                </div>
              </div>

              {vedicData.measurements && (
                <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-250 rounded-lg p-2 font-medium leading-relaxed">
                  📏 Hand Canvas measurements are active: Palm baseline is set to {vedicData.palm_length || 10.0}cm. Finger scales to {vedicData.finger_length || '0.0'}cm (Ratio: {vedicData.palm_length && vedicData.finger_length ? (Number(vedicData.finger_length) / Number(vedicData.palm_length)).toFixed(2) : '0.00'}) and Palm Width scales to {vedicData.palm_width || '0.0'}cm.
                </div>
              )}

              {/* Tattva details display */}
              {vedicData.hand_tattva && (
                <div className="p-3 rounded-xl border space-y-2.5 shadow-sm text-xs transition-all duration-300" style={{
                  backgroundColor:
                    vedicData.hand_tattva.includes('Agni') ? '#fef2f2' :
                      vedicData.hand_tattva.includes('Jala') ? '#eff6ff' :
                        vedicData.hand_tattva.includes('Pṛthvī') ? '#fff7ed' :
                          vedicData.hand_tattva.includes('Vāyu') ? '#f0fdfa' : '#fffbeb',
                  borderColor:
                    vedicData.hand_tattva.includes('Agni') ? '#fee2e2' :
                      vedicData.hand_tattva.includes('Jala') ? '#dbeafe' :
                        vedicData.hand_tattva.includes('Pṛthvī') ? '#ffedd5' :
                          vedicData.hand_tattva.includes('Vāyu') ? '#ccfbf1' : '#fef3c7',
                  color:
                    vedicData.hand_tattva.includes('Agni') ? '#991b1b' :
                      vedicData.hand_tattva.includes('Jala') ? '#1e40af' :
                        vedicData.hand_tattva.includes('Pṛthvī') ? '#9a3412' :
                          vedicData.hand_tattva.includes('Vāyu') ? '#115e59' : '#854d0e'
                }}>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[10px]">
                      {vedicData.hand_tattva} Profile
                    </span>
                    <p className="mt-1 font-semibold leading-relaxed">
                      {vedicData.hand_tattva.includes('Agni') ? '🔥 Agni Tattva (Fire): rectangular palm + short fingers. Energetic, impulsive, social. Horizontal learner (skims topics), wedding/party coordinator potential, instant decider. Strong Mars/Sun traits.' :
                        vedicData.hand_tattva.includes('Jala') ? '💧 Jala Tattva (Water): rectangular palm + long fingers. Sensitive, imaginative, feminine. Adapts to shape of surroundings. Suppresses anger if thumb is weak. Craves stability/routine.' :
                          vedicData.hand_tattva.includes('Pṛthvī') ? '🪵 Pṛthvī Tattva (Earth): square palm + short fingers. Highly stubborn, stable, generational planner (secures future children). Rigid rituals. Prefers fixed/guaranteed income.' :
                            vedicData.hand_tattva.includes('Vāyu') ? '💨 Vāyu Tattva (Air): square palm + long fingers. Fact-finder, investigator. Micro-manages, notices tiny flaws. Ketu-driven deep learning (learns topics to roots). Job over business.' :
                              '✨ Mixed Hand Tattva: Blended temperament. Synthesize dominant mounts to resolve career and relationship patterns.'}
                    </p>
                  </div>
                  <div className="border-t border-stone-200/20 pt-2 space-y-1">
                    <span className="font-bold uppercase tracking-wider block text-[9px]">Vedic Remedial Guidance (Upāyas):</span>
                    <p className="italic leading-normal font-medium">
                      {vedicData.hand_tattva.includes('Agni') ? '• Must finish one task fully before starting another. Practice self-discipline (waking to 4 AM alarms). Engage in Ketu-like deep research to calm the fire.' :
                        vedicData.hand_tattva.includes('Jala') ? '• Practice saying "no" to guard boundaries. Drastically lower expectations of others to prevent stomach stress. Seek counsel from elder relatives before decisions.' :
                          vedicData.hand_tattva.includes('Pṛthvī') ? '• Intentionally enjoy life, step out of rigid routines. Try doing random selfless tasks outside of standard ancestral rulebooks.' :
                            vedicData.hand_tattva.includes('Vāyu') ? '• Regulate Din Charya (daily routines). Practice deep active listening rather than cross-examination. Step-by-step build trust with close relatives.' :
                              '• Synthesize multiple elements and mounts. Ground with routine and regular meditation.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Active Hand Instinct Decider */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <HelpCircle className="w-4 h-4 text-purple-500" />
                Active Hand Selector
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                Determine the Active (dominant) hand representing current karma and mental changes (rekhā changes every 2-3 months).
              </p>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2 text-stone-700">
                <span className="font-bold block text-[10px] text-accent-gold uppercase tracking-wider">Instinct Test (For Ambidextrous Clients):</span>
                <p className="leading-relaxed font-medium">
                  Throw an object (e.g. ball) at the client unexpectedly. The hand they instinctively raise first to block/catch is their active hand, deeply connected to their neural patterns.
                </p>
              </div>
            </div>

            {/* Soil Texture & Stiffness */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Smile className="w-4 h-4 text-orange-500" />
                Soil Texture & Stiffness
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                The stiffness of the hand acts as the soil (ground). A stiff hand (hard ground) blocks successful yogas from bearing fruit easily, requiring extreme labor. Soft hands represent fertile ease.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700">Hand Stiffness (Soil Ground)</span>
                  <span className="font-mono text-accent-gold font-bold">{vedicData.texture < 40 ? 'Stiff / Stiff soil' : vedicData.texture > 70 ? 'Soft / Fertile soil' : 'Average'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-accent-gold"
                  value={vedicData.texture}
                  onChange={(e) => updateVedicField('texture', parseInt(e.target.value, 10))}
                />
              </div>

              {/* Dynamic soil calculation */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-amber-800 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-accent-gold" />
                  Soil Signification
                </span>
                <p className="text-[11px] text-stone-700 leading-relaxed font-semibold">
                  {vedicData.texture < 45
                    ? '⚠️ Stiff Hand (Hard Ground): Success combinations (Rajyoga seeds) are blocked. The subject has to struggle and put in double the labor to get results.'
                    : vedicData.texture > 60
                      ? '✨ Fertile Ground: High creative desire and potential ease of progress. Active willpower is needed to override general lazy soft-hand traits.'
                      : '✨ Normal Soil: Average balance of practical action and mental flexibility.'
                  }
                </p>
              </div>
            </div>

            {/* Thumb (Angūṭhā) Analysis Profile */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Thumb (Angūṭhā) Analysis Profile
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                Read the thumb length, natural angle of opening, and parva (phalange) details to gauge willpower, independence, and receptivity to advice.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Thumb Willpower (1st Phalange / top segment)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_willpower}
                    onChange={(e) => updateVedicField('thumb_willpower', e.target.value)}
                  >
                    <option value="Average">Average Willpower</option>
                    <option value="Strong">Strong / Swollen Top (near nail)</option>
                    <option value="Weak">Weak / Flat Top</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Thumb Length (Index Base Ref)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_length || ''}
                    onChange={(e) => updateVedicField('thumb_length', e.target.value)}
                  >
                    <option value="">Select Length...</option>
                    <option value="Short">Short (reaches below index base midpoint)</option>
                    <option value="Average">Average / Mediocre (reaches index base midpoint)</option>
                    <option value="Long">Long (reaches above index base midpoint)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Thumb natural Angle</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_angle || ''}
                    onChange={(e) => updateVedicField('thumb_angle', e.target.value)}
                  >
                    <option value="">Select Angle...</option>
                    <option value="Below 30°">Below 30° (Completely Dependent)</option>
                    <option value="30°-45°">30°-45° (Mostly Dependent/Private)</option>
                    <option value="45°-70°">45°-70° (Imaginative/Daydreamer)</option>
                    <option value="70°-90°">70°-90° (Independent but Receptive)</option>
                    <option value="Exactly 90°">Exactly 90° (Pillar/Foundation)</option>
                    <option value="Above 90°">Above 90° (Struggle-Built/Logical)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Thumb Reach vs. Base Marker (High/Middle/Low)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_first_phalange_length || ''}
                    onChange={(e) => updateVedicField('thumb_first_phalange_length', e.target.value)}
                  >
                    <option value="">Select Reach Level...</option>
                    <option value="Short">Low (Lower immunity, dependent)</option>
                    <option value="Average">Middle (Self-Made, credit sharing)</option>
                    <option value="Long">High (Dominant, high ego, confident)</option>
                  </select>
                </div>

                <div className="form-group md:col-span-2">
                  <label className="form-label text-xs">First Phalange Condition</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_first_phalange_condition || ''}
                    onChange={(e) => updateVedicField('thumb_first_phalange_condition', e.target.value)}
                  >
                    <option value="">Select Surface Condition...</option>
                    <option value="Smooth">Smooth (Listens politely, does what they planned)</option>
                    <option value="Sunken/Flattened">Sunken / Flattened (Seeks & follows advice)</option>
                    <option value="Cut marks/lines">Cut marks / Creases (Seeks & follows advice)</option>
                    <option value="Bulged">Bulged / Puffy tip (Firm/stubborn, short temper)</option>
                  </select>
                </div>
              </div>

              {/* Thumb Type, 2nd Phalange, Tip Element — Lecture 07 */}
              <div className="grid grid-cols-3 gap-3 border-t border-stone-100 pt-4">
                <div className="form-group">
                  <label className="form-label text-xs">Thumb Type / Shape</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_type || ''}
                    onChange={(e) => updateVedicField('thumb_type', e.target.value)}
                  >
                    <option value="">Select Thumb Type...</option>
                    <option value="Waist-like">Waist-like (Best — social, diplomatic)</option>
                    <option value="Middle Type">Middle Type (2nd best — practical, polite)</option>
                    <option value="Slight Bend">Slight Backward Bend (Conditional/dominating)</option>
                    <option value="Stiff">Stiff / Straight (Stubborn, plain-spoken)</option>
                    <option value="Very Flexible">Very Flexible / Bends Back (Follower/spendthrift)</option>
                    <option value="Elementary">Elementary (Procrastinating, aimless)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">2nd Phalange (Logic Parva)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_second_phalange || ''}
                    onChange={(e) => updateVedicField('thumb_second_phalange', e.target.value)}
                  >
                    <option value="">Select Logic Condition...</option>
                    <option value="Normal">Normal (Balanced logic &amp; action)</option>
                    <option value="Long (over-thinker)">Long (Excessive analysis, paralysis)</option>
                    <option value="Short (impulsive)">Short (Acts without thinking)</option>
                    <option value="Half-cut line">Half-cut line (Logic not sustained long)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Tip Element Shape</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_tip_element || ''}
                    onChange={(e) => updateVedicField('thumb_tip_element', e.target.value)}
                  >
                    <option value="">Select Tip Element...</option>
                    <option value="Square (Earth)">Square — Earth (Practical, stubborn)</option>
                    <option value="Round (Air)">Round — Air (Investigative, Ketu-driven)</option>
                    <option value="Conical (Water)">Conical — Water (Emotional, artistic)</option>
                    <option value="Spatulate (Fire)">Spatulate — Fire (Energetic, action-first)</option>
                  </select>
                </div>
              </div>

              {/* Thumb Type + 2nd Phalange + Tip Element Interpretations */}
              {(vedicData.thumb_type || vedicData.thumb_second_phalange || vedicData.thumb_tip_element) && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2 leading-relaxed">
                  <span className="font-bold text-stone-800 uppercase tracking-wider block text-[9px]">Thumb Reading:</span>
                  <div className="space-y-1.5 text-[11px] text-stone-700 font-semibold">

                    {/* Thumb Type */}
                    {vedicData.thumb_type === 'Waist-like' && <p>✨ <strong>Waist-like (Best Type):</strong> Very social, brings everyone along, maintains self-respect while respecting others. Diplomatic — responds appropriately to others' emotional states without envy or complaint. Good sense of humor.</p>}
                    {vedicData.thumb_type === 'Middle Type' && <p>✨ <strong>Middle Type (2nd Best):</strong> Practical and polite. Very good at adjusting and compromising. If combined with tool-use bone trait → resourceful/jugadu — good results even with limited resources.</p>}
                    {vedicData.thumb_type === 'Slight Bend' && <p>⚡ <strong>Slight Backward Bend:</strong> Mildly dominating — adjusts, but with certain conditions ("you do this for me, and I'll do that for you"). Comfort-seeking; life is relatively easy. Enforcement of conditions depends on willpower strength.</p>}
                    {vedicData.thumb_type === 'Stiff' && <p>⚠️ <strong>Stiff / Straight:</strong> Stubborn, rigid, set in their ways. Anger expressed indirectly (slamming doors, venting to others). Plain-spoken — states things exactly as they are. Life involves more hard work/struggle.</p>}
                    {vedicData.thumb_type === 'Very Flexible' && <p>⚠️ <strong>Very Flexible (Bends Back):</strong> If willpower (1st phalange) is small → pure follower. If willpower is good → adjusts but still presents own view. Tends toward wasteful spending and overthinking. Avoids physical labor.</p>}
                    {vedicData.thumb_type === 'Elementary' && <p>⚠️ <strong>Elementary Thumb:</strong> Habit of postponing tasks. Can be aimless, lacking clear life goals. If also stiff → stubborn and aimless together — refuses advice, does only what they've decided.</p>}

                    {/* 2nd Phalange (Logic) */}
                    {vedicData.thumb_second_phalange === 'Normal' && <p>🧠 <strong>2nd Phalange — Normal:</strong> Balanced logic and action. Thinks adequately before doing; neither over-analyses nor acts blindly.</p>}
                    {vedicData.thumb_second_phalange === 'Long (over-thinker)' && <p>⚠️ <strong>2nd Phalange — Long:</strong> Over-thinker / analysis paralysis. Spends excessive time reasoning and second-guessing before any decision. Can delay action indefinitely.</p>}
                    {vedicData.thumb_second_phalange === 'Short (impulsive)' && <p>⚠️ <strong>2nd Phalange — Short:</strong> Impulsive. Acts without thinking through consequences. Strong willpower but weak logic filter — says or does things they later regret.</p>}
                    {vedicData.thumb_second_phalange === 'Half-cut line' && <p>⚡ <strong>2nd Phalange — Half-cut line:</strong> Logic is present but not sustained. Reasoning starts strong, then cuts off — decisions are partially thought through but abandoned mid-way.</p>}

                    {/* Tip Element */}
                    {vedicData.thumb_tip_element === 'Square (Earth)' && <p>🟫 <strong>Tip — Square (Earth / Pṛthvī):</strong> Practical, stubborn, and grounded. Executes decisions in a stable, methodical way. Values tangible results over ideas.</p>}
                    {vedicData.thumb_tip_element === 'Round (Air)' && <p>🔵 <strong>Tip — Round (Air / Vāyu / Ketu):</strong> Investigative and philosophical. Curious mind that questions everything. Prefers understanding the "why" before acting.</p>}
                    {vedicData.thumb_tip_element === 'Conical (Water)' && <p>💧 <strong>Tip — Conical (Water / Jala):</strong> Emotionally driven decisions. Artistic and sensitive. Willpower is shaped by mood and emotional state rather than pure logic.</p>}
                    {vedicData.thumb_tip_element === 'Spatulate (Fire)' && <p>🔥 <strong>Tip — Spatulate (Fire / Agni):</strong> Action-first, energy-first. High physical drive. Gets things done through force of personality and enthusiasm rather than careful planning.</p>}

                  </div>
                </div>
              )}

              <div className="border-t border-stone-100 pt-3 space-y-2">
                <span className="font-bold text-xs text-stone-700 block">Special Indicators</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      className="rounded text-accent-gold focus:ring-accent-gold"
                      checked={vedicData.has_clubbed_thumb || false}
                      onChange={(e) => updateVedicField('has_clubbed_thumb', e.target.checked)}
                    />
                    Clubbed Thumb ("Murderer's Thumb" - Bulged tip / Pent-up energy)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      className="rounded text-accent-gold focus:ring-accent-gold"
                      checked={vedicData.has_six_fingers || false}
                      onChange={(e) => updateVedicField('has_six_fingers', e.target.checked)}
                    />
                    Six Digits (Polydactyly - Excess digit / Struggle-filled life)
                  </label>
                </div>
              </div>

              {/* Dynamic Thumb Interpretation */}
              {(vedicData.thumb_length || vedicData.thumb_angle || vedicData.thumb_first_phalange_length || vedicData.thumb_first_phalange_condition || vedicData.has_clubbed_thumb || vedicData.has_six_fingers) && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                    Thumb Sāmudrika Significations
                  </span>

                  <div className="space-y-1.5 text-[11px] text-stone-700 leading-relaxed font-semibold">
                    {/* Willpower & Core Personality Readings based on Angle */}
                    {vedicData.thumb_angle === 'Exactly 90°' && (
                      <p>✨ <strong className="text-amber-900">Foundation-Type Personality:</strong> Practical, stable, and highly dependable. Acts as the pillar (nīv) of the family or workplace—the person without whom things do not run smoothly. Intense self-respect and willpower.</p>
                    )}
                    {vedicData.thumb_angle === 'Above 90°' && (
                      <p>✨ <strong className="text-amber-900">Struggle-built Independence:</strong> Likely had a struggle-filled childhood, but carries immense inner strength and independent thinking to turn circumstances in their favor. Deep logic and questioning mindset. Success often comes post-age 40.</p>
                    )}
                    {vedicData.thumb_angle === '45°-70°' && (
                      <p>⚠️ <strong className="text-amber-900">Imaginative / Daydreamer:</strong> Prone to elaborate daydreaming ("Khyālī Pulāv").
                        {vedicData.hand_tattva && vedicData.hand_tattva.includes('Jala') && ' (Especially pronounced on Watery Hands: maximum fantasy/daydreaming).'}
                        {vedicData.hand_tattva && vedicData.hand_tattva.includes('Agni') && ' (On Fiery Hands, they quickly discard the idea if it isn\'t actionable).'}
                        {vedicData.hand_tattva && (vedicData.hand_tattva.includes('Pṛthvī') || vedicData.hand_tattva.includes('Vāyu')) && ' (On Earthy/Airy hands, they work it out practically/analytically without getting lost in fantasy).'}
                        {" Risk of frustration when dreams and resolutions fail to manifest. Practical action steps or team support is required."}
                      </p>
                    )}
                    {vedicData.thumb_angle === 'Below 30°' && (
                      <p>⚠️ <strong className="text-amber-900">High Dependency:</strong> Completely dependent on others' validation and direction. Cannot make independent decisions easily.</p>
                    )}
                    {vedicData.thumb_angle === '30°-45°' && (
                      <p>⚠️ <strong className="text-amber-900">Advice-reliant:</strong> Will express slight opinions in private but ultimately won't act without others' guidance and validation.</p>
                    )}
                    {vedicData.thumb_angle === '70°-90°' && (
                      <p>✨ <strong className="text-amber-900">Near 90°:</strong> Independent; generally does not take others' advice unless the thumb's first phalange is sunken or marked with cut-lines — otherwise listens politely but proceeds with the original decision.</p>
                    )}

                    {/* Thumb Reach vs. Base Marker */}
                    {vedicData.thumb_first_phalange_length === 'Long' && (
                      <p>👤 <strong className="text-amber-900">Thumb Reach — High:</strong> Reaches well above the base marker. Represents strong confidence, free independent thinking, but also high dominance and potential ego (taking full personal credit).</p>
                    )}
                    {vedicData.thumb_first_phalange_length === 'Average' && (
                      <p>👤 <strong className="text-amber-900">Thumb Reach — Middle:</strong> Reaches around the base marker. Indicates a self-made/self-built personality who progressed through personal effort, open to credit sharing ("I can do that too").</p>
                    )}
                    {vedicData.thumb_first_phalange_length === 'Short' && (
                      <p>👤 <strong className="text-amber-900">Thumb Reach — Low:</strong> Reaches below the base marker. Indicates lower immunity power and dependency on others for willpower.</p>
                    )}

                    {/* Receptivity to advice */}
                    {vedicData.thumb_first_phalange_condition && (
                      <p>💡 <strong className="text-amber-900">Advice Receptivity:</strong>
                        {vedicData.thumb_first_phalange_condition === 'Smooth' && ' Listens politely but ultimately does exactly what they had already decided independently.'}
                        {(vedicData.thumb_first_phalange_condition === 'Sunken/Flattened' || vedicData.thumb_first_phalange_condition === 'Cut marks/lines') && ' The sunken surface or lines/marks make them highly receptive to others\' advice, actively seeking validation.'}
                        {vedicData.thumb_first_phalange_condition === 'Bulged' && ' Bulged/puffy tip increases firmness, stubbornness, and short-tempered practicality.'}
                      </p>
                    )}

                    {/* Special warnings */}
                    {vedicData.has_clubbed_thumb && (
                      <p className="text-red-700 bg-red-500/5 border border-red-500/10 p-2 rounded-lg mt-1 font-semibold">
                        ⚠️ <strong className="font-bold text-red-900">Clubbed Thumb ("Murderer's Thumb"):</strong> Swollen thumb-tip indicates blocked/stagnant energy ("Pent-Up Energy") pooling at the tip instead of circulating — leading to extreme reactions in whichever direction is triggered (intense anger OR intense love), not anger alone. Must be confirmed against Moon mount and Mars; not every person with this thumb becomes violent.
                      </p>
                    )}
                    {vedicData.has_six_fingers && (
                      <p className="text-red-700 bg-red-500/5 border border-red-500/10 p-2 rounded-lg mt-1 font-semibold">
                        ⚠️ <strong className="font-bold text-red-900">Structural Excess (Six Digits):</strong> Traditional Sāmudrika rules state that excess digits represent structural imbalance. Frequently associated with a life of recurring obstacles and intense personal struggle.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ─── FINGERS — Jupiter (Guru / Index) — Lecture 08 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Jupiter Finger (Guru / Index) — Aṅguli Analysis
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Read length vs. Sun finger first, then tilt direction, then all three phalanges from tip downward.</p>

              {/* All 6 Jupiter fields in one compact grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Length vs. Sun (Ring)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_length || ''}
                    onChange={(e) => updateVedicField('jupiter_length', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short (below half of Saturn's 1st phalanx — absolute, not vs. Sun)</option>
                    <option value="Normal">Normal / Equal</option>
                    <option value="Long">Long (Above Sun)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tilt Direction</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_tilt || ''}
                    onChange={(e) => updateVedicField('jupiter_tilt', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Toward Saturn">→ Saturn (philosophical)</option>
                    <option value="Straight">Straight (balanced)</option>
                    <option value="Toward Thumb">→ Thumb (own terms)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tip Element</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_tip_element || ''}
                    onChange={(e) => updateVedicField('jupiter_tip_element', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Square (Earth)">Square — Earth</option>
                    <option value="Round (Air)">Round — Air</option>
                    <option value="Conical (Water)">Conical — Water</option>
                    <option value="Spatulate (Fire)">Spatulate — Fire</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">1st Phalange (Mentality)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_phalange_1 || ''}
                    onChange={(e) => updateVedicField('jupiter_phalange_1', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short</option>
                    <option value="Normal">Normal</option>
                    <option value="Long & Bulged">Long &amp; Bulged</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">2nd Phalange (Logic)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_phalange_2 || ''}
                    onChange={(e) => updateVedicField('jupiter_phalange_2', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Normal">Normal</option>
                    <option value="Horizontal line (reduced logic)">Horizontal line</option>
                    <option value="Vertical line (stress)">Vertical line (stress)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">3rd Phalange (Results)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_phalange_3 || ''}
                    onChange={(e) => updateVedicField('jupiter_phalange_3', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Open/Full">Open / Full (good)</option>
                    <option value="Thin">Thin (low results)</option>
                    <option value="Has marks/lines">Has marks / lines</option>
                  </select>
                </div>
              </div>

              {/* Jupiter Interpretation */}
              {(vedicData.jupiter_length || vedicData.jupiter_tilt || vedicData.jupiter_phalange_1 || vedicData.jupiter_phalange_3) && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-200/40 rounded-xl text-xs space-y-1.5 leading-relaxed">
                  <span className="font-bold text-indigo-900 flex items-center gap-1 text-[9px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Jupiter Sāmudrika Significations
                  </span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.jupiter_length === 'Normal' && <p>⚖️ <strong>Normal Jupiter:</strong> Good listener, absorbs more than shares. Spiritually inclined but not showy. High morality. Guru-like qualities. Contented/satisfied. Balanced between materialistic and emotional.</p>}
                    {vedicData.jupiter_length === 'Long' && <p>📖 <strong>Long Jupiter:</strong> Showiness about knowledge; cannot accept correction and may aggressively demand proof; dominating; over-prepares for every scenario; gives unsolicited advice/opinions.</p>}
                    {vedicData.jupiter_length === 'Short' && <p>⚠️ <strong>Short Jupiter:</strong> Lower self-confidence. Relies on others for direction in knowledge matters. May be less willing to teach or guide.</p>}
                    {vedicData.jupiter_tilt === 'Toward Saturn' && <p>🪐 <strong>Tilt → Saturn:</strong> Respects social norms and does not break society\'s rules. Philosophical inclination increases if finger also has knots. May not impose personal rules on others.</p>}
                    {vedicData.jupiter_tilt === 'Toward Thumb' && <p>💪 <strong>Tilt → Self/Thumb:</strong> Works on their own terms. May impose conditions on others. Whether they can enforce this depends on willpower (1st phalange) strength.</p>}
                    {vedicData.jupiter_phalange_1 === 'Long & Bulged' && <p>✨ <strong>1st Phalange (Long &amp; Bulged):</strong> Strong spiritual inclination (may show as worship, charity, or dharmic service). Good ancestral inheritance in thinking/mentality.</p>}
                    {vedicData.jupiter_phalange_2 === 'Horizontal line (reduced logic)' && <p>⚠️ <strong>2nd Phalange (Horizontal):</strong> Implementation of knowledge is reduced. Person accepts things without fully reasoning them through.</p>}
                    {vedicData.jupiter_phalange_2 === 'Vertical line (stress)' && <p>⚠️ <strong>2nd Phalange (Vertical):</strong> Stress accompanies implementation. Excessive worry about applying what was learned.</p>}
                    {vedicData.jupiter_phalange_3 === 'Thin' && <p>⚠️ <strong>3rd Phalange (Thin):</strong> Results in Jupiter matters (knowledge, wisdom, leadership) are not proportionate to effort/mentality put in.</p>}
                    {vedicData.jupiter_phalange_3 === 'Open/Full' && <p>✨ <strong>3rd Phalange (Full):</strong> Good results flow from Jupiter matters. Knowledge translates into real outcomes.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ─── FINGERS — Saturn (Śani / Middle) — Lecture 09 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-slate-500" />
                Saturn Finger (Śani / Middle) — Aṅguli Analysis
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Saturn is the longest finger. Read its natural tilt to understand the person\'s relationship with work, rules, and society.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Saturn Length</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.saturn_length || ''}
                    onChange={(e) => updateVedicField('saturn_length', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short</option>
                    <option value="Normal">Normal</option>
                    <option value="Long">Long</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tilt Direction</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.saturn_tilt || ''}
                    onChange={(e) => updateVedicField('saturn_tilt', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Toward Jupiter">→ Jupiter (philosophical)</option>
                    <option value="Straight">Straight (balanced)</option>
                    <option value="Toward Sun">→ Sun (confidence dips, more hard work)</option>
                  </select>
                </div>
              </div>

              {/* Saturn Phalanges (Notes 09) */}
              <div className="border-t border-stone-100 pt-3">
                <span className="text-[11px] font-bold text-stone-700 block mb-2">Saturn Phalanges (Note 08 general phalange framework)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="form-label text-xs">1st Phalange (Discipline)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.saturn_phalange_1 || ''}
                      onChange={(e) => updateVedicField('saturn_phalange_1', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Short">Short (low discipline)</option>
                      <option value="Normal">Normal</option>
                      <option value="Long">Long (deep discipline)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">2nd Phalange (Work Logic)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.saturn_phalange_2 || ''}
                      onChange={(e) => updateVedicField('saturn_phalange_2', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Normal">Normal</option>
                      <option value="Horizontal line">Horizontal line (delayed logic)</option>
                      <option value="Vertical line (stress)">Vertical line (career stress)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">3rd Phalange (Material Results)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.saturn_phalange_3 || ''}
                      onChange={(e) => updateVedicField('saturn_phalange_3', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Open/Full">Open / Full (solid returns)</option>
                      <option value="Thin">Thin (high effort, low return)</option>
                      <option value="Has marks/lines">Has marks / stress lines</option>
                    </select>
                  </div>
                </div>
              </div>

              {(vedicData.saturn_length || vedicData.saturn_tilt || vedicData.saturn_phalange_1 || vedicData.saturn_phalange_2 || vedicData.saturn_phalange_3) && (
                <div className="p-3 bg-slate-50 border border-slate-200/40 rounded-xl text-xs space-y-1 leading-relaxed">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-[9px]">Saturn Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.saturn_length === 'Short' && <p>⚠️ <strong>Short Saturn (rare):</strong> Discretion and sense of responsibility almost absent; breaks tradition/rules with little regard for family honor; internal negativity/suspicion that can (with weak Mars) tip into actual wrongdoing; relates to longevity — possible health/lifespan risk via poor habits; if Saturn is afflicted and Moon weak, little internal drive to act at all.</p>}
                    {vedicData.saturn_length === 'Normal' && <p>✨ <strong>Normal Saturn:</strong> Balanced relationship with work and duty. Karma unfolds steadily without extremes.</p>}
                    {vedicData.saturn_length === 'Long' && <p>📌 <strong>Long Saturn:</strong> Suspicious by nature; can become inclined toward wrong methods to accomplish goals; overthinking leading to mental disturbance; emotionally flat/cold in speech and expression; high seriousness/maturity but lower responsibility than a normal finger; prefers isolation.</p>}
                    {vedicData.saturn_tilt === 'Toward Jupiter' && <p>📖 <strong>Tilt → Jupiter:</strong> The person seeks to learn before acting. Knowledge and wisdom shape their sense of duty.</p>}
                    {vedicData.saturn_tilt === 'Toward Sun' && <p>⚡ <strong>Tilt → Sun:</strong> Confidence decreases, hard work increases. Fear of wrongdoing/defamation reduces risk-taking (eases only if Sun finger is very long + thumb/Jupiter are strong). Positive: good personal/professional balance.</p>}
                    {vedicData.saturn_phalange_1 === 'Long' && <p>🪐 <strong>1st Phalange (Long):</strong> Deep discipline and seriousness.</p>}
                    {vedicData.saturn_phalange_2 === 'Horizontal line' && <p>⚠️ <strong>2nd Phalange (Horizontal line):</strong> Execution of karmic responsibility encounters intellectual delay or obstacles.</p>}
                    {vedicData.saturn_phalange_2 === 'Vertical line (stress)' && <p>⚠️ <strong>2nd Phalange (Vertical line):</strong> High career stress and anxiety around delivering duties.</p>}
                    {vedicData.saturn_phalange_3 === 'Open/Full' && <p>✨ <strong>3rd Phalange (Full):</strong> Solid material fruits and lasting stability earned from career labor.</p>}
                    {vedicData.saturn_phalange_3 === 'Thin' && <p>⚠️ <strong>3rd Phalange (Thin):</strong> Person labors hard, but financial or tangible returns remain modest.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ─── FINGERS — Sun (Sūrya / Ring) — Lecture 09 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Sun Finger (Sūrya / Ring) — Aṅguli Analysis
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Sun controls fame, ego, risk-taking, and vitality. Compare to Jupiter to assess ego type.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div className="form-group">
                  <label className="form-label text-xs">Length vs. Jupiter</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.sun_length || ''}
                    onChange={(e) => updateVedicField('sun_length', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short</option>
                    <option value="Normal">Normal / Equal</option>
                    <option value="Long">Long (risk-taker)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tilt Direction</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.sun_tilt || ''}
                    onChange={(e) => updateVedicField('sun_tilt', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Toward Saturn">→ Saturn (fame via work)</option>
                    <option value="Straight">Straight (balanced)</option>
                    <option value="Toward Mercury">→ Mercury (creative blend)</option>
                  </select>
                </div>
                <div className="form-group col-span-2 md:col-span-2 flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-stone-700">
                    <input
                      type="checkbox"
                      className="rounded text-accent-gold focus:ring-accent-gold"
                      checked={vedicData.sun_crooked || false}
                      onChange={(e) => updateVedicField('sun_crooked', e.target.checked)}
                    />
                    <span>Sun Finger is Crooked / Bent</span>
                  </label>
                </div>
              </div>

              {/* Sun Phalanges (Notes 09) */}
              <div className="border-t border-stone-100 pt-3">
                <span className="text-[11px] font-bold text-stone-700 block mb-2">Sun Phalanges (Note 08 general phalange framework)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="form-label text-xs">1st Phalange (Creative Vision)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.sun_phalange_1 || ''}
                      onChange={(e) => updateVedicField('sun_phalange_1', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Short">Short</option>
                      <option value="Normal">Normal</option>
                      <option value="Long">Long (high artistic genius)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">2nd Phalange (Aesthetic Logic)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.sun_phalange_2 || ''}
                      onChange={(e) => updateVedicField('sun_phalange_2', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Normal">Normal</option>
                      <option value="Horizontal line">Horizontal line (ego clash)</option>
                      <option value="Vertical line (stress)">Vertical line (reputation anxiety)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">3rd Phalange (Fame & Luxury)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.sun_phalange_3 || ''}
                      onChange={(e) => updateVedicField('sun_phalange_3', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Open/Full">Open / Full (luxury & acclaim)</option>
                      <option value="Thin">Thin (modest material gain)</option>
                      <option value="Has marks/lines">Has marks / blemishes</option>
                    </select>
                  </div>
                </div>
              </div>

              {(vedicData.sun_length || vedicData.sun_tilt || vedicData.sun_crooked || vedicData.sun_phalange_1 || vedicData.sun_phalange_2 || vedicData.sun_phalange_3) && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/40 rounded-xl text-xs space-y-1 leading-relaxed">
                  <span className="font-bold text-amber-900 uppercase tracking-wider block text-[9px]">Sun Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.sun_length === 'Long' && <p>⚡ <strong>Long Sun:</strong> Greater risk-taking ability — tends to act before thinking. Strong creative energy and drive for recognition.</p>}
                    {vedicData.sun_length === 'Normal' && <p>✨ <strong>Normal/Equal Sun:</strong> Balanced ego. Ego is expressed harmoniously, neither dominating nor submissive.</p>}
                    {vedicData.sun_length === 'Short' && <p>⚠️ <strong>Short Sun:</strong> Low confidence (eased only if thumb's willpower area is full); loses ability to distinguish right from wrong; becomes a follower rather than initiator; little creativity unless Mercury finger compensates; possible immunity/health issues; withdraws in social settings; may quarrel over small matters from an inner inferiority complex.</p>}
                    {vedicData.sun_tilt === 'Toward Saturn' && <p>🪐 <strong>Tilt → Saturn:</strong> Increases desire for fame through one\'s karma/work, but can bring anxiety (self-confidence dips). If Saturn also tilts toward Sun → yoga for defamation possible alongside career prominence. Typically good at balancing personal and professional life.</p>}
                    {vedicData.sun_crooked && <p>⚡ <strong>Crooked/Bent:</strong> If from knots: makes the person a philosopher in that domain. If from a genuine bend: excessive ego/arrogance, poor right-vs-wrong judgment leading to wrong decisions, reduced name/fame, inflated confidence from others' praise rather than real substance.</p>}
                    {vedicData.sun_phalange_1 === 'Long' && <p>☀️ <strong>1st Phalange (Long):</strong> Heightened creative vision, dramatic/artistic instincts.</p>}
                    {vedicData.sun_phalange_2 === 'Horizontal line' && <p>⚠️ <strong>2nd Phalange (Horizontal line):</strong> Clashes of ego and difficulty turning aesthetic concepts into tangible execution.</p>}
                    {vedicData.sun_phalange_2 === 'Vertical line (stress)' && <p>⚠️ <strong>2nd Phalange (Vertical line):</strong> Sensitive to social reputation; persistent stress about status.</p>}
                    {vedicData.sun_phalange_3 === 'Open/Full' && <p>✨ <strong>3rd Phalange (Full):</strong> Enjoyment of luxurious comfort, high social standing and visible material prestige.</p>}
                    {vedicData.sun_phalange_3 === 'Thin' && <p>⚠️ <strong>3rd Phalange (Thin):</strong> Public recognition achieved, but with modest material accumulation.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ─── FINGERS — Mercury (Budh / Little) — Lecture 10 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-teal-500" />
                Mercury Finger (Budh / Little) — Aṅguli Analysis
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Mercury controls communication, business acumen, writing, and diplomacy. Benchmark is the uppermost joint/crease line (sandhi rekhā) of the Sun finger: reaching = normal/balanced; above = gifted oratory &amp; commerce; below = timid speech / slower logic filtering.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div className="form-group">
                  <label className="form-label text-xs">Length (ref: 1st joint of Sun)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.mercury_length || ''}
                    onChange={(e) => updateVedicField('mercury_length', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short</option>
                    <option value="Average">Normal</option>
                    <option value="Long">Long</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tilt / Position</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.mercury_tilt || ''}
                    onChange={(e) => updateVedicField('mercury_tilt', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Attached to Sun">Attached (norm-seeking)</option>
                    <option value="Straight">Straight</option>
                    <option value="Separated from Sun">Separated (independent)</option>
                  </select>
                </div>
                <div className="form-group col-span-2 md:col-span-2 flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-stone-700">
                    <input
                      type="checkbox"
                      className="rounded text-accent-gold focus:ring-accent-gold"
                      checked={vedicData.mercury_low_set || false}
                      onChange={(e) => updateVedicField('mercury_low_set', e.target.checked)}
                    />
                    <span>Mercury base is low-set (starts lower than other fingers)</span>
                  </label>
                </div>
              </div>

              {/* Mercury Phalanges (Notes 10) */}
              <div className="border-t border-stone-100 pt-3">
                <span className="text-[11px] font-bold text-stone-700 block mb-2">Mercury Phalanges (Note 08 general phalange framework)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="form-label text-xs">1st Phalange (Speech/Eloquence)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.mercury_phalange_1 || ''}
                      onChange={(e) => updateVedicField('mercury_phalange_1', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Short">Short (speech hesitations)</option>
                      <option value="Normal">Normal</option>
                      <option value="Long">Long (silver-tongued orator)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">2nd Phalange (Commercial Logic)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.mercury_phalange_2 || ''}
                      onChange={(e) => updateVedicField('mercury_phalange_2', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Normal">Normal</option>
                      <option value="Horizontal line">Horizontal line (financial misstep)</option>
                      <option value="Vertical line (stress)">Vertical line (business stress)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">3rd Phalange (Trade Results)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.mercury_phalange_3 || ''}
                      onChange={(e) => updateVedicField('mercury_phalange_3', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Open/Full">Open / Full (profitable trade)</option>
                      <option value="Thin">Thin (thin margins)</option>
                      <option value="Has marks/lines">Has marks / leaks</option>
                    </select>
                  </div>
                </div>
              </div>

              {(vedicData.mercury_length || vedicData.mercury_tilt || vedicData.mercury_low_set || vedicData.mercury_phalange_1 || vedicData.mercury_phalange_2 || vedicData.mercury_phalange_3) && (
                <div className="p-3 bg-teal-50/50 border border-teal-200/40 rounded-xl text-xs space-y-1.5 leading-relaxed">
                  <span className="font-bold text-teal-900 uppercase tracking-wider block text-[9px]">Mercury Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.mercury_length === 'Long' && <p>✨ <strong>Long Mercury:</strong> Excellent logical ability, persuasion, and research capacity. Good at last-minute preparation and still succeeding. Strong diplomacy — "snake dies, stick intact" communication style. Scientist-level analytical capacity.</p>}
                    {vedicData.mercury_length === 'Average' && <p>✨ <strong>Normal Mercury:</strong> Multi-talented, quick-witted, good at speaking and social interaction. Love of arts. All Mercury qualities present in balanced measure.</p>}
                    {vedicData.mercury_length === 'Short' && <p>⚠️ <strong>Short Mercury:</strong> Dull intellect indicator (mand buddhi). Difficulty with logic and grasping concepts. Possible nervous system issues. Indecisive. May be timid in speech. Can indicate complications related to childbirth/reproduction (read with lines).</p>}
                    {vedicData.mercury_tilt === 'Attached to Sun' && <p>📌 <strong>Attached to Sun:</strong> Speech has commanding quality. Desires recognition and praise. Craves name/fame. Tends not to break social norms — fears disapproval from others. In astrology: like Mercury-Sun conjunction (yuti).</p>}
                    {vedicData.mercury_tilt === 'Separated from Sun' && <p>🌟 <strong>Separated/Gap:</strong> Will do what they\'ve decided regardless of others\' opinion. Prefers to work outside conventional norms. Not afraid of criticism. Open-minded and freedom-loving. Does not necessarily do anything bad — may simply take paths their family never considered.</p>}
                    {vedicData.mercury_low_set && <p>📏 <strong>Low-set base:</strong> Mercury base sits lower than other fingers on most hands (this is common). The mount below gets less space as the finger takes more area. Read mount condition separately to compensate.</p>}
                    {vedicData.mercury_phalange_1 === 'Long' && <p>☿ <strong>1st Phalange (Long):</strong> Strong communication ability.</p>}
                    {vedicData.mercury_phalange_2 === 'Horizontal line' && <p>⚠️ <strong>2nd Phalange (Horizontal line):</strong> Vulnerable to contractual misunderstandings or flawed business arithmetic.</p>}
                    {vedicData.mercury_phalange_2 === 'Vertical line (stress)' && <p>⚠️ <strong>2nd Phalange (Vertical line):</strong> Commercial stress and anxiety surrounding financial negotiations.</p>}
                    {vedicData.mercury_phalange_3 === 'Open/Full' && <p>✨ <strong>3rd Phalange (Full):</strong> Good business/trade results.</p>}
                    {vedicData.mercury_phalange_3 === 'Thin' && <p>⚠️ <strong>3rd Phalange (Thin):</strong> Commercial ideas exist, but leak profit or struggle to build accumulated savings.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ─── GENERAL FINGER PROFILE — Lecture 10 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Eye className="w-4 h-4 text-rose-500" />
                General Finger Profile
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Overall finger build, spacing between fingers, and depth of lines — all reveal core temperament and life difficulty.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Finger Spacing</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.finger_gaps || ''}
                    onChange={(e) => updateVedicField('finger_gaps', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="None">None — fingers touch</option>
                    <option value="Small gaps (generous)">Small — generous</option>
                    <option value="Wide gaps (free spirit)">Wide — free spirit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Overall Finger Build</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.finger_build || ''}
                    onChange={(e) => updateVedicField('finger_build', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Normal">Normal</option>
                    <option value="Long & thin (creative)">Long &amp; thin — creative</option>
                    <option value="Short & thick (stubborn + anger)">Short &amp; thick — stubborn</option>
                    <option value="Thick base (food lover / lazy)">Thick base — food lover</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Palm Line Depth</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.line_depth || ''}
                    onChange={(e) => updateVedicField('line_depth', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Light lines">Light / faint (easier)</option>
                    <option value="Normal">Normal depth</option>
                    <option value="Deep / dark lines (tough life)">Deep / dark (tough life)</option>
                  </select>
                </div>
              </div>
              {(vedicData.finger_gaps || vedicData.finger_build || vedicData.line_depth) && (
                <div className="p-3 bg-rose-50/40 border border-rose-200/30 rounded-xl text-xs space-y-1 leading-relaxed">
                  <span className="font-bold text-rose-900 uppercase tracking-wider block text-[9px]">General Profile Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.finger_gaps === 'Small gaps (generous)' && <p>🤲 <strong>Small gaps:</strong> Generous — quick to help when someone asks. Gap is caused by one finger\'s base phalanx being sunken on one side. Also indicates spending (generosity and spending go together).</p>}
                    {vedicData.finger_gaps === 'Wide gaps (free spirit)' && <p>🌬️ <strong>Wide gaps:</strong> Highly generous, quick to spend or help.</p>}
                    {vedicData.finger_build === 'Long & thin (creative)' && <p>🎨 <strong>Long &amp; thin:</strong> Creative individual. Less hard labor required — natural ability allows easier achievement.</p>}
                    {vedicData.finger_build === 'Short & thick (stubborn + anger)' && <p>⚠️ <strong>Short &amp; thick:</strong> Both stubbornness and anger increase together. Hasty/impulsive. Requires more hard work in life.</p>}
                    {vedicData.finger_build === 'Thick base (food lover / lazy)' && <p>🍲 <strong>Thick base:</strong> Enjoys cooking and eating well. Good at hospitality. Per classical texts, food-loving but may lean toward laziness.</p>}
                    {vedicData.line_depth === 'Deep / dark lines (tough life)' && <p>⚠️ <strong>Deep / dark lines:</strong> A hand with many deep lines is not considered favorable — it indicates a tough life. Deep portions along a single line correspond to phases of significant pressure in that area/timeframe.</p>}
                    {vedicData.line_depth === 'Light lines' && <p>✨ <strong>Light lines:</strong> Light portions along lines correspond to relatively easier phases of life. Generally a favorable indicator.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Dorsal Hand Analysis (Back Palm Modifiers) */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-violet-500" />
                Dorsal Hand Analysis (Back Palm Modifiers)
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                Nails, skin texture, and knuckle knots act as massive modifiers that alter the core readings of the palm.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Skin Texture (Dorsal)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.skin_texture || ''}
                    onChange={(e) => updateVedicField('skin_texture', e.target.value)}
                  >
                    <option value="">Select Skin...</option>
                    <option value="Soft/Moisturized">Soft & Moisturized (Fertile/Easy)</option>
                    <option value="Medium">Medium Texture</option>
                    <option value="Hard/Stiff">Hard & Stiff (Struggles/Stiff wrist)</option>
                    <option value="Rough">Rough/Labor-worn (Struggle/Raw)</option>
                    <option value="Thin-skinned (Nerves visible)">Thin-skinned (Visible nerves/Sensitive)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Nail Shape</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_shape || ''}
                    onChange={(e) => updateVedicField('nail_shape', e.target.value)}
                  >
                    <option value="">Select Nail Shape...</option>
                    <option value="Wide/Small">Wide & Small (Elementary traits)</option>
                    <option value="Long/Small">Long & Small</option>
                    <option value="Wide/Big">Wide & Big</option>
                    <option value="Square">Square Nails (Square hand matches)</option>
                    <option value="Beautiful">Beautiful & Long-tapering (Conical/Psychic)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Finger Joints (Knots / Back of Palm — Dārśanika Hasta)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.knots_back_of_hand || vedicData.finger_knots || ''}
                    onChange={(e) => {
                      updateVedicField('knots_back_of_hand', e.target.value);
                      updateVedicField('finger_knots', e.target.value);
                    }}
                  >
                    <option value="">Select Joints...</option>
                    <option value="Smooth / None">Smooth & Tapering (Intuitive, swift)</option>
                    <option value="Jupiter Knots">Jupiter Knots (Teaching / Wisdom / Philosophy)</option>
                    <option value="Saturn Knots">Saturn Knots (Duty / Karma / Scientific Research)</option>
                    <option value="Sun Knots">Sun Knots (Artistic / Aesthetic Philosophy)</option>
                    <option value="Mercury Knots">Mercury Knots (Commercial Logic / Analytical)</option>
                    <option value="All Knotty (Philosophical / Dārśanika)">All Knotty (Deep Philosophical Thinker / Researcher)</option>
                  </select>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label text-xs flex items-center justify-between">
                    <span>Crooked Fingers (Tēḍhī-Mēḍhī — Distinct from Knotty Hand, Lecture 28 §2.7)</span>
                    <span className="text-[10px] text-stone-500 font-normal">cleverness / amplified tension</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(['Saturn', 'Sun', 'Mercury', 'Jupiter'] as const).map((finger) => {
                      const list = vedicData.crooked_fingers || [];
                      const isCrooked = list.includes(finger);
                      return (
                        <label
                          key={finger}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${isCrooked
                            ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isCrooked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...list, finger]
                                : list.filter((f) => f !== finger);
                              updateVedicField('crooked_fingers', updated);
                            }}
                          />
                          <span>{finger} Finger</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Modifiers interpretation based on lecture */}
              {(vedicData.skin_texture || vedicData.nail_shape || vedicData.finger_knots || vedicData.knots_back_of_hand || (vedicData.crooked_fingers && vedicData.crooked_fingers.length > 0)) && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1.5 leading-relaxed">
                  <span className="font-bold text-stone-800 uppercase tracking-wider block text-[9px]">Dorsal Modification Profile:</span>

                  {vedicData.skin_texture && (
                    <p className="text-stone-600 font-medium">
                      <strong>Skin:</strong> {
                        vedicData.skin_texture === 'Soft/Moisturized' ? '✨ Soft & supple skin represents fertile ease and higher responsiveness to favorable yogas.' :
                          vedicData.skin_texture === 'Hard/Stiff' ? '⚠️ Hard, stiff skin blocks flexibility and implies high physical struggle. Represents a lack of pampered care.' :
                            vedicData.skin_texture === 'Rough' ? '⚠️ Rough skin indicates a mindset centered on raw struggle and manual routine. Prone to rejecting self-improvement.' :
                              vedicData.skin_texture === 'Thin-skinned (Nerves visible)' ? '🧠 Thin skin with visible nerves indicates extreme mental/emotional sensitivity and vulnerability.' :
                                'Standard skin elasticity and texture.'
                      }
                    </p>
                  )}

                  {vedicData.nail_shape && (
                    <p className="text-stone-600 font-medium border-t border-stone-200/50 pt-1.5">
                      <strong>Nails:</strong> {
                        vedicData.nail_shape === 'Wide/Small' ? '🔍 Small nails indicate low ambition, short-term planning, or focus on manual tasks.' :
                          vedicData.nail_shape === 'Square' ? '💼 Square nails complement natural business acumen and support strong determination.' :
                            vedicData.nail_shape === 'Beautiful' ? '🎨 Beautiful tapering nails align with creative Sun/Mercury energy or high psychic sensitivity.' :
                              'Nails act as modifiers to determine physical details and health patterns.'
                      }
                    </p>
                  )}

                  {(vedicData.knots_back_of_hand || vedicData.finger_knots) && (
                    <p className="text-stone-600 font-medium border-t border-stone-200/50 pt-1.5">
                      <strong>Knots (Back of Hand):</strong> {
                        (vedicData.knots_back_of_hand?.includes('All Knotty') || vedicData.finger_knots === 'Fully Philosophical (Knotty)')
                          ? '📖 Raised joints across all fingers mark a true Dārśanika Hasta — deep, philosophical thinker, patient analyst, and researcher (Lecture 28 §2.7).'
                          : vedicData.knots_back_of_hand && vedicData.knots_back_of_hand !== 'Smooth / None'
                            ? `📖 Knots localized on ${vedicData.knots_back_of_hand} restrict analytical depth and research specifically to that planet\'s portfolio.`
                            : 'Smooth joints allow swift, intuitive decisions without analytical bottlenecks.'
                      }
                    </p>
                  )}

                  {vedicData.crooked_fingers && vedicData.crooked_fingers.length > 0 && (
                    <p className="text-amber-800 font-medium border-t border-amber-200/50 pt-1.5">
                      <strong>Crooked Fingers (Tēḍhī-Mēḍhī):</strong> {
                        vedicData.crooked_fingers.includes('Saturn')
                          ? '⚡ Crooked Saturn Finger: Implies career path obstacles or requiring tactical cleverness to survive/advance. Do not confuse with knotty knuckles (Lecture 28 §2.5, §2.7).'
                          : `⚡ Crookedness in ${vedicData.crooked_fingers.join(', ')}: Planet\'s natural flow is amplified or prone to eccentric/unconventional expression.`
                      }
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Manibandha Wrist Lines */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Maṇibandha (Wrist Lines)
              </h4>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="form-group">
                  <label className="form-label text-xs">Number of Wrist Lines (Rāsettes)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    className="form-input text-xs"
                    placeholder="1 to 4 lines"
                    value={vedicData.manibandha_lines}
                    onChange={(e) => updateVedicField('manibandha_lines', e.target.value ? parseInt(e.target.value, 10) : '')}
                  />
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 leading-normal font-medium shadow-sm">
                  ⚠️ Observation Rule: Tilt the client\'s hand at a 30-degree angle toward the palm. The wrist lines become visible at this angle. Counts 1 to 4 lines.
                </div>
              </div>
            </div>

            {/* ─── DUAL HAND COMPARATIVE ANALYSIS — Lectures 01, 06, 22 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-purple-500" />
                Left vs. Right Hand Karmic Synthesis (Pūrvārjita vs. Gocara)
              </h4>
              <div className="p-3 bg-purple-50/70 border border-purple-200/50 rounded-xl text-xs space-y-1.5 leading-relaxed">
                <span className="font-bold text-purple-900 uppercase tracking-wider block text-[9px]">Classical Vedic Principle:</span>
                <p className="text-stone-700 text-[11px]">
                  <strong>Left Hand:</strong> Pūrvārjita Karma (Destiny brought at birth, genetic potential, unconscious foundation).<br />
                  <strong>Right Hand:</strong> Present Actions (Gocara &amp; Daśā, conscious choices, free will, self-effort).<br />
                  <span className="italic text-stone-500 text-[10px]">When lines/signs on the right hand are clearer or protected compared to the left, the individual is consciously overcoming past karmic burdens.</span>
                </p>
              </div>
              <div className="form-group">
                <label className="form-label text-xs">Comparative Observations &amp; Karmic Evolution</label>
                <textarea
                  className="form-input h-24 resize-none text-xs"
                  placeholder="e.g. Left hand shows broken fate line at age 28, but right hand shows continuous protective square and clear line. Self-effort overcame early domestic obstacles..."
                  value={vedicData.lh_vs_rh_notes || ''}
                  onChange={(e) => updateVedicField('lh_vs_rh_notes', e.target.value)}
                />
              </div>
            </div>
          </div>
  );
}
