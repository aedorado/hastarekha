'use client';

import React from 'react';
import { HandProfile, VedicData } from '@/types/palmistry';
import { DetectedYoga } from '@/lib/yogaDetector';

interface TagsTabProps {
  profile: HandProfile;
  updateProfileField: (key: keyof HandProfile, value: any) => void;
  vedicData: VedicData;
  updateVedicField: (key: keyof VedicData, value: any) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  handleAddTag: (e: React.FormEvent) => void;
  handleRemoveTag: (tag: string) => void;
  detectedYogas: DetectedYoga[];
}

export default function TagsTab({
  profile,
  updateProfileField,
  vedicData,
  updateVedicField,
  newTag,
  setNewTag,
  handleAddTag,
  handleRemoveTag,
  detectedYogas,
}: TagsTabProps) {
  return (
          <div className="space-y-4">
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                className="form-input text-xs"
                placeholder="Add tags (e.g. mystic-cross, fork, fish-sign)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <button type="submit" className="btn-gold px-3 text-xs shadow-sm cursor-pointer">
                Add
              </button>
            </form>

            {/* Suggested Tags based on Sāmudrika rules */}
            {(() => {
              const suggestions: string[] = [];
              if (vedicData.hand_tattva) {
                if (vedicData.hand_tattva.includes('Agni')) suggestions.push('fire-hand', 'mars-sun-traits');
                if (vedicData.hand_tattva.includes('Jala')) suggestions.push('water-hand', 'sensitive-mind');
                if (vedicData.hand_tattva.includes('Pṛthvī')) suggestions.push('earth-hand', 'generational-planner');
                if (vedicData.hand_tattva.includes('Vāyu')) suggestions.push('air-hand', 'investigator');
              }
              if (vedicData.thumb_type) {
                if (vedicData.thumb_type === 'Waist-like') suggestions.push('diplomat', 'waist-like-thumb');
                if (vedicData.thumb_type === 'Stiff') suggestions.push('rigid-thumb', 'plain-spoken');
                if (vedicData.thumb_type === 'Very Flexible') suggestions.push('flexible-thumb', 'spendthrift');
              }
              if (vedicData.thumb_second_phalange === 'Long (over-thinker)') {
                suggestions.push('over-thinker');
              }
              if (vedicData.has_clubbed_thumb) {
                suggestions.push('clubbed-thumb', 'quick-temper');
              }
              if (vedicData.has_six_fingers) {
                suggestions.push('polydactyly', 'struggle-filled');
              }
              if (vedicData.jupiter_length === 'Long') {
                suggestions.push('authoritative-ego', 'teacher-profile');
              }
              if (vedicData.mercury_length === 'Long') {
                suggestions.push('diplomatic-speech', 'researcher');
              }
              if (vedicData.mercury_tilt === 'Separated from Sun') {
                suggestions.push('independent-mind', 'rule-breaker');
              }
              if (vedicData.finger_knots === 'Fully Philosophical (Knotty)') {
                suggestions.push('philosophical', 'message-deliverer');
              }
              if (vedicData.line_depth && vedicData.line_depth.includes('Deep')) {
                suggestions.push('struggle-lines');
              }

              const filteredSuggestions = suggestions.filter(s => !profile.tags.includes(s));
              if (filteredSuggestions.length === 0) return null;

              return (
                <div className="space-y-1.5 border-t border-stone-100 pt-3">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Suggested Tags (Click to Add):</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {filteredSuggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => updateProfileField('tags', [...profile.tags, tag])}
                        className="bg-stone-50 hover:bg-amber-500/10 text-stone-600 hover:text-accent-gold px-2 py-0.5 rounded text-[10px] font-semibold border border-stone-200 hover:border-amber-500/20 transition-all cursor-pointer"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-wrap gap-2 pt-2">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-amber-500/10 text-accent-gold px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-500/20"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 font-bold transition-colors ml-1 text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              {profile.tags.length === 0 && (
                <div className="text-stone-500 text-xs italic">No tags added yet. Tags help you search and filter study examples.</div>
              )}
            </div>
          </div>
  );
}
