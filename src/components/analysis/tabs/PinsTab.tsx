'use client';

import React from 'react';
import { HandProfile, Pin, HandView, HAND_VIEW_LABELS } from '@/types/palmistry';
import { Trash2 } from 'lucide-react';

interface PinsTabProps {
  profile: HandProfile;
  selectedPin: Pin | null;
  onSelectPin?: (pin: Pin | null) => void;
  onUpdatePin: (pin: Pin) => void;
  onDeletePin: (pinId: string) => void;
  onChangeActiveView?: (view: HandView) => void;
}

export default function PinsTab({
  profile,
  selectedPin,
  onSelectPin,
  onUpdatePin,
  onDeletePin,
  onChangeActiveView,
}: PinsTabProps) {
  const pinsCount = profile.pins?.length || 0;

  return (
          <div className="space-y-4">
            {selectedPin && (
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase shadow-xs"
                      style={{ backgroundColor: selectedPin.color }}
                    >
                      Active Marker
                    </span>
                    <span className="text-xs font-semibold text-stone-700">
                      {HAND_VIEW_LABELS[selectedPin.view] || selectedPin.view}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onSelectPin && (
                      <button
                        type="button"
                        onClick={() => onSelectPin(null)}
                        className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                      >
                        Done Editing
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeletePin(selectedPin.id)}
                      className="text-rose-600 hover:text-rose-700 transition-colors p-1 cursor-pointer"
                      title="Delete marker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Marker Label</label>
                  <input
                    type="text"
                    className="form-input text-xs bg-white"
                    value={selectedPin.label}
                    onChange={(e) => onUpdatePin({ ...selectedPin, label: e.target.value })}
                    placeholder="e.g. Mystic Cross, Star on Apollo, Island on Life Line"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Annotation / Notes</label>
                  <textarea
                    className="form-input h-24 resize-none text-xs bg-white"
                    value={selectedPin.description}
                    onChange={(e) => onUpdatePin({ ...selectedPin, description: e.target.value })}
                    placeholder="Describe what this marking or sign indicates in your course notes..."
                  />
                </div>
              </div>
            )}

            {/* Placed Markers List */}
            {pinsCount > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-stone-600 font-semibold px-1">
                  <span>Placed Markers ({pinsCount})</span>
                  <span className="text-[11px] text-stone-400 font-normal">Click a marker to edit & highlight on canvas</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {(profile.pins || []).map((pin, idx) => {
                    const isSelected = selectedPin?.id === pin.id;
                    return (
                      <div
                        key={pin.id}
                        onClick={() => {
                          onSelectPin?.(pin);
                          if (onChangeActiveView && pin.view) {
                            onChangeActiveView(pin.view);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${isSelected
                          ? 'bg-amber-500/10 border-accent-gold shadow-sm ring-1 ring-accent-gold'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                          }`}
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div
                            className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 border border-white shadow-xs"
                            style={{ backgroundColor: pin.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-stone-800 truncate">
                                {pin.label || `Marker #${idx + 1}`}
                              </h4>
                              <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded font-medium shrink-0">
                                {HAND_VIEW_LABELS[pin.view] || pin.view}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                              {pin.description || 'No notes added yet. Click to edit.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePin(pin.id);
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                            title="Delete marker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-stone-500 text-xs border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                📍 Click on &quot;Place Pins&quot; mode above the canvas, then click on the hand picture to drop a marker pin here.
              </div>
            )}
          </div>
  );
}
