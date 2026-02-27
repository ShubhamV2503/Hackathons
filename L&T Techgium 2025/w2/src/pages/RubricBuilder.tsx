import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, Save, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useRubrics, RubricCategory, Criterion } from "@/context/RubricContext";
import { useToast } from "@/hooks/use-toast";

const categories: RubricCategory[] = ["Flowchart", "Pseudocode", "Algorithm"];

export default function RubricBuilder() {
  const { rubrics, updateRubric, addRubric, removeRubric } = useRubrics();
  const [activeCategory, setActiveCategory] = useState<RubricCategory>("Flowchart");
  const [selectedRubricId, setSelectedRubricId] = useState<number | null>(null);
  const [selectedCriterionId, setSelectedCriterionId] = useState<number | null>(null);
  const { toast } = useToast();

  const filteredRubrics = rubrics.filter((r) => r.category === activeCategory);
  const activeRubric = filteredRubrics.find((r) => r.id === selectedRubricId) ?? filteredRubrics[0] ?? null;
  const currentCriterion = activeRubric?.criteria.find((c) => c.id === selectedCriterionId) ?? activeRubric?.criteria[0] ?? null;

  const effectiveRubricId = activeRubric?.id ?? null;
  const effectiveCriterionId = currentCriterion?.id ?? null;

  const updateCriterion = (patch: Partial<Criterion>) => {
    if (!effectiveRubricId || !effectiveCriterionId) return;
    const rubric = rubrics.find((r) => r.id === effectiveRubricId);
    if (!rubric) return;
    updateRubric(effectiveRubricId, {
      criteria: rubric.criteria.map((c) => (c.id === effectiveCriterionId ? { ...c, ...patch } : c)),
    });
  };

  const addCriterion = () => {
    if (!effectiveRubricId) return;
    const rubric = rubrics.find((r) => r.id === effectiveRubricId);
    if (!rubric) return;
    const newC: Criterion = { id: Date.now(), name: "New Criterion", weight: 10, indicators: [""] };
    updateRubric(effectiveRubricId, { criteria: [...rubric.criteria, newC] });
    setSelectedCriterionId(newC.id);
  };

  const removeCriterion = (id: number) => {
    if (!effectiveRubricId) return;
    const rubric = rubrics.find((r) => r.id === effectiveRubricId);
    if (!rubric) return;
    updateRubric(effectiveRubricId, { criteria: rubric.criteria.filter((c) => c.id !== id) });
    if (effectiveCriterionId === id) setSelectedCriterionId(null);
  };

  const handleAddRubric = () => {
    const name = `New ${activeCategory} Rubric`;
    addRubric({ name, category: activeCategory, criteria: [] });
    toast({ title: "Rubric created", description: `"${name}" has been added.` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rubric Builder</h1>
        <p className="text-muted-foreground mt-1">Create and manage evaluation criteria for each submission type.</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSelectedRubricId(null); setSelectedCriterionId(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat
              ? "gradient-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rubric selector for active category */}
      <div className="flex items-center gap-3 flex-wrap">
        {filteredRubrics.map((r) => (
          <button
            key={r.id}
            onClick={() => { setSelectedRubricId(r.id); setSelectedCriterionId(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${effectiveRubricId === r.id
              ? "border-primary bg-primary/5 text-foreground font-medium"
              : "border-border hover:bg-muted/50 text-muted-foreground"
              }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {r.name}
          </button>
        ))}
        <Button size="sm" variant="outline" onClick={handleAddRubric}>
          <Plus className="w-4 h-4 mr-1" />Add Rubric
        </Button>
      </div>

      {activeRubric ? (
        <div className="space-y-4">
          {/* Rubric Name Editor */}
          <div className="glass-card p-4">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Rubric Name</label>
            <Input
              value={activeRubric.name}
              onChange={(e) => updateRubric(activeRubric.id, { name: e.target.value })}
              className="mb-4"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: Criteria list */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Criteria</h3>
                <Button size="sm" variant="ghost" onClick={addCriterion}><Plus className="w-4 h-4 mr-1" />Add</Button>
              </div>
              <div className="divide-y divide-border">
                {activeRubric.criteria.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCriterionId(c.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${effectiveCriterionId === c.id
                      ? "bg-primary/5 border-l-2 border-primary"
                      : "hover:bg-muted/50 border-l-2 border-transparent"
                      }`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Weight: {c.weight}%</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeCriterion(c.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </button>
                ))}
                {activeRubric.criteria.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No criteria yet. Click "Add" above.</p>
                )}
              </div>
            </motion.div>

            {/* Right: Editor */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 glass-card p-6 space-y-6">
              {currentCriterion ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Criterion Name</label>
                    <Input value={currentCriterion.name} onChange={(e) => updateCriterion({ name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Weight: {currentCriterion.weight}%</label>
                    <Slider value={[currentCriterion.weight]} onValueChange={([v]) => updateCriterion({ weight: v })} max={100} step={5} className="mt-2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Success Indicators</label>
                    <div className="space-y-2">
                      {currentCriterion.indicators.map((ind, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={ind}
                            onChange={(e) => {
                              const next = [...currentCriterion.indicators];
                              next[i] = e.target.value;
                              updateCriterion({ indicators: next });
                            }}
                            placeholder="e.g. Correct loop termination"
                          />
                          <Button variant="ghost" size="icon" onClick={() => updateCriterion({ indicators: currentCriterion.indicators.filter((_, j) => j !== i) })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => updateCriterion({ indicators: [...currentCriterion.indicators, ""] })}>
                        <Plus className="w-4 h-4 mr-1" />Add Indicator
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    onClick={() => toast({ title: "Rubric saved", description: "Your changes have been saved." })}
                  >
                    <Save className="w-4 h-4 mr-2" />Save Criterion
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-12">Select or add a criterion to begin editing.</p>
              )}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No rubrics for {activeCategory} yet. Click "Add Rubric" to create one.</p>
        </div>
      )}
    </div>
  );
}
