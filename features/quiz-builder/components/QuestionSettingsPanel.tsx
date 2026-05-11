/**
 * QuestionSettingsPanel - aktif soru ayarlari.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { QuestionDraft } from '@/features/quiz-builder/types';

interface QuestionSettingsPanelProps {
  question: QuestionDraft;
  onChange: (patch: Partial<QuestionDraft>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function QuestionSettingsPanel({
  question,
  onChange,
  onRemove,
  canRemove,
}: QuestionSettingsPanelProps) {
  return (
    <aside className="theme-panel-soft h-full space-y-6 rounded-[24px] border border-slate-800 p-4 text-slate-100 sm:p-6">
      <div>
        <h3 className="text-base font-semibold text-white">Soru Ayarlari</h3>
        <p className="mt-1 text-xs text-slate-400">
          Bu soru icin sure ve puani buradan duzenle.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="setting-time" className="text-slate-300">
          Sure (saniye)
        </Label>
        <Input
          id="setting-time"
          type="number"
          min={5}
          max={300}
          value={question.timeLimitSeconds}
          onChange={(e) =>
            onChange({ timeLimitSeconds: Number(e.target.value) })
          }
          className="rounded-2xl border-slate-700 bg-slate-950/70 text-slate-100"
        />
        <p className="text-xs text-slate-500">5-300 saniye arasi.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="setting-points" className="text-slate-300">
          Puan
        </Label>
        <Input
          id="setting-points"
          type="number"
          min={1}
          max={1000}
          value={question.points}
          onChange={(e) => onChange({ points: Number(e.target.value) })}
          className="rounded-2xl border-slate-700 bg-slate-950/70 text-slate-100"
        />
        <p className="text-xs text-slate-500">
          Dogru cevap icin verilecek temel puan.
        </p>
      </div>

      <div className="border-t border-slate-700 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onRemove}
          disabled={!canRemove}
          className="w-full border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15 hover:text-rose-50 disabled:border-slate-700 disabled:bg-slate-950/50 disabled:text-slate-500"
        >
          Bu Soruyu Sil
        </Button>
        {!canRemove && (
          <p className="mt-2 text-center text-xs text-slate-500">
            En az bir soru kalmali.
          </p>
        )}
      </div>
    </aside>
  );
}
