import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StorefrontPreview } from "@/components/storefront-preview";
import { TEMPLATES, defaultStoreConfig, type TemplateId } from "@/lib/store-config";
import luxuryImg from "@/assets/template-luxury.jpg";
import minimalImg from "@/assets/template-minimal.jpg";
import modernImg from "@/assets/template-modern.jpg";
import marketplaceImg from "@/assets/template-marketplace.jpg";

const COVERS: Record<TemplateId, string> = {
  luxury: luxuryImg,
  minimal: minimalImg,
  modern: modernImg,
  marketplace: marketplaceImg,
};

export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({ meta: [{ title: "Templates · Atelier" }, { name: "robots", content: "noindex" }] }),
  component: Templates,
});

function Templates() {
  const [selected, setSelected] = useState<TemplateId>("luxury");
  const previewConfig = useMemo(
    () => ({ ...defaultStoreConfig(), name: TEMPLATES.find((t) => t.id === selected)!.name, template: selected }),
    [selected],
  );

  return (
    <div>
      <header className="flex items-center justify-between border-b border-ink/5 bg-white/40 px-8 py-5 backdrop-blur">
        <div>
          <p className="eyebrow">Templates</p>
          <h1 className="mt-1 font-serif text-2xl italic">Four points of view</h1>
        </div>
        <Link
          to="/generator"
          className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-canvas hover:bg-ink/90"
        >
          Start from a template
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          {TEMPLATES.map((t) => {
            const active = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`w-full overflow-hidden rounded-xl bg-white text-left ring-1 transition ${
                  active ? "ring-2 ring-ink" : "ring-black/5 hover:ring-black/10"
                }`}
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={COVERS[t.id]} alt={t.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl italic">{t.name}</h3>
                    {active && <span className="eyebrow text-accent">Selected</span>}
                  </div>
                  <p className="mt-1 text-xs text-ink/60">{t.tagline}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-ink/40">Best for {t.best}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-stone-warm/40 p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Preview</p>
            <Link
              to="/generator"
              className="text-xs font-semibold uppercase tracking-widest text-ink/70 hover:text-ink"
            >
              Use this template →
            </Link>
          </div>
          <StorefrontPreview config={previewConfig} />
        </div>
      </div>
    </div>
  );
}
