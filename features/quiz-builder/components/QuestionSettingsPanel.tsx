/**
 * Quiz Builder Kingdom — QuestionSettingsPanel (Dumb UI, sağ panel)
 * Aktif soru için süre, puan ve silme kontrolü.
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
    <aside className="bg-white border rounded-lg p-6 space-y-6 h-full">
      <div>
        <h3 className="text-base font-semibold text-slate-950">Soru Ayarları</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Bu soru için süre ve puanı buradan düzenle.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="setting-time">Süre (saniye)</Label>
        <Input
          id="setting-time"
          type="number"
          min={5}
          max={300}
          value={question.timeLimitSeconds}
          onChange={(e) =>
            onChange({ timeLimitSeconds: Number(e.target.value) })
          }
        />
        <p className="text-xs text-muted-foreground">5–300 saniye arası.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="setting-points">Puan</Label>
        <Input
          id="setting-points"
          type="number"
          min={1}
          max={1000}
          value={question.points}
          onChange={(e) => onChange({ points: Number(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">
          Doğru cevap için verilecek temel puan.
        </p>
      </div>

      <div className="pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onRemove}
          disabled={!canRemove}
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 disabled:text-slate-400 disabled:border-slate-200"
        >
          Bu Soruyu Sil
        </Button>
        {!canRemove && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            En az bir soru kalmalı.
          </p>
        )}
      </div>
    </aside>
  );
}
