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
    <aside className="theme-panel-soft h-full space-y-6 rounded-[24px] border p-4 sm:p-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Soru Ayarlari</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Bu soru icin sure ve puani buradan duzenle.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="setting-time" className="text-muted-foreground">
          Sure (saniye)
        </Label>
        <Input
          id="setting-time"
          type="number"
          min={5}
          max={300}
          value={question.timeLimitSeconds}
          onChange={(e) => onChange({ timeLimitSeconds: Number(e.target.value) })}
          className="rounded-2xl"
        />
        <p className="text-xs text-muted-foreground">5-300 saniye arasi.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="setting-points" className="text-muted-foreground">
          Puan
        </Label>
        <Input
          id="setting-points"
          type="number"
          min={1}
          max={1000}
          value={question.points}
          onChange={(e) => onChange({ points: Number(e.target.value) })}
          className="rounded-2xl"
        />
        <p className="text-xs text-muted-foreground">
          Dogru cevap icin verilecek temel puan.
        </p>
      </div>

      <div className="border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onRemove}
          disabled={!canRemove}
          className="w-full border-destructive/30 bg-destructive/8 text-destructive hover:bg-destructive/15 disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
        >
          Bu Soruyu Sil
        </Button>
        {!canRemove && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            En az bir soru kalmali.
          </p>
        )}
      </div>
    </aside>
  );
}
